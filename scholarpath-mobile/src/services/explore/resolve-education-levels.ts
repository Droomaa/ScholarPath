import type { EducationLevel } from '@/src/types/shared/program';

function uniqueLevels(levels: EducationLevel[]): EducationLevel[] {
  return [...new Set(levels)];
}

export function resolveEducationLevelsFromJenjangName(nama?: string | null): EducationLevel[] {
  if (!nama?.trim()) {
    return ['SMA'];
  }

  const normalized = nama.trim().toUpperCase();
  const levels: EducationLevel[] = [];

  if (normalized.includes('SMP')) {
    levels.push('SMP');
  }
  if (normalized.includes('SMK')) {
    levels.push('SMK');
  }
  if (normalized.includes('SMA') || normalized.includes('SEDERAJAT')) {
    levels.push('SMA');
  }

  return levels.length > 0 ? uniqueLevels(levels) : ['SMA'];
}

export function inferEducationLevelsFromText(title?: string, description?: string): EducationLevel[] {
  const text = `${title ?? ''} ${description ?? ''}`.toUpperCase();
  const levels: EducationLevel[] = [];

  if (/\bSMP\b/.test(text)) {
    levels.push('SMP');
  }
  if (/\bSMK\b/.test(text)) {
    levels.push('SMK');
  }
  if (/\bSMA\b/.test(text) || /\bSEDERAJAT\b/.test(text)) {
    levels.push('SMA');
  }

  return uniqueLevels(levels);
}

export function resolveProgramEducationLevels(
  jenjangId: number | null | undefined,
  jenjangLookup: Map<number, string>,
  title?: string,
  description?: string
): EducationLevel[] {
  const fromJenjang = resolveEducationLevelsFromJenjangName(jenjangLookup.get(jenjangId ?? 0));
  const fromText = inferEducationLevelsFromText(title, description);

  if (fromText.length === 0) {
    return fromJenjang;
  }

  return uniqueLevels([...fromJenjang, ...fromText]);
}

export function isSmpOnlyProgram(program: { educationLevels: EducationLevel[] }): boolean {
  return program.educationLevels.length === 1 && program.educationLevels[0] === 'SMP';
}

export function filterProgramsForStudentLevel<
  T extends { educationLevels: EducationLevel[] },
>(programs: T[], educationLevel: EducationLevel | ''): T[] {
  if (educationLevel !== 'SMA' && educationLevel !== 'SMK') {
    return programs;
  }

  return programs.filter((program) => !isSmpOnlyProgram(program));
}
