import { useEffect, useMemo, useState } from 'react';

import { useExplorePrograms } from '@/src/context/student/ExploreProgramsContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  getProgramById,
  MOCK_EXPLORE_PROGRAMS,
  upsertProgramInCache,
} from '@/src/features/student/explore/constants/explore-programs';
import { fetchProgramById } from '@/src/services/explore';
import { sanitizeExploreProgram } from '@/src/services/explore/sanitize-explore-program';
import type { ExploreProgram } from '@/src/types/shared/program';

type UseProgramByIdResult = {
  program: ExploreProgram | undefined;
  isLoading: boolean;
  error: string | null;
};

export function useProgramById(programId: string): UseProgramByIdResult {
  const { token } = useStudentSession();
  const { programs, isLoading: isExploreLoading } = useExplorePrograms();
  const [fetchedProgram, setFetchedProgram] = useState<ExploreProgram | undefined>();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cachedProgram = useMemo(() => {
    const fromExplore = programs.find((item) => item.id === programId);
    if (fromExplore) {
      return fromExplore;
    }
    return getProgramById(programId);
  }, [programId, programs]);

  useEffect(() => {
    if (!programId || cachedProgram) {
      setFetchedProgram(undefined);
      setError(null);
      setIsFetching(false);
      return;
    }

    if (!token) {
      const mockProgram = MOCK_EXPLORE_PROGRAMS.find((item) => item.id === programId);
      setFetchedProgram(mockProgram);
      setError(mockProgram ? null : 'Program tidak ditemukan.');
      setIsFetching(false);
      return;
    }

    let cancelled = false;

    const loadProgram = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const program = await fetchProgramById(token, programId);
        if (cancelled) {
          return;
        }

        if (!program) {
          const mockProgram = MOCK_EXPLORE_PROGRAMS.find((item) => item.id === programId);
          setFetchedProgram(mockProgram);
          setError(mockProgram ? null : 'Program tidak ditemukan.');
          return;
        }

        upsertProgramInCache(program);
        setFetchedProgram(program);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const mockProgram = MOCK_EXPLORE_PROGRAMS.find((item) => item.id === programId);
        setFetchedProgram(mockProgram);
        setError(
          mockProgram
            ? null
            : loadError instanceof Error
              ? loadError.message
              : 'Gagal memuat program.'
        );
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    };

    void loadProgram();

    return () => {
      cancelled = true;
    };
  }, [cachedProgram, programId, token]);

  const program = useMemo(() => {
    const raw = cachedProgram ?? fetchedProgram;
    return raw ? sanitizeExploreProgram(raw) : undefined;
  }, [cachedProgram, fetchedProgram]);
  const isLoading = !program && (isExploreLoading || isFetching);

  return {
    program,
    isLoading,
    error: program ? null : error,
  };
}
