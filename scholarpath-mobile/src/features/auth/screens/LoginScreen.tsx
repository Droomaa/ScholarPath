import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import {
  validateEmail,
  validateInstituteName,
  validatePassword,
} from '@/src/utils/form-validation';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInAsStudent } = useStudentSession();
  const { signInAsInstitute } = useInstituteSession();
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  const [instituteName, setInstituteName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = () => {
    const nextErrors: Record<string, string> = {};

    if (role === 'institute') {
      const nameResult = validateInstituteName(instituteName);
      if (!nameResult.valid) nextErrors.instituteName = nameResult.message ?? '';
    }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) nextErrors.email = emailResult.message ?? '';

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) nextErrors.password = passwordResult.message ?? '';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (role === 'student') {
      signInAsStudent({ email: email.trim() });
      router.replace('/(tabs)');
      return;
    }
    signInAsInstitute({ instituteName: instituteName.trim(), email: email.trim() });
    router.replace('/(institute-tabs)' as Href);
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

          <RoleSelector role={role} onRoleChange={setRole} variant="login" />

          <View style={styles.fields}>
            {role === 'institute' ? (
              <AuthTextField
                label="Institute Name"
                icon="business-outline"
                placeholder="Enter institute name"
                value={instituteName}
                onChangeText={(text) => {
                  setInstituteName(text);
                  if (errors.instituteName) setErrors((prev) => ({ ...prev, instituteName: '' }));
                }}
                autoCapitalize="words"
                error={errors.instituteName}
              />
            ) : null}

            <AuthTextField
              label="Email Address"
              icon="mail-outline"
              placeholder="Enter Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <AuthTextField
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              showPasswordToggle
              isPasswordVisible={showPassword}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
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
