import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const KAKAO_JS_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY;

type KakaoMapProps = {
    latitude: number;
    longitude: number;
};

export default function KakaoMap({ latitude, longitude }: KakaoMapProps) {
    // 플랫폼별 처리
    if (Platform.OS === 'web') {
        // 웹에서는 직접 렌더링
        return <KakaoWebMap latitude={latitude} longitude={longitude} />;
    }

    // 모바일에서는 외부 URL 사용
    const mapUrl = `https://map.kakao.com/link/map/위치,${latitude},${longitude}`;

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: mapUrl }}
                style={styles.webview}
                javaScriptEnabled={true}
                onMessage={(event) => console.log('KAKAO:', event.nativeEvent.data)}
            />
        </View>
    );
}

// 웹 전용 컴포넌트
function KakaoWebMap({ latitude, longitude }) {
    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}&autoload=false`;
        script.onload = () => {
            kakao.maps.load(() => {
                const container = document.getElementById('kakao-map');
                const options = {
                    center: new kakao.maps.LatLng(latitude, longitude),
                    level: 3,
                };
                const map = new kakao.maps.Map(container, options);

                const marker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(latitude, longitude),
                });
                marker.setMap(map);
            });
        };
        document.head.appendChild(script);
    }, [latitude, longitude]);

    return <div id="kakao-map" style={{ width: '100%', height: '100%' }} />;
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    webview: {
        flex: 1,
    },
});
