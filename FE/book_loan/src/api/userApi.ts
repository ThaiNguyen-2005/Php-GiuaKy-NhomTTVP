import { apiRequest } from './client';

type Member = {
  member_id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
};

export async function getAllMembers() {
  return apiRequest<Member[]>('/admin/members');
}
