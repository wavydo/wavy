import { useState, useEffect } from 'react';
import { Search, Users, Building2, AlertTriangle, Lock, Edit, DollarSign, Eye } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  account_number: string;
  balance: number;
  user_type: 'user' | 'establishment';
  account_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  last_login?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'user' | 'establishment' | 'suspended'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply type filter
    if (filter === 'user') {
      filtered = filtered.filter(u => u.user_type === 'user');
    } else if (filter === 'establishment') {
      filtered = filtered.filter(u => u.user_type === 'establishment');
    } else if (filter === 'suspended') {
      filtered = filtered.filter(u => u.account_suspended);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.account_number.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendAccount = async () => {
    if (!selectedUser || !suspendReason) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          suspend: !selectedUser.account_suspended,
          reason: suspendReason 
        })
      });

      if (response.ok) {
        await fetchUsers();
        setShowSuspendModal(false);
        setSuspendReason('');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error suspending account:', error);
    }
  };

  const handleChangeBalance = async () => {
    if (!selectedUser || !newBalance) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newBalance: parseFloat(newBalance) })
      });

      if (response.ok) {
        await fetchUsers();
        setShowBalanceModal(false);
        setNewBalance('');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error changing balance:', error);
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningTitle || !warningMessage) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: warningTitle,
          message: warningMessage 
        })
      });

      if (response.ok) {
        setShowWarningModal(false);
        setWarningTitle('');
        setWarningMessage('');
        setSelectedUser(null);
        alert('Warning sent successfully');
      }
    } catch (error) {
      console.error('Error sending warning:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users and establishments</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={18} />
                Clients ({users.filter(u => u.user_type === 'user').length})
              </button>
              <button
                onClick={() => setFilter('establishment')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'establishment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 size={18} />
                Business ({users.filter(u => u.user_type === 'establishment').length})
              </button>
              <button
                onClick={() => setFilter('suspended')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'suspended'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Lock size={18} />
                Suspended ({users.filter(u => u.account_suspended).length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{user.account_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.user_type === 'establishment' ? (
                        <Building2 size={16} className="text-purple-600" />
                      ) : (
                        <Users size={16} className="text-blue-600" />
                      )}
                      <span className="capitalize text-sm">{user.user_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{formatCurrency(user.balance)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.account_suspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Lock size={12} />
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowWarningModal(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Send Warning"
                      >
                        <AlertTriangle size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewBalance(user.balance.toString());
                          setShowBalanceModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Change Balance"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowSuspendModal(true);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          user.account_suspended
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.account_suspended ? 'Unsuspend' : 'Suspend'}
                      >
                        <Lock size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {selectedUser.account_suspended ? 'Unsuspend' : 'Suspend'} Account
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedUser.account_suspended
                ? `Unsuspend ${selectedUser.full_name}'s account?`
                : `Are you sure you want to suspend ${selectedUser.full_name}'s account?`}
            </p>
            {!selectedUser.account_suspended && (
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                rows={3}
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendAccount}
                disabled={!selectedUser.account_suspended && !suspendReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {selectedUser.account_suspended ? 'Unsuspend' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Change Balance</h3>
            <p className="text-gray-600 mb-4">
              Current balance: <span className="font-semibold">{formatCurrency(selectedUser.balance)}</span>
            </p>
            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="New balance"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setNewBalance('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeBalance}
                disabled={!newBalance}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Send Warning</h3>
            <p className="text-gray-600 mb-4">
              Send warning to: <span className="font-semibold">{selectedUser.full_name}</span>
            </p>
            <input
              type="text"
              value={warningTitle}
              onChange={(e) => setWarningTitle(e.target.value)}
              placeholder="Warning title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <textarea
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="Warning message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setWarningTitle('');
                  setWarningMessage('');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                disabled={!warningTitle || !warningMessage}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
