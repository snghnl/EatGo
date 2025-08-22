import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useBookmark } from '@/store/BookmarkContext';
import { BookmarkButton } from '@/components/main/BookmarkButton';
import { DayPlanListContainer } from '@/components/plan/DayPlanListContainer';

import { CommunityDetailUser } from '@/components/community/CommunityDetailUser';
import { CommunityDetailContent } from '@/components/community/CommunityDetailContent';

import { usePostStore } from '@/store/posts';
import mockPosts from '@/mock-data/posts.json';
import users from '@/mock-data/users.json';

export default function CommunityPost() {
    const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
    const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;

    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [selectedDayPlanId, setSelectedDayPlanId] = useState<string | null>(null);

    const { getPostById } = usePostStore();
    const storePost = id ? getPostById(id) : undefined;
    const mockPost = !storePost && id ? (mockPosts as any[]).find((p) => String(p.id) === String(id)) : undefined;

    const post: any = useMemo(() => {
        if (storePost) return storePost;
        if (mockPost) {
            return {
                id: String(mockPost.id),
                title: mockPost.title,
                content: mockPost.content,
                images: mockPost.images ?? [],
                courseId: String(mockPost.course_id ?? ''),
                createdAt: mockPost.created_at ?? Date.now(),
                user_id: mockPost.user_id,
            };
        }
        return undefined;
    }, [storePost, mockPost]);

    const user = post ? users.find((u) => String(u.id) === String(post.user_id ?? u?.id)) ?? users[0] : undefined;
    const { bookmarkedCourseIds, toggleCourseBookmark } = useBookmark();

    if (!id || !post || !user) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <ThemedText>게시글을 찾을 수 없어요.</ThemedText>
            </View>
        );
    }

    // ✅ 날짜만 표시 (YYYY. MM. DD)
    const dateText = useMemo(() => {
        const d = new Date(post.createdAt ?? Date.now());
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}. ${m}. ${day}`;
    }, [post.createdAt]);

    const courseKey = String(post.courseId ?? '');
    const isBookmarked = bookmarkedCourseIds.includes(courseKey);

    const handlePlacePress = (dayPlanId: string, placeId: string) => {
        setSelectedDayPlanId(dayPlanId);
        setSelectedPlaceId(placeId);
    };
    const handleCardPress = (dayPlanId: string) => setSelectedDayPlanId(dayPlanId);
    const handleLongPress = (dayPlanId: string) => {};
    const handleSave = (dayPlanId: string) => {};

    return (
        <ScrollView>
            <SafeAreaView>
                {/* ✅ 뒤로가기 버튼 (UI 참고: 상단 고정, 색상 수정) */}
                <View style={{ position: 'absolute', top: 30, left: 15, zIndex: 10 }}>
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={Colors.textSecondary}
                        onPress={() => router.back()}
                    />
                </View>

                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <ThemedText size="2xl" weight="bold" style={styles.title}>
                            {post.title}
                        </ThemedText>
                        <BookmarkButton
                            isBookmarked={isBookmarked}
                            onPress={() => toggleCourseBookmark(courseKey)}
                            size={28}
                        />
                    </View>

                    <View style={styles.userRow}>
                        <CommunityDetailUser
                            nickname={user.username || user.id}
                            profileImageUrl={user.profile_image || ''}
                            subInfo={`작성: ${dateText}`} // ✅ 날짜만
                        />
                    </View>

                    <View style={styles.metaRow}>
                        <ThemedText style={styles.metaText}>
                            <ThemedText>여행 기간</ThemedText>
                            <ThemedText color="primary">📍 지역: {courseKey || '-'}</ThemedText>
                        </ThemedText>
                    </View>

                    <View style={styles.contentRow}>
                        <CommunityDetailContent content={post.content ?? ''} />
                    </View>
                </View>

                <View style={styles.dayplan}>
                    <DayPlanListContainer
                        courseId={courseKey}
                        isNewCourse={false}
                        onPlacePress={handlePlacePress}
                        onCardPress={handleCardPress}
                        onSave={handleSave}
                        onLongPress={handleLongPress}
                        selectedPlaceId={selectedPlaceId}
                        activeDayPlanId={selectedDayPlanId}
                    />
                </View>
            </SafeAreaView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 15, backgroundColor: Colors.white },
    headerRow: {
        marginTop: 50,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: { lineHeight: 35, marginTop: 0, paddingTop: 0 },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: Colors.backgroundGray,
        borderBottomWidth: 1,
        paddingBottom: 15,
    },
    metaRow: { marginTop: 20 },
    metaText: { color: Colors.textSecondary },
    contentRow: { marginTop: 16 },
    dayplan: { backgroundColor: Colors.backgroundGray, paddingTop: 0, marginTop: 0, margin: 0 },
});
