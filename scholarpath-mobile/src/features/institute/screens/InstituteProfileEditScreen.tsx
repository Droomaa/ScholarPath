import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  InstituteEditFormField,
  InstituteEditLogoSection,
} from '@/src/features/institute/components';
import { pickInstituteLogoFromGallery } from '@/src/features/institute/hooks/pick-institute-logo';
import { AuthColors, FontFamily } from '@/src/theme';

const MAX_ABOUT_LENGTH = 1000;

export function InstituteProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const session = useInstituteSession();
  const { updateInstituteProfile } = session;

  const [instituteName, setInstituteName] = useState(session.instituteName);
  const [email, setEmail] = useState(session.email);
  const [contactNumber, setContactNumber] = useState(session.contactNumber);
  const [address, setAddress] = useState(session.address);
  const [about, setAbout] = useState(session.about);
  const [logoUri, setLogoUri] = useState(session.logoUri);

  const canSave =
    instituteName.trim().length > 0 &&
    email.trim().length > 0 &&
    contactNumber.trim().length > 0;

  const handlePickLogo = async () => {
    const uri = await pickInstituteLogoFromGallery();
    if (uri) {
      setLogoUri(uri);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUri('');
  };

  const handleSave = () => {
    if (!canSave) {
      Alert.alert('Incomplete Form', 'Institution name, email, and contact number are required.');
      return;
    }

    updateInstituteProfile({
      instituteName: instituteName.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      about: about.trim(),
      logoUri,
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAwareScrollView extraBottomPadding={48} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Institutional Profile</Text>
            <Text style={styles.subtitle}>
              Keep your information up to date to attract the best scholarship candidates.
            </Text>
          </View>

          <InstituteEditLogoSection
            logoUri={logoUri}
            onPickLogo={handlePickLogo}
            onRemoveLogo={handleRemoveLogo}
          />

          <InstituteEditFormField
            label="Institution Name"
            value={instituteName}
            onChangeText={setInstituteName}
            autoCapitalize="words"
            placeholder="Enter institution name"
          />

          <InstituteEditFormField
            label="Contact Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="admin@institution.edu"
          />

          <InstituteEditFormField
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            placeholder="8123456789"
          />

          <InstituteEditFormField
            label="Physical Address"
            value={address}
            onChangeText={setAddress}
            multiline
            minHeight={72}
            placeholder="Enter institution address"
          />

          <InstituteEditFormField
            label="Institutional Description"
            value={about}
            onChangeText={(text) => setAbout(text.slice(0, MAX_ABOUT_LENGTH))}
            multiline
            minHeight={148}
            placeholder="Describe your institution"
            footer={`Character count: ${about.length}/${MAX_ABOUT_LENGTH}`}
          />

          <View style={styles.actions}>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}>
              <Ionicons name="save-outline" size={16} color={AuthColors.white} />
              <Text style={styles.saveText}>Save Changes</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={18} color={AuthColors.textPrimary} />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.profileBrand,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#464554',
  },
  actions: {
    gap: 16,
    paddingTop: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4648D4',
    borderRadius: 12,
    minHeight: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.white,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E9E6F3',
    borderRadius: 12,
    minHeight: 43,
  },
  cancelText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
});
