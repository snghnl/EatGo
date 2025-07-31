import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AppContainer from '@/components/common/AppContainer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            initialRouteName="map/index"
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                title: '',
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 88,
                        paddingBottom: 34,
                    },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="plan/index"
                options={{
                    title: 'Plan',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="map/index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="community/index"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="mypage/index"
                options={{
                    title: 'MyPage',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
