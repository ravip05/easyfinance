import React, { useState } from 'react';

const ClientVault = ({ documents = [] }) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="client-vault">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Document Vault</h3>
        <button 
          className="btn-primary btn-sm"
          onClick={() => setIsUploading(true)}
        >
          + Upload New
        </button>
      </div>

      <div className="documents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {documents.map(doc => (
          <div key={doc.id} className="card-glass doc-card" style={{ padding: '15px', position: 'relative' }}>
            <div className="doc-icon" style={{ fontSize: '32px', marginBottom: '10px' }}>
              {doc.type === 'pdf' ? '📄' : '🖼️'}
            </div>
            <div className="doc-info">
              <p className="font-bold truncate" style={{ fontSize: '14px' }}>{doc.name}</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>{doc.date}</p>
            </div>
            <div className="doc-actions" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button className="btn-secondary btn-sm" style={{ flex: 1 }}>View</button>
              <button className="btn-danger btn-sm" title="Delete">🗑️</button>
            </div>
          </div>
        ))}
        
        {documents.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'var(--bg-lighter)', borderRadius: '12px' }}>
            <p>No documents found.</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Upload your identity proofs and income documents here.</p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="modal-overlay">
          <div className="modal-content card-glass" style={{ maxWidth: '400px' }}>
            <h2>Upload Document</h2>
            <div className="upload-zone" style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '30px', textAlign: 'center', marginTop: '20px', cursor: 'pointer' }}>
              <span style={{ fontSize: '40px' }}>📁</span>
              <p style={{ marginTop: '10px' }}>Click to select or take a photo</p>
              <p className="text-muted" style={{ fontSize: '12px' }}>Supports PDF, JPG, PNG</p>
            </div>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Document Name</label>
              <input type="text" className="form-input" placeholder="e.g. Aadhar Card" />
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setIsUploading(false)}>Cancel</button>
              <button className="btn-primary">Start Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientVault;
