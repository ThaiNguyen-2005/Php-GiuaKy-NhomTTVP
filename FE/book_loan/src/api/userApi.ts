import type { AuthUser, UserRole } from '../auth/storage';
import { apiRequest } from './client';

type Member = {
  member_id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  join_date?: string | null;
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

export async function getAllMembers() {
  return apiRequest<Member[]>('/members');
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
