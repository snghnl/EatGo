import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import placesData from '@/mock-data/places.json';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

export default function PlaceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const place = placesData.documents.find((item) => item.id === id);

    if (!place) {
        return (
            <View style={styles.container}>
                <ThemedText size="lg" weight="bold">
                    존재하지 않는 장소입니다.
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ThemedText size="2xl" weight="bold">
                {place.place_name}
            </ThemedText>
            <ThemedText size="base" color="dim">
                {place.category_name}
            </ThemedText>
            <ThemedText size="sm" color="dim">
                {place.road_address_name}
            </ThemedText>
            <ThemedText size="sm" color="dim">
                {place.phone}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: Colors.background,
    },
});
