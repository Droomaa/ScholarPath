export type ValidationResult = {
  valid: boolean;
  message?: string;
};

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
const PHONE_PATTERN = /^[0-9+\s()-]+$/;
const INSTITUTE_NAME_PATTERN = /^[a-zA-ZÀ-ÿ0-9\s'.&,-]+$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email is required.' };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message: 'Enter a valid email address (e.g. name@gmail.com).',
    };
  }
  return { valid: true };
}

export function validatePersonName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: 'Name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return { valid: false, message: 'Name should only contain letters.' };
  }
  return { valid: true };
}

export function validateInstituteName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: 'Institute name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Institute name must be at least 2 characters.' };
  }
  if (!INSTITUTE_NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message: 'Institute name should only contain letters, numbers, and basic punctuation.',
    };
  }
  return { valid: true };
}

export function validatePhoneNumber(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, message: 'Phone number is required.' };
  }
  if (!PHONE_PATTERN.test(trimmed)) {
    return { valid: false, message: 'Phone number must contain numbers only.' };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) {
    return { valid: false, message: 'Enter a valid phone number (9–15 digits).' };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one letter.' };
  }
  return { valid: true };
}
