import { cookies } from "next/headers";

/**
 * Reads and writes the active-business cookie.
 *
 * The cookie holds a preference, not an authorisation. Nothing here checks
 * membership — `resolveActiveBusinessId` does that against the list Row Level
 * Security returned, and every caller must go through it.
 */

export const ACTIVE_BUSINESS_COOKIE = "nos_active_business";

/** One year. Losing the preference is harmless; it just resets to the first business. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function readActiveBusinessCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_BUSINESS_COOKIE)?.value ?? null;
}

export async function setActiveBusinessCookie(businessId: string) {
  const store = await cookies();

  store.set(ACTIVE_BUSINESS_COOKIE, businessId, {
    // No client-side script needs to read this, so keep it out of reach of any
    // script that ends up on the page.
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearActiveBusinessCookie() {
  const store = await cookies();
  store.delete(ACTIVE_BUSINESS_COOKIE);
}
