import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

/**
 * The signed-in user, or null.
 *
 * Uses `getClaims()`, which verifies the JWT signature. `getSession()` is
 * never used in server code: it reads the cookie without validating it, so its
 * result can be forged by whoever controls the browser.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || sub.length === 0) {
    return null;
  }

  const email = data?.claims?.email;

  return {
    id: sub,
    email: typeof email === "string" ? email : null,
  };
}

/**
 * The signed-in user, or a redirect to sign-in.
 *
 * Every protected layout, page, and Server Action calls this. The Proxy also
 * redirects unauthenticated traffic, but Next.js routes a Server Function as a
 * POST to whichever page hosts it, so a change to the Proxy matcher can drop
 * that cover silently. This check does not depend on the matcher.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
