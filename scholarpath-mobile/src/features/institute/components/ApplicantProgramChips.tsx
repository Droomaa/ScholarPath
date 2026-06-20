import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantProgramChipsProps = {
  selected: string;
  onSelect: (programId: string) => void;
  programs: { id: string; label: string }[];
};

export function ApplicantProgramChips({
  selected,
  onSelect,
  programs,
}: ApplicantProgramChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}>
      {programs.map((program) => {
        const isActive = selected === program.id;
        return (
          <Pressable
            key={program.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(program.id)}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {program.label}
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: 'rgba(96, 99, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 99, 238, 0.12)',
  },
  chipActive: {
    backgroundColor: AuthColors.profileBrand,
    borderColor: AuthColors.profileBrand,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.profileBrand,
  },
  chipTextActive: {
    color: AuthColors.white,
  },
});
