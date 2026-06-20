import type { InstituteApplicant, InstituteProgram } from '@/src/types/institute/institute';

export type InstituteProfileStats = {
  activePrograms: number;
  publishedPrograms: number;
  totalApplicants: number;
};

export function getInstituteProfileStats(
  programs: InstituteProgram[],
  applicants: InstituteApplicant[]
): InstituteProfileStats {
  return {
    activePrograms: programs.filter((program) => program.status === 'active').length,
    publishedPrograms: programs.length,
    totalApplicants: applicants.length,
  };
}
