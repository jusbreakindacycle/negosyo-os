import { StyleSheet, Text, View } from "react-native";

import {
  REGISTRATION_STATUS_LABEL,
  shouldShowRegistrationNote,
} from "@/features/businesses/business-mode";
import type { BusinessSummary } from "@/features/businesses/resolve-active-business";

/**
 * Running mode — "what needs my attention now?" (DL-031, DL-060).
 *
 * Shown for `operating`, whatever the registration position. A business that is
 * already trading gets the operational experience immediately: it is not put
 * through a startup journey it has already finished, and it is not held back
 * because registration is incomplete.
 *
 * The three product-area cards are the ones the shell has always shown, with
 * the user-facing names required by DL-028. They become real from Milestone 2C
 * onward.
 */
export function RunningModeView({ business }: { business: BusinessSummary }) {
  return (
    <>
      <Text style={styles.title}>{business.name}</Text>
      <Text style={styles.subtitle}>
        One workspace handles what the government needs from your business. The
        other handles what happens inside it every day.
      </Text>

      {shouldShowRegistrationNote(business.registration_status) ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>
            {REGISTRATION_STATUS_LABEL[business.registration_status]}
          </Text>
          <Text style={styles.noteText}>
            Nothing here is blocked by that. Permits & Compliance will help with
            registration when it arrives.
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stocks & Operations</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will compare what you expected against
          what you actually counted, so a shortage shows up while you can still
          do something about it.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permits & Compliance</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will keep each requirement, the
          document that proves it, and the date it expires, without guessing at
          anything that has not been confirmed.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Taxes & Records</Text>
        <Text style={styles.cardBody}>
          Not set up yet. This workspace will show what is recorded, what is
          missing, and what estimate can safely be made.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666" },
  note: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  noteText: { fontSize: 12, color: "#666" },
  card: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardBody: { fontSize: 13, color: "#666" },
});
