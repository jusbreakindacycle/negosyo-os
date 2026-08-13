import { StyleSheet, Text, View } from "react-native";

import {
  BUSINESS_STATUS_LABEL,
  REGISTRATION_STATUS_LABEL,
} from "@/features/businesses/business-mode";
import { GraduationControl } from "@/features/businesses/components/graduation-control";
import type { BusinessSummary } from "@/features/businesses/resolve-active-business";

/**
 * Setup mode — "what do I need to do to become ready?" (DL-031, DL-060).
 *
 * Shown for `draft` and `registering`. What it deliberately does **not** do is
 * list the permits, fees, or deadlines this business needs. Nothing in the
 * product knows them: no requirement source, jurisdiction, effective date, or
 * Citizen's Charter has been recorded anywhere, and inventing a checklist that
 * looked authoritative would be exactly the fabricated obligation the standing
 * AI and evidence rules forbid. That work is Permits & Compliance, in a later
 * milestone, with sources attached.
 *
 * So this screen shows only what is true: the facts recorded during setup, the
 * facts that are missing, and one bounded next action.
 */
export function SetupModeView({ business }: { business: BusinessSummary }) {
  const missing: string[] = [];

  if (business.legal_name === null) {
    missing.push("Registered name — not recorded yet.");
  }

  if (business.registration_status === "unknown") {
    missing.push("How far registration has got — not recorded yet.");
  }

  return (
    <>
      <Text style={styles.title}>{business.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {BUSINESS_STATUS_LABEL[business.status]}
        </Text>
      </View>

      <Text style={styles.subtitle}>
        You told us this business is not open yet. NegosyoOS is keeping what you
        record now, so nothing has to be entered twice once you open.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What is recorded</Text>
        <Text style={styles.cardBody}>Business name: {business.name}</Text>
        <Text style={styles.cardBody}>
          Registered name: {business.legal_name ?? "none recorded"}
        </Text>
        <Text style={styles.cardBody}>
          {REGISTRATION_STATUS_LABEL[business.registration_status]}
        </Text>
      </View>

      {missing.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is still missing</Text>
          {missing.map((item) => (
            <Text key={item} style={styles.cardBody}>
              {item}
            </Text>
          ))}
          <Text style={styles.cardNote}>
            Missing is a normal state. Nothing here is guessed on your behalf.
          </Text>
        </View>
      ) : null}

      <GraduationControl businessId={business.id} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming later</Text>
        <Text style={styles.cardBody}>
          Stocks & Operations, Permits & Compliance, and Taxes & Records open up
          as they are built. NegosyoOS cannot yet tell you which permits your
          city requires, and it will not guess — that arrives with Permits &
          Compliance, with the source and date for every requirement.
        </Text>
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
    borderColor: "#0f172a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: "#0f172a", fontWeight: "600" },
  card: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardBody: { fontSize: 13, color: "#666" },
  cardNote: { fontSize: 12, color: "#999", marginTop: 4 },
});
