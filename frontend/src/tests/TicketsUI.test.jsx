import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import axios from 'axios';
import Tickets from '../pages/Tickets';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Better mock for axios to handle apiClient initialization
vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(function() { return this; }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  return { default: mockAxios };
});

const mockUser = { id: 1, name: 'Test User', role: 'staff' };

const renderTickets = () => {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <ToastProvider>
        <Tickets />
      </ToastProvider>
    </AuthContext.Provider>
  );
};

describe('Tickets UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ticket list and allows viewing details', async () => {
    const mockTickets = [
      { id: 1, subject: 'Test Ticket 1', status: 'Open', priority: 'High', category: 'Technical', created_at: new Date().toISOString(), user: { name: 'Test User' } }
    ];
    axios.get.mockResolvedValueOnce({ data: { data: mockTickets } });

    renderTickets();

    expect(await screen.findByText('Test Ticket 1')).toBeInTheDocument();
  });

  it('allows opening new ticket modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } });
    renderTickets();

    const openBtn = screen.getByText('+ New Ticket');
    fireEvent.click(openBtn);

    expect(screen.getByText('Create New Support Ticket')).toBeInTheDocument();
  });

  it('submits a new ticket reply', async () => {
    const mockTicket = { 
      id: 1, 
      subject: 'Test', 
      status: 'Open', 
      priority: 'Low', 
      category: 'Other', 
      created_at: new Date().toISOString(), 
      user: { name: 'User' },
      replies: [] 
    };
    
    // 1. Initial list load
    axios.get.mockResolvedValueOnce({ data: { data: [mockTicket] } });
    // 2. Fetch specific ticket details after click
    axios.get.mockResolvedValueOnce({ data: { data: mockTicket } });
    // 3. Fetch list again after reply
    axios.get.mockResolvedValueOnce({ data: { data: [mockTicket] } });
    // 4. Fetch specific ticket again after reply refresh
    axios.get.mockResolvedValueOnce({ data: { data: mockTicket } });

    renderTickets();
    
    const subjectEl = await screen.findByText('Test');
    fireEvent.click(subjectEl);
    
    const textarea = await screen.findByPlaceholderText('Type your reply here...');
    fireEvent.change(textarea, { target: { value: 'New reply' } });
    
    const sendBtn = screen.getByText('Send Reply');
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/reply'), expect.objectContaining({ message: 'New reply' }));
    });
  });
});
