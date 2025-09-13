// (tabs)/plan/[id]/recommendation/index.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { RouteList } from "@/components/plan";
import { PlaceRecommendationModal } from "@/components/plan/PlaceRecommendationModal";
import Header from "@/components/common/Header";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Routes, Districts, TravelCourses } from "@/src/client/sdk.gen";
import {
    Route,
    District,
    TravelCourse,
    TravelCourseRoute,
} from "@/src/client/types.gen";

async function getDistrictCoordinates(destinationName: string): Promise<{
    lat: number;
    lng: number;
    areaCd?: number;
    sigunguCd?: number;
} | null> {
    try {
        // Fetch all districts to find matching one
        const response = await Districts.districtsList({});
        const districts = response.data || [];

        // Find district by name
        const district = districts.find(
            (d: District) =>
                d.name.includes(destinationName) ||
                destinationName.includes(d.name)
        );

        if (district && district.latitude && district.longitude) {
            return {
                lat: parseFloat(district.latitude),
                lng: parseFloat(district.longitude),
                areaCd: district.province?.areaCd,
                sigunguCd: district.sigunguCd,
            };
        }
    } catch (error) {
        console.warn("Failed to fetch district coordinates:", error);
    }

    return null;
}

// This function is kept for potential future use when we need to fetch individual route recommendations
async function fetchRecommendedPlaces(params: {
    destinations?: string;
    dayNumber: number;
}): Promise<Route & { sequence: number }> {
    const { destinations, dayNumber } = params;

    // Default coordinates (전주)
    let lat = 35.8428;
    let lng = 127.1291;
    let destinationName = "전주";

    // Try to get coordinates from district if destinations provided
    if (destinations) {
        try {
            destinationName = String(destinations).split(",")[0] || "전주";
            const coords = await getDistrictCoordinates(destinationName);
            if (coords) {
                lat = coords.lat;
                lng = coords.lng;
            }
        } catch (error) {
            console.warn("Failed to get coordinates for destination:", error);
        }
    }

    // Call the actual routes/recommend API
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

        // Transform API response to place IDs
        let placeIds: string[] = [];
        if (
            response.data?.routes &&
            Array.isArray(response.data.routes) &&
            response.data.routes.length > 0
        ) {
            // Extract place IDs from the first recommended route
            const firstRoute = response.data.routes[0];
            if (firstRoute && Array.isArray(firstRoute.places)) {
                placeIds = firstRoute.places;
            }
        }

        // Update the route with recommended places
        const route: Route & { sequence: number } = {
            id: `day_${dayNumber}`,
            title: `${dayNumber}일차 추천 코스`,
            description: `${destinationName} ${dayNumber}일차 일정`,
            places: placeIds,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sequence: dayNumber,
        };

        return route;
    } catch (error) {
        console.warn(
            "Failed to fetch recommendations from API, using empty route:",
            error
        );

        // Fallback: return empty route if API fails
        const route: Route & { sequence: number } = {
            id: `day_${dayNumber}`,
            title: `${dayNumber}일차 추천 코스`,
            description: `${destinationName} ${dayNumber}일차 일정`,
            places: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sequence: dayNumber,
        };

        return route;
    }
}

function calculateTourDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 1;

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end day
        return Math.max(1, diffDays);
    } catch {
        return 1;
    }
}

async function fetchRouteRecommendations(params: {
    destinations?: string;
    startDate?: string;
    endDate?: string;
}): Promise<(Route & { sequence: number })[]> {
    const { destinations, startDate, endDate } = params;

    // Default coordinates (전주)
    let lat = 35.8428;
    let lng = 127.1291;
    let destinationName = "전주";

    // Try to get coordinates from district if destinations provided
    if (destinations) {
        try {
            destinationName = String(destinations).split(",")[0] || "전주";
            const coords = await getDistrictCoordinates(destinationName);
            if (coords) {
                lat = coords.lat;
                lng = coords.lng;
            }
        } catch (error) {
            console.warn("Failed to get coordinates for destination:", error);
        }
    }

    const tourDays = calculateTourDays(startDate, endDate);

    // Generate routes for each day with sequence
    const routes: (Route & { sequence: number })[] = [];
    for (let day = 1; day <= tourDays; day++) {
        routes.push({
            id: `day_${day}`,
            title: `${day}일차 추천 코스`,
            description: `${destinationName} ${day}일차 일정`,
            places: [], // Empty initially, will be filled when user clicks "추천 장소 보기"
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sequence: day,
        });
    }

    return routes;
}

