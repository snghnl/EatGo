import { View, Text, StyleSheet, FlatList } from 'react-native';

const dummyPosts = [
    { id: '1', title: '첫 번째 커뮤니티 글', author: '홍길동' },
    { id: '2', title: '맛집 추천해주세요!', author: '김철수' },
    { id: '3', title: '오늘 점심 뭐 먹지?', author: '이영희' },
];

export default function CommunityScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}></Text>
            <FlatList
                data={dummyPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.postItem}>
                        <Text style={styles.postTitle}>{`여행코스톡 ${item.title}`}</Text>
                        <Text style={styles.postAuthor}>by {item.author}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        alignSelf: 'center',
    },
    postItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postAuthor: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
});
