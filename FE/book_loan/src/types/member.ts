export interface MemberApiRecord {
  member_id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  join_date?: string | null;
}

export interface MemberListItem {
  id: number;
  name: string;
  dept: string;
  type: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  status: string;
  statusColor: string;
}

export type MemberPayload = {
  name: string;
  email: string;
  phone_number?: string | null;
  join_date?: string | null;
  password?: string;
  password_confirmation?: string;
};
