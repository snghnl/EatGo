import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

const KAKAO_JS_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY;

// Kakao Maps SDK 타입 정의
declare global {
    interface Window {
        kakao: {
            maps: {
                load: (callback: () => void) => void;
                LatLng: new (lat: number, lng: number) => any;
                Map: new (container: HTMLElement, options: any) => any;
                Marker: new (options: any) => any;
            };
        };
    }
}

type KakaoMapProps = {
    latitude: number;
    longitude: number;
};

type KakaoWebMapProps = {
    latitude: number;
    longitude: number;
};

// 웹 전용 컴포넌트
function KakaoWebMap({ latitude, longitude }: KakaoWebMapProps) {
    React.useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById("kakao-map");
                if (container) {
                    const options = {
                        center: new window.kakao.maps.LatLng(
                            latitude,
                            longitude
                        ),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(container, options);

                    const marker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(
                            latitude,
                            longitude
                        ),
                    });
                    marker.setMap(map);
                }
            });
        };
        document.head.appendChild(script);

        return () => {
            // cleanup
            const existingScript = document.querySelector(
                'script[src*="kakao"]'
            );
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [latitude, longitude]);

    return <div id="kakao-map" style={{ width: "100%", height: "100%" }} />;
}

export default function KakaoMap({ latitude, longitude }: KakaoMapProps) {
    // 플랫폼별 처리
    if (Platform.OS === "web") {
        // 웹에서는 직접 렌더링
        return <KakaoWebMap latitude={latitude} longitude={longitude} />;
    }

    // 모바일에서는 HTML 파일을 WebView로 렌더링
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}"></script>
            <script>
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                    level: 3
                };
                var map = new kakao.maps.Map(container, options);
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                source={{ html: htmlContent }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) =>
                    console.log("KAKAO:", event.nativeEvent.data)
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
    },
    webview: {
        flex: 1,
    },
});
