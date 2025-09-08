import React, { useState, useRef } from "react";
import {
    TextInput,
    StyleSheet,
    Text,
    Keyboard,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter, useFocusEffect } from "expo-router";
import { Place } from "@/src/client/types.gen";
import { KakaoMapApi } from "@/src/client/sdk.gen";
import { geolocationService } from "@/services/geolocationService";

interface SearchBarProps {
    onSelectItem?: (item: Place) => void;
    mapCenter?: { lat: number; lng: number } | null;
}

export default function SearchBar({
    onSelectItem,
    mapCenter,
}: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const textInputRef = useRef<TextInput>(null);

    // 페이지에 focus가 돌아왔을 때 search input 초기화
    useFocusEffect(
        React.useCallback(() => {
            setSearchTerm("");
        }, [])
    );

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            Keyboard.dismiss();

            // Use map center coordinates if available, fallback to device location
            let searchLocation;
            if (mapCenter) {
                searchLocation = {
                    longitude: mapCenter.lng,
                    latitude: mapCenter.lat,
                };
            } else {
                searchLocation = await geolocationService
                    .getCurrentPosition()
                    .then((location) => {
                        return location.coordinates;
                    })
                    .catch((error) => {
                        console.error(error);
                        return { longitude: 126.9786567, latitude: 37.566826 }; // Seoul default
                    });
            }

            const searchedResults = await KakaoMapApi.kakaoSearchKeywordList({
                query: {
                    query: searchTerm.trim(),
                    x: searchLocation.longitude,
                    y: searchLocation.latitude,
                },
            })
                .then((response) => {
                    console.log(response.data?.documents);
                    return response.data?.documents || [];
                })
                .catch((error) => {
                    console.error(error);
                    return [];
                });

            router.push({
                pathname: "/(tabs)/map/placelist/searchresult",
                params: {
                    query: searchTerm.trim(),
                    results: JSON.stringify(searchedResults),
                    centerLat: searchLocation.latitude.toString(),
                    centerLng: searchLocation.longitude.toString(),
                },
            });
        }
    };

    const handleSubmitEditing = () => {
        handleSearch();
    };

    const handleContainerPress = () => {
        textInputRef.current?.focus();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleContainerPress}
            activeOpacity={1}
        >
            <TextInput
                ref={textInputRef}
                placeholder="지역, 맛집 등을 검색하세요"
                placeholderTextColor="#C7C7C7"
                style={styles.input}
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSubmitEditing}
                returnKeyType="search"
                selectionColor="transparent"
            />
            <Text style={styles.separator}>|</Text>
            <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}
            >
                <Ionicons name="search" size={25} color="#C7C7C7" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 51,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFCFC",
        borderRadius: 10,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    separator: {
        fontSize: 25,
        color: "#C7C7C7",
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    searchButton: {
        padding: 5,
    },
});
