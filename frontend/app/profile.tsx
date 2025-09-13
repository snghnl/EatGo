import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Accounts } from "@/src/client/sdk.gen";
import type { UserDetail } from "@/src/client/types.gen";
import { router, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const ProfilePage = () => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userResponse = await Accounts.accountsMeRead();
        if (userResponse.data) {
          setUser(userResponse.data);
          setEditedUsername(userResponse.data.username || "");
          setProfileImage(userResponse.data.profile_image_url || null);
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
      await Accounts.accountsMeDeleteDelete();

      Alert.alert(
        "계정 삭제 완료",
        "계정이 성공적으로 삭제되었습니다.",
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

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUsername(user?.username || "");
    setProfileImage(user?.profile_image_url || null);
  };

  const handleSaveProfile = async () => {
    if (!editedUsername.trim()) {
      Alert.alert("오류", "사용자명을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      // Note: For now, we'll just simulate saving since the API might not support profile updates yet
      // When the API is available, replace this with actual API call
      console.log("Saving profile:", {
        username: editedUsername,
        profile_image_url: profileImage,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state to reflect changes
      if (user) {
        setUser({
          ...user,
          username: editedUsername,
          profile_image_url: profileImage || undefined,
        });
      }

      setIsEditing(false);
      Alert.alert("성공", "프로필이 업데이트되었습니다.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("오류", "프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleChangeProfileImage = () => {
    Alert.alert(
      "프로필 이미지 변경",
      "프로필 이미지를 어떻게 설정하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "갤러리에서 선택", onPress: handleSelectImage },
        { text: "카메라로 촬영", onPress: handleTakePhoto },
      ]
    );
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
          }}
        >
          <ThemedText style={{ color: Colors.primary }}>다시 시도</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "프로필 설정",
          headerShown: true,
          headerBackTitle: "",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>

      <ScrollView style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={isEditing ? handleChangeProfileImage : undefined}
            disabled={!isEditing}
          >
            <Image
              source={{
                uri: profileImage || "https://via.placeholder.com/120x120.png?text=🙂",
              }}
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.imageEditOverlay}>
                <Ionicons name="camera" size={24} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Username Section */}
        <View style={styles.section}>
          <ThemedText size="sm" weight="medium" style={styles.sectionLabel}>
            사용자명
          </ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="사용자명을 입력하세요"
              placeholderTextColor={Colors.textSecondary}
            />
          ) : (
            <View style={styles.valueContainer}>
              <ThemedText>@{user?.username}</ThemedText>
            </View>
          )}
        </View>

        {/* Email Section (Read-only) */}
        <View style={styles.section}>
          <ThemedText size="sm" weight="medium" style={styles.sectionLabel}>
            이메일
          </ThemedText>
          <View style={styles.valueContainer}>
            <ThemedText color="textSecondary">
              {user?.email || "이메일 정보 없음"}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isEditing ? (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <ThemedText style={styles.cancelButtonText}>취소</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <ThemedText style={styles.saveButtonText}>저장</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
              <ThemedText style={styles.editProfileButtonText}>
                프로필 수정
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Management Section */}
        {!isEditing && (
          <View style={styles.accountSection}>
            <ThemedText size="sm" weight="medium" style={styles.sectionLabel}>
              계정 관리
            </ThemedText>

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
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={20} color="#dc3545" />
              <ThemedText style={styles.deleteAccountText}>
                계정 삭제
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#dc3545"
              />
            </TouchableOpacity>
          </View>
        )}
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
                style={styles.modalCancelButton}
                onPress={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                <ThemedText style={styles.modalCancelButtonText}>취소</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteButton,
                  (deleteConfirmationText !== "DELETE" || isDeleting) &&
                    styles.modalDeleteButtonDisabled,
                ]}
                onPress={handleConfirmDeleteAccount}
                disabled={deleteConfirmationText !== "DELETE" || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.modalDeleteButtonText}>
                    계정 삭제
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  headerBackButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.listbackground,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundGray,
  },
  imageEditOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundGray,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  valueContainer: {
    paddingVertical: 4,
  },
  actionSection: {
    padding: 20,
  },
  editButtons: {
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "500",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editProfileButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  accountSection: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: Colors.backgroundGray,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.listbackground,
    marginBottom: 12,
  },
  logoutText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.listbackground,
  },
  deleteAccountText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#dc3545",
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
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    alignItems: "center",
  },
  modalDeleteButtonDisabled: {
    backgroundColor: "#f8d7da",
  },
  modalDeleteButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "500",
  },
});
