import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useBusinesses } from "../business-provider";
import { declareBusinessStatus } from "../queries";

/**
 * The owner declaring that a business has started operating.
 *
 * DL-031 made "the mayor's permit marked issued" the trigger for this
 * transition. Permits is two milestones away, so until it ships the owner may
 * say so themselves (DL-060 item 4). When Permits arrives, the permit event
 * joins this control rather than replacing it: an informal operator who will
 * never file for a mayor's permit still needs a way to reach Running mode.
 *
 * Two things this must never do. It must not read as a compliance claim — it
 * records what the owner says about their own business and certifies nothing
 * with anybody. And it must not write without asking: this is a high-impact,
 * one-way change, so the confirmation is the point, not decoration.
 */
export function GraduationControl({ businessId }: { businessId: string }) {
  const { refresh } = useBusinesses();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    Alert.alert(
      "Is your business open?",
      "This records that you have started operating. It is your own statement " +
        "about your business — it does not register anything, and it does not " +
        "mean any office has approved you.",
      [
        { text: "Not yet", style: "cancel" },
        { text: "Yes, we are open", onPress: () => void declare() },
      ],
    );
  }

  async function declare() {
    setSubmitting(true);
    setError(null);

    const result = await declareBusinessStatus(businessId, "operating");

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // The provider re-reads the list, which re-derives the mode, which swaps
    // this screen for the Running one. No navigation call: the same reactive
    // route behaviour the rest of the app already relies on.
    refresh();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Have you opened?</Text>
      <Text style={styles.body}>
        Tell NegosyoOS when you start selling or serving customers. The app then
        switches to showing you what needs attention day to day.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.button}
        onPress={confirm}
        disabled={submitting}
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>We have started operating</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  title: { fontSize: 15, fontWeight: "600" },
  body: { fontSize: 13, color: "#666" },
  error: { color: "#b91c1c", fontSize: 13 },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
