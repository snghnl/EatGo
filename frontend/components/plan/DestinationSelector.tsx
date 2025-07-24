import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { JEONLA_DESTINATIONS } from "@/constants/Data";
import { DestinationChangeHandler } from "@/types";
import { DestinationButton } from "./DestinationButton";

interface DestinationSelectorProps {
    onDestinationChange?: DestinationChangeHandler;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
    onDestinationChange,
}) => {
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
        []
    );

    const handleDestinationPress = (destination: string) => {
        const newSelected = selectedDestinations.includes(destination)
            ? selectedDestinations.filter((d) => d !== destination)
            : [...selectedDestinations, destination];

        setSelectedDestinations(newSelected);
        onDestinationChange?.(newSelected);
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonGrid}>
                {JEONLA_DESTINATIONS.map((destination, index) => (
                    <DestinationButton
                        key={index}
                        destination={destination}
                        isSelected={selectedDestinations.includes(destination)}
                        onPress={handleDestinationPress}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    buttonGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
    },
});
