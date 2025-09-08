import { View, type ViewProps } from "react-native";
import { Colors } from "../constants/Colors";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  color?: keyof typeof Colors;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  color = "background",
  ...otherProps
}: ThemedViewProps) {
  let backgroundColor: string;

  if (lightColor || darkColor) {
    backgroundColor = lightColor || darkColor || "#f5f5f5";
  } else {
    // Handle the case where color might be a nested property
    const colorValue = Colors[color as keyof typeof Colors];
    backgroundColor = typeof colorValue === "string" ? colorValue : "#f5f5f5";
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
