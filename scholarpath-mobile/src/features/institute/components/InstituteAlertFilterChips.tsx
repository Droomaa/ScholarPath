import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type InstituteNotificationFilter } from '@/src/types/institute/institute-notification';
import { AuthColors, FontFamily } from '@/src/theme';

const FILTERS: { id: InstituteNotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'applicants', label: 'Applicants' },
  { id: 'programs', label: 'Programs' },
  { id: 'system', label: 'System' },
];

type InstituteAlertFilterChipsProps = {
  selected: InstituteNotificationFilter;
  onSelect: (filter: InstituteNotificationFilter) => void;
};

export function InstituteAlertFilterChips({
  selected,
  onSelect,
}: InstituteAlertFilterChipsProps) {
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
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.1)',
  },
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#EFECF8',
  },
  chipActive: {
    backgroundColor: '#4648D4',
  },
  chipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
  chipTextActive: {
    color: AuthColors.white,
  },
});
