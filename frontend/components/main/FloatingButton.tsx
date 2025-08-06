import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

// Types
interface Props {
    onPress: () => void;
    style?: ViewStyle;
}

// Constants
const BUTTON_CONFIG = {
    PADDING: 14,
    BORDER_RADIUS: 40,
    ICON_SIZE: 20,
    SHADOW_OPACITY: 0.2,
    SHADOW_OFFSET: { width: 0, height: 2 },
    SHADOW_RADIUS: 4,
    ELEVATION: 5,
} as const;

const GRADIENT_CONFIG = {
    COLORS: ["#FF9EA4", Colors.primary],
    START: { x: 0, y: 0 },
    END: { x: 0, y: 1 },
} as const;

export default function FloatingButton({ onPress, style }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.buttonContainer, style]}
        >
            <LinearGradient
                colors={GRADIENT_CONFIG.COLORS}
                start={GRADIENT_CONFIG.START}
                end={GRADIENT_CONFIG.END}
                style={styles.gradientButton}
            >
                <Ionicons
                    name="chevron-up"
                    size={BUTTON_CONFIG.ICON_SIZE}
                    color="white"
                />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        position: "absolute",
        bottom: 60,
        alignSelf: "center",
        zIndex: 10,
    },
    gradientButton: {
        padding: BUTTON_CONFIG.PADDING,
        borderRadius: BUTTON_CONFIG.BORDER_RADIUS,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: BUTTON_CONFIG.SHADOW_OPACITY,
        shadowOffset: BUTTON_CONFIG.SHADOW_OFFSET,
        shadowRadius: BUTTON_CONFIG.SHADOW_RADIUS,
        elevation: BUTTON_CONFIG.ELEVATION,
    },
});
