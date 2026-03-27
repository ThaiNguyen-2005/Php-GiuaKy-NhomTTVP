import { apiRequest } from './client';

type UserRole = 'student' | 'admin';

type AuthResponse = {
  message: string;
  user: Record<string, unknown>;
  role: UserRole;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function loginUser(role: UserRole, identifier: string, password: string) {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: {
      role,
      identifier,
      password,
    },
  });
}

export async function registerStudent(
  name: string,
  identifier: string,
  password: string,
  phoneNumber?: string
) {
  if (!isValidEmail(identifier)) {
    throw new Error('Vui long nhap email hop le de dang ky.');
  }

  return apiRequest<AuthResponse>('/register', {
    method: 'POST',
    body: {
      name,
      email: identifier,
      password,
      phone_number: phoneNumber,
    },
  });
}
