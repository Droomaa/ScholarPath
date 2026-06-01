import { ExploreProgram } from '@/src/types/shared/program';
import {
  DEFAULT_MOTIVATION_QUESTION,
  getDefaultRequiredDocuments,
} from '@/src/features/student/program/constants/program-registration-defaults';

export function getProgramRegistrationConfig(program: ExploreProgram) {
  return {
    deadlineAt: program.deadlineAt ?? '2026-12-31T23:59:59.000Z',
    eligibilityTerms: program.eligibilityTerms ?? program.requirements,
    requiredDocuments:
      program.requiredDocuments ?? getDefaultRequiredDocuments(program.category),
    motivationQuestion: program.motivationQuestion ?? DEFAULT_MOTIVATION_QUESTION,
  };
}
