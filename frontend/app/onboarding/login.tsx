import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Auth } from "@/src/client/sdk.gen";
import { useAuth } from "@/src/contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 폼 업데이트
  const updateForm = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 로그인 처리
  const handleLogin = async () => {
    console.log("handleLogin called");

    if (!form.email || !form.password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요");
      return;
    }

    if (!validateEmail(form.email)) {
      Alert.alert("알림", "올바른 이메일 형식이 아닙니다");
      return;
    }

    console.log("About to call Auth.authTokenCreate");
    try {
      const response = await Auth.authTokenCreate({
        body: {
          username: form.email,
          password: form.password,
        },
      });

      console.log("API response received:", response);
      console.log("Response status:", response.response?.status);
      console.log("Response data:", response.data);

      // Check if the response contains an error
      if (response.error) {
        console.log("API returned error:", response.error);
        const status = response.response?.status;

        let errorMessage = "로그인에 실패했습니다";

        if (status === 401) {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
        } else if (status === 400) {
          errorMessage = "입력하신 정보를 다시 확인해주세요";
        } else if (status >= 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
        }

        Alert.alert("로그인 실패", errorMessage);
        return;
      }

      if (response.data) {
        console.log("Login successful, processing tokens");
        // Login using AuthContext (automatically redirects to main app)
        const tokens = response.data as any; // Type assertion due to outdated OpenAPI types
        await login({
          access: tokens.access,
          refresh: tokens.refresh,
        });
        // Navigation will be handled by AuthContext
      } else {
        console.log("No response data, login failed");
        Alert.alert("로그인 실패", "서버에서 응답을 받지 못했습니다");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Check for different error structures that might exist
      let errorMessage = "로그인에 실패했습니다. 다시 시도해주세요";

      if (error && typeof error === 'object') {
        // Check for response property (axios style)
        if ('response' in error) {
          const response = (error as any).response;
          console.error("Response status:", response?.status);
          console.error("Response data:", response?.data);

          if (response?.status === 401) {
            errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
          } else if (response?.status === 400) {
            errorMessage = "입력하신 정보를 다시 확인해주세요";
          } else if (response?.status >= 500) {
            errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
          }
        }
        // Check for status property (fetch style)
        else if ('status' in error) {
          const status = (error as any).status;
          console.error("Error status:", status);

          if (status === 401) {
            errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
          } else if (status === 400) {
            errorMessage = "입력하신 정보를 다시 확인해주세요";
          } else if (status >= 500) {
            errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
          }
        }
        // Check for message property
        else if ('message' in error) {
          const message = (error as any).message;
          console.error("Error message:", message);

          if (message?.toLowerCase().includes('unauthorized') || message?.toLowerCase().includes('401')) {
            errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
          } else if (message?.toLowerCase().includes('bad request') || message?.toLowerCase().includes('400')) {
            errorMessage = "입력하신 정보를 다시 확인해주세요";
          }
        }
      }

      // Force show alert and also log to console
      console.log("About to show alert:", errorMessage);
      Alert.alert("로그인 실패", errorMessage);

      // Also try with a timeout to ensure it shows
      setTimeout(() => {
        console.log("Backup alert triggered");
        Alert.alert("알림", "로그인 중 오류가 발생했습니다");
      }, 100);
    }
  };

  // 로그인 가능 여부
  const canLogin = form.email && form.password;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>로그인</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 제목 */}
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>미식여행을 위한 첫걸음</Text>

          {/* 폼 */}
          <View style={styles.form}>
            {/* 이메일 입력 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="이메일 입력"
                placeholderTextColor="#9CA3AF"
                value={form.email}
                onChangeText={(value) => updateForm("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="비밀번호 입력"
                  placeholderTextColor="#9CA3AF"
                  value={form.password}
                  onChangeText={(value) => updateForm("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginButton, canLogin && styles.loginButtonActive]}
            onPress={handleLogin}
            disabled={!canLogin}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.loginButtonText,
                canLogin && styles.loginButtonTextActive,
              ]}
            >
              로그인
            </Text>
          </TouchableOpacity>

          {/* 추가 옵션 */}
          <View style={styles.additionalOptions}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => router.push("/onboarding/signup")}
            >
              <Text style={styles.optionText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
    minHeight: 56,
    color: "#6B7280",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 18,
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#9CA3AF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 32,
  },
  loginButtonActive: {
    backgroundColor: "#FF4757",
  },
  loginButtonText: {
    color: "#6B7280",
    fontSize: 18,
    fontWeight: "600",
  },
  loginButtonTextActive: {
    color: "white",
  },
  additionalOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
});
