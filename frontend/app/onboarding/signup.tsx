import React, { useState, useCallback } from "react";
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
    Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Accounts } from "@/src/client/sdk.gen";
import { AccountsSignupCreateData, User } from "@/src/client/types.gen";
import AgreementPopup from "@/components/onboarding/AgreementPopup";
import TermsContent from "@/components/onboarding/TermsContent";
import PrivacyContent from "@/components/onboarding/PrivacyContent";
import LocationContent from "@/components//onboarding/LocationContent";
import { useAuth } from "@/src/contexts/AuthContext";

interface SignupForm extends User {
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
    agreeToThirdParty: boolean;
    agreeToLocation: boolean;
    agreeToAll: boolean;
}

export default function SignupScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [form, setForm] = useState<SignupForm>({
        email: "",
        password: "",
        password_confirm: "",
        username: "",
        login_method: "email",
        agreeToTerms: false,
        agreeToPrivacy: false,
        agreeToThirdParty: false,
        agreeToLocation: false,
        agreeToAll: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [open, setOpen] = useState<null | "terms" | "privacy" | "location">(
        null
    );

    // 이메일 유효성 검사
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 비밀번호 강도 검사
    const validatePassword = (password: string) => {
        const minLength = password.length >= 10;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return {
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
        };
    };

    // 폼 업데이트
    const updateForm = (field: keyof SignupForm, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // 약관 동의 토글
    const toggleTermsAgreement = () => {
        setForm((prev) => ({ ...prev, agreeToTerms: !prev.agreeToTerms }));
        updateAgreementStatus();
    };

    // 개인정보 수집 및 이용 동의 토글
    const togglePrivacyAgreement = () => {
        setForm((prev) => ({ ...prev, agreeToPrivacy: !prev.agreeToPrivacy }));
        updateAgreementStatus();
    };

    // 위치정보 수집 및 이용 동의 토글
    const toggleLocationAgreement = () => {
        setForm((prev) => ({
            ...prev,
            agreeToLocation: !prev.agreeToLocation,
        }));
        updateAgreementStatus();
    };

    // 전체 동의 토글
    const toggleAllAgreement = () => {
        const newValue = !form.agreeToAll;
        setForm((prev) => ({
            ...prev,
            agreeToAll: newValue,
            agreeToTerms: newValue,
            agreeToPrivacy: newValue,
            agreeToThirdParty: newValue,
            agreeToLocation: newValue,
        }));
    };

    // 개별 동의 상태에 따른 전체 동의 상태 업데이트
    const updateAgreementStatus = () => {
        const allChecked =
            form.agreeToTerms &&
            form.agreeToPrivacy &&
            form.agreeToThirdParty &&
            form.agreeToLocation;
        setForm((prev) => ({ ...prev, agreeToAll: allChecked }));
    };

    // 가입 처리
    const handleSignup = async () => {
        if (!form.agreeToTerms) {
            Alert.alert("알림", "서비스 이용약관에 동의해주세요");
            return;
        }

        if (allRequirementsMet()) {
            try {
                const signupData = {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    password_confirm: form.password_confirm,
                    login_method: form.login_method,
                };

                console.log("Signup data being sent:", signupData);

                const response = await Accounts.accountsSignupCreate({
                    body: signupData,
                });

                if (response.data) {
                    const signupResponse = response.data as any; // Type assertion due to schema mismatch

                    // Login using AuthContext after successful signup
                    if (signupResponse.tokens) {
                        await login({
                            access: signupResponse.tokens.access,
                            refresh: signupResponse.tokens.refresh,
                        });

                        Alert.alert(
                            "가입 완료",
                            "잇고에 오신 것을 환영합니다!",
                            [
                                {
                                    text: "확인",
                                    onPress: () =>
                                        router.push(
                                            "/onboarding/food-preference"
                                        ),
                                },
                            ]
                        );
                    }
                }
            } catch (error: unknown) {
                console.error("Signup error:", error);
                console.error("Error details:", JSON.stringify(error, null, 2));

                // Try to get more specific error information
                if (error && typeof error === "object" && "response" in error) {
                    const response = (error as any).response;
                    console.error("Response status:", response?.status);
                    console.error("Response data:", response?.data);
                }

                Alert.alert(
                    "가입 실패",
                    "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
                );
            }
        } else {
            Alert.alert("입력 오류", "모든 항목을 올바르게 입력해주세요");
        }
    };

    // 비밀번호 요구사항 충족 여부 확인
    const getPasswordRequirements = () => {
        const password = form.password;
        return {
            hasEnglish: /[a-zA-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasMinLength: password.length >= 10,
        };
    };

    // 비밀번호 일치 여부
    const isPasswordMatch =
        form.password_confirm && form.password_confirm === form.password;

    // 모든 요구사항 충족 여부
    const allRequirementsMet = () => {
        const requirements = getPasswordRequirements();
        const isEmailValid = form.email && validateEmail(form.email);
        return (
            form.username &&
            isEmailValid &&
            requirements.hasEnglish &&
            requirements.hasNumber &&
            requirements.hasMinLength &&
            isPasswordMatch &&
            form.agreeToTerms &&
            form.agreeToPrivacy &&
            form.agreeToThirdParty &&
            form.agreeToLocation
        );
    };

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
                        <Text style={styles.headerTitle}>회원가입</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* 제목 */}
                    <Text style={styles.title}>회원가입</Text>
                    <Text style={styles.subtitle}>미식여행을 위한 첫걸음</Text>

                    {/* 폼 */}
                    <View style={styles.form}>
                        {/* 사용자명 입력 */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="사용자명 입력"
                                placeholderTextColor="#9CA3AF"
                                value={form.username}
                                onChangeText={(value) =>
                                    updateForm("username", value)
                                }
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

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

                            {/* 비밀번호 요구사항 */}
                            <View style={styles.passwordRequirements}>
                                <Text
                                    style={[
                                        styles.requirementText,
                                        getPasswordRequirements().hasEnglish &&
                                            styles.requirementMet,
                                    ]}
                                >
                                    영문포함
                                </Text>
                                <Text
                                    style={[
                                        styles.requirementText,
                                        getPasswordRequirements().hasNumber &&
                                            styles.requirementMet,
                                    ]}
                                >
                                    숫자포함
                                </Text>
                                <Text
                                    style={[
                                        styles.requirementText,
                                        getPasswordRequirements()
                                            .hasMinLength &&
                                            styles.requirementMet,
                                    ]}
                                >
                                    10자이상
                                </Text>
                            </View>
                        </View>

                        {/* 비밀번호 확인 */}
                        <View style={styles.inputContainer}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="비밀번호 확인"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.password_confirm}
                                    onChangeText={(value) =>
                                        updateForm("password_confirm", value)
                                    }
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    <Ionicons
                                        name={
                                            showConfirmPassword
                                                ? "eye-off"
                                                : "eye"
                                        }
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* 비밀번호 일치 상태 */}
                            <View style={styles.passwordMatchContainer}>
                                <Text
                                    style={[
                                        styles.passwordMatchText,
                                        isPasswordMatch &&
                                            styles.passwordMatchSuccess,
                                    ]}
                                >
                                    비밀번호 일치
                                </Text>
                            </View>
                        </View>

                        {/* 약관 동의 */}
                        <View style={styles.termsContainer}>
                            <Text style={styles.termsTitle}>서비스 정책</Text>
                            <View style={styles.termsBox}>
                                {/* 전체 동의 */}
                                <TouchableOpacity
                                    style={styles.termsRow}
                                    onPress={toggleAllAgreement}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            form.agreeToAll &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {form.agreeToAll && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.termsText}>
                                        전체동의
                                    </Text>
                                </TouchableOpacity>

                                {/* 구분선 */}
                                <View style={styles.divider} />

                                {/* 개별 동의 항목들 */}
                                <TouchableOpacity
                                    style={styles.termsRow}
                                    onPress={toggleTermsAgreement}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            form.agreeToTerms &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {form.agreeToTerms && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.termsText}>
                                        [필수] 서비스 이용약관 동의
                                    </Text>
                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => setOpen("terms")}
                                    >
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color="#9CA3AF"
                                        />
                                    </Pressable>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.termsRow}
                                    onPress={togglePrivacyAgreement}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            form.agreeToPrivacy &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {form.agreeToPrivacy && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.termsText}>
                                        [필수] 개인정보 수집 및 이용 동의
                                    </Text>
                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => setOpen("privacy")}
                                    >
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color="#9CA3AF"
                                        />
                                    </Pressable>{" "}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.termsRow}
                                    onPress={toggleLocationAgreement}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            form.agreeToLocation &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {form.agreeToLocation && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.termsText}>
                                        [필수] 위치정보 수집 및 이용
                                    </Text>
                                    <Pressable
                                        hitSlop={8}
                                        onPress={() => setOpen("location")}
                                    >
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color="#9CA3AF"
                                        />
                                    </Pressable>{" "}
                                </TouchableOpacity>

                                <AgreementPopup
                                    visible={open === "terms"}
                                    title="서비스 이용약관 동의"
                                    onClose={() => setOpen(null)}
                                    onAgree={() => {
                                        if (!form.agreeToTerms)
                                            toggleTermsAgreement();
                                        setOpen(null);
                                    }}
                                >
                                    <TermsContent />
                                </AgreementPopup>

                                {/* 개인정보 수집 및 이용 */}
                                <AgreementPopup
                                    visible={open === "privacy"}
                                    title="개인정보 수집 및 이용 동의"
                                    onClose={() => setOpen(null)}
                                    onAgree={() => {
                                        if (!form.agreeToPrivacy)
                                            togglePrivacyAgreement();
                                        setOpen(null);
                                    }}
                                >
                                    <PrivacyContent />
                                </AgreementPopup>

                                {/* 위치정보 수집 및 이용 */}
                                <AgreementPopup
                                    visible={open === "location"}
                                    title="위치정보 수집 및 이용"
                                    onClose={() => setOpen(null)}
                                    onAgree={() => {
                                        if (!form.agreeToLocation)
                                            toggleLocationAgreement();
                                        setOpen(null);
                                    }}
                                >
                                    <LocationContent />
                                </AgreementPopup>
                            </View>
                        </View>
                    </View>

                    {/* 가입 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            allRequirementsMet() && styles.signupButtonActive,
                        ]}
                        onPress={handleSignup}
                        disabled={!allRequirementsMet()}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.signupButtonText,
                                allRequirementsMet() &&
                                    styles.signupButtonTextActive,
                            ]}
                        >
                            가입하기
                        </Text>
                    </TouchableOpacity>
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
    passwordRequirements: {
        flexDirection: "column",
        marginTop: 12,
        marginLeft: 4,
    },
    requirementText: {
        fontSize: 12,
        color: "#9CA3AF",
        fontWeight: "400",
        marginBottom: 4,
    },
    requirementMet: {
        color: Colors.primary,
        fontWeight: "600",
    },
    passwordMatchContainer: {
        marginTop: 12,
        marginLeft: 4,
    },
    passwordMatchText: {
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "400",
    },
    passwordMatchSuccess: {
        color: Colors.primary,
        fontWeight: "600",
    },
    termsContainer: {
        marginTop: 16,
    },
    termsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 12,
        textAlign: "center",
    },
    termsBox: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    divider: {
        height: 1,
        backgroundColor: "#FF9EA4",
        marginVertical: 16,
    },
    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    checkboxChecked: {
        backgroundColor: "#FF9EA4",
        borderColor: "#FF9EA4",
    },
    termsText: {
        fontSize: 14,
        color: "#6B7280",
        flex: 1,
        marginRight: 8,
    },
    signupButton: {
        backgroundColor: "#9CA3AF",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 32,
    },
    signupButtonActive: {
        backgroundColor: "#FF4757",
    },
    signupButtonText: {
        color: "#6B7280",
        fontSize: 18,
        fontWeight: "600",
    },
    signupButtonTextActive: {
        color: "white",
    },
});
