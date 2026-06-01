import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type InterestFieldOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: 'ionicons' | 'material';
};

export type TechnicalSkillOption = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: 'ionicons' | 'material';
};

export type ProgramGoalOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: 'ionicons' | 'material';
};

export type CareerAspirationOption = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: 'ionicons' | 'material';
};

export const INTEREST_FIELD_OPTIONS: InterestFieldOption[] = [
  { id: 'stem', label: 'STEM', icon: 'flask-outline', iconFamily: 'ionicons' },
  { id: 'arts', label: 'Arts & Humanities', icon: 'color-palette-outline', iconFamily: 'ionicons' },
  { id: 'business', label: 'Business', icon: 'cash-outline', iconFamily: 'ionicons' },
  { id: 'law', label: 'Law & Policy', icon: 'scale-outline', iconFamily: 'ionicons' },
  { id: 'medicine', label: 'Medicine', icon: 'medkit-outline', iconFamily: 'ionicons' },
  { id: 'social', label: 'Social Sciences', icon: 'people-outline', iconFamily: 'ionicons' },
  { id: 'science', label: 'Science', icon: 'planet-outline', iconFamily: 'ionicons' },
];

export const TECHNICAL_SKILL_OPTIONS: TechnicalSkillOption[] = [
  {
    id: 'software',
    label: 'Software Development',
    description: 'Coding, Algorithms, Data Science',
    icon: 'code-slash-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'design',
    label: 'Visual Arts & UX',
    description: 'Digital Design, UI/UX, Fine Arts',
    icon: 'color-palette-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'research',
    label: 'Research & Analysis',
    description: 'Data Interpretation, Academic Writing',
    icon: 'analytics-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'leadership',
    label: 'Leadership & Communication',
    description: 'Public Speaking, Team Management',
    icon: 'megaphone-outline',
    iconFamily: 'ionicons',
  },
];

export const PROGRAM_GOAL_OPTIONS: ProgramGoalOption[] = [
  { id: 'funding', label: 'Funding', icon: 'cash-outline', iconFamily: 'ionicons' },
  { id: 'challenges', label: 'Challenges', icon: 'trophy-outline', iconFamily: 'ionicons' },
  { id: 'networking', label: 'Networking', icon: 'git-network-outline', iconFamily: 'ionicons' },
  { id: 'mentorship', label: 'Mentorship', icon: 'school-outline', iconFamily: 'ionicons' },
  { id: 'global', label: 'Global Reach', icon: 'earth-outline', iconFamily: 'ionicons' },
  { id: 'skill-growth', label: 'Skill Growth', icon: 'trending-up-outline', iconFamily: 'ionicons' },
];

export const PRIMARY_CAREER_OPTIONS: CareerAspirationOption[] = [
  {
    id: 'research',
    label: 'Research & Academia',
    description: 'Driving innovation through deep academic inquiry.',
    icon: 'flask-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'industry',
    label: 'Industry Professional',
    description: 'Leading in corporate or professional services.',
    icon: 'office-building-outline',
    iconFamily: 'material',
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    description: 'Building new ventures and scaling impact.',
    icon: 'rocket-outline',
    iconFamily: 'ionicons',
  },
];

export const MORE_CAREER_OPTIONS: CareerAspirationOption[] = [
  {
    id: 'public-service',
    label: 'Public Service',
    description: 'Serving communities through government and policy work.',
    icon: 'account-group-outline',
    iconFamily: 'material',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Improving lives through medical and health sciences.',
    icon: 'medical-bag',
    iconFamily: 'material',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Teaching and shaping the next generation.',
    icon: 'book-education-outline',
    iconFamily: 'material',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Designing solutions for real-world problems.',
    icon: 'cog-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'creative',
    label: 'Creative Industries',
    description: 'Expressing ideas through media, art, and design.',
    icon: 'brush-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'technology',
    label: 'Technology',
    description: 'Building digital products and innovation.',
    icon: 'laptop-outline',
    iconFamily: 'ionicons',
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Managing capital, markets, and economic growth.',
    icon: 'chart-line',
    iconFamily: 'material',
  },
  {
    id: 'environment',
    label: 'Environmental Science',
    description: 'Protecting ecosystems and sustainability.',
    icon: 'leaf-outline',
    iconFamily: 'ionicons',
  },
];

export const OPPORTUNITY_TYPE_OPTIONS = [
  {
    id: 'beasiswa' as const,
    label: 'Beasiswa',
    description: 'Dana pendidikan, biaya hidup, & riset.',
    icon: 'school-outline' as const,
  },
  {
    id: 'kompetisi' as const,
    label: 'Kompetisi',
    description: 'Lomba akademik, hibah, & penghargaan.',
    icon: 'trophy-outline' as const,
  },
];

export const DESTINATION_OPTIONS = [
  {
    id: 'domestic' as const,
    label: 'Dalam Negeri',
    description: 'Universitas di Indonesia saja.',
    icon: 'home-outline' as const,
  },
  {
    id: 'international' as const,
    label: 'Luar Negeri',
    description: 'Peluang studi di kancah internasional.',
    icon: 'earth-outline' as const,
  },
];
