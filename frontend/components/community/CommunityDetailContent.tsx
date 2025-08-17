import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface CommunityDetailContentProps {
    dateRange: string;
    location: string;
    content: string;
}

export function CommunityDetailContent({ dateRange, location, content }: CommunityDetailContentProps) {
    return (
        <View style={styles.contentContainer}>
            <ThemedText size="sm" color="textSecondary" style={{ marginBottom: 2 }}>
                {dateRange}
            </ThemedText>
            <ThemedText size="sm" color="primary" style={{ marginBottom: 8 }}>
                {location}
            </ThemedText>
            <ThemedText size="base" style={{ marginBottom: 16 }}>
                {content}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        marginBottom: 16,
    },
});
