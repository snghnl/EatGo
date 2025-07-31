// components/SearchResultList.tsx
import { View, Text, FlatList } from 'react-native';
import { useSearchStore } from 'hooks/useSearchStore';

const MOCK_DATA = [
    { id: '1', name: '토소우 돈까스', category: '돈까스', address: '서울시 강남구', distance: '5.98km' },
    { id: '2', name: '카츠산도', category: '일식', address: '서울시 마포구', distance: '4.23km' },
    { id: '3', name: '우마이돈카츠', category: '돈까스', address: '서울시 종로구', distance: '6.11km' },
];

export default function SearchResultList() {
    const { keyword } = useSearchStore();

    const filtered = MOCK_DATA.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));

    if (!keyword) return null;

    return (
        <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Text>
                        {item.category} · {item.address} · {item.distance}
                    </Text>
                </View>
            )}
        />
    );
}
