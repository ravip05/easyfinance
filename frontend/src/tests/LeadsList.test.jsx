import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import LeadsList from '../components/LeadsList';
import { AuthContext } from '../context/AuthContext';
import { LeadsContext } from '../context/LeadsContext';

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn(() => true));

// Mock URL class and createObjectURL
class MockURL {
  constructor(str) { this.str = str; }
  static createObjectURL = vi.fn(() => 'blob:abc');
}
vi.stubGlobal('URL', MockURL);

const mockUser = { name: 'Admin User', role: 'admin' };
const mockLeads = [
  { 
    id: 1, name: 'Alice Smith', phone: '1234567890', type: 'Home Loan', 
    amount: '₹25,00,000', amountRaw: 2500000, stage: 'New', 
    priority: 'High', assigned: 'John Doe', color: '#ff0000', initials: 'AS' 
  },
  { 
    id: 2, name: 'Bob Jones', phone: '0987654321', type: 'Personal Loan', 
    amount: '₹5,00,000', amountRaw: 500000, stage: 'Contacted', 
    priority: 'Low', assigned: 'Jane Doe', color: '#00ff00', initials: 'BJ' 
  },
];

const renderWithContext = (ui, leads = mockLeads, user = mockUser) => {
  const leadsValue = {
    leads,
    isLoading: false,
    updateStage: vi.fn(),
    deleteLead: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={{ user }}>
      <LeadsContext.Provider value={leadsValue}>
        {ui}
      </LeadsContext.Provider>
    </AuthContext.Provider>
  );
};

describe('LeadsList Component', () => {
  it('renders table headers and lead rows', () => {
    renderWithContext(<LeadsList />);
    
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('₹25,00,000')).toBeInTheDocument();
    expect(screen.getByText('Home Loan')).toBeInTheDocument();
  });

  it('filters by search query', async () => {
    renderWithContext(<LeadsList filters={{ search: 'Alice' }} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('filters by stage', () => {
    renderWithContext(<LeadsList filters={{ stage: 'Contacted' }} />);
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('sorts by amount', () => {
    renderWithContext(<LeadsList />);
    const amountHeader = screen.getByText(/Amount/i);
    
    // Default is created_desc (id desc)
    // Click to sort by amount asc
    fireEvent.click(amountHeader);
    
    const rows = screen.getAllByRole('row');
    // Row 0 is header, Row 1 should be Bob (5L), Row 2 should be Alice (25L)
    expect(within(rows[1]).getByText('Bob Jones')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Alice Smith')).toBeInTheDocument();
  });

  it('handles bulk selection', () => {
    renderWithContext(<LeadsList />);
    const headerCheckbox = screen.getAllByRole('checkbox')[0]; // The one in the header
    
    fireEvent.click(headerCheckbox);
    
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(chk => {
      expect(chk).toBeChecked();
    });
  });

  it('triggers CSV export', () => {
    renderWithContext(<LeadsList />);
    const exportBtn = screen.getByText(/Export/i);
    
    const spy = vi.spyOn(document, 'createElement');
    fireEvent.click(exportBtn);
    
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('triggers lead deletion with confirmation', async () => {
    const { container } = renderWithContext(<LeadsList />);
    const deleteBtns = screen.getAllByTitle(/Archive lead/i);
    
    fireEvent.click(deleteBtns[0]);
    expect(window.confirm).toHaveBeenCalled();
  });
});
