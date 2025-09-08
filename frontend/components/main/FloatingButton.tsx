import React, { memo } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

interface FloatingButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
}

const FloatingButton = memo(
  ({
    onPress,
    style,
    iconName = "chevron-up",
    iconSize = 20,
    iconColor = "white",
  }: FloatingButtonProps) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.buttonContainer, style]}
      >
        <LinearGradient
          colors={["#FF9EA4", Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientButton}
        >
          <Ionicons name={iconName} size={iconSize} color={iconColor} />
        </LinearGradient>
      </TouchableOpacity>
    );
  },
);

FloatingButton.displayName = "FloatingButton";

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    zIndex: 10,
  },
  gradientButton: {
    padding: 14,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});

export default FloatingButton;
