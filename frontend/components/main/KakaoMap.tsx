import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useBookmark } from "@/store/BookmarkContext";
import { mapIcons, getIconUrlMap } from "@/src/config/mapIcons";
import { MapMarker } from "@/types";

const KAKAO_JS_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY;

// 카카오맵 타입 선언
declare global {
    interface Window {
        kakao: any;
    }
}

type KakaoMapProps = {
    latitude: number;
    longitude: number;
    markers?: MapMarker[]; // ✅ 여러 마커 지원
};

// 웹 전용 컴포넌트
function KakaoWebMap({ latitude, longitude, markers = [] }: KakaoMapProps) {
    const { bookmarkedPlaceIds } = useBookmark();

    // ✅ 아이콘 결정 함수
    function getMarkerImage(
        categoryKey: keyof typeof mapIcons,
        isBookmarked: boolean
    ) {
        const iconSet = mapIcons[categoryKey];

        if (isBookmarked && iconSet?.on) {
            // WebView에서 사용할 수 있도록 URI로 변환
            const iconUrlMap = getIconUrlMap();
            const iconUrl = iconUrlMap[categoryKey];

            return new window.kakao.maps.MarkerImage(
                iconUrl,
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
                        center: new window.kakao.maps.LatLng(
                            latitude,
                            longitude
                        ),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(container, options);

                    // ✅ 모든 마커 생성

                    markers.forEach((markerData) => {
                        const isBookmarked = bookmarkedPlaceIds.includes(
                            markerData.id
                        );
                        const markerImage = markerData.categoryKey
                            ? getMarkerImage(
                                  markerData.categoryKey,
                                  isBookmarked
                              )
                            : null;

                        const marker = new window.kakao.maps.Marker({
                            position: new window.kakao.maps.LatLng(
                                markerData.lat,
                                markerData.lng
                            ),
                            ...(markerImage ? { image: markerImage } : {}),
                        });
                        marker.setMap(map);

                        // 마커 클릭 이벤트
                        window.kakao.maps.event.addListener(
                            marker,
                            "click",
                            () => {
                                // TODO: 마커 클릭 처리
                            }
                        );
                    });
                }
            });
        };
        document.head.appendChild(script);

        return () => {
            const existingScript = document.querySelector(
                'script[src*="kakao"]'
            );
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [latitude, longitude, bookmarkedPlaceIds, markers]);

    return <div id="kakao-map" style={{ width: "100%", height: "100%" }} />;
}

export default function KakaoMap(props: KakaoMapProps) {
    // 플랫폼별 처리
    if (Platform.OS === "web") {
        return <KakaoWebMap {...props} />;
    }

    // 모바일 WebView에서 북마크 상태 전달
    const { latitude, longitude, markers = [] } = props;
    const { bookmarkedPlaceIds } = useBookmark();

    // 실제 PNG 아이콘 URL 매핑
    const iconUrlMap = getIconUrlMap();

    // 마커 데이터를 JSON으로 직렬화
    const markersData = JSON.stringify(markers);
    const bookmarkedIds = JSON.stringify(bookmarkedPlaceIds);
    const iconUrls = JSON.stringify(iconUrlMap);

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
                
                // 마커 데이터와 북마크 상태
                var markersData = ${markersData};
                var bookmarkedIds = ${bookmarkedIds};
                var iconUrls = ${iconUrls};
                
                
                // 마커 생성 함수
                function createMarker(markerData) {
                    var isBookmarked = bookmarkedIds.includes(markerData.id);
                    var markerImage = null;
                    
                    if (isBookmarked && markerData.categoryKey && iconUrls[markerData.categoryKey]) {
                        markerImage = new kakao.maps.MarkerImage(
                            iconUrls[markerData.categoryKey as keyof typeof iconUrls],
                            new kakao.maps.Size(32, 32),
                            { offset: new kakao.maps.Point(16, 32) }
                        );
                    } else {
                    }
                    
                    var marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
                        ...(markerImage ? { image: markerImage } : {})
                    });
                    
                    marker.setMap(map);
                    
                    // 마커 클릭 이벤트
                    kakao.maps.event.addListener(marker, 'click', function() {
                        // TODO: 마커 클릭 처리
                    });
                }
                
                // 모든 마커 생성
                markersData.forEach(function(markerData) {
                    createMarker(markerData);
                });
                
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
