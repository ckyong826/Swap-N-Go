import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '@/utils/constants';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
  fullWidth = true,
}: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.black} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.textPrimary,
            isSecondary && styles.textSecondary,
            isGhost && styles.textGhost,
            isDanger && styles.textDanger,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: { width: '100%' },
  primary: { backgroundColor: COLORS.purple },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: '#fee2e2' },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  textPrimary: { color: COLORS.white },
  textSecondary: { color: COLORS.black },
  textGhost: { color: COLORS.gray },
  textDanger: { color: COLORS.error },
});
