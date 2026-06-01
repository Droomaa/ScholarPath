import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export type SortOption = 'terbaru' | 'populer';

type SortToggleProps = {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
};

const OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'populer', label: 'Populer' },
];

export function SortToggle({ selected, onSelect }: SortToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Urutkan</Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isActive = selected === option.id;
          return (
            <Pressable
              key={option.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(option.id)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {option.label}
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
