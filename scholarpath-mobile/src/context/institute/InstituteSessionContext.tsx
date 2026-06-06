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
  registerInstansi,
  saveAuthSession,
} from '@/src/services/auth';
import { ApiError } from '@/src/services/api/client';
import { getAllInstansi, getInstansiById } from '@/src/services/institute';
import {
  defaultInstituteSession,
  type InstituteSessionContextValue,
  type InstituteSessionState,
} from '@/src/types/institute/institute';

const InstituteSessionContext = createContext<InstituteSessionContextValue | null>(null);

function isInstituteRole(role: string) {
  return role === 'instansi' || role === 'institute';
}

function buildDefaultAbout(name: string) {
  return `${name} is dedicated to bridging traditional education and the digital economy. We provide world-class scholarships and grants to empower the next generation of innovators and global leaders.`;
}

function applyAuthToSession(
  prev: InstituteSessionState,
  auth: { token: string; userId: number; instansiId: number; name: string; email: string }
): InstituteSessionState {
  return {
    ...prev,
    token: auth.token,
    userId: auth.userId,
    instansiId: auth.instansiId,
    instituteName: auth.name,
    email: auth.email,
    isAuthenticated: true,
  };
}

export function InstituteSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InstituteSessionState>(defaultInstituteSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const syncInstituteProfileFromApi = useCallback(
    async (token: string, instansiId: number, fallbackEmail: string) => {
      const response = await getInstansiById(token, instansiId);
      const profile = response.data;

      setSession((prev) => ({
        ...prev,
        instansiId: profile.id,
        instituteName: profile.nama || prev.instituteName,
        email: fallbackEmail || prev.email,
        contactNumber: profile.kontak || prev.contactNumber,
        address: profile.alamat || prev.address,
        about: prev.about || buildDefaultAbout(profile.nama || prev.instituteName || 'Institusi'),
        memberSince: profile.created_at || prev.memberSince || new Date().toISOString(),
        isAuthenticated: true,
        isHydrating: false,
      }));
    },
    []
  );

  const resolveInstansiId = useCallback(async (token: string, userId: number, knownInstansiId?: number) => {
    if (knownInstansiId) {
      return knownInstansiId;
    }

    const response = await getAllInstansi(token);
    const match = response.data.find((item) => item.user_id === userId);
    if (!match) {
      throw new ApiError('Profil instansi tidak ditemukan.', 404);
    }

    return match.id;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      try {
        const stored = await getStoredAuthSession();
        if (cancelled) return;

        if (stored && isInstituteRole(stored.user.role)) {
          setSession((prev) =>
            applyAuthToSession(prev, {
              token: stored.token,
              userId: stored.user.userId,
              instansiId: stored.user.instansiId ?? 0,
              name: stored.user.name,
              email: stored.user.email,
            })
          );

          try {
            const instansiId = await resolveInstansiId(
              stored.token,
              stored.user.userId,
              stored.user.instansiId
            );
            await syncInstituteProfileFromApi(stored.token, instansiId, stored.user.email);
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
  }, [resolveInstansiId, syncInstituteProfileFromApi]);

  const persistInstituteAuth = useCallback(
    async (auth: {
      token: string;
      userId: number;
      instansiId: number;
      name: string;
      email: string;
      role: string;
    }) => {
      await saveAuthSession({
        token: auth.token,
        user: {
          userId: auth.userId,
          name: auth.name,
          email: auth.email,
          role: auth.role,
          instansiId: auth.instansiId,
        },
      });

      setSession((prev) =>
        applyAuthToSession(prev, {
          token: auth.token,
          userId: auth.userId,
          instansiId: auth.instansiId,
          name: auth.name,
          email: auth.email,
        })
      );

      try {
        await syncInstituteProfileFromApi(auth.token, auth.instansiId, auth.email);
      } catch {
        setSession((prev) => ({ ...prev, isHydrating: false }));
      }
    },
    [syncInstituteProfileFromApi]
  );

  const registerInstitute = useCallback(
    async ({
      instituteName,
      contactNumber,
      address,
      email,
      password,
    }: {
      instituteName: string;
      contactNumber: string;
      address: string;
      email: string;
      password: string;
    }) => {
      const response = await registerInstansi({
        name: instituteName.trim(),
        email: email.trim(),
        password,
        alamat: address.trim(),
        kontak: contactNumber.trim(),
      });

      const loginResponse = await login({
        email: email.trim(),
        password,
      });

      if (!isInstituteRole(loginResponse.role)) {
        throw new ApiError('Akun bukan instansi.', 403);
      }

      await persistInstituteAuth({
        token: loginResponse.token,
        userId: loginResponse.user_id,
        instansiId: response.data_profil.id,
        name: response.data_login.name || instituteName.trim(),
        email: email.trim(),
        role: loginResponse.role,
      });
    },
    [persistInstituteAuth]
  );

  const loginInstitute = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const loginResponse = await login({
        email: email.trim(),
        password,
      });

      if (!isInstituteRole(loginResponse.role)) {
        throw new ApiError('Akun bukan instansi. Gunakan portal siswa untuk login.', 403);
      }

      const instansiId = await resolveInstansiId(loginResponse.token, loginResponse.user_id);

      await persistInstituteAuth({
        token: loginResponse.token,
        userId: loginResponse.user_id,
        instansiId,
        name: loginResponse.name,
        email: email.trim(),
        role: loginResponse.role,
      });
    },
    [persistInstituteAuth, resolveInstansiId]
  );

  const value = useMemo<InstituteSessionContextValue>(
    () => ({
      ...session,
      registerInstitute,
      loginInstitute,
      updateInstituteProfile: (updates) =>
        setSession((prev) => ({
          ...prev,
          ...updates,
        })),
      signOut: () => {
        void clearAuthSession();
        setSession({ ...defaultInstituteSession, isHydrating: false });
      },
    }),
    [session, registerInstitute, loginInstitute]
  );

  return (
    <InstituteSessionContext.Provider value={value}>{children}</InstituteSessionContext.Provider>
  );
}

export function useInstituteSession() {
  const context = useContext(InstituteSessionContext);
  if (!context) {
    throw new Error('useInstituteSession must be used within InstituteSessionProvider');
  }
  return context;
}
