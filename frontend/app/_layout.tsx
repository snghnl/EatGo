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
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/useColorScheme";
import AppContainer from "@/components/common/AppContainer";
import { Colors } from "@/constants/Colors";
import { client } from "@/src/client/client.gen";

export const viewport = {
    width: "device-width",
    initialScale: 1.0,
    minimumScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
};

// configure internal service client
client.setConfig({
    // set default base url for requests
    // TODO: change to production url
    baseUrl: "http://localhost:8000",
    // set default headers for requests
    headers: {
        Authorization: "Bearer <token_from_service_client>",
    },
});

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded, error] = useFonts({
        Pretendard: require("../assets/fonts/Pretendard-Regular.ttf"),
    });

    // If fonts are still loading, show a loading state instead of null
    if (!loaded && !error) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: Colors.background,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* Simple loading state */}
            </View>
        );
    }

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: Colors.background }}>
                    <Stack>
                        <Stack.Screen
                            name="onboarding"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="placelist/[category]/index"
                            options={{
                                title: "",
                                headerBackVisible: true,
                            }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </View>
            </GestureHandlerRootView>
        </ThemeProvider>
    );
}
