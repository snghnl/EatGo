// PostCourseSelect.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import Header from '@/components/common/Header';
import { AddCourseCard } from '@/components/plan/AddCourseCard';
import { CourseList } from '@/components/plan/CourseList';
import { SAMPLE_COURSES } from '@/constants/Data';
import { Colors } from '@/constants/Colors';

export default function PostCourseSelect() {
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 88; // iOS 탭바 absolute 높이

    const handleSelect = (course: any) => {
        router.push({
            pathname: '/community/post',
            params: { courseId: course.id },
        });
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Back 버튼: 레이아웃/터치 방해 방지 위해 영역 제한 */}
            <View style={styles.backBtn} pointerEvents="box-none">
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textPrimary}
                    onPress={() => router.push('/(tabs)/community')}
                />
            </View>

            <Header subtitle="여행 기록 작성할" title="코스 선택하기" />

            <View
                style={[
                    styles.container,
                    { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 12 }, // 탭바 가림 방지
                ]}
            >
                <View style={styles.addbtn}>
                    <AddCourseCard onPress={() => router.push('/plan')} />
                </View>
                <CourseList courses={[...SAMPLE_COURSES]} onCoursePress={(id) => handleSelect({ id })} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 15,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    container: {
        flex: 1,
    },
    addbtn: {
        marginBottom: 12,
        paddingHorizontal: 16,
    },
});
