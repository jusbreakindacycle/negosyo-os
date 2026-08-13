import { Redirect } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

import { deriveBusinessMode } from "@/features/businesses/business-mode";
import { useBusinesses } from "@/features/businesses/business-provider";
import { ClosedBusinessView } from "@/features/dashboard/closed-business-view";
import { DashboardHeader } from "@/features/dashboard/dashboard-header";
import { RunningModeView } from "@/features/dashboard/running-mode-view";
import { SetupModeView } from "@/features/dashboard/setup-mode-view";

/**
 * The owner's landing screen, in whichever shape their business is actually in.
 *
 * One application, one route, three contextual experiences (DL-031, DL-060).
 * The mode is derived from `businesses.status` on every render and is never
 * stored: a second field recording which mode a business is in would be a
 * second source of truth for the same fact.
 *
 * Product-area names are the user-facing ones required by DL-028; the internal
 * codenames "Start & Comply" and "Operate & Decide" appear nowhere in the
 * interface.
 */
export default function DashboardScreen() {
  const { businesses, activeBusiness, loading } = useBusinesses();

  // Only a genuine absence of businesses sends someone to onboarding. An owner
  // whose businesses are all closed stays here and sees the closed view, which
  // carries its own route onward — redirecting them instead would hide the
  // record they still own (DL-063, D-1).
  if (!loading && businesses.length === 0) {
    return <Redirect href="/(app)/onboarding" />;
  }

  const mode =
    activeBusiness === null ? null : deriveBusinessMode(activeBusiness.status);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DashboardHeader />

      {activeBusiness === null || mode === null ? (
        <Text style={styles.subtitle}>Loading your business…</Text>
      ) : mode === "setup" ? (
        <SetupModeView business={activeBusiness} />
      ) : mode === "running" ? (
        <RunningModeView business={activeBusiness} />
      ) : (
        <ClosedBusinessView business={activeBusiness} />
      )}

      <Text style={styles.footer}>
        Prototype only. Not a government service, and not legal, accounting, or
        tax advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  subtitle: { fontSize: 13, color: "#666" },
  footer: { fontSize: 11, color: "#999", marginTop: 12 },
});
