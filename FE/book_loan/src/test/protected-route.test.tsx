import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { clearStoredSession, setStoredSession, type AuthSession } from '../auth/storage';

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
    renderProtectedRoute(['/admin/dashboard']);

    expect(await screen.findByText('student page')).toBeInTheDocument();
  });
});
