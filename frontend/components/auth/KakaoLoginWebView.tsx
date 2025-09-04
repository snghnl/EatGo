import React, { useRef, useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Alert,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { getKakaoCallbackUrl } from '@/utils/config';

interface KakaoLoginWebViewProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (authCode: string) => void;
    onError: (error: string) => void;
}

export const KakaoLoginWebView: React.FC<KakaoLoginWebViewProps> = ({
    visible,
    onClose,
    onSuccess,
    onError,
}) => {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 카카오 OAuth URL 생성
    const getKakaoAuthUrl = () => {
        const params = new URLSearchParams({
            client_id: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '',
            redirect_uri: getKakaoCallbackUrl(),
            response_type: 'code',
            // 기본 프로필 정보만 요청 (카카오 앱에서 기본 활성화됨)
            scope: 'profile_nickname',
        });

        const url = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
        console.log('🔗 Kakao Auth URL:', url);
        console.log('🔑 Client ID:', process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY);
        console.log('🔄 Redirect URI:', getKakaoCallbackUrl());
        return url;
    };

    // 웹뷰 네비게이션 상태 변경 처리
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        const { url } = navState;
        console.log('🌐 WebView Navigation:', url);

        // 콜백 URL 체크
        if (url.includes('/auth/kakao/callback/')) {
            try {
                const urlObj = new URL(url);
                const authCode = urlObj.searchParams.get('code');
                const error = urlObj.searchParams.get('error');

                if (error) {
                    onError(`카카오 로그인 오류: ${error}`);
                    return;
                }

                if (authCode) {
                    onSuccess(authCode);
                    return;
                }
            } catch (err) {
                console.error('URL 파싱 오류:', err);
                onError('인증 처리 중 오류가 발생했습니다.');
            }
        }
    };

    // 웹뷰 에러 처리
    const handleWebViewError = (event: any) => {
        console.error('🚨 WebView Error:', event.nativeEvent);
        onError('웹뷰 로딩 중 오류가 발생했습니다.');
    };

    // 로딩 시작 처리
    const handleLoadStart = () => {
        console.log('🔄 WebView Load Started');
        setIsLoading(true);
    };

    // 로딩 완료 처리
    const handleLoadEnd = () => {
        console.log('✅ WebView Load Ended');
        setIsLoading(false);
    };

    // 모달 닫기 확인
    const handleClose = () => {
        Alert.alert(
            '로그인 취소',
            '카카오 로그인을 취소하시겠습니까?',
            [
                { text: '계속하기', style: 'cancel' },
                { text: '취소', style: 'destructive', onPress: onClose },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="formSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>카카오 로그인</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* 로딩 인디케이터 */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>로딩 중...</Text>
                    </View>
                )}

                {/* 웹뷰 */}
                <WebView
                    ref={webViewRef}
                    source={{ uri: getKakaoAuthUrl() }}
                    style={styles.webView}
                    onNavigationStateChange={handleNavigationStateChange}
                    onError={handleWebViewError}
                    onLoadEnd={handleLoadEnd}
                    startInLoadingState={true}
                    mixedContentMode="compatibility"
                    allowsBackForwardNavigationGestures={false}
                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 10,
    },
    webView: {
        flex: 1,
    },
});

export default KakaoLoginWebView;
