export type ParsedProgramId =
  | { kind: 'beasiswa'; numericId: number }
  | { kind: 'olimpiade'; numericId: number };

export function parseProgramCompositeId(id: string): ParsedProgramId | null {
  const beasiswaMatch = /^beasiswa-(\d+)$/.exec(id);
  if (beasiswaMatch) {
    return { kind: 'beasiswa', numericId: Number(beasiswaMatch[1]) };
  }

  const olimpiadeMatch = /^olimpiade-(\d+)$/.exec(id);
  if (olimpiadeMatch) {
    return { kind: 'olimpiade', numericId: Number(olimpiadeMatch[1]) };
  }

  return null;
}

export function toProgramCompositeId(kind: 'beasiswa' | 'olimpiade', numericId: number): string {
  return `${kind}-${numericId}`;
}

export function parsedProgramIdToApiPayload(parsed: ParsedProgramId): {
  beasiswa_id?: number;
  olimpiade_id?: number;
} {
  if (parsed.kind === 'beasiswa') {
    return { beasiswa_id: parsed.numericId };
  }
  return { olimpiade_id: parsed.numericId };
}
