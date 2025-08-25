import React from 'react';
import { View, Image, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function PostImagePicker({
    images,
    setImages,
}: {
    images: string[];
    setImages: (newImages: string[]) => void;
}) {
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진을 선택하려면 미디어 라이브러리 접근 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            selectionLimit: 5,
        });

        if (!result.canceled) {
            const newUris = result.assets.map((asset) => asset.uri);
            setImages((prev) => [...prev, ...newUris].slice(0, 5));
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        setImages(newImages);
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
            <Pressable onPress={pickImage} style={styles.addBox}>
                <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
            </Pressable>

            {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                    <Pressable style={styles.removeButton} onPress={() => removeImage(index)}>
                        <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}

const IMAGE_SIZE = 90;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    addBox: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        backgroundColor: Colors.backgroundGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    imageWrapper: {
        position: 'relative',
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        marginRight: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderRadius: 12,
        backgroundColor: Colors.white,
        zIndex: 1,
    },
});
