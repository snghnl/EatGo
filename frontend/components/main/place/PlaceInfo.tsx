import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { PlaceDetail } from '@/types/place';
import { ThemedText } from '../../ThemedText';

interface PlaceInfoProps {
    place: PlaceDetail;
}

export const PlaceInfo: React.FC<PlaceInfoProps> = ({ place }) => {
    const handlePhonePress = () => {
        if (place.phone) {
            Linking.openURL(`tel:${place.phone}`);
        }
    };

    const handleWebsitePress = () => {
        if (place.place_url) {
            Linking.openURL(place.place_url);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.labelPill}>
                    <ThemedText size="sm" weight="semibold" style={styles.labelText}>
                        운영시간
                    </ThemedText>
                </View>
                <View style={styles.valueBlock}>
                    <ThemedText size="sm" style={styles.infoValue}>
                        12:00~19:00
                    </ThemedText>
                    <ThemedText size="sm" style={styles.infoValue}>
                        브레이크 타임 - 16:00~17:30
                    </ThemedText>
                    <ThemedText size="sm" style={styles.infoValue}>
                        휴무일 - 월요일, 수요일
                    </ThemedText>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.labelPill}>
                    <ThemedText size="sm" weight="semibold" style={styles.labelText}>
                        전화번호
                    </ThemedText>
                </View>
                <View style={styles.valueBlock}>
                    <TouchableOpacity onPress={handlePhonePress}>
                        <ThemedText size="sm" style={[styles.infoValue, styles.linkText]}>
                            {place.phone || '00-0000-0000'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.labelPill}>
                    <ThemedText size="sm" weight="semibold" style={styles.labelText}>
                        사이트
                    </ThemedText>
                </View>
                <View style={styles.valueBlock}>
                    <TouchableOpacity onPress={handleWebsitePress}>
                        <ThemedText size="sm" style={[styles.infoValue, styles.linkText]}>
                            {place.place_url || 'http://00000000.com'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.labelPill}>
                    <ThemedText size="sm" weight="semibold" style={styles.labelText}>
                        평점
                    </ThemedText>
                </View>
                <View style={styles.valueBlock}>
                    <ThemedText size="sm" style={styles.infoValue}>
                        {place.rating || 4.9} / 5.0
                    </ThemedText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: Colors.listbackground,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },

    labelPill: {
        width: 89,
        height: 26,
        backgroundColor: Colors.background,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 76,
    },

    labelText: {
        color: Colors.textPrimary,
        textAlign: 'center',
    },

    valueBlock: {
        flex: 1,
        marginLeft: 16,
    },
});
