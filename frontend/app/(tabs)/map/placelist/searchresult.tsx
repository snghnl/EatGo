import React, { useState, useEffect } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchListItem from "@/components/SearchListItem";
import placesData from "@/mock-data/places.json";
import { Place } from "@/src/client/types.gen";
import { Colors } from "@/constants/Colors";
import Header from "@/components/common/Header";
import { Ionicons } from "@expo/vector-icons";

export default function SearchResultScreen() {
    const { query, results, centerLat, centerLng } = useLocalSearchParams<{
        query: string;
        results: string;
        centerLat: string;
        centerLng: string;
    }>();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<Place[]>([]);

    // Parse center coordinates
    const centerCoords =
        centerLat && centerLng
            ? {
                  latitude: parseFloat(centerLat),
                  longitude: parseFloat(centerLng),
              }
            : null;

    useEffect(() => {
        if (results) {
            // Use passed API results
            try {
                const parsedResults = JSON.parse(results);
                // Convert Kakao API response to Place type
                const convertedResults: Place[] = parsedResults.map(
                    (item: any) => ({
                        id: item.id,
                        name: item.place_name,
                        place_type: item.category_name as Place["place_type"],
                        address: item.address_name,
                        road_address: item.road_address_name,
                        lat: parseFloat(item.y) || 0,
                        lng: parseFloat(item.x) || 0,
                        external_id: item.id,
                        external_url: item.place_url,
                    })
                );
                setSearchResults(convertedResults);
            } catch (error) {
                console.error("Failed to parse search results:", error);
                setSearchResults([]);
            }
        } else if (query) {
            // Fallback to mock data filtering
            const term = query.toLowerCase();
            const filtered = placesData.documents.filter((item) => {
                return (
                    item.place_name.toLowerCase().includes(term) ||
                    item.category_name.toLowerCase().includes(term) ||
                    item.address_name.toLowerCase().includes(term) ||
                    item.road_address_name.toLowerCase().includes(term)
                );
            });
            // Convert mock data to Place type
            const convertedResults: Place[] = filtered.map((item) => ({
                id: item.id,
                name: item.place_name,
                place_type: item.category_name as Place["place_type"],
                address: item.address_name,
                road_address: item.road_address_name,
                lat: parseFloat(item.y) || 0,
                lng: parseFloat(item.x) || 0,
                external_id: item.id,
            }));
            setSearchResults(convertedResults);
        }
    }, [query, results]);
    return (
        <SafeAreaView style={styles.containers}>
            <View
                style={{
                    position: "absolute",
                    top: 60,
                    left: 15,
                    zIndex: 10,
                }}
            >
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.back()}
                />
            </View>
            <FlatList
                data={searchResults}
                keyExtractor={(place) => place.id || ""}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Header
                            title={`"${query}" 검색 결과`}
                            subtitle={`${searchResults.length}개의 장소`}
                            titleColor={Colors.textPrimary}
                            subtitleColor={Colors.textSecondary}
                            align="left"
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <SearchListItem
                        item={item}
                        centerCoords={centerCoords}
                        onSelectItem={(selectedItem) => {
                            if (selectedItem.external_url) {
                                Linking.openURL(selectedItem.external_url);
                            }
                            // TODO: route detail page
                            // router.push({
                            //     pathname: "/(tabs)/map/place/[id]/detail",
                            //     params: { id: selectedItem.id || "" },
                            // });
                        }}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containers: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        width: "100%",
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingHorizontal: 16,
        padding: 16,
    },
});
