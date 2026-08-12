import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-provider";

/**
 * Pages a signed-in person has no reason to see. Mirrors `AUTH_ONLY_PATHS`
 * from the retired web Proxy (`src/lib/supabase/proxy-client.ts`).
 */
export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
