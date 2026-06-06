import { parseKeahlian } from '@/src/services/profile/map-profile';
import type { ApplicantStatus, InstituteApplicant, InstituteProgram } from '@/src/types/institute/institute';
import type { InstansiApplicantRecord } from '@/src/types/shared/institute-api';

/**
 * Maps to rows in `status_pendaftarans`. Verify IDs against your database if accept/reject
 * does not update student history as expected.
 */
export const INSTITUTE_PENDAFTARAN_STATUS = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
} as const;

export function buildProgramId(programType: string, programTitle: string): string {
  const kind = programType === 'Beasiswa' ? 'beasiswa' : 'olimpiade';
  return `${kind}::${programTitle.trim()}`;
}

export function mapStatusIdToApplicantStatus(statusId: number | null | undefined): ApplicantStatus {
  if (statusId === INSTITUTE_PENDAFTARAN_STATUS.ACCEPTED) {
    return 'accepted';
  }

  if (statusId === INSTITUTE_PENDAFTARAN_STATUS.REJECTED) {
    return 'rejected';
  }

  return 'pending';
}

export function mapApplicantStatusToStatusId(status: ApplicantStatus): number {
  if (status === 'accepted') {
    return INSTITUTE_PENDAFTARAN_STATUS.ACCEPTED;
  }

  if (status === 'rejected') {
    return INSTITUTE_PENDAFTARAN_STATUS.REJECTED;
  }

  return INSTITUTE_PENDAFTARAN_STATUS.PENDING;
}

export function mapInstansiApplicantRecord(record: InstansiApplicantRecord): InstituteApplicant {
  const parsed = parseKeahlian(record.keahlian ?? '');
  const major =
    parsed.major ||
    parsed.interests[0] ||
    (record.program_type === 'Beasiswa' ? 'Beasiswa' : 'Kompetisi');

  return {
    id: `pendaftaran-${record.pendaftaran_id}`,
    pendaftaranId: record.pendaftaran_id,
    name: record.student_name,
    major,
    programId: buildProgramId(record.program_type, record.program_title),
    programTitle: record.program_title,
    programType: record.program_type,
    status: mapStatusIdToApplicantStatus(record.status_id),
    statusId: record.status_id,
    studentEmail: record.student_email,
    keahlian: record.keahlian,
    studentRegistrationId: `pendaftaran-${record.pendaftaran_id}`,
    submittedAt: record.tanggal_daftar,
  };
}

export function mapInstansiApplicantList(records: InstansiApplicantRecord[]): InstituteApplicant[] {
  return records.map(mapInstansiApplicantRecord);
}

export function buildApplicantProgramFilters(
  applicants: InstituteApplicant[],
  programs: InstituteProgram[] = []
) {
  const programMap = new Map<string, string>();

  programs.forEach((program) => {
    programMap.set(program.id, program.title);
  });

  applicants.forEach((applicant) => {
    if (!programMap.has(applicant.programId)) {
      programMap.set(applicant.programId, applicant.programTitle);
    }
  });

  return [
    { id: 'all', label: 'All Programs' },
    ...Array.from(programMap.entries()).map(([id, title]) => ({
      id,
      label: title.length > 18 ? `${title.slice(0, 16)}…` : title,
    })),
  ];
}

export function getApplicantListStats(applicants: InstituteApplicant[]) {
  const uniquePrograms = new Set(applicants.map((applicant) => applicant.programId)).size;

  return {
    totalApplicants: applicants.length,
    pendingReviews: applicants.filter((applicant) => applicant.status === 'pending').length,
    activeProgramsCount: uniquePrograms,
  };
}

export function resolveInstituteApplicantError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat data pendaftar.';
}
