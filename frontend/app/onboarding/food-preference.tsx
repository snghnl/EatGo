import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface FoodPreference {
  korean: boolean;
  western: boolean;
  japanese: boolean;
  chinese: boolean;
  asian: boolean;
  snack: boolean;
  hamburger: boolean;
  pizza: boolean;
  seafood: boolean;
  meat: boolean;
  bakery: boolean;
  pub: boolean;
}

export default function FoodPreferenceScreen() {
  const router = useRouter();
  const [selectedFoods, setSelectedFoods] = useState<FoodPreference>({
    korean: false,
    western: false,
    japanese: false,
    chinese: false,
    asian: false,
    snack: false,
    hamburger: false,
    pizza: false,
    seafood: false,
    meat: false,
    bakery: false,
    pub: false,
  });
  const [showCompletion, setShowCompletion] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 음식 선택 토글
  const toggleFoodSelection = (foodType: keyof FoodPreference) => {
    setSelectedFoods((prev) => ({
      ...prev,
      [foodType]: !prev[foodType],
    }));
  };

  // 완료 화면 표시 및 애니메이션
  const showCompletionScreen = () => {
    setShowCompletion(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 5초 후 페이드 아웃 및 메인 페이지 이동
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        router.push("/(tabs)/map");
      });
    }, 5000);
  };

  // 선택된 음식 개수
  const selectedCount = Object.values(selectedFoods).filter(Boolean).length;

  // 다음 단계로 이동
  const handleNext = () => {
    const selectedCount = Object.values(selectedFoods).filter(Boolean).length;
    if (selectedCount === 0) {
      // TODO: 경고 메시지 표시
      return;
    }

    // TODO: 선호 음식 데이터 저장
    console.log("선택된 음식:", selectedFoods);

    // 완료 화면 표시
    showCompletionScreen();
  };

  return (
    <SafeAreaView style={styles.container}>
      {showCompletion ? (
        // 완료 화면
        <Animated.View
          style={[styles.completionContainer, { opacity: fadeAnim }]}
        >
          <LinearGradient
            colors={["#FFB6C1", "#FFE4E6"]}
            style={styles.completionGradient}
          >
            <Text style={styles.screenIndicator}>onboard3</Text>
            <Text style={styles.completionSubtitle}>잇고와 함께하는</Text>
            <Text style={styles.completionTitle}>맛있는 여행</Text>
            <Text style={styles.completionTitle}>준비 완료</Text>
          </LinearGradient>
        </Animated.View>
      ) : (
        // 기존 음식 선택 화면
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 상단 표시 */}
            <Text style={styles.screenIndicator}>onboard1</Text>

            {/* 메인 카드 */}
            <View style={styles.mainCard}>
              {/* 상단 텍스트 */}
              <Text style={styles.motivationalText}>
                맛집 리스트가 없어도 괜찮아요!
              </Text>

              {/* 메인 제목 */}
              <Text style={styles.mainTitle}>선호하는 음식 테마</Text>

              {/* 음식 선택 그리드 */}
              <View style={styles.foodGrid}>
                {/* 1행 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.korean && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("korean")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>한식</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.western && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("western")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>양식</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.japanese && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("japanese")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>일식</Text>
                  </TouchableOpacity>
                </View>

                {/* 2행 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.chinese && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("chinese")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>중식</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.asian && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("asian")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>아시안</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.snack && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("snack")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>분식</Text>
                  </TouchableOpacity>
                </View>

                {/* 3행 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.hamburger && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("hamburger")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>햄버거</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.pizza && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("pizza")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>피자</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.seafood && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("seafood")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>생선/해산물</Text>
                  </TouchableOpacity>
                </View>

                {/* 4행 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.meat && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("meat")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>고기</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.bakery && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("bakery")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>베이커리/카페</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.foodButton,
                      selectedFoods.pub && styles.foodButtonSelected,
                    ]}
                    onPress={() => toggleFoodSelection("pub")}
                  >
                    <View style={styles.foodIcon}>
                      <Ionicons name="restaurant" size={24} color="#6B7280" />
                    </View>
                    <Text style={styles.foodText}>술집</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 다음 버튼 */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  selectedCount > 0 && styles.nextButtonActive,
                ]}
                onPress={handleNext}
                disabled={selectedCount === 0}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    selectedCount > 0 && styles.nextButtonTextActive,
                  ]}
                >
                  다음
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE4E6",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  screenIndicator: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4757",
    textAlign: "center",
    marginBottom: 32,
  },
  foodGrid: {
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  foodButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  foodButtonSelected: {
    backgroundColor: "#FFE4E6",
    borderWidth: 2,
    borderColor: "#FF4757",
  },
  foodIcon: {
    marginBottom: 8,
  },
  foodText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "500",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#9CA3AF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonActive: {
    backgroundColor: "#FF4757",
  },
  nextButtonText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: "600",
  },
  nextButtonTextActive: {
    color: Colors.white,
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFE4E6",
  },
  completionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 30,
  },
  completionSubtitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4757",
    textAlign: "center",
    marginBottom: 10,
  },
});
