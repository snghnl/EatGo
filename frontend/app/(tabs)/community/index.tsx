import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    View,
    ActivityIndicator,
    Text,
    Alert,
} from "react-native";
import Header from "@/components/common/Header";
import CoursePostCard from "@/components/community/CoursePostCard";
import Dropdown from "@/components/common/Dropdown";
import { JEONLA_DESTINATIONS } from "@/constants/Data";
import { Colors } from "@/constants/Colors";
import { useState, useMemo } from "react";
import FloatingWriteButton from "@/components/community/FloatingWriteButton";
import {
    usePosts,
    useDeletePost,
    useCurrentUser,
} from "@/src/hooks/useCommunity";

// 도시 및 시기 옵션 정의
const CITY_OPTIONS = ["전체 도시", "서울", "부산", "제주", "전라"];
const SEASON_OPTIONS = ["여행 시기", "봄", "여름", "가을", "겨울"];

export default function CommunityTab() {
    const [selectedCity, setSelectedCity] = useState("전체 도시");
    const [selectedSeason, setSelectedSeason] = useState("여행 시기");
    const [selectedRegion, setSelectedRegion] = useState("세부 지역");
    const [deletingPosts, setDeletingPosts] = useState<Set<string>>(new Set());

    // Fetch posts from API
    const { posts, isLoading, error, refreshPosts } = usePosts();

    // Get current user and delete functionality
    const { user: currentUser } = useCurrentUser();
    const { deletePost } = useDeletePost();

    // 필터링된 post 리스트 생성
    const filteredPosts = useMemo(() => {
        if (!posts) return [];

        return posts.filter(() => {
            // For now, we'll use basic filtering since the backend doesn't have location/season filtering yet
            // TODO: Implement proper filtering based on travel course data
            return true;
        });
    }, [posts, selectedCity, selectedSeason, selectedRegion]);

    const handleDeletePost = (postId: string) => {
        Alert.alert("게시글 삭제", "정말로 이 게시글을 삭제하시겠습니까?", [
            {
                text: "취소",
                style: "cancel",
            },
            {
                text: "삭제",
                style: "destructive",
                onPress: async () => {
                    setDeletingPosts((prev) => new Set(prev).add(postId));
                    const success = await deletePost(postId);
                    setDeletingPosts((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(postId);
                        return newSet;
                    });

                    if (success) {
                        Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
                        refreshPosts();
                    } else {
                        Alert.alert("오류", "게시글 삭제에 실패했습니다.");
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="여행 코스톡"
                subtitle="미식가들의 숨겨진 여행 경로"
            />

            {/* Loading State */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>
                        게시물을 불러오는 중...
                    </Text>
                </View>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        게시물을 불러오는데 실패했습니다.
                    </Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Posts List */}
            {!isLoading && !error && (
                <FlatList
                    data={filteredPosts}
                    keyExtractor={(item) => item.id || "unknown"}
                    renderItem={({ item }) => {
                        const isCurrentUserAuthor = Boolean(
                            currentUser &&
                                item.user &&
                                (currentUser.id === item.user.id ||
                                    currentUser.username === item.user.username)
                        );
                        const isPostDeleting = deletingPosts.has(item.id || "");

                        return (
                            <CoursePostCard
                                user={{
                                    nickname:
                                        item.user?.username || "Unknown User",
                                    profile_image_url:
                                        item.user?.profile_image_url || "",
                                }}
                                post={{
                                    id: item.id || "",
                                    title: item.title,
                                }}
                                routeMeta={{
                                    location:
                                        item.travel_course?.destination || "-",
                                    duration:
                                        item.travel_course?.start_date +
                                            " ~ " +
                                            item.travel_course?.end_date ||
                                        "미정",
                                    images:
                                        item.images?.map((img) => img.url) ||
                                        [],
                                }}
                                showDeleteButton={isCurrentUserAuthor}
                                onDelete={() => handleDeletePost(item.id || "")}
                                isDeleting={isPostDeleting}
                            />
                        );
                    }}
                    contentContainerStyle={{ padding: 16 }}
                    onRefresh={refreshPosts}
                    refreshing={isLoading}
                />
            )}
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
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 15,
        zIndex: 10,
    },
    floatingWrapper: {
        bottom: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: Colors.textSecondary,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: Colors.error || "#FF0000",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 5,
    },
});
