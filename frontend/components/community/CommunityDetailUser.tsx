import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

interface CommunityDetailUserProps {
  nickname: string;
  profileImageUrl: string;
  subInfo?: string;
}

export function CommunityDetailUser({
  nickname,
  profileImageUrl,
  subInfo,
}: CommunityDetailUserProps) {
  const hasProfileImage = Boolean(profileImageUrl && profileImageUrl.trim());
  return (
    <View style={styles.userContainer}>
      {hasProfileImage ? (
        <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
      ) : (
        <Ionicons
          name="person-circle-outline"
          size={40}
          color={Colors.backgroundGray}
          style={styles.iconFallback}
        />
      )}
      <View>
        <ThemedText size="sm" weight="bold">
          @{nickname}
        </ThemedText>
        {subInfo && (
          <ThemedText size="xs" color="textSecondary">
            {subInfo}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
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
  },
});
