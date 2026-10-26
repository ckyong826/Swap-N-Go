import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Input } from '@/components/common/Input';
import { COLORS, TOKENS } from '@/utils/constants';
import { TokenBalance, TokenSymbol } from '@/types/wallet.types';
import { TokenIcon } from '@/components/common/TokenIcon';
import { getTokenBalance } from '@/utils/balance';
import { formatCrypto } from '@/utils/format';

interface Props {
  amount: string;
  onAmountChange: (v: string) => void;
  token: TokenSymbol;
  onTokenChange: (t: TokenSymbol) => void;
  amountError?: string;
  balances?: TokenBalance[];
}

export function AmountInput({ amount, onAmountChange, token, onTokenChange, amountError, balances }: Props) {
  const balance = getTokenBalance(balances, token);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tokenScroll}>
        <View style={styles.tokenRow}>
          {TOKENS.map((t) => {
            const active = t === token;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => onTokenChange(t)}
                style={[styles.tokenChip, active && styles.tokenChipActive]}
              >
                <TokenIcon token={t} size={22} />
                <View>
                  <Text style={[styles.tokenLabel, active && styles.tokenLabelActive]}>{t}</Text>
                  <Text style={styles.tokenBalance}>{formatCrypto(getTokenBalance(balances, t), t)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.availableRow}>
        <Text style={styles.availableText}>Available: {formatCrypto(balance, token)}</Text>
        <TouchableOpacity onPress={() => onAmountChange(String(balance))}>
          <Text style={styles.maxText}>MAX</Text>
        </TouchableOpacity>
      </View>
      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="decimal-pad"
        error={amountError}
        rightElement={<Text style={styles.symbol}>{token}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  tokenScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  tokenRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.white,
  },
  tokenChipActive: {
    backgroundColor: COLORS.purpleDim,
    borderColor: COLORS.purple,
  },
  tokenLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  tokenLabelActive: { color: COLORS.purple },
  tokenBalance: { fontSize: 10, color: COLORS.gray, marginTop: 1 },
  symbol: { fontSize: 14, fontWeight: '700', color: COLORS.gray },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availableText: { fontSize: 12, color: COLORS.gray },
  maxText: { fontSize: 12, fontWeight: '700', color: COLORS.purple },
});
