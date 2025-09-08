// components/common/FloatingWriteButton.tsx

import React from "react";
import { TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function FloatingWriteButton() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#FF9EA4", Colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientButton}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/community/post_select")}
        activeOpacity={0.8}
      >
        <Image
          source={require("../../assets/images/postpen.png")}
          style={styles.icon}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientButton: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: "#fff",
  },
});
