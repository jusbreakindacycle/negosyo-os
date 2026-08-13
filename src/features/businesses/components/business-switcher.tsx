import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useBusinesses } from "../business-provider";
import { deriveBusinessMode } from "../business-mode";

/**
 * Native port of the web client's business switcher.
 *
 * Renders nothing when there is nothing to switch between — a single
 * business needs no picker, and zero businesses is handled by the dashboard
 * redirecting to onboarding.
 *
 * Each chip carries its mode when that is not the ordinary one, because an
 * owner with two businesses in different lifecycle states would otherwise have
 * to switch to find out which is which. Running mode shows no hint: it is the
 * common case, and labelling every chip would be noise.
 */
export function BusinessSwitcher() {
  const { businesses, activeBusiness, switchBusiness } = useBusinesses();

  if (businesses.length <= 1) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {businesses.map((business) => {
        const active = business.id === activeBusiness?.id;
        const mode = deriveBusinessMode(business.status);
        return (
          <Pressable
            key={business.id}
            onPress={() => switchBusiness(business.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
          >
            <View>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {business.name}
              </Text>
              {mode === "running" ? null : (
                <Text style={[styles.chipHint, active && styles.chipTextActive]}>
                  {mode === "setup" ? "Getting ready" : "Closed"}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  chip: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  chipText: { fontSize: 13, color: "#333" },
  chipHint: { fontSize: 10, color: "#666" },
  chipTextActive: { color: "#fff" },
});
