import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
} from "react-native";
import {
    DateInput,
    DestinationSelector,
    FoodSelector,
} from "@/components/plan";
import { Colors } from "@/constants/Colors";
import { MODAL_STEP_TITLES, ANIMATION_CONFIG } from "@/constants/Data";
import {
    CreateCourseData,
    DateChangeHandler,
    DestinationChangeHandler,
    FoodChangeHandler,
} from "@/types";
import { getTodayFormatted, getSubtitleByDate } from "@/utils/dateUtils";

interface CreateCourseModalProps {
    visible: boolean;
    onClose: () => void;
    onComplete?: (data: CreateCourseData) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
    visible,
    onClose,
    onComplete,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [startDate, setStartDate] = useState(getTodayFormatted());
    const [endDate, setEndDate] = useState("");
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
        []
    );
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const stepSlideAnim = useRef(new Animated.Value(0)).current;

    // 애니메이션 유틸리티 함수
    const animateSlide = (
        animValue: Animated.Value,
        toValue: number,
        onComplete?: () => void
    ) => {
        Animated.timing(animValue, {
            toValue,
            duration: ANIMATION_CONFIG.DURATION,
            useNativeDriver: true,
        }).start(onComplete);
    };

    // 단계 전환 애니메이션 함수
    const animateStepTransition = (
        direction: "next" | "prev",
        newStep: number
    ) => {
        const startValue = direction === "next" ? -1 : 1;
        const endValue = direction === "next" ? 1 : -1;

        animateSlide(stepSlideAnim, startValue, () => {
            setCurrentStep(newStep);
            stepSlideAnim.setValue(endValue);
            animateSlide(stepSlideAnim, 0);
        });
    };

    // 모달 등장/사라짐 애니메이션
    useEffect(() => {
        if (visible) {
            // 오늘 날짜로 초기화
            setStartDate(getTodayFormatted());
            setEndDate("");

            slideAnim.setValue(1);
            animateSlide(slideAnim, 0);
        } else {
            animateSlide(slideAnim, 1);
        }
    }, [visible, slideAnim]);

    const handleDateChange: DateChangeHandler = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };

    const handleDestinationChange: DestinationChangeHandler = (
        destinations
    ) => {
        setSelectedDestinations(destinations);
    };

    const handleFoodChange: FoodChangeHandler = (foods) => {
        setSelectedFoods(foods);
    };

    const handleNext = () => {
        if (currentStep < 3) {
            animateStepTransition("next", currentStep + 1);
        } else {
            console.log("여행 계획 완료", {
                startDate,
                endDate,
                selectedDestinations,
                selectedFoods,
            });
            animateSlide(slideAnim, 1, () => {
                onComplete?.({
                    startDate,
                    endDate,
                    selectedDestinations,
                    selectedFoods,
                });
                onClose();
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            animateStepTransition("prev", currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <DateInput
                            startDate={startDate}
                            endDate={endDate}
                            onDateChange={handleDateChange}
                        />
                        {endDate && (
                            <Text style={styles.subtitlePreview}>
                                {getSubtitleByDate(startDate, endDate)}
                            </Text>
                        )}
                    </>
                );
            case 2:
                return (
                    <DestinationSelector
                        onDestinationChange={handleDestinationChange}
                    />
                );
            case 3:
                return <FoodSelector onFoodChange={handleFoodChange} />;
            default:
                return null;
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.modal,
                    {
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [-1, 0, 1],
                                    outputRange: [
                                        -ANIMATION_CONFIG.SLIDE_DISTANCE,
                                        0,
                                        ANIMATION_CONFIG.SLIDE_DISTANCE,
                                    ],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {
                            MODAL_STEP_TITLES[
                                currentStep as keyof typeof MODAL_STEP_TITLES
                            ]
                        }
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.animatedContent,
                            {
                                transform: [
                                    {
                                        translateX: stepSlideAnim.interpolate({
                                            inputRange: [-1, 0, 1],
                                            outputRange: [
                                                -ANIMATION_CONFIG.SLIDE_DISTANCE,
                                                0,
                                                ANIMATION_CONFIG.SLIDE_DISTANCE,
                                            ],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {renderStepContent()}
                    </Animated.View>
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.leftButtonContainer}>
                        {currentStep > 1 && (
                            <TouchableOpacity
                                onPress={handlePrevious}
                                style={styles.previousButton}
                            >
                                <Text style={styles.previousText}>이전</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleNext}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextText}>
                            {currentStep === 3
                                ? "추천 코스와 함께 계획하러 가기"
                                : "다음"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(245, 245, 245, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    modal: {
        width: "100%",
        maxWidth: 400,
        maxHeight: "85%",
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 24,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    closeText: {
        fontSize: 20,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
    },
    animatedContent: {
        flex: 1,
    },
    subtitlePreview: {
        marginTop: 12,
        color: Colors.textSecondary,
        textAlign: "center",
    },
    footer: {
        marginTop: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftButtonContainer: {
        flex: 1,
        alignItems: "flex-start",
    },
    previousButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    previousText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
    nextButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "flex-end",
    },
    nextText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});
