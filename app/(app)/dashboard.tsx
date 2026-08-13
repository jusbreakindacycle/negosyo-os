import { Redirect } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useBusinesses } from "@/features/businesses/business-provider";
import { DashboardHeader } from "@/features/dashboard/dashboard-header";

/**
 * Shell landing page.
 *
 * Shows the active business by name. Stocks & Operations, Permits &
 * Compliance, and Taxes & Records are still placeholders — they arrive from
 * Milestone 2C onward. Uses the actual user-facing product-area names
 * (`CLAUDE.md`: "Internal codenames must not appear in public-facing UI"),
 * not the "Start & Comply" / "Operate & Decide" codenames the web prototype
 * still showed — closing that part of Phase gate A as a consequence of
 * writing this screen fresh, not as separately scoped work.
 */
export default function DashboardScreen() {
  const { businesses, activeBusiness, loading } = useBusinesses();

  if (!loading && businesses.length === 0) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DashboardHeader />

      <Text style={styles.title}>{activeBusiness?.name ?? "Your business"}</Text>
      <Text style={styles.subtitle}>
        One workspace handles what the government needs from your business.
        The other handles what happens inside it every day.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stocks & Operations</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will compare what you expected
          against what you actually counted, so a shortage shows up while you
          can still do something about it.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permits & Compliance</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will keep each requirement, the
          document that proves it, and the date it expires, without guessing
          at anything that has not been confirmed.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Taxes & Records</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will show what is recorded, what is
          missing, and what estimate can safely be made.
        </Text>
      </View>

      <Text style={styles.footer}>
        Prototype only. Not a government service, and not legal, accounting,
        or tax advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666" },
  card: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardBody: { fontSize: 13, color: "#666" },
  footer: { fontSize: 11, color: "#999", marginTop: 12 },
});
