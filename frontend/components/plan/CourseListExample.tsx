import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedView } from '../ThemedView';
import { CourseList } from './CourseList';
import { AddCourseCard } from './AddCourseCard';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { SAMPLE_COURSES } from '../../constants/Data';
import { Course } from '../../types';

export const CourseListExample: React.FC<{
    onAddCourse?: () => void;
    newCourse?: {
        id: string;
        title: string;
        subtitle: string;
        hasImages?: boolean;
    } | null;
}> = ({ onAddCourse, newCourse }) => {
    const [courses, setCourses] = useState<Course[]>([...SAMPLE_COURSES]);

    // 새 코스가 추가되면 목록 맨 위에 추가
    React.useEffect(() => {
        if (newCourse) {
            const courseToAdd: Course = {
                id: newCourse.id,
                title: newCourse.title,
                subtitle: newCourse.subtitle,
                hasImages: newCourse.hasImages || false,
            };
            setCourses((prevCourses) => [courseToAdd, ...prevCourses]);
        }
    }, [newCourse]);

    const handleAddCourse = () => {
        console.log('새 여행경로 만들기 클릭');
        onAddCourse?.();
    };

    const handleCoursePress = (courseId: string) => {
        console.log('코스 클릭:', courseId);
        router.push(`/course/${courseId}`);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.addCardContainer}>
                    <AddCourseCard onPress={handleAddCourse} />
                </View>

                <CourseList courses={courses} onCoursePress={handleCoursePress} />
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    addCardContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
});
