import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Routes } from "../../src/client/sdk.gen";
import { Route } from "../../src/client/types.gen";
import { RouteList } from "./RouteList";
import { ThemedText } from "../ThemedText";
import { Colors } from "@/constants/Colors";

interface Props {
  courseId: string;
  routes: Array<{ route_id: string; sequence?: number }>;
  onPlacePress?: (routeId: string, placeId: string) => void;
  onCardPress?: (routeId: string) => void;
  onLongPress?: (routeId: string) => void;
  onSave?: (routeId: string) => void;
  onRecommendationPress?: (sequence: number) => void;
  selectedPlaceId?: string | null;
  activeRouteId?: string | null;
}

export const RouteListContainer: React.FC<Props> = ({
  courseId,
  routes,
  onPlacePress,
  onCardPress,
  onLongPress,
  onSave,
  onRecommendationPress,
  selectedPlaceId,
  activeRouteId,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [routeDetails, setRouteDetails] = React.useState<Route[]>([]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch all route details
    const fetchRouteDetails = async () => {
      try {
        const routePromises = routes.map(async (routeRef) => {
          const response = await Routes.routesRead({
            path: { id: routeRef.route_id },
          });
          return {
            ...response.data,
            sequence: routeRef.sequence || 0,
          };
        });

        const routeData = await Promise.all(routePromises);

        if (!mounted) return;

        // Sort by sequence
        const sortedRoutes = routeData.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        setRouteDetails(sortedRoutes);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (routes.length > 0) {
      fetchRouteDetails();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [routes]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <ThemedText color="textSecondary" style={{ marginTop: 8 }}>
          여행 경로를 불러오는 중…
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText color="danger">불러오기 실패: {error}</ThemedText>
      </View>
    );
  }

  if (routeDetails.length === 0) {
    return (
      <View style={styles.center}>
        <ThemedText color="textSecondary">등록된 여행 경로가 없습니다.</ThemedText>
      </View>
    );
  }

  return (
    <RouteList
      routes={routeDetails}
      onPlacePress={onPlacePress}
      onCardPress={onCardPress}
      onLongPress={onLongPress}
      onSave={onSave}
      onRecommendationPress={onRecommendationPress}
      selectedPlaceId={selectedPlaceId}
      activeRouteId={activeRouteId}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
