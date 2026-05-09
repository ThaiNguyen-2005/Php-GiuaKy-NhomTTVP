import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { clearStoredSession, setStoredSession, type AuthSession } from '../auth/storage';

const { getMyProfileMock } = vi.hoisted(() => ({
  getMyProfileMock: vi.fn(),
}));

vi.mock('../api/userApi', () => ({
  getMyProfile: () => getMyProfileMock(),
}));

function renderProtectedRoute(initialEntries: string[] = ['/']) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/" element={<div>student page</div>} />
            <Route path="/home" element={<div>student page</div>} />
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<div>admin page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', async () => {
    clearStoredSession();
    renderProtectedRoute();

    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('redirects a student session away from admin pages', async () => {
    const session: AuthSession = {
      token: 'token-1',
      role: 'student',
      user: {
        member_id: 12,
        name: 'Test Student',
        email: 'student@example.com',
      },
    };

    setStoredSession(session);
    getMyProfileMock.mockResolvedValueOnce({
      role: 'student',
      user: session.user,
    });

    renderProtectedRoute(['/admin/dashboard']);

    expect(await screen.findByText('student page')).toBeInTheDocument();
  });

  it('uses the server verified role before allowing protected pages', async () => {
    const session: AuthSession = {
      token: 'token-2',
      role: 'admin',
      user: {
        librarian_id: 1,
        name: 'Stored Admin',
        email: 'admin@example.com',
      },
    };

    setStoredSession(session);
    getMyProfileMock.mockResolvedValueOnce({
      role: 'student',
      user: {
        member_id: 12,
        name: 'Verified Student',
        email: 'student@example.com',
      },
    });

    renderProtectedRoute(['/admin/dashboard']);

    expect(await screen.findByText('student page')).toBeInTheDocument();
  });
});
