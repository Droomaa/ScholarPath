import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  getExplorePrograms,
  resetExploreProgramCache,
  setExploreProgramCache,
} from '@/src/features/student/explore/constants/explore-programs';
import { fetchExplorePrograms } from '@/src/services/explore';
import { sanitizeExploreProgram } from '@/src/services/explore/sanitize-explore-program';
import type { ExploreProgram } from '@/src/types/shared/program';

type ExploreProgramsContextValue = {
  programs: ExploreProgram[];
  isLoading: boolean;
  isUsingFallback: boolean;
  refresh: () => Promise<void>;
};

const ExploreProgramsContext = createContext<ExploreProgramsContextValue | null>(null);

export function ExploreProgramsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useStudentSession();
  const [programs, setPrograms] = useState<ExploreProgram[]>(() => getExplorePrograms());
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  const loadPrograms = useCallback(
    async (refreshJenjang = false) => {
      if (!token) {
        resetExploreProgramCache();
        setPrograms(getExplorePrograms());
        setIsUsingFallback(true);
        return;
      }

      setIsLoading(true);

      try {
        const nextPrograms = await fetchExplorePrograms(token, refreshJenjang);
        const sanitizedPrograms = nextPrograms.map(sanitizeExploreProgram);
        setExploreProgramCache(sanitizedPrograms);
        setPrograms(sanitizedPrograms);
        setIsUsingFallback(false);
      } catch {
        resetExploreProgramCache();
        setPrograms(getExplorePrograms());
        setIsUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      void loadPrograms(false);
      return;
    }

    resetExploreProgramCache();
    setPrograms(getExplorePrograms());
    setIsUsingFallback(true);
  }, [isAuthenticated, token, loadPrograms]);

  const refresh = useCallback(async () => {
    await loadPrograms(true);
  }, [loadPrograms]);

  const value = useMemo<ExploreProgramsContextValue>(
    () => ({
      programs,
      isLoading,
      isUsingFallback,
      refresh,
    }),
    [programs, isLoading, isUsingFallback, refresh]
  );

  return (
    <ExploreProgramsContext.Provider value={value}>{children}</ExploreProgramsContext.Provider>
  );
}

export function useExplorePrograms() {
  const context = useContext(ExploreProgramsContext);
  if (!context) {
    throw new Error('useExplorePrograms must be used within ExploreProgramsProvider');
  }
  return context;
}
