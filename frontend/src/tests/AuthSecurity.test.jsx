import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const renderSidebar = (role) => {
  const mockUser = { name: 'Test User', role, initials: 'TU' };
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user: mockUser, logout: vi.fn() }}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Auth Security (RBAC UI)', () => {
  it('renders Admin specific links for admin role', () => {
    renderSidebar('admin');
    expect(screen.getByText('Admin Settings')).toBeInTheDocument();
    expect(screen.getByText('Franchise')).toBeInTheDocument();
    expect(screen.getByText('HR Module')).toBeInTheDocument();
  });

  it('hides Admin Settings for staff role', () => {
    renderSidebar('staff');
    expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
  });

  it('renders restricted links for manager role', () => {
    renderSidebar('manager');
    expect(screen.getByText('My Team')).toBeInTheDocument();
    expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
  });

  it('renders minimal links for client role', () => {
    renderSidebar('client');
    expect(screen.getByText('Support Tickets')).toBeInTheDocument();
    expect(screen.queryByText('Lead Management')).not.toBeInTheDocument();
    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
  });
});
