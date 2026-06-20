export type UserProfile = {
  id: number;
  jenjang_id: number | null;
  name: string;
  email: string;
  role: string;
  keahlian: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateProfileRequest = {
  name?: string;
  jenjang_id?: number;
  keahlian?: string;
};

export type JenjangPendidikan = {
  id: number;
  nama: string;
};

export type GetProfileResponse = {
  data: UserProfile;
};

export type UpdateProfileResponse = {
  message: string;
  data: UserProfile;
};

export type GetJenjangResponse = {
  data: JenjangPendidikan[];
};
