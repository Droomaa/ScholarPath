import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProgramQuickStatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  valueSuffix?: string;
  valueSuffixColor?: string;
};

export function InstituteProgramQuickStatCard({
  icon,
  label,
  value,
  suffix,
  valueSuffix,
  valueSuffixColor,
}: InstituteProgramQuickStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        {valueSuffix ? (
          <Text style={[styles.valueSuffix, valueSuffixColor ? { color: valueSuffixColor } : null]}>
            {valueSuffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ProgramStatCalendarIcon() {
  return <Ionicons name="calendar-outline" size={20} color={AuthColors.profileBrand} />;
}

export function ProgramStatPeopleIcon() {
  return <Ionicons name="people-outline" size={20} color={AuthColors.profileBrand} />;
}

export function ProgramStatApplicantsIcon() {
  return <Ionicons name="person-add-outline" size={20} color={AuthColors.profileBrand} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    height: 20,
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#464554',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  value: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  suffix: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
  },
  valueSuffix: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
});
