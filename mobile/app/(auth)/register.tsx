import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import { useRegister } from '@/hooks/useAuth';
import { COLORS } from '@/utils/constants';

export default function RegisterScreen() {
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = ({ email, username, phone_number, password, pin }: RegisterFormData) =>
    // ponytail: MY-only, strip leading 0 and prepend +60 for backend e164
    register({ email, username, phone_number: '+60' + phone_number.replace(/^0/, ''), password, pin });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Swap N Go — your SUI wallet is auto-generated
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    label="Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Input
                    label="Username"
                    placeholder="Your username"
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.username?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone_number"
                render={({ field }) => (
                  <Input
                    label="Phone Number"
                    placeholder="0123456789"
                    keyboardType="phone-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.phone_number?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    label="Password"
                    placeholder="At least 6 characters"
                    isPassword
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.password?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    isPassword
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="pin"
                render={({ field }) => (
                  <Input
                    label="Transaction PIN"
                    placeholder="4-digit PIN"
                    keyboardType="number-pad"
                    isPassword
                    value={field.value}
                    onChangeText={(t) => field.onChange(t.replace(/[^0-9]/g, '').slice(0, 4))}
                    error={errors.pin?.message}
                  />
                )}
              />

              <View style={styles.note}>
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.purple} style={{ marginBottom: 4 }} />
                <Text style={styles.noteText}>
                  A SUI blockchain wallet is automatically created for your account.
                  Your JWT is stored securely in device keychain.
                </Text>
              </View>

              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isPending}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },
  scroll: { flexGrow: 1, padding: 24, gap: 24 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  header: { alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingHorizontal: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  form: { gap: 14 },
  note: {
    backgroundColor: COLORS.purpleDim,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  noteText: { fontSize: 13, color: COLORS.black, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: COLORS.gray },
  footerLink: { fontSize: 14, fontWeight: '700', color: COLORS.purple },
});
