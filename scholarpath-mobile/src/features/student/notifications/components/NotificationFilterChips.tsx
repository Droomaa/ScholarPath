import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type NotificationFilter } from '@/src/types/student/notification';
import { AuthColors, FontFamily } from '@/src/theme';

const FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'applications', label: 'Applications' },
  { id: 'programs', label: 'Programs' },
  { id: 'system', label: 'System' },
];

type NotificationFilterChipsProps = {
  selected: NotificationFilter;
  onSelect: (filter: NotificationFilter) => void;
};

export function NotificationFilterChips({ selected, onSelect }: NotificationFilterChipsProps) {
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
    width: '100%',
  },
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
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
