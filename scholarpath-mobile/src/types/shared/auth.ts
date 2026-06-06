export type UserRole = 'student' | 'institute';

export type RegisterSiswaRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterSiswaUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type RegisterSiswaResponse = {
  message: string;
  data: RegisterSiswaUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  role: string;
  name: string;
  user_id: number;
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
  data_profil: {
    id: number;
    user_id: number | null;
    nama: string;
    alamat: string;
    kontak: string;
    is_verified: boolean;
  };
};

export type StudentRegisterForm = {
  fullName: string;
  email: string;
  password: string;
};

export type InstituteRegisterForm = {
  instituteName: string;
  contactNumber: string;
  email: string;
  password: string;
};

export type StudentLoginForm = {
  email: string;
  password: string;
};

export type InstituteLoginForm = {
  instituteName: string;
  email: string;
  password: string;
};
