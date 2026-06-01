import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProgramCategory } from '@/src/types/shared/program';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export type ExploreCategory = 'semua' | ProgramCategory;

const CATEGORIES: { id: ExploreCategory; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'beasiswa', label: 'Beasiswa' },
  { id: 'kompetisi', label: 'Kompetisi' },
];

type CategoryChipsProps = {
  selected: ExploreCategory;
  onSelect: (category: ExploreCategory) => void;
};

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}>
        {CATEGORIES.map((category) => {
          const isActive = selected === category.id;
          return (
            <Pressable
              key={category.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(category.id)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
