import { View, Text } from 'react-native';
import SearchBar from '@/components/SearchBar';
import TopBar from '@/components/TopBar';
import PlaceCardSwiper from '@/components/main/PlaceCardSwiper';
import FloatingButton from '@/components/main/FloatingButton';
import React, { useState } from 'react';

// 카카오맵 또는 지도 API 컴포넌트 import 필요

export default function MainMapScreen() {
    const [showSwiper, setShowSwiper] = useState(false);

    return (
        <View style={{ flex: 1 }}>
            <Text>지도 표시 영역</Text>
            {/* 카카오맵 뷰 삽입 */}
            <SearchBar />
            <TopBar />
            {!showSwiper && <FloatingButton onPress={() => setShowSwiper(true)} />}
            {showSwiper && <PlaceCardSwiper onClose={() => setShowSwiper(false)} />}
        </View>
    );
}
