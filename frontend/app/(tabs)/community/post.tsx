import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    TextInput,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, router } from "expo-router";
import PostImagePicker from "@/components/community/PostImagePicker";
import { Fonts } from "@/constants/Fonts";
import { useCreatePost } from "@/src/hooks/useCommunity";
import { useTravelCourse } from "@/src/hooks/useTravelCourse";

export default function PostEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const { courseId } = useLocalSearchParams<{ courseId?: string }>();
    const { createPost, isLoading, error } = useCreatePost();
    const { course } = useTravelCourse(courseId);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("입력 오류", "제목과 내용을 모두 입력해주세요.");
            return;
        }

        const postData = {
            title: title.trim(),
            content: content.trim(),
            travel_course_id: courseId || undefined,
            images: images.map((url, index) => ({
                url,
                sequence: index.toString(),
                alt_text: `Post image ${index + 1}`,
            })),
        };

        const result = await createPost(postData);

        if (result) {
            Alert.alert("성공", "게시물이 등록되었습니다.", [
                {
                    text: "확인",
                    onPress: () => router.push("/(tabs)/community"),
                },
            ]);
        } else {
            Alert.alert("오류", error || "게시물 등록에 실패했습니다.");
        }
    };

    const location = course?.destination || "여행 코스";

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* 상단 헤더 */}
                    <View
                        style={{
                            position: "absolute",
                            top: 15,
                            left: 15,
                            zIndex: 10,
                        }}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={Colors.textSecondary}
                            onPress={() =>
                                router.push("/(tabs)/community/post_select")
                            }
                        />
                    </View>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primary}
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.submitText,
                                        isLoading && { opacity: 0.5 },
                                    ]}
                                >
                                    등록
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* 입력 영역 */}
                    <View>
                        <TextInput
                            style={styles.title}
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.metaText}>
                            <Text>
                                여행기간: {course?.start_date} ~{" "}
                                {course?.end_date}
                            </Text>
                            <Text style={{ color: "red" }}>📍 {location}</Text>
                        </Text>
                        <PostImagePicker
                            images={images}
                            setImages={setImages}
                        />

                        <TextInput
                            style={styles.textarea}
                            placeholder="즐거웠던 여행을 기록해주세요"
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                        />
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
    scroll: {
        padding: 20,
    },
    header: {
        alignItems: "flex-end",
        marginBottom: 15,
    },
    title: {
        fontSize: Fonts["2xl"],
        fontWeight: Fonts.weight.semibold,
        marginBottom: 30,
    },
    submitText: {
        color: Colors.textSecondary,
        fontSize: Fonts.base,
        fontWeight: Fonts.weight.medium,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundGray,
        fontSize: 16,
        paddingVertical: 8,
        marginBottom: 12,
    },
    metaText: {
        fontSize: Fonts.sm,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    textarea: {
        borderColor: Colors.backgroundGray,
        borderRadius: 8,
        padding: 12,
        fontSize: Fonts.base,
    },

    photoButton: {
        backgroundColor: Colors.backgroundGray,
        paddingVertical: 5,
        borderRadius: 8,
        alignItems: "center",
    },
});
