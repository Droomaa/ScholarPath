import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { buildApplicantDetail } from '@/src/features/institute/constants/institute-applicant-details';
import { DEFAULT_INSTITUTE_APPLICANTS } from '@/src/features/institute/constants/institute-applicants';
import {
  type ApplicantStatus,
  type InstituteApplicant,
  type InstituteApplicantDetail,
} from '@/src/types/institute/institute';

type InstituteApplicantsContextValue = {
  applicants: InstituteApplicant[];
  getApplicantById: (id: string) => InstituteApplicant | undefined;
  getApplicantDetailById: (id: string) => InstituteApplicantDetail | undefined;
  updateApplicantStatus: (id: string, status: ApplicantStatus) => void;
};

const InstituteApplicantsContext = createContext<InstituteApplicantsContextValue | null>(null);

export function InstituteApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<InstituteApplicant[]>(DEFAULT_INSTITUTE_APPLICANTS);

  const value = useMemo<InstituteApplicantsContextValue>(
    () => ({
      applicants,
      getApplicantById: (id) => applicants.find((applicant) => applicant.id === id),
      getApplicantDetailById: (id) => {
        const applicant = applicants.find((item) => item.id === id);
        return applicant ? buildApplicantDetail(applicant) : undefined;
      },
      updateApplicantStatus: (id, status) =>
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === id ? { ...applicant, status } : applicant
          )
        ),
    }),
    [applicants]
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
