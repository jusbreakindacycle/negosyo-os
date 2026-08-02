import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Creating a client is cheap. Create a new one per request rather than sharing
 * a module-level instance, so one request's session never leaks into another.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. Safe to ignore: src/proxy.ts
          // refreshes the session on every matched request, and Server Actions
          // write cookies directly.
        }
      },
    },
  });
}
