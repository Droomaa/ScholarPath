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
import { ApiError } from '@/src/services/api/client';
import {
  getInstansiApplicantDetail,
  getInstansiApplicants,
  mapApplicantStatusToStatusId,
  mapInstansiApplicantDetail,
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
  applicantDetails: Record<string, InstituteApplicantDetail>;
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdatingStatus: boolean;
  isLoadingDetail: boolean;
  detailError: string | null;
  error: string | null;
  refreshApplicants: () => Promise<void>;
  getApplicantById: (id: string) => InstituteApplicant | undefined;
  getApplicantDetailById: (id: string) => InstituteApplicantDetail | undefined;
  loadApplicantDetail: (id: string) => Promise<void>;
  updateApplicantStatus: (id: string, status: ApplicantStatus) => Promise<void>;
};

const InstituteApplicantsContext = createContext<InstituteApplicantsContextValue | null>(null);

export function InstituteApplicantsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useInstituteSession();
  const [applicants, setApplicants] = useState<InstituteApplicant[]>([]);
  const [applicantDetails, setApplicantDetails] = useState<Record<string, InstituteApplicantDetail>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplicants = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'silent') => {
      if (!token || !isAuthenticated) {
        setApplicants([]);
        setApplicantDetails({});
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
      setApplicantDetails({});
      setError(null);
      return;
    }

    void loadApplicants('initial');
  }, [isAuthenticated, token, loadApplicants]);

  const refreshApplicants = useCallback(async () => {
    await loadApplicants('refresh');
  }, [loadApplicants]);

  const loadApplicantDetail = useCallback(
    async (id: string) => {
      if (!token) {
        setDetailError('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const applicant = applicants.find((item) => item.id === id);
      if (!applicant) {
        setDetailError('Pendaftar tidak ditemukan.');
        return;
      }

      setIsLoadingDetail(true);
      setDetailError(null);

      try {
        const response = await getInstansiApplicantDetail(token, applicant.pendaftaranId);
        const detail = mapInstansiApplicantDetail(response.data);
        setApplicantDetails((current) => ({ ...current, [id]: detail }));
      } catch (err) {
        setDetailError(resolveInstituteApplicantError(err));
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [applicants, token]
  );

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
        setApplicantDetails((current) => {
          const existing = current[id];
          if (!existing) {
            return current;
          }

          return {
            ...current,
            [id]: {
              ...existing,
              status,
              statusId: mapApplicantStatusToStatusId(status),
            },
          };
        });
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [applicants, loadApplicants, token]
  );

  const value = useMemo<InstituteApplicantsContextValue>(
    () => ({
      applicants,
      applicantDetails,
      isLoading,
      isRefreshing,
      isUpdatingStatus,
      isLoadingDetail,
      detailError,
      error,
      refreshApplicants,
      getApplicantById: (id) => applicants.find((applicant) => applicant.id === id),
      getApplicantDetailById: (id) => applicantDetails[id],
      loadApplicantDetail,
      updateApplicantStatus: updateApplicantStatusById,
    }),
    [
      applicantDetails,
      applicants,
      detailError,
      error,
      isLoading,
      isLoadingDetail,
      isRefreshing,
      isUpdatingStatus,
      loadApplicantDetail,
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
