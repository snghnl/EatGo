// components/place/PlaceMenu.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "../../ThemedText";
import { Colors } from "../../../constants/Colors";
import { MenuItem } from "@/types/place";

interface PlaceMenuProps {
  menuItems: MenuItem[];
}

const { width } = Dimensions.get("window");

export const PlaceMenu: React.FC<PlaceMenuProps> = ({ menuItems }) => {
  const MenuItems =
    Array.isArray(menuItems) && menuItems.length > 0 ? menuItems : [];
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText size="lg" weight="bold" style={styles.title}>
          대표메뉴
        </ThemedText>
      </View>

      <View style={styles.menuList}>
        {MenuItems.map((item, index) => (
          <View key={item.id || index} style={styles.menuRow}>
            <ThemedText type="body" style={styles.menuName}>
              {item.name}
            </ThemedText>
            <ThemedText type="body" weight="bold" style={styles.menuPrice}>
              {formatPrice(item.price)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: Colors.listbackground,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  menuName: {
    flexShrink: 1,
  },
  menuPrice: {
    color: Colors.textPrimary,
  },
});
