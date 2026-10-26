import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '@/utils/constants';
import { truncateSuiAddress } from '@/utils/sui';

interface Props {
  address: string;
  username?: string;
  onClose?: () => void;
}

export function QRDisplay({ address, username, onClose }: Props) {
  const payload = JSON.stringify({ address, username, app: 'SwapNGo' });

  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        <QRCode value={payload} size={220} backgroundColor={COLORS.white} color={COLORS.black} />
      </View>
      {username ? <Text style={styles.username}>{username}</Text> : null}
      <Text style={styles.address}>{truncateSuiAddress(address)}</Text>
      <Text style={styles.hint}>Scan to send funds to this wallet</Text>
      {onClose ? (
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  qrBox: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  username: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  address: {
    fontSize: 13,
    color: COLORS.gray,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  hint: { fontSize: 13, color: COLORS.gray },
  closeBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  closeText: { fontSize: 15, fontWeight: '600', color: COLORS.black },
});
