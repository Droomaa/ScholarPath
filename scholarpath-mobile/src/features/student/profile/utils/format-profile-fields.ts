import { EducationLevel } from '@/src/types/shared/program';

export function formatEducationLevel(level: EducationLevel | '') {
  if (level === 'SMP') return 'SMP';
  if (level === 'SMA') return 'SMA';
  return '-';
}

export function formatMajor(major: string, educationLevel: EducationLevel | '') {
  if (educationLevel === 'SMP') return '-';
  return major || '-';
}
