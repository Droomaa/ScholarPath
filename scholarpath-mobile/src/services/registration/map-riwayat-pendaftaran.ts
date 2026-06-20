import { getExplorePrograms } from '@/src/features/student/explore/constants/explore-programs';
import type { RiwayatPendaftaranRecord } from '@/src/types/shared/registration-api';
import type { RegistrationApplication, RegistrationStatus } from '@/src/types/shared/application';
import type { ExploreProgram } from '@/src/types/shared/program';

function mapStatusName(statusName: string | null | undefined): RegistrationStatus {
  const normalized = (statusName ?? '').toLowerCase();

  if (/terima|diterima|accept|lulus|approved/.test(normalized)) {
    return 'accepted';
  }

  if (/tolak|ditolak|reject|gagal|failed/.test(normalized)) {
    return 'rejected';
  }

  return 'review';
}

function formatSubmittedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function findProgramMatch(
  programs: ExploreProgram[],
  title: string,
  programType: string
): ExploreProgram | undefined {
  const expectedCategory = programType === 'Beasiswa' ? 'beasiswa' : 'kompetisi';

  return programs.find(
    (program) => program.title === title && program.category === expectedCategory
  );
}

function buildCategoryTag(programType: string, program?: ExploreProgram): string {
  if (program?.categoryTag) {
    return program.categoryTag;
  }

  return programType === 'Beasiswa' ? 'BEASISWA' : 'KOMPETISI';
}

function buildTimeline(status: RegistrationStatus, submittedAt: string): RegistrationApplication['timeline'] {
  if (status === 'accepted') {
    return [
      {
        title: 'Pendaftaran Dikirim',
        subtitle: `Selesai pada ${submittedAt}`,
        status: 'done',
      },
      {
        title: 'Review Penyelenggara',
        subtitle: 'Seleksi selesai',
        status: 'done',
      },
      {
        title: 'Diterima',
        subtitle: 'Selamat, kamu diterima pada program ini.',
        status: 'done',
      },
    ];
  }

  if (status === 'rejected') {
    return [
      {
        title: 'Pendaftaran Dikirim',
        subtitle: `Selesai pada ${submittedAt}`,
        status: 'done',
      },
      {
        title: 'Review Penyelenggara',
        subtitle: 'Seleksi selesai',
        status: 'done',
      },
      {
        title: 'Tidak Lolos',
        subtitle: 'Terima kasih sudah mendaftar.',
        status: 'done',
      },
    ];
  }

  return [
    {
      title: 'Pendaftaran Dikirim',
      subtitle: `Selesai pada ${submittedAt}`,
      status: 'done',
    },
    {
      title: 'Review Penyelenggara',
      subtitle: 'Tim penyelenggara memverifikasi pendaftaran',
      status: 'active',
    },
    {
      title: 'Pengumuman Hasil',
      subtitle: 'Menunggu keputusan final',
      status: 'pending',
    },
  ];
}

export function mapRiwayatToRegistration(
  record: RiwayatPendaftaranRecord,
  programs: ExploreProgram[] = getExplorePrograms()
): RegistrationApplication {
  const matchedProgram = findProgramMatch(programs, record.program_title, record.program_type);
  const status = mapStatusName(record.status_name);
  const submittedAt = formatSubmittedDate(record.tanggal_daftar);

  return {
    id: `pendaftaran-${record.pendaftaran_id}`,
    title: record.program_title,
    provider: matchedProgram?.provider ?? 'Program Nasional',
    categoryTag: buildCategoryTag(record.program_type, matchedProgram),
    programId: matchedProgram?.id,
    status,
    reviewProgress: status === 'review' ? 25 : status === 'accepted' ? 100 : 0,
    reviewLabel: record.status_name || 'Dalam review',
    submittedAt,
    updatedAt: record.tanggal_daftar,
    timeline: buildTimeline(status, submittedAt),
  };
}

export function mapRiwayatList(records: RiwayatPendaftaranRecord[]): RegistrationApplication[] {
  const programs = getExplorePrograms();
  return records.map((record) => mapRiwayatToRegistration(record, programs));
}
