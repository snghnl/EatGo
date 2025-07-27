import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { PlanCard } from "./PlanCard";
import { AddCourseCard } from "./AddCourseCard";
import { Colors } from "../../constants/Colors";

interface PlaceItem {
    id: string;
    category: string;
    name: string;
}

interface DayPlanProps {
    day: number;
    title: string;
    places: PlaceItem[];
    onPlacePress?: (placeId: string) => void;
    onCardPress?: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    isNewCourse?: boolean;
    onRecommendationPress?: (day: number) => void;
}

export const DayPlan: React.FC<DayPlanProps> = ({
    day,
    title,
    places,
    onPlacePress,
    onCardPress,
    onSave,
    isSaved = false,
    isNewCourse = false,
    onRecommendationPress,
}) => {
    const handleRecommendationPress = () => {
        onRecommendationPress?.(day);
    };

    return (
        <ThemedView style={styles.container}>
            {/* 일차 제목 */}
            <ThemedText
                size="xl"
                color="textPrimary"
                weight="bold"
                style={styles.dayTitle}
            >
                {day}일차
            </ThemedText>

            {/* 새 코스인 경우 AddCourseCard, 기존 코스인 경우 PlanCard */}
            {isNewCourse ? (
                <AddCourseCard onPress={handleRecommendationPress} />
            ) : (
                <PlanCard
                    places={places}
                    onPlacePress={onPlacePress}
                    onCardPress={onCardPress}
                    onSave={onSave}
                    isSaved={isSaved}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    dayTitle: {
        marginBottom: 12,
        paddingHorizontal: 8,
    },
});
