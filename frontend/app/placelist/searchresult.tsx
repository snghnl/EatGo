import React, { useState, useEffect } from 'react';
import { useBookmark } from '@/app/BookmarkContext';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlaceCard } from '@/components/main/PlaceCard';
import placesData from '@/mock-data/places.json';
import { Colors } from '@/constants/Colors';
import Header from '@/components/common/Header';

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

export default function SearchResultScreen() {
    const { query } = useLocalSearchParams<{ query: string }>();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<PlaceItem[]>([]);

    useEffect(() => {
        if (query) {
            const term = query.toLowerCase();
            const filtered = placesData.documents.filter((item) => {
                return (
                    item.place_name.toLowerCase().includes(term) ||
                    item.category_name.toLowerCase().includes(term) ||
                    item.address_name.toLowerCase().includes(term) ||
                    item.road_address_name.toLowerCase().includes(term)
                );
            });
            setSearchResults(filtered);
        }
    }, [query]);

    const { bookmarkedPlaceIds, toggleBookmark } = useBookmark();
    return (
        <View style={styles.container}>
            <FlatList
                data={searchResults}
                keyExtractor={(place) => place.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Header
                        title={`"${query}" 검색 결과`}
                        subtitle={`${searchResults.length}개의 장소`}
                        titleColor={Colors.textPrimary}
                        subtitleColor={Colors.textSecondary}
                        align="left"
                    />
                }
                renderItem={({ item }) => (
                    <PlaceCard
                        id={item.id}
                        name={item.place_name}
                        category={item.category_name}
                        address={item.road_address_name}
                        distance={item.distance || ''}
                        description={item.category_name.split(' > ').pop() || ''}
                        imageUrl="https://source.unsplash.com/random/300x300?food"
                        isBookmarked={bookmarkedPlaceIds.includes(item.id)}
                        onBookmark={() => toggleBookmark(item.id)}
                        onPress={() => router.push(`/place/${item.id}/detail`)}
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
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
