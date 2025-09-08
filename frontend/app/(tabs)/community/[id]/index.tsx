import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useBookmark } from "@/store/BookmarkContext";
import { BookmarkButton } from "@/components/main/BookmarkButton";
import { DayPlanListContainer } from "@/components/plan/DayPlanListContainer";

import { CommunityDetailUser } from "@/components/community/CommunityDetailUser";
import { CommunityDetailContent } from "@/components/community/CommunityDetailContent";

import { usePost, usePostComments } from "@/src/hooks/useCommunity";
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
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedDayPlanId, setSelectedDayPlanId] = useState<string | null>(
    null,
  );

  // Fetch post from API
  const { post, isLoading, error } = usePost(id);
  const { comments: _comments } = usePostComments(id);

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
        <ThemedText style={{ marginTop: 5, color: Colors.textSecondary }}>
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

  const handlePlacePress = (dayPlanId: string, placeId: string) => {
    setSelectedDayPlanId(dayPlanId);
    setSelectedPlaceId(placeId);
  };
  const handleCardPress = (dayPlanId: string) =>
    setSelectedDayPlanId(dayPlanId);
  const handleLongPress = (_dayPlanId: string) => {};
  const handleSave = (_dayPlanId: string) => {};

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
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={Colors.textSecondary}
              onPress={() => setReportOpen(true)}
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
              <Pressable
                onPress={() => {
                  const userId = String(user.id || user.username || "default");
                  console.log("Navigating to user:", userId);

                  router.push({
                    pathname: "/(tabs)/mypage/[uid]/detail", // ✅ 올바른 경로
                    params: { uid: userId },
                  });
                }}
              >
                {" "}
                <CommunityDetailUser
                  nickname={user.username || user.id}
                  profileImageUrl={user.profile_image || ""}
                  subInfo={`작성: ${dateText}`}
                />
              </Pressable>
            </View>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaText}>
                <ThemedText>여행 기간</ThemedText>
                <ThemedText color="primary">
                  📍 지역: {courseKey || "-"}
                </ThemedText>
              </ThemedText>
            </View>
            <View style={styles.contentRow}>
              <CommunityDetailContent content={post.content ?? ""} />
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
        </View>
      </SafeAreaView>
      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        authorName={user.username || user.id}
        onSubmit={(payload) => {
          console.log("신고 제출", payload);
        }}
      />
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
  dayplan: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: 0,
    marginTop: 0,
    margin: 0,
  },
});
