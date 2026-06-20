import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileProgressHeaderProps = {
  progress: number;
};

export function ProfileProgressHeader({ progress }: ProfileProgressHeaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.textGroup}>
          <Text style={styles.title}>Profil Akademik</Text>
          <Text style={styles.subtitle}>Hampir selesai! Lengkapi data Anda.</Text>
        </View>
        <Text style={styles.percentage}>{clampedProgress}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...AuthTypography.profileTitle,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
  },
  percentage: {
    fontFamily: AuthTypography.profileLabel.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.14,
    color: AuthColors.profileBrand,
  },
  track: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileProgressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: AuthColors.profileProgressFill,
  },
});
