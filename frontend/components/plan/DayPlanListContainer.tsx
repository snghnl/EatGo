// src/components/plan/DayPlanListContainer.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { DayPlanList } from './DayPlanList';
import { fetchDayPlans, DayPlanItem } from '../../src/api/dayPlans'; //출처 맞는지 확인필요!!!
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';

interface Props {
    courseId: string;
    isNewCourse?: boolean;
    onPlacePress?: (dayPlanId: string, placeId: string) => void;
    onCardPress?: (dayPlanId: string) => void;
    onLongPress?: (dayPlanId: string) => void;
    onSave?: (dayPlanId: string) => void;
    onRecommendationPress?: (day: number) => void;
    selectedPlaceId?: string | null;
    activeDayPlanId?: string | null;
}

export const DayPlanListContainer: React.FC<Props> = ({
    courseId,
    isNewCourse,
    onPlacePress,
    onCardPress,
    onLongPress,
    onSave,
    onRecommendationPress,
    selectedPlaceId,
    activeDayPlanId,
}) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [dayPlans, setDayPlans] = React.useState<DayPlanItem[]>([]);

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        fetchDayPlans(courseId)
            .then((data) => {
                if (!mounted) return;
                setDayPlans(data ?? []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e instanceof Error ? e.message : 'Unknown error');
            })
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [courseId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <ThemedText color="textSecondary" style={{ marginTop: 8 }}>
                    여행 일차 정보를 불러오는 중…
                </ThemedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <ThemedText color="danger">불러오기 실패: {error}</ThemedText>
            </View>
        );
    }

    return (
        <DayPlanList
            dayPlans={dayPlans}
            isNewCourse={isNewCourse}
            onPlacePress={onPlacePress}
            onCardPress={onCardPress}
            onLongPress={onLongPress}
            onSave={onSave}
            onRecommendationPress={onRecommendationPress}
            selectedPlaceId={selectedPlaceId}
            activeDayPlanId={activeDayPlanId}
        />
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
});
