import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [password, setPassword] = useState('');

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
  });

  const { data: requests } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: async () => {
      const res = await fetch('/api/admin/requests', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setSelectedRequest(null);
      setPassword('');
    },
  });

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
        Cargando...
      </div>
    );
  }

  const stats = dashboard?.stats;
  const pendingRequests = requests?.requests?.filter((r: any) => r.status === 'pending') || [];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '0.25rem',
            letterSpacing: '-0.025em'
          }}>
            Panel de Administración
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem'
          }}>
            Control total de la plataforma TAPP
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              marginBottom: '0.5rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Total Usuarios
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#fff' }}>
              {stats?.totalUsers || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              marginBottom: '0.5rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Establecimientos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#667eea' }}>
              {stats?.approvedEstablishments || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              marginBottom: '0.5rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Pendientes
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#f59e0b' }}>
              {stats?.pendingRequests || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              marginBottom: '0.5rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Transacciones
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#fff' }}>
              {stats?.totalTransactions || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.75rem', 
              marginBottom: '0.5rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Ingresos Totales
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: '#22c55e' }}>
              RD$ {stats?.totalRevenue || '0.00'}
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '1.25rem',
            letterSpacing: '-0.025em'
          }}>
            Solicitudes Pendientes
          </h2>
          {pendingRequests.length === 0 ? (
            <div style={{ 
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.875rem'
            }}>
              No hay solicitudes pendientes
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {pendingRequests.map((request: any) => (
                <div
                  key={request.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ 
                        color: '#fff', 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        marginBottom: '0.25rem',
                        letterSpacing: '-0.025em'
                      }}>
                        {request.businessName}
                      </h3>
                      <p style={{ 
                        color: 'rgba(255,255,255,0.5)', 
                        fontSize: '0.8125rem'
                      }}>
                        {request.ownerName} • {request.category}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Revisar
                    </button>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '0.6875rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>Email</div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '0.8125rem',
                        wordBreak: 'break-word'
                      }}>{request.email}</div>
                    </div>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '0.6875rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>Teléfono</div>
                      <div style={{ color: '#fff', fontSize: '0.8125rem' }}>{request.phone}</div>
                    </div>
                    <div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '0.6875rem',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>Ciudad</div>
                      <div style={{ color: '#fff', fontSize: '0.8125rem' }}>{request.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => setLocation('/admin/transactions')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              Gestión de Transacciones
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Ver, reversar, suspender y gestionar transacciones
            </div>
          </button>

          <button
            onClick={() => setLocation('/admin/users')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              Usuarios
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Gestionar cuentas de clientes
            </div>
          </button>

          <button
            onClick={() => setLocation('/admin/establishments')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              Establecimientos
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Gestionar negocios asociados
            </div>
          </button>

          <button
            onClick={() => setLocation('/admin/cards')}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              Tarjetas NFC
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Crear y administrar tarjetas tokenizadas
            </div>
          </button>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(10,10,15,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Aprobar Establecimiento
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                Establecimiento: <strong style={{ color: '#fff' }}>{selectedRequest.businessName}</strong>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email: <strong style={{ color: '#fff' }}>{selectedRequest.email}</strong>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Contraseña Inicial *
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crear contraseña para el establecimiento"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  if (password.length >= 6) {
                    approveMutation.mutate({ id: selectedRequest.id, password });
                  }
                }}
                disabled={password.length < 6 || approveMutation.isPending}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: password.length < 6 || approveMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: password.length < 6 || approveMutation.isPending ? 0.5 : 1
                }}
              >
                {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setPassword('');
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
