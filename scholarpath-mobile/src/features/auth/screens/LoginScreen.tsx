import { router, type Href } from 'expo-router';
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
  RoleSelector,
} from '@/src/features/auth/components';
import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';
import { UserRole } from '@/src/types/shared/auth';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import { ApiError } from '@/src/services/api/client';
import { validateEmail, validatePassword } from '@/src/utils/form-validation';

type LoginFormState = {
  email: string;
  password: string;
};

const emptyLoginForm = (): LoginFormState => ({ email: '', password: '' });

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginStudent } = useStudentSession();
  const { loginInstitute } = useInstituteSession();
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [studentForm, setStudentForm] = useState<LoginFormState>(emptyLoginForm);
  const [instituteForm, setInstituteForm] = useState<LoginFormState>(emptyLoginForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeForm = role === 'student' ? studentForm : instituteForm;
  const setActiveForm = (updates: Partial<LoginFormState>) => {
    if (role === 'student') {
      setStudentForm((prev) => ({ ...prev, ...updates }));
      return;
    }

    setInstituteForm((prev) => ({ ...prev, ...updates }));
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrors({});
    setShowPassword(false);
  };

  const handleSignIn = async () => {
    if (isSubmitting) return;

    const nextErrors: Record<string, string> = {};
    const emailResult = validateEmail(activeForm.email);
    if (!emailResult.valid) nextErrors.email = emailResult.message ?? '';

    const passwordResult = validatePassword(activeForm.password);
    if (!passwordResult.valid) nextErrors.password = passwordResult.message ?? '';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const credentials = {
      email: activeForm.email.trim(),
      password: activeForm.password,
    };

    if (role === 'student') {
      setIsSubmitting(true);
      try {
        await loginStudent(credentials);
        router.replace('/(tabs)');
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Gagal masuk. Periksa koneksi internet Anda.';
        Alert.alert('Login Gagal', message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await loginInstitute(credentials);
      router.replace('/(institute-tabs)' as Href);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Gagal masuk. Periksa koneksi internet Anda.';
      Alert.alert('Login Gagal', message);
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
          <View style={styles.headerText}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {role === 'student'
                ? 'Access your own account'
                : 'Access your institutional portal'}
            </Text>
          </View>

          <RoleSelector role={role} onRoleChange={handleRoleChange} variant="login" />

          <View key={role} style={styles.fields}>
            <AuthTextField
              label="Email Address"
              icon="mail-outline"
              placeholder="Enter Email Address"
              value={activeForm.email}
              onChangeText={(text) => {
                setActiveForm({ email: text });
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email}
            />

            <AuthTextField
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter Password"
              value={activeForm.password}
              onChangeText={(text) => {
                setActiveForm({ password: text });
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              showPasswordToggle
              isPasswordVisible={showPassword}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              autoComplete="password"
              textContentType="password"
              error={errors.password}
            />

            <Pressable style={styles.forgotPassword} onPress={() => router.push('/forgot-password' as Href)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <GradientButton label="Sign In" onPress={handleSignIn} variant="login" />

          <AuthFooterLinks
            prompt="Don't have an account?"
            linkLabel="Create an Account"
            onLinkPress={() => router.push('/register')}
            compact
            linkColor={AuthColors.brandPrimary}
          />
        </View>
      </KeyboardAwareScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: AuthSpacing.screenHorizontal,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: AuthSpacing.loginCardRadius,
    borderWidth: 1,
    borderColor: AuthColors.borderLight,
    paddingHorizontal: AuthSpacing.xl,
    paddingTop: AuthSpacing.lg,
    paddingBottom: AuthSpacing.xl,
    gap: AuthSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  headerText: {
    gap: AuthSpacing.xs,
    alignItems: 'center',
  },
  title: {
    ...AuthTypography.screenTitle,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...AuthTypography.screenSubtitle,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  fields: {
    gap: AuthSpacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: 2,
  },
  forgotPasswordText: {
    ...AuthTypography.link,
    lineHeight: 18,
    color: AuthColors.brandPrimary,
  },
});
