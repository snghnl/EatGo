import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    onPress: () => void;
    style?: ViewStyle;
}

export default function FloatingButton({ onPress, style }: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, style]}>
            <LinearGradient
                colors={['#FF9EA4', '#FF4753']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientButton}
            >
                <Ionicons name="chevron-up" size={40} color="white" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        zIndex: 10,
    },
    gradientButton: {
        padding: 14,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
});
