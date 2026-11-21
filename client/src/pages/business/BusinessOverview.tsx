import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessOverview() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['businessStats'],
    queryFn: async () => {
      const res = await fetch('/api/business/stats', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <BusinessLayout activeSection="overview">
      <style>{`
        /* ===== FULL WIDTH WRAPPER ===== */
        .business-overview-wrapper {
          width: 100%;
          max-width: none;
        }

        /* ===== EDITORIAL HERO SECTION ===== */
        .hero-section {
          padding: 44px 0 36px;
          width: 100%;
        }

        .time-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .time-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          margin-right: 10px;
        }

        .time-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: #64748b;
          text-transform: uppercase;
        }

        .hero-greeting {
          font-size: 48px;
          font-weight: 200;
          color: #1e293b;
          letter-spacing: -0.8px;
          margin-bottom: 32px;
          line-height: 1.2;
        }

        .revenue-display {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .revenue-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .revenue-amount {
          font-size: 72px;
          font-weight: 100;
          color: #0f172a;
          letter-spacing: -2px;
          margin-bottom: 16px;
          font-variant-numeric: tabular-nums;
        }

        .revenue-change {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .change-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .change-indicator svg {
          width: 14px;
          height: 14px;
          stroke: #10b981;
        }

        .change-text {
          font-size: 14px;
          font-weight: 500;
          color: #10b981;
        }

        /* ===== STATS GRID - MINIMALIST ===== */
        .stats-grid-minimal {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin: 40px 0;
          width: 100%;
        }

        .stat-card-minimal {
          background: #ffffff;
          padding: 28px 24px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          transition: all 200ms ease;
        }

        .stat-card-minimal:hover {
          border-color: rgba(15, 23, 42, 0.12);
          transform: translateY(-2px);
        }

        .stat-label-minimal {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .stat-value-minimal {
          font-size: 36px;
          font-weight: 300;
          color: #0f172a;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -1px;
        }

        .stat-sublabel {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        /* ===== SECTION HEADERS ===== */
        .section-header-editorial {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin: 48px 0 24px;
          width: 100%;
        }

        .section-number {
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
          min-width: 32px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 300;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        /* ===== QUICK ACTIONS - REFINED ===== */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          width: 100%;
        }

        .action-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .action-card:hover {
          border-color: rgba(15, 23, 42, 0.12);
          transform: translateY(-2px);
          background: #fafbfc;
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-icon svg {
          width: 20px;
          height: 20px;
          stroke: #0f172a;
        }

        .action-text {
          flex: 1;
        }

        .action-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .action-subtitle {
          font-size: 12px;
          color: #64748b;
        }

        /* ===== LOADING STATE ===== */
        .loading-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .hero-greeting {
            font-size: 32px;
          }
          
          .revenue-amount {
            font-size: 48px;
          }

          .stats-grid-minimal {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="business-overview-wrapper">
        {/* Hero Section - Editorial Layout */}
        <div className="hero-section">
        <div className="time-indicator">
          <div className="time-dot"></div>
          <span className="time-text">Today • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <h1 className="hero-greeting">{getGreeting()}</h1>

        <div className="revenue-display">
          <div className="revenue-label">Monthly Revenue</div>
          {isLoading ? (
            <div className="loading-skeleton" style={{ width: '280px', height: '72px' }}></div>
          ) : (
            <div className="revenue-amount">
              RD${(stats?.monthlyRevenue || 0).toLocaleString()}
            </div>
          )}
          <div className="revenue-change">
            <div className="change-indicator">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </div>
            <span className="change-text">This month</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-minimal">
        <div className="stat-card-minimal">
          <div className="stat-label-minimal">Transactions</div>
          {isLoading ? (
            <div className="loading-skeleton" style={{ width: '120px', height: '42px', marginBottom: '8px' }}></div>
          ) : (
            <div className="stat-value-minimal">{(stats?.monthlyTransactions || 0).toLocaleString()}</div>
          )}
          <div className="stat-sublabel">This month</div>
        </div>

        <div className="stat-card-minimal">
          <div className="stat-label-minimal">New Customers</div>
          {isLoading ? (
            <div className="loading-skeleton" style={{ width: '100px', height: '42px', marginBottom: '8px' }}></div>
          ) : (
            <div className="stat-value-minimal">{(stats?.monthlyCustomers || 0).toLocaleString()}</div>
          )}
          <div className="stat-sublabel">This month</div>
        </div>

        <div className="stat-card-minimal">
          <div className="stat-label-minimal">Total Customers</div>
          {isLoading ? (
            <div className="loading-skeleton" style={{ width: '100px', height: '42px', marginBottom: '8px' }}></div>
          ) : (
            <div className="stat-value-minimal">{(stats?.totalCustomers || 0).toLocaleString()}</div>
          )}
          <div className="stat-sublabel">All time</div>
        </div>

        <div className="stat-card-minimal">
          <div className="stat-label-minimal">Active Perks</div>
          {isLoading ? (
            <div className="loading-skeleton" style={{ width: '80px', height: '42px', marginBottom: '8px' }}></div>
          ) : (
            <div className="stat-value-minimal">{stats?.activePerks || 0}</div>
          )}
          <div className="stat-sublabel">Currently live</div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="section-header-editorial">
        <span className="section-number">01</span>
        <h2 className="section-title">Quick Actions</h2>
      </div>

      <div className="quick-actions-grid">
        <div className="action-card" onClick={() => setLocation('/business/perks')}>
          <div className="action-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div className="action-text">
            <div className="action-title">Create Perk</div>
            <div className="action-subtitle">Add new discount or reward</div>
          </div>
        </div>

        <div className="action-card" onClick={() => setLocation('/business/events')}>
          <div className="action-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="action-text">
            <div className="action-title">New Event</div>
            <div className="action-subtitle">Schedule upcoming event</div>
          </div>
        </div>

        <div className="action-card" onClick={() => setLocation('/business/drops')}>
          <div className="action-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="action-text">
            <div className="action-title">Launch Drop</div>
            <div className="action-subtitle">Create limited-time offer</div>
          </div>
        </div>

        <div className="action-card" onClick={() => setLocation('/business/customers')}>
          <div className="action-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div className="action-text">
            <div className="action-title">View Analytics</div>
            <div className="action-subtitle">Customer insights & trends</div>
          </div>
        </div>
      </div>
      </div>
    </BusinessLayout>
  );
}
