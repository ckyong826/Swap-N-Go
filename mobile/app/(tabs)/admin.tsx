import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycAdminApi, PendingKYCItem } from '@/api/kyc.api';
import { COLORS } from '@/utils/constants';

// ── Expandable KYC card ───────────────────────────────────────────────────────

interface KYCCardProps {
  item: PendingKYCItem;
  onApprove: (item: PendingKYCItem) => void;
  onReject: (item: PendingKYCItem) => void;
  disabled: boolean;
}

function KYCCard({ item, onApprove, onReject, disabled }: KYCCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      {/* Header row — always visible, tap to toggle */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.purple} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.full_name}</Text>
          <Text style={styles.cardSub}>
            Submitted {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.badge, styles.badgePending]}>
            <Text style={styles.badgeText}>PENDING</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.gray}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded detail section */}
      {expanded && (
        <View style={styles.expandSection}>
          {/* IC Number */}
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color={COLORS.purple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>IC Number</Text>
              <Text style={styles.detailValue}>{item.ic_number || '—'}</Text>
            </View>
          </View>

          {/* User ID */}
          <View style={styles.detailRow}>
            <Ionicons name="finger-print-outline" size={16} color={COLORS.purple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={[styles.detailValue, styles.mono]} numberOfLines={1}>
                {item.user_id}
              </Text>
            </View>
          </View>

          {/* IC Front Photo */}
          <Text style={styles.photoLabel}>IC Front Photo</Text>
          {item.ic_front_photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.ic_front_photo}` }}
              style={styles.icPhoto}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={28} color={COLORS.gray} />
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}

          {/* IC Back Photo */}
          <Text style={styles.photoLabel}>IC Back Photo</Text>
          {item.ic_back_photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.ic_back_photo}` }}
              style={styles.icPhoto}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={28} color={COLORS.gray} />
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}

          {/* Live Selfie */}
          <Text style={styles.photoLabel}>Live Selfie</Text>
          {item.selfie_photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.selfie_photo}` }}
              style={styles.icPhoto}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={28} color={COLORS.gray} />
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => onReject(item)}
          disabled={disabled}
        >
          <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
          <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => onApprove(item)}
          disabled={disabled}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
          <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Admin Screen ──────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<PendingKYCItem | null>(null);
  const [remarks, setRemarks] = useState('');

  const {
    data: pending = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['kyc-pending'],
    queryFn: kycAdminApi.listPending,
  });

  const approveMut = useMutation({
    mutationFn: (kycId: string) => kycAdminApi.approve(kycId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-pending'] });
      Alert.alert('Done', 'KYC approved.');
    },
    onError: (e: { message: string }) => Alert.alert('Error', e.message),
  });

  const rejectMut = useMutation({
    mutationFn: ({ kycId, remarks }: { kycId: string; remarks: string }) =>
      kycAdminApi.reject(kycId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-pending'] });
      setRejectTarget(null);
      setRemarks('');
      Alert.alert('Done', 'KYC rejected.');
    },
    onError: (e: { message: string }) => Alert.alert('Error', e.message),
  });

  const onApprove = useCallback(
    (item: PendingKYCItem) => {
      Alert.alert('Approve KYC', `Approve KYC for ${item.full_name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveMut.mutate(item.kyc_id) },
      ]);
    },
    [approveMut]
  );

  const onRejectConfirm = () => {
    if (!rejectTarget) return;
    if (!remarks.trim()) {
      Alert.alert('Required', 'Please enter a rejection reason.');
      return;
    }
    rejectMut.mutate({ kycId: rejectTarget.kyc_id, remarks: remarks.trim() });
  };

  const isBusy = approveMut.isPending || rejectMut.isPending;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSub}>
            {pending.length} pending submission{pending.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.purple} />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.kyc_id}
          renderItem={({ item }) => (
            <KYCCard
              item={item}
              onApprove={onApprove}
              onReject={(i) => { setRejectTarget(i); setRemarks(''); }}
              disabled={isBusy}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.purple}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle" size={56} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>All clear!</Text>
              <Text style={styles.emptySub}>No pending KYC submissions.</Text>
            </View>
          }
        />
      )}

      {/* Reject modal */}
      <Modal visible={!!rejectTarget} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Reject KYC</Text>
                  <Text style={styles.modalSub}>
                    Rejecting {rejectTarget?.full_name}. Please provide a reason.
                  </Text>
                  <TextInput
                    style={styles.remarksInput}
                    placeholder="Rejection reason..."
                    placeholderTextColor={COLORS.gray}
                    value={remarks}
                    onChangeText={setRemarks}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalCancelBtn]}
                      onPress={() => setRejectTarget(null)}
                      disabled={rejectMut.isPending}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalRejectBtn]}
                      onPress={onRejectConfirm}
                      disabled={rejectMut.isPending}
                    >
                      {rejectMut.isPending ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.modalRejectText}>Confirm Reject</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.black },
  headerSub: { fontSize: 12, color: COLORS.gray, marginTop: 1 },

  list: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.purpleDim,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  cardSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgePending: { backgroundColor: '#FEF9C3' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#854D0E' },

  // Expanded section
  expandSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.offWhite,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  detailLabel: { fontSize: 11, color: COLORS.gray, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, color: COLORS.black, marginTop: 2, fontWeight: '500' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  photoLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  icPhoto: {
    width: '100%', height: 200,
    borderRadius: 12, backgroundColor: COLORS.grayBorder,
  },
  noPhoto: {
    height: 120, borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.grayBorder,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  noPhotoText: { fontSize: 13, color: COLORS.gray },

  // Actions
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  rejectBtn: { borderColor: COLORS.error, backgroundColor: '#FFF1F1' },
  approveBtn: { borderColor: COLORS.purple, backgroundColor: COLORS.purple },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  emptySub: { fontSize: 14, color: COLORS.gray },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  modalSub: { fontSize: 14, color: COLORS.gray },
  remarksInput: {
    borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 12,
    padding: 12, fontSize: 14, color: COLORS.black,
    minHeight: 80, textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: COLORS.offWhite, borderWidth: 1, borderColor: COLORS.grayBorder },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  modalRejectBtn: { backgroundColor: COLORS.error },
  modalRejectText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
