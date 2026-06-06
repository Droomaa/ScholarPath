import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { ApiError } from '@/src/services/api/client';
import {
  OptionPickerModal,
  ProfileChipPicker,
  ProfileSaveButton,
  ProfileSelectField,
  ProfileTextField,
} from '@/src/features/student/profile/components';
import {
  EDUCATION_LEVELS,
  getMajorOptions,
  INTERESTS_BY_CATEGORY,
  requiresMajor,
  SKILLS_BY_CATEGORY,
} from '@/src/features/student/profile/constants/profile-options';
import { useProfilePhotoPicker } from '@/src/features/student/profile/hooks/useProfilePhotoPicker';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

function toggleSelection(items: string[], item: string) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

export function StudentProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const { pickPhoto } = useProfilePhotoPicker();
  const session = useStudentSession();
  const { updateProfile } = session;

  const [fullName, setFullName] = useState(session.fullName);
  const [bio, setBio] = useState(session.bio);
  const [educationLevel, setEducationLevel] = useState(session.educationLevel);
  const [major, setMajor] = useState(session.major);
  const [interests, setInterests] = useState<string[]>(session.interests);
  const [skills, setSkills] = useState<string[]>(session.skills);

  const [educationPickerVisible, setEducationPickerVisible] = useState(false);
  const [majorPickerVisible, setMajorPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMajorField = requiresMajor(educationLevel);
  const majorOptions = getMajorOptions(educationLevel);

  const canSave =
    fullName.trim().length > 0 &&
    !!educationLevel &&
    (!requiresMajor(educationLevel) || !!major) &&
    interests.length >= 3 &&
    skills.length >= 1;

  const handleEducationSelect = (level: string) => {
    setEducationLevel(level as 'SMP' | 'SMA' | 'SMK' | '');
    setMajor('');
  };

  const handleSave = async () => {
    if (!canSave || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        educationLevel,
        major: requiresMajor(educationLevel) ? major : '',
        interests,
        skills,
      });
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Gagal menyimpan profil. Periksa koneksi internet Anda.';
      Alert.alert('Simpan Profil Gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <View style={styles.iconButton} />
      </View>

      <KeyboardAwareScrollView
        extraBottomPadding={120}
        contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['#4648D4', '#E1E0FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  {session.profilePhotoUri ? (
                    <Image
                      source={{ uri: session.profilePhotoUri }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={40} color={AuthColors.textMuted} />
                    </View>
                  )}
                </View>
              </LinearGradient>
              <Pressable style={styles.editPhotoButton} onPress={pickPhoto} hitSlop={8}>
                <Ionicons name="camera" size={14} color={AuthColors.white} />
              </Pressable>
            </View>
            <Text style={styles.avatarHint}>Ketuk ikon kamera untuk ganti foto</Text>
          </View>

          <View style={styles.form}>
            <ProfileTextField
              label="Nama Lengkap"
              placeholder="Tulis Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <ProfileTextField
              label="Email"
              placeholder="email@example.com"
              value={session.email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.readOnlyInput}
            />

            <ProfileTextField
              label="Bio"
              placeholder="Ceritakan tentang dirimu..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />

            <ProfileSelectField
              label="Jenjang Pendidikan"
              placeholder="Pilih Jenjang Pendidikan"
              value={educationLevel}
              onPress={() => setEducationPickerVisible(true)}
            />

            {showMajorField ? (
              <ProfileSelectField
                label="Jurusan / Program Studi"
                placeholder="Pilih Jurusan / Program Studi"
                value={major}
                onPress={() => setMajorPickerVisible(true)}
              />
            ) : null}

            <ProfileChipPicker
              label="Minat (Pilih 3 atau lebih)"
              optionsByCategory={INTERESTS_BY_CATEGORY}
              selected={interests}
              onToggle={(item) => setInterests((prev) => toggleSelection(prev, item))}
            />

            <ProfileChipPicker
              label="Keahlian Utama (Pilih minimal 1)"
              optionsByCategory={SKILLS_BY_CATEGORY}
              selected={skills}
              onToggle={(item) => setSkills((prev) => toggleSelection(prev, item))}
            />
          </View>
      </KeyboardAwareScrollView>

      <ProfileSaveButton
        onPress={handleSave}
        disabled={!canSave || isSubmitting}
        label="Simpan Perubahan"
      />

      <OptionPickerModal
        visible={educationPickerVisible}
        title="Pilih Jenjang Pendidikan"
        options={EDUCATION_LEVELS}
        selectedValue={educationLevel}
        onClose={() => setEducationPickerVisible(false)}
        onSelect={handleEducationSelect}
      />

      <OptionPickerModal
        visible={majorPickerVisible}
        title="Pilih Jurusan / Program Studi"
        options={majorOptions}
        selectedValue={major}
        onClose={() => setMajorPickerVisible(false)}
        onSelect={setMajor}
      />
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
    backgroundColor: AuthColors.profileHeaderBlur,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199, 196, 215, 0.2)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  topBarTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.profileBrand,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: AuthColors.background,
    overflow: 'hidden',
    backgroundColor: AuthColors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AuthColors.profileChipBackground,
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    ...AuthTypography.profileSubtitle,
    fontSize: 12,
    color: AuthColors.textMuted,
  },
  form: {
    gap: 24,
  },
  bioInput: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 13,
  },
  readOnlyInput: {
    backgroundColor: AuthColors.profileChipBackground,
    color: AuthColors.textSecondary,
  },
});
