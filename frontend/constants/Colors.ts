const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

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

    light: {
        text: "#11181C",
        background: "#fff",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
    },
} as const;

export type ColorKey = keyof typeof Colors;
