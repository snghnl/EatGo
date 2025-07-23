import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#C7C7C7',
                tabBarInactiveTintColor: '#C7C7C7',
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="plan"
                options={{
                    tabBarLabel: '계획하기',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: '홈',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    tabBarLabel: '여행코스톡',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="chatbox-ellipses-outline" size={25} color={color} />,
                }}
            />
            <Tabs.Screen
                name="mypage"
                options={{
                    tabBarLabel: '마이페이지',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={25} color={color} />,
                }}
            />
        </Tabs>
    );
}
