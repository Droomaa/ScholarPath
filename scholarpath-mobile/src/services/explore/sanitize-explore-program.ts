import type { ExploreProgram } from '@/src/types/shared/program';

import { parseDeskripsi } from './parse-deskripsi';
import { resolveProgramOrganizer } from './resolve-program-organizer';

const METADATA_TAG_PATTERN = /\[(Path|Activity):/i;

export function isDisplayableMetric(value?: string | null): boolean {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== '-');
}

export function getUserFacingDescription(text?: string): string {
  if (!text?.trim()) {
    return '';
  }

  const parsed = parseDeskripsi(text);
  const cleaned = parsed.longDescription || parsed.description;

  return cleaned
    .replace(/\[Path:\s*[^\]]+\]/gi, '')
    .replace(/\[Activity:\s*[^\]]+\]/gi, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

export function sanitizeExploreProgram(program: ExploreProgram): ExploreProgram {
  const rawDescription = program.longDescription ?? program.description ?? '';
  const parsed = METADATA_TAG_PATTERN.test(rawDescription)
    ? parseDeskripsi(rawDescription)
    : null;

  const description = parsed?.description ?? program.description ?? '';
  const provider =
    !program.provider?.trim() || program.provider.trim() === 'General'
      ? resolveProgramOrganizer(program.title, description, {
          scholarshipPath: program.path,
          isCompetition: program.category === 'kompetisi',
        })
      : program.provider;

  return {
    ...program,
    provider,
    description,
    longDescription: parsed?.longDescription ?? program.longDescription,
    path: program.path ?? parsed?.path,
    activityType: program.activityType ?? parsed?.activityType,
    deadline: isDisplayableMetric(program.deadline) ? program.deadline : undefined,
    quota: isDisplayableMetric(program.quota) ? program.quota : undefined,
  };
}
