import type { ExploreProgram } from '@/src/types/shared/program';

export type ProgramMetadataItem = {
  key: string;
  label: string;
  value: string;
};

const PATH_LABELS: Record<string, string> = {
  General: 'Umum',
  STEM: 'STEM',
  Creative: 'Kreatif',
  Sports: 'Olahraga',
  International: 'Internasional',
  Engineering: 'Rekayasa',
};

const ACTIVITY_LABELS: Record<string, string> = {
  Academic: 'Akademik',
  Creative: 'Kreatif',
  Sports: 'Olahraga',
};

function toLabel(value: string, labels: Record<string, string>) {
  return labels[value.trim()] ?? value.trim();
}

export function buildProgramMetadataItems(program: ExploreProgram): ProgramMetadataItem[] {
  const items: ProgramMetadataItem[] = [];

  if (program.path?.trim()) {
    items.push({
      key: 'path',
      label: 'Jalur Program',
      value: toLabel(program.path, PATH_LABELS),
    });
  }

  if (program.activityType?.trim()) {
    items.push({
      key: 'activity',
      label: 'Bidang Kegiatan',
      value: toLabel(program.activityType, ACTIVITY_LABELS),
    });
  }

  return items;
}
