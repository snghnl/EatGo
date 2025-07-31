import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import AppContainer from '@/components/common/AppContainer';
import { Colors } from '@/constants/Colors';

export const viewport = {
    width: 'device-width',
    initialScale: 1.0,
    minimumScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded, error] = useFonts({
        Pretendard: require('../assets/fonts/Pretendard-Regular.ttf'),
    });

    // If fonts are still loading, show a loading state instead of null
    if (!loaded && !error) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: Colors.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* Simple loading state */}
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="placelist/[category]/index"
                        options={{
                            title: '',
                            headerBackVisible: true,
                        }}
                    />
                </Stack>
                <StatusBar style="auto" />
            </View>
        </ThemeProvider>
    );
}
