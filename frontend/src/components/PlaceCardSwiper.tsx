import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Linking, GestureResponderEvent } from 'react-native';
import Swiper from 'react-native-swiper';
import placesData from '../../mock-data/places.json';

const { width } = Dimensions.get('window');

interface Props {
    onClose: () => void;
}

export default function PlaceCardSwiper({ onClose }: Props) {
    const touchStartY = useRef(0);

    const handleTouchStart = (e: GestureResponderEvent) => {
        touchStartY.current = e.nativeEvent.pageY;
    };

    const handleTouchEnd = (e: GestureResponderEvent) => {
        const touchEndY = e.nativeEvent.pageY;
        const deltaY = touchEndY - touchStartY.current;
        if (deltaY > 40) {
            onClose(); // 아래로 40px 이상 스와이프하면 닫기
        }
    };

    const places = placesData.documents;

    return (
        <View style={styles.container} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <Swiper
                showsPagination={false}
                loop={false}
                autoplay={false}
                showsButtons={true}
                buttonWrapperStyle={styles.buttonWrapper}
                nextButton={<Text style={styles.arrow}>›</Text>}
                prevButton={<Text style={styles.arrow}>‹</Text>}
            >
                {places.map((place) => (
                    <View key={place.id} style={styles.card}>
                        <Image
                            source={{
                                uri: `https://source.unsplash.com/featured/?food,restaurant,${encodeURIComponent(
                                    place.place_name
                                )}`,
                            }}
                            style={styles.image}
                        />
                        <View style={styles.infoBlock}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.title}>{place.place_name}</Text>
                                <Text style={styles.more} onPress={() => Linking.openURL(place.place_url)}>
                                    더보기 ›
                                </Text>
                            </View>
                            <Text style={styles.sub}>{place.category_name}</Text>
                            <Text style={styles.text}>전화번호: {place.phone || '정보 없음'}</Text>
                            <Text style={styles.text}>주소: {place.road_address_name}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>푸짐한 인심</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>인기 음식</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </Swiper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        bottom: 34,
        position: 'absolute',
        height: 170,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: 326,
        height: 135,
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'row',
        padding: 15,
        marginHorizontal: (width - 326) / 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    image: {
        width: 100,
        height: '100%',
        borderRadius: 10,
    },
    infoBlock: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sub: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2,
    },
    text: {
        fontSize: 12,
        color: '#444',
    },
    more: {
        fontSize: 12,
        color: '#999',
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 6,
    },
    badge: {
        backgroundColor: '#f8f8f8',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 10,
        color: '#e94e77',
        fontWeight: '500',
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 135,
    },
    arrow: {
        fontSize: 47,
        color: '#e94e77',
        fontWeight: 'bold',
        borderRadius: 999,
    },
});
