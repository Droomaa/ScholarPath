import { parseDeskripsi } from '@/src/services/explore/parse-deskripsi';
import { buildProgramId } from '@/src/services/institute/map-institute-applicants';
import type { BeasiswaRecord, OlimpiadeRecord } from '@/src/types/shared/explore-api';
import type {
  InstituteApplicant,
  InstituteProgram,
  InstituteProgramDocument,
  InstituteProgramTab,
} from '@/src/types/institute/institute';

const DEFAULT_DOCUMENTS: InstituteProgramDocument[] = [
  {
    id: 'doc-info',
    title: 'Program Information',
    description: 'Refer to the program description for required submission documents.',
    icon: 'document-text-outline',
  },
];

const CATEGORY_STYLES = [
  { tagBg: '#E1E0FF', tagColor: '#2F2EBE' },
  { tagBg: '#DAE2FD', tagColor: '#5C647A' },
  { tagBg: '#E4E1ED', tagColor: '#464554' },
] as const;

const HERO_GRADIENTS: [string, string, string][] = [
  ['#4648D4', '#6063EE', '#2F2EBE'],
  ['#6063EE', '#4648D4', '#9C48EA'],
  ['#2F2EBE', '#4648D4', '#131B2E'],
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildSyntheticDeadline(isoDate: string) {
  const base = new Date(isoDate);
  if (Number.isNaN(base.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 90);
    return fallback.toISOString();
  }

  const deadline = new Date(base);
  deadline.setDate(deadline.getDate() + 120);
  return deadline.toISOString();
}

export function countApplicantsForProgram(
  applicants: InstituteApplicant[],
  programType: 'Beasiswa' | 'Olimpiade',
  programTitle: string
) {
  const related = applicants.filter(
    (applicant) =>
      applicant.programTitle === programTitle && applicant.programType === programType
  );

  return {
    applicantCount: related.length,
    pendingCount: related.filter((item) => item.status === 'pending').length,
    acceptedCount: related.filter((item) => item.status === 'accepted').length,
    rejectedCount: related.filter((item) => item.status === 'rejected').length,
  };
}

export function deriveProgramStatus(
  verifiedBy: number | null,
  pendingCount: number,
  applicantCount: number
): InstituteProgramTab {
  if (verifiedBy == null) {
    return 'review';
  }

  if (pendingCount > 0) {
    return 'review';
  }

  if (applicantCount > 0) {
    return 'closed';
  }

  return 'active';
}

function buildPhaseLabel(status: InstituteProgramTab, pendingCount: number) {
  if (status === 'review' && pendingCount > 0) {
    return 'Pending Reviews';
  }

  if (status === 'review') {
    return 'Awaiting Verification';
  }

  if (status === 'closed') {
    return 'Review Completed';
  }

  return 'Accepting Applications';
}

function mapBeasiswaRecord(
  record: BeasiswaRecord,
  instansiId: number,
  applicants: InstituteApplicant[],
  styleIndex: number
): InstituteProgram | null {
  if (record.instansi_id !== instansiId) {
    return null;
  }

  const counts = countApplicantsForProgram(applicants, 'Beasiswa', record.nama);
  const status = deriveProgramStatus(record.verified_by, counts.pendingCount, counts.applicantCount);
  const categoryLabel = record.tipe_beasiswa?.trim() || 'Beasiswa';
  const style = CATEGORY_STYLES[styleIndex % CATEGORY_STYLES.length];
  const parsed = parseDeskripsi(record.deskripsi);

  return {
    id: `beasiswa-${record.id}`,
    legacyProgramId: buildProgramId('Beasiswa', record.nama),
    sourceKind: 'beasiswa',
    sourceNumericId: record.id,
    title: record.nama,
    categoryTag: categoryLabel.toUpperCase(),
    categoryBadgeLabel: categoryLabel,
    categoryTagBg: style.tagBg,
    categoryTagColor: style.tagColor,
    description: parsed.description,
    ...counts,
    quota: record.kuota_pendaftar > 0 ? record.kuota_pendaftar : 100,
    deadlineAt: buildSyntheticDeadline(record.updated_at || record.created_at),
    phaseLabel: buildPhaseLabel(status, counts.pendingCount),
    status,
    heroGradient: HERO_GRADIENTS[styleIndex % HERO_GRADIENTS.length],
    requiredDocuments: DEFAULT_DOCUMENTS,
    verifiedBy: record.verified_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapOlimpiadeRecord(
  record: OlimpiadeRecord,
  instansiId: number,
  applicants: InstituteApplicant[],
  styleIndex: number
): InstituteProgram | null {
  if (record.instansi_id !== instansiId) {
    return null;
  }

  const counts = countApplicantsForProgram(applicants, 'Olimpiade', record.judul);
  const status = deriveProgramStatus(record.verified_by, counts.pendingCount, counts.applicantCount);
  const categoryLabel = record.tipe_lomba?.trim() || 'Kompetisi';
  const style = CATEGORY_STYLES[styleIndex % CATEGORY_STYLES.length];
  const parsed = parseDeskripsi(record.deskripsi);

  return {
    id: `olimpiade-${record.id}`,
    legacyProgramId: buildProgramId('Olimpiade', record.judul),
    sourceKind: 'olimpiade',
    sourceNumericId: record.id,
    title: record.judul,
    categoryTag: categoryLabel.toUpperCase(),
    categoryBadgeLabel: categoryLabel,
    categoryTagBg: style.tagBg,
    categoryTagColor: style.tagColor,
    description: parsed.description,
    ...counts,
    quota: record.kuota > 0 ? record.kuota : 100,
    deadlineAt: buildSyntheticDeadline(record.updated_at || record.created_at),
    phaseLabel: buildPhaseLabel(status, counts.pendingCount),
    status,
    heroGradient: HERO_GRADIENTS[(styleIndex + 1) % HERO_GRADIENTS.length],
    requiredDocuments: DEFAULT_DOCUMENTS,
    verifiedBy: record.verified_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapInstitutePrograms(
  records: { beasiswa: BeasiswaRecord[]; olimpiade: OlimpiadeRecord[] },
  instansiId: number,
  applicants: InstituteApplicant[]
): InstituteProgram[] {
  const mapped: InstituteProgram[] = [];

  records.beasiswa.forEach((record, index) => {
    const program = mapBeasiswaRecord(record, instansiId, applicants, hashString(record.nama) + index);
    if (program) mapped.push(program);
  });

  records.olimpiade.forEach((record, index) => {
    const program = mapOlimpiadeRecord(record, instansiId, applicants, hashString(record.judul) + index);
    if (program) mapped.push(program);
  });

  return mapped.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function filterProgramsByTab(
  programs: InstituteProgram[],
  tab: InstituteProgramTab
): InstituteProgram[] {
  const filtered = programs.filter((program) => program.status === tab);

  if (tab === 'active') {
    return [...filtered].sort(
      (a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()
    );
  }

  if (tab === 'review') {
    return [...filtered].sort((a, b) => b.pendingCount - a.pendingCount);
  }

  return [...filtered].sort(
    (a, b) => new Date(b.deadlineAt).getTime() - new Date(a.deadlineAt).getTime()
  );
}

export function applicantMatchesProgram(applicant: InstituteApplicant, program: InstituteProgram) {
  const sameTitle = applicant.programTitle === program.title;
  const sameType =
    (program.sourceKind === 'beasiswa' && applicant.programType === 'Beasiswa') ||
    (program.sourceKind === 'olimpiade' && applicant.programType === 'Olimpiade');

  return (
    sameTitle &&
    sameType &&
    (applicant.programId === program.id ||
      applicant.programId === program.legacyProgramId ||
      applicant.programId === program.id.replace('-', '::'))
  );
}

export function resolveInstituteProgramError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat program institusi.';
}
