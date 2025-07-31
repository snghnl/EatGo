import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/TopBar';
import SearchBar from '@/components/SearchBar';
import FloatingButton from '@/components/main/FloatingButton';
import PlaceCardSwiper from '@/components/main/PlaceCardSwiper';

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
    const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);
    const [buttonAnimation] = useState(new Animated.Value(1));
    const [swiperAnimation] = useState(new Animated.Value(0));

    const handleSelectItem = (item: PlaceItem) => {
        console.log('Selected:', item.place_name);
    };

    const handleFloatingButtonPress = () => {
        console.log('FloatingButton pressed');
        setShowPlaceCardSwiper(true);

        // 버튼 사라지는 애니메이션
        Animated.timing(buttonAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // 스와이퍼 올라오는 애니메이션
        Animated.timing(swiperAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleClosePlaceCardSwiper = () => {
        // 스와이퍼 내려가는 애니메이션
        Animated.timing(swiperAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowPlaceCardSwiper(false);
        });

        // 버튼 나타나는 애니메이션
        Animated.timing(buttonAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    // 버튼 애니메이션 스타일
    const buttonAnimatedStyle = {
        opacity: buttonAnimation,
        transform: [
            {
                translateY: buttonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                }),
            },
            {
                scale: buttonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                }),
            },
        ],
    };

    // 스와이퍼 애니메이션 스타일
    const swiperAnimatedStyle = {
        opacity: swiperAnimation,
        transform: [
            {
                translateY: swiperAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                }),
            },
        ],
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <View style={styles.searchWrapper}>
                    <SearchBar searchData={mockData.documents} onSelectItem={handleSelectItem} />
                </View>
                <View style={styles.topBarWrapper}>
                    <TopBar />
                </View>
            </View>

            <View style={[styles.content, showPlaceCardSwiper && { pointerEvents: 'none' }]}>
                <Text style={styles.subtitle}>지도 화면이 여기에 표시됩니다.</Text>
                <Text style={styles.debug}>Debug: Screen is rendering</Text>
            </View>

            {!showPlaceCardSwiper && (
                <Animated.View style={buttonAnimatedStyle}>
                    <FloatingButton onPress={handleFloatingButtonPress} style={{ bottom: 80 }} />
                </Animated.View>
            )}

            {showPlaceCardSwiper && (
                <Animated.View style={swiperAnimatedStyle}>
                    <PlaceCardSwiper onClose={handleClosePlaceCardSwiper} />
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerWrapper: {
        paddingTop: 10,
        paddingHorizontal: 20,
        zIndex: 100,
    },
    searchWrapper: {
        marginBottom: 0,
    },
    topBarWrapper: {
        marginTop: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    debug: {
        fontSize: 14,
        color: Colors.primary,
        textAlign: 'center',
    },
});
