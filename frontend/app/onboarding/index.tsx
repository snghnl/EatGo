import React, { useState, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { KakaoLoginWebView } from "@/components/auth/KakaoLoginWebView";
import { GoogleLoginWebView } from "@/components/auth/GoogleLoginWebView";
import { useAuthStore, kakaoLogin, googleLogin } from "@/store/authStore";

export default function OnboardingStartScreen() {
    const router = useRouter();
    const { login, setLoading } = useAuthStore();
    const [showKakaoWebView, setShowKakaoWebView] = useState(false);
    const [showGoogleWebView, setShowGoogleWebView] = useState(false);
    const googleLoginProcessingRef = useRef(false);
    const kakaoLoginProcessingRef = useRef(false);

    const handleKakaoLogin = () => {
        setShowKakaoWebView(true);
    };

    const handleGoogleLogin = () => {
        console.log("구글 로그인");
        setShowGoogleWebView(true);
    };

    const handleEmailSignup = () => {
        console.log("이메일 가입");
        router.push("/onboarding/signup");
    };

    const handleLogin = () => {
        console.log("로그인");
        router.push("/onboarding/login");
    };

    // 카카오 로그인 성공 처리
    const handleKakaoLoginSuccess = async (authCode: string) => {
        // 이미 처리 중이면 중복 호출 방지 (useRef로 동기 체크)
        if (kakaoLoginProcessingRef.current) {
            console.log('🚫 Kakao login already in progress, ignoring duplicate call');
            return;
        }

        try {
            console.log('🚀 Starting Kakao login process with auth code');
            kakaoLoginProcessingRef.current = true;
            setLoading(true);
            setShowKakaoWebView(false);

            // 백엔드 API 호출
            const response = await kakaoLogin(authCode);

            // 로그인 처리
            await login(response.tokens, response.user);

            // 음식 선호도 페이지로 이동
            router.push("/onboarding/food-preference");

        } catch (error) {
            console.error('카카오 로그인 실패:', error);
            Alert.alert(
                '로그인 실패',
                error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.',
                [{ text: '확인' }]
            );
        } finally {
            setLoading(false);
            kakaoLoginProcessingRef.current = false;
        }
    };

    // 카카오 로그인 에러 처리
    const handleKakaoLoginError = (error: string) => {
        console.error('카카오 로그인 에러:', error);
        setShowKakaoWebView(false);
        Alert.alert(
            '로그인 오류',
            error,
            [{ text: '확인' }]
        );
    };

    // 카카오 웹뷰 닫기
    const handleKakaoWebViewClose = () => {
        setShowKakaoWebView(false);
    };

    // 구글 로그인 성공 처리
    const handleGoogleLoginSuccess = async (authCode: string) => {
        // 이미 처리 중이면 중복 호출 방지 (useRef로 동기 체크)
        if (googleLoginProcessingRef.current) {
            console.log('🚫 Google login already in progress, ignoring duplicate call');
            return;
        }

        try {
            console.log('🚀 Starting Google login process with auth code');
            googleLoginProcessingRef.current = true;
            setLoading(true);
            setShowGoogleWebView(false);

            // 백엔드 API 호출
            const response = await googleLogin(authCode);

            // 로그인 처리
            await login(response.tokens, response.user);

            // 음식 선호도 페이지로 이동
            router.push("/onboarding/food-preference");

        } catch (error) {
            console.error('구글 로그인 실패:', error);
            Alert.alert(
                '로그인 실패',
                error instanceof Error ? error.message : '구글 로그인에 실패했습니다.',
                [{ text: '확인' }]
            );
        } finally {
            setLoading(false);
            googleLoginProcessingRef.current = false;
        }
    };

    // 구글 로그인 에러 처리
    const handleGoogleLoginError = (error: string) => {
        console.error('구글 로그인 에러:', error);
        setShowGoogleWebView(false);
        Alert.alert(
            '로그인 오류',
            error,
            [{ text: '확인' }]
        );
    };

    // 구글 웹뷰 닫기
    const handleGoogleWebViewClose = () => {
        setShowGoogleWebView(false);
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

                {/* 구글 로그인 버튼 */}
                <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.8}
                >
                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                    <Text style={styles.googleButtonText}>구글로 시작</Text>
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

            {/* 카카오 로그인 웹뷰 */}
            <KakaoLoginWebView
                visible={showKakaoWebView}
                onClose={handleKakaoWebViewClose}
                onSuccess={handleKakaoLoginSuccess}
                onError={handleKakaoLoginError}
            />

            {/* 구글 로그인 웹뷰 */}
            <GoogleLoginWebView
                visible={showGoogleWebView}
                onClose={handleGoogleWebViewClose}
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
            />
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
    googleButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#dadce0",
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
    googleButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#3c4043",
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
