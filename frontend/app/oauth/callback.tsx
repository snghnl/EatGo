import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OAuthCallback() {
    const { code } = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (code) {
            console.log('OAuth 인가 코드 받음:', code);

            // 백엔드로 인가 코드 전송
            handleKakaoLogin(code as string);
        }
    }, [code]);

    const handleKakaoLogin = async (authCode: string) => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/kakao/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: authCode,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('카카오 로그인 성공:', data);

                // 로그인 성공 후 메인 화면으로 이동
                router.replace('/(tabs)');
            } else {
                console.error('카카오 로그인 실패:', response.status);
                router.replace('/onboarding');
            }
        } catch (error) {
            console.error('카카오 로그인 오류:', error);
            router.replace('/onboarding');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 20 }}>카카오 로그인 처리 중...</Text>
        </View>
    );
}
