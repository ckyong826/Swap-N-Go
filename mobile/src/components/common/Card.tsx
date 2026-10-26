import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { COLORS } from '@/utils/constants';

interface Props extends ViewProps {
  variant?: 'white' | 'green';
  padding?: number;
}

export function Card({ children, variant = 'white', padding = 16, style, ...props }: Props) {
  return (
    <View
      style={[
        styles.base,
        { padding },
        variant === 'green' ? styles.green : styles.white,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  white: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grayBorder },
  green: { backgroundColor: COLORS.green, borderWidth: 0 },
});
