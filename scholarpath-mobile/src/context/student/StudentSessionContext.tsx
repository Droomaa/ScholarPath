import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearAuthSession,
  getStoredAuthSession,
  login,
  registerSiswa,
  saveAuthSession,
} from '@/src/services/auth';
import { ApiError } from '@/src/services/api/client';
import {
  defaultStudentSession,
  type AiRecommendation,
  type StudentProfileData,
  type StudentSessionContextValue,
  type StudentSessionState,
} from '@/src/types/student/student-session';
import { type AiProgramMatch } from '@/src/types/student/ai-recommendation';

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

function applyAuthToSession(
  prev: StudentSessionState,
  auth: { token: string; userId: number; name: string; email: string }
): StudentSessionState {
  return {
    ...prev,
    token: auth.token,
    userId: auth.userId,
    fullName: auth.name,
    email: auth.email,
    isAuthenticated: true,
    isHydrating: false,
  };
}

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSessionState>(defaultStudentSession);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      try {
        const stored = await getStoredAuthSession();
        if (cancelled) return;

        if (stored && stored.user.role === 'student') {
          setSession((prev) =>
            applyAuthToSession(prev, {
              token: stored.token,
              userId: stored.user.userId,
              name: stored.user.name,
              email: stored.user.email,
            })
          );
          return;
        }

        if (stored) {
          await clearAuthSession();
        }
      } catch {
        // Ignore hydration errors; user can sign in again.
      } finally {
        if (!cancelled) {
          setSession((prev) => ({ ...prev, isHydrating: false }));
        }
      }
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistStudentAuth = useCallback(
    async (auth: { token: string; userId: number; name: string; email: string; role: string }) => {
      await saveAuthSession({
        token: auth.token,
        user: {
          userId: auth.userId,
          name: auth.name,
          email: auth.email,
          role: auth.role,
        },
      });

      setSession((prev) =>
        applyAuthToSession(prev, {
          token: auth.token,
          userId: auth.userId,
          name: auth.name,
          email: auth.email,
        })
      );
    },
    []
  );

  const registerStudent = useCallback(
    async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
      await registerSiswa({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });

      const loginResponse = await login({
        email: email.trim(),
        password,
      });

      if (loginResponse.role !== 'student') {
        throw new ApiError('Akun bukan siswa.', 403);
      }

      await persistStudentAuth({
        token: loginResponse.token,
        userId: loginResponse.user_id,
        name: loginResponse.name,
        email: email.trim(),
        role: loginResponse.role,
      });
    },
    [persistStudentAuth]
  );

  const loginStudent = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const loginResponse = await login({
        email: email.trim(),
        password,
      });

      if (loginResponse.role !== 'student') {
        throw new ApiError('Akun bukan siswa. Gunakan portal instansi untuk login.', 403);
      }

      await persistStudentAuth({
        token: loginResponse.token,
        userId: loginResponse.user_id,
        name: loginResponse.name,
        email: email.trim(),
        role: loginResponse.role,
      });
    },
    [persistStudentAuth]
  );

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
      registerStudent,
      loginStudent,
      updateProfile: (updates) => setSession((prev) => ({ ...prev, ...updates })),
      signOut: () => {
        void clearAuthSession();
        setSession({ ...defaultStudentSession, isHydrating: false });
      },
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
    [session, registerStudent, loginStudent]
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
