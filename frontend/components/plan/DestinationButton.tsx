import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

interface DestinationButtonProps {
  destination: string;
  isSelected: boolean;
  onPress: (destination: string) => void;
}

export const DestinationButton: React.FC<DestinationButtonProps> = ({
  destination,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selectedButton]}
      onPress={() => onPress(destination)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.buttonText, isSelected && styles.selectedText]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {destination}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    maxWidth: "23%",
    minHeight: 44,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: "0.5%",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 13,
  },
  selectedText: {
    color: Colors.white,
  },
});
