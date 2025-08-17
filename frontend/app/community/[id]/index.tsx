import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import routes from '@/mock-data/routes.json';
import placesData from '@/mock-data/places.json';
import { DayPlanList } from '@/components/plan/DayPlanList';
import { useLocalSearchParams } from 'expo-router';
import posts from '@/mock-data/posts.json';
import users from '@/mock-data/users.json';
import { CommunityDetailUser } from '@/components/community/CommunityDetailUser';
import { CommunityDetailContent } from '@/components/community/CommunityDetailContent';

import Header from '@/components/common/Header';
import { BookmarkButton } from '@/components/main/BookmarkButton';
import { useBookmark } from '@/app/BookmarkContext';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function CommunityPost() {
    const { id } = useLocalSearchParams();
    const post = posts.find((p) => p.id === id);
    const user = users.find((u) => u.id === post?.user_id);
    const { bookmarkedCourseIds, toggleCourseBookmark } = useBookmark();

    const MOCK_ROUTES: { [key: string]: { location: string; season: string; duration: string; images: string[] } } = {
        'route-001': {
            location: '서울',
            season: '봄',
            duration: '2일',
            images: [
                'https://example.com/image1.jpg',
                'https://example.com/image2.jpg',
                'https://example.com/image3.jpg',
            ],
        },
        'route-002': {
            location: '서울',
            season: '여름',
            duration: '1박 2일',
            images: ['https://example.com/image4.jpg', 'https://example.com/image5.jpg'],
        },
        'route-003': {
            location: '강남',
            season: '가을',
            duration: '1박 2일',
            images: ['https://example.com/image6.jpg'],
        },
        'route-004': {
            location: '부산',
            season: '여름',
            duration: '2박 3일',
            images: ['https://example.com/image7.jpg', 'https://example.com/image8.jpg'],
        },
        'route-005': {
            location: '제주',
            season: '봄',
            duration: '2박 3일',
            images: ['https://example.com/image9.jpg'],
        },
        'route-006': {
            location: '대구',
            season: '겨울',
            duration: '2박 3일',
            images: ['https://example.com/image10.jpg'],
        },
    };

    // 샘플 DayPlan 데이터 (이 페이지에서만 사용)
    const sampleDayPlans = [
        {
            id: '1',
            day: 1,
            title: '전주 한옥마을',
            places: [
                { id: '1-1', category: '회/해산물', name: '우리횟집' },
                { id: '1-2', category: '카페', name: '커피집' },
                { id: '1-3', category: '낙곱새', name: '개미집' },
            ],
        },
        {
            id: '2',
            day: 2,
            title: '순천만',
            places: [
                { id: '2-1', category: '돈카츠', name: '톤쇼우' },
                { id: '2-2', category: '베이커리', name: '코스피어' },
                { id: '2-3', category: '백반', name: '김가네' },
            ],
        },
        {
            id: '3',
            day: 3,
            title: '해운대',
            places: [
                { id: '3-1', category: '돈카츠', name: '톤쇼우' },
                { id: '3-2', category: '베이커리', name: '코스피어' },
                { id: '3-3', category: '백반', name: '김가네' },
            ],
        },
    ];

    const routeMeta = post ? MOCK_ROUTES[post.course_id] : undefined;
    const dateRange = post.created_at ? post.created_at.slice(0, 10) : '2025. 05. 04 - 05. 06';
    const location = routeMeta?.location || '전주시 무슨동';
    // 코스 id는 post.route_id에서 추출 (예: 'route-001' -> '1')
    let courseId = '';
    if (post && post.course_id) {
        // 'route-001' -> '1', 'route-002' -> '2' 등으로 변환
        courseId = post.course_id.replace('route-00', '').replace('route-0', '').replace('route-', '');
    }
    const isBookmarked = bookmarkedCourseIds.includes(courseId);

    if (!post || !user) return null;

    const route = routes.find((r) => r.id === post.course_id);
    const placeMap = Object.fromEntries((placesData.documents || []).map((p) => [p.id, p]));

    const showSample = true; // 테스트용

    let dayPlans = [];
    if (showSample) {
        dayPlans = sampleDayPlans;
    } else if (route && route.places?.length > 0) {
        dayPlans = [
            {
                id: '1',
                day: 1,
                title: route.title || '여행 코스',
                places: route.places.map((p) => {
                    const place = placeMap[p.id] || {};
                    return {
                        id: place.id || p.id,
                        category: place.category_name || '-',
                        name: place.place_name || '-',
                    };
                }),
            },
        ];
    }
    return (
        <ScrollView>
            <SafeAreaView>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <ThemedText size="2xl" weight="bold" style={styles.title}>
                            {post.title}
                        </ThemedText>
                        <BookmarkButton
                            isBookmarked={isBookmarked}
                            onPress={() => toggleCourseBookmark(courseId)}
                            size={28}
                        />
                    </View>
                    <View style={styles.userRow}>
                        <CommunityDetailUser
                            nickname={user.username || user.id}
                            profileImageUrl={user.profile_image || ''}
                            subInfo={post.created_at ? `이웃 수 NN명` : undefined}
                        />
                    </View>
                    <View style={styles.metaRow}>
                        <ThemedText style={styles.metaText}>
                            {dateRange} <ThemedText color="primary">📍 {location}</ThemedText>
                        </ThemedText>
                    </View>
                    <View style={styles.contentRow}>
                        <CommunityDetailContent
                            content={
                                post.content ||
                                '에브리바디 컴 투 광안리\n부산 비강스 강스 강스를 가보자\n의미있는 삶이 무엇인지 고민 될 찰나\n나에게 부산 바다가 찾아왔다'
                            }
                        />
                    </View>

                    <View style={styles.titleWrapper}>
                        <ThemedText size="lg" weight="bold" style={styles.title}>
                            다른 여행객분들은{'\n'}
                            <ThemedText size="lg" weight="bold" style={styles.title}>
                                <ThemedText size="lg" color="primary" weight="bold">
                                    이 코스
                                </ThemedText>
                                로 방문하셨어요
                            </ThemedText>
                        </ThemedText>
                    </View>
                </View>
                {dayPlans.length > 0 && (
                    <View style={styles.dayplan}>
                        <DayPlanList dayPlans={dayPlans} />
                    </View>
                )}
            </SafeAreaView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: Colors.white,
    },
    headerRow: {
        marginTop: 80,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        lineHeight: 35,
        marginTop: 0,
        paddingTop: 0,
    },
    BookmarkButton: {
        alignSelf: 'flex-start',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: Colors.backgroundGray,
        borderBottomWidth: 1,
        paddingBottom: 15,
    },
    metaRow: {
        marginTop: 20,
    },
    metaText: {
        color: Colors.textSecondary,
    },
    titleWrapper: {
        paddingTop: 40,
        paddingBottom: 10,
    },
    dayplan: {
        backgroundColor: Colors.backgroundGray,
        paddingTop: 0,
        marginTop: 0,
        margin: 0,
    },
});
