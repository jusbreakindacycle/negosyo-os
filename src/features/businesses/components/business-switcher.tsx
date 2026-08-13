import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useBusinesses } from "../business-provider";

/**
 * Native port of the web client's business switcher.
 *
 * Renders nothing when there is nothing to switch between — a single
 * business needs no picker, and zero businesses is handled by the dashboard
 * redirecting to onboarding.
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
        return (
          <Pressable
            key={business.id}
            onPress={() => switchBusiness(business.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {business.name}
            </Text>
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
  chipTextActive: { color: "#fff" },
});
