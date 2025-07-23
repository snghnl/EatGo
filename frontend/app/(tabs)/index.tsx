import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { CourseListExample } from "@/components/plan";
import { Colors } from "@/constants/Colors";

export default function MyCoursesScreen() {
    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>내 여행코스</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity>
                        <Text style={styles.headerAction}>편집</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerDivider}>|</Text>
                    <TouchableOpacity>
                        <Text style={styles.headerAction}>경로 삭제</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 메인 콘텐츠 영역 */}
            <View style={styles.mainContent}>
                {/* 코스 리스트 */}
                <View style={styles.listSection}>
                    <CourseListExample />
                </View>

                {/* 오른쪽 회색 배경 영역 */}
                <View style={styles.rightSection}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>편집</Text>
                        </TouchableOpacity>
                        <Text style={styles.buttonDivider}>|</Text>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>경로 삭제</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.primary,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerAction: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    headerDivider: {
        fontSize: 14,
        color: "#ccc",
        marginHorizontal: 8,
    },
    mainContent: {
        flex: 1,
        flexDirection: "row",
    },
    listSection: {
        flex: 1,
    },
    rightSection: {
        width: 647,
        backgroundColor: "#f5f5f5", // 회색 배경
        paddingVertical: 16,
        paddingHorizontal: 16,
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    buttonDivider: {
        fontSize: 14,
        color: "#ccc",
        marginHorizontal: 16,
    },
});
