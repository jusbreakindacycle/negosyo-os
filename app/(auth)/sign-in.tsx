import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { signInWithPassword } from "@/features/auth/session";
import { signInSchema } from "@/lib/validation/auth";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    // Re-validated here even though the fields could be checked as the person
    // types: this is the same "server re-validates" discipline the web
    // client used for its Server Actions, applied to the one place a mobile
    // client can enforce it — right before the network call.
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Email or password is incorrect.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await signInWithPassword(parsed.data.email, parsed.data.password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // No manual navigation: AuthProvider's onAuthStateChange listener updates
    // the session, and app/(auth)/_layout.tsx redirects reactively.
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Prototype only. Not a government service.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
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
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>

      <Link href="/(auth)/sign-up" style={styles.link}>
        Need an account? Sign up
      </Link>
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
  link: { marginTop: 16, textAlign: "center", color: "#0f172a" },
});
