import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import Login from '../pages/auth/Login';

const loginUserMock = vi.fn();
const registerStudentMock = vi.fn();

vi.mock('../api/authApi', () => ({
  loginUser: (...args: unknown[]) => loginUserMock(...args),
  registerStudent: (...args: unknown[]) => registerStudentMock(...args),
}));

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route path="/home" element={<div>home page</div>} />
          <Route path="/admin/dashboard" element={<div>admin page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Login', () => {
  it('logs in a student and redirects to home', async () => {
    const user = userEvent.setup();
    loginUserMock.mockResolvedValueOnce({
      message: 'Đăng nhập thành công',
      user: {
        member_id: 7,
        name: 'Nguyen Van A',
        email: 'student@example.com',
      },
      role: 'student',
      token: 'student-token',
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText('user@example.com hoặc MSSV...'), 'student@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập ngay' }));

    expect(await screen.findByText('home page')).toBeInTheDocument();
    expect(localStorage.getItem('book-loan-auth')).toContain('student-token');
  });

  it('shows register validation feedback inline', async () => {
    const user = userEvent.setup();
    registerStudentMock.mockRejectedValueOnce(new Error('Email không hợp lệ'));

    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));
    await user.type(screen.getByPlaceholderText('Nguyễn Văn A'), 'Nguyen Van A');
    await user.type(screen.getByPlaceholderText('user@example.com hoặc MSSV...'), 'not-an-email');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Đăng ký tài khoản' }));

    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    });
  });
});
