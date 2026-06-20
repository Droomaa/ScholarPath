import { apiRequest } from '@/src/services/api/client';
import { login as loginRequest } from '@/src/services/auth/auth-api';
import type { LoginRequest, LoginResponse } from '@/src/types/shared/auth';
import type {
  GetInstansiByIdResponse,
  GetInstansiListResponse,
  RegisterInstansiRequest,
  RegisterInstansiResponse,
} from '@/src/types/shared/institute-api';

export async function registerInstansi(input: RegisterInstansiRequest) {
  return apiRequest<RegisterInstansiResponse>('/register/instansi', {
    method: 'POST',
    body: input,
  });
}

export async function loginInstansi(input: LoginRequest): Promise<LoginResponse> {
  return loginRequest(input);
}

export async function getAllInstansi(token: string) {
  return apiRequest<GetInstansiListResponse>('/api/instansi', { token });
}

export async function getInstansiById(token: string, instansiId: number) {
  return apiRequest<GetInstansiByIdResponse>(`/api/instansi/${instansiId}`, { token });
}
