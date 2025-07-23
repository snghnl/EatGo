import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { DayPlanList } from "@/components/plan";
import { AddCourseCard } from "@/components/plan";
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { Colors } from "@/constants/Colors";

// 코스 데이터 인터페이스
interface CourseData {
    id: string;
    startDate: string;
    endDate: string;
    selectedDestinations: string[];
    selectedFoods: string[];
    title: string;
    subtitle: string;
}

// 빈 일차 데이터 (새 코스용)
const emptyDayPlans = [
    {
        id: "1",
        day: 1,
        title: "",
        places: [],
    },
    {
        id: "2",
        day: 2,
        title: "",
        places: [],
    },
    {
        id: "3",
        day: 3,
        title: "",
        places: [],
    },
];

// 샘플 데이터 (기존 코스용)
const sampleDayPlans = [
    {
        id: "1",
        day: 1,
        title: "전주 한옥마을",
        places: [
            {
                id: "1-1",
                category: "회/해산물",
                name: "우리횟집",
            },
            {
                id: "1-2",
                category: "카페",
                name: "커피집",
            },
            {
                id: "1-3",
                category: "낙곱새",
                name: "개미집",
            },
        ],
    },
    {
        id: "2",
        day: 2,
        title: "순천만",
        places: [
            {
                id: "2-1",
                category: "돈카츠",
                name: "톤쇼우",
            },
            {
                id: "2-2",
                category: "베이커리",
                name: "코스피어",
            },
            {
                id: "2-3",
                category: "백반",
                name: "김가네",
            },
        ],
    },
    {
        id: "3",
        day: 3,
        title: "해운대",
        places: [
            {
                id: "3-1",
                category: "돈카츠",
                name: "톤쇼우",
            },
            {
                id: "3-2",
                category: "베이커리",
                name: "코스피어",
            },
            {
                id: "3-3",
                category: "백반",
                name: "김가네",
            },
        ],
    },
];

export default function CourseDetailScreen() {
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

    // 새 코스인지 판단 (isNew 파라미터가 'true'이면 새 코스)
    const isNewCourse = isNew === "true";

    // 제목과 subtitle 생성 함수
    const generateTitleAndSubtitle = () => {
        let title = "새로운 여행 코스";
        let subtitle = "새로운 여행 계획";

        // 목적지 기반 제목 생성
        if (destinations) {
            const destinationList = destinations.split(",");
            if (destinationList.length > 0) {
                const mainDestination = destinationList[0];
                title = `${mainDestination} 여행 코스`;
            }
        }

        // 날짜 기반 subtitle 생성
        if (startDate && endDate) {
            const startMonth = parseInt(startDate.split(".")[1]);
            const endMonth = parseInt(endDate.split(".")[1]);

            // 여름 (6-8월) 체크
            if (
                (startMonth >= 6 && startMonth <= 8) ||
                (endMonth >= 6 && endMonth <= 8)
            ) {
                subtitle = "이열치열 여름 나기";
            }
            // 봄 (3-5월) 체크
            else if (
                (startMonth >= 3 && startMonth <= 5) ||
                (endMonth >= 3 && endMonth <= 5)
            ) {
                subtitle = "봄바람 휘날리는 계절";
            }
            // 가을 (9-11월) 체크
            else if (
                (startMonth >= 9 && startMonth <= 11) ||
                (endMonth >= 9 && endMonth <= 11)
            ) {
                subtitle = "단풍 물든 가을 여행";
            }
            // 겨울 (12-2월) 체크
            else {
                subtitle = "눈 내리는 겨울 풍경";
            }
        }

        return { title, subtitle };
    };

    useEffect(() => {
        // TODO: 실제로는 API에서 코스 데이터를 가져와야 함
        // 현재는 전달받은 데이터로 설정
        if (id) {
            const { title, subtitle } = generateTitleAndSubtitle();

            const newCourseData: CourseData = {
                id: id,
                startDate: startDate || "25.07.05",
                endDate: endDate || "25.07.07",
                selectedDestinations: destinations
                    ? destinations.split(",")
                    : ["전주", "순천"],
                selectedFoods: foods ? foods.split(",") : ["한식", "카페"],
                title: title,
                subtitle: subtitle,
            };
            setCourseData(newCourseData);
        }
    }, [id, startDate, endDate, destinations, foods]);

    const handleEdit = () => {
        console.log("코스 편집 버튼 클릭");
    };

    const handlePlacePress = (dayPlanId: string, placeId: string) => {
        console.log("장소 클릭:", dayPlanId, placeId);
        // TODO: 장소 수정 모달 또는 페이지로 이동
    };

    const handleCardPress = (dayPlanId: string) => {
        console.log("카드 클릭:", dayPlanId);
        // TODO: 카드 전체 액션 (예: 스와이프 저장)
    };

    const handleSave = (dayPlanId: string) => {
        console.log("저장:", dayPlanId);
        // TODO: 해당 일차 계획 저장
    };

    const handleRecommendationPress = (day: number) => {
        console.log(`${day}일차 추천 여행경로 보러가기 클릭`);
        // recommendation 페이지로 이동 (현재 코스 ID와 함께)
        router.push({
            pathname: "/recommendation" as any,
            params: {
                courseId: id,
                day: day.toString(),
                startDate: startDate,
                endDate: endDate,
                destinations: destinations,
                foods: foods,
            },
        });
    };

    const handleNewCourseRecommendationPress = () => {
        console.log("새 코스 추천 여행경로 보러가기 클릭");
        // recommendation 페이지로 이동 (현재 코스 ID와 함께)
        router.push({
            pathname: "/recommendation" as any,
            params: {
                courseId: id,
                startDate: startDate,
                endDate: endDate,
                destinations: destinations,
                foods: foods,
            },
        });
    };

    const handleAddRecommendation = () => {
        console.log("추천 경로 저장하기 클릭");
        // recommendation 페이지로 이동 (현재 코스 ID와 함께)
        router.push({
            pathname: "/recommendation" as any,
            params: {
                courseId: id,
                startDate: startDate,
                endDate: endDate,
                destinations: destinations,
                foods: foods,
            },
        });
    };

    if (!courseData) {
        return null; // 로딩 중
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title={courseData.title} subtitle={courseData.subtitle} />
            <View style={styles.actionSection}>
                <ActionButtons
                    actions={[{ label: "편집", onPress: handleEdit }]}
                />
            </View>

            {/* 새 코스인 경우 AddCourseCard만 표시, 기존 코스인 경우 DayPlanList 표시 */}
            {isNewCourse ? (
                <View style={styles.addRecommendationContainer}>
                    <AddCourseCard
                        onPress={handleNewCourseRecommendationPress}
                        text="추천 여행 경로 확인하기"
                    />
                </View>
            ) : (
                <>
                    <DayPlanList
                        dayPlans={sampleDayPlans}
                        onPlacePress={handlePlacePress}
                        onCardPress={handleCardPress}
                        onSave={handleSave}
                        isNewCourse={isNewCourse}
                        onRecommendationPress={handleRecommendationPress}
                    />

                    {/* 기존 코스의 경우 추천 경로 저장하기 버튼 */}
                    <View style={styles.addRecommendationContainer}>
                        <AddCourseCard
                            onPress={handleAddRecommendation}
                            text="추천 경로 저장하기"
                        />
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    actionSection: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
    addRecommendationContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
