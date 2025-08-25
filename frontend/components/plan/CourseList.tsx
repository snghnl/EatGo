// components/plan/CourseList.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '../../constants/Colors';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { AddCourseCard } from './AddCourseCard'; // ✅ 주신 AddCourseCard 그대로 사용

interface CourseListProps {
  courses: Course[];
  onAddCourse?: () => void;
  newCourse?: {
    id: string;
    title: string;
    subtitle: string;
    hasImages?: boolean;
  } | null;
  onCoursePress?: (courseId: string) => void;
  addButtonText?: string; // ✅ (+ 새 여행경로 만들기) 문구 커스텀
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  onAddCourse,
  newCourse,
  onCoursePress,
  addButtonText = '+ 새 여행경로 만들기',
}) => {
  const [list, setList] = React.useState<Course[]>(courses ?? []);

  React.useEffect(() => {
    setList(courses ?? []);
  }, [courses]);

  React.useEffect(() => {
    if (newCourse) {
      const item: Course = {
        id: newCourse.id,
        title: newCourse.title,
        subtitle: newCourse.subtitle,
        hasImages: newCourse.hasImages || false,
      };
      // 중복 방지(같은 id가 이미 있으면 prepend 안 함)
      setList((prev) => (prev.some((c) => c.id === item.id) ? prev : [item, ...prev]));
    }
  }, [newCourse]);

  const navigateDefault = (courseId: string) => {
    router.push({ pathname: `/plan/${courseId}` as any, params: { id: courseId } });
  };

  const handleCoursePress = (courseId: string) => {
    if (onCoursePress) return onCoursePress(courseId);
    navigateDefault(courseId);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ 최상단: AddCourseCard */}
        <View style={styles.addCardContainer}>
          <AddCourseCard onPress={onAddCourse} text={addButtonText} />
        </View>

        {/* 리스트 */}
        <View style={styles.listContainer}>
          {list.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText color="textSecondary">코스 데이터가 없습니다.</ThemedText>
            </View>
          ) : (
            list.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                subtitle={course.subtitle}
                hasImages={course.hasImages}
                onPress={() => handleCoursePress(course.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  addCardContainer: { paddingTop: 16, paddingHorizontal: 16 },
  listContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyContainer: { alignItems: 'center', padding: 24 },
});
