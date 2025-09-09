import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { BookmarkButton } from "@/components/main/BookmarkButton";

export interface PlaceCardProps {
  id: string;
  imageUrl: string;
  category: string;
  name: string;
  distance: string;
  address: string;
  description: string;
  onPress?: (placeId: string) => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  isSaved?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  id,
  name,
  category,
  distance,
  address,
  description,
  imageUrl,
  onPress,
  onBookmark,
  isBookmarked = false,
  isSaved = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSaved && styles.savedCard]}
      onPress={() => onPress?.(id)}
      activeOpacity={0.9}
    >
      <BookmarkButton isBookmarked={isBookmarked} onPress={onBookmark} />

      <Image
        source={{
          uri: imageUrl || "https://source.unsplash.com/random/300x300?food",
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <ThemedText
          size="xs"
          color="textSecondary"
          style={styles.category}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {category.split(" > ").slice(1).join(" > ")}
        </ThemedText>

        <ThemedText
          size="lg"
          weight="bold"
          style={styles.name}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </ThemedText>

        <ThemedText
          size="sm"
          color="textPrimary"
          style={styles.distance}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {distance} · {address}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: "flex-start",
    width: "100%",
    minHeight: 131,
  },
  image: {
    width: 111,
    height: 111,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    marginRight: 15,
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: "flex-start",
  },
  name: {
    marginTop: 2,
    marginBottom: 4,
  },
});
