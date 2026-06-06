import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  buildUpdatePayload,
  clearJenjangCache,
  getJenjangList,
  getProfile,
  mapUserToSessionUpdates,
  updateProfile as updateProfileApi,
} from '@/src/services/profile';
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
  };
}

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSessionState>(defaultStudentSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const syncProfileFromApi = useCallback(async (token: string) => {
    const jenjangList = await getJenjangList(token);
    const response = await getProfile(token);
    const profileUpdates = mapUserToSessionUpdates(response.data, jenjangList);

    setSession((prev) => ({
      ...prev,
      ...profileUpdates,
      userId: response.data.id,
      isAuthenticated: true,
      isHydrating: false,
    }));
  }, []);

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

          try {
            await syncProfileFromApi(stored.token);
          } catch {
            if (!cancelled) {
              setSession((prev) => ({ ...prev, isHydrating: false }));
            }
          }
          return;
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
  }, [syncProfileFromApi]);

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

      try {
        await syncProfileFromApi(auth.token);
      } catch {
        setSession((prev) => ({ ...prev, isHydrating: false }));
      }
    },
    [syncProfileFromApi]
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

  const completeProfile = useCallback(async (profile: StudentProfileData) => {
    const token = sessionRef.current.token;
    if (!token) {
      throw new ApiError('Sesi tidak valid. Silakan login kembali.', 401);
    }

    const jenjangList = await getJenjangList(token);
    await updateProfileApi(
      token,
      buildUpdatePayload(
        {
          fullName: profile.fullName,
          educationLevel: profile.educationLevel,
          major: profile.major,
          interests: profile.interests,
          skills: profile.skills,
        },
        jenjangList
      )
    );

    setSession((prev) => ({
      ...prev,
      fullName: profile.fullName,
      email: profile.email ?? prev.email,
      educationLevel: profile.educationLevel,
      major: profile.major ?? '',
      interests: profile.interests ?? [],
      skills: profile.skills ?? [],
    }));
  }, []);

  const updateProfile = useCallback(
    async (
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
    ) => {
      const current = sessionRef.current;
      const token = current.token;
      if (!token) {
        throw new ApiError('Sesi tidak valid. Silakan login kembali.', 401);
      }

      const merged = {
        fullName: updates.fullName ?? current.fullName,
        educationLevel: updates.educationLevel ?? current.educationLevel,
        major: updates.major ?? current.major,
        interests: updates.interests ?? current.interests,
        skills: updates.skills ?? current.skills,
      };

      const jenjangList = await getJenjangList(token);
      await updateProfileApi(token, buildUpdatePayload(merged, jenjangList));

      setSession((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const value = useMemo<StudentSessionContextValue>(
    () => ({
      ...session,
      setFullName: (fullName) => setSession((prev) => ({ ...prev, fullName })),
      completeProfile,
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
      updateProfile,
      signOut: () => {
        void clearAuthSession();
        clearJenjangCache();
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
    [session, registerStudent, loginStudent, completeProfile, updateProfile]
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
