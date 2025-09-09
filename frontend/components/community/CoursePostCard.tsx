import React from "react";
import { useRouter } from "expo-router";
import {
    View,
    Image,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

interface Props {
    user: {
        nickname: string;
        profile_image_url: string;
    };
    post: {
        id: string;
        title: string;
    };
    routeMeta: {
        location: string;
        duration: string;
        images: string[];
    };
    onPress?: () => void;
    showDeleteButton?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
}

export default function CoursePostCard({
    user,
    post,
    routeMeta,
    onPress,
    showDeleteButton = false,
    onDelete,
    isDeleting = false,
}: Props) {
    const hasProfileImage = Boolean(
        user.profile_image_url && user.profile_image_url.trim()
    );
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push(`/community/${post.id}`)}
        >
            {/* 상단 - 유저 정보 */}
            <View style={styles.header}>
                {hasProfileImage ? (
                    <Image
                        source={{ uri: user.profile_image_url }}
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons
                        name="person-circle-outline"
                        size={45}
                        color={Colors.backgroundGray}
                        style={styles.iconFallback}
                    />
                )}
                <View style={{ flex: 1 }}>
                    <ThemedText size="sm" weight="bold">
                        @{user.nickname}
                    </ThemedText>
                    <ThemedText
                        size="xs"
                        color="textSecondary"
                    >{`${routeMeta.location} · ${routeMeta.duration}`}</ThemedText>
                </View>
                <View style={styles.headerRight}>
                    {showDeleteButton && (
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            disabled={isDeleting}
                            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
                        >
                            {isDeleting ? (
                                <Ionicons
                                    name="hourglass-outline"
                                    size={16}
                                    color={Colors.textSecondary}
                                />
                            ) : (
                                <Ionicons
                                    name="trash-outline"
                                    size={16}
                                    color={Colors.error || "#FF0000"}
                                />
                            )}
                        </Pressable>
                    )}
                    <ThemedText size="xs" color="textSecondary">
                        여행 더보기
                    </ThemedText>
                </View>
            </View>

            {/* 제목 */}
            <ThemedText size="lg" weight="bold" style={{ marginBottom: 8 }}>
                {post.title}
            </ThemedText>

            {/* 이미지 슬라이드 */}
            <FlatList
                horizontal
                data={routeMeta.images}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                    <Image
                        source={{ uri: item }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                showsHorizontalScrollIndicator={false}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: Colors.listbackground,
        borderRadius: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: Colors.backgroundGray,
    },

    iconFallback: {
        marginRight: 10,
        marginLeft: 0,
    }, // 아이콘 왼쪽 정렬 안됨 수정 필요
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    deleteButton: {
        padding: 4,
        borderRadius: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },

    image: {
        width: 100,
        height: 100,
        borderRadius: 6,
        marginRight: 8,
    },
});
