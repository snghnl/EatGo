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

export default function PostEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigation = useNavigation();
    const { courseId } = useLocalSearchParams<{ courseId?: string }>();
    const course = SAMPLE_COURSES.find((c) => c.id === courseId);

    const handleSubmit = () => {};

    // 실제 데이터 구조에 맞게 subtitle/title을 활용
    const dateRange = course?.subtitle || '여행 일정';
    const location = course?.title || '여행 코스';

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* 상단 헤더 */}
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

                        <TextInput
                            style={styles.textarea}
                            placeholder="즐거웠던 여행을 기록해주세요"
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
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
        padding: 16,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: 'semibold',
        marginBottom: 50,
    },
    submitText: {
        color: Colors.textSecondary,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundGray,
        fontSize: 16,
        paddingVertical: 8,
        marginBottom: 12,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    textarea: {
        height: 200,
        borderWidth: 1,
        borderColor: Colors.backgroundGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
});
