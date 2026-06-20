import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantDataField = {
  label: string;
  value: string;
  variant?: 'default' | 'email';
};

type ApplicantDataCardProps = {
  fullName: string;
  educationLevel: string;
  schoolOrigin: string;
  major: string;
  email: string;
};

function ApplicantDataRow({ label, value, variant = 'default' }: ApplicantDataField) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, variant === 'email' && styles.emailValue]}>{value}</Text>
    </View>
  );
}

export function ApplicantDataCard({
  fullName,
  educationLevel,
  schoolOrigin,
  major,
  email,
}: ApplicantDataCardProps) {
  return (
    <View style={styles.card}>
      <ApplicantDataRow label="NAMA LENGKAP" value={fullName} />
      <ApplicantDataRow label="Jenjang pendidikan" value={educationLevel} />
      <ApplicantDataRow label="Asal sekolah" value={schoolOrigin} />
      <ApplicantDataRow label="Jurusan" value={major} />
      <ApplicantDataRow label="EMAIL" value={email} variant="email" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 25,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    gap: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: '#767586',
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  emailValue: {
    color: AuthColors.profileBrand,
  },
});
