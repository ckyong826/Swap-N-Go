import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FsmStatus } from '@/types/fsm.types';
import { COLORS } from '@/utils/constants';

const CONFIG: Record<FsmStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#fef3c7', text: '#92400e' },
  processing: { label: 'Processing', bg: '#dbeafe', text: '#1e40af' },
  completed: { label: 'Completed', bg: '#d1fae5', text: '#065f46' },
  failed: { label: 'Failed', bg: '#fee2e2', text: '#991b1b' },
};

interface Props {
  status: FsmStatus;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({ status, size = 'md', style }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'sm' && styles.sm, style]}>
      <Text style={[styles.text, { color: cfg.text }, size === 'sm' && styles.textSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 13, fontWeight: '600' },
  textSm: { fontSize: 11 },
});
