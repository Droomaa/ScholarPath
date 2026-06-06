export type PendaftaranRecord = {
  id: number;
  user_id: number;
  beasiswa_id: number | null;
  olimpiade_id: number | null;
  status_id: number | null;
  tanggal_daftar: string;
  created_at?: string;
  updated_at?: string;
};

export type RiwayatPendaftaranRecord = {
  pendaftaran_id: number;
  program_type: 'Beasiswa' | 'Olimpiade' | string;
  program_title: string;
  status_name: string;
  tanggal_daftar: string;
};

export type CreatePendaftaranRequest = {
  beasiswa_id?: number;
  olimpiade_id?: number;
};

export type CreatePendaftaranResponse = {
  message: string;
  data: PendaftaranRecord;
};

export type GetRiwayatPendaftaranResponse = {
  data: RiwayatPendaftaranRecord[];
};
