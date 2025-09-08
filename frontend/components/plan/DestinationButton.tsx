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
      <Text style={[styles.buttonText, isSelected && styles.selectedText]}>
        {destination}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    maxWidth: "23%",
    height: 36,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: "0.5%",
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },
  selectedText: {
    color: Colors.white,
  },
});
