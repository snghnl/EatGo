// frontend/app/(tabs)/plan/[id]/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
    StyleSheet,
    View,
    SafeAreaView,
    Alert,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { AddCourseCard } from "@/components/plan";
import { DayPlanListContainer } from "@/components/plan/DayPlanListContainer";
import PlaceCardSwiper from "@/components/main/PlaceCardSwiper";
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

// ✅ 상대경로로 mock 데이터 로드 (현재 파일 위치 기준: app/(tabs)/plan/[id]/index.tsx)
import routesMock from "../../../../mock-data/routes.json"; // ← 경로 주의!

interface CourseData {
    id: string;
    startDate: string;
    endDate: string;
    selectedDestinations: string[];
    selectedFoods: string[];
    title: string;
    subtitle: string;
}

export default function PlanDetailScreen() {
    const { id, startDate, endDate, destinations, foods, isNew } =
        useLocalSearchParams<{
            id: string;
            startDate?: string;
            endDate?: string;
            destinations?: string;
            foods?: string;
            isNew?: string;
        }>();

    const [courseData, setCourseData] = useState<CourseData | null>(null);
    const [selectedDayPlanId, setSelectedDayPlanId] = useState<string | null>(
        null
    );
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);

    const isNewCourse = isNew === "true";

    // ✅ id로 mock에서 해당 코스 찾기
    const matchedRoute = useMemo(() => {
        if (!id) return null;
        try {
            const list = Array.isArray(routesMock) ? routesMock : [];
            // id는 문자열 비교 (예: "route-001")
            return list.find((r: any) => String(r.id) === String(id)) || null;
        } catch {
            return null;
        }
    }, [id]);

    // 제목/부제 (신규 코스일 때만 사용)
    const generateTitleAndSubtitle = () => {
        let title = "새로운 여행 코스";
        let subtitle = "새로운 여행 계획";

        if (destinations) {
            const destinationList = destinations.split(",");
            if (destinationList.length > 0) {
                const mainDestination = destinationList[0];
                title = `${mainDestination} 여행 코스`;
            }
        }

        if (startDate && endDate) {
            const startMonth = parseInt(startDate.split(".")[1]);
            const endMonth = parseInt(endDate.split(".")[1]);

            if (
                (startMonth >= 6 && startMonth <= 8) ||
                (endMonth >= 6 && endMonth <= 8)
            ) {
                subtitle = "이열치열 여름 나기";
            } else if (
                (startMonth >= 3 && startMonth <= 5) ||
                (endMonth >= 3 && endMonth <= 5)
            ) {
                subtitle = "봄바람 휘날리는 계절";
            } else if (
                (startMonth >= 9 && startMonth <= 11) ||
                (endMonth >= 9 && endMonth <= 11)
            ) {
                subtitle = "단풍 물든 가을 여행";
            } else {
                subtitle = "눈 내리는 겨울 풍경";
            }
        }

        return { title, subtitle };
    };

    // ✅ 코스 데이터 구성
    useEffect(() => {
        if (!id) return;

        // 1) 신규 코스면 URL 파라미터 기반으로 생성
        if (isNewCourse) {
            const { title, subtitle } = generateTitleAndSubtitle();
            setCourseData({
                id: String(id),
                startDate: startDate || "25.07.05", // SOURCE: URL 파라미터(임시값)
                endDate: endDate || "25.07.07", // SOURCE: URL 파라미터(임시값)
                selectedDestinations: destinations
                    ? destinations.split(",")
                    : ["전주", "순천"], // SOURCE: URL 파라미터(임시값)
                selectedFoods: foods ? foods.split(",") : ["한식", "카페"], // SOURCE: URL 파라미터(임시값)
                title,
                subtitle,
            });
            return;
        }

        // 2) 기존 코스면 mock에서 찾아서 제목/설명 반영
        if (matchedRoute) {
            const titleFromMock = String(matchedRoute.title ?? "여행 코스");
            const subtitleFromMock = matchedRoute.description
                ? String(matchedRoute.description)
                : `${matchedRoute.places?.length ?? 0}곳 · ${
                      matchedRoute.total_time ?? 0
                  }분`;

            setCourseData({
                id: String(id),
                // 날짜/선호는 아직 URL 파라미터에서만 받음(실제 API 연결 시 교체)
                startDate: startDate || "25.07.05", // SOURCE: URL 파라미터(임시값)
                endDate: endDate || "25.07.07", // SOURCE: URL 파라미터(임시값)
                selectedDestinations: destinations
                    ? destinations.split(",")
                    : [], // SOURCE: URL 파라미터(임시값)
                selectedFoods: foods ? foods.split(",") : [], // SOURCE: URL 파라미터(임시값)
                title: titleFromMock,
                subtitle: subtitleFromMock,
            });
            return;
        }

        // 3) 매칭되는 코스가 없으면 안전한 기본값 (이전 로직 유지)
        const { title, subtitle } = generateTitleAndSubtitle();
        setCourseData({
            id: String(id),
            startDate: startDate || "25.07.05",
            endDate: endDate || "25.07.07",
            selectedDestinations: destinations ? destinations.split(",") : [],
            selectedFoods: foods ? foods.split(",") : [],
            title,
            subtitle,
        });
    }, [
        id,
        isNewCourse,
        matchedRoute,
        startDate,
        endDate,
        destinations,
        foods,
    ]);

    const handleEdit = () => {
        console.log("코스 편집 버튼 클릭");
    };

    const handleCardPress = (dayPlanId: string) => {
        console.log("카드 클릭:", dayPlanId);
    };

    const handleSave = (dayPlanId: string) => {
        console.log("저장:", dayPlanId);
        // SOURCE: ??? (예: POST /courses/:courseId/day-plans/:dayPlanId/save)
    };

    const handleRecommendationPress = (day: number) => {
        router.push({
            pathname: `/plan/${id}/recommendation` as any,
            params: {
                id: id,
                courseId: id,
                day: day.toString(),
                startDate,
                endDate,
                destinations,
                foods,
            },
        });
    };

    const handleNewCourseRecommendationPress = () => {
        router.push({
            pathname: `/plan/${id}/recommendation` as any,
            params: {
                id: id,
                courseId: id,
                startDate,
                endDate,
                destinations,
                foods,
            },
        });
    };

    const handleAddRecommendation = () => {
        router.push({
            pathname: `/plan/${id}/recommendation` as any,
            params: {
                courseId: id,
                startDate,
                endDate,
                destinations,
                foods,
            },
        });
    };

    const handleLongPress = (dayPlanId: string) => {
        setSelectedDayPlanId(dayPlanId);
    };

    const handlePlacePress = (dayPlanId: string, placeId: string) => {
        if (selectedDayPlanId === dayPlanId) {
            setSelectedPlaceId(placeId);
            setShowPlaceCardSwiper(true);
        } else {
            console.log("장소 클릭:", dayPlanId, placeId);
            // SOURCE: ??? (예: router.push(`/place/${placeId}`))
        }
    };

    const handleClosePlaceCardSwiper = () => {
        setShowPlaceCardSwiper(false);
        setSelectedPlaceId(null);
        setSelectedDayPlanId(null);
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
                        // SOURCE: ??? (예: PUT /courses/:courseId/day-plans/:dayPlanId/places)
                        console.log(
                            `교체 시도: ${selectedPlace.place_name} (ID: ${selectedPlace.id})`
                        );
                        alert(`${selectedPlace.place_name}로 교체되었습니다!`);
                    },
                },
            ]
        );
    };

    if (!courseData) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View
                style={{ position: "absolute", top: 70, left: 15, zIndex: 10 }}
            >
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.push("/(tabs)/plan")}
                />
            </View>

            <Header title={courseData.title} subtitle={courseData.subtitle} />

            <View style={styles.actionSection}>
                <ActionButtons
                    actions={[{ label: "편집", onPress: handleEdit }]}
                />
            </View>

            {isNewCourse ? (
                <View style={styles.addRecommendationContainer}>
                    <AddCourseCard
                        onPress={handleNewCourseRecommendationPress}
                        text="추천 여행 경로 확인하기"
                    />
                </View>
            ) : (
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.addRecommendationContainer}>
                        <AddCourseCard
                            onPress={handleAddRecommendation}
                            text="추천 경로 저장하기"
                        />
                    </View>

                    <DayPlanListContainer
                        courseId={String(id)}
                        isNewCourse={false}
                        onPlacePress={handlePlacePress}
                        onCardPress={handleCardPress}
                        onSave={handleSave}
                        onRecommendationPress={handleRecommendationPress}
                        onLongPress={handleLongPress}
                        selectedPlaceId={selectedPlaceId}
                        activeDayPlanId={selectedDayPlanId}
                    />
                </ScrollView>
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
    container: {
        flex: 1,
        backgroundColor: Colors.listbackground,
    },
    actionSection: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
    addRecommendationContainer: {
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    scrollContainer: { flex: 1 },
});
