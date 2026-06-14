export type InstansiRecord = {
  id: number;
  user_id: number | null;
  nama: string;
  alamat: string;
  kontak: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RegisterInstansiRequest = {
  name: string;
  email: string;
  password: string;
  alamat: string;
  kontak: string;
};

export type RegisterInstansiUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type RegisterInstansiResponse = {
  message: string;
  data_login: RegisterInstansiUser;
  data_profil: InstansiRecord;
};

export type GetInstansiListResponse = {
  data: InstansiRecord[];
};

export type GetInstansiByIdResponse = {
  data: InstansiRecord;
};

export type InstansiApplicantRecord = {
  pendaftaran_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  keahlian: string;
  program_type: string;
  program_title: string;
  status_id: number | null;
  tanggal_daftar: string;
};

export type GetInstansiApplicantsResponse = {
  data: InstansiApplicantRecord[];
};

export type InstansiApplicantDocumentRecord = {
  id: number;
  document_key: string;
  title: string;
  is_mandatory: boolean;
  file_url: string;
  file_name: string;
  file_size: number;
  verification_status: 'verified' | 'pending' | string;
};

export type InstansiApplicantDetailRecord = {
  pendaftaran_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  jenjang_nama: string;
  major: string;
  keahlian: string;
  motivation_text: string;
  program_type: string;
  program_title: string;
  status_id: number | null;
  tanggal_daftar: string;
  mandatory_documents: InstansiApplicantDocumentRecord[];
  other_documents: InstansiApplicantDocumentRecord[];
};

export type GetInstansiApplicantDetailResponse = {
  data: InstansiApplicantDetailRecord;
};

export type UpdateApplicantStatusRequest = {
  status_id: number;
};

export type UpdateApplicantStatusResponse = {
  message: string;
  data: {
    id: number;
    status_id: number | null;
  };
};
