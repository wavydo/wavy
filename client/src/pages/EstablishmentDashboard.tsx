import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function EstablishmentDashboard() {
  const [, setLocation] = useLocation();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['establishmentDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/merchant/dashboard', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        throw new Error('Failed to load dashboard');
      }
      return res.json();
    },
    retry: false,
  });

  // Redirect to auth if unauthorized
  useEffect(() => {
    if (error && error.message === 'UNAUTHORIZED') {
      setLocation('/auth');
    }
  }, [error, setLocation]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    setLocation('/auth');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }} />
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 400,
            letterSpacing: '0.05em'
          }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
            {error.message === 'UNAUTHORIZED' ? 'Redirecting to login...' : 'Error loading dashboard'}
          </p>
        </div>
      </div>
    );
  }

  const establishment = dashboard?.establishment;
  const stats = dashboard?.stats;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 200,
            color: '#fff',
            marginBottom: '0.5rem'
          }}>
            {establishment?.businessName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Plan: <span style={{ color: '#667eea', fontWeight: 600, textTransform: 'uppercase' }}>{establishment?.subscriptionPlan}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Ingresos Totales
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 200, color: '#22c55e' }}>
              RD$ {stats?.totalRevenue || '0.00'}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Total Transacciones
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 200, color: '#fff' }}>
              {stats?.totalTransactions || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Clientes Únicos
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 200, color: '#fff' }}>
              {stats?.totalCustomers || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Descuento Ofrecido
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 200, color: '#667eea' }}>
              {establishment?.discountPercentage || 0}%
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#fff',
            marginBottom: '1.5rem'
          }}>
            Información del Negocio
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Dueño
              </div>
              <div style={{ color: '#fff' }}>{establishment?.ownerName}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Categoría
              </div>
              <div style={{ color: '#fff', textTransform: 'capitalize' }}>{establishment?.category}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Teléfono
              </div>
              <div style={{ color: '#fff' }}>{establishment?.phone}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Email
              </div>
              <div style={{ color: '#fff' }}>{establishment?.email}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Dirección
              </div>
              <div style={{ color: '#fff' }}>{establishment?.address}, {establishment?.city}</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#fff',
            marginBottom: '1.5rem'
          }}>
            Transacciones Recientes
          </h2>
          {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              No hay transacciones aún.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      Fecha
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      Monto Original
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      Descuento
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                      Monto Final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((transaction: any) => (
                    <tr key={transaction.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        {new Date(transaction.createdAt).toLocaleString('es-DO')}
                      </td>
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        RD$ {parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', color: '#ef4444' }}>
                        -RD$ {parseFloat(transaction.discountApplied).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', color: '#22c55e', fontWeight: 600 }}>
                        RD$ {parseFloat(transaction.finalAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
