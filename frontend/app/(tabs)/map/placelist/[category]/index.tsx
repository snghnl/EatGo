import React from "react";
import { useBookmark } from "@/store/BookmarkContext";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
    View,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { PlaceCard } from "@/components/main/PlaceCard";
import placesData from "@/mock-data/places.json";
import { Colors } from "@/constants/Colors";
import Header from "@/components/common/Header";

const titleMap: Record<string, { title: string; subtitle: string }> = {
    local: {
        title: "지역의 맛과 정취",
        subtitle: "지역 속 맛과 멋을 따라서",
    },
    landmark: {
        title: "지역 명소 탐방",
        subtitle: "놓치면 아쉬운 명소들",
    },
    recommend: {
        title: "현지인 추천 맛집 리스트",
        subtitle: "믿고 가는 추천 장소들만 담았어요",
    },
};

export default function PlaceListScreen() {
    const { category } = useLocalSearchParams<{ category: string }>();
    const { bookmarkedPlaceIds, toggleBookmark } = useBookmark();

    const documents = placesData.documents;
    const current = titleMap[category] || {
        title: "",
        subtitle: "",
    };

    const filtered = documents.filter((place) => {
        if (category === "local") return place.category_name.includes("한식");
        if (category === "landmark")
            return place.category_name.includes("명소");
        if (category === "recommend") return true;
        return false;
    });

    return (
        <SafeAreaView style={styles.containers}>
            <View
                style={{
                    position: "absolute",
                    top: 20,
                    left: 15,
                    zIndex: 10,
                }}
            >
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.push("/(tabs)/map")}
                />
            </View>
            <FlatList
                data={filtered}
                keyExtractor={(place) => place.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Header
                            title={current.title}
                            subtitle={current.subtitle}
                            titleColor={Colors.textPrimary}
                            subtitleColor={Colors.textSecondary}
                            align="left"
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <PlaceCard
                        id={item.id}
                        name={item.place_name}
                        category={item.category_name}
                        address={item.road_address_name}
                        distance={item.distance || ""}
                        description={
                            item.category_name.split(" > ").pop() || ""
                        }
                        imageUrl={
                            "https://source.unsplash.com/random/300x300?food"
                        }
                        isBookmarked={bookmarkedPlaceIds.includes(
                            item.id
                        )}
                        onBookmark={() => toggleBookmark(item.id)}
                        onPress={() =>
                            router.push(`/map/place/${item.id}/detail`)
                        }
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
