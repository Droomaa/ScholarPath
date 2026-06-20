import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AiWizardFooter,
  AiWizardHeader,
  AiWizardProgress,
} from '@/src/features/student/ai-recommendation/components';
import {
  DESTINATION_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
} from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { type AiWizardFormData } from '@/src/types/student/ai-recommendation';
import { AuthColors, FontFamily } from '@/src/theme';

type StepOpportunityPreferencesProps = {
  formData: AiWizardFormData;
  onChange: (updates: Partial<AiWizardFormData>) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
  canContinue: boolean;
};

function PreferenceCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.optionCard, selected && styles.optionCardSelected]} onPress={onPress}>
      <View style={styles.optionHeader}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{label}</Text>
        {selected ? (
          <Ionicons name="checkmark-circle" size={18} color={AuthColors.brandPrimary} />
        ) : (
          <View style={styles.optionCircle} />
        )}
      </View>
      <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
        {description}
      </Text>
    </Pressable>
  );
}

export function StepOpportunityPreferences({
  formData,
  onChange,
  onBackPress,
  onContinuePress,
  canContinue,
}: StepOpportunityPreferencesProps) {
  const toggleOpportunity = (id: 'beasiswa' | 'kompetisi') => {
    const next = formData.opportunityTypes.includes(id)
      ? formData.opportunityTypes.filter((item) => item !== id)
      : [...formData.opportunityTypes, id];
    onChange({ opportunityTypes: next });
  };

  const toggleDestination = (id: 'domestic' | 'international') => {
    const next = formData.destinationRegions.includes(id)
      ? formData.destinationRegions.filter((item) => item !== id)
      : [...formData.destinationRegions, id];
    onChange({ destinationRegions: next });
  };

  return (
    <View style={styles.screen}>
      <AiWizardHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AiWizardProgress step={2} title="Preferensi Peluang" />
        <Text style={styles.intro}>
          Sesuaikan preferensi peluang Anda untuk mendapatkan rekomendasi yang paling relevan.
        </Text>

        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupIcon}>
              <Ionicons name="compass-outline" size={18} color={AuthColors.brandPrimary} />
            </View>
            <Text style={styles.groupTitle}>Jenis Peluang</Text>
          </View>
          <View style={styles.optionList}>
            {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
              <PreferenceCard
                key={option.id}
                label={option.label}
                description={option.description}
                selected={formData.opportunityTypes.includes(option.id)}
                onPress={() => toggleOpportunity(option.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupIcon}>
              <Ionicons name="map-outline" size={18} color={AuthColors.brandPrimary} />
            </View>
            <Text style={styles.groupTitle}>Wilayah Tujuan</Text>
          </View>
          <View style={styles.optionList}>
            {DESTINATION_OPTIONS.map((option) => (
              <PreferenceCard
                key={option.id}
                label={option.label}
                description={option.description}
                selected={formData.destinationRegions.includes(option.id)}
                onPress={() => toggleDestination(option.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <AiWizardFooter
        onBackPress={onBackPress}
        onContinuePress={onContinuePress}
        continueDisabled={!canContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AuthColors.background },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160, gap: 24 },
  intro: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: AuthColors.textSecondary,
  },
  groupCard: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.3)',
    borderRadius: 24,
    padding: 25,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(44, 42, 188, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.45,
    color: AuthColors.textPrimary,
  },
  optionList: { gap: 12 },
  optionCard: {
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 16,
    padding: 21,
    backgroundColor: AuthColors.white,
  },
  optionCardSelected: {
    backgroundColor: '#E1E0FF',
    borderColor: AuthColors.brandPrimary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.textSecondary,
  },
  optionTitleSelected: { color: AuthColors.brandPrimary },
  optionCircle: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: AuthColors.textMuted,
  },
  optionDescription: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 25.6,
    color: AuthColors.textSecondary,
  },
  optionDescriptionSelected: { color: AuthColors.textPrimary },
});
