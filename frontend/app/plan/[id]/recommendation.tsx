import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { RecommendationList } from "@/components/plan";
import Header from "@/components/common/Header";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

// 추천 코스 데이터 인터페이스
interface RecommendationData {
    courseId: string;
    startDate: string;
    endDate: string;
    destinations: string[];
    foods: string[];
}

// 샘플 추천 데이터
const sampleRecommendations = [
    {
        id: "rec-1",
        title: "한옥마을",
        places: [
            {
                id: "rec-1-1",
                category: "한식",
                name: "왕비빔밥",
            },
            {
                id: "rec-1-2",
                category: "카페",
                name: "노을집",
            },
            {
                id: "rec-1-3",
                category: "디저트",
                name: "국밥집",
            },
        ],
    },
    {
        id: "rec-2",
        title: "한옥마을",
        places: [
            {
                id: "rec-2-1",
                category: "해산물",
                name: "주전자",
            },
            {
                id: "rec-2-2",
                category: "베이커리",
                name: "전주 빵집",
            },
            {
                id: "rec-2-3",
                category: "카페",
                name: "커피집",
            },
        ],
    },
    {
        id: "rec-3",
        title: "해운대",
        places: [
            {
                id: "rec-3-1",
                category: "해산물",
                name: "고모네",
            },
            {
                id: "rec-3-2",
                category: "카페",
                name: "이모네",
            },
            {
                id: "rec-3-3",
                category: "디저트",
                name: "한옥빵",
            },
        ],
    },
    {
        id: "rec-4",
        title: "해운대",
        places: [
            {
                id: "rec-4-1",
                category: "한식",
                name: "해운대",
            },
            {
                id: "rec-4-2",
                category: "베이커리",
                name: "보석빵집",
            },
            {
                id: "rec-4-3",
                category: "카페",
                name: "커피좋아",
            },
        ],
    },
    {
        id: "rec-5",
        title: "순천만",
        places: [
            {
                id: "rec-5-1",
                category: "해산물",
                name: "게장집",
            },
            {
                id: "rec-5-2",
                category: "베이커리",
                name: "순두부빵집",
            },
            {
                id: "rec-5-3",
                category: "카페",
                name: "순만커피",
            },
        ],
    },
];

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
    const [selectedRecommendations, setSelectedRecommendations] = useState<
        string[]
    >([]);

    // 지역 이름 추출
    const getRegionName = () => {
        if (destinations) {
            const destinationList = destinations.split(",");
            return destinationList[0] || "전주";
        }
        return "전주";
    };

    const handlePlacePress = (recommendationId: string, placeId: string) => {
        console.log("장소 클릭:", recommendationId, placeId);
        // TODO: 장소 수정 모달 또는 페이지로 이동
    };

    const handleCardPress = (recommendationId: string) => {
        console.log("카드 클릭:", recommendationId);
        // TODO: 카드 전체 액션 (예: 스와이프 저장)
    };

    const handleSave = (recommendationId: string) => {
        console.log("저장:", recommendationId);
        // 선택된 추천 코스에 추가
        setSelectedRecommendations((prev) => {
            if (prev.includes(recommendationId)) {
                return prev.filter((id) => id !== recommendationId);
            } else {
                return [...prev, recommendationId];
            }
        });
    };

    const handleTabPress = (tab: "region" | "theme") => {
        setActiveTab(tab);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={`잇고 추천 ${getRegionName()} 맛집 경로`}
                subtitle="당신의 선호 기반"
            />

            {/* 탭 버튼 */}
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

            {/* 간격 추가 */}
            <View style={styles.spacer} />

            <RecommendationList
                recommendations={sampleRecommendations}
                onPlacePress={handlePlacePress}
                onCardPress={handleCardPress}
                onSave={handleSave}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
    },
    tabButton: {
        paddingVertical: 4,
    },
    actionSection: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
    spacer: {
        height: 20, // 원하는 간격 크기
    },
});
