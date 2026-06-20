import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EducationLevel } from '@/src/types/shared/program';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export type JenjangFilterValue = 'semua' | EducationLevel;

type JenjangFilterProps = {
  options: readonly JenjangFilterValue[];
  selected: JenjangFilterValue;
  onSelect: (level: JenjangFilterValue) => void;
};

const LABELS: Record<JenjangFilterValue, string> = {
  semua: 'Semua',
  SMP: 'SMP',
  SMA: 'SMA',
  SMK: 'SMK',
};

export function JenjangFilter({ options, selected, onSelect }: JenjangFilterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Jenjang</Text>
      <View style={styles.options}>
        {options.map((level) => {
          const isActive = selected === level;
          return (
            <Pressable
              key={level}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(level)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {LABELS[level]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
  },
  chipActive: {
    backgroundColor: AuthColors.profileBrand,
    borderColor: AuthColors.profileBrand,
  },
  chipText: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
  chipTextActive: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.white,
  },
});
