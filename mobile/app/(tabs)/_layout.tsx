import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';
import { COLORS } from '@/utils/constants';
import { useNotification } from '@/hooks/useNotification';
import { useWsReconnectRefresh } from '@/hooks/useWsReconnectRefresh';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const insets = useSafeAreaInsets();

  // Listen for server-pushed transaction notifications via WebSocket
  useNotification();
  useWsReconnectRefresh();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom }],
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Send',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'arrow-up-circle' : 'arrow-up-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    paddingTop: 8,
  },
  label: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
