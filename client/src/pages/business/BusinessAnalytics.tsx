import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessAnalytics() {
  const [, setLocation] = useLocation();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['businessAnalytics'],
    queryFn: async () => {
      const res = await fetch('/api/business/analytics', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
  });

  return (
    <BusinessLayout activeSection="analytics">
      <style>{`
        .analytics-wrapper {
          width: 100%;
          max-width: none;
        }

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

        .analytics-grid {
          display: grid;
          gap: 24px;
          margin-bottom: 24px;
        }

        .analytics-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 24px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .empty-state-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          opacity: 0.3;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .empty-state-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }
      `}</style>

      <div className="analytics-wrapper">
        <div className="editorial-header">
          <span className="section-number">04</span>
          <div className="header-content">
            <h1 className="section-title">Analytics</h1>
            <p className="section-description">Análisis detallado de tu negocio</p>
          </div>
        </div>

        {isLoading ? (
          <div className="analytics-card">
            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Cargando analytics...</p>
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3 className="card-title">Ingresos por Mes</h3>
              {analyticsData?.revenueData && analyticsData.revenueData.length > 0 ? (
                <div>
                  {analyticsData.revenueData.map((item: any, index: number) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < analyticsData.revenueData.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <span style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                        {item.month}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                        RD${item.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <p className="empty-state-text">Los datos aparecerán aquí una vez que haya transacciones</p>
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h3 className="card-title">Top Perks</h3>
              {analyticsData?.topPerks && analyticsData.topPerks.length > 0 ? (
                <div>
                  {analyticsData.topPerks.map((perk: any, index: number) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: index < analyticsData.topPerks.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%',
                        background: 'rgba(14, 17, 22, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ink)'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: '14px', color: 'var(--ink)' }}>
                        {perk.title}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>
                        {perk.redemptions} redenciones
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.5 15.5L19 19"/>
                  </svg>
                  <p className="empty-state-text">Crea perks para ver su rendimiento aquí</p>
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h3 className="card-title">Adquisición de Clientes</h3>
              {analyticsData?.acquisitionData && analyticsData.acquisitionData.length > 0 ? (
                <div>
                  {analyticsData.acquisitionData.map((item: any, index: number) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: index < analyticsData.acquisitionData.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <span style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                        {item.month}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                        {item.customers} clientes
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <p className="empty-state-text">Los datos de adquisición aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
