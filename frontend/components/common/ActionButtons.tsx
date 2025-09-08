import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface ActionButton {
  label: string;
  onPress: () => void;
}

interface ActionButtonsProps {
  actions: ActionButton[];
}

export default function ActionButtons({ actions }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          <TouchableOpacity onPress={action.onPress}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
          {index < actions.length - 1 && <Text style={styles.divider}>|</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    fontSize: 14,
    color: "#ccc",
    marginHorizontal: 8,
  },
});
