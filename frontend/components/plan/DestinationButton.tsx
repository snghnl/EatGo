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
            >
                {destination}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: "30%",
        height: 40,
        backgroundColor: Colors.backgroundGray,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedButton: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.textPrimary,
    },
    selectedText: {
        color: Colors.white,
    },
});
