import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth/auth-provider";

/**
 * Root layout. Providers only — route protection lives in each group's own
 * `_layout.tsx`, because Expo Router evaluates a `<Redirect />` most
 * predictably from the layout that owns the routes being protected.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
