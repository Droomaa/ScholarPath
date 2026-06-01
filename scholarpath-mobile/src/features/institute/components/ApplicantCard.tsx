import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type ApplicantStatus, type InstituteApplicant } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantCardProps = {
  applicant: InstituteApplicant;
  onPress?: () => void;
};

const STATUS_CONFIG: Record<
  ApplicantStatus,
  { label: string; bg: string; color: string }
> = {
  pending: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
  accepted: { label: 'Accepted', bg: '#DCFCE7', color: '#16A34A' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#BA1A1A' },
};

export function ApplicantCard({ applicant, onPress }: ApplicantCardProps) {
  const status = STATUS_CONFIG[applicant.status];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatarWrap}>
        {applicant.avatarUri ? (
          <Image source={{ uri: applicant.avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{applicant.name.charAt(0)}</Text>
          </View>
        )}
        {applicant.isOnline ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{applicant.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="school-outline" size={14} color={AuthColors.textMuted} />
          <Text style={styles.metaText}>Major: {applicant.major}</Text>
        </View>

        <View style={styles.programBar}>
          <Text style={styles.programText} numberOfLines={1}>
            Program: {applicant.programTitle}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={AuthColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: AuthColors.profileBrand,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: AuthColors.white,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: AuthColors.textSecondary,
  },
  programBar: {
    backgroundColor: 'rgba(96, 99, 238, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  programText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.profileBrand,
  },
});
