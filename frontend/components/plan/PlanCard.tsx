import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { Place } from "./Place";
import { Colors } from "../../constants/Colors";

interface PlaceItem {
    id: string;
    category: string;
    name: string;
}

interface PlanCardProps {
    places: PlaceItem[];
    onPlacePress?: (placeId: string) => void;
    onCardPress?: () => void;
    onSave?: () => void;
    isSaved?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    places,
    onPlacePress,
    onCardPress,
    onSave,
    isSaved = false,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const panRef = useRef(null);
    const [isSavedState, setIsSavedState] = useState(isSaved);

    const handleGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const { translationX } = event.nativeEvent;
                // 왼쪽으로만 스와이프 가능하도록 제한
                if (translationX > 0 && translateX.__getValue() !== 0) {
                    translateX.setValue(0);
                }
                // 최대 80px 이동 제한 (초록색 배경 너비)
                if (translationX < -60) {
                    translateX.setValue(-60);
                }
            },
        }
    );

    const handleStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;

            if (translationX < -30) {
                // 스와이프가 충분히 왼쪽으로 갔을 때 저장 또는 취소
                Animated.timing(translateX, {
                    toValue: -70,
                    duration: 150,
                    useNativeDriver: true,
                }).start(() => {
                    // 저장/취소 후 원래 위치로 돌아가기
                    Animated.timing(translateX, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }).start(() => {
                        // 원래 위치로 돌아온 후에 상태 변경
                        if (isSavedState) {
                            // 이미 저장된 상태면 취소
                            setIsSavedState(false);
                        } else {
                            // 저장되지 않은 상태면 저장
                            onSave?.();
                            setIsSavedState(true);
                        }
                    });
                });
            } else {
                // 충분하지 않으면 원래 위치로
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* 초록색 저장 배경 또는 빨간색 취소 배경 */}
            <View
                style={[
                    styles.saveBackground,
                    isSavedState && styles.cancelBackground,
                ]}
            >
                <ThemedText
                    size="xs"
                    color="white"
                    weight="medium"
                    style={styles.saveText}
                >
                    {isSavedState ? "취소" : "저장"}
                </ThemedText>
            </View>

            {/* 메인 카드 */}
            <PanGestureHandler
                ref={panRef}
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleStateChange}
            >
                <Animated.View
                    style={[
                        styles.card,
                        isSavedState && styles.savedCard,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <TouchableOpacity onPress={onCardPress} activeOpacity={0.8}>
                        <View style={styles.placesContainer}>
                            {places.map((place, index) => (
                                <React.Fragment key={place.id}>
                                    <Place
                                        category={place.category}
                                        name={place.name}
                                        onPress={() => onPlacePress?.(place.id)}
                                    />
                                    {index < places.length - 1 && (
                                        <View style={styles.divider} />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
        width: "100%",
        alignItems: "center",
    },
    saveBackground: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 80,
        height: "100%",
        backgroundColor: "#68A146",
        opacity: 0.8,
        justifyContent: "center",
        alignItems: "center",
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        zIndex: 1,
    },
    saveText: {
        fontSize: 18,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: "100%",
        zIndex: 2,
    },
    savedCard: {
        borderWidth: 2,
        borderColor: "rgba(255, 71, 83, 0.8)",
    },
    placesContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    divider: {
        width: 24,
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 17,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelBackground: {
        backgroundColor: Colors.error,
    },
});
