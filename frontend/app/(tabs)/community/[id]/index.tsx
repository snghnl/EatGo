import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useBookmark } from "@/store/BookmarkContext";
import { BookmarkButton } from "@/components/main/BookmarkButton";
import { RouteListContainer } from "@/components/plan";

import { CommunityDetailUser } from "@/components/community/CommunityDetailUser";
import { CommunityDetailContent } from "@/components/community/CommunityDetailContent";

import { usePost, usePostComments, useDeletePost, useCurrentUser, useUpdatePost } from "@/src/hooks/useCommunity";
import { TravelCourses } from "@/src/client/sdk.gen";
import { TravelCourse } from "@/src/client/types.gen";
import ReportModal from "@/components/community/ReportModal";

export default function CommunityPost() {
    const { bookmarkedCourseIds, toggleCourseBookmark } = useBookmark();
    const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
    const id =
        typeof rawId === "string"
            ? rawId
            : Array.isArray(rawId)
              ? rawId[0]
              : undefined;
    const [reportOpen, setReportOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [travelCourse, setTravelCourse] = useState<TravelCourse | null>(null);
    const [courseLoading, setCourseLoading] = useState(false);

    // Fetch post from API
    const { post, isLoading, error } = usePost(id);
    usePostComments(id);

    // Get current user and delete/edit functionality
    const { user: currentUser } = useCurrentUser();
    const { deletePost, isLoading: isDeleting } = useDeletePost();
    const { updatePost, isLoading: isUpdating } = useUpdatePost();

    // Fetch travel course details when post is loaded
    useEffect(() => {
        const fetchTravelCourse = async () => {
            const courseId = post?.travel_course?.id;
            if (!courseId) return;

            try {
                setCourseLoading(true);
                const response = await TravelCourses.travelCoursesRead({
                    path: { id: courseId },
                });
                if (response.data) {
                    setTravelCourse(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch travel course:", err);
            } finally {
                setCourseLoading(false);
            }
        };

        if (post?.travel_course?.id) {
            fetchTravelCourse();
        }
    }, [post?.travel_course?.id]);

    // Ensure hooks run in a consistent order across renders by placing memoization before any early returns
    const dateText = useMemo(() => {
        const dateString = post?.created_at || new Date().toISOString();
        const d = new Date(dateString);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}. ${m}. ${day}`;
    }, [post?.created_at]);

    // Loading state
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <ActivityIndicator size="large" color={Colors.primary} />
                <ThemedText style={{ marginTop: 10 }}>
                    게시글을 불러오는 중...
                </ThemedText>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <ThemedText>게시글을 불러오는데 실패했습니다.</ThemedText>
                <ThemedText
                    style={{ marginTop: 5, color: Colors.textSecondary }}
                >
                    {error}
                </ThemedText>
            </View>
        );
    }

    // Not found state
    if (!id || !post) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <ThemedText>게시글을 찾을 수 없어요.</ThemedText>
            </View>
        );
    }

    const courseKey = String(post.travel_course?.id ?? "");
    const isBookmarked = bookmarkedCourseIds.includes(courseKey);
    const user = post.user || {
        id: "unknown",
        username: "Unknown User",
        profile_image: "",
    };

    // Check if current user is the author of the post
    const isCurrentUserAuthor = currentUser && post.user &&
        (currentUser.id === post.user.id || currentUser.username === post.user.username);

    const handlePlacePress = (routeId: string, placeId: string) => {
        setSelectedRouteId(routeId);
        setSelectedPlaceId(placeId);
    };
    const handleCardPress = (routeId: string) => setSelectedRouteId(routeId);
    const handleLongPress = (_routeId: string) => {};
    const handleSave = (_routeId: string) => {};
    const handleRecommendationPress = (_sequence: number) => {};

    const handleDeletePost = () => {
        Alert.alert(
            "게시글 삭제",
            "정말로 이 게시글을 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        if (!id) return;
                        const success = await deletePost(id);
                        if (success) {
                            Alert.alert("삭제 완료", "게시글이 삭제되었습니다.", [
                                {
                                    text: "확인",
                                    onPress: () => router.push("/(tabs)/community"),
                                },
                            ]);
                        } else {
                            Alert.alert("오류", "게시글 삭제에 실패했습니다.");
                        }
                    },
                },
            ],
        );
    };

    const handleEditPost = () => {
        if (!post) return;
        setEditTitle(post.title || "");
        setEditContent(post.content || "");
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!id || !editTitle.trim()) {
            Alert.alert("오류", "제목을 입력해주세요.");
            return;
        }

        const success = await updatePost(id, {
            title: editTitle.trim(),
            content: editContent.trim(),
        });

        if (success) {
            Alert.alert("수정 완료", "게시글이 수정되었습니다.");
            setEditModalOpen(false);
            // Refresh the post data by navigating back and forth
            router.replace(`/community/${id}`);
        } else {
            Alert.alert("오류", "게시글 수정에 실패했습니다.");
        }
    };

    const handleCancelEdit = () => {
        setEditModalOpen(false);
        setEditTitle("");
        setEditContent("");
    };

    return (
        <ScrollView>
            <SafeAreaView>
                <View style={styles.container}>
                    <View style={styles.topbar}>
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={Colors.textPrimary}
                            onPress={() => router.push("/(tabs)/map")}
                        />
                        <View style={styles.topbarRight}>
                            {isCurrentUserAuthor && (
                                <>
                                    <Pressable
                                        onPress={handleEditPost}
                                        disabled={isUpdating}
                                        style={[styles.editButton, isUpdating && styles.disabledButton]}
                                    >
                                        {isUpdating ? (
                                            <ActivityIndicator size="small" color={Colors.primary} />
                                        ) : (
                                            <Ionicons
                                                name="create-outline"
                                                size={20}
                                                color={Colors.primary}
                                            />
                                        )}
                                    </Pressable>
                                    <Pressable
                                        onPress={handleDeletePost}
                                        disabled={isDeleting}
                                        style={[styles.deleteButton, isDeleting && styles.disabledButton]}
                                    >
                                        {isDeleting ? (
                                            <ActivityIndicator size="small" color={Colors.error || "#FF0000"} />
                                        ) : (
                                            <Ionicons
                                                name="trash-outline"
                                                size={20}
                                                color={Colors.error || "#FF0000"}
                                            />
                                        )}
                                    </Pressable>
                                </>
                            )}
                            <Ionicons
                                name="alert-circle-outline"
                                size={20}
                                color={Colors.textSecondary}
                                onPress={() => setReportOpen(true)}
                            />
                        </View>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.headerRow}>
                            <ThemedText
                                size="2xl"
                                weight="bold"
                                style={styles.title}
                            >
                                {post.title}
                            </ThemedText>
                            <BookmarkButton
                                isBookmarked={isBookmarked}
                                onPress={() => toggleCourseBookmark(courseKey)}
                                size={28}
                            />
                        </View>

                        <View style={styles.userRow}>
                            <Pressable
                                onPress={() => {
                                    const userId = String(
                                        user.id || user.username || "default"
                                    );
                                    console.log("Navigating to user:", userId);

                                    router.push({
                                        pathname: "/(tabs)/mypage/[uid]/detail", // ✅ 올바른 경로
                                        params: { uid: userId },
                                    });
                                }}
                            >
                                <CommunityDetailUser
                                    nickname={String(user.username || user.id)}
                                    profileImageUrl={
                                        ('profile_image_url' in user) ? user.profile_image_url || "" :
                                        ('profile_image' in user) ? user.profile_image || "" : ""
                                    }
                                    subInfo={`작성: ${dateText}`}
                                />
                            </Pressable>
                        </View>
                        <View style={styles.contentRow}>
                            <CommunityDetailContent
                                content={post.content ?? ""}
                                dateRange={
                                    travelCourse?.start_date +
                                        " ~ " +
                                        travelCourse?.end_date || ""
                                }
                                location={travelCourse?.destination || ""}
                            />
                        </View>
                    </View>

                    <View style={styles.routeplan}>
                        {courseLoading ? (
                            <View style={{ padding: 20, alignItems: "center" }}>
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primary}
                                />
                                <ThemedText style={{ marginTop: 8 }}>
                                    여행 경로를 불러오는 중...
                                </ThemedText>
                            </View>
                        ) : travelCourse?.routes ? (
                            <RouteListContainer
                                courseId={courseKey}
                                routes={travelCourse.routes}
                                onPlacePress={handlePlacePress}
                                onCardPress={handleCardPress}
                                onSave={handleSave}
                                onLongPress={handleLongPress}
                                onRecommendationPress={
                                    handleRecommendationPress
                                }
                                selectedPlaceId={selectedPlaceId}
                                activeRouteId={selectedRouteId}
                            />
                        ) : (
                            <View style={{ padding: 20, alignItems: "center" }}>
                                <ThemedText color="textSecondary">
                                    등록된 여행 경로가 없습니다.
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
            <ReportModal
                visible={reportOpen}
                onClose={() => setReportOpen(false)}
                subjectType="post"
                subjectName={post.title || ""}
                subjectId={id}
                onSubmit={(payload) => {
                    console.log("신고 제출", payload);
                    setReportOpen(false);
                }}
            />

            {/* Edit Modal */}
            <Modal
                visible={editModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCancelEdit}
            >
                <SafeAreaView style={styles.editModalContainer}>
                    <View style={styles.editModalHeader}>
                        <Pressable onPress={handleCancelEdit}>
                            <ThemedText color="textSecondary">취소</ThemedText>
                        </Pressable>
                        <ThemedText size="lg" weight="bold">
                            게시글 수정
                        </ThemedText>
                        <Pressable
                            onPress={handleSaveEdit}
                            disabled={isUpdating || !editTitle.trim()}
                        >
                            <ThemedText
                                color={isUpdating || !editTitle.trim() ? "textSecondary" : "primary"}
                                weight="bold"
                            >
                                {isUpdating ? "저장 중..." : "저장"}
                            </ThemedText>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.editModalContent}>
                        <View style={styles.editInputContainer}>
                            <ThemedText size="sm" weight="bold" style={styles.editLabel}>
                                제목
                            </ThemedText>
                            <TextInput
                                style={styles.editTitleInput}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="제목을 입력하세요"
                                maxLength={100}
                                multiline
                            />
                        </View>

                        <View style={styles.editInputContainer}>
                            <ThemedText size="sm" weight="bold" style={styles.editLabel}>
                                내용
                            </ThemedText>
                            <TextInput
                                style={styles.editContentInput}
                                value={editContent}
                                onChangeText={setEditContent}
                                placeholder="내용을 입력하세요"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 10, backgroundColor: Colors.white },
    topbar: {
        position: "absolute",
        top: 20,
        left: 15,
        right: 30,
        zIndex: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    topbarRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    editButton: {
        padding: 5,
    },
    deleteButton: {
        padding: 5,
    },
    disabledButton: {
        opacity: 0.6,
    },
    editModalContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    editModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundGray,
    },
    editModalContent: {
        flex: 1,
        padding: 20,
    },
    editInputContainer: {
        marginBottom: 20,
    },
    editLabel: {
        marginBottom: 8,
    },
    editTitleInput: {
        borderWidth: 1,
        borderColor: Colors.backgroundGray,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        minHeight: 50,
        maxHeight: 100,
        textAlignVertical: "top",
    },
    editContentInput: {
        borderWidth: 1,
        borderColor: Colors.backgroundGray,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        minHeight: 120,
        maxHeight: 300,
        textAlignVertical: "top",
    },
    headerRow: {
        marginTop: 50,
        marginBottom: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: { lineHeight: 35, marginTop: 0, paddingTop: 0 },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: Colors.backgroundGray,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    metaRow: { marginTop: 20 },
    metaText: { color: Colors.textSecondary },
    contentRow: { marginTop: 16 },
    routeplan: {
        backgroundColor: Colors.backgroundGray,
        paddingTop: 0,
        marginTop: 0,
        margin: 0,
    },
});
