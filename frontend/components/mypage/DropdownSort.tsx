import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const OPTIONS = ["최신순", "거리순", "별점순"];

interface DropdownSortProps {
  selected: string;
  onSelect: (option: string) => void;
}

const DropdownSort: React.FC<DropdownSortProps> = ({ selected, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsVisible((prev) => !prev)}
          activeOpacity={0.7}
        >
          <ThemedText size="sm" weight="medium" color="textPrimary">
            {selected}
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={16}
            color={Colors.textPrimary}
            style={styles.icon}
          />
        </TouchableOpacity>

        {isVisible && (
          <View style={styles.dropdown}>
            {OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => handleSelect(option)}
              >
                <ThemedText size="sm" color="textPrimary">
                  {option}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default DropdownSort;

const screenWidth = Dimensions.get("window").width;
const horizontalMargin = 20;
const buttonWidth = screenWidth - horizontalMargin * 2;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: horizontalMargin,
    paddingTop: 16,
  },
  container: {
    position: "relative",
    alignItems: "flex-end",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    width: 94,
    justifyContent: "space-between",
  },
  dropdown: {
    position: "absolute",
    top: 32,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 4,
    width: 94,
    zIndex: 10,
  },
  option: {
    paddingVertical: 10,
  },
});
