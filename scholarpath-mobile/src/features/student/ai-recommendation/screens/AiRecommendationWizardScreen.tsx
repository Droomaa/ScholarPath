import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { StepCareerAspirations } from '@/src/features/student/ai-recommendation/components/steps/StepCareerAspirations';
import { StepInterestsSkills } from '@/src/features/student/ai-recommendation/components/steps/StepInterestsSkills';
import { StepNeuralMatching } from '@/src/features/student/ai-recommendation/components/steps/StepNeuralMatching';
import { StepOpportunityPreferences } from '@/src/features/student/ai-recommendation/components/steps/StepOpportunityPreferences';
import { StepProgramGoals } from '@/src/features/student/ai-recommendation/components/steps/StepProgramGoals';
import { StepResults } from '@/src/features/student/ai-recommendation/components/steps/StepResults';
import {
  INTEREST_FIELD_OPTIONS,
  TECHNICAL_SKILL_OPTIONS,
} from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { matchProgramsForUser } from '@/src/features/student/ai-recommendation/utils/match-programs';
import { getProgramById } from '@/src/features/student/explore/constants/explore-programs';
import {
  defaultAiWizardFormData,
  type AiProgramMatch,
  type AiWizardFormData,
  type AiWizardStep,
} from '@/src/types/student/ai-recommendation';

export function AiRecommendationWizardScreen() {
  const { educationLevel, setAiRecommendationHistory, setAiRecommendationResults, setAiWizardSelections } =
    useStudentSession();
  const [step, setStep] = useState<AiWizardStep>(1);
  const [formData, setFormData] = useState<AiWizardFormData>(defaultAiWizardFormData);
  const [matches, setMatches] = useState<AiProgramMatch[]>([]);

  const updateFormData = (updates: Partial<AiWizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const step1Valid = useMemo(
    () =>
      formData.interestFields.length > 0 &&
      (formData.technicalSkills.length > 0 || formData.customSkills.length > 0),
    [formData]
  );

  const step2Valid = useMemo(
    () => formData.opportunityTypes.length > 0 && formData.destinationRegions.length > 0,
    [formData]
  );

  const step3Valid = useMemo(() => formData.programGoals.length > 0, [formData.programGoals]);
  const step4Valid = useMemo(
    () => formData.careerAspirations.length > 0,
    [formData.careerAspirations]
  );

  const handleMatchingComplete = useCallback(() => {
    const interestLabels = formData.interestFields.map(
      (id) => INTEREST_FIELD_OPTIONS.find((item) => item.id === id)?.label ?? id
    );
    const skillLabels = [
      ...formData.technicalSkills.map(
        (id) => TECHNICAL_SKILL_OPTIONS.find((item) => item.id === id)?.label ?? id
      ),
      ...formData.customSkills,
    ];
    setAiWizardSelections(interestLabels, skillLabels);

    const results = matchProgramsForUser(formData, educationLevel);
    setMatches(results);
    setAiRecommendationResults(results);

    const topProgram = getProgramById(results[0]?.programId ?? '');
    if (topProgram && results[0]) {
      setAiRecommendationHistory({
        programId: results[0].programId,
        matchPercent: results[0].matchPercent,
        subtitle: 'Top AI recommendation based on your profile',
        title: topProgram.title,
        provider: topProgram.provider,
        deadline: topProgram.deadline ?? '-',
      });
    }

    setStep(6);
  }, [educationLevel, formData, setAiRecommendationHistory, setAiRecommendationResults, setAiWizardSelections]);

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    if (step === 6) {
      setStep(4);
      return;
    }
    setStep((prev) => (prev - 1) as AiWizardStep);
  };

  if (step === 1) {
    return (
      <StepInterestsSkills
        formData={formData}
        onChange={updateFormData}
        onBackPress={handleBack}
        onContinuePress={() => setStep(2)}
        canContinue={step1Valid}
      />
    );
  }

  if (step === 2) {
    return (
      <StepOpportunityPreferences
        formData={formData}
        onChange={updateFormData}
        onBackPress={handleBack}
        onContinuePress={() => setStep(3)}
        canContinue={step2Valid}
      />
    );
  }

  if (step === 3) {
    return (
      <StepProgramGoals
        formData={formData}
        onChange={updateFormData}
        onBackPress={handleBack}
        onContinuePress={() => setStep(4)}
        canContinue={step3Valid}
      />
    );
  }

  if (step === 4) {
    return (
      <StepCareerAspirations
        formData={formData}
        onChange={updateFormData}
        onBackPress={handleBack}
        onContinuePress={() => setStep(5)}
        canContinue={step4Valid}
      />
    );
  }

  if (step === 5) {
    return <StepNeuralMatching onComplete={handleMatchingComplete} />;
  }

  return <StepResults matches={matches} />;
}
