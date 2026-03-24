import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('crm_user') || '{}');
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    title: '',
    content: '',
    target_role: 'all',
    expires_at: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/announcements');
      if (data?.data) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/announcements', form);
      setForm({ title: '', content: '', target_role: 'all', expires_at: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isNew = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 3;
  };

  return (
    <div className="page-container fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(220,38,38,0.05))', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg, #d97706, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Notice Board
        </h1>
        <p className="text-muted mt-2" style={{ fontSize: '1.1rem' }}>Internal broadcasts, important updates, and announcements.</p>
      </header>

      {isAdmin && (
        <section className="card shadow-sm border-0 mb-5" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-header border-bottom-0" style={{ background: 'linear-gradient(90deg, #1e293b, #334155)', padding: '20px 24px' }}>
            <h2 className="h6 mb-0 text-white d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.2rem' }}>📢</span> Broadcast New Announcement
            </h2>
          </div>
          <div className="card-body p-4 bg-white">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Announcement Title</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter a clear, descriptive title..."
                    value={form.title} 
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required 
                    style={{ minHeight: '54px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Message Content</label>
                  <textarea 
                    className="form-control"
                    rows="4"
                    placeholder="Draft your announcement here. Markdown is not supported yet."
                    value={form.content} 
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    required 
                    style={{ fontSize: '16px', padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-bold">Target Audience</label>
                  <select 
                    className="form-select"
                    value={form.target_role}
                    onChange={(e) => setForm({...form, target_role: e.target.value})}
                    style={{ minHeight: '54px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  >
                    <option value="all">Broadcast to All</option>
                    <option value="staff">Staff Only</option>
                    <option value="manager">Managers Only</option>
                    <option value="franchise">Franchise Only</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-bold">Expires At (Optional)</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={form.expires_at}
                    onChange={(e) => setForm({...form, expires_at: e.target.value})}
                    style={{ minHeight: '54px', fontSize: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div className="col-12 mt-4 pt-2 border-top">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-5 fw-bold" 
                    disabled={submitting} 
                    style={{ minHeight: '54px', borderRadius: '10px', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', border: 'none' }}
                  >
                    {submitting ? 'Broadcasting...' : 'Publish Announcement'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="feed-section position-relative">
        <div style={{ position: 'absolute', left: '28px', top: '0', bottom: '0', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px', background: '#f8fafc' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5 }}>📭</span>
            <h4 className="mt-3 text-muted">No active announcements right now.</h4>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4 position-relative z-1">
            {announcements.map(ann => (
              <div key={ann.id} className="card border-0 shadow-sm" style={{ borderRadius: '16px', marginLeft: '60px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div 
                  className="position-absolute" 
                  style={{ left: '-46px', top: '24px', width: '32px', height: '32px', borderRadius: '50%', background: isNew(ann.created_at) ? '#ef4444' : '#94a3b8', border: '4px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 2 }}
                />
                
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
                    <div>
                      <h3 className="h5 mb-1 font-weight-bold d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                        {ann.title}
                        {isNew(ann.created_at) && (
                          <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>NEW</span>
                        )}
                      </h3>
                      <span className="text-muted small d-flex align-items-center gap-1">
                        📅 {new Date(ann.created_at).toLocaleDateString(undefined, { 
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="card-text text-secondary mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem' }}>
                    {ann.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
