import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '@/stores/auth.store';
import { useWallet } from '@/hooks/useWallet';
import { useKYCStatus, useSubmitKYC } from '@/hooks/useKYC';
import { router } from 'expo-router';
import { Modal as AppModal } from '@/components/common/Modal';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { COLORS } from '@/utils/constants';
import { truncateSuiAddress } from '@/utils/sui';

// ── KYC status config ─────────────────────────────────────────────────────────

const KYC_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  APPROVED:      { label: 'KYC Approved',       color: COLORS.success,  bg: '#D1FAE5',       icon: 'shield-checkmark'   },
  PENDING:       { label: 'KYC Pending Review',  color: '#D97706',       bg: '#FEF3C7',       icon: 'time'               },
  REJECTED:      { label: 'KYC Rejected',        color: COLORS.error,    bg: '#FEE2E2',       icon: 'close-circle'       },
  NOT_SUBMITTED: { label: 'Verify Identity',     color: COLORS.purple,   bg: COLORS.purpleDim, icon: 'finger-print'      },
};

// ── Camera Capture ────────────────────────────────────────────────────────────

// Min JPEG size (bytes) below which a capture is treated as blurry/unreadable.
// Tune against real device captures; raise to be stricter, lower if clear photos get rejected.
const MIN_SHARP_BYTES = 150_000;

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  title: string;
  facing?: 'front' | 'back';
  guide?: string;
}

