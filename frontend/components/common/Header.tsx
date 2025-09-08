import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";

interface HeaderProps {
  title: string;
  titleColor?: string; //title 색상 변경 가능
  subtitle?: string;
  subtitleColor?: string; //subtitle 색상 변경 가능
  align?: "left" | "center"; //추가: subtitle 정렬 옵션
}

export default function Header({
  align,
  title,
  titleColor,
  subtitle,
  subtitleColor,
}: HeaderProps) {
  return (
    <View
      style={[
        styles.container,
        {
          alignItems: align === "left" ? "flex-start" : "center",
          flexDirection: "column", // ← 여기!
        },
      ]}
    >
      <View
        style={[
          styles.content,
          { alignItems: align === "left" ? "flex-start" : "center" },
        ]}
      >
        <Text
          style={[styles.subtitle, subtitleColor && { color: subtitleColor }]}
        >
          {subtitle}
        </Text>
        <Text style={[styles.title, titleColor && { color: titleColor }]}>
          {title}
        </Text>
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
  },
});
