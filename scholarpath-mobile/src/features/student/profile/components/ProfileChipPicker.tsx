import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_CATEGORIES } from '@/src/features/student/profile/constants/profile-options';
import { ProfileCategory } from '@/src/features/student/profile/types/student-profile';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProfileChipPickerProps = {
  label: string;
  optionsByCategory: Record<ProfileCategory, string[]>;
  selected: string[];
  onToggle: (item: string) => void;
};

export function ProfileChipPicker({
  label,
  optionsByCategory,
  selected,
  onToggle,
}: ProfileChipPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {PROFILE_CATEGORIES.map((category) => (
        <View key={category.id} style={styles.categoryBlock}>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          <View style={styles.chipsWrap}>
            {optionsByCategory[category.id].map((option) => {
              const isSelected = selected.includes(option);
              return (
                <Pressable
                  key={option}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => onToggle(option)}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  label: {
    ...AuthTypography.profileLabel,
    color: AuthColors.textSecondary,
    paddingLeft: 4,
  },
  categoryBlock: {
    gap: 10,
  },
  categoryLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    color: AuthColors.profileBrand,
    paddingLeft: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: AuthColors.profileChipBackground,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 9999,
    paddingHorizontal: 17,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: 'rgba(96, 99, 238, 0.15)',
    borderColor: AuthColors.profileBrand,
  },
  chipText: {
    ...AuthTypography.profileChip,
    color: AuthColors.textSecondary,
  },
  chipTextSelected: {
    color: AuthColors.profileBrand,
  },
});
