import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';

interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  user_account: string;
  amount: string;
  final_amount: string;
  type: string;
  category: string;
  status: string;
  created_at: string;
  recipient_account?: string;
  sender_account?: string;
  note?: string;
  establishment_name?: string;
}

export default function TransactionManagement() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'reverse' | 'duplicate' | 'report' | 'suspend' | null;
    reason?: string;
  }>({ type: null });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['adminTransactions', filterStatus, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/transactions?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  const transactionActionMutation = useMutation({
    mutationFn: async ({ 
      transactionId, 
      action, 
      reason 
    }: { 
      transactionId: string; 
      action: string; 
      reason?: string 
    }) => {
      const res = await fetch(`/api/admin/transactions/${transactionId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to ${action} transaction`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      setSelectedTransaction(null);
      setActionModal({ type: null });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      case 'reversed': return '#8b5cf6';
      case 'reported': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: `${getStatusColor(status)}20`,
      color: getStatusColor(status),
      textTransform: 'uppercase',
    }}>
      {status}
    </span>
  );

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
        Cargando transacciones...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1800px',
        margin: '0 auto',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setLocation('/admin')}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ← Volver
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 200,
            color: '#fff',
          }}>
            Transaction Management
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
          Ver, analizar y gestionar todas las transacciones del sistema
        </p>
      </div>

      <div style={{
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Buscar por usuario, cuenta, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              outline: 'none',
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="pending">Pendientes</option>
            <option value="suspended">Suspendidas</option>
            <option value="reversed">Reversadas</option>
            <option value="reported">Reportadas</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Usuario</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Tipo</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Monto</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Fecha</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.transactions?.map((tx: Transaction) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {tx.id.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '1rem', color: '#fff' }}>
                    <div>{tx.user_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{tx.user_account}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#fff' }}>
                    <div style={{ fontSize: '0.85rem' }}>{tx.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{tx.type}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: tx.type === 'debit' ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {tx.type === 'debit' ? '-' : '+'}RD$ {parseFloat(tx.final_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {getStatusBadge(tx.status)}
                  </td>
                  <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {new Date(tx.created_at).toLocaleString('es-ES')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(tx);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!transactions?.transactions || transactions.transactions.length === 0) && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              No se encontraron transacciones
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
          overflow: 'auto',
        }}>
          <div style={{
            background: 'rgba(10,10,15,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Detalles de Transacción
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  ID: {selectedTransaction.id}
                </p>
              </div>
              {getStatusBadge(selectedTransaction.status)}
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Usuario</div>
                <div style={{ color: '#fff', fontSize: '1rem' }}>{selectedTransaction.user_name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{selectedTransaction.user_account}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Tipo</div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{selectedTransaction.category}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Monto</div>
                  <div style={{ color: selectedTransaction.type === 'debit' ? '#ef4444' : '#22c55e', fontSize: '1.25rem', fontWeight: 600 }}>
                    {selectedTransaction.type === 'debit' ? '-' : '+'}RD$ {parseFloat(selectedTransaction.final_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {selectedTransaction.recipient_account && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Cuenta Destino</div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{selectedTransaction.recipient_account}</div>
                </div>
              )}

              {selectedTransaction.sender_account && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Cuenta Origen</div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{selectedTransaction.sender_account}</div>
                </div>
              )}

              {selectedTransaction.note && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Nota</div>
                  <div style={{ color: '#fff', fontSize: '1rem' }}>{selectedTransaction.note}</div>
                </div>
              )}

              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Fecha y Hora</div>
                <div style={{ color: '#fff', fontSize: '1rem' }}>
                  {new Date(selectedTransaction.created_at).toLocaleString('es-ES', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedTransaction.status === 'completed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setActionModal({ type: 'reverse' })}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reversar
                </button>
                <button
                  onClick={() => setActionModal({ type: 'suspend' })}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Suspender
                </button>
                <button
                  onClick={() => setActionModal({ type: 'report' })}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reportar
                </button>
                <button
                  onClick={() => setActionModal({ type: 'duplicate' })}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Duplicar
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedTransaction(null)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal.type && selectedTransaction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '2rem',
        }}>
          <div style={{
            background: 'rgba(10,10,15,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%',
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Confirmar {actionModal.type === 'reverse' ? 'Reversión' : actionModal.type === 'suspend' ? 'Suspensión' : actionModal.type === 'report' ? 'Reporte' : 'Duplicación'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
              {actionModal.type === 'reverse' && 'Esto reversará la transacción y devolverá los fondos.'}
              {actionModal.type === 'suspend' && 'Los fondos serán removidos temporalmente hasta resolver disputa.'}
              {actionModal.type === 'report' && 'Marcar esta transacción para revisión manual.'}
              {actionModal.type === 'duplicate' && 'Crear una copia idéntica de esta transacción.'}
            </p>
            <textarea
              placeholder="Razón (opcional)"
              value={actionModal.reason || ''}
              onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                marginBottom: '1.5rem',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  transactionActionMutation.mutate({
                    transactionId: selectedTransaction.id,
                    action: actionModal.type!,
                    reason: actionModal.reason,
                  });
                }}
                disabled={transactionActionMutation.isPending}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: transactionActionMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: transactionActionMutation.isPending ? 0.5 : 1,
                }}
              >
                {transactionActionMutation.isPending ? 'Procesando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setActionModal({ type: null })}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
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
