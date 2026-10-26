import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { TransactionList } from "@/components/transaction/TransactionList";
import { COLORS } from "@/utils/constants";
import { TransactionType } from "@/types/transaction.types";
import { useQueryClient } from "@tanstack/react-query";

const FILTERS: { label: string; value: TransactionType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Send", value: "transfer" },
  { label: "Swap", value: "swap" },
  { label: "Deposit", value: "deposit" },
  { label: "Withdraw", value: "withdrawal" },
];

export default function HistoryScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<TransactionType | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const { data: txs = [], isLoading } = useTransactionHistory();

  const filtered =
    filter === "all" ? txs : txs.filter((t) => t.type === filter);

  const onRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["transaction-history"] });
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>{txs.length} transactions</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.85}
            style={[
              styles.filterChip,
              filter === f.value && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.value && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
      >
        <TransactionList
          transactions={filtered}
          loading={isLoading}
          emptyMessage={
            filter === "all"
              ? "No transactions yet"
              : `No ${filter} transactions`
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.black },
  count: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  filterScroll: { height: 56, flexGrow: 0, marginBottom: 8 },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  filterLabel: { fontSize: 13, fontWeight: "600", color: COLORS.gray },
  filterLabelActive: { color: COLORS.white },
  listScroll: { flex: 1 },
  list: { padding: 20, paddingTop: 8 },
});
