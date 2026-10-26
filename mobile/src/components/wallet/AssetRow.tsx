import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TokenBalance } from '@/types/wallet.types';
import { COLORS } from '@/utils/constants';
import { formatCrypto, formatMYR } from '@/utils/format';
import { TokenIcon } from '@/components/common/TokenIcon';

interface Props {
  item: TokenBalance;
}

export function AssetRow({ item }: Props) {
  return (
    <View style={styles.row}>
      <TokenIcon token={item.token} size={44} />
      <View style={styles.info}>
        <Text style={styles.symbol}>{item.token}</Text>
        <Text style={styles.amount}>{formatCrypto(item.amount, item.token)}</Text>
      </View>
      <View style={styles.valueCol}>
        <Text style={styles.myr}>{formatMYR(item.value_myr ?? 0)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  info: { flex: 1 },
  symbol: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  amount: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  valueCol: { alignItems: 'flex-end' },
  myr: { fontSize: 15, fontWeight: '600', color: COLORS.black },
});
