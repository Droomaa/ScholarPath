import type {
  OlympiadItem,
  ScholarshipItem,
} from '@/src/features/student/home/constants/home-mock-data';
import type { ExploreProgram } from '@/src/types/shared/program';

const DEFAULT_OLYMPIAD_IMAGE =
  'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b';

export function mapProgramToScholarshipItem(program: ExploreProgram): ScholarshipItem {
  return {
    id: program.id,
    title: program.title,
    provider: program.provider,
    daysLeft: program.deadline ?? program.status ?? 'Terbuka',
  };
}

export function mapProgramToOlympiadItem(program: ExploreProgram): OlympiadItem {
  const footer =
    program.deadline ??
    program.quota ??
    (program.prizeAmountIdr && program.prizeAmountIdr > 0 ? 'Ada hadiah' : 'Terbuka');

  return {
    id: program.id,
    title: program.title,
    organizer: program.provider,
    footer,
    level: 'Nasional',
    levelColor: '#4648D4',
    imageUri: program.imageUri || DEFAULT_OLYMPIAD_IMAGE,
  };
}
