import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatCountdownUnit,
  getDeadlineCountdown,
} from '@/src/features/student/program/utils/deadline-countdown';
import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationHeroSectionProps = {
  title: string;
  deadlineAt: string;
};

export function RegistrationHeroSection({ title, deadlineAt }: RegistrationHeroSectionProps) {
  const [countdown, setCountdown] = useState(() => getDeadlineCountdown(deadlineAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getDeadlineCountdown(deadlineAt));
    }, 60_000);

    return () => clearInterval(interval);
  }, [deadlineAt]);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Registration Open</Text>
      </View>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.deadlineCard}>
        <View style={styles.deadlineLeft}>
          <Ionicons name="time-outline" size={20} color={AuthColors.profileBrand} />
          <Text style={styles.deadlineLabel}>Deadline in</Text>
        </View>

        <View style={styles.countdownRow}>
          <CountdownUnit value={countdown.days} label="DAYS" />
          <Text style={styles.separator}>:</Text>
          <CountdownUnit value={countdown.hours} label="HRS" />
          <Text style={styles.separator}>:</Text>
          <CountdownUnit value={countdown.minutes} label="MNT" />
        </View>
      </View>
    </View>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.unit}>
      <Text style={styles.unitValue}>{formatCountdownUnit(value)}</Text>
      <Text style={styles.unitLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: AuthColors.profileProgressFill,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.white,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F2FE',
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
  },
  deadlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textSecondary,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  unit: {
    alignItems: 'center',
  },
  unitValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
  unitLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
    textTransform: 'uppercase',
  },
  separator: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
});
