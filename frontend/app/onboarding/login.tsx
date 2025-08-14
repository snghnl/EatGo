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

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginScreen() {
    const router = useRouter();
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
    const handleLogin = () => {
        if (!form.email || !form.password) {
            Alert.alert("알림", "이메일과 비밀번호를 입력해주세요");
            return;
        }

        if (!validateEmail(form.email)) {
            Alert.alert("알림", "올바른 이메일 형식이 아닙니다");
            return;
        }

        // TODO: 실제 로그인 API 호출
        console.log("로그인 정보:", form);

        // 로그인 성공 시 바로 다음 페이지로 이동
        router.push("/onboarding/food-preference");
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
                                onChangeText={(value) =>
                                    updateForm("email", value)
                                }
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
                                    onChangeText={(value) =>
                                        updateForm("password", value)
                                    }
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                        style={[
                            styles.loginButton,
                            canLogin && styles.loginButtonActive,
                        ]}
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
                            <Text style={styles.optionText}>이메일로 가입</Text>
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
