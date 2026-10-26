import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TokenBalance } from '@/types/wallet.types';
import { AssetRow } from './AssetRow';
import { Skeleton } from '@/components/common/Skeleton';
import { COLORS } from '@/utils/constants';

interface Props {
  balances: TokenBalance[];
  loading?: boolean;
}

export function AssetList({ balances, loading }: Props) {
  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map((k) => (
          <View key={k} style={styles.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width={60} height={14} />
              <Skeleton width={100} height={12} />
            </View>
            <Skeleton width={70} height={14} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {balances.map((item, idx) => (
        <View key={item.token}>
          <AssetRow item={item} />
          {idx < balances.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayBorder,
    marginHorizontal: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
});
