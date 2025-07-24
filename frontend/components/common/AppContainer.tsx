import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Colors } from "@/constants/Colors";

export default function AppContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        width: 390, // 고정 앱 너비 (iPhone 14 기준)
        maxWidth: "100%",
        height: "100%",
        backgroundColor: Colors.background, // 앱의 배경색 사용
    },
});
