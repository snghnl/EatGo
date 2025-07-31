import React, { useState } from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { Colors } from "@/constants/Colors";
import TopBar from "@/components/TopBar";
import SearchBar from "@/components/SearchBar";
import FloatingButton from "@/components/FloatingButton";
import PlaceCardSwiper from "@/components/PlaceCardSwiper";

// MOCK DATA
import mockData from "@/mock-data/places.json";

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

    const handleSelectItem = (item: PlaceItem) => {
        console.log("Selected:", item.place_name);
    };

    const handleFloatingButtonPress = () => {
        console.log("FloatingButton pressed");
        setShowPlaceCardSwiper(true);
    };

    const handleClosePlaceCardSwiper = () => {
        setShowPlaceCardSwiper(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <View style={styles.searchWrapper}>
                    <SearchBar
                        searchData={mockData.documents}
                        onSelectItem={handleSelectItem}
                    />
                </View>
                <View style={styles.topBarWrapper}>
                    <TopBar />
                </View>
            </View>

            <View
                style={[
                    styles.content,
                    showPlaceCardSwiper && { pointerEvents: "none" },
                ]}
            >
                <Text style={styles.subtitle}>
                    지도 화면이 여기에 표시됩니다.
                </Text>
            </View>

            {!showPlaceCardSwiper && (
                <FloatingButton
                    onPress={handleFloatingButtonPress}
                    style={{ bottom: 100 }}
                />
            )}

            {showPlaceCardSwiper && (
                <PlaceCardSwiper onClose={handleClosePlaceCardSwiper} />
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
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 16,
    },
    debug: {
        fontSize: 14,
        color: Colors.primary,
        textAlign: "center",
    },
});
