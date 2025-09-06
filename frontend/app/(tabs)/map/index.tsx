import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import TopBar from "@/components/main/TopBar";
import SearchBar from "@/components/SearchBar";
import MapPlaceCardSwiper from "@/components/main/MapPlaceCardSwiper";
import KakaoMap from "@/components/main/KakaoMap";
import { fetchWishlists } from "@/src/api/wishlists";
import { fetchPlaceIndex } from "@/src/api/places";
import { useBookmark } from "@/store/BookmarkContext";
import { MapMarker } from "@/types";
import { mapIcons, tokenToIconKey } from "@/src/config/mapIcons";

const mid = (s?: string) => {
    if (!s) return "기본";
    const parts = s.split(">").map((v) => v.trim());
    return parts[1] ?? "기본";
};

export default function MapScreen() {
    const insets = useSafeAreaInsets();
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const { bookmarkedPlaceIds, toggleBookmark } = useBookmark();

    // 데이터 로딩 (mock → API로 쉽게 교체)
    useEffect(() => {
        (async () => {
            const [wish, placeIdx] = await Promise.all([
                fetchWishlists(),
                fetchPlaceIndex(),
            ]);

            // 1) 위시리스트를 BookmarkContext에 반영(항상 떠야 하므로)
            const allIds = new Set<string>();
            wish.forEach((w) =>
                (w.items ?? []).forEach(
                    (it) => it.place_id && allIds.add(String(it.place_id))
                )
            );

            // 북마크 상태를 먼저 업데이트
            allIds.forEach((pid) => {
                if (!bookmarkedPlaceIds.includes(pid)) {
                    toggleBookmark(pid);
                }
            });

            // 2) 지도 마커 생성
            const mks: MapMarker[] = [];
            wish.forEach((w) => {
                (w.items ?? []).forEach((it) => {
                    const pid = String(it.place_id);
                    const doc = placeIdx.get(pid);
                    const lat = doc ? Number(doc.y) : Number(it.lat);
                    const lng = doc ? Number(doc.x) : Number(it.lng);
                    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

                    const categoryName = mid(doc?.category_name);
                    const iconKey = tokenToIconKey[categoryName] ?? "korean";
                    // 위시리스트에 있는 모든 항목은 북마크된 것으로 간주
                    const isBookmarked = allIds.has(pid);

                    mks.push({
                        id: pid,
                        lat,
                        lng,
                        title: doc?.place_name ?? it.place_name,
                        categoryKey: iconKey as keyof typeof mapIcons,
                        isBookmarked,
                    });
                });
            });

            setMarkers(mks);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 초기 1회

    const handleSelectItem = useCallback((item: any) => {
        // TODO: 장소 선택 처리
    }, []);

    // 지도 중심(선택: 첫 마커 또는 서울시청)
    const center = useMemo(() => {
        if (markers.length > 0) {
            return { lat: markers[0].lat, lng: markers[0].lng };
        }
        return { lat: 37.566826, lng: 126.9786567 };
    }, [markers]);

    return (
        <View style={styles.container}>
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
                <View style={styles.searchWrapper}>
                    <SearchBar
                        searchData={[]}
                        onSelectItem={handleSelectItem}
                    />
                </View>
                <View style={styles.topBarWrapper}>
                    <TopBar />
                </View>
            </View>

            <View style={styles.mapContainer}>
                <KakaoMap
                    latitude={center.lat}
                    longitude={center.lng}
                    markers={markers} // ✅ 북마크된 모든 장소 전달
                />
            </View>

            <View
                style={[
                    styles.cardSwiperWrapper,
                    { paddingBottom: insets.bottom },
                ]}
            >
                <MapPlaceCardSwiper onSelectItem={handleSelectItem} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    headerWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 100,
    },
    cardSwiperWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    searchWrapper: { marginBottom: 0 },
    topBarWrapper: { marginTop: 0 },
    mapContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
});
