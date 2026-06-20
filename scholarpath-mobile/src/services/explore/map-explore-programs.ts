import type {
  BeasiswaRecord,
  OlimpiadeRecord,
  ProgramSourceKind,
} from '@/src/types/shared/explore-api';
import type { JenjangPendidikan } from '@/src/types/shared/profile';
import type {
  EducationLevel,
  ExploreProgram,
  ProgramCategory,
  ScholarshipFunding,
} from '@/src/types/shared/program';

import { parseDeskripsi } from './parse-deskripsi';
import { resolveProgramEducationLevels } from './resolve-education-levels';
import { resolveProgramOrganizer } from './resolve-program-organizer';

const BEASISWA_IMAGE_URI =
  'https://www.figma.com/api/mcp/asset/fcb02d62-d63e-4d1c-9e39-da6ad50afe96';
const KOMPETISI_IMAGE_URI =
  'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b';

const CATEGORY_UI: Record<
  ProgramSourceKind,
  { category: ProgramCategory; categoryLabel: string; categoryTag: string; imageUri: string }
> = {
  scholarship: {
    category: 'beasiswa',
    categoryLabel: 'Beasiswa',
    categoryTag: 'BEASISWA',
    imageUri: BEASISWA_IMAGE_URI,
  },
  competition: {
    category: 'kompetisi',
    categoryLabel: 'Kompetisi',
    categoryTag: 'KOMPETISI',
    imageUri: KOMPETISI_IMAGE_URI,
  },
};

function buildJenjangLookup(jenjangList: JenjangPendidikan[]): Map<number, string> {
  return new Map(jenjangList.map((item) => [item.id, item.nama]));
}

function toSortDate(isoDate: string | undefined): number {
  if (!isoDate) {
    return 0;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function resolveProvider(
  sourceKind: ProgramSourceKind,
  title: string,
  description: string,
  tipeBeasiswa?: string | null,
  tipeLomba?: string | null
): string {
  return resolveProgramOrganizer(title, description, {
    scholarshipPath: tipeBeasiswa,
    tipeLomba,
    isCompetition: sourceKind === 'competition',
  });
}

function formatQuota(count: number, sourceKind: ProgramSourceKind): string | undefined {
  if (count <= 0) {
    return undefined;
  }

  return sourceKind === 'scholarship' ? `${count} peserta` : `${count} kuota`;
}

function resolveFunding(nominal: number | undefined): ScholarshipFunding | undefined {
  if (!nominal || nominal <= 0) {
    return undefined;
  }

  return 'Parsial';
}

export function mapBeasiswaToExploreProgram(
  record: BeasiswaRecord,
  jenjangLookup: Map<number, string>
): ExploreProgram {
  const ui = CATEGORY_UI.scholarship;
  const parsed = parseDeskripsi(record.deskripsi);

  return {
    id: `beasiswa-${record.id}`,
    title: record.nama,
    provider: resolveProvider('scholarship', record.nama, parsed.description, record.tipe_beasiswa),
    category: ui.category,
    categoryLabel: ui.categoryLabel,
    categoryTag: ui.categoryTag,
    educationLevels: resolveProgramEducationLevels(
      record.jenjang_id,
      jenjangLookup,
      record.nama,
      parsed.description
    ),
    imageUri: ui.imageUri,
    status: 'Terbuka',
    description: parsed.description,
    longDescription: parsed.longDescription,
    path: parsed.path,
    activityType: parsed.activityType,
    quota: formatQuota(record.kuota_pendaftar, 'scholarship'),
    funding: resolveFunding(record.nominal_pendanaan),
    requirements: [],
    sortDate: toSortDate(record.created_at),
    popularity: 50,
  };
}

export function mapOlimpiadeToExploreProgram(
  record: OlimpiadeRecord,
  jenjangLookup: Map<number, string>
): ExploreProgram {
  const ui = CATEGORY_UI.competition;
  const parsed = parseDeskripsi(record.deskripsi);

  const program: ExploreProgram = {
    id: `olimpiade-${record.id}`,
    title: record.judul,
    provider: resolveProvider('competition', record.judul, parsed.description, null, record.tipe_lomba),
    category: ui.category,
    categoryLabel: ui.categoryLabel,
    categoryTag: ui.categoryTag,
    educationLevels: resolveProgramEducationLevels(
      record.jenjang_id,
      jenjangLookup,
      record.judul,
      parsed.description
    ),
    imageUri: ui.imageUri,
    status: 'Terbuka',
    description: parsed.description,
    longDescription: parsed.longDescription,
    path: parsed.path,
    activityType: parsed.activityType,
    quota: formatQuota(record.kuota, 'competition'),
    requirements: [],
    sortDate: toSortDate(record.created_at),
    popularity: 50,
  };

  if (record.biaya_pendaftaran > 0) {
    program.prizeAmountIdr = record.biaya_pendaftaran;
  }

  return program;
}

export function mergeExplorePrograms(
  beasiswaList: BeasiswaRecord[],
  olimpiadeList: OlimpiadeRecord[],
  jenjangList: JenjangPendidikan[]
): ExploreProgram[] {
  const jenjangLookup = buildJenjangLookup(jenjangList);

  const scholarships = beasiswaList.map((record) =>
    mapBeasiswaToExploreProgram(record, jenjangLookup)
  );
  const competitions = olimpiadeList.map((record) =>
    mapOlimpiadeToExploreProgram(record, jenjangLookup)
  );

  return [...scholarships, ...competitions];
}
