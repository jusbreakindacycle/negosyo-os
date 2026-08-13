/**
 * Pure resolution of "which business is the person looking at".
 *
 * Kept free of any Expo, React Native, or Supabase import so it can be
 * reasoned about and tested on its own — this is the function that decides
 * whether a locally stored business id is believed. Ported unchanged from the
 * web client; only the storage mechanism behind the caller changed, from a
 * browser cookie to on-device storage.
 */

export type BusinessSummary = {
  id: string;
  name: string;
};

/**
 * Picks the active business from an attacker-controlled stored preference.
 *
 * The stored value is only ever a hint. It is honoured when, and only when,
 * it names a business the caller actually holds a membership for; otherwise
 * the first authorised business wins. Row Level Security would already
 * return nothing for an unauthorised id, so this is the second of two locks,
 * not the only one — but it is what stops the interface from claiming to
 * display a business that the person cannot see.
 */
export function resolveActiveBusinessId(
  storedValue: string | null | undefined,
  businesses: readonly BusinessSummary[],
): string | null {
  if (businesses.length === 0) {
    return null;
  }

  if (storedValue && businesses.some((b) => b.id === storedValue)) {
    return storedValue;
  }

  return businesses[0].id;
}

/** The resolved business itself, or null when the person has none yet. */
export function resolveActiveBusiness(
  storedValue: string | null | undefined,
  businesses: readonly BusinessSummary[],
): BusinessSummary | null {
  const id = resolveActiveBusinessId(storedValue, businesses);
  if (id === null) {
    return null;
  }

  return businesses.find((b) => b.id === id) ?? null;
}
