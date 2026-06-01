import { ProgramRegistrationDraft } from '@/src/types/shared/program-registration';

export type ActiveProgramStatus = 'incomplete_documents' | 'applied' | 'incomplete_form';

export type RegistrationStatus = 'review' | 'accepted' | 'rejected';

export type TimelineStepStatus = 'done' | 'active' | 'pending';

export type ApplicationTimelineStep = {
  title: string;
  subtitle: string;
  status: TimelineStepStatus;
};

export type ActiveProgram = {
  id: string;
  title: string;
  provider: string;
  status: ActiveProgramStatus;
  daysLeft?: string;
  programId?: string;
};

export type RegistrationApplication = {
  id: string;
  title: string;
  provider: string;
  categoryTag: string;
  status: RegistrationStatus;
  reviewProgress?: number;
  reviewLabel?: string;
  programId?: string;
  submittedAt?: string;
  updatedAt?: string;
  timeline?: ApplicationTimelineStep[];
  acceptedMessage?: {
    title: string;
    subtitle: string;
  };
  rejectedFeedback?: string;
};

export type ApplicationState = {
  activePrograms: ActiveProgram[];
  registrations: RegistrationApplication[];
  registrationDrafts: Record<string, ProgramRegistrationDraft>;
};

export type RegistrationStatusUpdate = {
  reviewProgress?: number;
  acceptedMessage?: {
    title: string;
    subtitle: string;
  };
  rejectedFeedback?: string;
  updatedAt?: string;
};

export type ApplicationContextValue = ApplicationState & {
  addActiveProgram: (program: ActiveProgram) => void;
  upsertActiveProgram: (program: ActiveProgram) => void;
  findActiveProgramByProgramId: (programId: string) => ActiveProgram | undefined;
  updateActiveProgramStatus: (id: string, status: ActiveProgramStatus) => void;
  saveRegistrationDraft: (programId: string, draft: ProgramRegistrationDraft) => void;
  getRegistrationDraft: (programId: string) => ProgramRegistrationDraft | undefined;
  submitApplication: (activeProgramId: string, registration: RegistrationApplication) => void;
  removeActiveProgram: (activeProgramId: string) => void;
  updateRegistrationStatus: (
    id: string,
    status: RegistrationStatus,
    updates?: RegistrationStatusUpdate
  ) => void;
};
