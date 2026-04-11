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
  status: string;
  statusColor: string;
}
