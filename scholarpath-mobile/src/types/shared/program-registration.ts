export type ProgramDocumentIcon = 'document' | 'school' | 'trophy' | 'essay';

export type ProgramDocumentRequirement = {
  id: string;
  title: string;
  description: string;
  optional?: boolean;
  icon: ProgramDocumentIcon;
};

export type UploadedDocument = {
  name: string;
  size: number;
  uri: string;
};

export type ProgramRegistrationDraft = {
  agreedToTerms: boolean;
  documents: Record<string, UploadedDocument>;
  motivationAnswer: string;
};

export const MAX_PDF_SIZE_BYTES = 100 * 1024 * 1024;
