import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { router } from 'expo-router';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
