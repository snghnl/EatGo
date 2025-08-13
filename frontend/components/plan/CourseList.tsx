import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { CourseCard } from './CourseCard';
import { Colors } from '../../constants/Colors';
import { Course } from '../../types';
import { ThemedText } from '../ThemedText';
interface CourseListProps {
    courses: Course[];
    onCoursePress?: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onCoursePress }) => {
    console.log('CourseList received courses:', courses);
    return (
        <ThemedView style={styles.container}>
            <View style={styles.contentContainer}>
                {courses.length === 0 ? (
                    <View style={{ alignItems: 'center', padding: 24 }}>
                        <ThemedText color="textSecondary">코스 데이터가 없습니다.</ThemedText>
                    </View>
                ) : (
                    courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            subtitle={course.subtitle}
                            title={course.title}
                            hasImages={course.hasImages}
                            onPress={() => onCoursePress?.(course.id)}
                        />
                    ))
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: 'transparent',
        marginTop: 8,
        marginBottom: 8,
        shadowColor: Colors.black,
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    contentContainer: {
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
});
