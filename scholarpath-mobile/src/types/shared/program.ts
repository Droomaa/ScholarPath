import { ProgramDocumentRequirement } from '@/src/types/shared/program-registration';

export type ProgramCategory = 'beasiswa' | 'kompetisi';

export type EducationLevel = 'SMP' | 'SMA';

export type ScholarshipFunding = 'Penuh' | 'Parsial';

export type ExploreProgram = {
  id: string;
  title: string;
  provider: string;
  category: ProgramCategory;
  categoryLabel: string;
  categoryTag: string;
  educationLevels: EducationLevel[];
  imageUri: string;
  status: string;
  description: string;
  longDescription?: string;
  deadline?: string;
  /** ISO date for countdown timer */
  deadlineAt?: string;
  quota?: string;
  funding?: ScholarshipFunding;
  prizeAmountIdr?: number;
  requirements: string[];
  eligibilityTerms?: string[];
  requiredDocuments?: ProgramDocumentRequirement[];
  motivationQuestion?: string;
  sortDate: number;
  popularity: number;
};
