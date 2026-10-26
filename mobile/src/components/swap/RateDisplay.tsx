import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/utils/constants';
import { TokenSymbol } from '@/types/wallet.types';

interface Props {
  fromToken: TokenSymbol;
  toToken: TokenSymbol;
  fromAmount: number;
  prices: Record<string, number>;
}

export function RateDisplay({ fromToken, toToken, fromAmount, prices }: Props) {
  const fromPrice = prices[fromToken] ?? 0;
  const toPrice = prices[toToken] ?? 1;
  const rate = fromPrice / toPrice;
  const toAmount = fromAmount * rate;

  if (!fromPrice || !toPrice) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Rate</Text>
        <Text style={styles.value}>Connecting to live prices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Estimated Rate</Text>
      <Text style={styles.value}>
        1 {fromToken} ≈ {rate.toFixed(6)} {toToken}
      </Text>
      {fromAmount > 0 ? (
        <Text style={styles.receive}>
          You receive ≈ {toAmount.toFixed(6)} {toToken}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  label: { fontSize: 12, color: COLORS.gray, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  receive: { fontSize: 13, color: '#374151', marginTop: 2 },
});
