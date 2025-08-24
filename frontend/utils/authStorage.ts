import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKENS_KEY = '@eatgo_auth_tokens';
const USER_INFO_KEY = '@eatgo_user_info';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  login_method: string;
  profile_image_url?: string;
}

export const authStorage = {
  // 토큰 저장
  async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
      throw error;
    }
  },

  // 토큰 조회
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Failed to get auth tokens:', error);
      return null;
    }
  },

  // 사용자 정보 저장
  async setUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to save user info:', error);
      throw error;
    }
  },

  // 사용자 정보 조회
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfo = await AsyncStorage.getItem(USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  },

  // 로그아웃 (모든 데이터 삭제)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, USER_INFO_KEY]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw error;
    }
  },

  // 로그인 상태 확인
  async isLoggedIn(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null && tokens.access !== undefined;
  }
};
