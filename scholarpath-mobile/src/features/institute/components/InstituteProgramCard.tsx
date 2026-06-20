import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDeadlineLabel } from '@/src/features/institute/constants/institute-programs';
import { type InstituteProgram } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProgramCardProps = {
  program: InstituteProgram;
  onViewPress?: () => void;
};

export function InstituteProgramCard({ program, onViewPress }: InstituteProgramCardProps) {
  const isClosed = program.status === 'closed';
  const isReview = program.status === 'review';

  const statusLabel = isClosed
    ? 'Application Closed'
    : isReview
      ? 'Needs Review'
      : 'Accepting Entries';

  const statusColor = isClosed ? '#BA1A1A' : isReview ? '#D97706' : '#10B981';

  const actionLabel = isClosed ? 'View Report' : 'View Details';

  return (
    <View style={[styles.card, isClosed && styles.cardClosed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.tag, { backgroundColor: program.categoryTagBg }]}>
            <Text style={[styles.tagText, { color: program.categoryTagColor }]}>
              {program.categoryTag}
            </Text>
          </View>
          <Text style={styles.title}>{program.title}</Text>
        </View>
        <Pressable style={styles.menuButton} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={16} color={AuthColors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={16}
            color={AuthColors.textSecondary}
          />
          <Text style={styles.metaText}>{program.applicantCount} Applicants</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color={AuthColors.textSecondary} />
          <Text style={styles.metaText}>
            {formatDeadlineLabel(program.deadlineAt, isClosed)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
        <Pressable
          style={[styles.actionButton, isClosed && styles.actionButtonMuted]}
          onPress={onViewPress}>
          <Text style={[styles.actionText, isClosed && styles.actionTextMuted]}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardClosed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
  },
  menuButton: {
    padding: 8,
    borderRadius: 9999,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(199, 196, 215, 0.3)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
  actionButton: {
    backgroundColor: '#4648D4',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  actionButtonMuted: {
    backgroundColor: '#E4E1ED',
  },
  actionText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.white,
  },
  actionTextMuted: {
    color: '#464554',
  },
});
