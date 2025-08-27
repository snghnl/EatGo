// frontend/app/tabs/plan/index.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CourseList } from "@/components/plan";
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { CreateCourseModal } from "@/components/common";
import { Colors } from "@/constants/Colors";

// ✅ 상대경로로 목데이터 불러오기
// 현재 파일: frontend/app/tabs/plan/index.tsx
// 목데이터:   frontend/mock-data/routes.json
import routesMock from "../../../mock-data/routes.json";

interface NewCourse {
    id: string;
    title: string;
    subtitle: string;
    hasImages?: boolean;
}

export default function PlanListScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [newCourse, setNewCourse] = useState<NewCourse | null>(null);
    const [courses, setCourses] = useState<NewCourse[]>([]);

    // 목데이터 → CourseList 형태로 매핑
    const initialCourses = useMemo<NewCourse[]>(() => {
        if (!Array.isArray(routesMock)) return [];
        return routesMock.map((r: any) => ({
            id: String(r.id),
            title: String(r.title ?? "새로운 여행 코스"),
            subtitle: r.description
                ? String(r.description)
                : `${r.places?.length ?? 0}곳 · ${r.total_time ?? 0}분`,
            hasImages: false,
        }));
    }, []);

    // 화면 포커스 시 초기화 + 최초 진입 시 mock 반영
    useFocusEffect(
        React.useCallback(() => {
            setModalVisible(false);
            setNewCourse(null);
            if (courses.length === 0 && initialCourses.length > 0) {
                setCourses(initialCourses);
            }
        }, [initialCourses, courses.length])
    );

    const handleAddCourse = () => setModalVisible(true);
    const handleDelete = () => console.log("경로 삭제 버튼 클릭");
    const handleCloseModal = () => setModalVisible(false);

    // 제목/서브제목 생성
    const generateTitleAndSubtitle = (
        destinations: string[],
        startDate: string,
        endDate: string
    ) => {
        let title = destinations.length
            ? `${destinations[0]} 여행 코스`
            : "새로운 여행 코스";
        let subtitle = "새로운 여행 계획";

        if (startDate && endDate) {
            const sm = parseInt(startDate.split(".")[1]);
            const em = parseInt(endDate.split(".")[1]);
            subtitle =
                (sm >= 6 && sm <= 8) || (em >= 6 && em <= 8)
                    ? "이열치열 여름 나기"
                    : (sm >= 3 && sm <= 5) || (em >= 3 && em <= 5)
                    ? "봄바람 휘날리는 계절"
                    : (sm >= 9 && sm <= 11) || (em >= 9 && em <= 11)
                    ? "단풍 물든 가을 여행"
                    : "눈 내리는 겨울 풍경";
        }

        return { title, subtitle };
    };

    const handleCompleteModal = (data: {
        startDate: string;
        endDate: string;
        selectedDestinations: string[];
        selectedFoods: string[];
    }) => {
        const newCourseId = Date.now().toString();
        const { title, subtitle } = generateTitleAndSubtitle(
            data.selectedDestinations,
            data.startDate,
            data.endDate
        );

        const courseInfo: NewCourse = {
            id: newCourseId,
            title,
            subtitle,
            hasImages: false,
        };
        setNewCourse(courseInfo);
        setCourses((prev) => [courseInfo, ...prev]);
        setModalVisible(false);

        router.push({
            pathname: "/plan/[id]" as any,
            params: {
                id: newCourseId,
                startDate: data.startDate,
                endDate: data.endDate,
                destinations: data.selectedDestinations.join(","),
                foods: data.selectedFoods.join(","),
                isNew: "true",
            },
        });
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
        backgroundColor: Colors.listbackground,
    },
    actionSection: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
});
