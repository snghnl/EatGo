import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/Colors";
import { DateChangeHandler } from "@/types";
import {
    formatDate,
    parseDate,
    webToAppFormat,
    appToWebFormat,
} from "@/utils/dateUtils";

interface DateInputProps {
    startDate: string;
    endDate: string;
    onDateChange?: DateChangeHandler;
}

export const DateInput: React.FC<DateInputProps> = ({
    startDate,
    endDate,
    onDateChange,
}) => {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleStartDatePress = () => {
        if (Platform.OS === "web") {
            const input = document.createElement("input");
            input.type = "date";
            input.value = appToWebFormat(startDate);
            input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const newDate = webToAppFormat(target.value);
                if (endDate && parseDate(newDate) > parseDate(endDate)) {
                    onDateChange?.(newDate, "");
                } else {
                    onDateChange?.(newDate, endDate);
                }
            };
            input.click();
        } else {
            setShowStartPicker(true);
        }
    };

    const handleEndDatePress = () => {
        if (Platform.OS === "web") {
            const input = document.createElement("input");
            input.type = "date";
            input.value = appToWebFormat(endDate || startDate);
            input.min = appToWebFormat(startDate);
            input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const newDate = webToAppFormat(target.value);
                if (parseDate(newDate) >= parseDate(startDate)) {
                    onDateChange?.(startDate, newDate);
                }
            };
            input.click();
        } else {
            setShowEndPicker(true);
        }
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            const formatted = formatDate(selectedDate);
            if (endDate && selectedDate > parseDate(endDate)) {
                onDateChange?.(formatted, "");
            } else {
                onDateChange?.(formatted, endDate);
            }
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            if (selectedDate < parseDate(startDate)) {
                return;
            }
            onDateChange?.(startDate, formatDate(selectedDate));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dateContainer}>
                <TouchableOpacity
                    style={styles.dateField}
                    onPress={handleStartDatePress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.dateText}>{startDate}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.arrivalButton}
                    onPress={handleEndDatePress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.arrivalText}>
                        {endDate ? endDate : "도착일"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 모바일 전용 DateTimePicker */}
            {Platform.OS !== "web" && showStartPicker && (
                <DateTimePicker
                    value={parseDate(startDate)}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleStartDateChange}
                    minimumDate={new Date()}
                />
            )}

            {Platform.OS !== "web" && showEndPicker && (
                <DateTimePicker
                    value={endDate ? parseDate(endDate) : parseDate(startDate)}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleEndDateChange}
                    minimumDate={parseDate(startDate)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    dateContainer: {
        flexDirection: "row",
        gap: 12,
    },
    dateField: {
        flex: 1,
        height: 48,
        backgroundColor: Colors.backgroundGray,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.textPrimary,
    },
    arrivalButton: {
        flex: 1,
        height: 48,
        backgroundColor: Colors.backgroundGray,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    arrivalText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.textPrimary,
    },
});
