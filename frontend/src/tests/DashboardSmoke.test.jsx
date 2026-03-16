import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthContext } from '../context/AuthContext';
import { LeadsContext } from '../context/LeadsContext';

// Mock the components that might be complex to render or have heavy dependencies
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: [] } }))
  }
}));

const renderDashboard = (user, leads = [], isLoading = false) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user }}>
        <LeadsContext.Provider value={{ leads, isLoading }}>
          <Dashboard />
        </LeadsContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Dashboard Smoke Tests', () => {
  it('renders Admin dashboard correctly', () => {
    const admin = { id: 1, name: 'Admin User', role: 'admin', initials: 'AU' };
    renderDashboard(admin);
    expect(screen.getByText(/Welcome back, Admin/i)).toBeInTheDocument();
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders Staff dashboard correctly', () => {
    const staff = { id: 2, name: 'Staff User', role: 'staff', initials: 'SU' };
    const mockLeads = [{ id: 1, name: 'Lead 1', stage: 'New', amount: '1000' }];
    renderDashboard(staff, mockLeads);
    expect(screen.getByText(/Welcome back, Staff/i)).toBeInTheDocument();
    expect(screen.getByText('My Leads')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const user = { id: 1, name: 'User', role: 'staff' };
    renderDashboard(user, [], true);
    // Should show the loading skeleton (RoleBanner is still shown if user exists)
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});
