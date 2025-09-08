import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface PlaceItem {
  id: string;
  place_name: string;
  category_name: string;
  road_address_name: string;
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  distance: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
}

interface SearchListItemProps {
  item: PlaceItem;
  onSelectItem?: (item: PlaceItem) => void;
}

export default function SearchListItem({
  item,
  onSelectItem,
}: SearchListItemProps) {
  const router = useRouter();

  const handlePress = () => {
    console.log("SearchListItem pressed:", item.place_name, item.id);
    onSelectItem?.(item);
    router.push({
      pathname: "(tabs)/map/place/[id]/detail",
      params: { id: item.id },
    });
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      <View style={styles.row}>
        <FontAwesome
          name="map-marker"
          size={20}
          color={Colors.primary}
          style={styles.icon}
        />
        <View style={styles.leftContent}>
          <Text style={styles.itemCategory}>
            {item.category_name.split(" > ").pop()}
          </Text>
          <Text style={styles.itemTitle}>{item.place_name}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.itemAddress}>{item.road_address_name}</Text>
          <Text style={styles.itemDistance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  rightContent: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  itemDistance: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },
});
