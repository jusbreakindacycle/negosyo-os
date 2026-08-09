import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

/**
 * The Supabase client for the native application.
 *
 * A single long-lived instance, unlike the retired web client which created
 * one per request. React Native has no per-request boundary to create one
 * against, and the session lives in AsyncStorage rather than a cookie jar.
 *
 * `detectSessionInUrl: false` because there is no browser URL to inspect —
 * the confirmation flow is a typed six-digit code (DL-058), not a link.
 */
const { url, publishableKey } = getSupabaseEnv();

export const supabase = createSupabaseClient<Database>(url, publishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Ties Supabase's token refresh to the app's foreground/background state.
 *
 * Without this, `autoRefreshToken` keeps trying to refresh from a backgrounded
 * app, which wastes battery and can race with the OS suspending network
 * access. Registered once at module load, per the Supabase-documented
 * React Native pattern.
 */
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
