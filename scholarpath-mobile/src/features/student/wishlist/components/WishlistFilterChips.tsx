import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExploreCategory } from '@/src/features/student/explore/components/CategoryChips';
import { AuthColors, FontFamily } from '@/src/theme';

type WishlistFilterChipsProps = {
  selected: ExploreCategory;
  onSelect: (category: ExploreCategory) => void;
};

const FILTERS: { id: ExploreCategory; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'beasiswa', label: 'Beasiswa' },
  { id: 'kompetisi', label: 'Kompetisi' },
];

export function WishlistFilterChips({ selected, onSelect }: WishlistFilterChipsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}>
        {FILTERS.map((filter) => {
          const isActive = selected === filter.id;
          return (
            <Pressable
              key={filter.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(filter.id)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter.label}
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
    backgroundColor: AuthColors.profileChipBackground,
  },
  chipActive: {
    backgroundColor: AuthColors.profileBrand,
  },
  chipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: AuthColors.textSecondary,
  },
  chipTextActive: {
    color: AuthColors.white,
  },
});
