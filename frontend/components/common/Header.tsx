import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 180,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
    },
    content: {
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: Colors.textSecondary,
        marginBottom: 4,
    },
});
