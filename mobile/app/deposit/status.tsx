import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { AsyncStatusPoller } from '@/components/transaction/AsyncStatusPoller';
import { useDepositStatus } from '@/hooks/useDeposit';
import { COLORS } from '@/utils/constants';

export default function DepositStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useDepositStatus(id ?? '');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Status</Text>
          <Text style={styles.id}>ID: {id?.slice(0, 8)}...</Text>
        </View>

        <View style={styles.card}>
          <AsyncStatusPoller
            status={data?.status as any}
            suiTxHash={data?.sui_tx_hash}
            errorMessage={data?.error_message}
            createdAt={data?.created_at}
            isLoading={isLoading}
          />
          {data?.myrc_minted ? (
            <View style={styles.mintedBox}>
              <Text style={styles.mintedLabel}>MYRC Minted</Text>
              <Text style={styles.mintedAmount}>{data.myrc_minted} MYRC</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 20, gap: 20 },
  header: { gap: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  id: { fontSize: 12, color: COLORS.gray, fontFamily: 'monospace' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  mintedBox: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  mintedLabel: { fontSize: 13, color: COLORS.gray },
  mintedAmount: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  homeBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.black },
});
