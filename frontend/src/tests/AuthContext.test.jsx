import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

// Mock apiClient
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('restores session from storage on mount', async () => {
    sessionStorage.setItem('crm_token', 'fake-token');
    sessionStorage.setItem('crm_user', JSON.stringify({ name: 'Alice', role: 'admin' }));
    
    apiClient.get.mockResolvedValueOnce({ data: { user: { name: 'Alice', role: 'admin' } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    });
    
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
  });

  it('clears session if token is invalid', async () => {
    sessionStorage.setItem('crm_token', 'invalid-token');
    apiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(sessionStorage.getItem('crm_token')).toBeNull();
  });

  it('handles successful login', async () => {
    apiClient.post.mockResolvedValueOnce({ 
      data: { token: 'new-token', user: { name: 'Bob', role: 'staff' } } 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Skip initial loading
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Bob');
    });

    expect(sessionStorage.getItem('crm_token')).toBe('new-token');
  });

  it('handles logout', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { user: { name: 'Alice' } } });
    sessionStorage.setItem('crm_token', 'token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Alice'));

    apiClient.post.mockResolvedValueOnce({});
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(sessionStorage.getItem('crm_token')).toBeNull();
  });
});
