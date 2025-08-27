import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface CommunityDetailRouteProps {
    title: string;
    places: string[];
}

export function CommunityDetailRoute({ title, places }: CommunityDetailRouteProps) {
    return (
        <View style={styles.routeContainer}>
            <ThemedText size="sm" color="textSecondary" style={{ marginBottom: 4 }}>
                여행코스톡 제목
            </ThemedText>
            <ThemedText size="lg" weight="bold" color="primary" style={{ marginBottom: 8 }}>
                {title}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    routeContainer: {
        marginTop: 24,
        marginBottom: 16,
    },
    routeBox: {
        backgroundColor: Colors.backgroundGray,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeItem: {
        marginRight: 8,
    },
});
