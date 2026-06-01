import { INSTITUTE_PROGRAMS } from '@/src/features/institute/constants/institute-programs';
import { type ApplicantStatus, type InstituteApplicant } from '@/src/types/institute/institute';

export const DEFAULT_INSTITUTE_APPLICANTS: InstituteApplicant[] = [
  {
    id: 'app-1',
    name: 'Andi Saputra',
    major: 'Science',
    programId: 'prog-tech-innovators',
    programTitle: 'Tech Innovators Grant',
    status: 'pending',
    isOnline: true,
    studentRegistrationId: 'reg-tech-andi',
  },
  {
    id: 'app-2',
    name: 'Siti Rahmawati',
    major: 'Language',
    programId: 'prog-leadership-award',
    programTitle: 'Global Leadership Award',
    status: 'accepted',
  },
  {
    id: 'app-3',
    name: 'Budi Hartono',
    major: 'Social',
    programId: 'prog-women-stem',
    programTitle: 'Women in STEM 2024',
    status: 'rejected',
  },
  {
    id: 'app-4',
    name: 'Dewi Lestari',
    major: 'STEM',
    programId: 'prog-stem-fellowship',
    programTitle: 'STEM Research Fellowship',
    status: 'pending',
    studentRegistrationId: 'reg-stem-dewi',
  },
  {
    id: 'app-5',
    name: 'Amara Syarianti',
    major: 'STEM',
    programId: 'prog-stem-fellowship',
    programTitle: 'STEM Research Fellowship',
    status: 'pending',
    studentRegistrationId: 'reg-stem-amara',
  },
  {
    id: 'app-6',
    name: 'Maya Anggraini',
    major: 'Arts',
    programId: 'prog-digital-leadership',
    programTitle: 'Digital Leadership Program',
    status: 'accepted',
  },
  {
    id: 'app-7',
    name: 'Fajar Nugroho',
    major: 'Science',
    programId: 'prog-tech-innovators',
    programTitle: 'Tech Innovators Grant',
    status: 'pending',
    studentRegistrationId: 'reg-tech-fajar',
  },
  {
    id: 'app-8',
    name: 'Putri Maharani',
    major: 'Social',
    programId: 'prog-leadership-award',
    programTitle: 'Global Leadership Award',
    status: 'pending',
    studentRegistrationId: 'reg-leadership-putri',
  },
];

export const APPLICANT_PROGRAM_FILTERS = [
  { id: 'all', label: 'All Programs' },
  ...INSTITUTE_PROGRAMS.map((program) => ({
    id: program.id,
    label: program.title.length > 18 ? `${program.title.slice(0, 16)}…` : program.title,
  })),
];

export function filterApplicants(
  applicants: InstituteApplicant[],
  options: {
  status?: ApplicantStatus | 'all';
  programId?: string;
  query?: string;
}) {
  const { status = 'all', programId, query = '' } = options;

  return applicants.filter((applicant) => {
    if (status !== 'all' && applicant.status !== status) return false;
    if (programId && programId !== 'all' && applicant.programId !== programId) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        applicant.name.toLowerCase().includes(q) ||
        applicant.programTitle.toLowerCase().includes(q) ||
        applicant.major.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export function getInstituteStats(applicants: InstituteApplicant[] = DEFAULT_INSTITUTE_APPLICANTS) {
  const totalApplicants = applicants.length;
  const pendingReviews = applicants.filter((a) => a.status === 'pending').length;
  const accepted = applicants.filter((a) => a.status === 'accepted').length;
  const activePrograms = 3;

  return {
    activePrograms,
    totalApplicants: 1248,
    pendingReviews: 56,
    accepted: 218,
    activeProgramsCount: activePrograms,
    displayedApplicants: totalApplicants,
  };
}

export function getApplicantById(id: string, applicants: InstituteApplicant[] = DEFAULT_INSTITUTE_APPLICANTS) {
  return applicants.find((applicant) => applicant.id === id);
}

/** @deprecated Use useInstituteApplicants().applicants for live status updates */
export const INSTITUTE_APPLICANTS = DEFAULT_INSTITUTE_APPLICANTS;
