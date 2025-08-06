import React, { useState, useCallback } from "react";
import { Animated } from "react-native";
import FloatingButton from "./FloatingButton";
import PlaceCardSwiper from "./PlaceCardSwiper";

// Types
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

interface MapPlaceCardSwiperProps {
    onSelectItem?: (item: PlaceItem) => void;
}

// Constants
const ANIMATION_CONFIG = {
    BUTTON_HIDE_DURATION: 100,
    SWIPER_SHOW_DURATION: 200,
    SWIPER_HIDE_DURATION: 200,
    BUTTON_SHOW_DURATION: 400,
    BUTTON_TRANSLATE_Y: 50,
    SWIPER_TRANSLATE_Y: 200,
    BUTTON_SCALE_RANGE: [0.8, 1],
} as const;

const FLOATING_BUTTON_STYLE = { bottom: 80 };

export default function MapPlaceCardSwiper({
    onSelectItem,
}: MapPlaceCardSwiperProps) {
    const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);
    const [buttonAnimation] = useState(new Animated.Value(1));
    const [swiperAnimation] = useState(new Animated.Value(0));

    const animateButton = useCallback(
        (toValue: number, duration: number) => {
            return Animated.timing(buttonAnimation, {
                toValue,
                duration,
                useNativeDriver: true,
            });
        },
        [buttonAnimation]
    );

    const animateSwiper = useCallback(
        (toValue: number, duration: number) => {
            return Animated.timing(swiperAnimation, {
                toValue,
                duration,
                useNativeDriver: true,
            });
        },
        [swiperAnimation]
    );

    const handleFloatingButtonPress = useCallback(() => {
        console.log("FloatingButton pressed");
        setShowPlaceCardSwiper(true);

        // Hide button and show swiper animations
        animateButton(0, ANIMATION_CONFIG.BUTTON_HIDE_DURATION).start();
        animateSwiper(1, ANIMATION_CONFIG.SWIPER_SHOW_DURATION).start();
    }, [animateButton, animateSwiper]);

    const handleClosePlaceCardSwiper = useCallback(() => {
        // Hide swiper animation
        animateSwiper(0, ANIMATION_CONFIG.SWIPER_HIDE_DURATION).start(() => {
            setShowPlaceCardSwiper(false);
        });

        // Show button animation
        animateButton(1, ANIMATION_CONFIG.BUTTON_SHOW_DURATION).start();
    }, [animateButton, animateSwiper]);

    // Animation styles
    const buttonAnimatedStyle = {
        opacity: buttonAnimation,
        transform: [
            {
                translateY: buttonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ANIMATION_CONFIG.BUTTON_TRANSLATE_Y, 0],
                }),
            },
            {
                scale: buttonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ANIMATION_CONFIG.BUTTON_SCALE_RANGE,
                }),
            },
        ],
    };

    const swiperAnimatedStyle = {
        opacity: swiperAnimation,
        transform: [
            {
                translateY: swiperAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ANIMATION_CONFIG.SWIPER_TRANSLATE_Y, 0],
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
                        style={FLOATING_BUTTON_STYLE}
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
