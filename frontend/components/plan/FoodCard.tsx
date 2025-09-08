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
    marginBottom: 10,
    maxWidth: "23%",
  },
  card: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 6,
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
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 9,
  },
  imageText: {
    fontSize: 14,
  },
  foodName: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 13,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
