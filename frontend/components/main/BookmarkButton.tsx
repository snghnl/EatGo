import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  onPress,
  size = 20,
  style,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons
        name={isBookmarked ? "bookmark" : "bookmark-outline"}
        size={size}
        color={isBookmarked ? Colors.primary : Colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});
