import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/main/TopBar';
import SearchBar from '@/components/SearchBar';
import MapPlaceCardSwiper from '@/components/main/MapPlaceCardSwiper';
import KakaoMap from '@/components/main/KakaoMap';

// MOCK DATA
import mockData from '@/mock-data/places.json';

interface PlaceItem {
    id: string;
    place_name: string;
    category_name: string;
    road_address_name: string;
    address_name: string;
    category_group_code: string;
    category_group_name: string;
    distance: string;
    phone: string;
    place_url: string;
    x: string;
    y: string;
}

export default function MapScreen() {
    const insets = useSafeAreaInsets();

    const handleSelectItem = useCallback((item: PlaceItem) => {
        console.log('Selected:', item.place_name);
    }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
                <View style={styles.searchWrapper}>
                    <SearchBar searchData={mockData.documents} onSelectItem={handleSelectItem} />
                </View>
                <View style={styles.topBarWrapper}>
                    <TopBar />
                </View>
            </View>

            {/* 지도를 배경으로 전체 화면에 렌더링 */}
            <View style={styles.mapContainer}>
                <KakaoMap latitude={37.566826} longitude={126.9786567} />
            </View>

            <View style={[styles.cardSwiperWrapper, { paddingBottom: insets.bottom }]}>
                <MapPlaceCardSwiper onSelectItem={handleSelectItem} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 100,
    },
    cardSwiperWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    searchWrapper: {
        marginBottom: 0,
    },
    topBarWrapper: {
        marginTop: 0,
    },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
});
