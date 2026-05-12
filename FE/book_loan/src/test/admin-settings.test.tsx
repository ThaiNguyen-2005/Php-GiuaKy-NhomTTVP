import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminSettings from '../pages/admin/AdminSettings';

const {
  updateMyProfileMock,
  updateUserMock,
  fetchLibrarySettingsMock,
  updateLibrarySettingsMock,
} = vi.hoisted(() => ({
  updateMyProfileMock: vi.fn(),
  updateUserMock: vi.fn(),
  fetchLibrarySettingsMock: vi.fn(),
  updateLibrarySettingsMock: vi.fn(),
}));

vi.mock('../api/userApi', () => ({
  updateMyProfile: (...args: unknown[]) => updateMyProfileMock(...args),
}));

vi.mock('../api/librarySettingsApi', () => ({
  fetchLibrarySettings: () => fetchLibrarySettingsMock(),
  updateLibrarySettings: (payload: unknown) => updateLibrarySettingsMock(payload),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      librarian_id: 1,
      name: 'Old Admin',
      email: 'old.admin@hcmue.edu.vn',
      phone_number: '0901000001',
    },
    updateUser: updateUserMock,
  }),
}));

describe('AdminSettings', () => {
  it('loads backend settings and explains how they apply', async () => {
    fetchLibrarySettingsMock.mockResolvedValueOnce({
      loan_period_days: 14,
      max_active_loans: 5,
    });

    render(<AdminSettings />);

    expect(await screen.findByTestId('borrow-settings-note')).toBeInTheDocument();
  });

  it('saves admin profile details through the authenticated profile API', async () => {
    const user = userEvent.setup();
    updateMyProfileMock.mockResolvedValueOnce({
      message: 'Profile updated',
      role: 'admin',
      user: {
        librarian_id: 1,
        name: 'Updated Admin',
        email: 'updated.admin@hcmue.edu.vn',
        phone_number: '0901999999',
      },
    });

    fetchLibrarySettingsMock.mockResolvedValueOnce({
      loan_period_days: 14,
      max_active_loans: 5,
    });

    render(<AdminSettings />);

    await user.clear(await screen.findByTestId('admin-name'));
    await user.type(screen.getByTestId('admin-name'), 'Updated Admin');
    await user.clear(screen.getByTestId('admin-email'));
    await user.type(screen.getByTestId('admin-email'), 'updated.admin@hcmue.edu.vn');
    await user.clear(screen.getByTestId('admin-phone'));
    await user.type(screen.getByTestId('admin-phone'), '0901999999');
    await user.click(screen.getByTestId('save-admin-profile'));

    expect(updateMyProfileMock).toHaveBeenCalledWith({
      name: 'Updated Admin',
      email: 'updated.admin@hcmue.edu.vn',
      phone_number: '0901999999',
      current_password: undefined,
      password: undefined,
      password_confirmation: undefined,
    });
    expect(updateUserMock).toHaveBeenCalledWith({
      librarian_id: 1,
      name: 'Updated Admin',
      email: 'updated.admin@hcmue.edu.vn',
      phone_number: '0901999999',
    });
  });

  it('saves borrowing rules through the settings API', async () => {
    const user = userEvent.setup();
    fetchLibrarySettingsMock.mockResolvedValueOnce({
      loan_period_days: 14,
      max_active_loans: 5,
    });
    updateLibrarySettingsMock.mockResolvedValueOnce({
      loan_period_days: 21,
      max_active_loans: 7,
    });

    render(<AdminSettings />);

    await user.clear(await screen.findByTestId('loan-period-days'));
    await user.type(screen.getByTestId('loan-period-days'), '21');
    await user.clear(screen.getByTestId('max-active-loans'));
    await user.type(screen.getByTestId('max-active-loans'), '7');
    await user.click(screen.getByTestId('save-borrow-settings'));

    expect(updateLibrarySettingsMock).toHaveBeenCalledWith({
      loan_period_days: 21,
      max_active_loans: 7,
    });
  });
});
