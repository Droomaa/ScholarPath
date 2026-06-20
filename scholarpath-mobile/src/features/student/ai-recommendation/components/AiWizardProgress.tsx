import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type AiWizardProgressProps = {
  step: number;
  total?: number;
  title: string;
};

export function AiWizardProgress({ step, total = 4, title }: AiWizardProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.stepLabel}>
            STEP {String(step).padStart(2, '0')} OF {String(total).padStart(2, '0')}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.barRow}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[styles.segment, index < step ? styles.segmentActive : styles.segmentInactive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.1,
    color: AuthColors.brandPrimary,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FontFamily.regular,
    fontSize: 26,
    lineHeight: 39,
    letterSpacing: -0.65,
    color: AuthColors.textPrimary,
    marginTop: 2,
  },
  barRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 9999,
  },
  segmentActive: {
    backgroundColor: '#10B981',
  },
  segmentInactive: {
    backgroundColor: AuthColors.progressInactive,
  },
});
