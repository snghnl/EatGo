import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { ThemedText } from '../../ThemedText';
import { BookmarkButton } from '../BookmarkButton';

interface PlaceHeaderProps {
    placeName: string;
    category: string;
    distance: string;
    address?: string;
    isOpenNow?: boolean;
    onBookmarkPress: () => void;
    isBookmarked: boolean;
}

export const PlaceHeader: React.FC<PlaceHeaderProps> = ({
    placeName,
    category,
    distance,
    address,
    onBookmarkPress,
    isBookmarked,
    isOpenNow = false,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ThemedText weight="bold" style={styles.category}>
                    {category}
                </ThemedText>
                <BookmarkButton
                    isBookmarked={isBookmarked}
                    onPress={onBookmarkPress}
                    style={styles.bookmarkButton}
                    size={25}
                />
                <ThemedText size="2xl" weight="bold" style={styles.placeName}>
                    {placeName}
                </ThemedText>

                <View style={styles.metaInfo}>
                    {isOpenNow !== undefined && (
                        <ThemedText
                            type="body"
                            style={{ color: isOpenNow ? Colors.textPrimary : 'gray', fontWeight: '600' }}
                        >
                            {isOpenNow ? '영업중' : '영업 종료'}
                        </ThemedText>
                    )}
                    {address && (
                        <ThemedText type="body" style={styles.address} numberOfLines={1}>
                            {address}
                        </ThemedText>
                    )}
                    <View style={styles.rowBetween}>
                        <Text style={styles.distance}>
                            <ThemedText weight="bold">전주역</ThemedText>
                            에서 {distance} km
                        </Text>
                        <TouchableOpacity style={styles.addRouteButton}>
                            <ThemedText size="sm">+ 여행경로 추가</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.listbackground,
    },
    backButton: {
        marginRight: 16,
        marginTop: 4,
    },
    content: {
        flex: 1,
    },
    category: {
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    placeName: {
        marginBottom: 8,
    },
    metaInfo: {
        margin: 0,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    distance: {
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    directionsLink: {
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
    addRouteButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.textSecondary,
    },
    address: {
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    bookmarkButton: {
        marginLeft: 16,
        marginTop: 4,
    },
});
