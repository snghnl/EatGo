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
import { getGoogleCallbackUrl } from '@/utils/config';

interface GoogleLoginWebViewProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (authCode: string) => void;
    onError: (error: string) => void;
}

export const GoogleLoginWebView: React.FC<GoogleLoginWebViewProps> = ({
    visible,
    onClose,
    onSuccess,
    onError,
}) => {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authCodeProcessed, setAuthCodeProcessed] = useState(false);

    // 구글 OAuth URL 생성
    const getGoogleAuthUrl = () => {
        const params = new URLSearchParams({
            client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
            redirect_uri: getGoogleCallbackUrl(),
            response_type: 'code',
            scope: 'openid profile email',
            access_type: 'offline',
            prompt: 'select_account',
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        console.log('🔗 Google Auth URL:', url);
        console.log('🔑 Client ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
        console.log('🔄 Redirect URI:', getGoogleCallbackUrl());
        return url;
    };

    // 웹뷰 네비게이션 상태 변경 처리
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        const { url } = navState;
        console.log('🌐 WebView Navigation:', url);

        // 콜백 URL 체크
        if (url.includes('/auth/google/callback/') && !authCodeProcessed) {
            console.log('🎯 Google callback detected!');
            try {
                const urlObj = new URL(url);
                const authCode = urlObj.searchParams.get('code');
                const error = urlObj.searchParams.get('error');

                console.log('🔑 Extracted auth code:', authCode);
                console.log('❌ Extracted error:', error);

                if (error) {
                    setAuthCodeProcessed(true);
                    onError(`구글 로그인 오류: ${error}`);
                    return;
                }

                if (authCode) {
                    console.log('✅ Calling onSuccess with auth code');
                    setAuthCodeProcessed(true);
                    onSuccess(authCode);
                    return;
                }

                console.log('⚠️ No auth code or error found in callback URL');
            } catch (err) {
                console.error('URL 파싱 오류:', err);
                setAuthCodeProcessed(true);
                onError('인증 처리 중 오류가 발생했습니다.');
            }
        }
    };

    // 웹뷰 에러 처리
    const handleWebViewError = (event: any) => {
        const errorUrl = event.nativeEvent.url;
        console.error('🚨 WebView Error:', event.nativeEvent);

        // 이미 인가 코드를 처리했다면 에러 무시 (localhost 연결 실패는 예상된 에러)
        if (authCodeProcessed) {
            console.log('🤫 Ignoring WebView error - auth code already processed successfully');
            return;
        }

        // 콜백 URL에서 에러가 발생한 경우, 인가 코드 추출 시도
        if (errorUrl && errorUrl.includes('/auth/google/callback/')) {
            console.log('🎯 Error occurred on callback URL, attempting to extract auth code');
            try {
                const urlObj = new URL(errorUrl);
                const authCode = urlObj.searchParams.get('code');

                if (authCode) {
                    console.log('✅ Auth code found in error URL, proceeding with success');
                    setAuthCodeProcessed(true);
                    onSuccess(authCode);
                    return;
                }
            } catch (err) {
                console.error('Failed to extract auth code from error URL:', err);
            }
        }

        console.error('🚨 WebView Error Details:', {
            description: event.nativeEvent.description,
            domain: event.nativeEvent.domain,
            code: event.nativeEvent.code,
            url: errorUrl,
        });
        setIsLoading(false);
        onError(`웹뷰 에러: ${event.nativeEvent.description || JSON.stringify(event.nativeEvent)}`);
    };

    // 로딩 시작 처리
    const handleLoadStart = (event: any) => {
        console.log('🔄 WebView Load Started');
        console.log('🔄 Load Start URL:', event.nativeEvent.url);
        console.log('🔄 Load Start Title:', event.nativeEvent.title);
        setIsLoading(true);
    };

    // 로딩 완료 처리
    const handleLoadEnd = (event: any) => {
        console.log('✅ WebView Load Ended');
        console.log('✅ Load End URL:', event.nativeEvent.url);
        console.log('✅ Load End Title:', event.nativeEvent.title);

        // 구글 로그인 페이지가 로딩되면 강제로 로딩 상태 해제
        if (event.nativeEvent.url.includes('accounts.google.com')) {
            setTimeout(() => {
                console.log('⏰ Force hiding loading after timeout');
                setIsLoading(false);
            }, 2000);
        } else {
            setIsLoading(false);
        }
    };

    // 로딩 진행 상태 처리
    const handleLoadProgress = (event: any) => {
        const progress = event.nativeEvent.progress;
        const url = event.nativeEvent.url;
        console.log('📊 WebView Progress:', `${Math.round(progress * 100)}% - ${url}`);

        // 100% 로딩 완료되면 로딩 상태 해제 (안드로이드에서 onLoadEnd가 호출되지 않는 경우 대비)
        if (progress === 1.0 && url.includes('accounts.google.com')) {
            setTimeout(() => {
                console.log('📊 Force hiding loading after 100% progress');
                setIsLoading(false);
            }, 1000);
        }
    };

    // 모달 닫기 확인
    const handleClose = () => {
        Alert.alert(
            '로그인 취소',
            '구글 로그인을 취소하시겠습니까?',
            [
                { text: '계속하기', style: 'cancel' },
                { text: '취소', style: 'destructive', onPress: onClose },
            ]
        );
    };

    // 모달이 열릴 때 상태 초기화
    React.useEffect(() => {
        if (visible) {
            setAuthCodeProcessed(false);
            setIsLoading(true);
        }
    }, [visible]);

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
                    <Text style={styles.headerTitle}>구글 로그인</Text>
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
                    source={{ uri: getGoogleAuthUrl() }}
                    style={styles.webView}
                    onNavigationStateChange={handleNavigationStateChange}
                    onError={handleWebViewError}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onLoadProgress={handleLoadProgress}
                    onHttpError={(event) => {
                        console.error('🚨 HTTP Error:', event.nativeEvent);
                        console.error('🚨 HTTP Status Code:', event.nativeEvent.statusCode);
                        console.error('🚨 HTTP URL:', event.nativeEvent.url);
                    }}
                    onShouldStartLoadWithRequest={(request) => {
                        console.log('🤔 Should Start Load:', request.url);
                        return true;
                    }}
                    startInLoadingState={true}
                    mixedContentMode="compatibility"
                    allowsBackForwardNavigationGestures={false}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    incognito={false}
                    cacheEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    setSupportMultipleWindows={false}
                    userAgent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
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

export default GoogleLoginWebView;
