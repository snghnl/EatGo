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
    const backgroundColor = lightColor || darkColor || Colors[color];

    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
