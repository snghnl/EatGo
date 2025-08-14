import React from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingStartScreen() {
    const router = useRouter();

    const handleKakaoLogin = () => {
        console.log("카카오 로그인");
        // TODO: 카카오 로그인 구현
    };

    const handleAppleLogin = () => {
        console.log("애플 로그인");
        // TODO: 애플 로그인 구현
    };

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
                {/* 카카오 로그인 버튼 */}
                <TouchableOpacity
                    style={[styles.socialButton, styles.kakaoButton]}
                    onPress={handleKakaoLogin}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{
                            uri: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png",
                        }}
                        style={styles.socialIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.kakaoButtonText}>카카오로 시작</Text>
                </TouchableOpacity>

                {/* 애플 로그인 버튼 */}
                <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={handleAppleLogin}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-apple" size={20} color="white" />
                    <Text style={styles.appleButtonText}>애플로 시작</Text>
                </TouchableOpacity>

                {/* 하단 링크 */}
                <View style={styles.bottomLinks}>
                    <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.linkText}>로그인</Text>
                    </TouchableOpacity>
                    <Text style={styles.linkDivider}> | </Text>
                    <TouchableOpacity onPress={handleEmailSignup}>
                        <Text style={styles.linkText}>이메일로 가입</Text>
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
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    kakaoButton: {
        backgroundColor: "#FEE500",
    },
    appleButton: {
        backgroundColor: "#000",
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    kakaoButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#3C1E1E",
    },
    appleButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "white",
    },
    bottomLinks: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    linkText: {
        fontSize: 16,
        color: "#666666", // 짙은 그레이
        fontWeight: "500",
        textDecorationLine: "underline",
    },
    linkDivider: {
        fontSize: 16,
        color: Colors.textTertiary,
        marginHorizontal: 8,
    },
});
