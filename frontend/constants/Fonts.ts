export const Fonts = {
  // 프리텐다드 폰트 패밀리 (웨이트별로 다른 폰트 이름 사용)
  regular: "Pretendard",
  medium: "Pretendard",
  semibold: "Pretendard",
  bold: "Pretendard",

  // 폰트 크기
  xs: 12,
  sm: 14,
  base: 16,
  lg: 19,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 36,

  // 폰트 웨이트
  weight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // 라인 높이
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type FontSize = keyof typeof Fonts;
export type FontWeight = keyof typeof Fonts.weight;
export type LineHeight = keyof typeof Fonts.lineHeight;
