import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionRecord } from '@/types/transaction.types';
import { TransactionItem } from './TransactionItem';
import { Skeleton } from '@/components/common/Skeleton';
import { COLORS } from '@/utils/constants';

interface Props {
  transactions: TransactionRecord[];
  loading?: boolean;
  emptyMessage?: string;
}

export function TransactionList({ transactions, loading, emptyMessage }: Props) {
  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((k) => (
          <View key={k} style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={50} height={12} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Skeleton width={70} height={14} />
              <Skeleton width={60} height={18} borderRadius={9} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (!transactions.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="mail-open-outline" size={40} color={COLORS.grayBorder} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>{emptyMessage ?? 'No transactions yet'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {transactions.map((item, idx) => (
        <View key={item.id}>
          <TransactionItem item={item} />
          {idx < transactions.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.grayBorder, marginHorizontal: 16 },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.gray },
});
