import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Client Components, which run in the browser.
 *
 * Only ever reads the browser-safe publishable key. Every table this client
 * can reach must be protected by Row Level Security.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient(url, publishableKey);
}