function CameraCapture({ onCapture, onClose, title, facing = 'back', guide = 'Position your IC within the frame' }: CameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={camStyles.center}>
        <Text style={camStyles.permText}>Camera permission required</Text>
        <TouchableOpacity style={camStyles.btn} onPress={requestPermission}>
          <Text style={camStyles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (photo?.base64) {
        // ponytail: JPEG byte size as blur proxy — camera & quality are fixed, so a
        // sharp, detailed IC photo compresses larger than a blurry/low-detail one.
        // MIN_SHARP_BYTES is a calibration knob; swap for a native Laplacian-variance
        // check if false rejects show up in testing.
        const bytes = (photo.base64.length * 3) / 4;
        if (bytes < MIN_SHARP_BYTES) {
          Alert.alert('Unreadable photo', 'Image is unreadable. Please upload a clear photo.');
          return; // keep camera open so the user can retry without leaving the screen
        }
        onCapture(photo.base64);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={camStyles.container}>
      <CameraView ref={cameraRef} style={camStyles.camera} facing={facing} />
      <View style={camStyles.overlay}>
        <View style={camStyles.topBar}>
          <TouchableOpacity onPress={onClose} style={camStyles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={camStyles.camTitle}>{title}</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={camStyles.guide}>
          <Text style={camStyles.guideText}>{guide}</Text>
        </View>
        <View style={camStyles.bottomBar}>
          <TouchableOpacity style={camStyles.captureBtn} onPress={capture} disabled={capturing}>
            {capturing
              ? <ActivityIndicator color={COLORS.white} />
              : <Ionicons name="camera" size={28} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── KYC Submission Sheet ──────────────────────────────────────────────────────

interface KYCSheetProps {
  visible: boolean;
  onClose: () => void;
}

function KYCSubmissionSheet({ visible, onClose }: KYCSheetProps) {
  const [cameraFor, setCameraFor] = useState<'front' | 'back' | 'selfie' | null>(null);
  const [fullName, setFullName] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [frontBase64, setFrontBase64] = useState('');
  const [backBase64, setBackBase64] = useState('');
  const [selfieBase64, setSelfieBase64] = useState('');

  const { mutate: submitKYC, isPending } = useSubmitKYC(() => {
    resetForm();
    onClose();
  });

  const resetForm = () => {
    setCameraFor(null);
    setFullName('');
    setIcNumber('');
    setFrontBase64('');
    setBackBase64('');
    setSelfieBase64('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = () => {
    if (!fullName.trim())  return Alert.alert('Required', 'Please enter your full name.');
    if (!icNumber.trim())  return Alert.alert('Required', 'Please enter your IC number.');
    if (!frontBase64)      return Alert.alert('Required', 'Please capture the front of your IC.');
    if (!backBase64)       return Alert.alert('Required', 'Please capture the back of your IC.');
    if (!selfieBase64)     return Alert.alert('Required', 'Please take a live selfie.');
    submitKYC({ full_name: fullName.trim(), ic_number: icNumber.trim(), ic_front_photo: frontBase64, ic_back_photo: backBase64, selfie_photo: selfieBase64 });
  };

  // Camera overlay — fullscreen
  if (cameraFor) {
    const camTitle = cameraFor === 'front' ? 'Front of IC' : cameraFor === 'back' ? 'Back of IC' : 'Live Selfie';
    return (
      <Modal visible animationType="slide">
        <CameraCapture
          title={camTitle}
          facing={cameraFor === 'selfie' ? 'front' : 'back'}
          guide={cameraFor === 'selfie' ? 'Center your face within the frame' : 'Position your IC within the frame'}
          onCapture={(b64) => {
            if (cameraFor === 'front') setFrontBase64(b64);
            else if (cameraFor === 'back') setBackBase64(b64);
            else setSelfieBase64(b64);
            setCameraFor(null);
          }}
          onClose={() => setCameraFor(null)}
        />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={kycStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={kycStyles.sheet}>
            <View style={kycStyles.sheetHeader}>
              <Text style={kycStyles.sheetTitle}>Verify Your Identity</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={kycStyles.sectionLabel}>Personal Information</Text>

              <Text style={kycStyles.fieldLabel}>Full Name (as on IC)</Text>
              <TextInput
                style={kycStyles.input}
                placeholder="e.g. Ahmad bin Abdullah"
                placeholderTextColor={COLORS.gray}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={kycStyles.fieldLabel}>IC Number</Text>
              <TextInput
                style={kycStyles.input}
                placeholder="e.g. 990101-14-5678"
                placeholderTextColor={COLORS.gray}
                value={icNumber}
                onChangeText={setIcNumber}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={kycStyles.sectionLabel}>IC Photos</Text>

              {/* Front photo */}
              <TouchableOpacity
                style={[kycStyles.photoBtn, frontBase64 && kycStyles.photoBtnDone]}
                onPress={() => setCameraFor('front')}
              >
                {frontBase64 ? (
                  <>
                    <Image source={{ uri: `data:image/jpeg;base64,${frontBase64}` }} style={kycStyles.photoPreview} />
                    <View style={kycStyles.photoBtnInner}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={[kycStyles.photoBtnText, { color: COLORS.success }]}>Front photo captured</Text>
                      <Text style={kycStyles.photoHint}>Tap to retake</Text>
                    </View>
                  </>
                ) : (
                  <View style={kycStyles.photoBtnInner}>
                    <Ionicons name="card-outline" size={28} color={COLORS.purple} />
                    <Text style={kycStyles.photoBtnText}>Take Front IC Photo</Text>
                    <Text style={kycStyles.photoHint}>Front side with your photo &amp; name</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Back photo */}
              <TouchableOpacity
                style={[kycStyles.photoBtn, backBase64 && kycStyles.photoBtnDone]}
                onPress={() => setCameraFor('back')}
              >
                {backBase64 ? (
                  <>
                    <Image source={{ uri: `data:image/jpeg;base64,${backBase64}` }} style={kycStyles.photoPreview} />
                    <View style={kycStyles.photoBtnInner}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={[kycStyles.photoBtnText, { color: COLORS.success }]}>Back photo captured</Text>
                      <Text style={kycStyles.photoHint}>Tap to retake</Text>
                    </View>
                  </>
                ) : (
                  <View style={kycStyles.photoBtnInner}>
                    <Ionicons name="card-outline" size={28} color={COLORS.purple} />
                    <Text style={kycStyles.photoBtnText}>Take Back IC Photo</Text>
                    <Text style={kycStyles.photoHint}>Back side with barcode &amp; address</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={kycStyles.sectionLabel}>Live Selfie</Text>

              {/* Selfie photo */}
              <TouchableOpacity
                style={[kycStyles.photoBtn, selfieBase64 && kycStyles.photoBtnDone]}
                onPress={() => setCameraFor('selfie')}
              >
                {selfieBase64 ? (
                  <>
                    <Image source={{ uri: `data:image/jpeg;base64,${selfieBase64}` }} style={kycStyles.photoPreview} />
                    <View style={kycStyles.photoBtnInner}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={[kycStyles.photoBtnText, { color: COLORS.success }]}>Selfie captured</Text>
                      <Text style={kycStyles.photoHint}>Tap to retake</Text>
                    </View>
                  </>
                ) : (
                  <View style={kycStyles.photoBtnInner}>
                    <Ionicons name="person-circle-outline" size={28} color={COLORS.purple} />
                    <Text style={kycStyles.photoBtnText}>Take Live Selfie</Text>
                    <Text style={kycStyles.photoHint}>Face the front camera in good lighting</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={kycStyles.disclaimer}>
                Your IC information is encrypted and used only for identity verification.
              </Text>

              <TouchableOpacity
                style={[kycStyles.submitBtn, isPending && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={kycStyles.submitBtnText}>Submit for Review</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { logout, userInfo, role } = useAuthStore();
  const isAdmin = role === 'ADMIN';
  const { data: wallet } = useWallet();
  const { data: kycStatus } = useKYCStatus();
  const [showQR, setShowQR]   = useState(false);
  const [showKYC, setShowKYC] = useState(false);

  const address  = wallet?.sui_address ?? '';
  const email    = wallet?.email ?? userInfo?.email ?? '';
  const username = userInfo?.username ?? '';

  const kycState = kycStatus?.status ?? 'NOT_SUBMITTED';
  const kycCfg   = KYC_CONFIG[kycState] ?? KYC_CONFIG['NOT_SUBMITTED'];
  const canSubmit = kycState !== 'APPROVED' && kycState !== 'PENDING';

  const confirmLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const copyAddress = () => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Wallet address copied to clipboard.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={COLORS.purple} />
          </View>
          {username ? <Text style={styles.username}>{username}</Text> : null}
          <Text style={styles.email}>{email || '—'}</Text>

          {/* Wallet address */}
          <TouchableOpacity style={styles.addressBadge} onPress={() => setShowQR(true)}>
            <Ionicons name="wallet-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.addressText}>{truncateSuiAddress(address)}</Text>
            <Ionicons name="qr-code-outline" size={13} color={COLORS.purpleLight} />
          </TouchableOpacity>

          {/* KYC status */}
          <TouchableOpacity
            style={[styles.kycBadge, { backgroundColor: kycCfg.bg }]}
            onPress={() => canSubmit && setShowKYC(true)}
            activeOpacity={canSubmit ? 0.7 : 1}
          >
            <Ionicons name={kycCfg.icon} size={15} color={kycCfg.color} />
            <Text style={[styles.kycBadgeText, { color: kycCfg.color }]}>{kycCfg.label}</Text>
            {canSubmit && <Ionicons name="chevron-forward" size={13} color={kycCfg.color} />}
          </TouchableOpacity>

          {/* Show rejection reason */}
          {kycState === 'REJECTED' && kycStatus?.remarks ? (
            <Text style={styles.kycRemarks}>Reason: {kycStatus.remarks}</Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Network" value="SUI Testnet" />
          <View style={styles.statDivider} />
          <StatBox label="Wallet" value="Custodial" />
          <View style={styles.statDivider} />
          <StatBox label="KYC" value={kycState} color={kycCfg.color} />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <MenuItem icon="qr-code-outline" label="My QR Code" onPress={() => setShowQR(true)} />
          <View style={styles.menuDivider} />
          <MenuItem icon="copy-outline" label="Copy Wallet Address" onPress={copyAddress} />
          {isAdmin && (
            <>
              <View style={styles.menuDivider} />
              <MenuItem
                icon="shield-checkmark-outline"
                label="KYC Verification"
                onPress={() => router.push('/(tabs)/admin')}
                admin
              />
            </>
          )}
          <View style={styles.menuDivider} />
          <MenuItem icon="log-out-outline" label="Sign Out" onPress={confirmLogout} danger />
        </View>

        <Text style={styles.version}>Swap N Go v1.0.0 · SUI Blockchain</Text>
      </ScrollView>

      <AppModal visible={showQR} onClose={() => setShowQR(false)} title="My QR Code">
        {address ? <QRDisplay address={address} onClose={() => setShowQR(false)} /> : null}
      </AppModal>

      <KYCSubmissionSheet visible={showKYC} onClose={() => setShowKYC(false)} />
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MenuItem({ icon, label, onPress, danger, admin }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean; admin?: boolean;
}) {
  const iconColor = danger ? COLORS.error : admin ? '#7C3AED' : COLORS.purple;
  const iconBg    = danger ? '#fee2e2'    : admin ? '#EDE9FE'  : COLORS.purpleDim;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />}
    </TouchableOpacity>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : {}]} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { padding: 20, gap: 20 },
  title:  { fontSize: 26, fontWeight: '800', color: COLORS.black },

  avatarCard: {
    alignItems: 'center',
    backgroundColor: COLORS.purpleDark,
    borderRadius: 24,
    padding: 28,
    gap: 8,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.purpleDim,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  username:    { fontSize: 18, fontWeight: '700', color: COLORS.white },
  email:       { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  addressBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
  },
  addressText: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' },
  kycBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 4,
  },
  kycBadgeText: { fontSize: 13, fontWeight: '600' },
  kycRemarks:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' },

  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.grayBorder,
    padding: 16, alignItems: 'center',
  },
  statBox:    { flex: 1, alignItems: 'center', gap: 4 },
  statValue:  { fontSize: 13, fontWeight: '700', color: COLORS.black },
  statLabel:  { fontSize: 11, color: COLORS.gray },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.grayBorder },

  menu: {
    backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.grayBorder, overflow: 'hidden',
  },
  menuItem:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.purpleDim, justifyContent: 'center', alignItems: 'center' },
  menuIconDanger: { backgroundColor: '#fee2e2' },
  menuLabel:      { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.black },
  menuLabelDanger:{ color: COLORS.error },
  menuDivider:    { height: 1, backgroundColor: COLORS.grayBorder, marginHorizontal: 16 },
  version:        { fontSize: 12, color: COLORS.gray, textAlign: 'center', paddingBottom: 8 },
});

const camStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  camera:    { flex: 1 },
  overlay:   { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: { padding: 8 },
  camTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  guide:    { alignItems: 'center' },
  guideText: {
    color: COLORS.white, backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, fontSize: 13,
  },
  bottomBar:  { alignItems: 'center', paddingBottom: 48, backgroundColor: 'rgba(0,0,0,0.5)' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24, backgroundColor: COLORS.white },
  permText: { fontSize: 16, color: COLORS.black, textAlign: 'center' },
  btn:      { backgroundColor: COLORS.purple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText:  { color: COLORS.white, fontWeight: '700' },
});

const kycStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: '90%',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetTitle:  { fontSize: 20, fontWeight: '700', color: COLORS.black },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.black, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.grayBorder, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.black, marginBottom: 14,
    backgroundColor: COLORS.offWhite,
    letterSpacing: 0, // Android placeholder spacing quirk — explicit 0 kills fallback spacing
  },
  photoBtn: {
    borderWidth: 1.5, borderColor: COLORS.grayBorder, borderStyle: 'dashed',
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12,
    backgroundColor: COLORS.offWhite, minHeight: 100, overflow: 'hidden',
  },
  photoBtnDone:  { borderColor: COLORS.success, borderStyle: 'solid' },
  photoBtnInner: { alignItems: 'center', gap: 6 },
  photoPreview:  { ...StyleSheet.absoluteFillObject, opacity: 0.2, borderRadius: 14 },
  photoBtnText:  { fontSize: 15, fontWeight: '600', color: COLORS.black },
  photoHint:     { fontSize: 12, color: COLORS.gray, textAlign: 'center' },
  disclaimer: {
    fontSize: 12, color: COLORS.gray, textAlign: 'center', marginVertical: 16, lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: COLORS.purple, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
