import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  defaultStudentSession,
  type AiRecommendation,
  type StudentProfileData,
  type StudentSessionContextValue,
  type StudentSessionState,
} from '@/src/types/student/student-session';
import { type AiProgramMatch } from '@/src/types/student/ai-recommendation';

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSessionState>(defaultStudentSession);

  const value = useMemo<StudentSessionContextValue>(
    () => ({
      ...session,
      setFullName: (fullName) => setSession((prev) => ({ ...prev, fullName })),
      completeProfile: (profile: StudentProfileData) =>
        setSession((prev) => ({
          ...prev,
          fullName: profile.fullName,
          email: profile.email ?? prev.email,
          educationLevel: profile.educationLevel,
          major: profile.major ?? '',
          interests: profile.interests ?? [],
          skills: profile.skills ?? [],
        })),
      signInAsStudent: ({ fullName, email } = {}) => {
        const derivedName =
          fullName?.trim() ||
          (email?.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : '') ||
          'Siswa';

        setSession((prev) => ({
          ...prev,
          fullName: derivedName,
          email: email?.trim() ?? prev.email,
        }));
      },
      updateProfile: (updates) => setSession((prev) => ({ ...prev, ...updates })),
      signOut: () => setSession(defaultStudentSession),
      setAiRecommendationHistory: (recommendation: AiRecommendation) =>
        setSession((prev) => ({
          ...prev,
          hasAiRecommendationHistory: true,
          aiRecommendation: recommendation,
        })),
      setAiRecommendationResults: (results) =>
        setSession((prev) => ({
          ...prev,
          aiRecommendationResults: results,
          hasAiRecommendationHistory: results.length > 0,
        })),
      setAiWizardSelections: (interests, skills) =>
        setSession((prev) => ({
          ...prev,
          aiWizardInterests: interests,
          aiWizardSkills: skills,
        })),
    }),
    [session]
  );

  return (
    <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const context = useContext(StudentSessionContext);
  if (!context) {
    throw new Error('useStudentSession must be used within StudentSessionProvider');
  }
  return context;
}
