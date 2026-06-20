import { apiRequest } from '@/src/services/api/client';
import type {
  GetBeasiswaListResponse,
  GetOlimpiadeListResponse,
} from '@/src/types/shared/explore-api';

export async function fetchInstituteProgramRecords(token: string) {
  const [beasiswaResponse, olimpiadeResponse] = await Promise.all([
    apiRequest<GetBeasiswaListResponse>('/api/beasiswa', { token }),
    apiRequest<GetOlimpiadeListResponse>('/api/olimpiade', { token }),
  ]);

  return {
    beasiswa: beasiswaResponse.data ?? [],
    olimpiade: olimpiadeResponse.data ?? [],
  };
}
