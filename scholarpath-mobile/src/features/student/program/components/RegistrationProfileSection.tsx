import { StyleSheet, Text, View } from 'react-native';

import {
  OptionPickerModal,
  ProfileSelectField,
  ProfileTextField,
} from '@/src/features/student/profile/components';
import { EDUCATION_LEVELS } from '@/src/features/student/profile/constants/profile-options';
import type { EducationLevel } from '@/src/types/shared/program';
import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationProfileSectionProps = {
  fullName: string;
  email: string;
  schoolOrigin: string;
  educationLevel: EducationLevel | '';
  onFullNameChange: (value: string) => void;
  onSchoolOriginChange: (value: string) => void;
  onEducationLevelChange: (value: EducationLevel) => void;
  educationPickerVisible: boolean;
  onEducationPickerOpen: () => void;
  onEducationPickerClose: () => void;
};

export function RegistrationProfileSection({
  fullName,
  email,
  schoolOrigin,
  educationLevel,
  onFullNameChange,
  onSchoolOriginChange,
  onEducationLevelChange,
  educationPickerVisible,
  onEducationPickerOpen,
  onEducationPickerClose,
}: RegistrationProfileSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Diri</Text>
      <Text style={styles.sectionSubtitle}>
        Lengkapi profil kamu sebelum mengunggah berkas pendaftaran.
      </Text>

      <ProfileTextField
        label="Nama Lengkap"
        value={fullName}
        onChangeText={onFullNameChange}
        autoCapitalize="words"
        placeholder="Masukkan nama lengkap"
      />

      <View>
        <ProfileTextField
          label="Email Utama"
          value={email}
          editable={false}
          selectTextOnFocus={false}
          style={styles.readOnlyInput}
        />
        <Text style={styles.helperText}>Email tidak dapat diubah pada saat pendaftaran.</Text>
      </View>

      <ProfileTextField
        label="Asal Sekolah / Instansi"
        value={schoolOrigin}
        onChangeText={onSchoolOriginChange}
        autoCapitalize="words"
        placeholder="Contoh: SMA Negeri 1 Mojokerto"
      />

      <ProfileSelectField
        label="Jenjang Pendidikan Saat Ini"
        placeholder="Pilih jenjang pendidikan"
        value={educationLevel}
        onPress={onEducationPickerOpen}
      />

      <OptionPickerModal
        visible={educationPickerVisible}
        title="Jenjang Pendidikan"
        options={EDUCATION_LEVELS}
        selectedValue={educationLevel}
        onSelect={(value) => {
          onEducationLevelChange(value as EducationLevel);
          onEducationPickerClose();
        }}
        onClose={onEducationPickerClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F8',
    color: AuthColors.textSecondary,
  },
  helperText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textMuted,
    paddingLeft: 4,
    marginTop: 6,
  },
});
