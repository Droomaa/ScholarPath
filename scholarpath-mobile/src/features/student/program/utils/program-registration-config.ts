import { ExploreProgram } from '@/src/types/shared/program';
import {
  DEFAULT_ELIGIBILITY_TERMS,
  DEFAULT_MOTIVATION_QUESTION,
  getDefaultRequiredDocuments,
} from '@/src/features/student/program/constants/program-registration-defaults';

export function getProgramRegistrationConfig(program: ExploreProgram) {
  const eligibilityTerms =
    program.eligibilityTerms?.length
      ? program.eligibilityTerms
      : program.requirements.length > 0
        ? program.requirements
        : DEFAULT_ELIGIBILITY_TERMS;

  return {
    deadlineAt: program.deadlineAt ?? '2026-12-31T23:59:59.000Z',
    eligibilityTerms,
    requiredDocuments:
      program.requiredDocuments ?? getDefaultRequiredDocuments(program.category),
    motivationQuestion: program.motivationQuestion ?? DEFAULT_MOTIVATION_QUESTION,
  };
}
