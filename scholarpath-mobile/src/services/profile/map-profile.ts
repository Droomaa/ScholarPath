import type { EducationLevel } from '@/src/types/shared/program';
import type { JenjangPendidikan, UpdateProfileRequest, UserProfile } from '@/src/types/shared/profile';

export type ParsedKeahlian = {
  schoolOrigin: string;
  major: string;
  interests: string[];
  skills: string[];
};

export type ProfilePersistInput = {
  fullName: string;
  educationLevel: EducationLevel | '';
  schoolOrigin?: string;
  major?: string;
  interests?: string[];
  skills?: string[];
};

function normalizeJenjangName(name: string): string {
  return name.trim().toUpperCase();
}

export function resolveJenjangId(
  educationLevel: EducationLevel | '',
  jenjangList: JenjangPendidikan[]
): number | undefined {
  if (!educationLevel || jenjangList.length === 0) {
    return undefined;
  }

  const target = educationLevel.toUpperCase();
  const exact = jenjangList.find((item) => normalizeJenjangName(item.nama) === target);
  if (exact) {
    return exact.id;
  }

  const partial = jenjangList.find((item) => normalizeJenjangName(item.nama).includes(target));
  return partial?.id;
}

export function resolveEducationLevel(
  jenjangId: number | null | undefined,
  jenjangList: JenjangPendidikan[]
): EducationLevel | '' {
  if (!jenjangId || jenjangList.length === 0) {
    return '';
  }

  const match = jenjangList.find((item) => item.id === jenjangId);
  if (!match) {
    return '';
  }

  const nama = normalizeJenjangName(match.nama);
  if (nama === 'SMP' || nama === 'SMA' || nama === 'SMK') {
    return nama;
  }
  if (nama.includes('SMK')) return 'SMK';
  if (nama.includes('SMA')) return 'SMA';
  if (nama.includes('SMP')) return 'SMP';

  return '';
}

export function serializeKeahlian(input: {
  schoolOrigin?: string;
  major?: string;
  interests?: string[];
  skills?: string[];
}): string {
  const schoolOrigin = input.schoolOrigin?.trim() || '-';
  const major = input.major?.trim() || '-';
  const interests = input.interests?.length ? input.interests.join(', ') : '-';
  const skills = input.skills?.length ? input.skills.join(', ') : '-';

  return `Asal Sekolah: ${schoolOrigin} | Jurusan: ${major} | Minat: ${interests} | Keahlian: ${skills}`;
}

export function parseKeahlian(keahlian: string): ParsedKeahlian {
  const result: ParsedKeahlian = { schoolOrigin: '', major: '', interests: [], skills: [] };

  if (!keahlian?.trim()) {
    return result;
  }

  const parts = keahlian.split(' | ').map((part) => part.trim());

  for (const part of parts) {
    if (part.startsWith('Asal Sekolah:')) {
      const value = part.slice('Asal Sekolah:'.length).trim();
      if (value && value !== '-') {
        result.schoolOrigin = value;
      }
    } else if (part.startsWith('Jurusan:')) {
      const value = part.slice('Jurusan:'.length).trim();
      if (value && value !== '-') {
        result.major = value;
      }
    } else if (part.startsWith('Minat:')) {
      const value = part.slice('Minat:'.length).trim();
      if (value && value !== '-') {
        result.interests = value.split(',').map((item) => item.trim()).filter(Boolean);
      }
    } else if (part.startsWith('Keahlian:')) {
      const value = part.slice('Keahlian:'.length).trim();
      if (value && value !== '-') {
        result.skills = value.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
  }

  if (
    !result.schoolOrigin &&
    !result.major &&
    result.interests.length === 0 &&
    result.skills.length === 0
  ) {
    result.skills = [keahlian.trim()];
  }

  return result;
}

export function mergeKeahlianFromExisting(
  existingKeahlian: string,
  updates: {
    schoolOrigin?: string;
    major?: string;
    interests?: string[];
    skills?: string[];
  }
): string {
  const parsed = parseKeahlian(existingKeahlian);

  return serializeKeahlian({
    schoolOrigin: updates.schoolOrigin ?? parsed.schoolOrigin,
    major: updates.major ?? parsed.major,
    interests: updates.interests ?? parsed.interests,
    skills: updates.skills ?? parsed.skills,
  });
}

export function buildUpdatePayload(
  profile: ProfilePersistInput,
  jenjangList: JenjangPendidikan[]
): UpdateProfileRequest {
  const payload: UpdateProfileRequest = {
    name: profile.fullName.trim(),
    keahlian: serializeKeahlian({
      schoolOrigin: profile.schoolOrigin,
      major: profile.major,
      interests: profile.interests,
      skills: profile.skills,
    }),
  };

  const jenjangId = resolveJenjangId(profile.educationLevel, jenjangList);
  if (jenjangId !== undefined) {
    payload.jenjang_id = jenjangId;
  }

  return payload;
}

export function mapUserToSessionUpdates(user: UserProfile, jenjangList: JenjangPendidikan[]) {
  const parsed = parseKeahlian(user.keahlian ?? '');

  return {
    fullName: user.name ?? '',
    email: user.email ?? '',
    educationLevel: resolveEducationLevel(user.jenjang_id, jenjangList),
    schoolOrigin: parsed.schoolOrigin,
    major: parsed.major,
    interests: parsed.interests,
    skills: parsed.skills,
  };
}
