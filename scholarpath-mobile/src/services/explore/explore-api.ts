import { apiRequest } from '@/src/services/api/client';
import { getJenjangList } from '@/src/services/profile';
import type {
  GetBeasiswaListResponse,
  GetBeasiswaResponse,
  GetOlimpiadeListResponse,
  GetOlimpiadeResponse,
} from '@/src/types/shared/explore-api';
import type { ExploreProgram } from '@/src/types/shared/program';

import {
  mapBeasiswaToExploreProgram,
  mapOlimpiadeToExploreProgram,
  mergeExplorePrograms,
} from './map-explore-programs';
import { parseProgramCompositeId, type ParsedProgramId } from './program-id';

export async function fetchExplorePrograms(
  token: string,
  refreshJenjang = false
): Promise<ExploreProgram[]> {
  const [beasiswaResponse, olimpiadeResponse, jenjangList] = await Promise.all([
    apiRequest<GetBeasiswaListResponse>('/api/beasiswa', { token }),
    apiRequest<GetOlimpiadeListResponse>('/api/olimpiade', { token }),
    getJenjangList(token, refreshJenjang),
  ]);

  return mergeExplorePrograms(
    beasiswaResponse.data ?? [],
    olimpiadeResponse.data ?? [],
    jenjangList
  );
}

export async function fetchProgramById(
  token: string,
  programId: string,
  refreshJenjang = false
): Promise<ExploreProgram | null> {
  const parsed = parseProgramCompositeId(programId);
  if (!parsed) {
    return null;
  }

  const jenjangList = await getJenjangList(token, refreshJenjang);
  const jenjangLookup = new Map(jenjangList.map((item) => [item.id, item.nama]));

  if (parsed.kind === 'beasiswa') {
    const response = await apiRequest<GetBeasiswaResponse>(`/api/beasiswa/${parsed.numericId}`, {
      token,
    });
    return mapBeasiswaToExploreProgram(response.data, jenjangLookup);
  }

  const response = await apiRequest<GetOlimpiadeResponse>(`/api/olimpiade/${parsed.numericId}`, {
    token,
  });
  return mapOlimpiadeToExploreProgram(response.data, jenjangLookup);
}

export { parseProgramCompositeId, type ParsedProgramId };
