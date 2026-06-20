import { ProgramDocumentRequirement } from '@/src/types/shared/program-registration';

export const DEFAULT_MOTIVATION_QUESTION =
  'Mengapa anda tertarik mengikuti program ini?';

export const BEASISWA_REQUIRED_DOCUMENTS: ProgramDocumentRequirement[] = [
  {
    id: 'report-card',
    title: 'School Report Card',
    description: 'Latest semester report card',
    icon: 'school',
  },
  {
    id: 'achievement',
    title: 'Achievement Certificate',
    description: '(optional) show your achievement',
    optional: true,
    icon: 'trophy',
  },
  {
    id: 'motivation-essay',
    title: 'Motivation Essay',
    description: '500-1000 words',
    icon: 'essay',
  },
];

export const KOMPETISI_REQUIRED_DOCUMENTS: ProgramDocumentRequirement[] = [
  {
    id: 'resume',
    title: 'Student Resume',
    description: 'Achievements, activities, and skills',
    icon: 'document',
  },
  {
    id: 'report-card',
    title: 'School Report Card',
    description: 'Latest semester report card',
    icon: 'school',
  },
  {
    id: 'proposal',
    title: 'Project Proposal',
    description: 'Proposal or competition entry document',
    icon: 'essay',
  },
  {
    id: 'recommendation',
    title: 'Recommendation Letter',
    description: '(optional) from teacher or mentor',
    optional: true,
    icon: 'document',
  },
];

export function getDefaultRequiredDocuments(
  category: 'beasiswa' | 'kompetisi'
): ProgramDocumentRequirement[] {
  return category === 'beasiswa'
    ? BEASISWA_REQUIRED_DOCUMENTS
    : KOMPETISI_REQUIRED_DOCUMENTS;
}

export const DEFAULT_ELIGIBILITY_TERMS = [
  'Saya berjanji bahwa semua data dan dokumen yang saya unggah adalah asli dan benar.',
  'Saya berjanji akan mengikuti seluruh ketentuan, tata tertib, dan prosedur program.',
  'Saya berjanji tidak akan menyalahgunakan manfaat beasiswa atau kompetisi yang diberikan.',
  'Saya memahami bahwa data palsu dapat mengakibatkan diskualifikasi atau pembatalan pendaftaran.',
];
