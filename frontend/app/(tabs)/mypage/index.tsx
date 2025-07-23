import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

export default function MyPageScreen() {
    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>마이페이지</Text>
                <Text style={styles.subtitle}>
                    사용자 정보가 여기에 표시됩니다.
                </Text>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: "center",
    },
});
