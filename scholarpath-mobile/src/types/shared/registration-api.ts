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

export type CreatePendaftaranDocumentInput = {
  document_key: string;
  title: string;
  is_mandatory: boolean;
  file_url: string;
  file_name: string;
  file_size: number;
};

export type CreatePendaftaranRequest = {
  beasiswa_id?: number;
  olimpiade_id?: number;
  motivation_text?: string;
  documents?: CreatePendaftaranDocumentInput[];
};

export type CreatePendaftaranResponse = {
  message: string;
  data: PendaftaranRecord;
};

export type GetRiwayatPendaftaranResponse = {
  data: RiwayatPendaftaranRecord[];
};
