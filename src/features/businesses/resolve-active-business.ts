/**
 * Pure resolution of "which business is the person looking at".
 *
 * Kept free of any Expo, React Native, or Supabase import so it can be
 * reasoned about and tested on its own — this is the function that decides
 * whether a locally stored business id is believed. Ported unchanged from the
 * web client; only the storage mechanism behind the caller changed, from a
 * browser cookie to on-device storage.
 */

import type { BusinessStatus, RegistrationStatus } from "./business-mode";

export type BusinessSummary = {
  id: string;
  name: string;
  /** Drives Setup mode versus Running mode. Never a stored flag — see `business-mode.ts`. */
  status: BusinessStatus;
  /** The owner's recorded registration position. Never affects the mode. */
  registration_status: RegistrationStatus;
  /** The registered DTI or SEC name, when one exists. Null is normal and permanent for many businesses. */
  legal_name: string | null;
};

/**
 * Whether the person has a business they can actually work in.
 *
 * A closed business is still theirs and still readable, but it is not somewhere
 * to record today's takings. Onboarding uses this rather than a plain length
 * check so that an owner whose only businesses are closed can start another one
 * instead of being redirected in a circle (DL-063, D-1).
 */
export function hasUsableBusiness(
  businesses: readonly BusinessSummary[],
): boolean {
  return businesses.some((b) => b.status !== "closed");
}

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

  // Prefer a business that is not closed. An owner returning to the app should
  // land somewhere they can work, not on a business they have shut down —
  // and without this, an owner whose first-created business was closed would
  // open the app into the closed notice every time.
  //
  // An explicit stored preference above still wins, closed or not: if they
  // deliberately switched to a closed business to look at it, switching away
  // from underneath them would be the surprising behaviour.
  const firstUsable = businesses.find((b) => b.status !== "closed");

  return (firstUsable ?? businesses[0]).id;
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
