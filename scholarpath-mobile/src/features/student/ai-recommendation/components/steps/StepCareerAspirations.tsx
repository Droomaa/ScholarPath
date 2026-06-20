import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AiWizardFooter,
  AiWizardHeader,
  AiWizardProgress,
} from '@/src/features/student/ai-recommendation/components';
import {
  MORE_CAREER_OPTIONS,
  PRIMARY_CAREER_OPTIONS,
} from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { type AiWizardFormData } from '@/src/types/student/ai-recommendation';
import { AuthColors, FontFamily } from '@/src/theme';

type StepCareerAspirationsProps = {
  formData: AiWizardFormData;
  onChange: (updates: Partial<AiWizardFormData>) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
  canContinue: boolean;
};

function CareerCard({
  label,
  description,
  selected,
  icon,
  iconFamily,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  icon: string;
  iconFamily: 'ionicons' | 'material';
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.careerCard, selected && styles.careerCardSelected]} onPress={onPress}>
      <View style={styles.careerIconWrap}>
        {iconFamily === 'material' ? (
          <MaterialCommunityIcons
            name={icon as 'office-building-outline'}
            size={20}
            color={AuthColors.profileBrand}
          />
        ) : (
          <Ionicons name={icon as 'flask-outline'} size={20} color={AuthColors.profileBrand} />
        )}
      </View>
      <View style={styles.careerTextCol}>
        <Text style={styles.careerTitle}>{label}</Text>
        <Text style={styles.careerDescription}>{description}</Text>
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={20} color={AuthColors.brandPrimary} />
      ) : (
        <View style={styles.radio} />
      )}
    </Pressable>
  );
}

export function StepCareerAspirations({
  formData,
  onChange,
  onBackPress,
  onContinuePress,
  canContinue,
}: StepCareerAspirationsProps) {
  const [showMore, setShowMore] = useState(false);

  const toggleCareer = (id: string) => {
    const next = formData.careerAspirations.includes(id)
      ? formData.careerAspirations.filter((item) => item !== id)
      : [...formData.careerAspirations, id];
    onChange({ careerAspirations: next });
  };

  const careerOptions = showMore
    ? [...PRIMARY_CAREER_OPTIONS, ...MORE_CAREER_OPTIONS]
    : PRIMARY_CAREER_OPTIONS;

  return (
    <View style={styles.screen}>
      <AiWizardHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AiWizardProgress step={4} title="Career Aspirations" />

        <View style={styles.aiBadge}>
          <MaterialCommunityIcons name="creation" size={13} color={AuthColors.loginGradientEnd} />
          <Text style={styles.aiBadgeText}>AI MATCHING FACTOR</Text>
        </View>

        <Text style={styles.intro}>
          Where do you see yourself in 5 years? Your selection helps our{' '}
          <Text style={styles.introHighlight}>AI Matcher</Text> pinpoint the exact scholarships
          and competition that value your long-term vision.
        </Text>

        <View style={styles.careerList}>
          {careerOptions.map((option) => (
            <CareerCard
              key={option.id}
              label={option.label}
              description={option.description}
              icon={option.icon}
              iconFamily={option.iconFamily}
              selected={formData.careerAspirations.includes(option.id)}
              onPress={() => toggleCareer(option.id)}
            />
          ))}
        </View>

        <Pressable style={styles.moreButton} onPress={() => setShowMore((prev) => !prev)}>
          <Ionicons name={showMore ? 'remove' : 'add'} size={16} color={AuthColors.brandPrimary} />
          <Text style={styles.moreButtonText}>{showMore ? 'Show Less' : 'More Option'}</Text>
        </Pressable>
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
  aiBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0DBFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    color: AuthColors.loginGradientEnd,
    textTransform: 'uppercase',
  },
  intro: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: AuthColors.textSecondary,
  },
  introHighlight: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.brandPrimary,
  },
  careerList: { gap: 16, paddingVertical: 16 },
  careerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 12,
    padding: 17,
  },
  careerCardSelected: {
    backgroundColor: '#E1E0FF',
    borderColor: AuthColors.brandPrimary,
  },
  careerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthColors.profileProgressTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careerTextCol: { flex: 1, gap: 2 },
  careerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  careerDescription: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: AuthColors.textMuted,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  moreButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.brandPrimary,
  },
});
