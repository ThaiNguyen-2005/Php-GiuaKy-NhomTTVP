import { mockGetAllMembers } from './mockData';

type Member = {
  member_id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
};

export async function getAllMembers() {
  return mockGetAllMembers() as Promise<Member[]>;
}
