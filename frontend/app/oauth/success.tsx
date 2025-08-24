import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthSuccess() {
  const router = useRouter();
  const { access_token, refresh_token, created } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
    created: string;
  }>();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        if (access_token && refresh_token) {
          // 토큰 저장
          await AsyncStorage.setItem('access_token', access_token);
          await AsyncStorage.setItem('refresh_token', refresh_token);

          // 신규 사용자라면 음식 취향 설정으로, 기존 사용자라면 홈으로
          if (created === 'true') {
            router.replace('/onboarding/food-preference');
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Auth success handling failed:', error);
        router.replace('/onboarding');
      }
    };

    handleAuthSuccess();
  }, [access_token, refresh_token, created, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>로그인 처리 중...</Text>
    </View>
  );
}
