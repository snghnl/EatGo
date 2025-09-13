import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPageHeader from "@/components/mypage/MyPageHeader";
import { MyPageTabs } from "@/components/mypage/MyPageTabs";
import DropdownSort from "@/components/mypage/DropdownSort";
import { CourseCard } from "@/components/plan";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import ReportModal from "@/components/community/ReportModal";
import type {
  UserDetail,
  PostListOutput,
} from "@/src/client/types.gen";
import { Accounts, Community } from "@/src/client/sdk.gen";

const UserProfilePage = () => {
  // ✅ 모든 Hook들을 먼저 선언
  const { uid } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"places" | "courses" | "saved">(
    "places",
  );
  const [sortOption, setSortOption] = useState("최신순");
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [userPosts, setUserPosts] = useState<PostListOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  // ✅ useEffect도 Hook이므로 조건부 렌더링 전에 위치
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Note: Currently there's no API endpoint to fetch other users' profiles by ID
        // For now, we'll use a placeholder approach until the backend provides this endpoint
        // TODO: Replace with direct user profile API call when available: await Accounts.accountsUserRead({id: uid})

        // Fetch current user data to get the structure
        const currentUserResponse = await Accounts.accountsMeRead();
        if (currentUserResponse.data) {
          // Create a placeholder user profile for the requested UID
          const placeholderUser: UserDetail = {
            ...currentUserResponse.data,
            id: uid ? Number(uid) : currentUserResponse.data.id,
            username: `User_${uid}`,
            email: `user${uid}@example.com`,
          };
          setUserData(placeholderUser);

          // Fetch user's posts from community (if they have any public posts)
          try {
            const postsResponse = await Community.communityPostsList();
            if (postsResponse.data && Array.isArray(postsResponse.data)) {
              // TODO: When proper user matching is available, use this filter:
              // const userPostsFiltered = postsResponse.data.filter((post: PostListOutput) =>
              //   post.user?.id === Number(uid) || post.user?.username === userData.username
              // );

              // For now, show all posts as demonstration of the "내여행코스" section
              // This will show community posts that would represent user's published travel courses
              setUserPosts(postsResponse.data.slice(0, 3)); // Show first 3 posts as demo
            }
          } catch (postsError) {
            console.log("Failed to fetch user posts:", postsError);
            setUserPosts([]);
          }
        }
      } catch (error) {
        console.error("사용자 데이터 로딩 실패:", error);
        // Fallback to placeholder data
        setUserData({
          id: uid ? Number(uid) : 1,
          username: `User_${uid || '1'}`,
          email: `user${uid || '1'}@example.com`,
          profile_image_url: null,
          date_joined: new Date().toISOString(),
        });
        setUserPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [uid]);


  // ✅ 조건부 렌더링은 모든 Hook 선언 후에
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingContainer]}
        edges={["top"]}
      >
        <ThemedText>사용자 정보를 불러오는 중...</ThemedText>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingContainer]}
        edges={["top"]}
      >
        <ThemedText>사용자 정보를 찾을 수 없습니다.</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.headerSection}>
          <View style={{ flex: 1 }} />
          <MyPageHeader
            username={userData.username || `사용자 ${userData.id}`}
            neighborCount={0} // API doesn't provide followers_count yet
            profileImageUrl={userData.profile_image_url || undefined}
          />

          {/* Back and Report Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors.textSecondary}
              />
              <ThemedText style={styles.actionText}>
                뒤로가기
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => setReportOpen(true)}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <ThemedText style={styles.actionText}>
                신고하기
              </ThemedText>
            </TouchableOpacity>
          </View>

          <MyPageTabs
            style={styles.tabs}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        </View>

        {activeTab === "places" && (
          <View
            style={[
              styles.dropdownWrapper,
              { position: "relative", overflow: "visible", zIndex: 10 },
            ]}
          >
            <DropdownSort
              selected={sortOption}
              onSelect={(value) => setSortOption(value)}
            />
          </View>
        )}

        <View style={styles.cardWrapper}>
          {activeTab === "places" && (
            <View>
              <ThemedText style={styles.emptyText}>
                사용자의 공개된 장소 정보는 추후 지원 예정입니다.
              </ThemedText>
            </View>
          )}

          {activeTab === "courses" && (
            <View>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <CourseCard
                    key={`post-${post.id}`}
                    subtitle={
                      post.travel_course?.title ||
                      (post.content.length > 50
                        ? post.content.substring(0, 50) + "..."
                        : post.content) ||
                      "여행 코스"
                    }
                    title={post.title}
                    hasImages={post.images && post.images.length > 0}
                    onPress={() => {
                      try {
                        if (post.id) {
                          router.push({
                            pathname: "/community/[id]",
                            params: { id: post.id },
                          });
                        }
                      } catch (error) {
                        console.error("네비게이션 오류:", error);
                        alert("페이지 이동 중 오류가 발생했습니다.");
                      }
                    }}
                  />
                ))
              ) : (
                <ThemedText style={styles.emptyText}>
                  공개된 여행 코스가 없습니다.
                </ThemedText>
              )}
            </View>
          )}

          {activeTab === "saved" && (
            <View>
              <ThemedText style={styles.emptyText}>
                다른 사용자의 저장한 여행경로는 볼 수 없습니다.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        subjectType="user"
        subjectId={userData.id}
        subjectName={userData.username ?? String(userData.id)}
        headerTitle="사용자 신고"
        onSubmit={(payload) => {
          console.log("신고 제출", payload);
        }}
      />
    </SafeAreaView>
  );
};

export default UserProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6e8ff",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownWrapper: {
    marginBottom: 10,
  },
  headerSection: {
    width: "100%",
    backgroundColor: Colors.listbackground,
    minHeight: 250,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabs: {
    marginBottom: 0,
    alignItems: "center",
  },
  cardWrapper: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 32,
  },
});
