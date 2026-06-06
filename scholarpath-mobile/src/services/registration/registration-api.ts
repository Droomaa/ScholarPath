import { apiRequest } from '@/src/services/api/client';
import type {
  CreatePendaftaranRequest,
  CreatePendaftaranResponse,
  GetRiwayatPendaftaranResponse,
} from '@/src/types/shared/registration-api';

export async function createPendaftaran(token: string, body: CreatePendaftaranRequest) {
  return apiRequest<CreatePendaftaranResponse>('/api/pendaftaran', {
    method: 'POST',
    body,
    token,
  });
}

export async function getRiwayatPendaftaran(token: string) {
  return apiRequest<GetRiwayatPendaftaranResponse>('/api/user/pendaftaran', { token });
}
