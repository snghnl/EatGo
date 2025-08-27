import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useBookmark } from "@/store/BookmarkContext";
import { mapIcons } from "@/config/mapIcons";

const KAKAO_JS_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY;

type KakaoMapProps = {
    latitude: number;
    longitude: number;
    placeId: string;     // ✅ 북마크 판별용
    category: string;    // ✅ 아이콘 선택용
};

// 웹 전용 컴포넌트
function KakaoWebMap({ latitude, longitude, placeId, category }: KakaoMapProps) {
    const { bookmarkedPlaceIds } = useBookmark();

    // ✅ 아이콘 결정 함수
    function getMarkerImage(category: string, isBookmarked: boolean) {
        const iconSet = mapIcons[category];
        if (isBookmarked && iconSet?.on) {
            return new window.kakao.maps.MarkerImage(
                iconSet.on,
                new window.kakao.maps.Size(32, 32),
                { offset: new window.kakao.maps.Point(16, 32) }
            );
        }
        return null; // off → Kakao 기본 아이콘
    }

    React.useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById("kakao-map");
                if (container) {
                    const options = {
                        center: new window.kakao.maps.LatLng(latitude, longitude),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(container, options);

                    // ✅ 북마크 여부 확인
                    const isBookmarked = bookmarkedPlaceIds.includes(placeId);
                    const markerImage = getMarkerImage(category, isBookmarked);

                    const marker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(latitude, longitude),
                        ...(markerImage ? { image: markerImage } : {}),
                    });
                    marker.setMap(map);
                }
            });
        };
        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src*="kakao"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [latitude, longitude, bookmarkedPlaceIds, placeId, category]);

    return <div id="kakao-map" style={{ width: "100%", height: "100%" }} />;
}

export default function KakaoMap(props: KakaoMapProps) {
    // 플랫폼별 처리
    if (Platform.OS === "web") {
        return <KakaoWebMap {...props} />;
    }

    // 모바일은 WebView 그대로 (북마크 연동은 추후 추가 가능)
    const { latitude, longitude } = props;
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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: "100%", height: "100%" },
    webview: { flex: 1 },
});
