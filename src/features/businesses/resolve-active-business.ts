/**
 * Pure resolution of "which business is the person looking at".
 *
 * Kept free of any Next.js or Supabase import so it can be reasoned about and
 * tested on its own — this is the function that decides whether a cookie is
 * believed.
 */

export type BusinessSummary = {
  id: string;
  name: string;
};

/**
 * Picks the active business from an attacker-controlled cookie.
 *
 * The cookie value is only ever a hint. It is honoured when, and only when, it
 * names a business the caller actually holds a membership for; otherwise the
 * first authorised business wins. Row Level Security would already return
 * nothing for an unauthorised id, so this is the second of two locks, not the
 * only one — but it is what stops the interface from claiming to display a
 * business that the person cannot see.
 */
export function resolveActiveBusinessId(
  cookieValue: string | null | undefined,
  businesses: readonly BusinessSummary[],
): string | null {
  if (businesses.length === 0) {
    return null;
  }

  if (cookieValue && businesses.some((b) => b.id === cookieValue)) {
    return cookieValue;
  }

  return businesses[0].id;
}

/** The resolved business itself, or null when the person has none yet. */
export function resolveActiveBusiness(
  cookieValue: string | null | undefined,
  businesses: readonly BusinessSummary[],
): BusinessSummary | null {
  const id = resolveActiveBusinessId(cookieValue, businesses);
  if (id === null) {
    return null;
  }

  return businesses.find((b) => b.id === id) ?? null;
}
