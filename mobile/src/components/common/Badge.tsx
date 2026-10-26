import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/utils/constants';

interface Props {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = COLORS.black, bg = COLORS.green }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
