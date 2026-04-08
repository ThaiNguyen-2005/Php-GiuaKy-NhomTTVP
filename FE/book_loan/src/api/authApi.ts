import type { AuthSession, UserRole } from '../auth/storage';
import { apiRequest } from './client';

type AuthResponse = {
  message: string;
  user: AuthSession['user'];
  role: UserRole;
  token: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function loginUser(role: UserRole, identifier: string, password: string) {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: { role, identifier, password },
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
      password_confirmation: password,
      phone_number: phoneNumber,
    },
  });
}

export async function logoutUser() {
  return apiRequest<{ message: string }>('/logout', {
    method: 'POST',
  });
}
