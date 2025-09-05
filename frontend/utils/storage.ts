import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 키 상수
const TOKEN_KEYS = {
    ACCESS_TOKEN: '@auth/access_token',
    REFRESH_TOKEN: '@auth/refresh_token',
    USER_INFO: '@auth/user_info',
} as const;

export interface UserInfo {
    id: string;
    username: string;
    email: string;
    login_method: string;
    profile_image_url?: string;
    first_name?: string;
    last_name?: string;
}

export interface TokenInfo {
    access: string;
    refresh: string;
}

/**
 * 토큰 저장
 */
export const saveTokens = async (tokens: TokenInfo): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access),
            AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh),
        ]);
    } catch (error) {
        console.error('토큰 저장 실패:', error);
        throw new Error('토큰 저장에 실패했습니다.');
    }
};

/**
 * 액세스 토큰 조회
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
        console.error('액세스 토큰 조회 실패:', error);
        return null;
    }
};

/**
 * 리프레시 토큰 조회
 */
export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
        console.error('리프레시 토큰 조회 실패:', error);
        return null;
    }
};

/**
 * 사용자 정보 저장
 */
export const saveUserInfo = async (userInfo: UserInfo): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
        console.error('사용자 정보 저장 실패:', error);
        throw new Error('사용자 정보 저장에 실패했습니다.');
    }
};

/**
 * 사용자 정보 조회
 */
export const getUserInfo = async (): Promise<UserInfo | null> => {
    try {
        const userInfoString = await AsyncStorage.getItem(TOKEN_KEYS.USER_INFO);
        return userInfoString ? JSON.parse(userInfoString) : null;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        return null;
    }
};

/**
 * 모든 인증 정보 삭제 (로그아웃)
 */
export const clearAuthData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            TOKEN_KEYS.ACCESS_TOKEN,
            TOKEN_KEYS.REFRESH_TOKEN,
            TOKEN_KEYS.USER_INFO,
        ]);
    } catch (error) {
        console.error('인증 정보 삭제 실패:', error);
        throw new Error('로그아웃 처리에 실패했습니다.');
    }
};

/**
 * 로그인 상태 확인
 */
export const isLoggedIn = async (): Promise<boolean> => {
    try {
        const accessToken = await getAccessToken();
        return !!accessToken;
    } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        return false;
    }
};
