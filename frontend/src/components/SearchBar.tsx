import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar() {
    return (
        <View style={styles.container}>
            <TextInput placeholder="지역, 맛집 등을 검색하세요" placeholderTextColor="#C7C7C7" style={styles.input} />
            <Text style={styles.separator}>|</Text>
            <Ionicons name="search" size={25} color="#C7C7C7" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 68,
        left: 15,
        width: 363,
        height: 51,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFCFC',
        borderRadius: 10,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3, // Android용
    },
    separator: {
        fontSize: 25,
        color: '#C7C7C7',
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
});
