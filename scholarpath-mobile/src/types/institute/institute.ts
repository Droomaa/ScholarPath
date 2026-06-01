export type InstituteProgramTab = 'active' | 'review' | 'closed';

export type InstituteProgramDocument = {
  id: string;
  title: string;
  description: string;
  icon: 'document-text-outline' | 'card-outline' | 'mail-outline' | 'ribbon-outline';
  /** Sample/template file URL from API (signed URL in production). */
  templateUrl?: string;
  /** Display name for the template file, e.g. "transcript-template.pdf". */
  templateFileName?: string;
  /** Human-readable size label, e.g. "240 KB". */
  templateSizeLabel?: string;
  /** Submission rules from API. Falls back to local defaults when omitted. */
  guidelines?: string[];
};

export type InstituteProgram = {
  id: string;
  title: string;
  categoryTag: string;
  categoryBadgeLabel: string;
  categoryTagBg: string;
  categoryTagColor: string;
  applicantCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  quota: number;
  deadlineAt: string;
  phaseLabel: string;
  status: InstituteProgramTab;
  heroGradient: [string, string, string];
  requiredDocuments: InstituteProgramDocument[];
};

export type ApplicantStatus = 'pending' | 'accepted' | 'rejected';

export type ApplicantSkillLevel = 'Expert' | 'Advanced' | 'Intermediate';

export type ApplicantSkill = {
  name: string;
  level: ApplicantSkillLevel;
};

export type ApplicantAchievement = {
  title: string;
  description: string;
};

export type ApplicantDocumentIconType = 'pdf' | 'id' | 'letter' | 'certificate';

export type ApplicantUploadedDocument = {
  id: string;
  title: string;
  verificationStatus: 'verified' | 'pending';
  sizeLabel: string;
  uri?: string;
  iconType: ApplicantDocumentIconType;
};

export type InstituteApplicant = {
  id: string;
  name: string;
  major: string;
  programId: string;
  programTitle: string;
  status: ApplicantStatus;
  avatarUri?: string;
  isOnline?: boolean;
  studentRegistrationId?: string;
};

export type InstituteApplicantDetail = InstituteApplicant & {
  email: string;
  motivationAnswer: string;
  trackLabel: string;
  rankLabel?: string;
  topPercentBadge?: string;
  skills: ApplicantSkill[];
  achievements: ApplicantAchievement[];
  documents: ApplicantUploadedDocument[];
};

export type InstituteSessionState = {
  instituteName: string;
  email: string;
  contactNumber: string;
  address: string;
  about: string;
  logoUri: string;
  memberSince: string;
};

export type InstituteSessionContextValue = InstituteSessionState & {
  signInAsInstitute: (options: {
    instituteName?: string;
    email?: string;
    contactNumber?: string;
    address?: string;
    about?: string;
    isNewAccount?: boolean;
  }) => void;
  updateInstituteProfile: (updates: Partial<Omit<InstituteSessionState, never>>) => void;
  signOut: () => void;
};

export const defaultInstituteSession: InstituteSessionState = {
  instituteName: '',
  email: '',
  contactNumber: '',
  address: '',
  about: '',
  logoUri: '',
  memberSince: '',
};
