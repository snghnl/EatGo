import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseList } from '@/components/plan/CourseList';
import { SAMPLE_COURSES } from '@/constants/Data';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import Header from '@/components/common/Header';

export default function PostCourseSelect() {
    const handleSelect = (course: any) => {
        router.push({
            pathname: '/community/post',
            params: { courseId: course.id },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header subtitle="여행 기록 작성할" title="코스 선택하기" />
            <CourseList courses={SAMPLE_COURSES} onCoursePress={handleSelect} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
    highlight: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 4,
    },
    cardSubtitle: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginBottom: 10,
    },
    imageRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    imagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 8,
    },
    moreIcon: {
        position: 'absolute',
        top: 18,
        right: 18,
    },
});
