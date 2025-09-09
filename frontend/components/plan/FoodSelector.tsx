import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { FoodCard } from "./FoodCard";

interface FoodSelectorProps {
    onFoodChange?: (selectedFoods: string[]) => void;
}

const foodCategories = [
    { name: "한식", image: require("@/assets/images/food-icons/korean.png") },
    { name: "양식", image: require("@/assets/images/food-icons/western.png") },
    { name: "일식", image: require("@/assets/images/food-icons/japanese.png") },
    { name: "중식", image: require("@/assets/images/food-icons/chinese.png") },
    { name: "아시안", image: require("@/assets/images/food-icons/asian.png") },
    { name: "분식", image: require("@/assets/images/food-icons/snack.png") },
    { name: "햄버거", image: require("@/assets/images/food-icons/burger.png") },
    { name: "피자", image: require("@/assets/images/food-icons/pizza.png") },
    {
        name: "생선/해산물",
        image: require("@/assets/images/food-icons/seafood.png"),
    },
    { name: "고기", image: require("@/assets/images/food-icons/meat.png") },
    {
        name: "베이커리",
        image: require("@/assets/images/food-icons/bakery.png"),
    },
    { name: "술집", image: require("@/assets/images/food-icons/drinks.png") },
];

export const FoodSelector: React.FC<FoodSelectorProps> = ({ onFoodChange }) => {
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

    const handleFoodPress = (foodName: string) => {
        let newSelected: string[];

        if (selectedFoods.includes(foodName)) {
            // 이미 선택된 경우 제거
            newSelected = selectedFoods.filter((f) => f !== foodName);
        } else {
            // 선택되지 않은 경우 추가
            newSelected = [...selectedFoods, foodName];
        }

        setSelectedFoods(newSelected);
        onFoodChange?.(newSelected);
    };

    // 12개 아이템을 4개씩 3개 그룹으로 나누기 (4×3 그리드)
    const createRows = () => {
        const rows = [];
        for (let i = 0; i < foodCategories.length; i += 4) {
            const rowItems = foodCategories.slice(i, i + 4);
            rows.push(rowItems);
        }
        return rows;
    };

    const rows = createRows();

    return (
        <View style={styles.container}>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((food, index) => (
                        <FoodCard
                            key={`${rowIndex}-${index}`}
                            foodName={food.name}
                            foodImage={food.image}
                            isSelected={selectedFoods.includes(food.name)}
                            onPress={handleFoodPress}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
});
