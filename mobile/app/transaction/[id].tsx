import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { AsyncStatusPoller } from '@/components/transaction/AsyncStatusPoller';
import { useTransferStatus } from '@/hooks/useTransfer';
import { useSwapStatus } from '@/hooks/useSwap';
import { useDepositStatus } from '@/hooks/useDeposit';
import { useWithdrawStatus } from '@/hooks/useWithdraw';
import { COLORS } from '@/utils/constants';

type TxType = 'transfer' | 'swap' | 'deposit' | 'withdrawal';

const TYPE_LABELS: Record<TxType, string> = {
  transfer: 'Transfer',
  swap: 'Swap',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
};

function useStatus(id: string, type: TxType) {
  const transfer = useTransferStatus(type === 'transfer' ? id : '');
  const swap = useSwapStatus(type === 'swap' ? id : '');
  const deposit = useDepositStatus(type === 'deposit' ? id : '');
  const withdraw = useWithdrawStatus(type === 'withdrawal' ? id : '');

  const map = { transfer, swap, deposit, withdrawal: withdraw };
  const query = map[type];

  return {
    data: query.data as any,
    isLoading: query.isLoading,
  };
}

export default function TransactionDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const txType = (type ?? 'transfer') as TxType;
  const { data, isLoading } = useStatus(id ?? '', txType);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{TYPE_LABELS[txType]}</Text>
          <Text style={styles.id}>ID: {id?.slice(0, 12)}...</Text>
        </View>

        <View style={styles.card}>
          <AsyncStatusPoller
            status={data?.status}
            suiTxHash={data?.sui_tx_hash}
            errorMessage={data?.error_message}
            createdAt={data?.created_at}
            isLoading={isLoading}
          />
        </View>

        {data ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Transaction Details</Text>
            {data.amount ? (
              <DetailRow label="Amount" value={`${data.amount} ${data.token ?? data.from_token ?? ''}`} />
            ) : null}
            {data.recipient ? (
              <DetailRow label="Recipient" value={data.recipient} mono />
            ) : null}
            {data.from_token && data.to_token ? (
              <DetailRow label="Swap" value={`${data.from_token} → ${data.to_token}`} />
            ) : null}
            {data.amount_myr ? (
              <DetailRow label="MYR Amount" value={`RM ${data.amount_myr}`} />
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, mono && styles.mono]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 4 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 4, marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  id: { fontSize: 12, color: COLORS.gray, fontFamily: 'monospace' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    gap: 0,
  },
  detailTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  detailLabel: { fontSize: 14, color: COLORS.gray },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.black, flex: 1, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  homeBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.black },
});
