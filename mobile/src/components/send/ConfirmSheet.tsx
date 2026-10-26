import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { COLORS } from '@/utils/constants';
import { formatCrypto } from '@/utils/format';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipient: string;
  token: string;
  amount: number;
  loading?: boolean;
}

export function ConfirmSheet({ visible, onClose, onConfirm, recipient, token, amount, loading }: Props) {
  return (
    <Modal visible={visible} onClose={onClose} title="Confirm Transfer">
      <View style={styles.content}>
        <Row label="To" value={recipient} mono />
        <Row label="Token" value={token} />
        <Row label="Amount" value={formatCrypto(amount, token)} />
        <View style={styles.note}>
          <Text style={styles.noteText}>
            This action cannot be undone once submitted to the blockchain.
          </Text>
        </View>
        <Button title="Confirm & Send" onPress={onConfirm} loading={loading} />
        <Button title="Cancel" onPress={onClose} variant="ghost" />
      </View>
    </Modal>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  rowLabel: { fontSize: 14, color: COLORS.gray },
  rowValue: { fontSize: 14, fontWeight: '600', color: COLORS.black, flex: 1, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 13 },
  note: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  noteText: { fontSize: 13, color: '#374151', lineHeight: 18 },
});
