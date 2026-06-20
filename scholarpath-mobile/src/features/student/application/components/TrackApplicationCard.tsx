import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RegistrationApplication } from '@/src/types/shared/application';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type TrackApplicationCardProps = {
  application: RegistrationApplication;
};

const STATUS_BADGE = {
  review: {
    label: 'Menunggu Review',
    bg: '#FEF3C7',
    text: '#92400E',
  },
  accepted: {
    label: 'Diterima',
    bg: '#D1FAE5',
    text: '#065F46',
  },
  rejected: {
    label: 'Ditolak',
    bg: '#FFE4E6',
    text: '#9F1239',
  },
};

function ApplicationTimeline({
  steps,
}: {
  steps: NonNullable<RegistrationApplication['timeline']>;
}) {
  return (
    <View style={styles.timeline}>
      <View style={styles.timelineLine} />
      {steps.map((step) => (
        <View key={step.title} style={styles.timelineStep}>
          <View
            style={[
              styles.timelineDot,
              step.status === 'done' && styles.timelineDotDone,
              step.status === 'active' && styles.timelineDotActive,
              step.status === 'pending' && styles.timelineDotPending,
            ]}>
            {step.status === 'done' ? (
              <Ionicons name="checkmark" size={10} color={AuthColors.white} />
            ) : null}
          </View>
          <View style={styles.timelineTextCol}>
            <Text
              style={[
                styles.timelineTitle,
                step.status === 'active' && styles.timelineTitleActive,
                step.status === 'pending' && styles.timelineTitlePending,
              ]}>
              {step.title}
            </Text>
            <Text
              style={[
                styles.timelineSubtitle,
                step.status === 'active' && styles.timelineSubtitleActive,
                step.status === 'pending' && styles.timelineSubtitlePending,
              ]}>
              {step.subtitle}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function TrackApplicationCard({ application }: TrackApplicationCardProps) {
  const badge = STATUS_BADGE[application.status];

  return (
    <View style={[styles.card, application.status === 'rejected' && styles.cardRejected]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.categoryTag}>{application.categoryTag}</Text>
          <Text style={styles.title}>{application.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      {application.status === 'review' && application.timeline ? (
        <ApplicationTimeline steps={application.timeline} />
      ) : null}

      {application.status === 'accepted' && application.acceptedMessage ? (
        <>
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <View style={styles.successTextCol}>
              <Text style={styles.successTitle}>{application.acceptedMessage.title}</Text>
              <Text style={styles.successSubtitle}>{application.acceptedMessage.subtitle}</Text>
            </View>
          </View>
          <View style={styles.acceptedFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={AuthColors.textMuted} />
              <Text style={styles.dateText}>Update: {application.updatedAt}</Text>
            </View>
            <Pressable style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Konfirmasi Hadir</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {application.status === 'rejected' && application.rejectedFeedback ? (
        <>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>"{application.rejectedFeedback}"</Text>
          </View>
          <View style={styles.rejectedFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={14} color={AuthColors.textMuted} />
              <Text style={styles.dateText}>Diajukan: {application.submittedAt}</Text>
            </View>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Pelajari Hasil</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 237, 0.3)',
    borderRadius: 12,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRejected: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  categoryTag: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: AuthColors.textMuted,
    textTransform: 'uppercase',
  },
  title: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  timeline: {
    position: 'relative',
    gap: 16,
    paddingBottom: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 24,
    bottom: 8,
    width: 2,
    backgroundColor: '#E4E1ED',
  },
  timelineStep: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotDone: {
    backgroundColor: AuthColors.profileBrand,
  },
  timelineDotActive: {
    width: 20,
    height: 20,
    backgroundColor: AuthColors.profileProgressFill,
    borderWidth: 2,
    borderColor: AuthColors.white,
    marginLeft: -2,
    marginTop: -2,
  },
  timelineDotPending: {
    backgroundColor: '#E4E1ED',
    borderWidth: 2,
    borderColor: AuthColors.white,
  },
  timelineTextCol: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  timelineTitleActive: {
    fontFamily: FontFamily.bold,
    color: AuthColors.profileBrand,
  },
  timelineTitlePending: {
    color: AuthColors.textMuted,
  },
  timelineSubtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textMuted,
  },
  timelineSubtitleActive: {
    color: AuthColors.textSecondary,
  },
  timelineSubtitlePending: {
    color: AuthColors.profileChipBorder,
  },
  successBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    padding: 13,
  },
  successEmoji: {
    fontSize: 22,
  },
  successTextCol: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#064E3B',
  },
  successSubtitle: {
    ...AuthTypography.profileSubtitle,
    color: '#047857',
  },
  acceptedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dateText: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textMuted,
  },
  confirmButton: {
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmButtonText: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.white,
  },
  feedbackBox: {
    backgroundColor: AuthColors.profileChipBackground,
    borderRadius: 8,
    padding: 12,
  },
  feedbackText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: AuthColors.textSecondary,
  },
  rejectedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(118, 117, 134, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  outlineButtonText: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textMuted,
  },
});
