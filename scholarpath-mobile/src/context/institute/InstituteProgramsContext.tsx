import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  fetchInstituteProgramRecords,
  filterProgramsByTab,
  mapInstitutePrograms,
  resolveInstituteProgramError,
} from '@/src/services/institute';
import type { InstituteProgram, InstituteProgramTab } from '@/src/types/institute/institute';

type InstituteProgramsContextValue = {
  programs: InstituteProgram[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshPrograms: () => Promise<void>;
  getProgramById: (id: string) => InstituteProgram | undefined;
  getProgramsByTab: (tab: InstituteProgramTab) => InstituteProgram[];
  getActiveProgramsForDeadlines: (limit?: number) => InstituteProgram[];
};

const InstituteProgramsContext = createContext<InstituteProgramsContextValue | null>(null);

export function InstituteProgramsProvider({ children }: { children: ReactNode }) {
  const { token, instansiId, isAuthenticated } = useInstituteSession();
  const { applicants } = useInstituteApplicants();
  const [records, setRecords] = useState<Awaited<ReturnType<typeof fetchInstituteProgramRecords>> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const programs = useMemo(() => {
    if (!records || !instansiId) {
      return [];
    }

    return mapInstitutePrograms(records, instansiId, applicants);
  }, [records, instansiId, applicants]);

  const loadPrograms = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'silent') => {
      if (!token || !isAuthenticated || !instansiId) {
        setRecords(null);
        setError(null);
        return;
      }

      if (mode === 'initial') {
        setIsLoading(true);
      }
      if (mode === 'refresh') {
        setIsRefreshing(true);
      }

      try {
        const response = await fetchInstituteProgramRecords(token);
        setRecords(response);
        setError(null);
      } catch (err) {
        setError(resolveInstituteProgramError(err));
      } finally {
        if (mode === 'initial') {
          setIsLoading(false);
        }
        if (mode === 'refresh') {
          setIsRefreshing(false);
        }
      }
    },
    [token, isAuthenticated, instansiId]
  );

  useEffect(() => {
    if (!isAuthenticated || !token || !instansiId) {
      setRecords(null);
      setError(null);
      return;
    }

    void loadPrograms('initial');
  }, [isAuthenticated, token, instansiId, loadPrograms]);

  const refreshPrograms = useCallback(async () => {
    await loadPrograms('refresh');
  }, [loadPrograms]);

  const value = useMemo<InstituteProgramsContextValue>(
    () => ({
      programs,
      isLoading,
      isRefreshing,
      error,
      refreshPrograms,
      getProgramById: (id) =>
        programs.find(
          (program) =>
            program.id === id ||
            program.legacyProgramId === id ||
            String(program.sourceNumericId) === id
        ),
      getProgramsByTab: (tab) => filterProgramsByTab(programs, tab),
      getActiveProgramsForDeadlines: (limit = 3) =>
        filterProgramsByTab(programs, 'active').slice(0, limit),
    }),
    [programs, isLoading, isRefreshing, error, refreshPrograms]
  );

  return (
    <InstituteProgramsContext.Provider value={value}>{children}</InstituteProgramsContext.Provider>
  );
}

export function useInstitutePrograms() {
  const context = useContext(InstituteProgramsContext);
  if (!context) {
    throw new Error('useInstitutePrograms must be used within InstituteProgramsProvider');
  }
  return context;
}
