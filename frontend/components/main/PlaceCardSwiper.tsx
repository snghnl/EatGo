import React, { useRef, useCallback } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    Linking,
    GestureResponderEvent,
    TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import placesData from "@/mock-data/places.json";
import { useRouter } from "expo-router";

// Constants
const { width } = Dimensions.get("window");
const SWIPER_CONFIG = {
    HEIGHT: 135,
    CARD_HEIGHT: 140,
    CARD_WIDTH: width - 40,
    DRAG_THRESHOLD: 3,
    CLOSE_THRESHOLD: 15,
    MAX_PLACES: 5,
} as const;

const STYLES = {
    ARROW_SIZE: 40,
    DRAG_INDICATOR_WIDTH: 40,
    DRAG_INDICATOR_HEIGHT: 4,
    IMAGE_SIZE: 100,
    IMAGE_HEIGHT: 110,
} as const;

// Types
interface Place {
    id: string;
    place_name: string;
    category_name: string;
    road_address_name: string;
    phone: string;
    place_url: string;
}

interface Props {
    onClose: () => void;
    onPlaceSelect?: (selectedPlace: Place) => void;
}

export default function PlaceCardSwiper({ onClose, onPlaceSelect }: Props) {
    const touchStartY = useRef(0);
    const isDragging = useRef(false);
    const router = useRouter();

    const places = placesData.documents.slice(0, SWIPER_CONFIG.MAX_PLACES);

    const handleTouchStart = useCallback((e: GestureResponderEvent) => {
        touchStartY.current = e.nativeEvent.pageY;
        isDragging.current = false;
        console.log("Touch start Y:", touchStartY.current);
    }, []);

    const handleTouchMove = useCallback((e: GestureResponderEvent) => {
        const currentY = e.nativeEvent.pageY;
        const deltaY = currentY - touchStartY.current;
        if (Math.abs(deltaY) > SWIPER_CONFIG.DRAG_THRESHOLD) {
            isDragging.current = true;
        }
    }, []);

    const handleTouchEnd = useCallback(
        (e: GestureResponderEvent) => {
            if (!isDragging.current) return;

            const touchEndY = e.nativeEvent.pageY;
            const deltaY = touchEndY - touchStartY.current;
            console.log("Touch delta Y:", deltaY);

            if (deltaY > SWIPER_CONFIG.CLOSE_THRESHOLD) {
                console.log("Closing swiper via touch");
                onClose();
            }
            isDragging.current = false;
        },
        [onClose]
    );

    const handleCardPress = useCallback(
        (place: Place) => {
            console.log("Card pressed:", place.place_name);
            router.push(`/place/${place.id}/detail`);
        },
        [router]
    );

    const handleMorePress = useCallback((placeUrl: string) => {
        Linking.openURL(placeUrl);
    }, []);

    const renderPlaceCard = useCallback(
        (place: Place, index: number) => (
            <View key={`${place.id}-${index}`} style={styles.cardWrapper}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleCardPress(place)}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{
                            uri: `https://source.unsplash.com/300x300/?food,restaurant&sig=${index}`,
                        }}
                        style={styles.image}
                    />
                    <View style={styles.infoBlock}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title} numberOfLines={1}>
                                {place.place_name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleMorePress(place.place_url)}
                            >
                                <Text style={styles.more}>더보기 ›</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.sub} numberOfLines={1}>
                            {place.category_name}
                        </Text>
                        <Text style={styles.text} numberOfLines={1}>
                            전화번호: {place.phone || "정보 없음"}
                        </Text>
                        <Text style={styles.text} numberOfLines={1}>
                            주소: {place.road_address_name}
                        </Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    푸짐한 인심
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>인기 음식</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        ),
        [handleCardPress, handleMorePress]
    );

    return (
        <View style={styles.container}>
            <View
                style={styles.dragHandle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <View style={styles.dragIndicator} />
                <Text style={styles.dragText}>아래로 드래그해서 닫기</Text>
            </View>

            <View style={styles.swiperWrapper}>
                <Swiper
                    style={styles.swiperContainer}
                    showsPagination={false}
                    paginationStyle={styles.pagination}
                    dotStyle={styles.dot}
                    activeDotStyle={styles.activeDot}
                    loop={false}
                    autoplay={false}
                    showsButtons={true}
                    buttonWrapperStyle={styles.buttonWrapper}
                    nextButton={<Text style={styles.arrow}>›</Text>}
                    prevButton={<Text style={styles.arrow}>‹</Text>}
                    removeClippedSubviews={false}
                    height={SWIPER_CONFIG.HEIGHT}
                >
                    {places.map((place, index) =>
                        renderPlaceCard(place, index)
                    )}
                </Swiper>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: "transparent",
        zIndex: 1000,
    },
    dragHandle: {
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    dragIndicator: {
        width: STYLES.DRAG_INDICATOR_WIDTH,
        height: STYLES.DRAG_INDICATOR_HEIGHT,
        backgroundColor: "#ccc",
        borderRadius: 2,
    },
    dragText: {
        fontSize: 10,
        color: "#888",
        marginTop: 3,
    },
    swiperWrapper: {
        flex: 1,
    },
    swiperContainer: {
        height: SWIPER_CONFIG.HEIGHT,
    },
    cardWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    pagination: {
        bottom: 10,
    },
    dot: {
        backgroundColor: "rgba(255,255,255,.3)",
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 3,
        marginRight: 3,
    },
    activeDot: {
        backgroundColor: "#e94e77",
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 3,
        marginRight: 3,
    },
    card: {
        width: SWIPER_CONFIG.CARD_WIDTH,
        height: SWIPER_CONFIG.CARD_HEIGHT,
        backgroundColor: "#fff",
        borderRadius: 10,
        flexDirection: "row",
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    image: {
        width: STYLES.IMAGE_SIZE,
        height: STYLES.IMAGE_HEIGHT,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
    },
    infoBlock: {
        flex: 1,
        marginLeft: 10,
        justifyContent: "space-between",
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 17,
        fontWeight: "bold",
        flex: 1,
        marginRight: 10,
    },
    sub: {
        color: "#888",
        fontSize: 12,
        marginBottom: 2,
    },
    text: {
        fontSize: 12,
        color: "#444",
        marginBottom: 1,
    },
    more: {
        fontSize: 12,
        color: "#e94e77",
        fontWeight: "500",
    },
    badgeRow: {
        flexDirection: "row",
        marginTop: 4,
        gap: 6,
    },
    badge: {
        backgroundColor: "#f8f8f8",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 10,
        color: "#e94e77",
        fontWeight: "500",
    },
    buttonWrapper: {
        alignItems: "center",
        justifyContent: "space-between",
        height: SWIPER_CONFIG.CARD_HEIGHT,
        paddingHorizontal: 10,
    },
    arrow: {
        fontSize: STYLES.ARROW_SIZE,
        color: "#e94e77",
        fontWeight: "bold",
    },
});
