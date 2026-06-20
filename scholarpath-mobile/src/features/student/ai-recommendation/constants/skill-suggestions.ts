import { ALL_SKILLS } from '@/src/features/student/profile/constants/profile-options';

const EXTRA_SKILL_SUGGESTIONS = [
  'Programming',
  'Public Speaking',
  'Problem Solving',
  'Project Management',
  'Teamwork',
  'Presentation',
  'Research',
  'Writing',
  'Mathematics',
  'Statistics',
  'Web Development',
  'Mobile Development',
  'Java',
  'C++',
  'React',
  'TypeScript',
  'SQL',
  'Excel',
  'Figma',
  'Adobe Photoshop',
  'Video Production',
  'Debate',
  'Negotiation',
  'Event Planning',
  'Social Media',
  'Content Creation',
  'Analytical Thinking',
  'Time Management',
];

export const CUSTOM_SKILL_SUGGESTIONS = [
  ...new Set([...ALL_SKILLS, ...EXTRA_SKILL_SUGGESTIONS]),
].sort((a, b) => a.localeCompare(b));
