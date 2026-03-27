import { mockLogin, mockRegisterStudent } from './mockData';

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
  return mockLogin(role, identifier, password) as Promise<AuthResponse>;
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

  return mockRegisterStudent(name, identifier, password, phoneNumber) as Promise<AuthResponse>;
}
