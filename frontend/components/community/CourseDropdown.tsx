import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { ScrollView } from 'react-native';

interface CourseDropdownProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

export default function DropdownFilter({ label, options, selected, onSelect }: CourseDropdownProps) {
    const [isVisible, setIsVisible] = useState(false);

    const handleSelect = (option: string) => {
        onSelect(option);
        setIsVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsVisible((prev) => !prev)}
                activeOpacity={0.7}
            >
                <ThemedText size="sm" weight="medium" color="textPrimary">
                    {selected || label}
                </ThemedText>
                <Ionicons name="chevron-down" size={14} color={Colors.textPrimary} />
            </TouchableOpacity>

            {isVisible && (
                <View style={styles.dropdown}>
                    <ScrollView style={{ maxHeight: 180 }}>
                        {options.map((option) => (
                            <TouchableOpacity key={option} style={styles.option} onPress={() => handleSelect(option)}>
                                <ThemedText size="sm" color="textPrimary">
                                    {option}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginRight: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 4,
        width: 97,
        height: 35,
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        backgroundColor: Colors.white,
        padding: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        width: 97,
    },
    option: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
});
