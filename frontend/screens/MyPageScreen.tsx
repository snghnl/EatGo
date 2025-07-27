import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function MyPageScreen() {
    // 임시 페이지 상태
    const user = {
        name: '홍길동',
        email: 'honggildong@email.com',
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>
            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>내가 쓴 글</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>찜한 장소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>설정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={[styles.menuText, { color: 'red' }]}>로그아웃</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 60,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#888',
    },
    menuSection: {
        width: '100%',
        paddingHorizontal: 40,
    },
    menuItem: {
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        fontSize: 18,
    },
});
