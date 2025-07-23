/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const Colors = {
    // 포인트 색상
    primary: "#FF4753",

    // 기본 색상
    white: "#FFFFFF",
    black: "#000000",

    // 배경 색상
    background: "#f5f5f5",
    backgroundGray: "#f0f0f0",

    // 텍스트 색상
    textPrimary: "#333333",
    textSecondary: "#666666",
    textLight: "#999999",

    // 테두리 색상
    border: "#f0f0f0",
    borderDark: "#e0e0e0",

    // 상태 색상
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
} as const;

export type ColorKey = keyof typeof Colors;
