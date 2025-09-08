import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import TopBar from "@/components/main/TopBar";
import SearchBar from "@/components/SearchBar";
import MapPlaceCardSwiper from "@/components/main/MapPlaceCardSwiper";
import KakaoMap from "@/components/main/KakaoMap";

// MOCK DATA
import mockData from "@/mock-data/places.json";

interface PlaceItem {
  id: string;
  place_name: string;
  category_name: string;
  road_address_name: string;
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  distance: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlace, setSelectedPlace] = React.useState<PlaceItem | null>(
    null,
  );
  const [nearbyPlaces, setNearbyPlaces] = React.useState<PlaceItem[]>([]);

  const handlePlaceSelect = useCallback((place: PlaceItem) => {
    console.log("Place selected:", place.place_name);
    setSelectedPlace(place);
  }, []);

  const handleNearbyUpdate = useCallback((list: PlaceItem[]) => {
    console.log("Nearby places updated:", list.length);
    setNearbyPlaces(list);
  }, []);

  // SearchBar에서 장소 선택 시 호출되는 함수
  const handleSelectItem = useCallback((place: PlaceItem) => {
    console.log("Search item selected:", place.place_name);
    setSelectedPlace(place);
  }, []);

  // 카드 스와이퍼에 넘길 데이터: [선택된 장소, ...주변]
  const swiperData = useMemo(() => {
    if (!selectedPlace) return nearbyPlaces;
    // 중복 제거(id 기준)
    const rest = nearbyPlaces.filter((p) => p.id !== selectedPlace.id);
    return [selectedPlace, ...rest];
  }, [selectedPlace, nearbyPlaces]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.searchWrapper}>
          <SearchBar
            searchData={mockData.documents}
            onSelectItem={handleSelectItem}
          />
        </View>
        <View style={styles.topBarWrapper}>
          <TopBar />
        </View>
      </View>

      {/* 지도를 배경으로 전체 화면에 렌더링 */}
      <View style={styles.mapContainer}>
        <KakaoMap
          latitude={37.566826}
          longitude={126.9786567}
          onPlaceSelect={handlePlaceSelect}
          onNearbyUpdate={handleNearbyUpdate}
        />
      </View>

      <View
        style={[styles.cardSwiperWrapper, { paddingBottom: insets.bottom }]}
      >
        <MapPlaceCardSwiper
          data={swiperData}
          selectedPlace={selectedPlace}
          onSelectItem={handlePlaceSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  cardSwiperWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  searchWrapper: {
    marginBottom: 0,
  },
  topBarWrapper: {
    marginTop: 0,
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
