import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {

    return (
        <Tabs
            initialRouteName="map/index"
            screenOptions={{
                tabBarActiveTintColor: Colors.textLight,
                tabBarInactiveTintColor: Colors.textLight,
                headerShown: false,
                title: '',
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 88, paddingBottom: 33 },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="plan/index"
                options={{
                    title: '계획하기',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size ?? 25} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map/index"
                options={{
                    title: '전체지도',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'location' : 'location-outline'} size={size ?? 25} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="community/index"
                options={{
                    title: '여행코스톡',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                            size={size ?? 25}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="mypage/index"
                options={{
                    title: '마이페이지',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={size ?? 25} color={color} />
                    ),
                }}
            />
            <Tabs.Screen name="community/[id]/index" options={{ href: null }} />
            <Tabs.Screen name="community/post_select" options={{ href: null }} />
            <Tabs.Screen name="community/post" options={{ href: null }} />
            <Tabs.Screen name="map/place/[id]/detail" options={{ href: null }} />
            <Tabs.Screen name="map/placelist/[category]/index" options={{ href: null }} />
            <Tabs.Screen name="map/placelist/searchresult" options={{ href: null }} />
            <Tabs.Screen name="plan/[id]/index" options={{ href: null }} />
            <Tabs.Screen name="plan/[id]/recommendation" options={{ href: null }} />
            <Tabs.Screen name="mypage/[uid]/detail" options={{ href: null }} />
        </Tabs>
    );
}
