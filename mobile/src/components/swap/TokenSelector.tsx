import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TOKENS } from '@/utils/constants';
import { TokenBalance, TokenSymbol } from '@/types/wallet.types';
import { TokenIcon } from '@/components/common/TokenIcon';
import { getTokenBalance } from '@/utils/balance';
import { formatCrypto } from '@/utils/format';

interface Props {
  label: string;
  value: TokenSymbol;
  onChange: (t: TokenSymbol) => void;
  exclude?: TokenSymbol;
  balances?: TokenBalance[];
}

export function TokenSelector({ label, value, onChange, exclude, balances }: Props) {
  const [open, setOpen] = useState(false);
  const options = TOKENS.filter((t) => t !== exclude);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)}>
          <TokenIcon token={value} size={34} />
          <Text style={styles.symbol}>{value}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <Text style={styles.sheetTitle}>Select Token</Text>
          <FlatList
            data={options}
            keyExtractor={(t) => t}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item === value && styles.optionActive]}
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <TokenIcon token={item} size={38} />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionText}>{item}</Text>
                  <Text style={styles.optionBalance}>{formatCrypto(getTokenBalance(balances, item), item)}</Text>
                </View>
                {item === value && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.purple} />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.black },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  symbol: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.black },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '60%',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 16 },
  listContent: { paddingBottom: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  optionActive: { backgroundColor: COLORS.purpleDim },
  optionInfo: { flex: 1 },
  optionText: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  optionBalance: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
});
