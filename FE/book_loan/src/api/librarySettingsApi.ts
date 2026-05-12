import { apiRequest } from './client';

export type LibrarySettings = {
  loan_period_days: number;
  max_active_loans: number;
  updated_at?: string | null;
};

type LibrarySettingsPayload = {
  loan_period_days: number;
  max_active_loans: number;
};

export async function fetchLibrarySettings() {
  return apiRequest<LibrarySettings>('/library-settings');
}

export async function updateLibrarySettings(payload: LibrarySettingsPayload) {
  return apiRequest<LibrarySettings>('/library-settings', {
    method: 'PUT',
    body: payload,
  });
}
