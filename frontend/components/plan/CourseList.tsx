import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { CourseCard } from './CourseCard';
import { Colors } from '../../constants/Colors';
import { Course } from '../../types';

interface CourseListProps {
    courses: Course[];
    onCoursePress?: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onCoursePress }) => {
    return (
        <ThemedView style={styles.container}>
            <View style={styles.contentContainer}>
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        subtitle={course.subtitle}
                        title={course.title}
                        hasImages={course.hasImages}
                        onPress={() => onCoursePress?.(course.id)}
                    />
                ))}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
});
