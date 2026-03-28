import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

// Scoring bands
const BAND = score =>
  score >= 750 ? { label: 'Excellent', color: '#22c55e', icon: '✅' }
  : score >= 700 ? { label: 'Good',      color: '#84cc16', icon: '👍' }
  : score >= 650 ? { label: 'Fair',      color: '#f59e0b', icon: '⚠️' }
  : score >= 600 ? { label: 'Poor',      color: '#ef4444', icon: '❌' }
  : { label:                             'Very Poor', color: '#7f1d1d', icon: '🚫' };

// Mock soft-pull: deterministic from PAN
function mockCibil(pan) {
  // Derive a pseudo-score 550-900 from the PAN string characters
  const seed = pan.toUpperCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 550 + (seed % 351);
}

export default function CibilChecker() {
  const [pan, setPan]           = useState('');
  const [leadId, setLeadId]     = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [error, setError]       = useState('');
  const [synced, setSynced]     = useState(false);
  const [links, setLinks]       = useState({ link1: '', link2: '' });

  useEffect(() => {
    apiClient.get('/settings/public')
      .then(res => setLinks({ link1: res.data.cibil_link_1, link2: res.data.cibil_link_2 }))
      .catch(() => {});
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setSynced(false);

    const clean = pan.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean)) {
      setError('Invalid PAN format. Expected: ABCDE1234F');
      return;
    }

    setLoading(true);
    // Simulate a 800ms soft-pull call
    await new Promise(r => setTimeout(r, 800));
    const score = mockCibil(clean);
    setResult({ pan: clean, score, ...BAND(score) });
    setLoading(false);
  }

  async function handleSync() {
    if (!leadId) {
      setError('Enter a Lead ID to sync the score.');
      return;
    }
    setSyncing(true);
    setError('');
    try {
      await apiClient.patch(`/api/leads/${leadId}`, { cibil_score: result.score });
      setSynced(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lead.');
    }
    setSyncing(false);
  }

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-4">
        <h1 className="page-title">CIBIL Checker</h1>
        <p className="text-muted">Soft-pull credit score lookup. Does not affect borrower's CIBIL rating.</p>
      </header>

      <div className="row g-4 justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          {/* Search Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleCheck}>
                <label className="form-label fw-semibold">Borrower PAN Number</label>
                <div className="d-flex gap-2">
                  <input
                    className="form-control text-uppercase"
                    style={{ minHeight: 52, letterSpacing: 2, fontWeight: 600, fontSize: 15 }}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={pan}
                    onChange={e => { setPan(e.target.value.toUpperCase()); setResult(null); setSynced(false); setError(''); }}
                    required
                  />
                  <button className="btn btn-primary px-4 fw-bold" type="submit" style={{ minHeight: 52, whiteSpace: 'nowrap' }}
                    disabled={loading}>
                    {loading ? '…' : '🔍 Check'}
                  </button>
                </div>
                {error && <div className="text-danger small mt-2">{error}</div>}
              </form>
            </div>
          </div>

          {(links.link1 || links.link2) && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="mb-3 fw-bold" style={{ fontSize: '15px', color: '#1e293b' }}>External Bureau Integrations</h5>
                <div className="d-flex flex-column gap-2">
                  {links.link1 && (
                    <a href={links.link1} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary text-start fw-semibold py-3" style={{ border: '1.5px solid #2563eb', color: '#2563eb', background: '#eff6ff' }}>
                      🔗 Official CIBIL Portal
                    </a>
                  )}
                  {links.link2 && (
                    <a href={links.link2} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary text-start fw-semibold py-3" style={{ border: '1.5px solid #64748b', color: '#475569', background: '#f8fafc' }}>
                      🔗 Secondary Bureau (Equifax / Experian)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="card shadow-sm border-0" style={{ borderTop: `4px solid ${result.color}` }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="text-muted small">PAN</span>
                    <div className="fw-bold" style={{ letterSpacing: 2 }}>{result.pan}</div>
                  </div>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: result.color, fontSize: 13 }}>
                    {result.icon} {result.label}
                  </span>
                </div>

                {/* Score gauge */}
                <div className="text-center py-3">
                  <div style={{ fontSize: 72, fontWeight: 800, color: result.color, lineHeight: 1 }}>
                    {result.score}
                  </div>
                  <p className="text-muted small mt-1 mb-0">out of 900</p>
                  <div className="progress mt-3" style={{ height: 10, borderRadius: 99 }}>
                    <div className="progress-bar" role="progressbar"
                      style={{ width: `${((result.score - 300) / 600) * 100}%`, background: result.color, borderRadius: 99 }}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">300</small>
                    <small className="text-muted">900</small>
                  </div>
                </div>

                <hr />

                {/* Sync to Lead */}
                <div>
                  <p className="fw-semibold small mb-2">Sync to Lead Record</p>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      style={{ minHeight: 48 }}
                      placeholder="Lead ID (e.g. 42)"
                      type="number"
                      min="1"
                      value={leadId}
                      onChange={e => { setLeadId(e.target.value); setSynced(false); }}
                    />
                    <button className="btn btn-success px-3 fw-bold" style={{ minHeight: 48 }}
                      onClick={handleSync} disabled={syncing || synced}>
                      {synced ? '✅ Synced' : syncing ? '…' : 'Sync'}
                    </button>
                  </div>
                  {synced && <div className="text-success small mt-2">CIBIL score saved to lead #{leadId}.</div>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
