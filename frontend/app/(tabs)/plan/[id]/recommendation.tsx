// (tabs)/plan/[id]/recommendation/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { RecommendationList } from "@/components/plan";
import PlaceCardSwiper from "@/components/main/PlaceCardSwiper";
import Header from "@/components/common/Header";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Routes } from "@/src/client/sdk.gen";
import { RouteRecommendationOutput } from "@/src/client/types.gen";

async function fetchRecommendations(params: {
    courseId: string;
    mode: "region" | "theme";
    startDate?: string;
    endDate?: string;
    destinations?: string;
    foods?: string;
}): Promise<RecommendationItem[]> {
    const { mode, startDate, endDate, destinations, foods } = params;

    const response = await Routes.routesRecommendList({
        query: {
            mode: mode,
            start_date: startDate,
            end_date: endDate,
            destinations,
            foods,
        },
    });

    return mapResponseToItems(response.data);
}

export default function RecommendationScreen() {
    const { courseId, startDate, endDate, destinations, foods } =
        useLocalSearchParams<{
            courseId: string;
            startDate?: string;
            endDate?: string;
            destinations?: string;
            foods?: string;
        }>();

    const [activeTab, setActiveTab] = useState<"region" | "theme">("region");
    const [recommendations, setRecommendations] = useState<
        RecommendationItem[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedRecommendations, setSelectedRecommendations] = useState<
        string[]
    >([]);
    const [selectedRecommendationId, setSelectedRecommendationId] = useState<
        string | null
    >(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);

    const regionName = useMemo(() => {
        if (destinations) {
            const list = String(destinations).split(",");
            return list[0] || "전주";
        }
        return "전주";
    }, [destinations]);

    const load = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        setError(null);
        try {
            const items = await fetchRecommendations({
                courseId: String(courseId),
                mode: activeTab,
                startDate: startDate ? String(startDate) : undefined,
                endDate: endDate ? String(endDate) : undefined,
                destinations: destinations ? String(destinations) : undefined,
                foods: foods ? String(foods) : undefined,
            });
            setRecommendations(items);
        } catch (e: any) {
            setError(e?.message || "Failed to fetch");
        } finally {
            setLoading(false);
        }
    }, [courseId, activeTab, startDate, endDate, destinations, foods]);

    useEffect(() => {
        load();
    }, [load]);

    const handleTabPress = (tab: "region" | "theme") => setActiveTab(tab);
    const handleLongPress = (recommendationId: string) =>
        setSelectedRecommendationId(recommendationId);

    const handlePlacePress = (recommendationId: string, placeId: string) => {
        if (selectedRecommendationId === recommendationId) {
            setSelectedPlaceId(placeId);
            setShowPlaceCardSwiper(true);
        }
    };

    const handleClosePlaceCardSwiper = () => {
        setShowPlaceCardSwiper(false);
        setSelectedPlaceId(null);
        setSelectedRecommendationId(null);
    };

    const handlePlaceSelect = (selectedPlace: any) => {
        Alert.alert(
            `${selectedPlace.place_name}로 교체하시겠습니까?`,
            "교체하면 기존 장소가 삭제됩니다.",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "교체",
                    onPress: () => {
                        // PUT /api/travel-courses/:courseId/recommendations/:recId/places // SOURCE: ???
                    },
                },
            ]
        );
    };

    const handleCardPress = (_recommendationId: string) => {};
    const handleSave = (recommendationId: string) => {
        setSelectedRecommendations((prev) =>
            prev.includes(recommendationId)
                ? prev.filter((id) => id !== recommendationId)
                : [...prev, recommendationId]
        );
        // POST /api/.../save // SOURCE: ???
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={`잇고 추천 ${regionName} 맛집 경로`}
                subtitle="당신의 선호 기반"
            />

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => handleTabPress("region")}
                    style={styles.tabButton}
                >
                    <ThemedText
                        size="base"
                        color={
                            activeTab === "region" ? "primary" : "textSecondary"
                        }
                        weight="medium"
                    >
                        세부지역별
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleTabPress("theme")}
                    style={styles.tabButton}
                >
                    <ThemedText
                        size="base"
                        color={
                            activeTab === "theme" ? "primary" : "textSecondary"
                        }
                        weight="medium"
                    >
                        테마별
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.spacer} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator />
                    <ThemedText color="textSecondary" style={{ marginTop: 8 }}>
                        추천 경로 불러오는 중…
                    </ThemedText>
                    <ThemedText color="textSecondary" style={{ marginTop: 4 }}>
                        Using SDK client
                    </ThemedText>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <ThemedText color="danger">
                        불러오기 실패: {error}
                    </ThemedText>
                    <TouchableOpacity onPress={load} style={{ marginTop: 8 }}>
                        <ThemedText weight="semibold">다시 시도</ThemedText>
                    </TouchableOpacity>
                    <ThemedText color="textSecondary" style={{ marginTop: 6 }}>
                        Using SDK client
                    </ThemedText>
                </View>
            ) : (
                <RecommendationList
                    recommendations={recommendations}
                    onPlacePress={handlePlacePress}
                    onCardPress={handleCardPress}
                    onSave={handleSave}
                    onLongPress={handleLongPress}
                    selectedPlaceId={selectedPlaceId}
                    activeRecommendationId={selectedRecommendationId}
                />
            )}

            {showPlaceCardSwiper && (
                <PlaceCardSwiper
                    onClose={handleClosePlaceCardSwiper}
                    onPlaceSelect={handlePlaceSelect}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
    },
    tabButton: { paddingVertical: 4 },
    spacer: { height: 20 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
