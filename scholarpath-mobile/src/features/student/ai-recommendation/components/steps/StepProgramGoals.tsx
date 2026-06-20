import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AiWizardFooter,
  AiWizardHeader,
  AiWizardProgress,
} from '@/src/features/student/ai-recommendation/components';
import { PROGRAM_GOAL_OPTIONS } from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { type AiWizardFormData } from '@/src/types/student/ai-recommendation';
import { AuthColors, FontFamily } from '@/src/theme';

type StepProgramGoalsProps = {
  formData: AiWizardFormData;
  onChange: (updates: Partial<AiWizardFormData>) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
  canContinue: boolean;
};

export function StepProgramGoals({
  formData,
  onChange,
  onBackPress,
  onContinuePress,
  canContinue,
}: StepProgramGoalsProps) {
  const toggleGoal = (id: string) => {
    const next = formData.programGoals.includes(id)
      ? formData.programGoals.filter((item) => item !== id)
      : [...formData.programGoals, id];
    onChange({ programGoals: next });
  };

  return (
    <View style={styles.screen}>
      <AiWizardHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AiWizardProgress step={3} title="Program Goals" />
        <Text style={styles.question}>Apa tujuan utama Anda?</Text>
        <Text style={styles.intro}>
          Pilih satu atau lebih tujuan untuk membantu AI kami menyesuaikan rekomendasi program
          yang paling relevan bagi Anda.
        </Text>

        <View style={styles.grid}>
          {PROGRAM_GOAL_OPTIONS.map((option) => {
            const selected = formData.programGoals.includes(option.id);
            return (
              <Pressable
                key={option.id}
                style={[styles.goalChip, selected && styles.goalChipSelected]}
                onPress={() => toggleGoal(option.id)}>
                <Ionicons
                  name={option.icon as 'cash-outline'}
                  size={18}
                  color={selected ? AuthColors.brandPrimary : AuthColors.textPrimary}
                />
                <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <LinearGradient
          colors={['#4648D4', '#9C48EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoCard}>
          <MaterialCommunityIcons name="creation" size={44} color="#D1D1FF" />
          <Text style={styles.promoText}>
            AI kami siap mengkurasi pengalaman{'\n'}terbaik Anda.
          </Text>
        </LinearGradient>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160, gap: 16 },
  question: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36.4,
    color: AuthColors.brandPrimary,
  },
  intro: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: AuthColors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 16,
  },
  goalChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AuthColors.profileChipBackground,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 17,
  },
  goalChipSelected: {
    backgroundColor: '#E1E0FF',
    borderColor: AuthColors.brandPrimary,
  },
  goalChipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.textPrimary,
  },
  goalChipTextSelected: { color: AuthColors.brandPrimary },
  promoCard: {
    borderRadius: 24,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  promoText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: '#D1D1FF',
    textAlign: 'center',
  },
});