export default function RecommendationScreen() {
    const { startDate, endDate, destinations } = useLocalSearchParams<{
        courseId: string;
        startDate?: string;
        endDate?: string;
        destinations?: string;
        foods?: string;
    }>();

    const [routes, setRoutes] = useState<(Route & { sequence: number })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [showPlaceRecommendationModal, setShowPlaceRecommendationModal] =
        useState(false);
    const [recommendationCoordinates, setRecommendationCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const regionName = useMemo(() => {
        if (destinations) {
            const list = String(destinations).split(",");
            return list[0] || "전주";
        }
        return "전주";
    }, [destinations]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const routeData = await fetchRouteRecommendations({
                destinations: destinations ? String(destinations) : undefined,
                startDate: startDate ? String(startDate) : undefined,
                endDate: endDate ? String(endDate) : undefined,
            });
            setRoutes(routeData);
        } catch (e: any) {
            setError(e?.message || "Failed to fetch routes");
        } finally {
            setLoading(false);
        }
    }, [destinations, startDate, endDate]);

    useEffect(() => {
        load();
    }, [load]);

    const handleLongPress = (routeId: string) => setSelectedRouteId(routeId);

    const handlePlacePress = (routeId: string, placeId: string) => {
        if (selectedRouteId === routeId) {
            setSelectedPlaceId(placeId);
        }
    };

    const handleClosePlaceRecommendationModal = () => {
        setShowPlaceRecommendationModal(false);
        setRecommendationCoordinates(null);
        setSelectedPlaceId(null);
        setSelectedRouteId(null);
    };

    const handlePlaceSelect = (selectedPlace: any) => {
        // Add the selected place to the current route
        if (selectedRouteId) {
            setRoutes((prevRoutes) =>
                prevRoutes.map((route) => {
                    if (route.id === selectedRouteId) {
                        const updatedPlaces = route.places
                            ? [...route.places]
                            : [];
                        // Only add if not already in the route
                        if (!updatedPlaces.includes(selectedPlace.id)) {
                            updatedPlaces.push(selectedPlace.id);
                        }
                        return { ...route, places: updatedPlaces };
                    }
                    return route;
                })
            );

            Alert.alert(
                "성공",
                `${selectedPlace.name}이(가) 일정에 추가되었습니다.`
            );
        }
    };

    const handleRecommendationPress = async (sequence: number) => {
        try {
            // Set the selected route for place addition
            setSelectedRouteId(`day_${sequence}`);

            // Get coordinates for the destination
            let lat = 35.8428;
            let lng = 127.1291;

            if (destinations) {
                try {
                    const destinationName =
                        String(destinations).split(",")[0] || "전주";
                    const coords =
                        await getDistrictCoordinates(destinationName);
                    if (coords) {
                        lat = coords.lat;
                        lng = coords.lng;
                    }
                } catch (error) {
                    console.warn(
                        "Failed to get coordinates for destination:",
                        error
                    );
                }
            }

            setRecommendationCoordinates({ lat, lng });
            setShowPlaceRecommendationModal(true);
        } catch (error) {
            console.error("Failed to open recommendation modal:", error);
        }
    };

    const handleCardPress = (_routeId: string) => {};

    const handleSave = async (routeId: string) => {
        try {
            // Find the route to save
            const routeToSave = routes.find((route) => route.id === routeId);
            if (!routeToSave) return;

            // First, create the route in the backend
            const routeData: Route = {
                title: routeToSave.title,
                description:
                    routeToSave.description || `${destinations || "추천"} 코스`,
                places: routeToSave.places || [],
            };

            const routeResponse = await Routes.routesCreate({
                body: routeData,
            });

            if (!routeResponse.data || !routeResponse.data.id) {
                throw new Error("Failed to create route");
            }

            // Then create TravelCourseRoute with the created route ID
            const travelCourseRoute: TravelCourseRoute = {
                route_id: routeResponse.data.id,
                sequence: 1,
            };

            // Create the travel course
            const travelCourse: TravelCourse = {
                title: routeToSave.title,
                description:
                    routeToSave.description ||
                    `${destinations || "추천"} 여행 코스`,
                routes: [travelCourseRoute],
                start_date: startDate ? String(startDate) : null,
                end_date: endDate ? String(endDate) : null,
                destination: destinations ? String(destinations) : null,
            };

            const courseResponse = await TravelCourses.travelCoursesCreate({
                body: travelCourse,
            });

            if (courseResponse.data) {
                // Show success message
                Alert.alert("성공", "코스가 성공적으로 저장되었습니다!");
            }
        } catch (error) {
            console.error("Failed to save course:", error);
            Alert.alert("오류", "코스 저장에 실패했습니다.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={`잇고 추천 ${regionName} 맛집 경로`}
                subtitle="당신의 선호 기반"
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator />
                    <ThemedText color="textSecondary" style={{ marginTop: 8 }}>
                        추천 경로 불러오는 중…
                    </ThemedText>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <ThemedText color="textPrimary">
                        불러오기 실패: {error}
                    </ThemedText>
                    <TouchableOpacity onPress={load} style={{ marginTop: 8 }}>
                        <ThemedText weight="semibold">다시 시도</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <RouteList
                    routes={routes}
                    onPlacePress={handlePlacePress}
                    onCardPress={handleCardPress}
                    onSave={handleSave}
                    onLongPress={handleLongPress}
                    onRecommendationPress={handleRecommendationPress}
                    selectedPlaceId={selectedPlaceId}
                    activeRouteId={selectedRouteId}
                />
            )}

            {showPlaceRecommendationModal && recommendationCoordinates && (
                <PlaceRecommendationModal
                    visible={showPlaceRecommendationModal}
                    onClose={handleClosePlaceRecommendationModal}
                    onPlaceSelect={handlePlaceSelect}
                    lat={recommendationCoordinates.lat}
                    lng={recommendationCoordinates.lng}
                    destinationName={regionName}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
