import React, { useState, useEffect } from "react";
import { useBookmark } from "@/store/BookmarkContext";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
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
        "places"
    );
    const [sortOption, setSortOption] = useState("최신순");
    const [user, setUser] = useState<UserDetail | null>(null);
    const [userRoutes, setUserRoutes] = useState<Route[]>([]);
    const [userTravelCourses, setUserTravelCourses] = useState<TravelCourse[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                const coursesResponse =
                    await TravelCourses.travelCoursesMyList();
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

    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, styles.centered]}
                edges={["top"]}
            >
                <ActivityIndicator size="large" color={Colors.primary} />
                <ThemedText style={{ marginTop: 16 }}>
                    데이터를 불러오는 중...
                </ThemedText>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={[styles.container, styles.centered]}
                edges={["top"]}
            >
                <ThemedText
                    style={{ color: Colors.error, textAlign: "center" }}
                >
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
                    <ThemedText style={{ color: Colors.primary }}>
                        다시 시도
                    </ThemedText>
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

                    {/* Logout Button */}
                    <View style={styles.logoutContainer}>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color={Colors.textSecondary}
                            />
                            <ThemedText style={styles.logoutText}>
                                로그아웃
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
                                    저장한 장소 기능은 Places API 연동이
                                    필요합니다. 현재는 북마크된 장소 ID만
                                    표시됩니다: {bookmarkedPlaceIds.join(", ")}
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
                                    const post = getPostsByCourse(
                                        String(route.id)
                                    )[0];

                                    return (
                                        <CourseCard
                                            key={route.id}
                                            subtitle={
                                                route.description || "코스 설명"
                                            }
                                            title={route.title}
                                            hasImages={false}
                                            onPress={() => {
                                                if (post) {
                                                    router.push({
                                                        pathname:
                                                            "/community/[id]",
                                                        params: { id: post.id },
                                                    });
                                                } else {
                                                    alert(
                                                        "해당 코스에 작성된 게시글이 없습니다."
                                                    );
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
                                        subtitle={
                                            travelCourse.destination ||
                                            "여행 코스"
                                        }
                                        title={travelCourse.title}
                                        hasImages={false}
                                        onPress={() => {
                                            router.push({
                                                pathname:
                                                    "/travel-courses/[id]",
                                                params: { id: travelCourse.id },
                                            });
                                        }}
                                    />
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
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
    logoutContainer: {
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
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
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    tabs: {
        marginBottom: 0,
        alignItems: "center",
    },
});
