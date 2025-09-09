import React, { useState, useCallback } from "react";
import { Animated, Alert } from "react-native";
import FloatingButton from "@/components/main/FloatingButton";
import PlaceCardSwiper from "@/components/main/PlaceCardSwiper";
import { placesService, type Place } from "@/services/placesService";

interface MapPlaceCardSwiperProps {
  onSelectItem?: (item: any) => void;
  buttonStyle?: any;
  mapCenter?: { lat: number; lng: number } | null;
}

export default function MapPlaceCardSwiper({
  onSelectItem,
  buttonStyle = { bottom: 80 },
  mapCenter,
}: MapPlaceCardSwiperProps) {
  const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1));
  const [swiperAnimation] = useState(new Animated.Value(0));
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const animateButton = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(buttonAnimation, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [buttonAnimation],
  );

  const animateSwiper = useCallback(
    (toValue: number, duration: number, callback?: () => void) => {
      Animated.timing(swiperAnimation, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start(callback);
    },
    [swiperAnimation],
  );

  const fetchNearbyPlaces = useCallback(async () => {
    if (!mapCenter) {
      Alert.alert('지도 위치 필요', '지도 중심 위치를 확인할 수 없습니다.');
      return;
    }

    console.log('Fetching places for map center:', mapCenter);
    setLoadingPlaces(true);
    try {
      const centerCoordinates = {
        latitude: mapCenter.lat,
        longitude: mapCenter.lng
      };
      const nearbyPlaces = await placesService.getRecommendedPlaces(centerCoordinates, {
        maxDistanceKm: 1.0,
        limit: 5,
        categoryFilter: ['음식점']
      });
      console.log('Found nearby places:', nearbyPlaces.length);
      setPlaces(nearbyPlaces);
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
      Alert.alert('오류', '주변 맛집 정보를 가져올 수 없습니다. 다시 시도해주세요.');
    } finally {
      setLoadingPlaces(false);
    }
  }, [mapCenter]);

  const handleFloatingButtonPress = useCallback(async () => {
    console.log("FloatingButton pressed");
    console.log("Current map center:", mapCenter);

    setShowPlaceCardSwiper(true);

    // 버튼 사라지는 애니메이션
    animateButton(0, 100);

    // 스와이퍼 올라오는 애니메이션
    animateSwiper(1, 200);

    // 지도 중심 기준으로 주변 맛집 가져오기
    await fetchNearbyPlaces();
  }, [animateButton, animateSwiper, mapCenter, fetchNearbyPlaces]);

  const handleClosePlaceCardSwiper = useCallback(() => {
    // 스와이퍼 내려가는 애니메이션
    animateSwiper(0, 200, () => {
      setShowPlaceCardSwiper(false);
    });

    // 버튼 나타나는 애니메이션
    animateButton(1, 400);
  }, [animateSwiper, animateButton]);

  // 버튼 애니메이션 스타일
  const buttonAnimatedStyle = {
    opacity: buttonAnimation,
    transform: [
      {
        translateY: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
      {
        scale: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  // 스와이퍼 애니메이션 스타일
  const swiperAnimatedStyle = {
    opacity: swiperAnimation,
    transform: [
      {
        translateY: swiperAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [200, 0],
        }),
      },
    ],
  };

  return (
    <>
      {!showPlaceCardSwiper && (
        <Animated.View style={buttonAnimatedStyle}>
          <FloatingButton
            onPress={handleFloatingButtonPress}
            style={buttonStyle}
          />
        </Animated.View>
      )}

      {showPlaceCardSwiper && (
        <Animated.View style={swiperAnimatedStyle}>
          <PlaceCardSwiper
            onClose={handleClosePlaceCardSwiper}
            places={places}
            loading={loadingPlaces}
          />
        </Animated.View>
      )}
    </>
  );
}
