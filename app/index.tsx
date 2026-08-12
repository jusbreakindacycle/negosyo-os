import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/features/auth/auth-provider";

/**
 * Entry route. Sends the visitor to the group that actually owns their state.
 *
 * This is navigation convenience only, not the authorisation boundary — see
 * `src/features/auth/auth-provider.tsx`.
 */
export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Redirect href={session ? "/(app)/dashboard" : "/(auth)/sign-in"} />
  );
}
