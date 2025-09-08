import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { Colors } from "../../constants/Colors";

interface PlaceProps {
  category: string;
  name: string;
  onPress?: () => void;
  isSelected?: boolean;
}

export const Place: React.FC<PlaceProps> = ({
  category,
  name,
  onPress,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.container}>
        <ThemedText
          size="xs"
          color="textSecondary"
          weight="normal"
          style={styles.category}
        >
          {category}
        </ThemedText>
        <ThemedText
          size="lg"
          color={isSelected ? "error" : "textPrimary"}
          weight="bold"
          style={styles.name}
        >
          {name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 0, // flex 아이템이 축소될 수 있도록
  },
  category: {
    marginBottom: 2,
    textAlign: "center",
  },
  name: {
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1, // 텍스트가 넘칠 때 축소
  },
});
