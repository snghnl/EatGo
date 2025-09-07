import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import MyPageHeader from '@/components/mypage/MyPageHeader';
import usersData from '@/mock-data/users.json';
import { MyPageTabs } from '@/components/mypage/MyPageTabs';
import DropdownSort from '@/components/mypage/DropdownSort';
import { PlaceCard } from '@/components/main/PlaceCard';
import placesData from '@/mock-data/places.json';
import { CourseCard } from '@/components/plan';
import { SAMPLE_COURSES } from '@/constants/Data';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { usePostStore } from '@/store/posts';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ReportModal from '@/components/community/ReportModal';

const UserProfilePage = () => {
    // ✅ 모든 Hook들을 먼저 선언
    const { uid } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<'places' | 'courses' | 'saved'>('places');
    const [sortOption, setSortOption] = useState('최신순');
    const [userData, setUserData] = useState<any>(null);
    const [userPlaces, setUserPlaces] = useState<any[]>([]);
    const [userCourses, setUserCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { posts, getPostsByCourse } = usePostStore();
    const [reportOpen, setReportOpen] = useState(false);

    // ✅ useEffect도 Hook이므로 조건부 렌더링 전에 위치
    useEffect(() => {
        const initializeUserData = () => {
            try {
                setIsLoading(true);

                // uid를 기반으로 사용자 데이터를 찾거나 로드
                const foundUser = usersData.find(
                    (user) => String(user.id) === String(uid) || user.username === String(uid)
                );

                if (foundUser) {
                    setUserData(foundUser);
                    loadUserData(String(foundUser.id));
                } else {
                    // 사용자를 찾을 수 없는 경우 기본 데이터 설정
                    setUserData(usersData[0]);
                    loadUserData(String(usersData[0].id));
                }
            } catch (error) {
                console.error('사용자 데이터 로딩 실패:', error);
                setUserData(usersData[0]);
                loadUserData(String(usersData[0].id));
            } finally {
                setIsLoading(false);
            }
        };

        if (uid) {
            initializeUserData();
        } else {
            setIsLoading(false);
        }
    }, [uid]);

    // ✅ 일반 함수는 Hook 선언 후에 위치
    const loadUserData = (userId: string) => {
        try {
            // 실제로는 API 호출로 해당 사용자의 데이터를 가져와야 합니다
            // 여기서는 샘플 데이터를 사용합니다

            // 사용자의 공개 장소 데이터 (실제로는 API에서 가져옴)
            const userPublicPlaces = placesData.documents?.slice(0, 2) || [];
            setUserPlaces(userPublicPlaces);

            // 사용자의 공개 코스 데이터 (실제로는 API에서 가져옴)
            const userPublicCourses = SAMPLE_COURSES?.slice(0, 2) || [];
            setUserCourses(userPublicCourses);
        } catch (error) {
            console.error('사용자 장소/코스 데이터 로딩 실패:', error);
            setUserPlaces([]);
            setUserCourses([]);
        }
    };

    // ✅ 조건부 렌더링은 모든 Hook 선언 후에
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ThemedText>사용자 정보를 불러오는 중...</ThemedText>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ThemedText>사용자 정보를 찾을 수 없습니다.</ThemedText>
            </View>
        );
    }

    return (
        <ScrollView>
            <SafeAreaView>
                <View style={styles.container}>
                    <View style={styles.topbar}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={Colors.textPrimary}
                            onPress={() => router.push('/(tabs)/community/')}
                        />
                        <Ionicons
                            name="alert-circle-outline"
                            size={20}
                            color={Colors.textSecondary}
                            onPress={() => setReportOpen(true)}
                        />
                    </View>
                    <View style={styles.headerSection} />
                    <MyPageHeader
                        username={userData.username || `사용자 ${userData.id}`}
                        neighborCount={userData.followers_count || 0}
                        profileImageUrl={userData.profile_image}
                    />
                    <MyPageTabs style={styles.tabs} onTabChange={(tab) => setActiveTab(tab)} />
                </View>

                {activeTab === 'places' && (
                    <View style={[styles.dropdownWrapper, { position: 'relative', overflow: 'visible', zIndex: 10 }]}>
                        <DropdownSort selected={sortOption} onSelect={(value) => setSortOption(value)} />
                    </View>
                )}

                <View style={styles.cardWrapper}>
                    {activeTab === 'places' && (
                        <View>
                            {userPlaces.length > 0 ? (
                                userPlaces.map((place) => (
                                    <PlaceCard
                                        key={`place-${place.id}`}
                                        id={place.id}
                                        name={place.place_name}
                                        category={place.category_name}
                                        distance={place.distance}
                                        address={place.road_address_name}
                                        description={place.category_name}
                                        imageUrl={'https://source.unsplash.com/random/300x300?food'}
                                        isBookmarked={false}
                                        onBookmark={() => {}}
                                        isSaved={false}
                                    />
                                ))
                            ) : (
                                <ThemedText style={styles.emptyText}>공개된 장소가 없습니다.</ThemedText>
                            )}
                        </View>
                    )}

                    {activeTab === 'courses' && (
                        <View>
                            {userCourses.length > 0 ? (
                                userCourses.map((course) => {
                                    // ✅ 안전한 함수 호출
                                    const courseId = String(course.id);
                                    const post = getPostsByCourse ? getPostsByCourse(courseId)?.[0] : undefined;

                                    return (
                                        <CourseCard
                                            key={`course-${course.id}`}
                                            subtitle={course.subtitle}
                                            title={course.title}
                                            hasImages={course.hasImages}
                                            onPress={() => {
                                                try {
                                                    if (post) {
                                                        router.push({
                                                            pathname: '/community/[id]',
                                                            params: { id: post.id },
                                                        });
                                                    } else {
                                                        alert('해당 코스에 작성된 게시글이 없습니다.');
                                                    }
                                                } catch (error) {
                                                    console.error('네비게이션 오류:', error);
                                                    alert('페이지 이동 중 오류가 발생했습니다.');
                                                }
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <ThemedText style={styles.emptyText}>공개된 여행코스가 없습니다.</ThemedText>
                            )}
                        </View>
                    )}

                    {activeTab === 'saved' && (
                        <View>
                            <ThemedText style={styles.emptyText}>
                                다른 사용자의 저장한 여행경로는 볼 수 없습니다.
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
            <ReportModal
                visible={reportOpen}
                onClose={() => setReportOpen(false)}
                subjectType="user"
                subjectId={userData.id}
                subjectName={userData.username ?? String(userData.id)}
                headerTitle="사용자 신고"
                onSubmit={(payload) => {
                    console.log('신고 제출', payload);
                }}
            />
        </ScrollView>
    );
};

export default UserProfilePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    topbar: {
        position: 'absolute',
        top: 20,
        left: 15,
        right: 30,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerSection: {
        minHeight: 40,
        padding: 10,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownWrapper: {
        marginBottom: 10,
    },

    tabs: {
        marginBottom: 0,
        alignItems: 'center',
    },
    cardWrapper: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.textSecondary,
    },
});
