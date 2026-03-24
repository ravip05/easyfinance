import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function BankPolicies() {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Home', 'Personal', 'Business', 'Car', 'LAP', 'Insurance'];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/bank-policies');
      if (data?.data) {
        setPolicies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    const textMatch = 
      p.bank_name?.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = category === 'All' || p.category === category;
    return textMatch && p.is_active === 1 && categoryMatch;
  });

  return (
    <div id="page-bank-policies" className="page active" style={{ paddingBottom: 80 }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🏦 Bank Policies</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>Central repository for lending guidelines, rates, and bank-specific rules.</p>
      </div>

      {/* Filter Bar exactly like other pages */}
      <div className="filter-bar">
        <div className="search-wrap">
          <input
            type="text"
            className="form-input"
            placeholder="Search by bank name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: 140 }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty">
          <div className="empty-icon" style={{ animation: 'pulse 1.5s infinite' }}>⏳</div>
          <div className="empty-text">Loading policies...</div>
        </div>
      ) : (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredPolicies.length === 0 ? (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon">📂</div>
              <div className="empty-text">No active policies found matching your search.</div>
            </div>
          ) : (
            filteredPolicies.map(policy => (
              <div key={policy.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    🏦
                  </div>
                  <span className="badge badge-new">{policy.category}</span>
                </div>
                
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text)' }}>
                  {policy.bank_name}
                </h3>
                
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 24, flex: 1 }}>
                  {policy.description || 'No description provided.'}
                </p>
                
                <a 
                  href={policy.policy_url || '#'} 
                  target={policy.policy_url ? '_blank' : '_self'}
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={e => { if (!policy.policy_url) e.preventDefault() }}
                >
                  {policy.policy_url ? '📄 View Document' : '🚫 No Link'}
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
