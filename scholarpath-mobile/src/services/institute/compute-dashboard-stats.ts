import type { InstituteApplicant, InstituteProgram } from '@/src/types/institute/institute';

export type InstituteDashboardStats = {
  totalPrograms: number;
  activePrograms: number;
  totalApplicants: number;
  pendingApplicants: number;
  acceptedApplicants: number;
  rejectedApplicants: number;
};

export function computeInstituteDashboardStats(
  programs: InstituteProgram[],
  applicants: InstituteApplicant[]
): InstituteDashboardStats {
  return {
    totalPrograms: programs.length,
    activePrograms: programs.filter((program) => program.status === 'active').length,
    totalApplicants: applicants.length,
    pendingApplicants: applicants.filter((applicant) => applicant.status === 'pending').length,
    acceptedApplicants: applicants.filter((applicant) => applicant.status === 'accepted').length,
    rejectedApplicants: applicants.filter((applicant) => applicant.status === 'rejected').length,
  };
}
