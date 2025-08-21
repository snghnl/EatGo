import React from 'react';
import { useBookmark } from '@/app/BookmarkContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PlaceCard } from '@/components/main/PlaceCard';
import placesData from '@/mock-data/places.json';
import { Colors } from '@/constants/Colors';
import Header from '@/components/common/Header';

const titleMap: Record<string, { title: string; subtitle: string }> = {
    local: {
        title: '지역의 맛과 정취',
        subtitle: '지역 속 맛과 멋을 따라서',
    },
    landmark: {
        title: '지역 명소 탐방',
        subtitle: '놓치면 아쉬운 명소들',
    },
    recommend: {
        title: '현지인 추천 맛집 리스트',
        subtitle: '믿고 가는 추천 장소들만 담았어요',
    },
};

export default function PlaceListScreen() {
    const { category } = useLocalSearchParams<{ category: string }>();

    const { bookmarkedPlaceIds, toggleBookmark } = useBookmark();

    const documents = placesData.documents;
    const current = titleMap[category] || {
        title: '',
        subtitle: '',
    };

    // 카테고리 필터링 로직 (예시: local이면 한식, recommend면 인기순)
    const filtered = documents.filter((place) => {
        if (category === 'local') return place.category_name.includes('한식');
        if (category === 'landmark') return place.category_name.includes('명소'); // 명소 없음 → 나중에 관광데이터로 대체 가능
        if (category === 'recommend') return true; // 추천 전체 보기
        return false;
    });

    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 50, left: 10, zIndex: 10 }}>
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.push('/(tabs)/map')}
                />
            </View>
            <View style={styles.header}>
                {
                    <Header
                        title={current.title}
                        subtitle={current.subtitle}
                        titleColor={Colors.textPrimary}
                        subtitleColor={Colors.textSecondary}
                        align="left"
                    />
                }
            </View>
            <FlatList
                data={filtered}
                keyExtractor={(place) => place.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <PlaceCard
                        id={item.id}
                        name={item.place_name}
                        category={item.category_name}
                        address={item.road_address_name}
                        distance={item.distance || ''}
                        description={item.category_name.split(' > ').pop() || ''}
                        imageUrl={'https://source.unsplash.com/random/300x300?food'}
                        isBookmarked={bookmarkedPlaceIds.includes(item.id)}
                        onBookmark={() => toggleBookmark(item.id)}
                        onPress={() => router.push(`/map/place/${item.id}/detail`)}
                    />
                )}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 20,
    },
    header: {
        width: '100%',
        backgroundColor: Colors.background,
        paddingHorizontal: 0,
        paddingTop: 20,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
