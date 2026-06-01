export type ScholarshipItem = {
  id: string;
  title: string;
  provider: string;
  daysLeft: string;
  matchPercent?: number;
};

export type OlympiadItem = {
  id: string;
  title: string;
  organizer: string;
  footer: string;
  level: string;
  levelColor: string;
  imageUri: string;
};

export const SCHOLARSHIP_ITEMS: ScholarshipItem[] = [
  {
    id: 'beasiswa-jaya-2026',
    title: 'Beasiswa Jaya 2026',
    provider: 'Kemdikbud',
    daysLeft: '24 Hari Lagi',
    matchPercent: 92,
  },
  {
    id: 'digital-talent-scholarship',
    title: 'Digital Talent Scholarship',
    provider: 'Kominfo',
    daysLeft: '12 Hari Lagi',
    matchPercent: 88,
  },
];

export const OLYMPIAD_ITEMS: OlympiadItem[] = [
  {
    id: 'osn-informatika-2026',
    title: 'OSN Informatika 2026',
    organizer: 'Puspresnas',
    footer: 'Registrasi Tutup: 15 Okt',
    level: 'Nasional',
    levelColor: '#BA1A1A',
    imageUri:
      'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b',
  },
  {
    id: 'kompetisi-sains-smp',
    title: 'Kompetisi Sains SMP',
    organizer: 'LIPI',
    footer: 'Gratis',
    level: 'Nasional',
    levelColor: '#4648D4',
    imageUri:
      'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b',
  },
];
