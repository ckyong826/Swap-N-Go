import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { RecipientInput } from '@/components/send/RecipientInput';
import { AmountInput } from '@/components/send/AmountInput';
import { ConfirmSheet } from '@/components/send/ConfirmSheet';
import { Button } from '@/components/common/Button';
import { transferSchema, TransferFormData } from '@/utils/validation';
import { useInitiateTransfer } from '@/hooks/useTransfer';
import { usePinStore } from '@/stores/pin.store';
import { useWallet } from '@/hooks/useWallet';
import { TokenSymbol } from '@/types/wallet.types';
import { COLORS } from '@/utils/constants';
import { KYCGateBanner } from '@/components/common/KYCGateBanner';
import { getTokenBalance } from '@/utils/balance';

export default function SendScreen() {
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('MYRC');
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: initiate, isPending } = useInitiateTransfer();
  const requestPin = usePinStore((s) => s.requestPin);
  const { recipient: scannedRecipient } = useLocalSearchParams<{ recipient?: string }>();
  const { data: wallet } = useWallet();
  const balance = getTokenBalance(wallet?.balances, selectedToken);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema(balance)),
    defaultValues: { token: 'MYRC', recipient: '', amount: '' },
  });

  useEffect(() => {
    if (scannedRecipient) {
      setValue('recipient', scannedRecipient, { shouldValidate: true });
    }
  }, [scannedRecipient]);

  const recipientVal = watch('recipient');
  const amountVal = watch('amount');

  const onReview = handleSubmit(() => setShowConfirm(true));

  const onConfirm = async () => {
    setShowConfirm(false);
    const pin = await requestPin();
    if (!pin) return;
    initiate({
      recipient: recipientVal,
      token: selectedToken,
      amount: Number(amountVal),
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
            <Text style={styles.title}>Send</Text>
            <Text style={styles.subtitle}>Transfer tokens to any SUI wallet</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="recipient"
                render={({ field }) => (
                  <RecipientInput
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                    }}
                    error={errors.recipient?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <AmountInput
                    amount={field.value}
                    onAmountChange={field.onChange}
                    token={selectedToken}
                    onTokenChange={(t) => {
                      setSelectedToken(t);
                    }}
                    amountError={errors.amount?.message}
                    balances={wallet?.balances}
                  />
                )}
              />
            </View>

            <Button
              title="Review Transfer"
              onPress={onReview}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmSheet
          visible={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={onConfirm}
          recipient={recipientVal}
          token={selectedToken}
          amount={Number(amountVal)}
          loading={isPending}
        />
      </KYCGateBanner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: -12 },
  form: { gap: 16 },
});
