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
      <header className="page-header mb-4">
        <h1 className="page-title">Announcements</h1>
        <p className="text-muted">Internal broadcast and notice board.</p>
      </header>

      {isAdmin && (
        <section className="card shadow-sm border-0 mb-5">
          <div className="card-header bg-primary text-white">
            <h2 className="h6 mb-0 text-white">Broadcast New Announcement</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter announcement title"
                    value={form.title} 
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required 
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Message Content</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Type the notice details here..."
                    value={form.content} 
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    required 
                    style={{ fontSize: '16px', padding: '12px' }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Target Role</label>
                  <select 
                    className="form-select"
                    value={form.target_role}
                    onChange={(e) => setForm({...form, target_role: e.target.value})}
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    <option value="all">Broadcast to All</option>
                    <option value="staff">Staff Only</option>
                    <option value="manager">Managers Only</option>
                    <option value="franchise">Franchise Only</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Expires At (Optional)</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={form.expires_at}
                    onChange={(e) => setForm({...form, expires_at: e.target.value})}
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  />
                </div>
                <div className="col-12 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4" 
                    disabled={submitting} 
                    style={{ minHeight: '48px' }}
                  >
                    {submitting ? 'Broadcasting...' : 'Publish Announcement'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="feed-section">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5">
            <p className="text-muted mb-0">No active announcements right now.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {announcements.map(ann => (
              <div key={ann.id} className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="h5 mb-0 font-weight-bold d-flex align-items-center gap-2">
                      {ann.title}
                      {isNew(ann.created_at) && (
                        <span className="badge bg-success rounded-pill text-xs">NEW</span>
                      )}
                    </h3>
                    <span className="text-muted small">
                      {new Date(ann.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <p className="card-text text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
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
