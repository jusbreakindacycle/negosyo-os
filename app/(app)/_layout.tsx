import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth-provider";
import { BusinessProvider } from "@/features/businesses/business-provider";

/**
 * Application shell for signed-in people.
 *
 * The redirect here is navigation convenience, matching the standing project
 * rule that Row Level Security — not this check — is the real authorisation
 * boundary. See `src/features/auth/auth-provider.tsx`.
 */
export default function AppLayout() {
  const { session, loading } = useAuth();

  if (!loading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <BusinessProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </BusinessProvider>
  );
}
