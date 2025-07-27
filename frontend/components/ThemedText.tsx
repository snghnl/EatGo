import { StyleSheet, Text, type TextProps } from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";

export type ThemedTextProps = TextProps & {
    color?: keyof typeof Colors;
    size?: keyof typeof Fonts;
    weight?: keyof typeof Fonts.weight;
    lineHeight?: keyof typeof Fonts.lineHeight;
    type?:
        | "default"
        | "title"
        | "subtitle"
        | "caption"
        | "link"
        | "heading"
        | "body";
};

export function ThemedText({
    style,
    color = "textPrimary",
    size = "base",
    weight = "normal",
    lineHeight = "normal",
    type = "default",
    ...rest
}: ThemedTextProps) {
    return (
        <Text
            style={[
                {
                    color: Colors[color],
                    fontSize: Fonts[size],
                    fontFamily: Fonts.regular,
                    fontWeight: Fonts.weight[weight],
                    lineHeight: Fonts[size] * Fonts.lineHeight[lineHeight],
                },
                type === "default" ? styles.default : undefined,
                type === "title" ? styles.title : undefined,
                type === "subtitle" ? styles.subtitle : undefined,
                type === "caption" ? styles.caption : undefined,
                type === "link" ? styles.link : undefined,
                type === "heading" ? styles.heading : undefined,
                type === "body" ? styles.body : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        // 기본 스타일은 인라인으로 처리됨
    },
    title: {
        fontSize: Fonts["4xl"],
        fontWeight: Fonts.weight.bold,
        lineHeight: Fonts["4xl"] * Fonts.lineHeight.tight,
    },
    subtitle: {
        fontSize: Fonts["2xl"],
        fontWeight: Fonts.weight.semibold,
        lineHeight: Fonts["2xl"] * Fonts.lineHeight.normal,
    },
    heading: {
        fontSize: Fonts.xl,
        fontWeight: Fonts.weight.semibold,
        lineHeight: Fonts.xl * Fonts.lineHeight.normal,
    },
    body: {
        fontSize: Fonts.base,
        fontWeight: Fonts.weight.normal,
        lineHeight: Fonts.base * Fonts.lineHeight.relaxed,
    },
    caption: {
        fontSize: Fonts.sm,
        fontWeight: Fonts.weight.normal,
        lineHeight: Fonts.sm * Fonts.lineHeight.normal,
    },
    link: {
        fontSize: Fonts.base,
        fontWeight: Fonts.weight.medium,
        lineHeight: Fonts.base * Fonts.lineHeight.normal,
        color: Colors.primary,
    },
});
