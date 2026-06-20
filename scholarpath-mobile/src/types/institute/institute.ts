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
  legacyProgramId: string;
  sourceKind: 'beasiswa' | 'olimpiade';
  sourceNumericId: number;
  title: string;
  categoryTag: string;
  categoryBadgeLabel: string;
  categoryTagBg: string;
  categoryTagColor: string;
  description?: string;
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
  verifiedBy: number | null;
  createdAt: string;
  updatedAt: string;
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
  pendaftaranId: number;
  name: string;
  major: string;
  programId: string;
  programTitle: string;
  programType?: string;
  status: ApplicantStatus;
  statusId?: number | null;
  avatarUri?: string;
  isOnline?: boolean;
  studentRegistrationId?: string;
  studentEmail?: string;
  keahlian?: string;
  submittedAt?: string;
};

export type InstituteApplicantDetail = InstituteApplicant & {
  email: string;
  educationLevel: string;
  schoolOrigin: string;
  trackLabel: string;
  skills: ApplicantSkill[];
  achievements: ApplicantAchievement[];
  mandatoryDocuments: ApplicantUploadedDocument[];
  otherDocuments: ApplicantUploadedDocument[];
};

export type InstituteSessionState = {
  token: string;
  userId: number;
  instansiId: number;
  instituteName: string;
  email: string;
  contactNumber: string;
  address: string;
  about: string;
  logoUri: string;
  memberSince: string;
  isAuthenticated: boolean;
  isHydrating: boolean;
};

export type InstituteSessionContextValue = InstituteSessionState & {
  registerInstitute: (input: {
    instituteName: string;
    contactNumber: string;
    address: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loginInstitute: (input: { email: string; password: string }) => Promise<void>;
  updateInstituteProfile: (updates: Partial<Omit<InstituteSessionState, 'token' | 'userId' | 'instansiId' | 'isAuthenticated' | 'isHydrating'>>) => void;
  signOut: () => void;
};

export const defaultInstituteSession: InstituteSessionState = {
  token: '',
  userId: 0,
  instansiId: 0,
  instituteName: '',
  email: '',
  contactNumber: '',
  address: '',
  about: '',
  logoUri: '',
  memberSince: '',
  isAuthenticated: false,
  isHydrating: true,
};
