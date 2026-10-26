import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, rightElement, isPassword, style, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eye}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        ) : null}
        {rightElement && !isPassword ? (
          <View style={styles.rightEl}>{rightElement}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.black, letterSpacing: 0.1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputNormal: { borderColor: COLORS.grayBorder },
  inputError: { borderColor: COLORS.error },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    fontWeight: '400',
    letterSpacing: 0, // ponytail: Android placeholder spacing quirk — explicit 0 kills fallback spacing
  },
  eye: { padding: 4 },
  rightEl: { marginLeft: 8 },
  error: { fontSize: 12, color: COLORS.error, marginTop: 2 },
});
