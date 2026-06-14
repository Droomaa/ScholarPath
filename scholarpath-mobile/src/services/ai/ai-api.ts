import { apiRequest } from '@/src/services/api/client';
import type { GetAIRecommendationResponse } from '@/src/types/shared/ai-api';

// Tambahkan argumen skill dan type dengan nilai default string kosong
export async function getAIRecommendation(token: string, skill: string = '', type: string = '') {
  // Rakit endpoint URL beserta query parameter-nya
  // encodeURIComponent memastikan spasi pada skill (misal: "UI/UX Design") aman dikirim lewat URL
  const endpoint = `/api/ai/recommendation?skill=${encodeURIComponent(skill)}&type=${encodeURIComponent(type)}`;

  // Gunakan fungsi apiRequest bawaan kalian
  return apiRequest<GetAIRecommendationResponse>(endpoint, { token });
}