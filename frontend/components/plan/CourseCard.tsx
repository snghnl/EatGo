import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface CourseCardProps {
  subtitle: string;
  title: string;
  hasImages?: boolean;
  onPress?: () => void;
  isDeleteMode?: boolean;
  isSelected?: boolean;
  isEditMode?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  subtitle,
  title,
  hasImages = false,
  onPress,
  isDeleteMode = false,
  isSelected = false,
  isEditMode = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView style={[
        styles.card,
        isDeleteMode && isSelected && styles.selectedCard
      ]}>
        {isDeleteMode && (
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={Colors.white}
                />
              )}
            </View>
          </View>
        )}
        {isEditMode && (
          <View style={styles.editIconContainer}>
            <View style={styles.editIcon}>
              <Ionicons
                name="pencil"
                size={16}
                color={Colors.primary || "#007AFF"}
              />
            </View>
          </View>
        )}
        <View style={styles.content}>
          <ThemedText
            size="xs"
            color="textSecondary"
            weight="semibold"
            style={styles.subtitle}
          >
            {subtitle}
          </ThemedText>
          <ThemedText
            size="lg"
            color="textPrimary"
            weight="bold"
            style={styles.title}
          >
            {title}
          </ThemedText>

          {hasImages && (
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageDivider} />
              </View>
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageDivider} />
              </View>
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageDivider} />
              </View>
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageDivider} />
              </View>
            </View>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  selectedCard: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.primary || "#007AFF",
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.primary || "#007AFF",
    borderColor: Colors.primary || "#007AFF",
  },
  editIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  editIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.primary || "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    gap: 1,
    flex: 1,
  },
  subtitle: {
    // ThemedText에서 처리됨
  },
  title: {
    // ThemedText에서 처리됨
  },
  imageContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  imagePlaceholder: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1, // 테두리 추가
    borderColor: Colors.border, // 테두리 색상
  },
  imageDivider: {
    width: 2,
    height: 40,
    backgroundColor: Colors.borderDark,
    borderRadius: 1,
  },
});
