import { CategoryOption, ProfileCategory } from '../types/student-profile';

export const EDUCATION_LEVELS = ['SMP', 'SMA', 'SMK'] as const;

export const SMA_MAJORS = ['IPA', 'IPS', 'Bahasa'] as const;

export const SMK_MAJORS = [
  'RPL (Rekayasa Perangkat Lunak)',
  'TKJ (Teknik Komputer dan Jaringan)',
  'DKV (Desain Komunikasi Visual)',
  'Multimedia',
  'Akuntansi',
  'Manajemen Perkantoran',
  'Pemasaran',
  'Tata Boga',
  'Perhotelan',
] as const;

export type MajorOption = (typeof SMA_MAJORS)[number] | (typeof SMK_MAJORS)[number];

export function getMajorOptions(educationLevel: string): readonly string[] {
  if (educationLevel === 'SMA') return SMA_MAJORS;
  if (educationLevel === 'SMK') return SMK_MAJORS;
  return [];
}

export function requiresMajor(educationLevel: string): boolean {
  return educationLevel === 'SMA' || educationLevel === 'SMK';
}

export const PROFILE_CATEGORIES: CategoryOption[] = [
  { id: 'science', label: 'Science' },
  { id: 'stem', label: 'STEM' },
  { id: 'socio', label: 'Socio' },
  { id: 'arts', label: 'Arts' },
  { id: 'sport', label: 'Sport' },
];

export const INTERESTS_BY_CATEGORY: Record<ProfileCategory, string[]> = {
  science: [
    'Biology',
    'Physics',
    'Chemistry',
    'Environmental Science',
    'Astronomy',
    'Geology',
  ],
  stem: [
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'UI/UX Design',
    'Data Science',
    'Robotics',
    'Software Engineering',
    'Mobile Development',
  ],
  socio: [
    'Psychology',
    'Economics',
    'Sociology',
    'Political Science',
    'History',
    'Geography',
    'International Relations',
  ],
  arts: [
    'Fine Arts',
    'Music',
    'Literature',
    'Graphic Design',
    'Photography',
    'Film & Animation',
    'Creative Writing',
  ],
  sport: [
    'Football',
    'Basketball',
    'Swimming',
    'Athletics',
    'Martial Arts',
    'Esports',
    'Volleyball',
  ],
};

export const SKILLS_BY_CATEGORY: Record<ProfileCategory, string[]> = {
  science: [
    'Lab Research',
    'Scientific Writing',
    'Experiment Design',
    'Data Collection',
    'Critical Analysis',
  ],
  stem: [
    'Python',
    'JavaScript',
    'Data Analysis',
    'Cloud Computing',
    'UI/UX Design',
    'Machine Learning',
    'Database Management',
  ],
  socio: [
    'Public Speaking',
    'Critical Thinking',
    'Leadership',
    'Communication',
    'Negotiation',
    'Research Methods',
  ],
  arts: [
    'Graphic Design',
    'Video Editing',
    'Creative Writing',
    'Photography',
    'Music Production',
    'Storytelling',
  ],
  sport: [
    'Team Management',
    'Physical Training',
    'Coaching',
    'Strategic Planning',
    'Discipline & Focus',
    'Esports Strategy',
  ],
};

export const ALL_INTERESTS = PROFILE_CATEGORIES.flatMap(
  (category) => INTERESTS_BY_CATEGORY[category.id]
);

export const ALL_SKILLS = PROFILE_CATEGORIES.flatMap(
  (category) => SKILLS_BY_CATEGORY[category.id]
);
