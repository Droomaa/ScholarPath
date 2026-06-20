import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type EligibilityTermsSectionProps = {
  terms: string[];
  agreed: boolean;
  onAgreedChange: (value: boolean) => void;
};

export function EligibilityTermsSection({
  terms,
  agreed,
  onAgreedChange,
}: EligibilityTermsSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Pressable
          style={styles.header}
          onPress={() => setExpanded((prev) => !prev)}
          accessibilityRole="button">
          <Text style={styles.headerTitle}>Eligibility & Terms</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={AuthColors.textPrimary}
          />
        </Pressable>

        {expanded ? (
          <View style={styles.termsList}>
            {terms.map((term) => (
              <Text key={term} style={styles.termItem}>
                • {term}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <Pressable
        style={styles.checkboxRow}
        onPress={() => onAgreedChange(!agreed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}>
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed ? <Ionicons name="checkmark" size={14} color={AuthColors.white} /> : null}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to the eligibility requirements and terms of the program.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(44, 42, 188, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  termsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  termItem: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 22,
    color: AuthColors.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AuthColors.textMuted,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkboxChecked: {
    backgroundColor: AuthColors.profileBrand,
    borderColor: AuthColors.profileBrand,
  },
  checkboxLabel: {
    flex: 1,
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 18,
    color: AuthColors.textSecondary,
  },
});
