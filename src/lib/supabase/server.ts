import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

  return createServerClient(url, publishableKey, {
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
          // Server Components cannot set cookies. This is safe to ignore when
          // a Proxy or Server Action is responsible for refreshing the session.
          // Session refresh itself is not part of this milestone.
        }
      },
    },
  });
}
