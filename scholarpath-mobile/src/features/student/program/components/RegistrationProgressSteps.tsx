import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

export type RegistrationStep = 'detail' | 'profile' | 'documents';

type RegistrationProgressStepsProps = {
  currentStep: RegistrationStep;
};

const STEPS: { id: RegistrationStep; label: string }[] = [
  { id: 'detail', label: 'DETAIL' },
  { id: 'profile', label: 'PROFIL' },
  { id: 'documents', label: 'BERKAS' },
];

function stepIndex(step: RegistrationStep) {
  return STEPS.findIndex((item) => item.id === step);
}

export function RegistrationProgressSteps({ currentStep }: RegistrationProgressStepsProps) {
  const activeIndex = stepIndex(currentStep);

  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const isHighlighted = isActive || isCompleted;

          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isHighlighted && styles.stepCircleHighlighted,
                ]}>
                <Text style={[styles.stepNumber, isHighlighted && styles.stepNumberHighlighted]}>
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                ]}>
                {step.label}
              </Text>
            </View>
          );
        })}

        <View style={styles.connectorTrack} pointerEvents="none">
          <View
            style={[
              styles.connectorFill,
              { width: `${(activeIndex / (STEPS.length - 1)) * 100}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: AuthColors.profileChipBorder,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleHighlighted: {
    borderColor: AuthColors.profileBrand,
    backgroundColor: AuthColors.profileBrand,
  },
  stepNumber: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: AuthColors.textSecondary,
  },
  stepNumberHighlighted: {
    color: AuthColors.white,
  },
  stepLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    color: AuthColors.textSecondary,
  },
  stepLabelActive: {
    color: AuthColors.profileBrand,
    fontFamily: FontFamily.semiBold,
  },
  stepLabelCompleted: {
    color: AuthColors.profileBrand,
  },
  connectorTrack: {
    position: 'absolute',
    top: 15,
    left: '16%',
    right: '16%',
    height: 2,
    backgroundColor: AuthColors.profileChipBorder,
    borderRadius: 1,
  },
  connectorFill: {
    height: 2,
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 1,
  },
});
