// components/place/PlaceImageGallery.tsx
import React from "react";
import { View, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../../constants/Colors";

interface PlaceImageGalleryProps {
  images: string[];
}

const { width } = Dimensions.get("window");
const imageWidth = (width - 60) / 3; // 3 images with padding

export const PlaceImageGallery: React.FC<PlaceImageGalleryProps> = ({
  images,
}) => {
  // Mock placeholder images if none provided
  const displayImages =
    images.length > 0
      ? images
      : [
          "https://via.placeholder.com/150x120/CCCCCC/FFFFFF?text=1",
          "https://via.placeholder.com/150x120/CCCCCC/FFFFFF?text=2",
          "https://via.placeholder.com/150x120/CCCCCC/FFFFFF?text=3",
        ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {displayImages.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: Colors.listbackground,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: imageWidth,
    height: 120,
    backgroundColor: Colors.background,
  },
});
