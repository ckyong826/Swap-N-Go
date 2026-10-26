import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { formatMYR } from '@/utils/format';
import { Skeleton } from '@/components/common/Skeleton';

interface Props {
  totalMYR: number;
  suiAddress: string;
  loading?: boolean;
  onReceive?: () => void;
}

export function BalanceCard({ totalMYR, suiAddress, loading, onReceive }: Props) {
  const short = suiAddress
    ? `${suiAddress.slice(0, 6)}...${suiAddress.slice(-4)}`
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Total Portfolio</Text>
        <View style={styles.networkBadge}>
          <View style={styles.networkDot} />
          <Text style={styles.networkText}>SUI Testnet</Text>
        </View>
      </View>

      {loading ? (
        <>
          <Skeleton width={180} height={44} borderRadius={10} style={{ marginVertical: 10, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <Skeleton width={130} height={14} borderRadius={7} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </>
      ) : (
        <>
          <Text style={styles.amount}>{formatMYR(totalMYR)}</Text>
          <TouchableOpacity onPress={onReceive} style={styles.addressRow}>
            <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.address}>{short || 'Loading...'}</Text>
            <View style={styles.receiveTag}>
              <Ionicons name="qr-code-outline" size={12} color={COLORS.purpleLight} />
              <Text style={styles.receiveTagText}>Receive</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.purpleDark,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  networkText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  amount: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.5,
    marginVertical: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  address: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' },
  receiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(167,139,250,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  receiveTagText: {
    fontSize: 12,
    color: COLORS.purpleLight,
    fontWeight: '600',
  },
});
