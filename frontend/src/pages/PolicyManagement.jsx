import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { bank_name: '', bank_code: '', category: 'Home', description: '', policy_url: '', is_active: 1 };
const CATEGORIES = ['Home', 'Personal', 'Business', 'Car', 'LAP', 'Insurance'];

export default function PolicyManagement() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <div className="page-container fade-in text-center py-5">
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 className="h4 mt-3">Admin Access Only</h2>
        <p className="text-muted">You need admin privileges to manage bank policies.</p>
      </div>
    );
  }

  useEffect(() => { fetchPolicies(); }, []);

  async function fetchPolicies() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/bank-policies');
      setPolicies(data?.data ?? []);
    } catch { setPolicies([]); }
    setLoading(false);
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(policy) {
    setForm({
      bank_name: policy.bank_name,
      bank_code: policy.bank_code,
      category: policy.category,
      description: policy.description || '',
      policy_url: policy.policy_url || '',
      is_active: policy.is_active,
    });
    setEditingId(policy.id);
    setError('');
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await apiClient.put(`/api/bank-policies/${editingId}`, form);
      } else {
        await apiClient.post('/api/bank-policies', form);
      }
      setShowForm(false);
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save policy.');
    }
    setSaving(false);
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete policy for "${name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/bank-policies/${id}`);
      fetchPolicies();
    } catch {
      alert('Failed to delete policy.');
    }
  }

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-0">Policy Management</h1>
          <p className="text-muted mb-0 small">Admin-only: Add, edit, or remove bank lending policies.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openNew} style={{ minHeight: 48 }}>
          <span style={{ fontSize: 20 }}>＋</span> Add Policy
        </button>
      </header>

      {/* -- Inline Form -- */}
      {showForm && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>{editingId ? 'Edit Policy' : 'New Policy'}</strong>
            <button className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Bank Name *</label>
                  <input className="form-control" style={{ minHeight: 48 }} placeholder="e.g. HDFC Bank"
                    value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Bank Code *</label>
                  <input className="form-control" style={{ minHeight: 48 }} placeholder="e.g. HDFC"
                    value={form.bank_code} onChange={e => setForm(f => ({...f, bank_code: e.target.value}))} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Category *</label>
                  <select className="form-select" style={{ minHeight: 48 }}
                    value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Policy URL</label>
                  <input className="form-control" style={{ minHeight: 48 }} placeholder="https://..."
                    value={form.policy_url} onChange={e => setForm(f => ({...f, policy_url: e.target.value}))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" rows={2} placeholder="Key eligibility criteria..."
                    value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="policyActive"
                      checked={!!form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked ? 1 : 0}))} />
                    <label className="form-check-label" htmlFor="policyActive">Active</label>
                  </div>
                </div>
                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary" style={{ minHeight: 48 }} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" style={{ minHeight: 48 }} disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Policy' : 'Create Policy'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -- Table -- */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : policies.length === 0 ? (
        <div className="card text-center py-5 border-0">
          <p className="text-muted">No policies yet. Click "Add Policy" to get started.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Bank</th><th>Code</th><th>Category</th><th>Status</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.bank_name}</td>
                    <td><span className="badge bg-light text-dark border">{p.bank_code}</span></td>
                    <td>{p.category}</td>
                    <td>
                      <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-secondary" style={{ minHeight: 36 }}
                          onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-outline-danger" style={{ minHeight: 36 }}
                          onClick={() => handleDelete(p.id, p.bank_name)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
