export type ProfileCategory = 'science' | 'stem' | 'socio' | 'arts' | 'sport';

export type StudentProfileForm = {
  fullName: string;
  educationLevel: string;
  major: string;
  interests: string[];
  skills: string[];
};

export type CategoryOption = {
  id: ProfileCategory;
  label: string;
};
