import React from 'react';

const CommissionDashboard = ({ payouts = [], stats = {} }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="commission-dashboard">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card card-glass">
          <h3>Total Earned</h3>
          <p className="stat-value text-blue">{formatCurrency(stats.total_earned)}</p>
        </div>
        <div className="stat-card card-glass">
          <h3>Paid Out</h3>
          <p className="stat-value text-green">{formatCurrency(stats.total_paid)}</p>
        </div>
        <div className="stat-card card-glass">
          <h3>Pending</h3>
          <p className="stat-value text-orange">{formatCurrency(stats.pending_amount)}</p>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Payout History</h3>
        </div>
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(payouts) ? payouts : (payouts?.data || [])).length > 0 ? (Array.isArray(payouts) ? payouts : (payouts?.data || [])).map(payout => (
                <tr key={payout.id}>
                  <td>{new Date(payout.payout_date).toLocaleDateString()}</td>
                  <td className="font-bold">{formatCurrency(payout.amount)}</td>
                  <td>{payout.payment_method}</td>
                  <td>{payout.reference_number || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${payout.status === 'Paid' ? 'success' : 'warning'}`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    No payout history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionDashboard;
