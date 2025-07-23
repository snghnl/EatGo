import { View } from 'react-native';
import MainMapScreen from '../../src/screens/MainMapScreen';
import React from 'react';

export default function HomeScreen() {
    return (
        <View style={{ flex: 1 }}>
            <MainMapScreen />
        </View>
    );
}
