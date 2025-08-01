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
    onLongPress?: (dayPlanId: string) => void;
    onSave?: (dayPlanId: string) => void;
    isNewCourse?: boolean;
    onRecommendationPress?: (day: number) => void;
    selectedPlaceId?: string | null;
    activeDayPlanId?: string | null;
}

export const DayPlanList: React.FC<DayPlanListProps> = ({
    dayPlans,
    onPlacePress,
    onCardPress,
    onLongPress,
    onSave,
    isNewCourse = false,
    onRecommendationPress,
    selectedPlaceId = null,
    activeDayPlanId = null,
}) => {
    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
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
                        onLongPress={() => onLongPress?.(dayPlan.id)}
                        onSave={() => onSave?.(dayPlan.id)}
                        isNewCourse={isNewCourse}
                        onRecommendationPress={onRecommendationPress}
                        selectedPlaceId={selectedPlaceId}
                        isActive={activeDayPlanId === dayPlan.id}
                    />
                ))}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flexGrow: 1,
        paddingBottom: 16,
        paddingTop: 8, // 24에서 8로 줄임
    },
});
