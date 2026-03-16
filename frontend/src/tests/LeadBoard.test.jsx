import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import LeadBoard from '../pages/LeadBoard';
import { LeadsContext } from '../context/LeadsContext';
import { AuthContext } from '../context/AuthContext';

// Mock context values
const mockLeads = [
  { id: 1, name: 'Alice Smith', phone: '9876543210', email: 'alice@example.com', type: 'Home Loan', amount: '₹45L', stage: 'New', priority: 'High', created_at: '2026-03-01' },
  { id: 2, name: 'Bob Jones', phone: '8876543211', email: 'bob@example.com', type: 'Personal Loan', amount: '₹5L', stage: 'Contacted', priority: 'Medium', created_at: '2026-03-05' },
];

const mockAuth = { user: { role: 'admin' } };
const mockLeadsContext = {
  leads: mockLeads,
  isLoading: false,
  updateStage: vi.fn(),
  deleteLead: vi.fn(),
};

const renderWithContext = (component) => {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <LeadsContext.Provider value={mockLeadsContext}>
        {component}
      </LeadsContext.Provider>
    </AuthContext.Provider>
  );
};

describe('LeadBoard Page', () => {
  it('renders lead data correctly in a table', () => {
    renderWithContext(<LeadBoard />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('₹45L')).toBeInTheDocument();
  });

  it('filters leads by search query', async () => {
    renderWithContext(<LeadBoard />);
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('updates lead stage via dropdown', () => {
    renderWithContext(<LeadBoard />);
    const dropdowns = screen.getAllByRole('combobox');
    // First dropdown after main filter bar is usually the first row's stage selector
    // But let's be more specific - the table body select
    const aliceRow = screen.getByText('Alice Smith').closest('tr');
    const stageSelect = within(aliceRow).getByRole('combobox');
    
    fireEvent.change(stageSelect, { target: { value: 'Contacted' } });
    expect(mockLeadsContext.updateStage).toHaveBeenCalledWith(1, 'Contacted');
  });

  it('selects all leads when global checkbox is clicked', () => {
    renderWithContext(<LeadBoard />);
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]; // Header checkbox
    
    fireEvent.click(selectAllCheckbox);
    
    expect(screen.getByText(/2 leads selected/i)).toBeInTheDocument();
  });
});
