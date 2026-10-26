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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { withdrawSchema, WithdrawFormData } from '@/utils/validation';
import { useInitiateWithdraw } from '@/hooks/useWithdraw';
import { usePinStore } from '@/stores/pin.store';
import { useWallet } from '@/hooks/useWallet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TOKENS } from '@/utils/constants';
import { TokenSymbol } from '@/types/wallet.types';
import { TokenIcon } from '@/components/common/TokenIcon';
import { KYCGateBanner } from '@/components/common/KYCGateBanner';
import { getTokenBalance } from '@/utils/balance';
import { formatCrypto } from '@/utils/format';

type DestType = 'bank' | 'sui_wallet';

export default function WithdrawScreen() {
  const [destType, setDestType] = useState<DestType>('bank');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('MYRC');
  const { mutate: initiate, isPending } = useInitiateWithdraw();
  const requestPin = usePinStore((s) => s.requestPin);
  const { data: wallet } = useWallet();
  const balance = getTokenBalance(wallet?.balances, selectedToken);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema(balance)),
    defaultValues: { destination_type: 'bank', token: 'MYRC', amount: '' },
  });

  const onSubmit = async (data: WithdrawFormData) => {
    const pin = await requestPin();
    if (!pin) return;

    const destination_details: Record<string, string> =
      destType === 'bank'
        ? { bank_account: data.bank_account ?? '', bank_name: data.bank_name ?? '' }
        : { sui_address: data.sui_address ?? '' };

    initiate({
      destination_type: destType,
      destination_details,
      token: selectedToken,
      amount: Number(data.amount),
      pin,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KYCGateBanner>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="arrow-up" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Withdraw</Text>
            <Text style={styles.subtitle}>Send to your bank or external wallet</Text>
          </View>

          <View style={styles.destRow}>
            <TouchableOpacity
              style={[styles.destBtn, destType === 'bank' && styles.destBtnActive]}
              onPress={() => setDestType('bank')}
            >
              <Ionicons name="business-outline" size={20} color={destType === 'bank' ? COLORS.white : COLORS.gray} />
              <Text style={[styles.destBtnLabel, destType === 'bank' && styles.destBtnLabelActive]}>
                Bank Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.destBtn, destType === 'sui_wallet' && styles.destBtnActive]}
              onPress={() => setDestType('sui_wallet')}
            >
              <Ionicons name="wallet-outline" size={20} color={destType === 'sui_wallet' ? COLORS.white : COLORS.gray} />
              <Text style={[styles.destBtnLabel, destType === 'sui_wallet' && styles.destBtnLabelActive]}>
                SUI Wallet
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {destType === 'bank' ? (
              <>
                <Controller
                  control={control}
                  name="bank_name"
                  render={({ field }) => (
                    <Input
                      label="Bank Name"
                      placeholder="e.g. Maybank, CIMB"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.bank_name?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="bank_account"
                  render={({ field }) => (
                    <Input
                      label="Account Number"
                      placeholder="Enter account number"
                      value={field.value}
                      onChangeText={field.onChange}
                      keyboardType="number-pad"
                      error={errors.bank_account?.message}
                    />
                  )}
                />
              </>
            ) : (
              <Controller
                control={control}
                name="sui_address"
                render={({ field }) => (
                  <Input
                    label="SUI Wallet Address"
                    placeholder="0x..."
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.sui_address?.message}
                  />
                )}
              />
            )}

            <View>
              <Text style={styles.tokenLabel}>Token</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tokenRow}>
                  {TOKENS.map((t) => {
                    const active = selectedToken === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setSelectedToken(t)}
                        style={[styles.tokenChip, active && styles.tokenChipActive]}
                      >
                        <TokenIcon token={t} size={22} />
                        <View>
                          <Text style={[styles.tokenText, active && styles.tokenTextActive]}>
                            {t}
                          </Text>
                          <Text style={styles.tokenBalance}>
                            {formatCrypto(getTokenBalance(wallet?.balances, t), t)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.availableRow}>
              <Text style={styles.availableText}>
                Available: {formatCrypto(balance, selectedToken)}
              </Text>
              <TouchableOpacity onPress={() => setValue('amount', String(balance), { shouldValidate: true })}>
                <Text style={styles.maxText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  label="Amount"
                  placeholder="0.00"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="decimal-pad"
                  error={errors.amount?.message}
                  rightElement={<Text style={styles.symbolLabel}>{selectedToken}</Text>}
                />
              )}
            />

            <Button
              title="Withdraw"
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </KYCGateBanner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: 20, gap: 20 },
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  header: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray },
  destRow: { flexDirection: 'row', gap: 12 },
  destBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.white,
  },
  destBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  destBtnLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  destBtnLabelActive: { color: COLORS.white },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    gap: 16,
  },
  tokenLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 8 },
  tokenRow: { flexDirection: 'row', gap: 8 },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.white,
  },
  tokenChipActive: { backgroundColor: COLORS.purpleDim, borderColor: COLORS.purple },
  tokenText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  tokenTextActive: { color: COLORS.purple },
  tokenBalance: { fontSize: 10, color: COLORS.gray, marginTop: 1 },
  symbolLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availableText: { fontSize: 12, color: COLORS.gray },
  maxText: { fontSize: 12, fontWeight: '700', color: COLORS.purple },
});
