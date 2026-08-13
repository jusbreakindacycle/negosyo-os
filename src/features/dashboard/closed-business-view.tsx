import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import type { BusinessSummary } from "@/features/businesses/resolve-active-business";

/**
 * A closed business (DL-063, D-1).
 *
 * Reached only when every business the owner holds is closed — active-business
 * resolution prefers a business that is not closed whenever one exists. Nothing
 * in this branch can set `closed`: the declaration RPC refuses every transition
 * into it, and no closing workflow is built. So this view exists for data that
 * arrives another way, and for the day closing does ship.
 *
 * It is here rather than letting a closed business fall through to Setup mode,
 * which would greet someone with "let's get you ready to open" about a business
 * they have already shut down. The route back to onboarding is what stops the
 * account being a dead end: the three-business ceiling frees a slot when a
 * business closes, so the database already assumes an owner survives closing
 * one.
 */
export function ClosedBusinessView({ business }: { business: BusinessSummary }) {
  return (
    <>
      <Text style={styles.title}>{business.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Closed</Text>
      </View>

      <Text style={styles.subtitle}>
        This business is recorded as closed. Its records are kept and nothing has
        been deleted, but there is nothing to act on day to day.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Starting something new?</Text>
        <Text style={styles.cardBody}>
          You can set up another business whenever you are ready.
        </Text>
        <Link href="/(app)/onboarding" style={styles.link}>
          Set up a business
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666" },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: "#666", fontWeight: "600" },
  card: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardBody: { fontSize: 13, color: "#666" },
  link: { fontSize: 14, color: "#0f172a", fontWeight: "600", marginTop: 4 },
});
