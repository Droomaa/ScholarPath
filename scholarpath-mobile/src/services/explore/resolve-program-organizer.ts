const TITLE_ORGANIZER_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /Kemendikbud|Kemdikbud/i, label: 'Kemendikbud' },
  { pattern: /\bKominfo\b/i, label: 'Kominfo' },
  { pattern: /\bBCA\b/i, label: 'BCA' },
  { pattern: /Baznas/i, label: 'Baznas' },
  { pattern: /\bLPDP\b/i, label: 'LPDP' },
  { pattern: /Puspresnas/i, label: 'Puspresnas' },
  { pattern: /\bLIPI\b/i, label: 'LIPI' },
  { pattern: /Universitas Indonesia|\bUI\b/i, label: 'Universitas Indonesia' },
  { pattern: /Universitas Gadjah Mada|\bUGM\b/i, label: 'Universitas Gadjah Mada' },
  { pattern: /\bITS\b|Institut Teknologi Sepuluh Nopember/i, label: 'ITS' },
  { pattern: /Universitas Padjadjaran|\bUnpad\b/i, label: 'Universitas Padjadjaran' },
  { pattern: /Muhammadiyah|\bNU\b/i, label: 'Organisasi Keagamaan' },
  { pattern: /Olimpiade Sains Nasional|\bOSN\b/i, label: 'Kemdikbud' },
];

const DESCRIPTION_ORGANIZER_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /Kemendikbud|Kemdikbud/i, label: 'Kemendikbud' },
  { pattern: /pemerintah/i, label: 'Kemendikbud' },
  { pattern: /\bBCA\b/i, label: 'BCA' },
  { pattern: /Baznas/i, label: 'Baznas' },
  { pattern: /\bLPDP\b/i, label: 'LPDP' },
  { pattern: /BUMN/i, label: 'BUMN' },
  { pattern: /yayasan/i, label: 'Yayasan Swasta' },
];

function matchOrganizer(text: string, patterns: Array<{ pattern: RegExp; label: string }>) {
  for (const { pattern, label } of patterns) {
    if (pattern.test(text)) {
      return label;
    }
  }

  return undefined;
}

function resolveCompetitionOrganizer(title: string, tipeLomba?: string | null): string {
  const fromTitle = matchOrganizer(title, TITLE_ORGANIZER_PATTERNS);
  if (fromTitle) {
    return fromTitle;
  }

  const lombaType = tipeLomba?.trim();
  if (lombaType) {
    return `Kompetisi ${lombaType}`;
  }

  return 'Penyelenggara Nasional';
}

export function resolveProgramOrganizer(
  title: string,
  description: string,
  options?: {
    scholarshipPath?: string | null;
    tipeLomba?: string | null;
    isCompetition?: boolean;
  }
): string {
  if (options?.isCompetition) {
    return resolveCompetitionOrganizer(title, options.tipeLomba);
  }

  const fromTitle = matchOrganizer(title, TITLE_ORGANIZER_PATTERNS);
  if (fromTitle) {
    return fromTitle;
  }

  const fromDescription = matchOrganizer(description, DESCRIPTION_ORGANIZER_PATTERNS);
  if (fromDescription) {
    return fromDescription;
  }

  const path = options?.scholarshipPath?.trim();
  if (path && path !== 'General') {
    return `Beasiswa ${path}`;
  }

  return 'Program Beasiswa Nasional';
}
