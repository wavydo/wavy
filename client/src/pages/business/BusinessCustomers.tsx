import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessCustomers() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [, setLocation] = useLocation();

  // Fetch real customers from database
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['businessCustomers'],
    queryFn: async () => {
      const res = await fetch('/api/business/customers', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Customers fetch error:', errorText);
        throw new Error('Failed to fetch customers');
      }
      return res.json();
    }
  });

  if (error) {
    return (
      <BusinessLayout activeSection="customers">
        <div style={{ 
          padding: '60px 20px', 
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '12px' }}>
            Error al cargar clientes
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {(error as Error).message}
          </p>
        </div>
      </BusinessLayout>
    );
  }

  const allCustomers = customersData?.customers || [];
  
  // Classify customers based on their activity
  const getCustomerStatus = (customer: any) => {
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastVisit > 30) return 'inactive';
    if (customer.visits <= 2) return 'new';
    if (customer.totalSpent > 20000) return 'vip';
    return 'regular';
  };

  const customers = allCustomers.map((c: any) => ({
    ...c,
    status: getCustomerStatus(c)
  })).filter((c: any) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  // Calculate stats
  const totalCustomers = allCustomers.length;
  const vipCount = allCustomers.filter((c: any) => getCustomerStatus(c) === 'vip').length;
  const newCount = allCustomers.filter((c: any) => getCustomerStatus(c) === 'new').length;
  const avgLifetimeValue = totalCustomers > 0
    ? allCustomers.reduce((sum: number, c: any) => sum + c.totalSpent, 0) / totalCustomers
    : 0;

  const getInitials = (fullName: string) => {
    if (!fullName) return '??';
    const names = fullName.split(' ');
    return names.map(n => n && n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || '??';
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return '1 day ago';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return `${Math.floor(daysDiff / 30)} months ago`;
  };

  return (
    <BusinessLayout activeSection="customers">
      <style>{`
        .editorial-header {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 40px;
            padding-bottom: 32px;
            border-bottom: 1px solid var(--border);
        }

        .section-number {
            font-size: 14px;
            font-weight: 600;
            color: #cbd5e1;
            min-width: 32px;
            padding-top: 4px;
        }

        .header-content {
            flex: 1;
        }

        .section-title {
            font-size: 32px;
            font-weight: 300;
            color: var(--ink);
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .section-description {
            font-size: 15px;
            color: var(--muted);
            line-height: 1.6;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--ink);
        }

        .btn svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
        }

        .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .stat-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--ink);
        }

        .filter-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
            flex-wrap: wrap;
        }

        .filter-tab {
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            color: var(--muted);
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid transparent;
        }

        .filter-tab.active {
            background: var(--ink);
            color: #ffffff;
        }

        .customer-table {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid var(--border);
            overflow: hidden;
        }

        .table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
            padding: 16px 20px;
            background: rgba(14, 17, 22, 0.02);
            border-bottom: 1px solid var(--border);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
        }

        .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            align-items: center;
            transition: background 180ms ease;
        }

        .table-row:hover {
            background: rgba(14, 17, 22, 0.02);
        }

        .table-row:last-child {
            border-bottom: none;
        }

        .customer-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .customer-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
        }

        .customer-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--ink);
        }

        .customer-email {
            font-size: 12px;
            color: var(--muted);
        }

        .badge {
            display: inline-flex;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge.vip {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }

        .badge.regular {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .badge.new {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .badge.inactive {
            background: rgba(91, 100, 114, 0.1);
            color: var(--muted);
        }

        .action-btn {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--ink);
        }

        .action-btn:hover {
            background: rgba(14, 17, 22, 0.04);
        }

        @media (max-width: 1024px) {
            .table-header, .table-row {
                grid-template-columns: 1fr;
                gap: 8px;
            }

            .table-header {
                display: none;
            }

            .table-row {
                padding: 20px;
            }
        }
      `}</style>

      <div className="editorial-header">
        <span className="section-number">03</span>
        <div className="header-content">
          <h1 className="section-title">Customers</h1>
          <p className="section-description">View and manage your Wavy members</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="btn">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{isLoading ? '...' : totalCustomers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">VIP Members</div>
          <div className="stat-value">{isLoading ? '...' : vipCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New This Month</div>
          <div className="stat-value">{isLoading ? '...' : `+${newCount}`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Return Rate</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Lifetime Value</div>
          <div className="stat-value">{isLoading ? '...' : `RD$${(avgLifetimeValue / 1000).toFixed(1)}K`}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        <div className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Customers</div>
        <div className={`filter-tab ${activeFilter === 'vip' ? 'active' : ''}`} onClick={() => setActiveFilter('vip')}>VIP</div>
        <div className={`filter-tab ${activeFilter === 'regular' ? 'active' : ''}`} onClick={() => setActiveFilter('regular')}>Regular</div>
        <div className={`filter-tab ${activeFilter === 'new' ? 'active' : ''}`} onClick={() => setActiveFilter('new')}>New</div>
        <div className={`filter-tab ${activeFilter === 'inactive' ? 'active' : ''}`} onClick={() => setActiveFilter('inactive')}>Inactive</div>
      </div>

      {/* Customer Table */}
      <div className="customer-table">
        <div className="table-header">
          <div>Customer</div>
          <div>Status</div>
          <div>Visits</div>
          <div>Total Spent</div>
          <div>Last Visit</div>
          <div></div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            {activeFilter === 'all' ? 'No customers yet' : `No ${activeFilter} customers`}
          </div>
        ) : (
          customers.map((customer: any, index: number) => (
            <div key={customer.id} className="table-row">
              <div className="customer-info">
                <div className="customer-avatar" style={{ background: getAvatarColor(index) }}>
                  {getInitials(customer.fullName || customer.email)}
                </div>
                <div>
                  <div className="customer-name">{customer.fullName || 'Unknown'}</div>
                  <div className="customer-email">{customer.email}</div>
                </div>
              </div>
              <div><span className={`badge ${customer.status}`}>{customer.status.toUpperCase()}</span></div>
              <div style={{ fontWeight: 600 }}>{customer.visits}</div>
              <div style={{ fontWeight: 600 }}>RD${customer.totalSpent.toLocaleString()}</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{formatDate(customer.lastVisit)}</div>
              <div><button className="action-btn">View</button></div>
            </div>
          ))
        )}
      </div>
    </BusinessLayout>
  );
}
