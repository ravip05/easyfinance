import React from 'react';

const FranchiseStats = ({ data = {} }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const performancePercent = Math.min(100, Math.round((data.collection / data.target) * 100) || 0);

  return (
    <div className="franchise-stats">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card card-glass">
          <h3>Total Collection</h3>
          <p className="stat-value text-blue">{formatCurrency(data.collection)}</p>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
              <span>Target Progress</span>
              <span className="font-bold">{performancePercent}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px', background: 'var(--bg-lighter)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  height: '100%', 
                  width: `${performancePercent}%`, 
                  background: 'var(--blue-primary)',
                  transition: 'width 1s ease-out'
                }} 
              />
            </div>
          </div>
        </div>

        <div className="stat-card card-glass">
          <h3>Active Clients</h3>
          <p className="stat-value">{data.active_clients || 0}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '5px' }}>
            +{data.new_clients_this_month || 0} this month
          </p>
        </div>

        <div className="stat-card card-glass">
          <h3>Franchise Payout</h3>
          <p className="stat-value text-green">{formatCurrency(data.unpaid_commission)}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '5px' }}>
            Available for withdrawal
          </p>
        </div>
      </div>

      <div className="card-glass">
        <h3>Branch Performance</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {(data.branches || []).map(branch => {
            const branchPercent = Math.round((branch.collection / data.collection) * 100) || 0;
            return (
              <div key={branch.id} className="branch-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-muted">{formatCurrency(branch.collection)} ({branchPercent}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-lighter)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${branchPercent}%`, 
                      background: 'var(--success-color)',
                      opacity: 0.8
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FranchiseStats;
