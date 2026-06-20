import { type InstituteProgramDocument } from '@/src/types/institute/institute';

const DEFAULT_GUIDELINES: Record<string, string[]> = {
  'doc-transcript': [
    'Official or certified digital copy',
    'PDF format, maximum 5 MB',
    'Must include the most recent academic year',
  ],
  'doc-portfolio': [
    'PDF or link to an online portfolio',
    'Highlight research, projects, or publications',
    'Maximum 10 pages or 8 MB',
  ],
  'doc-id': [
    'Government-issued ID (KTP or passport)',
    'Clear photo or scan, JPG/PNG/PDF',
    'Name must match the applicant profile',
  ],
  'doc-recommendation': [
    'At least one letter on official letterhead',
    'PDF format, maximum 2 MB each',
    'Signed within the last 12 months',
  ],
};

const GENERIC_GUIDELINES = [
  'Submit a clear and complete document',
  'Accepted formats: PDF, JPG, or PNG',
  'Maximum file size: 5 MB',
];

export function resolveProgramDocumentGuidelines(document: InstituteProgramDocument) {
  if (document.guidelines?.length) {
    return document.guidelines;
  }

  return DEFAULT_GUIDELINES[document.id] ?? GENERIC_GUIDELINES;
}

export function hasProgramDocumentTemplate(document: InstituteProgramDocument) {
  return Boolean(document.templateUrl?.trim());
}

export function getProgramDocumentTemplateLabel(document: InstituteProgramDocument) {
  if (document.templateFileName) {
    return document.templateSizeLabel
      ? `${document.templateFileName} • ${document.templateSizeLabel}`
      : document.templateFileName;
  }

  return document.templateSizeLabel ?? 'Sample template';
}
