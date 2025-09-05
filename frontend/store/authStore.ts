import { create } from 'zustand';
import {
    saveTokens,
    saveUserInfo,
    getUserInfo,
    getAccessToken,
    clearAuthData,
    isLoggedIn,
    UserInfo,
    TokenInfo
} from '@/utils/storage';
import { getApiBaseUrl } from '@/utils/config';
import { client } from '@/src/client/client.gen';

interface AuthState {
    isAuthenticated: boolean;
    user: UserInfo | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (tokens: TokenInfo, user: UserInfo) => Promise<void>;
    logout: () => Promise<void>;
    loadAuthState: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
    // 초기 상태
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,

    // 로그인 처리
    login: async (tokens: TokenInfo, user: UserInfo) => {
        try {
            set({ isLoading: true, error: null });

            // 토큰과 사용자 정보 저장
            await saveTokens(tokens);
            await saveUserInfo(user);

            // API 클라이언트 설정 업데이트
            client.setConfig({
                baseUrl: getApiBaseUrl().replace('/api/v1', ''),
                headers: {
                    Authorization: `Bearer ${tokens.access}`,
                },
            });

            set({
                isAuthenticated: true,
                user,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error('로그인 처리 실패:', error);
            set({
                error: '로그인 처리에 실패했습니다.',
                isLoading: false,
            });
            throw error;
        }
    },

    // 로그아웃 처리
    logout: async () => {
        try {
            set({ isLoading: true });

            // 저장된 인증 정보 삭제
            await clearAuthData();

            // API 클라이언트 설정 초기화
            client.setConfig({
                baseUrl: getApiBaseUrl().replace('/api/v1', ''),
                headers: {},
            });

            set({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error('로그아웃 처리 실패:', error);
            set({
                error: '로그아웃 처리에 실패했습니다.',
                isLoading: false,
            });
        }
    },

    // 앱 시작 시 인증 상태 로드
    loadAuthState: async () => {
        try {
            set({ isLoading: true, error: null });

            const [loggedIn, user, accessToken] = await Promise.all([
                isLoggedIn(),
                getUserInfo(),
                getAccessToken(),
            ]);

            if (loggedIn && user && accessToken) {
                // API 클라이언트 설정 업데이트
                client.setConfig({
                    baseUrl: getApiBaseUrl().replace('/api/v1', ''),
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                set({
                    isAuthenticated: true,
                    user,
                    isLoading: false,
                });
            } else {
                set({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error('인증 상태 로드 실패:', error);
            set({
                isAuthenticated: false,
                user: null,
                error: '인증 상태 확인에 실패했습니다.',
                isLoading: false,
            });
        }
    },

    // 에러 초기화
    clearError: () => {
        set({ error: null });
    },

    // 로딩 상태 설정
    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },
}));

// 카카오 로그인 API 호출 함수
export const kakaoLogin = async (authCode: string) => {
    const apiUrl = `${getApiBaseUrl()}/auth/kakao/`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: authCode,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '카카오 로그인에 실패했습니다.');
    }

    return response.json();
};

// 구글 로그인 API 호출 함수
export const googleLogin = async (authCode: string) => {
    const apiUrl = `${getApiBaseUrl()}/auth/google/`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: authCode,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '구글 로그인에 실패했습니다.');
    }

    return response.json();
};
