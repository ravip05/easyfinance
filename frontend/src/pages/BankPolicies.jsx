import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function BankPolicies() {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Home', 'Personal', 'Business'];

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
    return textMatch && categoryMatch;
  });

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-5" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(79,70,229,0.05))', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bank Policies & Guidelines
        </h1>
        <p className="text-muted mt-2" style={{ fontSize: '1.1rem' }}>Central repository for lending guidelines, rates, and bank-specific rules.</p>
        
        <div className="controls-section mt-4 d-flex flex-column flex-md-row gap-3">
          <div className="position-relative flex-grow-1">
            <span className="position-absolute" style={{ top: '50%', left: '16px', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              className="form-control shadow-sm border-0"
              placeholder="Search by bank name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minHeight: '54px', fontSize: '16px', paddingLeft: '48px', borderRadius: '12px', background: 'white' }}
            />
          </div>
          <select 
            className="form-select shadow-sm border-0 w-auto"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ minHeight: '54px', fontSize: '16px', minWidth: '180px', borderRadius: '12px', background: 'white', cursor: 'pointer' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredPolicies.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="p-5" style={{ background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '3rem', opacity: 0.5 }}>🏦</span>
                <h4 className="mt-3 text-muted">No policies found matching your search.</h4>
              </div>
            </div>
          ) : (
            filteredPolicies.map(policy => (
              <div key={policy.id} className="col-12 col-md-6 col-xl-4">
                <div 
                  className="card h-100 shadow-sm border-0 d-flex flex-column" 
                  style={{ borderRadius: '16px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)' }}
                >
                  <div className="card-body flex-grow-1 p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 600 }}>
                        {policy.category}
                      </span>
                      {policy.is_active === 0 && (
                        <span className="badge bg-danger rounded-pill px-3 py-2">Inactive</span>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '16px' }}>
                        🏦
                      </div>
                      <h3 className="h5 mb-0 font-weight-bold" style={{ color: '#0f172a' }}>{policy.bank_name}</h3>
                    </div>
                    
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>{policy.description}</p>
                  </div>
                  
                  <div className="card-footer bg-transparent border-top-0 p-4 pt-0">
                    <a 
                      href={policy.policy_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{ minHeight: '48px', background: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#3b82f6' }}
                    >
                      <span>View Policy Document</span>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                        <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
