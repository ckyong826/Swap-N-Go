import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, Pressable } from 'react-native';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { authApi } from '@/api/auth.api';
import { usePinStore } from '@/stores/pin.store';
import { COLORS } from '@/utils/constants';

// Global PIN prompt shown before every transaction. Collects 4 digits and
// verifies them against the backend before handing them back to the awaiting
// caller; a wrong PIN keeps the modal open and re-prompts instead of failing
// the transaction downstream.
export function PinModalHost() {
  const visible = usePinStore((s) => s.visible);
  const submitPin = usePinStore((s) => s.submitPin);
  const cancelPin = usePinStore((s) => s.cancelPin);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
    }
  }, [visible]);

  const submit = async () => {
    setBusy(true);
    setError('');
    Keyboard.dismiss();
    try {
      await authApi.verifyPin(pin);
      submitPin(pin);
    } catch (e) {
      setError((e as { message?: string }).message ?? 'Invalid PIN');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  // Auto-submit once 4 digits are in (skip while a verify is in flight).
  useEffect(() => {
    if (visible && pin.length === 4 && !busy) submit();
  }, [pin, visible]);

  return (
    <Modal visible={visible} onClose={cancelPin} title="Enter PIN">
      <Pressable style={styles.body} onPress={Keyboard.dismiss}>
        <Text style={styles.hint}>Enter your 4-digit PIN to authorise this transaction.</Text>
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
        <Button title="Confirm" onPress={submit} loading={busy} disabled={pin.length !== 4} />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  hint: { fontSize: 14, color: COLORS.gray, textAlign: 'center' },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    paddingVertical: 14,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    color: COLORS.black,
  },
  error: { color: COLORS.error, fontSize: 13, textAlign: 'center' },
});
