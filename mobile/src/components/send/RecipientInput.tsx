import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Input } from '@/components/common/Input';
import { useResolveRecipient } from '@/hooks/useTransfer';
import { COLORS } from '@/utils/constants';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const mask = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

export function RecipientInput({ value, onChange, error }: Props) {
  const isAddress = value.trim().startsWith('0x');
  const { data, isFetching, isError, error: resolveError } = useResolveRecipient(value);

  return (
    <View style={styles.container}>
      <Input
        label="Recipient"
        placeholder="Username, phone, or SUI address"
        value={value}
        onChangeText={onChange}
        error={error}
        rightElement={
          <TouchableOpacity
            onPress={() => router.push('/scan')}
            style={styles.scanBtn}
          >
            <Ionicons name="qr-code-outline" size={20} color={COLORS.purple} />
          </TouchableOpacity>
        }
      />
      {!isAddress && !error && value.trim().length >= 3 ? (
        isFetching ? (
          <Text style={styles.hint}>Looking up…</Text>
        ) : data ? (
          <Text style={styles.ok}>
            ✓ {data.username} · {mask(data.sui_address)}
          </Text>
        ) : isError ? (
          <Text style={styles.bad}>
            {(resolveError as { message?: string })?.message ?? 'Recipient not found'}
          </Text>
        ) : null
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  hint: { fontSize: 12, color: COLORS.gray, marginLeft: 2 },
  ok: { fontSize: 12, color: COLORS.purple, marginLeft: 2, fontWeight: '600' },
  bad: { fontSize: 12, color: '#dc2626', marginLeft: 2 },
  scanBtn: {
    padding: 4,
    backgroundColor: COLORS.green,
    borderRadius: 8,
  },
});
