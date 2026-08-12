import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Reads and writes the active-business preference.
 *
 * Ported from the web client's cookie-backed `active-business.ts`. The
 * storage mechanism changed from a browser cookie to on-device AsyncStorage;
 * the security posture did not. The stored value is a preference, not an
 * authorisation — nothing here checks membership. `resolveActiveBusinessId`
 * (`src/features/businesses/resolve-active-business.ts`) does that against
 * the list Row Level Security returned, and every caller must go through it.
 */

export const ACTIVE_BUSINESS_STORAGE_KEY = "nos_active_business";

export async function readActiveBusinessId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
}

export async function setActiveBusinessId(businessId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, businessId);
}

/**
 * Clears the stored preference. Called on sign-out: the active business is a
 * per-person preference and should not survive into whoever signs in next on
 * this device.
 */
export async function clearActiveBusinessId(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
}
