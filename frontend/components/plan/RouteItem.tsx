import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { Colors } from "../../constants/Colors";
import { Route, Place } from "../../src/client/types.gen";
import { Places } from "../../src/client/sdk.gen";
import { Place as PlaceComponent } from "./Place";
import { Ionicons } from "@expo/vector-icons";

interface RouteItemProps {
  route: Route;
  sequence: number;
  onPlacePress?: (placeId: string) => void;
  onCardPress?: () => void;
  onLongPress?: () => void;
  onSave?: () => void;
  onRecommendationPress?: () => void;
  selectedPlaceId?: string | null;
  isActive?: boolean;
}

const screenWidth = Dimensions.get("window").width;

export const RouteItem: React.FC<RouteItemProps> = ({
  route,
  sequence,
  onPlacePress,
  onCardPress,
  onLongPress,
  onSave,
  onRecommendationPress,
  selectedPlaceId,
  isActive = false,
}) => {
  const [places, setPlaces] = React.useState<Place[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPlaces = async () => {
      if (!route.places || route.places.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const placePromises = route.places.map(async (placeId) => {
          const response = await Places.placesRead({
            path: { id: placeId },
          });
          return response.data;
        });

        const placeData = await Promise.all(placePromises);
        setPlaces(placeData);
      } catch (error) {
        console.error("Failed to fetch places:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [route.places]);

  const handleCardPress = () => {
    onCardPress?.();
  };

  const handleLongPress = () => {
    onLongPress?.();
  };

  const handleSavePress = () => {
    onSave?.();
  };

  const getCategoryFromPlaceType = (placeType?: string) => {
    switch (placeType) {
      case "RESTAURANT":
        return "음식점";
      case "ATTRACTION":
        return "관광지";
      case "SHOPPING":
        return "쇼핑";
      case "ETC":
      default:
        return "기타";
    }
  };

  return (
    <ThemedView style={[styles.container, isActive && styles.activeContainer]}>
      <TouchableOpacity
        onPress={handleCardPress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.touchableContainer}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText
              size="xs"
              color="textSecondary"
              weight="normal"
              style={styles.dayText}
            >
              {sequence}일차
            </ThemedText>
            <ThemedText
              size="lg"
              color="textPrimary"
              weight="bold"
              style={styles.title}
            >
              {route.title}
            </ThemedText>
            {route.description && (
              <ThemedText
                size="sm"
                color="textSecondary"
                style={styles.description}
              >
                {route.description}
              </ThemedText>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSavePress}
            style={styles.saveButton}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.placesContainer}>
            <ThemedText color="textSecondary" size="sm">
              장소 정보를 불러오는 중...
            </ThemedText>
          </View>
        ) : places.length > 0 ? (
          <View style={styles.placesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.placesScroll}
              contentContainerStyle={styles.placesScrollContent}
            >
              {places.map((place, index) => (
                <View key={place.id} style={styles.placeWrapper}>
                  <PlaceComponent
                    category={getCategoryFromPlaceType(place.place_type)}
                    name={place.name}
                    onPress={() => onPlacePress?.(place.id!)}
                    isSelected={selectedPlaceId === place.id}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText color="textSecondary" size="sm">
              등록된 장소가 없습니다
            </ThemedText>
            <TouchableOpacity
              onPress={onRecommendationPress}
              style={styles.recommendButton}
            >
              <ThemedText color="primary" size="sm">
                추천 장소 보기
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  touchableContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  dayText: {
    marginBottom: 4,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    lineHeight: 18,
  },
  saveButton: {
    padding: 4,
  },
  placesContainer: {
    minHeight: 80,
  },
  placesScroll: {
    flexGrow: 0,
  },
  placesScrollContent: {
    paddingHorizontal: 4,
  },
  placeWrapper: {
    width: (screenWidth - 80) / 3,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  recommendButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
});
