import type { AuthUser, UserRole } from '../auth/storage';
import { apiRequest } from './client';
import type { MemberApiRecord } from '../types/member';

type PaginatedResponse<T> = {
  data: T[];
};

type UpdateProfilePayload = {
  name: string;
  email?: string | null;
  phone_number?: string | null;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
};

type MeResponse = {
  user: AuthUser;
  role: UserRole;
};

type UpdateProfileResponse = {
  message: string;
  user: AuthUser;
  role: UserRole;
};

function unwrapCollection<T>(payload: T[] | PaginatedResponse<T>) {
  return Array.isArray(payload) ? payload : payload.data;
}

export async function getAllMembers() {
  const data = await apiRequest<MemberApiRecord[] | PaginatedResponse<MemberApiRecord>>(
    '/members?limit=1000'
  );

  return unwrapCollection(data);
}

export async function getMyProfile() {
  return apiRequest<MeResponse>('/me');
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  return apiRequest<UpdateProfileResponse>('/me', {
    method: 'PUT',
    body: payload,
  });
}
