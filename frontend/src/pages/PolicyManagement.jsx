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
      <div className="empty">
        <div className="empty-icon">🔒</div>
        <div className="empty-text">Admin Access Only. You need admin privileges to manage bank policies.</div>
      </div>
    );
  }

  useEffect(() => { fetchPolicies(); }, []);

  async function fetchPolicies() {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/bank-policies');
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
        await apiClient.put(`/bank-policies/${editingId}`, form);
      } else {
        await apiClient.post('/bank-policies', form);
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
      await apiClient.delete(`/bank-policies/${id}`);
      fetchPolicies();
    } catch {
      alert('Failed to delete policy.');
    }
  }

  return (
    <div id="page-policy-management" className="page active" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>⚙️ Policy Management</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>Add, edit, or remove bank lending policies globally.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + Add New Policy
        </button>
      </div>

      {/* Editing Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--accent)' }}>
          <div className="card-header">
            <div className="card-title">{editingId ? '✏️ Edit Policy' : '✨ New Policy'}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="card-body">
            {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12, padding: 8, background: 'var(--red-light)', borderRadius: 6 }}>{error}</div>}
            
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bank Name <span className="req">*</span></label>
                  <input className="form-input" placeholder="e.g. HDFC Bank"
                    value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Code <span className="req">*</span></label>
                  <input className="form-input" placeholder="e.g. HDFC"
                    value={form.bank_code} onChange={e => setForm(f => ({...f, bank_code: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category <span className="req">*</span></label>
                  <select className="form-select"
                    value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Policy URL</label>
                  <input className="form-input" placeholder="https://..." type="url"
                    value={form.policy_url} onChange={e => setForm(f => ({...f, policy_url: e.target.value}))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Key eligibility criteria..." rows={2}
                    value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="policyActive" style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    checked={!!form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked ? 1 : 0}))} />
                  <label htmlFor="policyActive" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}>Set as Active</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Policy' : '✓ Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policies Table */}
      {loading ? (
        <div className="empty">
          <div className="empty-icon" style={{ animation: 'pulse 1.5s infinite' }}>⏳</div>
          <div className="empty-text">Loading policies...</div>
        </div>
      ) : policies.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📂</div>
          <div className="empty-text">No policies configured yet.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Bank</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id}>
                    <td style={{ paddingLeft: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏦</div>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.bank_name}</span>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>{p.bank_code}</span></td>
                    <td><span className="badge badge-new">{p.category}</span></td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent)' }} onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-ghost btn-xs" style={{ color: 'var(--red)' }} onClick={() => handleDelete(p.id, p.bank_name)}>🗑</button>
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
