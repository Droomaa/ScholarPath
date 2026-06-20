import { ApiError } from '@/src/services/api/client';
import { buildInsight } from '@/src/features/student/ai-recommendation/utils/match-programs';
import {
  getProgramById,
  upsertProgramInCache,
} from '@/src/features/student/explore/constants/explore-programs';
import type { AiProgramMatch, AiWizardFormData } from '@/src/types/student/ai-recommendation';
import type { AIProgramRecommendation, AIRecommendationData } from '@/src/types/shared/ai-api';
import type { ExploreProgram, ProgramCategory } from '@/src/types/shared/program';

const BEASISWA_IMAGE_URI =
  'https://www.figma.com/api/mcp/asset/fcb02d62-d63e-4d1c-9e39-da6ad50afe96';
const KOMPETISI_IMAGE_URI =
  'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b';

export function resolveAiMatchingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return error.message || 'Lengkapi profil keahlian Anda terlebih dahulu.';
    }
    if (error.status === 401) {
      return 'Sesi login berakhir. Silakan login kembali.';
    }
    if (error.status === 502) {
      return 'Layanan AI tidak tersedia. Pastikan layanan AI berjalan dan coba lagi.';
    }
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat rekomendasi AI.';
}

function buildFallbackProgram(item: AIProgramRecommendation): ExploreProgram {
  const isBeasiswa = item.category === 'beasiswa';

  return {
    id: item.program_id,
    title: item.title,
    provider: 'Program Nasional',
    category: item.category,
    categoryLabel: isBeasiswa ? 'Beasiswa' : 'Kompetisi',
    categoryTag: isBeasiswa ? 'BEASISWA' : 'KOMPETISI',
    educationLevels: ['SMA'],
    imageUri: isBeasiswa ? BEASISWA_IMAGE_URI : KOMPETISI_IMAGE_URI,
    status: 'Terbuka',
    description: '',
    requirements: [],
    sortDate: 0,
    popularity: 50,
  };
}

function resolveProgramForInsight(item: AIProgramRecommendation): ExploreProgram {
  const cached = getProgramById(item.program_id);
  if (cached) {
    return cached;
  }

  const fallback = buildFallbackProgram(item);
  upsertProgramInCache(fallback);
  return fallback;
}

function toAiProgramMatch(
  item: AIProgramRecommendation,
  formData: AiWizardFormData,
  rank: number
): AiProgramMatch {
  const program = resolveProgramForInsight(item);

  return {
    programId: item.program_id,
    matchPercent: Math.round(item.match_score),
    insight: buildInsight(formData, program),
    rank,
  };
}

function shouldIncludeCategory(
  category: ProgramCategory,
  opportunityTypes: ProgramCategory[]
): boolean {
  if (opportunityTypes.length === 0) {
    return true;
  }

  return opportunityTypes.includes(category);
}

export function mapAiRecommendations(
  data: AIRecommendationData,
  formData: AiWizardFormData,
  opportunityTypes: ProgramCategory[]
): AiProgramMatch[] {
  const results: AiProgramMatch[] = [];

  if (shouldIncludeCategory('beasiswa', opportunityTypes)) {
    data.scholarships.forEach((item, index) => {
      results.push(toAiProgramMatch(item, formData, index + 1));
    });
  }

  if (shouldIncludeCategory('kompetisi', opportunityTypes)) {
    data.competitions.forEach((item, index) => {
      results.push(toAiProgramMatch(item, formData, index + 1));
    });
  }

  return results;
}
