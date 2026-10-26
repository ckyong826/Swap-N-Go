import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { SwapArrow } from '@/components/swap/SwapArrow';
import { RateDisplay } from '@/components/swap/RateDisplay';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useInitiateSwap } from '@/hooks/useSwap';
import { usePinStore } from '@/stores/pin.store';
import { usePriceSocket } from '@/hooks/usePriceSocket';
import { useWallet } from '@/hooks/useWallet';
import { TokenSymbol } from '@/types/wallet.types';
import { COLORS } from '@/utils/constants';
import { formatCrypto } from '@/utils/format';
import { getTokenBalance } from '@/utils/balance';
import { KYCGateBanner } from '@/components/common/KYCGateBanner';

export default function SwapScreen() {
  const [fromToken, setFromToken] = useState<TokenSymbol>('MYRC');
  const [toToken, setToToken] = useState<TokenSymbol>('USDT');
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [amountError, setAmountError] = useState('');

  const { mutate: initiate, isPending } = useInitiateSwap();
  const requestPin = usePinStore((s) => s.requestPin);
  const { prices } = usePriceSocket();
  const { data: wallet } = useWallet();
  const fromBalance = getTokenBalance(wallet?.balances, fromToken);

  const flip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  const validate = () => {
    const n = Number(amount);
    if (!amount || isNaN(n) || n <= 0) {
      setAmountError('Enter a valid amount');
      return false;
    }
    if (n > fromBalance) {
      setAmountError('Insufficient balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  const onConfirm = async () => {
    setShowConfirm(false);
    const pin = await requestPin();
    if (!pin) return;
    initiate({ from_token: fromToken, to_token: toToken, amount: Number(amount), pin });
  };

  const fromPrice = prices[fromToken] ?? 0;
  const toPrice = prices[toToken] ?? 1;
  const estimated = amount && fromPrice && toPrice
    ? (Number(amount) * fromPrice / toPrice).toFixed(6)
    : '0';

  return (
    <SafeAreaView style={styles.safe}>
      <KYCGateBanner>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Swap</Text>
          <Text style={styles.subtitle}>Exchange tokens at live market rates</Text>

          <View style={styles.swapCard}>
            <TokenSelector
              label="From"
              value={fromToken}
              onChange={setFromToken}
              exclude={toToken}
              balances={wallet?.balances}
            />

            <View style={styles.availableRow}>
              <Text style={styles.availableText}>
                Available: {formatCrypto(fromBalance, fromToken)}
              </Text>
              <TouchableOpacity onPress={() => setAmount(String(fromBalance))}>
                <Text style={styles.maxText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <Input
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                error={amountError}
              />
            </View>

            <SwapArrow onPress={flip} />

            <TokenSelector
              label="To"
              value={toToken}
              onChange={setToToken}
              exclude={fromToken}
              balances={wallet?.balances}
            />

            <RateDisplay
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={Number(amount) || 0}
              prices={prices}
            />
          </View>

          <Button
            title="Review Swap"
            onPress={() => validate() && setShowConfirm(true)}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Swap">
        <View style={styles.confirmContent}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>You Pay</Text>
            <Text style={styles.confirmValue}>{formatCrypto(Number(amount), fromToken)}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>You Receive (est.)</Text>
            <Text style={styles.confirmValue}>{formatCrypto(Number(estimated), toToken)}</Text>
          </View>
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Final amount may vary slightly due to market movement. Transaction is processed on the SUI blockchain.
            </Text>
          </View>
          <Button title="Confirm Swap" onPress={onConfirm} loading={isPending} />
          <Button title="Cancel" onPress={() => setShowConfirm(false)} variant="ghost" />
        </View>
      </Modal>
      </KYCGateBanner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: -12 },
  swapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {},
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availableText: { fontSize: 12, color: COLORS.gray },
  maxText: { fontSize: 12, fontWeight: '700', color: COLORS.purple },
  confirmContent: { gap: 14 },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  confirmLabel: { fontSize: 14, color: COLORS.gray },
  confirmValue: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  note: {
    backgroundColor: COLORS.purpleDim,
    borderRadius: 12,
    padding: 14,
  },
  noteText: { fontSize: 13, color: COLORS.black, lineHeight: 18 },
});
