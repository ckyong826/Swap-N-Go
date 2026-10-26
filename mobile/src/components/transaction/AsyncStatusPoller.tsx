import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FsmStatus } from '@/types/fsm.types';
import { COLORS } from '@/utils/constants';
import { suiExplorerTxUrl } from '@/utils/sui';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/format';

interface Props {
  status?: FsmStatus;
  suiTxHash?: string;
  errorMessage?: string;
  createdAt?: string;
  isLoading?: boolean;
  onRetry?: () => void;
}

export function AsyncStatusPoller({
  status,
  suiTxHash,
  errorMessage,
  createdAt,
  isLoading,
  onRetry,
}: Props) {
  if (isLoading || !status) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Loading status...</Text>
      </View>
    );
  }

  if (status === 'pending' || status === 'processing') {
    return (
      <View style={styles.center}>
        <View style={styles.pulseCircle}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
        <StatusBadge status={status} style={styles.badgeCenter} />
        <Text style={styles.title}>Processing on SUI Blockchain</Text>
        <Text style={styles.subtitle}>
          Your transaction is being confirmed. This usually takes 2–10 seconds.
        </Text>
        {createdAt ? (
          <Text style={styles.time}>Submitted {formatDate(createdAt)}</Text>
        ) : null}
      </View>
    );
  }

  if (status === 'completed') {
    return (
      <View style={styles.center}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={48} color="#059669" />
        </View>
        <StatusBadge status="completed" style={styles.badgeCenter} />
        <Text style={styles.title}>Transaction Complete</Text>
        {suiTxHash ? (
          <TouchableOpacity
            style={styles.hashRow}
            onPress={() => Linking.openURL(suiExplorerTxUrl(suiTxHash))}
          >
            <Text style={styles.hashLabel}>SUI TX</Text>
            <Text style={styles.hash} numberOfLines={1}>
              {suiTxHash.slice(0, 20)}...
            </Text>
            <Ionicons name="open-outline" size={14} color={COLORS.purple} />
          </TouchableOpacity>
        ) : null}
        {createdAt ? (
          <Text style={styles.time}>{formatDate(createdAt)}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <View style={styles.errorCircle}>
        <Ionicons name="close-circle" size={48} color="#DC2626" />
      </View>
      <StatusBadge status="failed" style={styles.badgeCenter} />
      <Text style={styles.title}>Transaction Failed</Text>
      {errorMessage ? (
        <Text style={styles.errorMsg}>{errorMessage}</Text>
      ) : null}
      {onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  badgeCenter: { alignSelf: 'center' },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purpleDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: { fontSize: 14, color: COLORS.gray },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.black, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  time: { fontSize: 12, color: COLORS.gray },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purpleDim,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    maxWidth: '90%',
  },
  hashLabel: { fontSize: 12, fontWeight: '700', color: COLORS.purple },
  hash: { flex: 1, fontSize: 12, color: COLORS.black, fontFamily: 'monospace' },
  errorMsg: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
