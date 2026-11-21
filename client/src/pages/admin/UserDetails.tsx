import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import '../Dashboard.css';
import './AdminPanel.css';
import './UserDetails.css';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  date_of_birth: string;
  avatar_url: string;
  account_number: string;
  balance: string;
  points: number;
  level: string;
  is_verified: boolean;
  account_suspended: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  total_spent: string;
  total_saved: string;
  transaction_count: number;
  monthly_spent: string;
}

interface Transaction {
  id: string;
  amount: string;
  final_amount: string;
  type: string;
  category: string;
  status: string;
  created_at: string;
  note: string;
  recipient_account: string;
  sender_account: string;
}

interface Warning {
  id: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

interface AdminAction {
  id: string;
  action_type: string;
  reason: string;
  created_at: string;
  metadata: any;
}

export default function UserDetails() {
  const [, params] = useRoute('/admin/users/:id');
  const [, setLocation] = useLocation();
  const userId = params?.id;

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [suspendReason, setSuspendReason] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [warningSeverity, setWarningSeverity] = useState('warning');
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    document.body.classList.add('dashboard-active');

    return () => {
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      document.body.classList.remove('dashboard-active');
    };
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      console.log('Loading user details for:', userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('User data received:', data);
        
        if (!data.user) {
          console.error('No user data in response');
          alert('User data not found');
          return;
        }
        
        setUser(data.user);
        setTransactions(data.transactions || []);
        setWarnings(data.warnings || []);
        setAdminActions(data.adminActions || []);
        setNewBalance(data.user.balance || '0');
        setEditForm({
          email: data.user.email || '',
          full_name: data.user.full_name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          city: data.user.city || '',
          account_number: data.user.account_number || '',
          points: data.user.points || 0,
          level: data.user.level || 'member'
        });
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        alert('Failed to load user details: ' + res.status);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: suspendReason })
      });

      if (res.ok) {
        alert('User suspended successfully');
        setShowSuspendModal(false);
        setSuspendReason('');
        loadUserDetails();
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      alert('Error suspending user');
    }
  };

  const handleUnsuspend = async () => {
    if (!confirm('Are you sure you want to unsuspend this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Account reactivated by admin' })
      });

      if (res.ok) {
        alert('User unsuspended successfully');
        loadUserDetails();
      } else {
        alert('Failed to unsuspend user');
      }
    } catch (error) {
      alert('Error unsuspending user');
    }
  };

  const handleChangeBalance = async () => {
    const amount = parseFloat(newBalance);
    
    if (isNaN(amount)) {
      alert('Invalid amount');
      return;
    }

    if (!balanceReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount, reason: balanceReason })
      });

      if (res.ok) {
        alert('Balance updated successfully');
        setShowBalanceModal(false);
        setBalanceReason('');
        loadUserDetails();
      } else {
        alert('Failed to update balance');
      }
    } catch (error) {
      alert('Error updating balance');
    }
  };

  const handleSendWarning = async () => {
    if (!warningTitle.trim() || !warningMessage.trim()) {
      alert('Please provide title and message');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: warningTitle,
          message: warningMessage,
          severity: warningSeverity
        })
      });

      if (res.ok) {
        alert('Warning sent successfully');
        setShowWarningModal(false);
        setWarningTitle('');
        setWarningMessage('');
        setWarningSeverity('warning');
        loadUserDetails();
      } else {
        alert('Failed to send warning');
      }
    } catch (error) {
      alert('Error sending warning');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        alert('User updated successfully');
        setShowEditModal(false);
        loadUserDetails();
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      alert('Error updating user');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page-container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          fontSize: '16px',
          color: '#5b6472'
        }}>
          Loading user details...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-page-container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          fontSize: '16px',
          color: '#ef4444'
        }}>
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="user-details-page">
      <div className="user-details-wrapper">
        {/* Header */}
        <div className="user-details-header">
          <button onClick={() => setLocation('/admin')} className="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Admin
          </button>
          <h1 className="user-details-title">User Details</h1>
        </div>

        <div className="user-details-content">
          {/* User Info Card */}
          <div className="user-info-card">
            <div className="user-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.full_name?.charAt(0) || user.email.charAt(0)}
                </div>
              )}
            </div>
            <div className="user-basic-info">
              <h2>{user.full_name || 'No name'}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-account">Account: {user.account_number}</p>
              <div className="user-status-badges">
                {user.account_suspended ? (
                  <span className="status-badge status-suspended">Suspended</span>
                ) : (
                  <span className="status-badge status-active">Active</span>
                )}
                {user.is_verified && (
                  <span className="status-badge status-verified">Verified</span>
                )}
                <span className="status-badge status-level">{user.level}</span>
              </div>
            </div>
            <div className="user-actions-toolbar">
              <button onClick={() => setShowEditModal(true)} className="toolbar-btn edit-btn">
                Edit Profile
              </button>
              <button onClick={() => setShowWarningModal(true)} className="toolbar-btn warning-btn">
                Send Warning
              </button>
              {user.account_suspended ? (
                <button onClick={handleUnsuspend} className="toolbar-btn unsuspend-btn">
                  Unsuspend
                </button>
              ) : (
                <button onClick={() => setShowSuspendModal(true)} className="toolbar-btn suspend-btn">
                  Suspend
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <div className="stat-label">Balance</div>
              <div className="stat-value">
                RD$ {parseFloat(user.balance).toFixed(2)}
                <button onClick={() => setShowBalanceModal(true)} className="stat-edit-btn" title="Edit balance">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="stat-label">Points</div>
              <div className="stat-value">
                {user.points}
                <button onClick={() => {
                  const newPoints = prompt('Enter new points value:', user.points.toString());
                  if (newPoints !== null) {
                    handleUpdateUser({points: parseInt(newPoints)});
                  }
                }} className="stat-edit-btn" title="Edit points">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">RD$ {parseFloat(user.total_spent).toFixed(2)}</div>
            </div>
            <div className="user-stat-card">
              <div className="stat-label">Total Saved</div>
              <div className="stat-value">RD$ {parseFloat(user.total_saved).toFixed(2)}</div>
            </div>
            <div className="user-stat-card">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{user.transaction_count}</div>
            </div>
            <div className="user-stat-card">
              <div className="stat-label">Monthly Spent</div>
              <div className="stat-value">RD$ {parseFloat(user.monthly_spent).toFixed(2)}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="user-details-grid">
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user.phone || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{user.address || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">City:</span>
              <span className="detail-value">{user.city || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Login:</span>
              <span className="detail-value">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</span>
            </div>
          </div>

          {/* Transactions */}
          <div className="user-section">
            <h3 className="section-title">Recent Transactions ({transactions.length})</h3>
            {transactions.length === 0 ? (
              <p className="empty-message">No transactions found</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.created_at).toLocaleString()}</td>
                        <td>{tx.type}</td>
                        <td className="amount-text">RD$ {parseFloat(tx.final_amount).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${tx.status}`}>{tx.status}</span>
                        </td>
                        <td>{tx.note || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Warnings */}
          <div className="user-section">
            <h3 className="section-title">Warnings & Notices ({warnings.length})</h3>
            {warnings.length === 0 ? (
              <p className="empty-message">No warnings</p>
            ) : (
              <div className="warnings-list">
                {warnings.map(warning => (
                  <div key={warning.id} className={`warning-card severity-${warning.severity}`}>
                    <div className="warning-header">
                      <span className="warning-title">{warning.title}</span>
                      <span className={`warning-badge ${warning.is_read ? 'read' : 'unread'}`}>
                        {warning.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <p className="warning-message">{warning.message}</p>
                    <span className="warning-date">{new Date(warning.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="user-section">
            <h3 className="section-title">Admin Action History ({adminActions.length})</h3>
            {adminActions.length === 0 ? (
              <p className="empty-message">No admin actions recorded</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Action</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminActions.map(action => (
                      <tr key={action.id}>
                        <td>{new Date(action.created_at).toLocaleString()}</td>
                        <td>{action.action_type.replace(/_/g, ' ')}</td>
                        <td>{action.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      {/* Modals */}
      {showSuspendModal && (
        <div className="modal-overlay" onClick={() => setShowSuspendModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Suspend User</h3>
            <textarea
              placeholder="Reason for suspension..."
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              rows={4}
              className="modal-input"
            />
            <div className="modal-actions">
              <button onClick={() => setShowSuspendModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleSuspend} className="modal-btn confirm-btn">
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="modal-overlay" onClick={() => setShowBalanceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Change Balance</h3>
            <input
              type="number"
              step="0.01"
              placeholder="New balance amount"
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              className="modal-input"
            />
            <textarea
              placeholder="Reason for balance change..."
              value={balanceReason}
              onChange={e => setBalanceReason(e.target.value)}
              rows={3}
              className="modal-input"
            />
            <div className="modal-actions">
              <button onClick={() => setShowBalanceModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleChangeBalance} className="modal-btn confirm-btn">
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="modal-overlay" onClick={() => setShowWarningModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Send Warning</h3>
            <input
              type="text"
              placeholder="Warning title"
              value={warningTitle}
              onChange={e => setWarningTitle(e.target.value)}
              className="modal-input"
            />
            <textarea
              placeholder="Warning message..."
              value={warningMessage}
              onChange={e => setWarningMessage(e.target.value)}
              rows={4}
              className="modal-input"
            />
            <select
              value={warningSeverity}
              onChange={e => setWarningSeverity(e.target.value)}
              className="modal-input"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowWarningModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleSendWarning} className="modal-btn confirm-btn">
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h3>Edit User Profile</h3>
            <div className="edit-form-grid">
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={editForm.full_name}
                onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Phone"
                value={editForm.phone}
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={editForm.account_number}
                onChange={e => setEditForm({...editForm, account_number: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Address"
                value={editForm.address}
                onChange={e => setEditForm({...editForm, address: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="City"
                value={editForm.city}
                onChange={e => setEditForm({...editForm, city: e.target.value})}
                className="modal-input"
              />
              <input
                type="number"
                placeholder="Points"
                value={editForm.points}
                onChange={e => setEditForm({...editForm, points: parseInt(e.target.value)})}
                className="modal-input"
              />
              <select
                value={editForm.level}
                onChange={e => setEditForm({...editForm, level: e.target.value})}
                className="modal-input"
              >
                <option value="member">Member</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="modal-btn confirm-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
