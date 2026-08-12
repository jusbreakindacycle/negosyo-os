import { Pressable, StyleSheet, Text, View } from "react-native";

import { signOut } from "@/features/auth/session";
import { BusinessSwitcher } from "@/features/businesses/components/business-switcher";

export function DashboardHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.brand}>NegosyoOS PH</Text>
        <View style={styles.rowRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Prototype</Text>
          </View>
          <Pressable onPress={() => signOut()} accessibilityRole="button">
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      <BusinessSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontSize: 15, fontWeight: "600" },
  badge: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: "#666" },
  signOut: { fontSize: 13, color: "#0f172a" },
});
