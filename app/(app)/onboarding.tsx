import { Redirect } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useBusinesses } from "@/features/businesses/business-provider";
import type { RegistrationStatus } from "@/features/businesses/business-mode";
import {
  ENTRY_CHOICES,
  findEntryChoice,
  resolveRegistrationStatus,
  type EntryChoiceId,
} from "@/features/businesses/onboarding-choices";
import { createBusiness } from "@/features/businesses/queries";
import { hasUsableBusiness } from "@/features/businesses/resolve-active-business";
import { createBusinessSchema, legalNameSchema } from "@/lib/validation/business";

/**
 * Lifecycle-aware business onboarding (DL-060, DL-063).
 *
 * Three short steps, and the third only when it could have an answer. The
 * business row is created **once, at the end**, in a single atomic RPC call.
 * That is what makes an abandoned onboarding leave nothing behind: no partial
 * row, no orphan, nothing to resume or clean up. It is also why there is no
 * progress table and no `onboarding_complete` flag — with a flow this short,
 * persisting progress would add a second source of truth about something that
 * takes under a minute.
 *
 * If onboarding ever becomes multi-session, or starts collecting significant
 * information before the row exists, that trade-off has to be revisited
 * (DL-063, decision 4). It is recorded here rather than in a document because
 * this is the file where someone would break it.
 *
 * The lifecycle status is not computed anywhere in this screen. It is derived
 * inside `create_business_with_owner` from the two answers below.
 */
export default function OnboardingScreen() {
  const { businesses, refresh, switchBusiness } = useBusinesses();

  const [step, setStep] = useState<"name" | "state" | "legal">("name");
  const [name, setName] = useState("");
  const [choiceId, setChoiceId] = useState<EntryChoiceId | null>(null);
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [legalName, setLegalName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const choice = choiceId === null ? null : findEntryChoice(choiceId);

  function handleName() {
    const parsed = createBusinessSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a business name.");
      return;
    }

    setError(null);
    setStep("state");
  }

  function handleState() {
    if (choice === null) {
      setError("Choose where this business is right now.");
      return;
    }

    setError(null);

    if (choice.asksLegalName) {
      setStep("legal");
      return;
    }

    void submit(null);
  }

  function handleLegal() {
    const trimmed = legalName.trim();

    if (trimmed.length === 0) {
      // Skipping is a real answer. Many businesses have no registered name and
      // never will, and the product records that rather than pressing.
      void submit(null);
      return;
    }

    const parsed = legalNameSchema.safeParse(trimmed);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the registered name.");
      return;
    }

    setError(null);
    void submit(parsed.data);
  }

  async function submit(resolvedLegalName: string | null) {
    if (choice === null) return;

    setSubmitting(true);
    setError(null);

    const result = await createBusiness({
      name: name.trim(),
      isOperating: choice.isOperating,
      registrationStatus: resolveRegistrationStatus(choice, registration),
      legalName: resolvedLegalName,
    });

    setSubmitting(false);

    if (result.error || !result.business) {
      setError(result.error ?? "We could not create that business. Please try again.");
      return;
    }

    await switchBusiness(result.business.id);
    refresh();
    // No manual navigation: the redirect below fires as soon as `businesses`
    // (from context) reflects the refresh, once it resolves.
  }

  // A closed business is not somewhere to work, so it does not count as having
  // one. Without this, an owner whose only businesses are closed would be
  // redirected here and straight back again (DL-063, D-1).
  if (hasUsableBusiness(businesses)) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === "name" ? (
        <>
          <Text style={styles.title}>What do you call your business?</Text>
          <Text style={styles.subtitle}>
            The everyday name is fine. This is not the registered name.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Business name"
            value={name}
            onChangeText={setName}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.button} onPress={handleName} accessibilityRole="button">
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </>
      ) : null}

      {step === "state" ? (
        <>
          <Text style={styles.title}>Where is {name.trim()} right now?</Text>
          <Text style={styles.subtitle}>
            This decides what NegosyoOS shows you first. You can change it later
            when your business opens.
          </Text>

          {ENTRY_CHOICES.map((option) => {
            const selected = option.id === choiceId;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  setChoiceId(option.id);
                  setRegistration(null);
                  setError(null);
                }}
                style={[styles.option, selected && styles.optionSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDetail}>{option.detail}</Text>
              </Pressable>
            );
          })}

          {choice && choice.registrationOptions.length > 0 ? (
            <View style={styles.followUp}>
              <Text style={styles.followUpTitle}>How far has registration got?</Text>
              {choice.registrationOptions.map((option) => {
                const selected = option.value === registration;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setRegistration(option.value)}
                    style={[styles.option, selected && styles.optionSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.optionTitle}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={styles.button}
            onPress={handleState}
            disabled={submitting}
            accessibilityRole="button"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </Pressable>
        </>
      ) : null}

      {step === "legal" ? (
        <>
          <Text style={styles.title}>Registered name</Text>
          <Text style={styles.subtitle}>
            The name on your DTI or SEC papers, if you have it. Skip this if you
            do not — nothing here needs it.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Registered name (optional)"
            value={legalName}
            onChangeText={setLegalName}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={styles.button}
            onPress={handleLegal}
            disabled={submitting}
            accessibilityRole="button"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Finish setup</Text>
            )}
          </Pressable>
        </>
      ) : null}

      <Text style={styles.footer}>
        Prototype only. Not a government service, and not legal, accounting, or
        tax advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12, flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  optionSelected: { borderColor: "#0f172a", backgroundColor: "#f1f5f9" },
  optionTitle: { fontSize: 15, fontWeight: "600" },
  optionDetail: { fontSize: 13, color: "#666" },
  followUp: { gap: 8, marginTop: 4 },
  followUpTitle: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  error: { color: "#b91c1c", fontSize: 13 },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  footer: { fontSize: 11, color: "#999", marginTop: 16 },
});
