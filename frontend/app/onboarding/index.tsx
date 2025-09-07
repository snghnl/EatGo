import React from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function OnboardingStartScreen() {
    const router = useRouter();


    const handleEmailSignup = () => {
        console.log("이메일 가입");
        router.push("/onboarding/signup");
    };

    const handleLogin = () => {
        console.log("로그인");
        router.push("/onboarding/login");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 메인 콘텐츠 */}
            <View style={styles.mainContent}>
                {/* 제목 */}
                <Text style={styles.title}>
                    <Text style={styles.highlight}>잇고</Text>와 함께{"\n"}
                    미식여행 시작하기
                </Text>
            </View>

            {/* 버튼 영역 */}
            <View style={styles.buttonContainer}>
                {/* 이메일 가입 버튼 */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleEmailSignup}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>이메일로 가입</Text>
                </TouchableOpacity>

                {/* 로그인 링크 */}
                <View style={styles.bottomLinks}>
                    <Text style={styles.linkDescription}>이미 계정이 있으신가요?</Text>
                    <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.linkText}>로그인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    mainContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.textPrimary,
        textAlign: "center",
        lineHeight: 36,
        marginBottom: 16,
    },
    highlight: {
        fontSize: 32,
        color: "#FF4757", // 포인트 레드
        fontWeight: "bold",
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    primaryButton: {
        backgroundColor: "#FF4757",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
    },
    bottomLinks: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    linkDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginRight: 8,
    },
    linkText: {
        fontSize: 14,
        color: "#FF4757",
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
