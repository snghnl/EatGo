import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

interface FoodCardProps {
    foodName: string;
    foodImage?: string; // TODO: 실제 이미지 구현 시 사용
    isSelected: boolean;
    onPress: (foodName: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
    foodName,
    foodImage,
    isSelected,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(foodName)}
            activeOpacity={0.7}
        >
            <View style={[styles.card, isSelected && styles.selectedCard]}>
                <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imageText}>🍽️</Text>
                    </View>
                </View>
            </View>
            <Text style={[styles.foodName, isSelected && styles.selectedText]}>
                {foodName}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    card: {
        width: "100%",
        aspectRatio: 1, // 정사각형
        backgroundColor: Colors.backgroundGray,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    selectedCard: {
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholder: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: 14,
    },
    imageText: {
        fontSize: 20,
    },
    foodName: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.textPrimary,
        textAlign: "center",
    },
    selectedText: {
        color: Colors.primary,
        fontWeight: "600",
    },
});
