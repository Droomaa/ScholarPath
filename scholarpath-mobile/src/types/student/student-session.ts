import { EducationLevel } from '@/src/types/shared/program';
import { type AiProgramMatch } from '@/src/types/student/ai-recommendation';

export type AiRecommendation = {
  programId: string;
  matchPercent: number;
  subtitle: string;
  title: string;
  provider: string;
  deadline: string;
};

export type StudentProfileData = {
  fullName: string;
  email?: string;
  educationLevel: EducationLevel;
  major?: string;
  interests?: string[];
  skills?: string[];
};

export type StudentSessionState = {
  fullName: string;
  email: string;
  educationLevel: EducationLevel | '';
  major: string;
  interests: string[];
  skills: string[];
  aiWizardInterests: string[];
  aiWizardSkills: string[];
  bio: string;
  profilePhotoUri: string;
  hasAiRecommendationHistory: boolean;
  aiRecommendation: AiRecommendation | null;
  aiRecommendationResults: AiProgramMatch[];
};

export type StudentSessionContextValue = StudentSessionState & {
  setFullName: (fullName: string) => void;
  completeProfile: (profile: StudentProfileData) => void;
  signInAsStudent: (options?: { fullName?: string; email?: string }) => void;
  updateProfile: (
    updates: Partial<
      Pick<
        StudentSessionState,
        | 'bio'
        | 'profilePhotoUri'
        | 'fullName'
        | 'email'
        | 'educationLevel'
        | 'major'
        | 'interests'
        | 'skills'
      >
    >
  ) => void;
  signOut: () => void;
  setAiRecommendationHistory: (recommendation: AiRecommendation) => void;
  setAiRecommendationResults: (results: AiProgramMatch[]) => void;
  setAiWizardSelections: (interests: string[], skills: string[]) => void;
};

export const defaultStudentSession: StudentSessionState = {
  fullName: '',
  email: '',
  educationLevel: '',
  major: '',
  interests: [],
  skills: [],
  aiWizardInterests: [],
  aiWizardSkills: [],
  bio: '',
  profilePhotoUri: '',
  hasAiRecommendationHistory: false,
  aiRecommendation: null,
  aiRecommendationResults: [],
};
