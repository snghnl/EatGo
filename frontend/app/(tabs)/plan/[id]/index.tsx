// (tabs)/plan/[id]/index.ts
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AddCourseCard } from '@/components/plan';
import { DayPlanListContainer } from '@/components/plan/DayPlanListContainer'; // ✅ 컨테이너로 교체
import PlaceCardSwiper from '@/components/main/PlaceCardSwiper';
import Header from '@/components/common/Header';
import ActionButtons from '@/components/common/ActionButtons';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// 코스 데이터 인터페이스
interface CourseData {
  id: string;
  startDate: string;
  endDate: string;
  selectedDestinations: string[];
  selectedFoods: string[];
  title: string;
  subtitle: string;
}

export default function PlanDetailScreen() {
  const { id, startDate, endDate, destinations, foods, isNew } =
    useLocalSearchParams<{
      id: string;
      startDate?: string;
      endDate?: string;
      destinations?: string;
      foods?: string;
      isNew?: string;
    }>();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedDayPlanId, setSelectedDayPlanId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showPlaceCardSwiper, setShowPlaceCardSwiper] = useState(false);

  // 새 코스인지 판단 (isNew 파라미터가 'true'이면 새 코스)
  const isNewCourse = isNew === 'true';

  // 제목/부제 생성 (현재는 URL 파라미터 기반, 추후 서버 데이터로 대체 가능)
  const generateTitleAndSubtitle = () => {
    let title = '새로운 여행 코스';
    let subtitle = '새로운 여행 계획';

    if (destinations) {
      const destinationList = destinations.split(',');
      if (destinationList.length > 0) {
        const mainDestination = destinationList[0];
        title = `${mainDestination} 여행 코스`;
      }
    }

    if (startDate && endDate) {
      const startMonth = parseInt(startDate.split('.')[1]);
      const endMonth = parseInt(endDate.split('.')[1]);

      if ((startMonth >= 6 && startMonth <= 8) || (endMonth >= 6 && endMonth <= 8)) {
        subtitle = '이열치열 여름 나기';
      } else if ((startMonth >= 3 && startMonth <= 5) || (endMonth >= 3 && endMonth <= 5)) {
        subtitle = '봄바람 휘날리는 계절';
      } else if ((startMonth >= 9 && startMonth <= 11) || (endMonth >= 9 && endMonth <= 11)) {
        subtitle = '단풍 물든 가을 여행';
      } else {
        subtitle = '눈 내리는 겨울 풍경';
      }
    }

    return { title, subtitle };
  };

  useEffect(() => {
    if (!id) return;

    // TODO: 실제로는 course 상세 API로부터 가져오길 권장
    // SOURCE: ??? (예: GET https://api.example.com/courses/:courseId)
    const { title, subtitle } = generateTitleAndSubtitle();

    const newCourseData: CourseData = {
      id: String(id),
      startDate: startDate || '25.07.05', // SOURCE: URL 파라미터(임시값)
      endDate: endDate || '25.07.07', // SOURCE: URL 파라미터(임시값)
      selectedDestinations: destinations ? destinations.split(',') : ['전주', '순천'], // SOURCE: URL 파라미터(임시값)
      selectedFoods: foods ? foods.split(',') : ['한식', '카페'], // SOURCE: URL 파라미터(임시값)
      title,
      subtitle,
    };
    setCourseData(newCourseData);
  }, [id, startDate, endDate, destinations, foods]);

  const handleEdit = () => {
    console.log('코스 편집 버튼 클릭');
    // TODO: 편집 화면 이동 또는 편집 모드 전환
  };

  const handleCardPress = (dayPlanId: string) => {
    console.log('카드 클릭:', dayPlanId);
    // TODO: 카드 전체 액션 (예: 스와이프 저장/상세 이동)
  };

  const handleSave = (dayPlanId: string) => {
    console.log('저장:', dayPlanId);
    // TODO: 해당 일차 계획 저장 API 호출
    // SOURCE: ??? (예: POST /courses/:courseId/day-plans/:dayPlanId/save)
  };

  const handleRecommendationPress = (day: number) => {
    console.log(`${day}일차 추천 여행경로 보러가기 클릭`);
    router.push({
      pathname: `/plan/${id}/recommendation` as any,
      params: {
        id: id,
        courseId: id,
        day: day.toString(),
        startDate: startDate,
        endDate: endDate,
        destinations: destinations,
        foods: foods,
      },
    });
  };

  const handleNewCourseRecommendationPress = () => {
    console.log('새 코스 추천 여행경로 보러가기 클릭');
    router.push({
      pathname: `/plan/${id}/recommendation` as any,
      params: {
        id: id,
        courseId: id,
        startDate: startDate,
        endDate: endDate,
        destinations: destinations,
        foods: foods,
      },
    });
  };

  const handleAddRecommendation = () => {
    console.log('추천 경로 저장하기 클릭');
    router.push({
      pathname: `/plan/${id}/recommendation` as any,
      params: {
        courseId: id,
        startDate: startDate,
        endDate: endDate,
        destinations: destinations,
        foods: foods,
      },
    });
  };

  const handleLongPress = (dayPlanId: string) => {
    console.log('PlanCard long press:', dayPlanId);
    setSelectedDayPlanId(dayPlanId);
  };

  const handlePlacePress = (dayPlanId: string, placeId: string) => {
    console.log('Place pressed:', dayPlanId, placeId);
    if (selectedDayPlanId === dayPlanId) {
      setSelectedPlaceId(placeId);
      setShowPlaceCardSwiper(true);
    } else {
      // 일반적인 place 터치 (상세 페이지로 이동 등)
      console.log('장소 클릭:', dayPlanId, placeId);
      // TODO: 장소 상세로 이동
      // SOURCE: ??? (예: router.push(`/place/${placeId}`))
    }
  };

  const handleClosePlaceCardSwiper = () => {
    setShowPlaceCardSwiper(false);
    setSelectedPlaceId(null);
    setSelectedDayPlanId(null);
  };

  const handlePlaceSelect = (selectedPlace: any) => {
    console.log('Place selected for replacement:', selectedPlace);
    Alert.alert(
      `${selectedPlace.place_name}로 교체하시겠습니까?`,
      '교체하면 기존 장소가 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '교체',
          onPress: () => {
            // TODO: 실제 교체 로직 (API 호출 후 재조회)
            // SOURCE: ??? (예: PUT /courses/:courseId/day-plans/:dayPlanId/places)
            console.log(
              `교체 시도: ${selectedPlace.place_name} (ID: ${selectedPlace.id})`
            );
            alert(`${selectedPlace.place_name}로 교체되었습니다!`);
          },
        },
      ]
    );
  };

  if (!courseData) return null; // 로딩 중 (필요시 스켈레톤 추가)

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ position: 'absolute', top: 70, left: 15, zIndex: 10 }}>
        <Ionicons
          name="chevron-back"
          size={20}
          color={Colors.textPrimary}
          onPress={() => router.push('/(tabs)/plan')}
        />
      </View>

      <Header title={courseData.title} subtitle={courseData.subtitle} />

      <View style={styles.actionSection}>
        <ActionButtons actions={[{ label: '편집', onPress: handleEdit }]} />
      </View>

      {/* 새 코스인 경우 AddCourseCard만 표시, 기존 코스인 경우 DayPlanListContainer 표시 */}
      {isNewCourse ? (
        <View style={styles.addRecommendationContainer}>
          <AddCourseCard
            onPress={handleNewCourseRecommendationPress}
            text="추천 여행 경로 확인하기"
          />
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* 기존 코스의 경우 추천 경로 저장하기 버튼 */}
          <View style={styles.addRecommendationContainer}>
            <AddCourseCard onPress={handleAddRecommendation} text="추천 경로 저장하기" />
          </View>

          {/* ✅ 실제 데이터 컨테이너: mock 제거 */}
          <DayPlanListContainer
            courseId={String(id)}
            isNewCourse={false}
            onPlacePress={handlePlacePress}
            onCardPress={handleCardPress}
            onSave={handleSave}
            onRecommendationPress={handleRecommendationPress}
            onLongPress={handleLongPress}
            selectedPlaceId={selectedPlaceId}
            activeDayPlanId={selectedDayPlanId}
          />
        </ScrollView>
      )}

      {/* PlaceCardSwiper */}
      {showPlaceCardSwiper && (
        <PlaceCardSwiper
          onClose={handleClosePlaceCardSwiper}
          onPlaceSelect={handlePlaceSelect}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  actionSection: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  addRecommendationContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scrollContainer: { flex: 1 },
});
