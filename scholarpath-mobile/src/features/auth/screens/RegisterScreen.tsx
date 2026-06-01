import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';
import { UserRole } from '@/src/types/shared/auth';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  validateEmail,
  validateInstituteName,
  validatePassword,
  validatePersonName,
  validatePhoneNumber,
} from '@/src/utils/form-validation';

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signInAsInstitute } = useInstituteSession();
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleContinue = () => {
    const nextErrors: Record<string, string> = {};

    const emailResult = validateEmail(email);
    if (!emailResult.valid) nextErrors.email = emailResult.message ?? '';

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) nextErrors.password = passwordResult.message ?? '';

    if (role === 'student') {
      const nameResult = validatePersonName(fullName);
      if (!nameResult.valid) nextErrors.fullName = nameResult.message ?? '';
    } else {
      const instituteResult = validateInstituteName(instituteName);
      if (!instituteResult.valid) nextErrors.instituteName = instituteResult.message ?? '';

      const phoneResult = validatePhoneNumber(contactNumber);
      if (!phoneResult.valid) nextErrors.contactNumber = phoneResult.message ?? '';

      if (!address.trim()) {
        nextErrors.address = 'Address is required.';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (role === 'student') {
      router.push({
        pathname: '/student-profile',
        params: { fullName: fullName.trim(), email: email.trim() },
      });
      return;
    }
    signInAsInstitute({
      instituteName: instituteName.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      isNewAccount: true,
    });
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
          <ProgressIndicator role={role} />

          <View style={styles.formSection}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Get Started</Text>
              <Text style={styles.subtitle}>
                Enter your basic details to create your profile.
              </Text>
            </View>

            <RoleSelector role={role} onRoleChange={setRole} variant="register" />

            <View style={styles.fields}>
              {role === 'student' ? (
                <>
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
                </>
              ) : (
                <>
                  <AuthTextField
                    label="Institute Name"
                    icon="business-outline"
                    placeholder="Enter institute name"
                    value={instituteName}
                    onChangeText={(text) => {
                      setInstituteName(text);
                      clearError('instituteName');
                    }}
                    autoCapitalize="words"
                    error={errors.instituteName}
                  />
                  <AuthTextField
                    label="Contact Number"
                    icon="call-outline"
                    placeholder="8123456789"
                    value={contactNumber}
                    onChangeText={(text) => {
                      setContactNumber(text.replace(/[^\d+\s()-]/g, ''));
                      clearError('contactNumber');
                    }}
                    keyboardType="phone-pad"
                    prefix="+62"
                    error={errors.contactNumber}
                  />
                  <AuthTextField
                    label="Address"
                    icon="location-outline"
                    placeholder="Enter institution address"
                    value={address}
                    onChangeText={(text) => {
                      setAddress(text);
                      clearError('address');
                    }}
                    autoCapitalize="words"
                    error={errors.address}
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
                </>
              )}

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
});
