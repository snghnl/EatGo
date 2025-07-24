import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import AppContainer from "@/components/common/AppContainer";

export const viewport = {
    width: "device-width",
    initialScale: 1.0,
    minimumScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        Pretendard: require("../assets/fonts/Pretendard-Regular.ttf"),
    });

    if (!loaded) return null;


    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <AppContainer>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="playground"
                        options={{ title: "Playground" }}
                    />
                    <Stack.Screen name="+not-found" />
                    <Stack.Screen
                        name="course/[id]"
                        options={{ headerShown: false }}
                    />
                </Stack>
                <StatusBar style="auto" />
            </AppContainer>
        </ThemeProvider>
    );
}
