import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';

const categories = [
    {
        key: 'local',
        label: '지역의 맛과 정취',
        icon: <FontAwesome5 name="utensils" size={16} color="#333" />,
    },
    {
        key: 'landmark',
        label: '지역 명소',
        icon: <Entypo name="location-pin" size={16} color="red" />,
    },
    {
        key: 'recommend',
        label: '지역 맛집 추천',
        icon: <MaterialIcons name="map" size={16} color="#333" />,
    },
];

export default function CategorySelector() {
    const router = useRouter();

    const handlePress = (categoryKey: string) => {
        router.push(`../map/placelist/${categoryKey}`);
    };

    return (
        <View style={styles.container}>
            {categories.map(({ key, label, icon }) => (
                <TouchableOpacity key={key} style={styles.button} onPress={() => handlePress(key)}>
                    <View style={styles.row}>
                        {icon}
                        <Text style={styles.label}>{label}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        marginLeft: 2.5,
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
    },
});
