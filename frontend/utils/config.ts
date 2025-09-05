import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * 개발 환경에 맞는 API URL을 반환 (실제 API 호출용)
 */
export const getApiBaseUrl = (): string => {
  // 프로덕션 환경
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-production-api.com/api/v1';
  }

  // 개발 환경
  const localhost = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  // 안드로이드에서는 실제 API 호출을 위해 10.0.2.2 사용
  if (Platform.OS === 'android') {
    return localhost.replace('localhost', '10.0.2.2');
  }

  // iOS 시뮬레이터나 웹인 경우
  return localhost;
};

/**
 * OAuth 콜백 URL용 (항상 localhost 사용)
 */
export const getOAuthBaseUrl = (): string => {
  // 프로덕션 환경
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-production-api.com/api/v1';
  }

  // 개발 환경에서는 OAuth 콜백을 위해 항상 localhost 사용
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
};

/**
 * 카카오 콜백 URL 생성 (안드로이드에서 10.0.2.2 사용)
 */
export const getKakaoCallbackUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/auth/kakao/callback/`;
};

/**
 * 구글 콜백 URL 생성
 */
export const getGoogleCallbackUrl = (): string => {
  const baseUrl = getOAuthBaseUrl();
  return `${baseUrl}/auth/google/callback/`;
};

/**
 * 현재 플랫폼 정보
 */
export const getPlatformInfo = () => ({
  platform: Platform.OS,
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  isWeb: Platform.OS === 'web',
  isDev: __DEV__,
});

console.log('🚀 API Configuration:', {
  apiBaseUrl: getApiBaseUrl(),
  oauthBaseUrl: getOAuthBaseUrl(),
  kakaoCallbackUrl: getKakaoCallbackUrl(),
  googleCallbackUrl: getGoogleCallbackUrl(),
  platformInfo: getPlatformInfo(),
});
