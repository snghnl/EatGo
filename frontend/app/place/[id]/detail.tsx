// app/place/[id]/detail.tsx
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PlaceHeader } from '@/components/main/place/PlaceHeader';
import { PlaceImageGallery } from '@/components/main/place/PlaceImage';
import { PlaceInfo } from '@/components/main/place/PlaceInfo';
import { PlaceMenu } from '@/components/main/place/PlaceMenu';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import placesData from '@/mock-data/places.json';
import { CourseListExample } from '@/components/plan';

export default function PlaceDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [isBookmarked, setIsBookmarked] = useState(false);

    const place = placesData.documents.find((item) => item.id === id);

    if (!place) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <ThemedText size="lg" weight="bold">
                        존재하지 않는 장소입니다.
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Mock additional data for display
    const mockMenuItems = [
        {
            id: '1',
            place_id: place.id,
            name: '특등심 로스 가츠',
            price: 19900,
            description: '최고급 등심으로 만든 돈카츠',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            is_active: true,
        },
        {
            id: '2',
            place_id: place.id,
            name: '특등심 로스 가츠',
            price: 19900,
            description: '최고급 등심으로 만든 돈카츠',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            is_active: true,
        },
        {
            id: '3',
            place_id: place.id,
            name: '특등심 로스 가츠',
            price: 19900,
            description: '최고급 등심으로 만든 돈카츠',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            is_active: true,
        },
    ];

    const mockImages = [
        'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=Image1',
        'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=Image2',
        'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=Image3',
    ];

    // Get other places as recommendations (excluding current place)
    const recommendations = placesData.documents.filter((item) => item.id !== place.id).slice(0, 3);

    const handleBackPress = () => {
        router.back();
    };

    const handleBookmarkPress = () => {
        setIsBookmarked(!isBookmarked);
        // TODO: Implement bookmark API call
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <PlaceHeader
                    placeName={place.place_name}
                    category={place.category_name}
                    distance={place.distance || '2.3'}
                    address={place.road_address_name}
                    imageUrl={place.image_url}
                    onBackPress={handleBackPress}
                    onBookmarkPress={handleBookmarkPress}
                    isBookmarked={isBookmarked}
                />
                <PlaceImageGallery images={mockImages} />
                <View style={styles.separator} />
                <PlaceInfo place={place} />
                <View style={styles.separator} />

                <PlaceMenu menuItems={mockMenuItems} />
                <View style={styles.separator} />

                <View style={styles.titleWrapper}>
                    <ThemedText size="lg" weight="bold" style={styles.title}>
                        다른 여행객분들은{'\n'}
                        <ThemedText size="lg" weight="bold" style={styles.title}>
                            <ThemedText size="lg" color="primary" weight="bold">
                                이 코스
                            </ThemedText>
                            로 방문하셨어요
                        </ThemedText>
                    </ThemedText>
                </View>
                <CourseListExample />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.listbackground,
    },
    scrollView: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    separator: {
        height: 8,
        backgroundColor: '#F5F5F5',
    },
    titleWrapper: {
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 20,
        backgroundColor: Colors.listbackground,
    },
    title: {
        justifyContent: 'center',
    },
});
