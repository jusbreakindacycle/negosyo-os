import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { resendSignUpCode, verifySignUpCode } from "@/features/auth/session";

/**
 * Confirms the six-digit code emailed on sign-up (DL-058).
 *
 * Requires the hosted confirmation-email template to send `{{ .Token }}`
 * rather than a link — a founder action outside this code, tracked in the
 * mobile-foundation reconciliation report.
 */
export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    if (!email) {
      setError("Missing email address. Go back and sign up again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    const result = await verifySignUpCode(email, token.trim());

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // No manual navigation: verifyOtp establishes a session, the
    // AuthProvider listener picks it up, and app/(auth)/_layout.tsx
    // redirects reactively to /(app)/dashboard.
  }

  async function handleResend() {
    if (!email) return;

    setResending(true);
    setError(null);
    setNotice(null);

    const result = await resendSignUpCode(email);

    setResending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setNotice("A new code was sent.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email ?? "your email address"}.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        value={token}
        onChangeText={setToken}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Pressable
        style={styles.button}
        onPress={handleVerify}
        disabled={submitting}
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </Pressable>

      <Pressable onPress={handleResend} disabled={resending}>
        <Text style={styles.link}>
          {resending ? "Resending…" : "Resend code"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
  },
  error: { color: "#b91c1c", fontSize: 13 },
  notice: { color: "#166534", fontSize: 13 },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { marginTop: 16, textAlign: "center", color: "#0f172a" },
});
