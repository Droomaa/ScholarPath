export type ProgramSourceKind = 'scholarship' | 'competition';

export type BeasiswaRecord = {
  id: number;
  instansi_id: number | null;
  kategori_id: number | null;
  jenjang_id: number | null;
  verified_by: number | null;
  nama: string;
  deskripsi: string;
  kuota_pendaftar: number;
  tipe_beasiswa: string | null;
  nominal_pendanaan: number;
  link_informasi: string;
  created_at: string;
  updated_at: string;
};

export type OlimpiadeRecord = {
  id: number;
  instansi_id: number | null;
  kategori_id: number | null;
  jenjang_id: number | null;
  verified_by: number | null;
  judul: string;
  deskripsi: string;
  tipe_lomba: string | null;
  kuota: number;
  biaya_pendaftaran: number;
  link_informasi: string;
  created_at: string;
  updated_at: string;
};

export type GetBeasiswaListResponse = {
  data: BeasiswaRecord[];
};

export type GetOlimpiadeListResponse = {
  data: OlimpiadeRecord[];
};

export type GetBeasiswaResponse = {
  data: BeasiswaRecord;
};

export type GetOlimpiadeResponse = {
  data: OlimpiadeRecord;
};
