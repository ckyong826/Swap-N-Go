import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { AssetList } from '@/components/wallet/AssetList';
import { TransactionList } from '@/components/transaction/TransactionList';
import { Modal } from '@/components/common/Modal';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { COLORS } from '@/utils/constants';
import { useQueryClient } from '@tanstack/react-query';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  bg: string;
  iconColor: string;
}

export default function HomeScreen() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txs = [], isLoading: txLoading } = useTransactionHistory();

  const onRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['wallet'] });
    await qc.invalidateQueries({ queryKey: ['transaction-history'] });
    setRefreshing(false);
  };

  const actions: QuickAction[] = [
    { icon: 'arrow-up-outline', label: 'Send', onPress: () => router.push('/(tabs)/send'), bg: COLORS.purpleDim, iconColor: COLORS.purple },
    { icon: 'arrow-down-outline', label: 'Receive', onPress: () => setShowQR(true), bg: '#DBEAFE', iconColor: '#2563EB' },
    { icon: 'add-circle-outline', label: 'Deposit', onPress: () => router.push('/deposit'), bg: '#D1FAE5', iconColor: '#059669' },
    { icon: 'remove-circle-outline', label: 'Withdraw', onPress: () => router.push('/withdraw'), bg: '#FEF3C7', iconColor: '#D97706' },
    { icon: 'swap-horizontal-outline', label: 'Swap', onPress: () => router.push('/(tabs)/swap'), bg: COLORS.purpleDim, iconColor: COLORS.purple },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />
        }
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Swap N Go</Text>
            <Text style={styles.subGreeting}>SUI Blockchain Wallet</Text>
          </View>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => router.push('/scan')}
          >
            <Ionicons name="scan-outline" size={22} color={COLORS.purple} />
          </TouchableOpacity>
        </View>

        <BalanceCard
          totalMYR={wallet?.total_value_myr ?? 0}
          suiAddress={wallet?.sui_address ?? ''}
          loading={walletLoading}
          onReceive={() => setShowQR(true)}
        />

        <View style={styles.actionsRow}>
          {actions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionItem} onPress={a.onPress}>
              <View style={[styles.actionCircle, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={24} color={a.iconColor} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets</Text>
          <AssetList
            balances={wallet?.balances ?? []}
            loading={walletLoading}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <TransactionList
            transactions={txs.slice(0, 5)}
            loading={txLoading}
            emptyMessage="No transactions yet. Send or deposit to get started."
          />
        </View>
      </ScrollView>

      <Modal visible={showQR} onClose={() => setShowQR(false)} title="My QR Code">
        {wallet?.sui_address ? (
          <QRDisplay
            address={wallet.sui_address}
            onClose={() => setShowQR(false)}
          />
        ) : (
          <Text style={{ textAlign: 'center', color: COLORS.gray, padding: 24 }}>
            Loading wallet address...
          </Text>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { paddingBottom: 24, gap: 20 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.purpleDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionItem: { alignItems: 'center', gap: 7 },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.black },
  section: { gap: 12, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.black },
  seeAll: { fontSize: 14, fontWeight: '600', color: COLORS.purple },
});
