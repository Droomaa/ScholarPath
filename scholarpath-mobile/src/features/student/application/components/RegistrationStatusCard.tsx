import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { RegistrationApplication } from '@/src/types/shared/application';
import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationStatusCardProps = {
  application: RegistrationApplication;
};

const STATUS_CONFIG = {
  accepted: {
    label: 'Diterima',
    badgeBg: '#DCFCE7',
    badgeText: '#15803D',
    progressColor: '#22C55E',
    progressLabel: 'Lulus Seleksi',
    progressLabelColor: '#16A34A',
    iconBg: 'rgba(96, 99, 238, 0.1)',
    icon: 'trophy-outline' as const,
    iconColor: AuthColors.profileBrand,
    dimmed: false,
  },
  review: {
    label: 'Review',
    badgeBg: 'rgba(96, 99, 238, 0.2)',
    badgeText: AuthColors.profileBrand,
    progressColor: AuthColors.profileBrand,
    progressLabel: '',
    progressLabelColor: AuthColors.textPrimary,
    iconBg: 'rgba(218, 226, 253, 0.2)',
    icon: 'file-document-outline' as const,
    iconColor: AuthColors.profileBrand,
    dimmed: false,
  },
  rejected: {
    label: 'Ditolak',
    badgeBg: '#FFDAD6',
    badgeText: '#BA1A1A',
    progressColor: '#BA1A1A',
    progressLabel: '',
    progressLabelColor: AuthColors.textPrimary,
    iconBg: 'rgba(255, 218, 214, 0.2)',
    icon: 'close' as const,
    iconColor: '#BA1A1A',
    dimmed: true,
  },
};

export function RegistrationStatusCard({ application }: RegistrationStatusCardProps) {
  const config = STATUS_CONFIG[application.status];

  return (
    <View style={[styles.card, config.dimmed && styles.cardDimmed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.thumbnail, { backgroundColor: config.iconBg }]}>
            {application.status === 'rejected' ? (
              <Ionicons name="close" size={20} color={config.iconColor} />
            ) : (
              <MaterialCommunityIcons
                name={config.icon}
                size={22}
                color={config.iconColor}
              />
            )}
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{application.title}</Text>
            <Text style={styles.provider}>{application.provider}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: config.badgeBg }]}>
          <Text style={[styles.badgeText, { color: config.badgeText }]}>{config.label}</Text>
        </View>
      </View>

      {application.status === 'accepted' ? (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { backgroundColor: config.progressColor, width: '100%' }]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: config.progressLabelColor }]}>
            Lulus Seleksi
          </Text>
        </View>
      ) : null}

      {application.status === 'review' ? (
        <View style={styles.reviewBlock}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewLabel}>
              {application.reviewLabel ?? 'Proses Review Dokumen'}
            </Text>
            <Text style={styles.reviewPercent}>{application.reviewProgress ?? 0}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: config.progressColor,
                  width: `${application.reviewProgress ?? 0}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#E4E1ED',
    borderRadius: 16,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDimmed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  provider: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileChipBackground,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
  progressLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  reviewBlock: {
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textPrimary,
  },
  reviewPercent: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
});
