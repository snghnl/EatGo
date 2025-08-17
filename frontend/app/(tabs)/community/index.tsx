import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import Header from '@/components/common/Header';
import CoursePostCard from '@/components/community/CoursePostCard';
import CourseDropdown from '@/components/community/CourseDropdown';
import posts from '@/mock-data/posts.json';
import users from '@/mock-data/users.json';
import { JEONLA_DESTINATIONS } from '@/constants/Data';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import FloatingWriteButton from '@/components/community/FloatingWriteButton';

// 도시 및 시기 옵션 정의
const CITY_OPTIONS = ['전체 도시', '서울', '부산', '제주', '전라'];
const SEASON_OPTIONS = ['여행 시기', '봄', '여름', '가을', '겨울'];

const MOCK_ROUTES: Record<string, { location: string; season: string; duration: string; images: string[] }> = {
    'route-001': {
        location: '서울',
        season: '봄',
        duration: '2일',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
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

export default function CommunityTab() {
    const [selectedCity, setSelectedCity] = useState('전체 도시');
    const [selectedSeason, setSelectedSeason] = useState('여행 시기');
    const [selectedRegion, setSelectedRegion] = useState('세부 지역');

    // 필터링된 post 리스트 생성
    const filteredPosts = posts.filter((post) => {
        const route = MOCK_ROUTES[post.course_id];
        const cityMatch = selectedCity === '전체 도시' || route?.location === selectedCity;
        const seasonMatch = selectedSeason === '여행 시기' || route?.season === selectedSeason;
        const region = MOCK_ROUTES[post.course_id]?.location;
        if (selectedRegion !== '세부 지역' && region !== selectedRegion) return false;
        return cityMatch && seasonMatch;
    });

    return (
        <SafeAreaView style={styles.container}>
            <Header title="여행 코스톡" subtitle="미식가들의 숨겨진 여행 경로" />
            <View style={styles.dropdownRow}>
                <CourseDropdown
                    label="전체 도시"
                    options={CITY_OPTIONS}
                    selected={selectedCity}
                    onSelect={setSelectedCity}
                />
                <CourseDropdown
                    label="세부 지역"
                    options={['전체 지역', ...JEONLA_DESTINATIONS]}
                    selected={selectedRegion}
                    onSelect={setSelectedRegion}
                />
                <CourseDropdown
                    label="여행 시기"
                    options={SEASON_OPTIONS}
                    selected={selectedSeason}
                    onSelect={setSelectedSeason}
                />
            </View>
            {/* 리스트 */}
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CoursePostCard
                        user={{
                            nickname: item.user_id,
                            profile_image_url: users.find((u) => u.id === item.user_id)?.profile_image || '',
                        }}
                        post={{ id: item.id, title: item.title }}
                        routeMeta={MOCK_ROUTES[item.course_id]}
                    />
                )}
                contentContainerStyle={{ padding: 16 }}
            />
            <View style={styles.floatingWrapper} pointerEvents="box-none">
                <FloatingWriteButton />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.listbackground,
    },
    dropdownRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 15,
        zIndex: 10,
    },
    floatingWrapper: {
        bottom: 60,
    },
});
