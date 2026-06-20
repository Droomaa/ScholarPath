import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProfileInfoCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
  compactTitle?: boolean;
  flexible?: boolean;
};

export function ProfileInfoCard({
  icon,
  title,
  children,
  fullWidth,
  compactTitle,
  flexible,
}: ProfileInfoCardProps) {
  return (
    <View
      style={[
        styles.card,
        fullWidth && styles.cardFullWidth,
        flexible && styles.cardFlexible,
      ]}>
      <View style={[styles.header, compactTitle && styles.headerCompact]}>
        {icon}
        <Text style={[styles.title, compactTitle && styles.titleCompact]}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

type ProfileFieldProps = {
  label: string;
  value: string;
};

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={2}>
        {value || '-'}
      </Text>
    </View>
  );
}

type ProfileChipListProps = {
  items: string[];
  variant: 'interests' | 'skills';
};

export function ProfileChipList({ items, variant }: ProfileChipListProps) {
  if (items.length === 0) {
    return <Text style={styles.emptyChips}>-</Text>;
  }

  return (
    <View style={styles.chipWrap}>
      {items.map((item) => (
        <View
          key={item}
          style={[styles.chip, variant === 'skills' ? styles.chipSkill : styles.chipInterest]}>
          <Text
            style={[
              styles.chipText,
              variant === 'skills' ? styles.chipTextSkill : styles.chipTextInterest,
            ]}>
            {item}
          </Text>
        </View>
      ))}
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
    shadowColor: AuthColors.profileBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardFullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  cardFlexible: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E1ED',
  },
  body: {
    gap: 16,
    paddingTop: 4,
  },
  headerCompact: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  titleCompact: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textMuted,
  },
  fieldValue: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipInterest: {
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
  },
  chipSkill: {
    backgroundColor: 'rgba(218, 226, 253, 0.3)',
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  chipTextInterest: {
    color: AuthColors.profileBrand,
  },
  chipTextSkill: {
    color: '#565E74',
  },
  emptyChips: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textMuted,
  },
});
