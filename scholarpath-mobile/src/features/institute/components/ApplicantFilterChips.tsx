import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type ApplicantStatus } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantFilterChipsProps = {
  selected: ApplicantStatus | 'all';
  onSelect: (status: ApplicantStatus | 'all') => void;
};

const FILTERS: { id: ApplicantStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
];

export function ApplicantFilterChips({ selected, onSelect }: ApplicantFilterChipsProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    color: AuthColors.textSecondary,
  },
  chipTextActive: {
    color: AuthColors.white,
  },
});
