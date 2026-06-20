import { ProgramCategory } from '@/src/types/shared/program';

export type AiWizardFormData = {
  interestFields: string[];
  technicalSkills: string[];
  customSkills: string[];
  opportunityTypes: ProgramCategory[];
  destinationRegions: ('domestic' | 'international')[];
  programGoals: string[];
  careerAspirations: string[];
};

export const defaultAiWizardFormData: AiWizardFormData = {
  interestFields: [],
  technicalSkills: [],
  customSkills: [],
  opportunityTypes: [],
  destinationRegions: [],
  programGoals: [],
  careerAspirations: [],
};

export type AiProgramMatch = {
  programId: string;
  matchPercent: number;
  insight: string;
  rank: number;
};

export type AiWizardStep = 1 | 2 | 3 | 4 | 5 | 6;
