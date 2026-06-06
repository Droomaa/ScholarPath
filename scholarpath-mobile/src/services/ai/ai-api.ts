import { apiRequest } from '@/src/services/api/client';
import type { GetAIRecommendationResponse } from '@/src/types/shared/ai-api';

export async function getAIRecommendation(token: string) {
  return apiRequest<GetAIRecommendationResponse>('/api/ai/recommendation', { token });
}
