import React from 'react';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { QRScanner } from '@/components/qr/QRScanner';

export default function ScanScreen() {
  const params = useLocalSearchParams<{ returnTo?: string }>();

  const handleScan = (payload: { address: string; username?: string }) => {
    const returnTo = params.returnTo ?? '/(tabs)/send';
    router.replace({
      pathname: returnTo as any,
      params: { recipient: payload.address },
    });
  };

  return (
    <QRScanner
      onScan={handleScan}
      onClose={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({});
