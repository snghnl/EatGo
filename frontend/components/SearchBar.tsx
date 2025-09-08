import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  Pressable,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import SearchListItem from "./SearchListItem";
import { useRouter, useFocusEffect } from "expo-router";

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

interface SearchBarProps {
  onSelectItem?: (item: PlaceItem) => void;
  searchData?: PlaceItem[];
}

export default function SearchBar({
  onSelectItem,
  searchData = [],
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<PlaceItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const textInputRef = useRef<TextInput>(null);

  // 페이지에 focus가 돌아왔을 때 search input 초기화
  useFocusEffect(
    React.useCallback(() => {
      setSearchTerm("");
      setResults([]);
      setIsFocused(false);
    }, []),
  );

  useEffect(() => {
    if (searchTerm === "") {
      setResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = searchData.filter((item) => {
      return (
        item.place_name.toLowerCase().includes(term) ||
        item.category_name.toLowerCase().includes(term)
      );
    });
    setResults(filtered);
  }, [searchTerm, searchData]);

  const handleSelectItem = (item: PlaceItem) => {
    console.log("SearchBar handleSelectItem called:", item.place_name);
    Keyboard.dismiss();
    setIsFocused(false);
    setSearchTerm(item.place_name);
    onSelectItem?.(item);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      Keyboard.dismiss();
      setIsFocused(false);
      router.push({
        pathname: "(tabs)/map/placelist/searchresult",
        params: { query: searchTerm.trim() },
      });
    }
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

  const handleContainerPress = () => {
    textInputRef.current?.focus();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleContainerPress}
      activeOpacity={1}
    >
      <TextInput
        ref={textInputRef}
        placeholder={isFocused ? "" : "지역, 맛집 등을 검색하세요"}
        placeholderTextColor="#C7C7C7"
        style={styles.input}
        value={searchTerm}
        onChangeText={setSearchTerm}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // 터치 이벤트가 처리될 시간을 주기 위해 지연
          setTimeout(() => setIsFocused(false), 150);
        }}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
        selectionColor="transparent"
      />
      <Text style={styles.separator}>|</Text>
      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
        <Ionicons name="search" size={25} color="#C7C7C7" />
      </TouchableOpacity>

      {isFocused && (
        <View style={styles.overlay}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchListItem item={item} onSelectItem={handleSelectItem} />
            )}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={styles.flatListStyle}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 51,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFCFC",
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  separator: {
    fontSize: 25,
    color: "#C7C7C7",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  searchButton: {
    padding: 5,
  },
  overlay: {
    position: "absolute",
    top: 95,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 180,
    zIndex: 1000,
  },
  flatListStyle: {
    flex: 1,
  },
});
