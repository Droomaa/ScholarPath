import { INSTITUTE_PROGRAMS } from '@/src/features/institute/constants/institute-programs';
import { getInstituteStats } from '@/src/features/institute/constants/institute-applicants';

export type InstituteProfileStats = {
  activePrograms: number;
  publishedPrograms: number;
  totalApplicants: number;
};

export function getInstituteProfileStats(): InstituteProfileStats {
  const stats = getInstituteStats();

  return {
    activePrograms: INSTITUTE_PROGRAMS.filter((program) => program.status === 'active').length,
    publishedPrograms: INSTITUTE_PROGRAMS.length,
    totalApplicants: stats.totalApplicants,
  };
}
