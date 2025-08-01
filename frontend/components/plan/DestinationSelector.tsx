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

    // 22개 아이템을 4개씩 그룹으로 나누기 (4×N 그리드)
    const createRows = () => {
        const rows = [];
        for (let i = 0; i < JEONLA_DESTINATIONS.length; i += 4) {
            const rowItems = JEONLA_DESTINATIONS.slice(i, i + 4);
            rows.push(rowItems);
        }
        return rows;
    };

    const rows = createRows();

    return (
        <View style={styles.container}>
            {rows.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    style={[styles.row, row.length < 4 && styles.lastRow]}
                >
                    {row.map((destination, index) => (
                        <DestinationButton
                            key={`${rowIndex}-${index}`}
                            destination={destination}
                            isSelected={selectedDestinations.includes(
                                destination
                            )}
                            onPress={handleDestinationPress}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        marginTop: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    lastRow: {
        justifyContent: "center",
        gap: 8,
    },
});
