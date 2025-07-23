import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
import { CourseListExample } from "@/components/plan";
import Header from "@/components/common/Header";
import ActionButtons from "@/components/common/ActionButtons";
import { CreateCourseModal } from "@/components/common";
import { Colors } from "@/constants/Colors";

// 새 코스 정보 인터페이스
interface NewCourse {
    id: string;
    title: string;
    subtitle: string;
    hasImages?: boolean;
}

export default function CoursesScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [newCourse, setNewCourse] = useState<NewCourse | null>(null);

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

        // 목적지 기반 제목 생성
        if (destinations.length > 0) {
            const mainDestination = destinations[0];
            title = `${mainDestination} 여행 코스`;
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

    const handleCompleteModal = (data: {
        startDate: string;
        endDate: string;
        selectedDestinations: string[];
        selectedFoods: string[];
    }) => {
        console.log("여행 계획 완료", data);

        // 새로 생성된 코스의 ID 생성 (현재 시간 기반)
        const newCourseId = Date.now().toString();

        // 제목과 subtitle 생성
        const { title, subtitle } = generateTitleAndSubtitle(
            data.selectedDestinations,
            data.startDate,
            data.endDate
        );

        // 새 코스 정보 생성
        const courseInfo: NewCourse = {
            id: newCourseId,
            title: title,
            subtitle: subtitle,
            hasImages: false, // 새로 생성된 코스는 이미지 없음
        };

        // 새 코스 정보를 상태에 저장 (CourseListExample에서 사용)
        setNewCourse(courseInfo);

        // TODO: 여기서 실제로 코스 데이터를 저장하는 로직 추가
        // 예: API 호출, 로컬 스토리지 저장 등

        // 모달 닫기
        setModalVisible(false);

        // 새로 생성된 코스 페이지로 이동 (데이터와 함께)
        router.push({
            pathname: "/course/[id]" as any,
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
            <Header title="내 여행코스" />
            <View style={styles.actionSection}>
                <ActionButtons
                    actions={[
                        { label: "편집", onPress: handleAddCourse },
                        { label: "경로 삭제", onPress: handleDelete },
                    ]}
                />
            </View>
            <CourseListExample
                onAddCourse={handleAddCourse}
                newCourse={newCourse}
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
