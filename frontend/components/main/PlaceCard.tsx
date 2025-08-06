import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BookmarkButton } from '@/components/main/BookmarkButton';

export interface PlaceCardProps {
    id: string;
    isSaved?: boolean;
    imageUrl: string;
    category: string;
    name: string;
    distance: string;
    address: string;
    description: string;
    onPress?: (placeId: string) => void;
    onBookmark?: () => void;
    isBookmarked?: boolean;
}
export const PlaceCard: React.FC<PlaceCardProps> = ({
    id,
    name,
    category,
    distance,
    address,
    description,
    imageUrl,
    onPress,
    onBookmark,
    isBookmarked = false,
    isSaved = false,
}) => {
    const [bookmarked, setBookmarked] = useState(isBookmarked);

    const handleBookmarkPress = () => {
        setBookmarked((prev) => !prev);
        onBookmark?.();
    };

    return (
        <TouchableOpacity
            style={[styles.card, isSaved && styles.savedCard]}
            onPress={() => onPress?.(id)}
            activeOpacity={0.9}
        >
            <BookmarkButton isBookmarked={bookmarked} onPress={handleBookmarkPress} />

            <Image
                source={{
                    uri: imageUrl || 'https://source.unsplash.com/random/300x300?food',
                }}
                style={styles.image}
            />
            <View style={styles.info}>
                <ThemedText size="xs" color="dim">
                    {category.split(' > ').slice(1).join(' > ')}
                </ThemedText>

                <ThemedText size="lg" weight="bold" style={styles.name}>
                    {name}
                </ThemedText>

                <ThemedText size="sm" color="default">
                    {distance} · {address}
                </ThemedText>

                <ThemedText size="sm" color="default" numberOfLines={1}>
                    {description}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 12,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        alignItems: 'flex-start',
        width: '100%',
        minHeight: 131,
    },

    image: {
        width: 111,
        height: 111,
        borderRadius: 8,
        backgroundColor: Colors.backgroundGray,
        marginRight: 15,
    },
    info: {
        flex: 1,
        gap: 4,
        justifyContent: 'flex-start',
    },
    name: {
        marginTop: 2,
        marginBottom: 4,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
});
