import type { ProgramCategory } from '@/src/types/shared/program';

export type AIProgramRecommendation = {
  program_id: string;
  category: ProgramCategory;
  title: string;
  match_score: number;
  beasiswa?: Record<string, unknown>;
  olimpiade?: Record<string, unknown>;
};

export type AIRecommendationData = {
  scholarships: AIProgramRecommendation[];
  competitions: AIProgramRecommendation[];
};

export type GetAIRecommendationResponse = {
  message: string;
  data: AIRecommendationData;
};
