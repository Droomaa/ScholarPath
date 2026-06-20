import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import {
  AuthBackground,
  AuthTextField,
  BrandHeader,
} from '@/src/features/auth/components';
import { AuthColors, AuthSpacing, AuthTypography, FontFamily } from '@/src/theme';
import { validateEmail } from '@/src/utils/form-validation';

type ForgotPasswordPhase = 'form' | 'loading' | 'success';

export function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<ForgotPasswordPhase>('form');

  const handleSendResetLink = () => {
    const result = validateEmail(email);
    if (!result.valid) {
      setError(result.message ?? 'Enter a valid email address.');
      return;
    }

    setError('');
    setPhase('loading');

    setTimeout(() => {
      setPhase('success');
    }, 1200);
  };

  return (
    <AuthBackground>
      <KeyboardAwareScrollView
        extraBottomPadding={48}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24 },
        ]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>

        <BrandHeader />

        <View style={styles.card}>
          {phase === 'success' ? (
            <View style={styles.successState}>
              <View style={styles.successIconWrap}>
                <Ionicons name="mail-open-outline" size={32} color={AuthColors.profileBrand} />
              </View>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successMessage}>
                Password reset instructions will be sent to your email once the service is
                available.
              </Text>
              <Text style={styles.successEmail}>{email.trim()}</Text>
              <Pressable style={styles.backToLoginButton} onPress={() => router.replace('/login' as Href)}>
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.headerText}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email address and we will send you instructions to reset your
                  password.
                </Text>
              </View>

              <AuthTextField
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={phase !== 'loading'}
                error={error}
              />

              <Pressable
                style={[styles.submitPressable, phase === 'loading' && styles.submitDisabled]}
                onPress={handleSendResetLink}
                disabled={phase === 'loading'}>
                <LinearGradient
                  colors={[AuthColors.loginGradientStart, AuthColors.loginGradientEnd]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.submitButton}>
                  {phase === 'loading' ? (
                    <>
                      <ActivityIndicator color={AuthColors.white} size="small" />
                      <Text style={styles.submitLabel}>Sending...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.submitLabel}>Send Reset Link</Text>
                      <Ionicons name="arrow-forward" size={16} color={AuthColors.white} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: AuthSpacing.screenHorizontal,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: AuthSpacing.loginCardRadius,
    borderWidth: 1,
    borderColor: AuthColors.borderLight,
    paddingHorizontal: AuthSpacing.xl,
    paddingTop: AuthSpacing.xl,
    paddingBottom: AuthSpacing.xl,
    gap: AuthSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  headerText: {
    gap: 10,
    paddingBottom: 4,
  },
  title: {
    ...AuthTypography.screenTitle,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    ...AuthTypography.screenSubtitle,
    color: AuthColors.textSecondary,
    lineHeight: 22,
  },
  submitPressable: {
    borderRadius: AuthSpacing.inputRadius,
    shadowColor: AuthColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.85,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AuthSpacing.sm,
    paddingVertical: AuthSpacing.md,
    borderRadius: AuthSpacing.inputRadius,
    minHeight: 48,
  },
  submitLabel: {
    ...AuthTypography.buttonLarge,
    color: AuthColors.white,
  },
  successState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  successMessage: {
    ...AuthTypography.screenSubtitle,
    color: AuthColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
    textAlign: 'center',
  },
  backToLoginButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backToLoginText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
  },
});
