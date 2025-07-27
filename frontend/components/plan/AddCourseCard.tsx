import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { Colors } from "../../constants/Colors";

interface AddCourseCardProps {
    onPress?: () => void;
    text?: string;
}

export const AddCourseCard: React.FC<AddCourseCardProps> = ({
    onPress,
    text = "+ 새 여행경로 만들기",
}) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <ThemedView style={styles.card}>
                <View style={styles.content}>
                    <ThemedText
                        size="xs"
                        color="textSecondary"
                        weight="semibold"
                        style={styles.subtitle}
                    >
                        {text}
                    </ThemedText>
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        gap: 1,
    },
    subtitle: {
        // ThemedText에서 처리됨
    },
});
