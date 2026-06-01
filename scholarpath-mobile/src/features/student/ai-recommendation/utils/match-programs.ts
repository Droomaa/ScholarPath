import { EXPLORE_PROGRAMS } from '@/src/features/student/explore/constants/explore-programs';
import { formatRupiah } from '@/src/features/student/program/utils/format-prize';
import {
  INTEREST_FIELD_OPTIONS,
  PROGRAM_GOAL_OPTIONS,
  TECHNICAL_SKILL_OPTIONS,
} from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { type AiProgramMatch, type AiWizardFormData } from '@/src/types/student/ai-recommendation';
import { type ExploreProgram, type EducationLevel } from '@/src/types/shared/program';

const INTEREST_KEYWORDS: Record<string, string[]> = {
  stem: ['informatika', 'digital', 'teknologi', 'sains', 'matematika', 'algoritma'],
  arts: ['seni', 'humaniora', 'desain', 'kreatif'],
  business: ['bisnis', 'ekonomi', 'wirausaha'],
  law: ['hukum', 'kebijakan', 'policy'],
  medicine: ['medis', 'kesehatan', 'biologi'],
  social: ['sosial', 'komunitas', 'leadership'],
  science: ['sains', 'fisika', 'kimia', 'biologi', 'penelitian'],
};

const CAREER_KEYWORDS: Record<string, string[]> = {
  research: ['penelitian', 'akademik', 'riset', 'sains'],
  industry: ['profesional', 'industri', 'karier', 'talenta'],
  entrepreneurship: ['inovasi', 'wirausaha', 'startup'],
  'public-service': ['nasional', 'kemdikbud', 'kominfo', 'pemerintah'],
  healthcare: ['medis', 'kesehatan'],
  education: ['pendidikan', 'siswa', 'sekolah'],
  engineering: ['teknologi', 'informatika', 'digital'],
  creative: ['seni', 'desain', 'kreatif'],
  technology: ['digital', 'informatika', 'teknologi', 'ti'],
  finance: ['beasiswa', 'dana', 'funding'],
  environment: ['sains', 'lingkungan', 'sustainability'],
};

function countKeywordMatches(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function buildInsight(formData: AiWizardFormData, program: ExploreProgram) {
  const interestLabels = formData.interestFields
    .map((id) => INTEREST_FIELD_OPTIONS.find((item) => item.id === id)?.label)
    .filter(Boolean)
    .slice(0, 2);

  const skillLabels = [...formData.technicalSkills, ...formData.customSkills]
    .map((id) => {
      const preset = TECHNICAL_SKILL_OPTIONS.find((item) => item.id === id);
      return preset?.label ?? id;
    })
    .slice(0, 2);

  const goalLabels = formData.programGoals
    .map((id) => PROGRAM_GOAL_OPTIONS.find((item) => item.id === id)?.label)
    .filter(Boolean)
    .slice(0, 2);

  if (interestLabels.length > 0 && skillLabels.length > 0) {
    return `Matches your focus on ${interestLabels.join(' & ')} and strengths in ${skillLabels.join(', ')}.`;
  }
  if (goalLabels.length > 0) {
    return `Aligned with your goals for ${goalLabels.join(' & ')} through ${program.title}.`;
  }
  if (program.category === 'beasiswa') {
    return `Strong fit for students seeking ${program.funding?.toLowerCase() ?? 'quality'} scholarship support.`;
  }
  return `Relevant ${program.categoryLabel.toLowerCase()} opportunity based on your profile preferences.`;
}

function scoreProgram(
  program: ExploreProgram,
  formData: AiWizardFormData,
  educationLevel: EducationLevel | ''
) {
  let score = 35;

  if (formData.opportunityTypes.includes(program.category)) {
    score += 25;
  }

  if (educationLevel && program.educationLevels.includes(educationLevel)) {
    score += 15;
  } else if (!educationLevel) {
    score += 8;
  }

  const corpus = `${program.title} ${program.description} ${program.longDescription ?? ''}`.toLowerCase();

  for (const interestId of formData.interestFields) {
    const keywords = INTEREST_KEYWORDS[interestId] ?? [];
    score += Math.min(countKeywordMatches(corpus, keywords) * 4, 12);
  }

  for (const skillId of formData.technicalSkills) {
    const skill = TECHNICAL_SKILL_OPTIONS.find((item) => item.id === skillId);
    if (!skill) continue;
    score += Math.min(countKeywordMatches(corpus, skill.description.toLowerCase().split(/,\s*/)) * 3, 9);
  }

  for (const customSkill of formData.customSkills) {
    if (corpus.includes(customSkill.toLowerCase())) {
      score += 6;
    }
  }

  if (formData.programGoals.includes('funding') && program.category === 'beasiswa') {
    score += 8;
  }
  if (formData.programGoals.includes('challenges') && program.category === 'kompetisi') {
    score += 8;
  }
  if (formData.programGoals.includes('networking')) {
    score += 4;
  }
  if (formData.programGoals.includes('mentorship') && program.category === 'beasiswa') {
    score += 4;
  }
  if (formData.programGoals.includes('global') && formData.destinationRegions.includes('international')) {
    score += 5;
  }
  if (formData.programGoals.includes('skill-growth')) {
    score += 4;
  }

  for (const careerId of formData.careerAspirations) {
    const keywords = CAREER_KEYWORDS[careerId] ?? [];
    score += Math.min(countKeywordMatches(corpus, keywords) * 3, 9);
  }

  if (formData.destinationRegions.includes('domestic')) {
    score += 3;
  }

  score += Math.min(program.popularity / 20, 5);

  return Math.min(Math.max(Math.round(score), 38), 96);
}

export function matchProgramsForUser(
  formData: AiWizardFormData,
  educationLevel: EducationLevel | ''
): AiProgramMatch[] {
  const filteredPrograms = EXPLORE_PROGRAMS.filter((program) => {
    if (formData.opportunityTypes.length === 0) return true;
    return formData.opportunityTypes.includes(program.category);
  });

  const scored = filteredPrograms
    .map((program) => ({
      programId: program.id,
      matchPercent: scoreProgram(program, formData, educationLevel),
      insight: buildInsight(formData, program),
      rank: 0,
    }))
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return scored;
}

export function getProgramRewardLabel(program: ExploreProgram) {
  if (program.category === 'beasiswa') {
    return program.funding ? `Beasiswa ${program.funding}` : 'Beasiswa';
  }
  if (program.prizeAmountIdr) {
    return formatRupiah(program.prizeAmountIdr);
  }
  return 'Hadiah Kompetisi';
}
