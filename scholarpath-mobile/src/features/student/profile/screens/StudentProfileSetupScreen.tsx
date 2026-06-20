import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';

import {
  OptionPickerModal,
  ProfileAiTipsCard,
  ProfileChipPicker,
  ProfileProgressHeader,
  ProfileSaveButton,
  ProfileSelectField,
  ProfileTextField,
  ProfileTopBar,
} from '@/src/features/student/profile/components';
import {
  EDUCATION_LEVELS,
  getMajorOptions,
  INTERESTS_BY_CATEGORY,
  requiresMajor,
  SKILLS_BY_CATEGORY,
} from '@/src/features/student/profile/constants/profile-options';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { ApiError } from '@/src/services/api/client';
import { AuthColors } from '@/src/theme';

function calculateProgress(
  fullName: string,
  educationLevel: string,
  major: string,
  interests: string[],
  skills: string[]
) {
  let progress = 0;

  if (fullName.trim()) progress += 30;
  if (educationLevel) progress += 25;
  if (educationLevel === 'SMP' || major) progress += 25;
  if (interests.length >= 3) progress += 10;
  if (skills.length >= 1) progress += 10;

  return progress;
}

function toggleSelection(items: string[], item: string) {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

export function StudentProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { completeProfile } = useStudentSession();
  const { fullName: initialFullName, email: initialEmail } = useLocalSearchParams<{
    fullName?: string;
    email?: string;
  }>();

  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [educationLevel, setEducationLevel] = useState('');
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const [educationPickerVisible, setEducationPickerVisible] = useState(false);
  const [majorPickerVisible, setMajorPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMajorField = requiresMajor(educationLevel);
  const majorOptions = getMajorOptions(educationLevel);

  const progress = useMemo(
    () => calculateProgress(fullName, educationLevel, major, interests, skills),
    [fullName, educationLevel, major, interests, skills]
  );

  const canSave =
    fullName.trim().length > 0 &&
    !!educationLevel &&
    (!requiresMajor(educationLevel) || !!major) &&
    interests.length >= 3 &&
    skills.length >= 1;

  const handleEducationSelect = (level: string) => {
    setEducationLevel(level);
    setMajor('');
  };

  const handleSave = async () => {
    if (!canSave || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeProfile({
        fullName: fullName.trim(),
        email: initialEmail?.trim(),
        educationLevel: educationLevel as 'SMP' | 'SMA' | 'SMK',
        major: requiresMajor(educationLevel) ? major : undefined,
        interests,
        skills,
      });
      router.replace('/(tabs)');
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
      <View style={{ paddingTop: insets.top }}>
        <ProfileTopBar />
      </View>

      <KeyboardAwareScrollView
        extraBottomPadding={120}
        contentContainerStyle={styles.scrollContent}>
          <ProfileProgressHeader progress={progress} />

          <View style={styles.form}>
            <ProfileTextField
              label="Nama Lengkap"
              placeholder="Tulis Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
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

            <ProfileAiTipsCard />
          </View>
      </KeyboardAwareScrollView>

      <ProfileSaveButton onPress={handleSave} disabled={!canSave || isSubmitting} />

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  form: {
    gap: 30,
  },
});
