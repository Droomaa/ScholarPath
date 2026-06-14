import { ProgramDocumentRequirement } from '@/src/types/shared/program-registration';
import type { ProgramCategory } from '@/src/types/shared/program';

export const MANDATORY_CV_DOCUMENT_ID = 'cv';

export const MANDATORY_CV_REQUIREMENT: ProgramDocumentRequirement = {
  id: MANDATORY_CV_DOCUMENT_ID,
  title: 'Curriculum Vitae',
  description: 'Tell us about yourself!',
  icon: 'document',
};

export function requiresMandatoryCv(category: ProgramCategory): boolean {
  return category === 'beasiswa';
}
