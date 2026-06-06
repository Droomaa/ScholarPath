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
import { getProgramById } from '@/src/features/student/explore/constants/explore-programs';
import { ApiError } from '@/src/services/api/client';
import {
  getAIRecommendation,
  mapAiRecommendations,
  resolveAiMatchingError,
} from '@/src/services/ai';
import { serializeKeahlian, updateProfile } from '@/src/services/profile';
import {
  defaultAiWizardFormData,
  type AiProgramMatch,
  type AiWizardFormData,
  type AiWizardStep,
} from '@/src/types/student/ai-recommendation';

export function AiRecommendationWizardScreen() {
  const {
    token,
    educationLevel,
    major,
    setAiRecommendationHistory,
    setAiRecommendationResults,
    setAiWizardSelections,
  } = useStudentSession();
  const [step, setStep] = useState<AiWizardStep>(1);
  const [formData, setFormData] = useState<AiWizardFormData>(defaultAiWizardFormData);
  const [matches, setMatches] = useState<AiProgramMatch[]>([]);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);

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

  const runAiRecommendation = useCallback(async () => {
    if (!token) {
      setMatchingError('Anda harus login untuk menggunakan rekomendasi AI.');
      return;
    }

    setIsMatching(true);
    setMatchingError(null);

    const interestLabels = formData.interestFields.map(
      (id) => INTEREST_FIELD_OPTIONS.find((item) => item.id === id)?.label ?? id
    );
    const skillLabels = [
      ...formData.technicalSkills.map(
        (id) => TECHNICAL_SKILL_OPTIONS.find((item) => item.id === id)?.label ?? id
      ),
      ...formData.customSkills,
    ];

    try {
      setAiWizardSelections(interestLabels, skillLabels);

      const keahlian = serializeKeahlian({
        major: major || educationLevel || undefined,
        interests: interestLabels,
        skills: skillLabels,
      });

      await updateProfile(token, { keahlian });

      const response = await getAIRecommendation(token);
      const results = mapAiRecommendations(
        response.data,
        formData,
        formData.opportunityTypes
      );

      setMatches(results);
      setAiRecommendationResults(results);

      const topMatch = [...results].sort((a, b) => b.matchPercent - a.matchPercent)[0];
      const topProgram = topMatch ? getProgramById(topMatch.programId) : undefined;

      if (topProgram && topMatch) {
        setAiRecommendationHistory({
          programId: topMatch.programId,
          matchPercent: topMatch.matchPercent,
          subtitle: 'Top AI recommendation based on your profile',
          title: topProgram.title,
          provider: topProgram.provider,
          deadline: topProgram.deadline ?? '-',
        });
      }

      setStep(6);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setMatchingError(
          error.message ||
            'Lengkapi profil keahlian Anda terlebih dahulu sebelum mencari rekomendasi.'
        );
      } else {
        setMatchingError(resolveAiMatchingError(error));
      }
    } finally {
      setIsMatching(false);
    }
  }, [
    educationLevel,
    formData,
    major,
    setAiRecommendationHistory,
    setAiRecommendationResults,
    setAiWizardSelections,
    token,
  ]);

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    if (step === 6) {
      setStep(4);
      return;
    }
    if (step === 5) {
      setMatchingError(null);
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
    return (
      <StepNeuralMatching
        error={matchingError}
        isLoading={isMatching}
        onRetry={() => {
          void runAiRecommendation();
        }}
        onRunMatching={runAiRecommendation}
      />
    );
  }

  return <StepResults matches={matches} />;
}
