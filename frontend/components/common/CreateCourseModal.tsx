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
    const [startDate, setStartDate] = useState("");
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
            // 모든 상태를 초기화
            setCurrentStep(1);
            setStartDate("");
            setEndDate("");
            setSelectedDestinations([]);
            setSelectedFoods([]);
            stepSlideAnim.setValue(0);

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

    // 각 단계별 입력 완성 여부 확인
    const isStepComplete = (step: number): boolean => {
        switch (step) {
            case 1:
                return startDate !== "" && endDate !== "";
            case 2:
                return selectedDestinations.length > 0;
            case 3:
                return selectedFoods.length > 0;
            default:
                return false;
        }
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
                        {/* 서브타이틀 미리보기 제거 
                        {endDate && (
                            <Text style={styles.subtitlePreview}>
                                {getSubtitleByDate(startDate, endDate)}
                            </Text>
                        )}
                        */}
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

                <View style={styles.content}>{renderStepContent()}</View>

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
                        style={[
                            styles.nextButton,
                            !isStepComplete(currentStep) &&
                                styles.nextButtonDisabled,
                        ]}
                        disabled={!isStepComplete(currentStep)}
                    >
                        <Text
                            style={[
                                styles.nextText,
                                !isStepComplete(currentStep) &&
                                    styles.nextTextDisabled,
                            ]}
                        >
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
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    modal: {
        width: "100%",
        maxWidth: 400,
        minHeight: 500,
        maxHeight: "85%",
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 16,
    },
    closeText: {
        fontSize: 18,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.textPrimary,
        flex: 1,
    },
    content: {
        flex: 1,
        minHeight: 200,
    },
    subtitlePreview: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        color: Colors.textSecondary,
        textAlign: "center",
        fontSize: 14,
    },
    footer: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftButtonContainer: {
        flex: 1,
        alignItems: "flex-start",
    },
    previousButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    previousText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    nextButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
    },
    nextButtonDisabled: {
        backgroundColor: "#e0e0e0",
        opacity: 0.7,
    },
    nextText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
        textAlign: "center",
    },
    nextTextDisabled: {
        color: "#a0a0a0",
    },
});
