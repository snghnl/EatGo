// PostCourseSelect.tsx

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/common/Header";
import { CourseList } from "@/components/plan/CourseList";
import { Colors } from "@/constants/Colors";
import { TravelCourses } from "@/src/client/sdk.gen";
import type { TravelCourse } from "@/src/client/types.gen";

export default function PostCourseSelect() {
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 88; // iOS 탭바 absolute 높이
    const [courses, setCourses] = useState<TravelCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const response = await TravelCourses.travelCoursesMyList();
            if (response.data) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            Alert.alert("오류", "코스 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (course: TravelCourse) => {
        router.push({
            pathname: "/community/post",
            params: { courseId: course.id },
        });
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            {/* Back 버튼: 레이아웃/터치 방해 방지 위해 영역 제한 */}
            <View style={styles.backBtn} pointerEvents="box-none">
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.push("/(tabs)/community")}
                />
            </View>

            <Header subtitle="여행 기록 작성할" title="코스 선택하기" />

            <View
                style={[
                    styles.container,
                    { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 12 }, // 탭바 가림 방지
                ]}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={Colors.primary}
                        />
                    </View>
                ) : (
                    <CourseList
                        courses={courses.map((course) => ({
                            id: course.id || "",
                            subtitle: course.destination || "",
                            title: course.title,
                            hasImages: false,
                            routes: [],
                        }))}
                        onCoursePress={(id) => {
                            const selectedCourse = courses.find(
                                (course) => course.id === id
                            );
                            if (selectedCourse) handleSelect(selectedCourse);
                        }}
                        onAddCourse={() => router.push("/plan")}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 15,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    addbtn: {
        marginBottom: 12,
        paddingHorizontal: 16,
    },
});
