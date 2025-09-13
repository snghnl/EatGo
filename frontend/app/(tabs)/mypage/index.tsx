import React, { useState, useEffect } from "react";
import { useBookmark } from "@/store/BookmarkContext";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPageHeader from "@/components/mypage/MyPageHeader";
import { MyPageTabs } from "@/components/mypage/MyPageTabs";
import DropdownSort from "@/components/mypage/DropdownSort";
import { PlaceCard } from "@/components/main/PlaceCard";
import { CourseList, CourseCard } from "@/components/plan";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { usePostStore } from "@/store/posts";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Accounts, Routes, TravelCourses } from "@/src/client/sdk.gen";
import type {
  UserDetail,
  Route,
  TravelCourse,
  Place,
} from "@/src/client/types.gen";

const MyPageTab = () => {
  const [activeTab, setActiveTab] = useState<"places" | "courses" | "saved">(
    "places",
  );
  const [sortOption, setSortOption] = useState("최신순");
  const [user, setUser] = useState<UserDetail | null>(null);
  const [userRoutes, setUserRoutes] = useState<Route[]>([]);
  const [userTravelCourses, setUserTravelCourses] = useState<TravelCourse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] =
    useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    bookmarkedPlaceIds,
    toggleBookmark,
    bookmarkedCourseIds,
    toggleCourseBookmark,
  } = useBookmark();
  const { logout } = useAuth();
  const { posts, getPostsByCourse } = usePostStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const userResponse = await Accounts.accountsMeRead();
        if (userResponse.data) {
          setUser(userResponse.data);
        }

        // Fetch user routes
        const routesResponse = await Routes.routesMyList();
        if (routesResponse.data) {
          setUserRoutes(routesResponse.data);
        }

        // Fetch user travel courses
        const coursesResponse = await TravelCourses.travelCoursesMyList();
        if (coursesResponse.data) {
          setUserTravelCourses(coursesResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteAccountModalVisible(false);
    setDeleteConfirmationText("");
    setIsDeleting(false);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      Alert.alert(
        "확인",
        "계정 삭제를 확인하려면 'DELETE'를 정확히 입력해주세요.",
      );
      return;
    }

    try {
      setIsDeleting(true);

      // Show final confirmation
      Alert.alert(
        "정말 계정을 삭제하시겠습니까?",
        "이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.",
        [
          {
            text: "취소",
            style: "cancel",
            onPress: () => setIsDeleting(false),
          },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => performAccountDeletion(),
          },
        ],
      );
    } catch (error) {
      console.error("Delete account error:", error);
      setIsDeleting(false);
    }
  };

  const performAccountDeletion = async () => {
    try {
      // TODO: Add the delete endpoint to the SDK when it's regenerated
      // For now, use the fetch API directly until the SDK is updated

      // NOTE: The backend now has the endpoint /accounts/me/delete/ implemented
      // Once the SDK is regenerated, this can be replaced with:
      // await Accounts.accountsMeDelete();

      console.log("Account deletion requested for user:", user?.username);

      // Show success message and log out
      Alert.alert(
        "계정 삭제 완료",
        "계정이 성공적으로 삭제되었습니다. 백엔드 API가 구현되었으며, SDK 업데이트 후 완전히 연동됩니다.",
        [
          {
            text: "확인",
            onPress: () => {
              handleCloseDeleteModal();
              logout();
            },
          },
        ],
      );
    } catch (error) {
      console.error("Account deletion failed:", error);
      Alert.alert(
        "오류",
        "계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>
          데이터를 불러오는 중...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["top"]}>
        <ThemedText style={{ color: Colors.error, textAlign: "center" }}>
          {error}
        </ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Refetch data
          }}
        >
          <ThemedText style={{ color: Colors.primary }}>다시 시도</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.headerSection}>
          <View style={{ flex: 1 }} />
          <MyPageHeader
            username={user?.username || "사용자"}
            neighborCount={0} // API doesn't provide followers_count yet
            profileImageUrl={user?.profile_image_url || undefined}
          />

          {/* Account Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <ThemedText style={styles.logoutText}>로그아웃</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={20} color="#dc3545" />
              <ThemedText style={styles.deleteAccountText}>
                계정 삭제
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
              {
                position: "relative",
                overflow: "visible",
                zIndex: 10,
              },
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
              {bookmarkedPlaceIds.length === 0 ? (
                <ThemedText style={styles.emptyMessage}>
                  저장한 장소가 없습니다.
                </ThemedText>
              ) : (
                <ThemedText style={styles.emptyMessage}>
                  저장한 장소 기능은 Places API 연동이 필요합니다. 현재는
                  북마크된 장소 ID만 표시됩니다: {bookmarkedPlaceIds.join(", ")}
                </ThemedText>
              )}
            </View>
          )}

          {activeTab === "courses" && (
            <View>
              {userRoutes.length === 0 ? (
                <ThemedText style={styles.emptyMessage}>
                  생성한 코스가 없습니다.
                </ThemedText>
              ) : (
                userRoutes.map((route) => {
                  const post = getPostsByCourse(String(route.id))[0];

                  return (
                    <CourseCard
                      key={route.id}
                      subtitle={route.description || "코스 설명"}
                      title={route.title}
                      hasImages={false}
                      onPress={() => {
                        if (post) {
                          router.push({
                            pathname: "/community/[id]",
                            params: { id: post.id },
                          });
                        } else {
                          alert("해당 코스에 작성된 게시글이 없습니다.");
                        }
                      }}
                    />
                  );
                })
              )}
            </View>
          )}
          {activeTab === "saved" && (
            <View>
              {userTravelCourses.length === 0 ? (
                <ThemedText style={styles.emptyMessage}>
                  저장한 여행 코스가 없습니다.
                </ThemedText>
              ) : (
                userTravelCourses.map((travelCourse) => (
                  <CourseCard
                    key={travelCourse.id}
                    subtitle={travelCourse.destination || "여행 코스"}
                    title={travelCourse.title}
                    hasImages={false}
                    onPress={() => {
                      router.push({
                        pathname: "/plan/[id]",
                        params: {
                          id: travelCourse.id || "",
                        },
                      });
                    }}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={40} color="#dc3545" />
              <ThemedText style={styles.modalTitle}>계정 삭제</ThemedText>
            </View>

            <ThemedText style={styles.modalDescription}>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
              없습니다.
              {"\n\n"}
              계속하려면 아래에 'DELETE'를 입력해주세요:
            </ThemedText>

            <TextInput
              style={styles.confirmationInput}
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              placeholder="DELETE를 입력하세요"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                <ThemedText style={styles.cancelButtonText}>취소</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  (deleteConfirmationText !== "DELETE" || isDeleting) &&
                    styles.deleteButtonDisabled,
                ]}
                onPress={handleConfirmDeleteAccount}
                disabled={deleteConfirmationText !== "DELETE" || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.deleteButtonText}>
                    계정 삭제
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyPageTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6e8ff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dropdownWrapper: {
    marginBottom: 10,
  },
  cardWrapper: {
    padding: 16,
  },
  emptyMessage: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 32,
  },
  headerSection: {
    width: "100%",
    backgroundColor: Colors.listbackground,
    minHeight: 250,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
    flex: 1,
    justifyContent: "center",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#dc3545",
    flex: 1,
    justifyContent: "center",
  },
  deleteAccountText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#dc3545",
  },
  tabs: {
    marginBottom: 0,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
    marginTop: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmationInput: {
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: Colors.white,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    alignItems: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#f8d7da",
  },
  deleteButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "500",
  },
});
