import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
const tabs = [
  { label: "내 장소", value: "places" },
  { label: "내 여행코스", value: "courses" },
  { label: "저장한\n여행경로", value: "saved" },
] as const;

type TabType = (typeof tabs)[number]["value"];
type TabLabel = (typeof tabs)[number]["label"];

interface MyPageTabsProps {
  onTabChange?: (tab: TabType) => void;
  style?: any;
}

export const MyPageTabs: React.FC<MyPageTabsProps> = ({
  onTabChange,
  style,
}) => {
  const [selectedLabel, setSelectedLabel] = useState<TabLabel>("내 장소");

  const handleTabPress = (label: TabLabel, value: TabType) => {
    setSelectedLabel(label);
    onTabChange?.(value);
  };

  return (
    <View style={[styles.tabBg, style]}>
      <View style={styles.tabContainer}>
        {tabs.map(({ label, value }) => (
          <TouchableOpacity
            key={label}
            style={[styles.tabButton, selectedLabel === label]}
            onPress={() => handleTabPress(label, value)}
          >
            <ThemedText
              weight={selectedLabel === label ? "semibold" : "normal"}
              color={selectedLabel === label ? "primary" : "textSecondary"}
              style={{ textAlign: "center", width: 80 }}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBg: {
    backgroundColor: Colors.white,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 0,
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
