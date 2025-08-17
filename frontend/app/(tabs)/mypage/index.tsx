import React, { useState } from 'react';
import { useBookmark } from '@/app/BookmarkContext';
import { View, ScrollView, StyleSheet } from 'react-native';
import MyPageHeader from '@/components/mypage/MyPageHeader';
import usersData from '@/mock-data/users.json';
import { MyPageTabs } from '@/components/mypage/MyPageTabs';
import DropdownSort from '@/components/mypage/DropdownSort';
import { PlaceCard } from '@/components/main/PlaceCard';
import placesData from '@/mock-data/places.json';
import { CourseListExample, CourseCard } from '@/components/plan';
import { SAMPLE_COURSES } from '@/constants/Data';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

const MyPageTab = () => {
    const [activeTab, setActiveTab] = useState<'places' | 'courses' | 'saved'>('places');
    const [sortOption, setSortOption] = useState('최신순');
    const { bookmarkedPlaceIds, toggleBookmark, bookmarkedCourseIds, toggleCourseBookmark } = useBookmark();

    const user = usersData[0];
    const sortedPlaces = placesData.documents.slice(0, 3);
    const allPlaces = placesData.documents;

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.headerSection}>
                    <View style={{ flex: 1 }} />
                    <MyPageHeader
                        username={user.username}
                        neighborCount={user.followers_count}
                        profileImageUrl={user.profile_image}
                    />
                    <MyPageTabs style={styles.tabs} onTabChange={(tab) => setActiveTab(tab)} />
                </View>

                {activeTab === 'places' && (
                    <View style={[styles.dropdownWrapper, { position: 'relative', overflow: 'visible', zIndex: 10 }]}>
                        <DropdownSort selected={sortOption} onSelect={(value) => setSortOption(value)} />
                    </View>
                )}

                <View style={styles.cardWrapper}>
                    {activeTab === 'places' &&
                        allPlaces
                            .filter((place) => bookmarkedPlaceIds.includes(place.id))
                            .map((place) => (
                                <PlaceCard
                                    key={place.id}
                                    id={place.id}
                                    name={place.place_name}
                                    category={place.category_name}
                                    distance={place.distance}
                                    address={place.road_address_name}
                                    description={place.category_name}
                                    imageUrl={'https://source.unsplash.com/random/300x300?food'}
                                    isBookmarked={bookmarkedPlaceIds.includes(place.id)}
                                    onBookmark={() => toggleBookmark(place.id)}
                                    isSaved={true}
                                />
                            ))}

                    {activeTab === 'courses' && (
                        <View>
                            <CourseListExample />
                        </View>
                    )}
                    {activeTab === 'saved' && (
                        <View>
                            {(() => {
                                console.log('[MyPageTab] bookmarkedCourseIds:', bookmarkedCourseIds);
                                console.log('[MyPageTab] SAMPLE_COURSES:', SAMPLE_COURSES);
                                const filtered = SAMPLE_COURSES.filter((course: any) =>
                                    bookmarkedCourseIds.includes(course.id)
                                );
                                console.log('[MyPageTab] filtered:', filtered);
                                if (filtered.length === 0) {
                                    return <ThemedText>저장한 경로가 없습니다.</ThemedText>;
                                }
                                return filtered.map((course: any) => (
                                    <CourseCard
                                        key={course.id}
                                        subtitle={course.subtitle}
                                        title={course.title}
                                        hasImages={course.hasImages}
                                        onPress={() => {}}
                                    />
                                ));
                            })()}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default MyPageTab;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffe6e8ff',
    },

    dropdownWrapper: {
        marginBottom: 10,
    },
    cardWrapper: {
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
        minHeight: 300, // 추가
    },
    headerSection: {
        width: '100%',
        backgroundColor: Colors.listbackground,
        minHeight: 250,
    },
    tabs: {
        marginBottom: 0,
        alignItems: 'center',
    },
});
