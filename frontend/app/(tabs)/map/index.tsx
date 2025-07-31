import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/TopBar';
import SearchBar from '@/components/SearchBar';

export default function MapScreen() {
    console.log('MapScreen rendering...');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <SearchBar />
                <TopBar />
            </View>
            <View style={styles.content}>
                <Text style={styles.subtitle}>지도 화면이 여기에 표시됩니다.</Text>
                <Text style={styles.debug}>Debug: Screen is rendering</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 10,
        alignItems: 'center',
        zIndex: 100,
        paddingHorizontal: 20,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    debug: {
        fontSize: 14,
        color: Colors.primary,
        textAlign: 'center',
    },
});
