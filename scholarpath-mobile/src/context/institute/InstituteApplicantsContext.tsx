import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import { buildApplicantDetail } from '@/src/features/institute/constants/institute-applicant-details';
import { ApiError } from '@/src/services/api/client';
import {
  getInstansiApplicants,
  mapApplicantStatusToStatusId,
  mapInstansiApplicantList,
  resolveInstituteApplicantError,
  updateApplicantStatus,
} from '@/src/services/institute';
import {
  type ApplicantStatus,
  type InstituteApplicant,
  type InstituteApplicantDetail,
} from '@/src/types/institute/institute';

type InstituteApplicantsContextValue = {
  applicants: InstituteApplicant[];
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdatingStatus: boolean;
  error: string | null;
  refreshApplicants: () => Promise<void>;
  getApplicantById: (id: string) => InstituteApplicant | undefined;
  getApplicantDetailById: (id: string) => InstituteApplicantDetail | undefined;
  updateApplicantStatus: (id: string, status: ApplicantStatus) => Promise<void>;
};

const InstituteApplicantsContext = createContext<InstituteApplicantsContextValue | null>(null);

export function InstituteApplicantsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useInstituteSession();
  const [applicants, setApplicants] = useState<InstituteApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplicants = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'silent') => {
      if (!token || !isAuthenticated) {
        setApplicants([]);
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
        const response = await getInstansiApplicants(token);
        setApplicants(mapInstansiApplicantList(response.data));
        setError(null);
      } catch (err) {
        setError(resolveInstituteApplicantError(err));
      } finally {
        if (mode === 'initial') {
          setIsLoading(false);
        }
        if (mode === 'refresh') {
          setIsRefreshing(false);
        }
      }
    },
    [token, isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setApplicants([]);
      setError(null);
      return;
    }

    void loadApplicants('initial');
  }, [isAuthenticated, token, loadApplicants]);

  const refreshApplicants = useCallback(async () => {
    await loadApplicants('refresh');
  }, [loadApplicants]);

  const updateApplicantStatusById = useCallback(
    async (id: string, status: ApplicantStatus) => {
      if (!token) {
        throw new ApiError('Sesi tidak valid. Silakan login kembali.', 401);
      }

      const applicant = applicants.find((item) => item.id === id);
      if (!applicant) {
        throw new ApiError('Pendaftar tidak ditemukan.', 404);
      }

      setIsUpdatingStatus(true);

      try {
        await updateApplicantStatus(token, applicant.pendaftaranId, {
          status_id: mapApplicantStatusToStatusId(status),
        });

        await loadApplicants('silent');
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [applicants, loadApplicants, token]
  );

  const value = useMemo<InstituteApplicantsContextValue>(
    () => ({
      applicants,
      isLoading,
      isRefreshing,
      isUpdatingStatus,
      error,
      refreshApplicants,
      getApplicantById: (id) => applicants.find((applicant) => applicant.id === id),
      getApplicantDetailById: (id) => {
        const applicant = applicants.find((item) => item.id === id);
        return applicant ? buildApplicantDetail(applicant) : undefined;
      },
      updateApplicantStatus: updateApplicantStatusById,
    }),
    [
      applicants,
      error,
      isLoading,
      isRefreshing,
      isUpdatingStatus,
      refreshApplicants,
      updateApplicantStatusById,
    ]
  );

  return (
    <InstituteApplicantsContext.Provider value={value}>
      {children}
    </InstituteApplicantsContext.Provider>
  );
}

export function useInstituteApplicants() {
  const context = useContext(InstituteApplicantsContext);
  if (!context) {
    throw new Error('useInstituteApplicants must be used within InstituteApplicantsProvider');
  }
  return context;
}
