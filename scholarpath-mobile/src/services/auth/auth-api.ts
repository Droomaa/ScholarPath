import { apiRequest } from '@/src/services/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterSiswaRequest,
  RegisterSiswaResponse,
} from '@/src/types/shared/auth';

export async function registerSiswa(input: RegisterSiswaRequest): Promise<RegisterSiswaResponse> {
  return apiRequest<RegisterSiswaResponse>('/register/siswa', {
    method: 'POST',
    body: input,
  });
}

export async function login(input: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: input,
  });
}
