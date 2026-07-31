import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

/**
 * Route prefixes that require a session.
 *
 * This is a convenience redirect so a signed-out visitor lands somewhere
 * sensible. It is not the security boundary — `requireUser()` in each page and
 * Server Action is, and Row Level Security is underneath that.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

/** Pages a signed-in person has no reason to see. */
const AUTH_ONLY_PATHS = ["/sign-in", "/sign-up"];

function isUnder(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Refreshes the Supabase session and applies coarse route protection.
 *
 * Server Components cannot write cookies, so without this the access token
 * would never be refreshed and people would be signed out roughly hourly.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Nothing may run between createServerClient and this call. An await in
  // between makes the session refresh race with the rest of the request, and
  // the symptom is people being logged out at random.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = typeof data?.claims?.sub === "string";

  const { pathname } = request.nextUrl;

  if (!isSignedIn && PROTECTED_PREFIXES.some((p) => isUnder(pathname, p))) {
    return redirectPreservingCookies(request, response, "/sign-in");
  }

  if (isSignedIn && AUTH_ONLY_PATHS.some((p) => isUnder(pathname, p))) {
    return redirectPreservingCookies(request, response, "/dashboard");
  }

  return response;
}

/**
 * Redirects without throwing away a session that was just refreshed.
 *
 * `getClaims()` may have rotated the auth cookies onto `sessionResponse`.
 * Returning a bare redirect would drop them and the next request would arrive
 * with a stale token.
 */
function redirectPreservingCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  // The original query string belongs to the page being left, and it may name
  // a business the visitor is not a member of.
  target.search = "";

  const redirectResponse = NextResponse.redirect(target);
  for (const cookie of sessionResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}
