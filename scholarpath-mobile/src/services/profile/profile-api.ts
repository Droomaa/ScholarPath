import { apiRequest } from '@/src/services/api/client';
import type {
  GetJenjangResponse,
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/src/types/shared/profile';

export async function getProfile(token: string) {
  return apiRequest<GetProfileResponse>('/api/user/profile', { token });
}

export async function updateProfile(token: string, body: UpdateProfileRequest) {
  return apiRequest<UpdateProfileResponse>('/api/user/profile', {
    method: 'PUT',
    body,
    token,
  });
}

let jenjangCache: GetJenjangResponse['data'] | null = null;

export async function getJenjangList(token: string, refresh = false) {
  if (!refresh && jenjangCache) {
    return jenjangCache;
  }

  const response = await apiRequest<GetJenjangResponse>('/api/jenjang', { token });
  jenjangCache = response.data ?? [];
  return jenjangCache;
}

export function clearJenjangCache() {
  jenjangCache = null;
}
