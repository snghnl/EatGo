import "dotenv/config";

export default {
    expo: {
        name: "EatGo",
        slug: "EatGo",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "frontend",
        userInterfaceStyle: "automatic",
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.anonymous.frontend",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            edgeToEdgeEnabled: true,
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        // Expo Go uses the top-level `splash` field at runtime.
        // Keep this in sync with the expo-splash-screen plugin below.
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            EXPO_PUBLIC_KAKAO_JS_API_KEY:
                process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY,
            KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
        },
    },
};
