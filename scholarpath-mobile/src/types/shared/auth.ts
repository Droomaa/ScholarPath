export type UserRole = 'student' | 'institute';

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
