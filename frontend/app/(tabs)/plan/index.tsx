// app/plan/index.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CourseList } from "@/components/plan"; // ✅ CourseListExample → CourseList
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { CreateCourseModal } from "@/components/common";
import { Colors } from "@/constants/Colors";
import { TravelCourses } from "@/src/client/sdk.gen";
import { TravelCourse } from "@/src/client/types.gen";

// 새 코스 정보 인터페이스
export default function PlanListScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [newCourse, setNewCourse] = useState<TravelCourse | null>(null);
    const [courses, setCourses] = useState<TravelCourse[]>([]);

    // plan 페이지에 포커스가 돌아올 때 모달 상태 초기화
    useFocusEffect(
        React.useCallback(() => {
            setModalVisible(false);
            setNewCourse(null);
        }, [])
    );

    // 여행 코스 목록 조회
    useEffect(() => {
        TravelCourses.travelCoursesMyList()
            .then((res) => {
                setCourses(res.data || []);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleAddCourse = () => {
        setModalVisible(true);
    };

    const handleDelete = () => {
        console.log("경로 삭제 버튼 클릭");
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    // 제목과 subtitle 생성 함수
    const generateTitleAndSubtitle = (
        destinations: string[],
        startDate: string,
        endDate: string
    ) => {
        let title = "새로운 여행 코스";
        let subtitle = "새로운 여행 계획";

        if (destinations.length > 0) {
            const mainDestination = destinations[0];
            title = `${mainDestination} 여행 코스`;
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

    const handleCompleteModal = async (data: {
        startDate: string;
        endDate: string;
        selectedDestinations: string[];
        selectedFoods: string[];
    }) => {
        console.log("여행 계획 완료", data);

        // Convert date format from "YY.MM.DD" to "YYYY-MM-DD"
        const convertToISODate = (dateStr: string) => {
            const [year, month, day] = dateStr.split(".");
            const fullYear = year.length === 2 ? `20${year}` : year;
            return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
            )}`;
        };

        const { title, subtitle } = generateTitleAndSubtitle(
            data.selectedDestinations,
            data.startDate,
            data.endDate
        );

        const courseInfo = {
            title,
            description: subtitle,
            routes: [],
            start_date: convertToISODate(data.startDate),
            end_date: convertToISODate(data.endDate),
            destination: data.selectedDestinations.join(","),
        };

        try {
            const response = await TravelCourses.travelCoursesCreate({
                body: courseInfo,
            });

            const createdCourse = response.data;

            if (!createdCourse) {
                throw new Error("Failed to create course");
            }

            setNewCourse(createdCourse);
            setCourses((prev) => [createdCourse, ...prev]);

            setModalVisible(false);

            router.push({
                pathname: `/plan/${createdCourse.id}` as any,
                params: {
                    startDate: data.startDate,
                    endDate: data.endDate,
                    destinations: data.selectedDestinations.join(","),
                    foods: data.selectedFoods.join(","),
                    isNew: "true",
                },
            });
        } catch (error) {
            console.error("Failed to create course:", error);
            // Fallback: use timestamp ID for local state
            const fallbackCourse = { ...courseInfo, id: Date.now().toString() };
            setNewCourse(fallbackCourse);
            setCourses((prev) => [fallbackCourse, ...prev]);

            setModalVisible(false);

            router.push({
                pathname: `/plan/${fallbackCourse.id}` as any,
                params: {
                    startDate: data.startDate,
                    endDate: data.endDate,
                    destinations: data.selectedDestinations.join(","),
                    foods: data.selectedFoods.join(","),
                    isNew: "true",
                },
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="내 여행코스"
                subtitle="나만의 여행 계획을 만들어보세요"
            />
            <View style={styles.actionSection}>
                <ActionButtons
                    actions={[
                        { label: "편집", onPress: handleAddCourse },
                        { label: "경로 삭제", onPress: handleDelete },
                    ]}
                />
            </View>

            {/* ✅ 실제 CourseList 사용 */}
            <CourseList
                courses={courses}
                newCourse={newCourse}
                onAddCourse={handleAddCourse}
            />

            <CreateCourseModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onComplete={handleCompleteModal}
            />
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
});
