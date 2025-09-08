import React, { useState, useCallback } from "react";
import { Animated } from "react-native";
import FloatingButton from "@/components/main/FloatingButton";
import PlaceCardSwiper from "@/components/main/PlaceCardSwiper";

interface MapPlaceCardSwiperProps {
  onSelectItem?: (item: any) => void;
  buttonStyle?: any;
}

export default function MapPlaceCardSwiper({
  onSelectItem,
  buttonStyle = { bottom: 80 },
}: MapPlaceCardSwiperProps) {
  const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1));
  const [swiperAnimation] = useState(new Animated.Value(0));

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

  const handleFloatingButtonPress = useCallback(() => {
    console.log("FloatingButton pressed");
    setShowPlaceCardSwiper(true);

    // 버튼 사라지는 애니메이션
    animateButton(0, 100);

    // 스와이퍼 올라오는 애니메이션
    animateSwiper(1, 200);
  }, [animateButton, animateSwiper]);

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
          <PlaceCardSwiper onClose={handleClosePlaceCardSwiper} />
        </Animated.View>
      )}
    </>
  );
}
