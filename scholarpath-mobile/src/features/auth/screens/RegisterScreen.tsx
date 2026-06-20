import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import {
  AuthBackground,
  AuthFooterLinks,
  AuthTextField,
  BrandHeader,
  GradientButton,
  ProgressIndicator,
  RoleSelector,
} from '@/src/features/auth/components';
import { AuthColors, AuthSpacing, AuthTypography, FontFamily } from '@/src/theme';
import { UserRole } from '@/src/types/shared/auth';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { ApiError } from '@/src/services/api/client';
import {
  validateEmail,
  validatePassword,
  validatePersonName,
} from '@/src/utils/form-validation';

const INSTITUTE_MOBILE_FEATURES = [
  'Melihat pendaftar program',
  'Meninjau detail pendaftar',
  'Menerima atau menolak pendaftar',
  'Melihat pembaruan status pendaftaran',
] as const;

function InstituteRegisterInfo({ onSignInPress }: { onSignInPress: () => void }) {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoIconWrap}>
        <Ionicons name="business-outline" size={28} color={AuthColors.brandPrimary} />
      </View>

      <Text style={styles.infoTitle}>Akun Institusi via Web</Text>

      <Text style={styles.infoMessage}>
        Pendaftaran akun institusi hanya tersedia melalui platform web ScholarPath dan memerlukan
        proses verifikasi oleh administrator. Setelah akun institusi disetujui, Anda dapat
        menggunakan aplikasi mobile untuk masuk dan mengelola pendaftar.
      </Text>

      <View style={styles.featureBlock}>
        <Text style={styles.featureHeading}>
          Fitur yang tersedia di aplikasi mobile institusi:
        </Text>
        {INSTITUTE_MOBILE_FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={AuthColors.brandPrimary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.signInButton} onPress={onSignInPress}>
        <Text style={styles.signInButtonText}>Masuk ke Akun Institusi</Text>
        <Ionicons name="arrow-forward" size={18} color={AuthColors.white} />
      </Pressable>
    </View>
  );
}

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { registerStudent } = useStudentSession();
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isStudent = role === 'student';

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrors({});
  };

  const handleContinue = async () => {
    if (isSubmitting || !isStudent) return;

    const nextErrors: Record<string, string> = {};

    const emailResult = validateEmail(email);
    if (!emailResult.valid) nextErrors.email = emailResult.message ?? '';

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) nextErrors.password = passwordResult.message ?? '';

    const nameResult = validatePersonName(fullName);
    if (!nameResult.valid) nextErrors.fullName = nameResult.message ?? '';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await registerStudent({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      router.push({
        pathname: '/student-profile',
        params: { fullName: fullName.trim(), email: email.trim() },
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Gagal mendaftar. Periksa koneksi internet Anda.';
      Alert.alert('Registrasi Gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <KeyboardAwareScrollView
        extraBottomPadding={48}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48 },
        ]}>
        <BrandHeader />

        <View style={styles.card}>
          {isStudent ? <ProgressIndicator role={role} /> : null}

          <View style={styles.formSection}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{isStudent ? 'Get Started' : 'Portal Institusi'}</Text>
              <Text style={styles.subtitle}>
                {isStudent
                  ? 'Enter your basic details to create your profile.'
                  : 'Kelola pendaftar program setelah akun institusi Anda aktif.'}
              </Text>
            </View>

            <RoleSelector role={role} onRoleChange={handleRoleChange} variant="register" />

            {isStudent ? (
              <>
                <View style={styles.fields}>
                  <AuthTextField
                    label="Full Name"
                    icon="person-outline"
                    placeholder="Enter Full Name"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      clearError('fullName');
                    }}
                    autoCapitalize="words"
                    error={errors.fullName}
                  />
                  <AuthTextField
                    label="Email Address"
                    icon="mail-outline"
                    placeholder="Enter Email Address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearError('email');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />
                  <AuthTextField
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="Min. 8 characters with a number"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearError('password');
                    }}
                    showPasswordToggle
                    isPasswordVisible={showPassword}
                    onTogglePassword={() => setShowPassword((prev) => !prev)}
                    error={errors.password}
                  />
                </View>

                <GradientButton label="Continue" onPress={handleContinue} variant="register" />
              </>
            ) : (
              <InstituteRegisterInfo onSignInPress={() => router.push('/login')} />
            )}
          </View>
        </View>

        <AuthFooterLinks
          prompt="Already have an account?"
          linkLabel="Sign In"
          onLinkPress={() => router.push('/login')}
          showLegalLinks
        />
      </KeyboardAwareScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: AuthSpacing.screenHorizontal,
  },
  card: {
    backgroundColor: AuthColors.cardBackground,
    borderRadius: AuthSpacing.cardRadius,
    borderWidth: 1,
    borderColor: AuthColors.cardBorder,
    paddingHorizontal: AuthSpacing.xl,
    paddingTop: AuthSpacing.xl,
    paddingBottom: 41,
    gap: AuthSpacing.xxl,
    shadowColor: AuthColors.brandIndigo,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  formSection: {
    gap: 18,
  },
  headerText: {
    gap: AuthSpacing.sm,
  },
  title: {
    ...AuthTypography.screenTitle,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    ...AuthTypography.screenSubtitle,
    color: AuthColors.textSecondary,
  },
  fields: {
    gap: AuthSpacing.md,
    paddingTop: AuthSpacing.sm,
  },
  infoSection: {
    gap: 16,
    paddingTop: AuthSpacing.sm,
  },
  infoIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
  },
  infoMessage: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: AuthColors.textSecondary,
  },
  featureBlock: {
    gap: 10,
    backgroundColor: 'rgba(70, 72, 212, 0.06)',
    borderRadius: 14,
    padding: 16,
  },
  featureHeading: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AuthColors.brandPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  signInButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: AuthColors.white,
  },
});
