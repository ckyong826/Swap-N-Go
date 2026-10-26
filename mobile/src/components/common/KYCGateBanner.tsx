import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useKYCStatus } from '@/hooks/useKYC';
import { COLORS } from '@/utils/constants';

interface Props {
  /** If KYC is not approved, render this banner instead of children */
  children: React.ReactNode;
}

/**
 * Wraps any screen/section that requires KYC approval.
 * Shows a blocking banner when KYC is pending/rejected/not submitted.
 */
export function KYCGateBanner({ children }: Props) {
  const { data: kycStatus, isLoading } = useKYCStatus();

  if (isLoading) return null;

  const status = kycStatus?.status ?? 'NOT_SUBMITTED';

  if (status === 'APPROVED') {
    return <>{children}</>;
  }

  const config = {
    PENDING: {
      icon: 'time-outline' as const,
      title: 'KYC Verification Pending',
      desc: 'Your identity is being reviewed. Transactions will be enabled once approved.',
      btnLabel: null as string | null,
    },
    REJECTED: {
      icon: 'close-circle-outline' as const,
      title: 'KYC Verification Rejected',
      desc: `Your KYC was rejected${kycStatus?.remarks ? `: ${kycStatus.remarks}` : ''}. Please resubmit from your Profile.`,
      btnLabel: 'Go to Profile',
    },
    NOT_SUBMITTED: {
      icon: 'finger-print-outline' as const,
      title: 'Identity Verification Required',
      desc: 'You need to complete KYC verification before making transactions.',
      btnLabel: 'Verify Now',
    },
  }[status] ?? {
    icon: 'information-circle-outline' as const,
    title: 'Verification Required',
    desc: 'Please complete identity verification to proceed.',
    btnLabel: 'Go to Profile',
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={config.icon} size={48} color={COLORS.purple} />
        </View>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.desc}>{config.desc}</Text>
        {config.btnLabel && (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.btnText}>{config.btnLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.offWhite,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.purpleDim,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.black, textAlign: 'center' },
  desc:  { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
  btn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 12, marginTop: 4,
  },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
