import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { ThemedView } from "../ThemedView";
import { DayPlan } from "./DayPlan";
import { Colors } from "../../constants/Colors";

interface PlaceItem {
    id: string;
    category: string;
    name: string;
}

interface DayPlanItem {
    id: string;
    day: number;
    title: string;
    places: PlaceItem[];
}

interface DayPlanListProps {
    dayPlans: DayPlanItem[];
    onPlacePress?: (dayPlanId: string, placeId: string) => void;
    onCardPress?: (dayPlanId: string) => void;
    onSave?: (dayPlanId: string) => void;
    isNewCourse?: boolean;
    onRecommendationPress?: (day: number) => void;
}

export const DayPlanList: React.FC<DayPlanListProps> = ({
    dayPlans,
    onPlacePress,
    onCardPress,
    onSave,
    isNewCourse = false,
    onRecommendationPress,
}) => {
    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {dayPlans.map((dayPlan) => (
                    <DayPlan
                        key={dayPlan.id}
                        day={dayPlan.day}
                        title={dayPlan.title}
                        places={dayPlan.places}
                        onPlacePress={(placeId) =>
                            onPlacePress?.(dayPlan.id, placeId)
                        }
                        onCardPress={() => onCardPress?.(dayPlan.id)}
                        onSave={() => onSave?.(dayPlan.id)}
                        isNewCourse={isNewCourse}
                        onRecommendationPress={onRecommendationPress}
                    />
                ))}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 16,
        paddingTop: 24,
    },
});
