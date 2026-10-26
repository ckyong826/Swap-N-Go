import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { authApi } from '@/api/auth.api';
import { usePinStore } from '@/stores/pin.store';
import { useAuthStore } from '@/stores/auth.store';
import { COLORS } from '@/utils/constants';

// Cold-start / post-login app lock. Covers everything until the user re-enters
// their PIN, verified against the backend. ponytail: no "forgot PIN" recovery —
// the only escape is logout (and a fresh account). Fine for the demo.
export function UnlockOverlay() {
  const setUnlocked = usePinStore((s) => s.setUnlocked);
  const logout = useAuthStore((s) => s.logout);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    Keyboard.dismiss();
    try {
      await authApi.verifyPin(pin);
      setUnlocked(true);
    } catch (e) {
      setError((e as { message?: string }).message ?? 'Invalid PIN');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  // Auto-submit once 4 digits are in (skip while a verify is in flight).
  useEffect(() => {
    if (pin.length === 4 && !busy) submit();
  }, [pin]);

  return (
    <SafeAreaView style={styles.overlay}>
      <Pressable style={styles.body} onPress={Keyboard.dismiss}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.title}>Enter your PIN</Text>
        <Text style={styles.subtitle}>Unlock Swap N Go to continue</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          autoFocus
          placeholder="••••"
          placeholderTextColor={COLORS.gray}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Unlock" onPress={submit} loading={busy} disabled={pin.length !== 4} />
        <Button title="Log out" onPress={logout} variant="ghost" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.offWhite,
    zIndex: 9998,
    justifyContent: 'center',
  },
  body: { padding: 32, gap: 16, alignItems: 'center' },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray, marginBottom: 8 },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    paddingVertical: 16,
    fontSize: 32,
    letterSpacing: 16,
    textAlign: 'center',
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  error: { color: COLORS.error, fontSize: 13 },
});
