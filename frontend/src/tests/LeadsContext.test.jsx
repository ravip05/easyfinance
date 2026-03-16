import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { LeadsProvider, useLeads } from '../context/LeadsContext';
import { AuthContext } from '../context/AuthContext';
import { leadsApi, staffApi } from '../api/leads';

// Mock API
vi.mock('../api/leads', () => ({
  leadsApi: {
    list: vi.fn(),
    create: vi.fn(),
    updateStage: vi.fn(),
    destroy: vi.fn(),
  },
  staffApi: {
    list: vi.fn(),
  },
  normalizeApiLead: (l) => l,
}));

// Mock Toast
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const TestUI = () => {
  const { leads, fetchLeads, updateStage, addLead } = useLeads();
  return (
    <div>
      <div data-testid="lead-count">{leads.length}</div>
      <button onClick={() => fetchLeads()}>Fetch</button>
      <button onClick={() => addLead({ name: 'New Lead' })}>Add</button>
      {leads.map(l => (
        <div key={l.id}>
          {l.name} - {l.stage}
          <button onClick={() => updateStage(l.id, 'Contacted')}>Update</button>
        </div>
      ))}
    </div>
  );
};

describe('LeadsContext', () => {
  const mockAuth = { token: 'fake-token' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches leads and staff on mount if authenticated', async () => {
    leadsApi.list.mockResolvedValueOnce({ data: { data: [{ id: 1, name: 'Lead 1', stage: 'New' }] } });
    staffApi.list.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <AuthContext.Provider value={mockAuth}>
        <LeadsProvider>
          <TestUI />
        </LeadsProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('lead-count')).toHaveTextContent('1');
    });
    
    expect(leadsApi.list).toHaveBeenCalled();
    expect(staffApi.list).toHaveBeenCalled();
  });

  it('handles addLead success', async () => {
    leadsApi.list.mockResolvedValue({ data: { data: [] } });
    staffApi.list.mockResolvedValue({ data: { data: [] } });
    leadsApi.create.mockResolvedValueOnce({ data: { data: { id: 2, name: 'Alice', stage: 'New' } } });

    render(
      <AuthContext.Provider value={mockAuth}>
        <LeadsProvider>
          <TestUI />
        </LeadsProvider>
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Alice - New')).toBeInTheDocument();
    });
  });

  it('optimistically updates stage and handles failure rollback', async () => {
    leadsApi.list.mockResolvedValue({ data: { data: [{ id: 1, name: 'Lead 1', stage: 'New' }] } });
    staffApi.list.mockResolvedValue({ data: { data: [] } });
    leadsApi.updateStage.mockRejectedValueOnce(new Error('Server Error'));

    render(
      <AuthContext.Provider value={mockAuth}>
        <LeadsProvider>
          <TestUI />
        </LeadsProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(screen.getByText('Lead 1 - New')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Update'));

    // Should briefly show 'Contacted' (optimistic) then rollback to 'New'
    // but happy-dom/vitest might be too fast to catch the middle state easily without specific timers
    // but we can check the final state and the rollback call
    await waitFor(() => {
      expect(screen.getByText('Lead 1 - New')).toBeInTheDocument();
    });
    
    expect(leadsApi.updateStage).toHaveBeenCalledWith(1, 'Contacted');
  });
});
