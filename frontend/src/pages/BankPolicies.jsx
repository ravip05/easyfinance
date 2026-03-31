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
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.short_code?.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = category === 'All' || p.category === category || p.bank_type === category;
    return textMatch && p.is_active && categoryMatch;
  });

  return (
    <div id="page-bank-policies" className="page active" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>🏦 Lending Policies</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time guidelines, rates, and eligibility for all partner banks.</p>
      </div>

      {/* Filter Bar */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '32px', background: 'white', padding: '12px', borderRadius: '16px', 
        border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by bank name, code or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#fdfdfe', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#fdfdfe', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', cursor: 'pointer' }}
        >
          {['All', 'PSU', 'Private', 'NBFC', 'HFC'].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Syncing bank feed...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
          {filteredPolicies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
               <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
               <div style={{ color: '#64748b', fontWeight: 600 }}>No policies found matching your criteria.</div>
            </div>
          ) : (
            filteredPolicies.map(p => (
              <div key={p.id} className="policy-card" style={{ 
                background: 'white', borderRadius: '24px', border: '1.5px solid #e2e8f0', overflow: 'hidden', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column'
              }}>
                {/* Card Header (Branded) */}
                <div style={{ background: p.brand_color || '#2563eb', padding: '24px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.bank_type}</div>
                        <div style={{ fontWeight: 900, fontSize: '18px', opacity: 0.8 }}>{p.short_code}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', color: p.brand_color || '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {p.logo_code || p.name[0]}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>{p.name}</h3>
                    </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '24px', flex: 1 }}>
                    {/* Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <StatBox label="Home Loan" value={p.hl_interest_rate || '--'} sub="Min ROI" color="#2563eb" />
                        <StatBox label="Business Loan" value={p.bl_interest_rate || '--'} sub="ROI Base" color="#059669" />
                        <StatBox label="Personal Loan" value={p.pl_interest_rate || '--'} sub="Starting" color="#db2777" />
                        <StatBox label="Min CIBIL" value={p.cibil_min || '700'} sub="Cut-off" color="#475569" />
                    </div>

                    {/* Meta Details */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>MAX TENURE</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{p.hl_max_tenure || '30 Years'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>PROC. FEE</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{p.processing_fee || '0.50%'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>INCOME REQ.</span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>₹{p.min_income || '25K'}/mo</span>
                        </div>
                    </div>

                    {/* Internal Tip */}
                    {p.highlight && (
                        <div style={{ marginTop: '20px', padding: '12px', background: '#fefce8', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '14px' }}>💡</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', lineHeight: 1.5 }}>{p.highlight}</span>
                        </div>
                    )}
                </div>

                {/* Card Footer */}
                <div style={{ padding: '0 24px 24px' }}>
                    <a 
                      href={p.policy_url || '#'} 
                      target="_blank" 
                      style={{ 
                        display: 'block', padding: '14px', textAlign: 'center', borderRadius: '14px', 
                        background: '#f8fafc', color: '#475569', fontWeight: 800, fontSize: '13px', 
                        textDecoration: 'none', border: '1.5px solid #e2e8f0', transition: 'all 0.2s' 
                      }}
                      onMouseOver={e => { e.target.style.background = '#f1f5f9'; e.target.style.borderColor = '#cbd5e1' }}
                      onMouseOut={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#e2e8f0' }}
                    >
                      View Detailed Policy Document
                    </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
    return (
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: color }}>{value}</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }}>{sub}</div>
        </div>
    )
}
