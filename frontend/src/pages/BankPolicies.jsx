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
      <header className="page-header mb-4">
        <h1 className="page-title">Bank Policies</h1>
        <p className="text-muted">Knowledge base and lending guidelines.</p>
      </header>

      <section className="controls-section mb-4 d-flex flex-column flex-md-row gap-3">
        <input
          type="text"
          className="form-control flex-grow-1 shadow-sm"
          placeholder="Search bank or policy keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minHeight: '48px', fontSize: '16px' }}
        />
        <select 
          className="form-select shadow-sm w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ minHeight: '48px', fontSize: '16px', minWidth: '160px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredPolicies.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted card border-0 shadow-sm">
              No policies found matching your criteria.
            </div>
          ) : (
            filteredPolicies.map(policy => (
              <div key={policy.id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                  <div className="card-body flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary py-2 px-3 rounded-pill">
                        {policy.category}
                      </span>
                      {policy.is_active === 0 && (
                        <span className="badge bg-danger rounded-pill">Inactive</span>
                      )}
                    </div>
                    <h3 className="h5 mt-3 mb-2 font-weight-bold">{policy.bank_name}</h3>
                    <p className="text-muted small mb-0">{policy.description}</p>
                  </div>
                  <div className="card-footer bg-white border-top-0 pt-0 pb-3">
                    <a 
                      href={policy.policy_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{ minHeight: '48px' }}
                    >
                      <span>View Details</span>
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
