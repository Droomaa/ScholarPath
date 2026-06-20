import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatDeadlineDateBlock,
  getDaysLeft,
  getDaysLeftColor,
  getDaysLeftLabel,
} from '@/src/features/institute/constants/institute-programs';
import { type InstituteProgram } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type UpcomingDeadlineItemProps = {
  program: InstituteProgram;
  onPress?: () => void;
};

export function UpcomingDeadlineItem({ program, onPress }: UpcomingDeadlineItemProps) {
  const dateBlock = formatDeadlineDateBlock(program.deadlineAt);
  const daysLeft = getDaysLeft(program.deadlineAt);
  const urgent = daysLeft <= 7;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.dateBlock, urgent && styles.dateBlockUrgent]}>
        <Text style={[styles.dateMonth, urgent && styles.dateTextUrgent]}>{dateBlock.month}</Text>
        <Text style={[styles.dateDay, urgent && styles.dateTextUrgent]}>{dateBlock.day}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {program.title}
        </Text>
        <Text style={styles.phase}>{program.phaseLabel}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.daysLeft, { color: getDaysLeftColor(daysLeft) }]}>
          {getDaysLeftLabel(daysLeft)}
        </Text>
        <Text style={styles.applicants}>{program.applicantCount} Applicants</Text>
      </View>
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
  },
  dateBlock: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E4E1ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBlockUrgent: {
    backgroundColor: '#FFDAD6',
  },
  dateMonth: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    color: '#464554',
  },
  dateDay: {
    fontFamily: FontFamily.extraBold,
    fontSize: 16,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
  dateTextUrgent: {
    color: '#BA1A1A',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
  phase: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  daysLeft: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  applicants: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: AuthColors.textMuted,
  },
});
