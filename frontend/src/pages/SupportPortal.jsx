import React, { useState, useEffect } from 'react';

const SupportPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Mock data for base UI
  useEffect(() => {
    setTimeout(() => {
      setTickets([
        { id: 1, subject: 'Loan Disbursal Delay', status: 'In Progress', priority: 'High', type: 'Client Support', created_at: '2024-03-12' },
        { id: 2, subject: 'App Login Issue', status: 'Open', priority: 'Medium', type: 'Staff Issue', created_at: '2024-03-13' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="page-container support-portal">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-muted">Raise issues and track resolutions</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowNewTicketModal(true)}
        >
          + Create Ticket
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading tickets...</div>
      ) : (
        <div className="ticket-list">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card-glass ticket-card" style={{ marginBottom: '15px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '13px' }}>
                    <span className="text-muted">ID: #TK-00{ticket.id}</span>
                    <span className="text-muted">Type: {ticket.type}</span>
                    <span className="text-muted">Date: {ticket.created_at}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`badge badge-${ticket.status === 'Open' ? 'warning' : 'info'}`} style={{ marginBottom: '5px' }}>
                    {ticket.status}
                  </div>
                  <div style={{ fontSize: '12px', color: ticket.priority === 'High' ? 'var(--danger-color)' : 'inherit' }}>
                    Priority: {ticket.priority}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-secondary btn-sm">View Discussion</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scaffold for New Ticket Modal */}
      {showNewTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content card-glass" style={{ maxWidth: '500px' }}>
            <h2>New Support Ticket</h2>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Subject</label>
              <input type="text" className="form-input" placeholder="What is the issue?" />
            </div>
            <div className="form-group">
              <label>Issue Type</label>
              <select className="form-input">
                <option>Client Support</option>
                <option>Staff Issue</option>
                <option>Franchise Issue</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-input">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" rows="4" placeholder="Detail your problem..."></textarea>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setShowNewTicketModal(false)}>Cancel</button>
              <button className="btn-primary">Submit Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPortal;
