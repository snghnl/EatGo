import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

interface MyPageHeaderProps {
  username: string;
  neighborCount: number;
  profileImageUrl?: string;
  onPressProfile?: () => void;
}

const MyPageHeader: React.FC<MyPageHeaderProps> = ({
  username,
  neighborCount,
  profileImageUrl,
  onPressProfile,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileBlock} onPress={onPressProfile}>
        <Image
          source={{
            uri:
              profileImageUrl ||
              "https://via.placeholder.com/80x80.png?text=🙂",
          }}
          style={styles.profileImage}
        />
        <View style={styles.infoBlock}>
          <View style={styles.row}>
            <ThemedText size="lg" weight="bold" style={styles.username}>
              @{username}
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          </View>
          <ThemedText size="sm" color="textSecondary">
            이웃 {neighborCount}명
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 36,
    backgroundColor: Colors.white,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundGray,
  },
  infoBlock: {
    marginLeft: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    marginRight: 4,
  },
});

export default MyPageHeader;
