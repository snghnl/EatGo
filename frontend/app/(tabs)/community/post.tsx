import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { SAMPLE_COURSES } from '@/constants/Data';
import { router } from 'expo-router';
import PostImagePicker from '@/components/community/PostImagePicker';
import { Fonts } from '@/constants/Fonts';

export default function PostEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]); // 이미지 상태 추가
    const [inputHeight, setInputHeight] = useState(200); // 초기 높이 설정

    const { courseId } = useLocalSearchParams<{ courseId?: string }>();
    const course = SAMPLE_COURSES.find((c) => c.id === courseId);

    const handleSubmit = () => {};

    // 실제 데이터 구조에 맞게 subtitle/title을 활용
    const dateRange = course?.subtitle || '여행 일정';
    const location = course?.title || '여행 코스';

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* 상단 헤더 */}
                    <View style={{ position: 'absolute', top: 15, left: 15, zIndex: 10 }}>
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={Colors.textSecondary}
                            onPress={() => router.push('/(tabs)/community/post_select')}
                        />
                    </View>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleSubmit}>
                            <Text style={styles.submitText}>등록</Text>
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
                            {dateRange} <Text style={{ color: 'red' }}>📍 {location}</Text>
                        </Text>
                        <PostImagePicker images={images} setImages={setImages} />

                        <TextInput
                            style={styles.textarea}
                            placeholder="즐거웠던 여행을 기록해주세요"
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                            onContentSizeChange={(e) => {
                                setInputHeight(e.nativeEvent.contentSize.height);
                            }}
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
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    title: {
        fontSize: Fonts['2xl'],
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
        alignItems: 'center',
    },
});
