import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { PlanCard } from './PlanCard';
import { Colors } from '../../constants/Colors';

interface PlaceItem {
    id: string;
    category: string;
    name: string;
}

interface RecommendationItem {
    id: string;
    title: string;
    places: PlaceItem[];
}

interface RecommendationListProps {
    recommendations: RecommendationItem[];
    onRecommendationPress?: (recommendationId: string) => void;
    onPlacePress?: (recommendationId: string, placeId: string) => void;
    onCardPress?: (recommendationId: string) => void;
    onSave?: (recommendationId: string) => void;
    onLongPress?: (recommendationId: string) => void;
    selectedPlaceId?: string | null;
    activeRecommendationId?: string | null;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
    recommendations,
    onRecommendationPress,
    onPlacePress,
    onCardPress,
    onSave,
    onLongPress,
    selectedPlaceId = null,
    activeRecommendationId = null,
}) => {
    // 제목별로 그룹화
    const groupedRecommendations = recommendations.reduce((groups, recommendation) => {
        const title = recommendation.title;
        if (!groups[title]) {
            groups[title] = [];
        }
        groups[title].push(recommendation);
        return groups;
    }, {} as Record<string, RecommendationItem[]>);

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {Object.entries(groupedRecommendations).map(([title, groupRecommendations]) => (
                    <View key={title} style={styles.groupContainer}>
                        <ThemedText size="xl" color="textPrimary" weight="bold" style={styles.groupTitle}>
                            {title}
                        </ThemedText>
                        {groupRecommendations.map((recommendation) => (
                            <View key={recommendation.id} style={styles.cardContainer}>
                                <PlanCard
                                    places={recommendation.places}
                                    onPlacePress={(placeId) => onPlacePress?.(recommendation.id, placeId)}
                                    onCardPress={() => onCardPress?.(recommendation.id)}
                                    onSave={() => onSave?.(recommendation.id)}
                                    onLongPress={() => onLongPress?.(recommendation.id)}
                                    selectedPlaceId={selectedPlaceId}
                                    isActive={activeRecommendationId === recommendation.id}
                                />
                            </View>
                        ))}
                    </View>
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
        paddingHorizontal: 16,
    },
    cardContainer: {
        marginBottom: 16,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupTitle: {
        marginBottom: 12,
        paddingLeft: 14,
    },
});
