import { authStorage, AuthTokens, UserInfo } from '../utils/authStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface KakaoLoginResponse {
  message: string;
  tokens: AuthTokens;
  user: UserInfo;
  created: boolean;
}

export interface KakaoLoginRequest {
  access_token: string;
}

class AuthService {
  private getApiUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getApiUrl(endpoint);

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 카카오 로그인 (Access Token 방식)
  async kakaoLogin(kakaoAccessToken: string): Promise<KakaoLoginResponse> {
    const requestData: KakaoLoginRequest = {
      access_token: kakaoAccessToken,
    };

    const response = await this.makeRequest<KakaoLoginResponse>(
      '/auth/kakao/login/',
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      }
    );

    // 토큰과 사용자 정보를 저장
    await authStorage.setTokens(response.tokens);
    await authStorage.setUserInfo(response.user);

    return response;
  }

  // 카카오 로그인 (Authorization Code 방식)
  async kakaoLoginWithCode(code: string, redirectUri: string): Promise<KakaoLoginResponse> {
    const requestData = {
      code: code,
      redirect_uri: redirectUri,
    };

    const response = await this.makeRequest<KakaoLoginResponse>(
      '/auth/kakao/login/',
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      }
    );

    // 토큰과 사용자 정보를 저장
    await authStorage.setTokens(response.tokens);
    await authStorage.setUserInfo(response.user);

    return response;
  }

  // 로그아웃
  async logout(): Promise<void> {
    await authStorage.clearAll();
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<UserInfo | null> {
    return await authStorage.getUserInfo();
  }

  // 로그인 상태 확인
  async isAuthenticated(): Promise<boolean> {
    return await authStorage.isLoggedIn();
  }

  // 액세스 토큰 조회
  async getAccessToken(): Promise<string | null> {
    const tokens = await authStorage.getTokens();
    return tokens?.access || null;
  }
}

export const authService = new AuthService();
