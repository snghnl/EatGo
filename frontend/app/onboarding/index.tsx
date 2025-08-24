import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { authService } from '@/services/authService';

export default function OnboardingStartScreen() {
    const router = useRouter();
    const [isKakaoLoading, setIsKakaoLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleKakaoLogin = async () => {
        try {
            setIsKakaoLoading(true);

            const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
            console.log('api key', kakaoAppKey);

            if (!kakaoAppKey) {
                Alert.alert('오류', 'KAKAO_REST_API_KEY가 설정되지 않았습니다.');
                return;
            }

            // 로컬 백엔드 callback URI 사용
            const redirectUri = 'https://7edfd67b542c.ngrok-free.app/api/v1/auth/kakao/callback/';
            console.log('Redirect URI:', redirectUri);

            // 카카오 OAuth URL 생성 (웹 로그인 강제)
            const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoAppKey}&redirect_uri=${encodeURIComponent(
                redirectUri
            )}&response_type=code`;
            console.log('Kakao Auth URL:', kakaoAuthUrl);

            // WebBrowser로 카카오 로그인 페이지 열기
            const result = await WebBrowser.openAuthSessionAsync(kakaoAuthUrl, redirectUri, {
                // 안드로이드 최적화 옵션
                showTitle: true,
                showInRecents: false,
                enableBarCollapsing: true,
                // 안드로이드에서 Chrome Custom Tabs 사용
                createTask: false,
                ...(Platform.OS === 'ios' && { preferEphemeralSession: true }),
            });

            console.log('WebBrowser result:', result);

            if (result.type === 'success') {
                console.log('Success URL:', result.url);

                try {
                    // URL에서 authorization code 추출
                    const url = new URL(result.url);
                    const code = url.searchParams.get('code');
                    const error = url.searchParams.get('error');

                    if (error) {
                        throw new Error(`카카오 인증 오류: ${error}`);
                    }

                    if (code) {
                        console.log('Authorization code:', code);

                        // 백엔드로 authorization code 전송
                        const response = await authService.kakaoLoginWithCode(code, redirectUri);

                        Alert.alert('로그인 성공', response.message, [
                            {
                                text: '확인',
                                onPress: () => {
                                    if (response.created) {
                                        router.push('/onboarding/food-preference');
                                    } else {
                                        router.push('/(tabs)/map');
                                    }
                                },
                            },
                        ]);
                    } else {
                        throw new Error('Authorization code를 받지 못했습니다.');
                    }
                } catch (urlError) {
                    console.error('URL 파싱 오류:', urlError);
                    throw new Error('로그인 응답 처리 중 오류가 발생했습니다.');
                }
            } else if (result.type === 'cancel' || result.type === 'dismiss') {
                throw new Error('사용자가 로그인을 취소했습니다.');
            } else {
                console.log('Unexpected result type:', result.type);
                throw new Error('로그인 처리 중 예상치 못한 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('카카오 로그인 실패:', error);
            Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsKakaoLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true);
            console.log('구글 로그인 시작');

            const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
            if (!googleClientId) {
                throw new Error('구글 클라이언트 ID가 설정되지 않았습니다.');
            }

            const redirectUri = 'https://7edfd67b542c.ngrok-free.app/api/v1/auth/google/callback/';
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`;

            console.log('구글 OAuth URL:', googleAuthUrl);
            const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                console.log('구글 인증 성공:', result.url);
                // 백엔드에서 처리되므로 여기서는 별도 처리 불필요
            } else if (result.type === 'cancel' || result.type === 'dismiss') {
                throw new Error('사용자가 로그인을 취소했습니다.');
            } else {
                throw new Error('구글 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('구글 로그인 오류:', error);
            Alert.alert('로그인 실패', error.message || '구글 로그인 중 오류가 발생했습니다.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleEmailSignup = () => {
        console.log('이메일 가입');
        router.push('/onboarding/signup');
    };

    const handleLogin = () => {
        console.log('로그인');
        router.push('/onboarding/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 메인 콘텐츠 */}
            <View style={styles.mainContent}>
                {/* 제목 */}
                <Text style={styles.title}>
                    <Text style={styles.highlight}>잇고</Text>와 함께{'\n'}
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
                    disabled={isKakaoLoading}
                >
                    {isKakaoLoading ? (
                        <ActivityIndicator size="small" color="#3C1E1E" />
                    ) : (
                        <>
                            <Image
                                source={{
                                    uri: 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png',
                                }}
                                style={styles.socialIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.kakaoButtonText}>카카오로 시작</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* 구글 로그인 버튼 */}
                <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.8}
                    disabled={isGoogleLoading}
                >
                    {isGoogleLoading ? (
                        <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color="#4285F4" />
                            <Text style={styles.googleButtonText}>구글로 시작</Text>
                        </>
                    )}
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 16,
    },
    highlight: {
        fontSize: 32,
        color: '#FF4757', // 포인트 레드
        fontWeight: 'bold',
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    kakaoButton: {
        backgroundColor: '#FEE500',
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    kakaoButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3C1E1E',
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    bottomLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        fontSize: 16,
        color: '#666666', // 짙은 그레이
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    linkDivider: {
        fontSize: 16,
        color: Colors.textTertiary,
        marginHorizontal: 8,
    },
});
