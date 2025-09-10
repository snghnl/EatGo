import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { PlanCard } from "./PlanCard";
import { Colors } from "../../constants/Colors";
import { Routes, Places } from "../../src/client/sdk.gen";
import { Place, Route } from "../../src/client/types.gen";

interface PlaceItem {
  id: string;
  category: string;
  name: string;
}

interface PlaceRecommendationModalProps {
  visible: boolean;
  onClose: () => void;
  onPlaceSelect: (selectedPlace: Place) => void;
  lat: number;
  lng: number;
  destinationName?: string;
}

export const PlaceRecommendationModal: React.FC<PlaceRecommendationModalProps> = ({
  visible,
  onClose,
  onPlaceSelect,
  lat,
  lng,
  destinationName = "추천",
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [placesData, setPlacesData] = useState<{ [routeId: string]: PlaceItem[] }>({});

  useEffect(() => {
    if (visible) {
      fetchRecommendations();
    }
  }, [visible, lat, lng]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await Routes.routesRecommendList({
        query: {
          lat,
          lng,
          max_distance_km: 20,
          limit: 5,
          category_filter: ["맛집"],
        },
      });

      if (response.data?.routes && Array.isArray(response.data.routes)) {
        // Convert the response data to Route objects
        const routeData: Route[] = response.data.routes.slice(0, 3).map((routeDict: any, index: number) => ({
          id: `route_${index}`,
          title: `추천 코스 ${index + 1}`,
          description: `${destinationName} 추천 코스`,
          places: routeDict.places || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        setRoutes(routeData);
        // Fetch place details for each route
        await fetchPlacesForRoutes(routeData);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      Alert.alert("오류", "추천 장소를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacesForRoutes = async (routes: Route[]) => {
    const placesDataMap: { [routeId: string]: PlaceItem[] } = {};

    for (const route of routes) {
      if (route.places && route.places.length > 0) {
        const placeItems: PlaceItem[] = [];

        for (const placeId of route.places) {
          try {
            const placeResponse = await Places.placesRead({
              path: { id: placeId },
            });

            if (placeResponse.data) {
              const place = placeResponse.data;
              placeItems.push({
                id: place.id!,
                name: place.name || "알 수 없는 장소",
                category: getCategoryFromPlaceType(place.place_type),
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch place ${placeId}:`, error);
          }
        }

        if (route.id) {
          placesDataMap[route.id] = placeItems;
        }
      }
    }

    setPlacesData(placesDataMap);
  };

  const getCategoryFromPlaceType = (placeType?: string | null) => {
    if (!placeType) return "기타";

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

  const handlePlacePress = async (routeIndex: number, placeId: string) => {
    setSelectedRouteIndex(routeIndex);
    setSelectedPlaceId(placeId);

    // Find the selected place
    const route = routes[routeIndex];
    if (route.id && placesData[route.id]) {
      const placeItem = placesData[route.id].find(p => p.id === placeId);
      if (placeItem) {
        try {
          const placeResponse = await Places.placesRead({
            path: { id: placeId },
          });

          if (placeResponse.data) {
            Alert.alert(
              `${placeResponse.data.name}을(를) 선택하시겠습니까?`,
              "이 장소를 일정에 추가합니다.",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "선택",
                  onPress: () => {
                    onPlaceSelect(placeResponse.data!);
                    onClose();
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error("Failed to fetch place details:", error);
          Alert.alert("오류", "장소 정보를 불러올 수 없습니다.");
        }
      }
    }
  };

  const handleCardPress = (routeIndex: number) => {
    // Toggle selection
    setSelectedRouteIndex(selectedRouteIndex === routeIndex ? null : routeIndex);
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText size="lg" weight="bold" color="textPrimary">
          {destinationName} 추천 장소
        </ThemedText>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ThemedText size="lg" color="primary">✕</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <ThemedText color="textSecondary" style={{ marginTop: 8 }}>
            추천 장소를 찾고 있습니다...
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText color="textSecondary" size="sm" style={styles.subtitle}>
            마음에 드는 코스를 선택하고, 원하는 장소를 클릭하세요
          </ThemedText>

          {routes.map((route, index) => (
            <View key={route.id || index} style={styles.routeContainer}>
              <ThemedText size="lg" weight="semibold" color="textPrimary" style={styles.routeTitle}>
                추천 코스 {index + 1}
              </ThemedText>

              {route.id && placesData[route.id] && placesData[route.id].length > 0 ? (
                <PlanCard
                  places={placesData[route.id]}
                  onPlacePress={(placeId) => handlePlacePress(index, placeId)}
                  onCardPress={() => handleCardPress(index)}
                  selectedPlaceId={selectedPlaceId}
                  isActive={selectedRouteIndex === index}
                />
              ) : (
                <View style={styles.emptyRoute}>
                  <ThemedText color="textSecondary" size="sm">
                    이 코스에는 추천 장소가 없습니다
                  </ThemedText>
                </View>
              )}
            </View>
          ))}

          {routes.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText color="textSecondary" size="lg">
                추천 장소가 없습니다
              </ThemedText>
              <ThemedText color="textSecondary" size="sm" style={{ marginTop: 4 }}>
                다른 지역을 선택해보세요
              </ThemedText>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  routeContainer: {
    marginBottom: 24,
  },
  routeTitle: {
    marginBottom: 12,
  },
  emptyRoute: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
});
