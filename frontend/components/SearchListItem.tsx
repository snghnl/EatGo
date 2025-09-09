import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Place } from "@/src/client/types.gen";

interface SearchListItemProps {
    item: Place;
    onSelectItem?: (item: Place) => void;
    centerCoords?: { latitude: number; longitude: number } | null;
}

export default function SearchListItem({
    item,
    onSelectItem,
    centerCoords,
}: SearchListItemProps) {
    const router = useRouter();

    // Calculate distance from center coordinates if available
    const calculateDistance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): string => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        } else {
            return `${distance.toFixed(1)}km`;
        }
    };

    const distance =
        centerCoords && item.lat && item.lng
            ? calculateDistance(
                  centerCoords.latitude,
                  centerCoords.longitude,
                  item.lat,
                  item.lng
              )
            : null;

    const handlePress = () => {
        console.log(
            "SearchListItem pressed:",
            item.name,
            item.id,
            item.external_url || "No external URL"
        );
        onSelectItem?.(item);

        if (item.external_url) {
            Linking.openURL(item.external_url);
        }
        // TODO: route detail page
        // router.push({
        //     pathname: "/(tabs)/map/place/[id]/detail",
        //     params: { id: item.id || "" },
        // });
    };

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
            <View style={styles.row}>
                <FontAwesome
                    name="map-marker"
                    size={20}
                    color={Colors.primary}
                    style={styles.icon}
                />
                <View style={styles.leftContent}>
                    <Text
                        style={styles.itemCategory}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.place_type}
                    </Text>
                    <Text
                        style={styles.itemTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.name}
                    </Text>
                </View>
                <View style={styles.rightContent}>
                    <Text
                        style={styles.itemAddress}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.road_address}
                    </Text>
                    <Text
                        style={styles.itemDistance}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {distance || item.address}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    rightContent: {
        alignItems: "flex-end",
        minWidth: 80,
        maxWidth: "40%",
        flex: 0.4,
    },
    icon: {
        marginRight: 12,
        marginTop: 4,
    },
    itemCategory: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    itemAddress: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: "right",
    },
    itemDistance: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: "right",
        marginTop: 2,
    },
});
