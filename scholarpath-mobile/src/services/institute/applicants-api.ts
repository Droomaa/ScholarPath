import { apiRequest } from '@/src/services/api/client';
import type {
  GetInstansiApplicantsResponse,
  UpdateApplicantStatusRequest,
  UpdateApplicantStatusResponse,
} from '@/src/types/shared/institute-api';

export async function getInstansiApplicants(token: string) {
  return apiRequest<GetInstansiApplicantsResponse>('/api/instansi/pendaftaran', { token });
}

export async function updateApplicantStatus(
  token: string,
  pendaftaranId: number,
  body: UpdateApplicantStatusRequest
) {
  return apiRequest<UpdateApplicantStatusResponse>(`/api/pendaftaran/${pendaftaranId}/status`, {
    method: 'PUT',
    token,
    body,
  });
}
