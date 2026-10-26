import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { useAuthStore } from '@/stores/auth.store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useUIStore } from '@/stores/ui.store';
import { usePinStore } from '@/stores/pin.store';
import { COLORS } from '@/utils/constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PinModalHost } from '@/components/common/PinModalHost';
import { UnlockOverlay } from '@/components/common/UnlockOverlay';

function Toast() {
  const toast = useUIStore((s) => s.toast);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [toast, opacity]);

  if (!toast) return null;

  const bg =
    toast.type === 'success' ? '#d1fae5' :
    toast.type === 'error' ? '#fee2e2' : COLORS.green;
  const textColor =
    toast.type === 'success' ? '#065f46' :
    toast.type === 'error' ? '#991b1b' : COLORS.black;

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]}>
      <Text style={[styles.toastText, { color: textColor }]}>{toast.message}</Text>
    </Animated.View>
  );
}

function RootLayoutNav() {
  const { loadToken, isLoading, isAuthenticated } = useAuthStore();
  const unlocked = usePinStore((s) => s.unlocked);

  useEffect(() => {
    loadToken();
  }, []);

  if (isLoading) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deposit" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="transaction" />
      </Stack>
      {isAuthenticated && !unlocked && <UnlockOverlay />}
      <PinModalHost />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
