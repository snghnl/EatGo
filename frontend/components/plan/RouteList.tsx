import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "../ThemedView";
import { RouteItem } from "./RouteItem";
import { Colors } from "../../constants/Colors";
import { Route } from "../../src/client/types.gen";

interface RouteListProps {
  routes: (Route & { sequence?: number })[];
  onPlacePress?: (routeId: string, placeId: string) => void;
  onCardPress?: (routeId: string) => void;
  onLongPress?: (routeId: string) => void;
  onSave?: (routeId: string) => void;
  onRecommendationPress?: (sequence: number) => void;
  selectedPlaceId?: string | null;
  activeRouteId?: string | null;
}

export const RouteList: React.FC<RouteListProps> = ({
  routes,
  onPlacePress,
  onCardPress,
  onLongPress,
  onSave,
  onRecommendationPress,
  selectedPlaceId = null,
  activeRouteId = null,
}) => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {routes.map((route, index) => (
          <RouteItem
            key={route.id}
            route={route}
            sequence={route.sequence || index + 1}
            onPlacePress={(placeId) => onPlacePress?.(route.id!, placeId)}
            onCardPress={() => onCardPress?.(route.id!)}
            onLongPress={() => onLongPress?.(route.id!)}
            onSave={() => onSave?.(route.id!)}
            onRecommendationPress={() => onRecommendationPress?.(route.sequence || index + 1)}
            selectedPlaceId={selectedPlaceId}
            isActive={activeRouteId === route.id}
          />
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
