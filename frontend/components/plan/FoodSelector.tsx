import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { FoodCard } from "./FoodCard";

interface FoodSelectorProps {
    onFoodChange?: (selectedFoods: string[]) => void;
}

const foodCategories = [
    "한식",
    "양식",
    "일식",
    "중식",
    "아시안",
    "분식",
    "햄버거",
    "피자",
    "생선/해산물",
    "고기",
    "베이커리",
    "술집",
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
                            foodName={food}
                            isSelected={selectedFoods.includes(food)}
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
