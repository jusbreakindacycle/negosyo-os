import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useBusinesses } from "@/features/businesses/business-provider";
import { createBusiness } from "@/features/businesses/queries";
import { createBusinessSchema } from "@/lib/validation/business";

export default function OnboardingScreen() {
  const { refresh, switchBusiness } = useBusinesses();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const parsed = createBusinessSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a business name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createBusiness(parsed.data.name);

    setSubmitting(false);

    if (result.error || !result.business) {
      setError(result.error ?? "We could not create that business. Please try again.");
      return;
    }

    await switchBusiness(result.business.id);
    refresh();
    // No manual navigation: the dashboard's own redirect only fires when the
    // business list is empty, and refresh() has just made it non-empty.
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your business</Text>
      <Text style={styles.subtitle}>
        Just a name to start. You can add more details later.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Business name"
        value={name}
        onChangeText={setName}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create business</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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
