import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

interface AdminPanelProps {}

type TabType = 'overview' | 'users' | 'establishments' | 'cards' | 'events' | 'perks' | 'drops' | 'database';

interface Stats {
  totalUsers: number;
  totalEstablishments: number;
  totalCards: number;
  totalTransactions: number;
  totalRevenue: string;
  activeEvents: number;
  activePerks: number;
  activeDrops: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      loadStats();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': 'admin-session'
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>tapp</h1>
            <p>Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>tapp</h2>
          <span className="admin-badge">ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`nav-item ${activeTab === 'establishments' ? 'active' : ''}`}
            onClick={() => setActiveTab('establishments')}
          >
            Establishments
          </button>
          <button
            className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            NFC Cards
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button
            className={`nav-item ${activeTab === 'perks' ? 'active' : ''}`}
            onClick={() => setActiveTab('perks')}
          >
            Perks
          </button>
          <button
            className={`nav-item ${activeTab === 'drops' ? 'active' : ''}`}
            onClick={() => setActiveTab('drops')}
          >
            Drops
          </button>
          <button
            className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            Database
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="topbar-actions">
            <button className="refresh-btn" onClick={loadStats}>
              ↻ Refresh
            </button>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && <OverviewTab stats={stats} loading={loading} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'establishments' && <EstablishmentsTab />}
          {activeTab === 'cards' && <CardsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'perks' && <PerksTab />}
          {activeTab === 'drops' && <DropsTab />}
          {activeTab === 'database' && <DatabaseTab />}
        </div>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, loading }: { stats: Stats | null, loading: boolean }) {
  if (loading || !stats) {
    return <div className="loading">Loading stats...</div>;
  }

  return (
    <div className="overview-grid">
      <div className="stat-card">
        <div className="stat-content">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Establishments</h3>
          <p className="stat-value">{stats.totalEstablishments.toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Active Cards</h3>
          <p className="stat-value">{stats.totalCards.toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Total Revenue</h3>
          <p className="stat-value">RD${parseFloat(stats.totalRevenue).toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Transactions</h3>
          <p className="stat-value">{stats.totalTransactions.toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Active Events</h3>
          <p className="stat-value">{stats.activeEvents}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Active Perks</h3>
          <p className="stat-value">{stats.activePerks}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-content">
          <h3>Active Drops</h3>
          <p className="stat-value">{stats.activeDrops}</p>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=20&search=${search}`, {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });
      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    try {
      await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(selectedUser)
      });
      setIsEditing(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      alert('Failed to update user');
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
        <span className="total-count">{total} users</span>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Points</th>
              <th>Level</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="font-semibold">{user.fullName}</td>
                <td>{user.email}</td>
                <td>RD${parseFloat(user.balance).toLocaleString()}</td>
                <td>{user.points}</td>
                <td>
                  <span className={`level-badge level-${user.level}`}>
                    {user.level}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span className="page-info">Page {page} of {Math.ceil(total / 20)}</span>
        <button
          disabled={page >= Math.ceil(total / 20)}
          onClick={() => setPage(p => p + 1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedUser.balance}
                  onChange={(e) => setSelectedUser({...selectedUser, balance: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  value={selectedUser.points}
                  onChange={(e) => setSelectedUser({...selectedUser, points: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <select
                  value={selectedUser.level}
                  onChange={(e) => setSelectedUser({...selectedUser, level: e.target.value})}
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="modal-btn save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Establishments Tab Component
function EstablishmentsTab() {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/establishments?page=${page}&limit=20`, {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setEstablishments(data.establishments);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this establishment?')) return;
    try {
      await fetch(`/api/admin/establishments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });
      loadData();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      await fetch(`/api/admin/establishments/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(selectedItem)
      });
      setIsEditing(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      alert('Failed to update');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>All Establishments</h3>
        <span className="total-count">{total} establishments</span>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Category</th>
              <th>Status</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {establishments.map(item => (
              <tr key={item.id}>
                <td className="font-semibold">{item.businessName}</td>
                <td>{item.ownerName}</td>
                <td>{item.email}</td>
                <td>{item.category}</td>
                <td>
                  <span className={`status-badge ${item.approved ? 'status-active' : 'status-inactive'}`}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>{item.discountPercentage}%</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => { setSelectedItem(item); setIsEditing(true); }}>
                      Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="pagination-btn">Previous</button>
        <span className="page-info">Page {page} of {Math.ceil(total / 20)}</span>
        <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="pagination-btn">Next</button>
      </div>

      {isEditing && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Establishment</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input type="text" value={selectedItem.businessName} onChange={(e) => setSelectedItem({...selectedItem, businessName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Owner Name</label>
                <input type="text" value={selectedItem.ownerName} onChange={(e) => setSelectedItem({...selectedItem, ownerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={selectedItem.email} onChange={(e) => setSelectedItem({...selectedItem, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={selectedItem.phone} onChange={(e) => setSelectedItem({...selectedItem, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={selectedItem.category} onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}>
                  <option value="colmado">Colmado</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="farmacia">Farmacia</option>
                  <option value="barberia">Barbería</option>
                  <option value="gym">Gym</option>
                  <option value="cafeteria">Cafetería</option>
                  <option value="supermercado">Supermercado</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount %</label>
                <input type="number" min="5" max="30" value={selectedItem.discountPercentage} onChange={(e) => setSelectedItem({...selectedItem, discountPercentage: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Approved</label>
                <select value={selectedItem.approved ? 'true' : 'false'} onChange={(e) => setSelectedItem({...selectedItem, approved: e.target.value === 'true'})}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="modal-btn save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Cards Tab Component
function CardsTab() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/cards?page=${page}&limit=20`, {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setCards(data.cards);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/cards/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>NFC Cards</h3>
        <span className="total-count">{total} cards</span>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>User Email</th>
              <th>Cardholder Name</th>
              <th>Card Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Last Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                <td>{card.userEmail}</td>
                <td>{card.cardholderName || '-'}</td>
                <td>{card.cardNumber || '-'}</td>
                <td>{card.cardType}</td>
                <td>
                  <span className={`status-badge ${card.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {card.status}
                  </span>
                </td>
                <td>{new Date(card.registeredAt).toLocaleDateString()}</td>
                <td>{card.lastUsedAt ? new Date(card.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                <td>
                  <select
                    value={card.status}
                    onChange={(e) => handleStatusChange(card.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lost">Lost</option>
                    <option value="stolen">Stolen</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="pagination-btn">Previous</button>
        <span className="page-info">Page {page} of {Math.ceil(total / 20)}</span>
        <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="pagination-btn">Next</button>
      </div>
    </div>
  );
}

// Events Tab - CRUD completo
function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/events', {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });
      loadData();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const url = isCreating ? '/api/admin/events' : `/api/admin/events/${selectedItem.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(selectedItem)
      });
      setIsEditing(false);
      setIsCreating(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      alert('Failed to save');
    }
  };

  const handleCreate = () => {
    setSelectedItem({
      establishmentId: '',
      title: '',
      description: '',
      eventDate: '',
      location: '',
      capacity: 0,
      ticketPrice: '0',
      image: '',
      active: true
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>Events</h3>
        <button className="create-btn" onClick={handleCreate}>+ Create Event</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Attendees</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(item => (
              <tr key={item.id}>
                <td className="font-semibold">{item.title}</td>
                <td>{new Date(item.eventDate).toLocaleDateString()}</td>
                <td>{item.location}</td>
                <td>{item.capacity || 'Unlimited'}</td>
                <td>{item.currentAttendees}</td>
                <td>RD${parseFloat(item.ticketPrice || '0').toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => { setSelectedItem(item); setIsEditing(true); }}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && selectedItem && (
        <div className="modal-overlay" onClick={() => { setIsEditing(false); setIsCreating(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{isCreating ? 'Create Event' : 'Edit Event'}</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Title</label>
                <input type="text" value={selectedItem.title} onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea value={selectedItem.description || ''} onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Event Date</label>
                <input type="datetime-local" value={selectedItem.eventDate ? new Date(selectedItem.eventDate).toISOString().slice(0, 16) : ''} onChange={(e) => setSelectedItem({...selectedItem, eventDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={selectedItem.location || ''} onChange={(e) => setSelectedItem({...selectedItem, location: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" value={selectedItem.capacity || 0} onChange={(e) => setSelectedItem({...selectedItem, capacity: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Ticket Price (RD$)</label>
                <input type="number" step="0.01" value={selectedItem.ticketPrice || 0} onChange={(e) => setSelectedItem({...selectedItem, ticketPrice: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Active</label>
                <select value={selectedItem.active ? 'true' : 'false'} onChange={(e) => setSelectedItem({...selectedItem, active: e.target.value === 'true'})}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Cancel</button>
              <button className="modal-btn save-btn" onClick={handleSave}>{isCreating ? 'Create' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Perks Tab - CRUD completo
function PerksTab() {
  const [perks, setPerks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/perks', {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setPerks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this perk?')) return;
    try {
      await fetch(`/api/admin/perks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });
      loadData();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const url = isCreating ? '/api/admin/perks' : `/api/admin/perks/${selectedItem.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(selectedItem)
      });
      setIsEditing(false);
      setIsCreating(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      alert('Failed to save');
    }
  };

  const handleCreate = () => {
    setSelectedItem({
      establishmentId: '',
      title: '',
      description: '',
      type: 'discount',
      value: '0',
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
      maxRedemptions: 0,
      active: true
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>Perks</h3>
        <button className="create-btn" onClick={handleCreate}>+ Create Perk</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Value</th>
              <th>Valid From</th>
              <th>Valid Until</th>
              <th>Redemptions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {perks.map(item => (
              <tr key={item.id}>
                <td className="font-semibold">{item.title}</td>
                <td>{item.type}</td>
                <td>{item.value}</td>
                <td>{new Date(item.validFrom).toLocaleDateString()}</td>
                <td>{new Date(item.validUntil).toLocaleDateString()}</td>
                <td>{item.currentRedemptions} / {item.maxRedemptions || '∞'}</td>
                <td>
                  <span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => { setSelectedItem(item); setIsEditing(true); }}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && selectedItem && (
        <div className="modal-overlay" onClick={() => { setIsEditing(false); setIsCreating(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{isCreating ? 'Create Perk' : 'Edit Perk'}</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Title</label>
                <input type="text" value={selectedItem.title} onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea value={selectedItem.description || ''} onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={selectedItem.type} onChange={(e) => setSelectedItem({...selectedItem, type: e.target.value})}>
                  <option value="discount">Discount</option>
                  <option value="cashback">Cashback</option>
                  <option value="points">Points</option>
                  <option value="freebie">Freebie</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input type="number" step="0.01" value={selectedItem.value} onChange={(e) => setSelectedItem({...selectedItem, value: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Valid From</label>
                <input type="datetime-local" value={selectedItem.validFrom ? new Date(selectedItem.validFrom).toISOString().slice(0, 16) : ''} onChange={(e) => setSelectedItem({...selectedItem, validFrom: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Valid Until</label>
                <input type="datetime-local" value={selectedItem.validUntil ? new Date(selectedItem.validUntil).toISOString().slice(0, 16) : ''} onChange={(e) => setSelectedItem({...selectedItem, validUntil: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Max Redemptions</label>
                <input type="number" value={selectedItem.maxRedemptions || 0} onChange={(e) => setSelectedItem({...selectedItem, maxRedemptions: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Active</label>
                <select value={selectedItem.active ? 'true' : 'false'} onChange={(e) => setSelectedItem({...selectedItem, active: e.target.value === 'true'})}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Cancel</button>
              <button className="modal-btn save-btn" onClick={handleSave}>{isCreating ? 'Create' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Drops Tab - CRUD completo
function DropsTab() {
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/drops', {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setDrops(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drop?')) return;
    try {
      await fetch(`/api/admin/drops/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });
      loadData();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      const url = isCreating ? '/api/admin/drops' : `/api/admin/drops/${selectedItem.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(selectedItem)
      });
      setIsEditing(false);
      setIsCreating(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      alert('Failed to save');
    }
  };

  const handleCreate = () => {
    setSelectedItem({
      establishmentId: '',
      title: '',
      description: '',
      reward: '',
      triggerType: 'time',
      triggerValue: '',
      maxClaims: 0,
      expiresAt: '',
      active: true
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>Drops</h3>
        <button className="create-btn" onClick={handleCreate}>+ Create Drop</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Reward</th>
              <th>Trigger Type</th>
              <th>Claims</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drops.map(item => (
              <tr key={item.id}>
                <td className="font-semibold">{item.title}</td>
                <td>{item.reward}</td>
                <td>{item.triggerType}</td>
                <td>{item.currentClaims} / {item.maxClaims || '∞'}</td>
                <td>{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td>
                  <span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit-btn" onClick={() => { setSelectedItem(item); setIsEditing(true); }}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && selectedItem && (
        <div className="modal-overlay" onClick={() => { setIsEditing(false); setIsCreating(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{isCreating ? 'Create Drop' : 'Edit Drop'}</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Title</label>
                <input type="text" value={selectedItem.title} onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea value={selectedItem.description || ''} onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Reward</label>
                <input type="text" value={selectedItem.reward} onChange={(e) => setSelectedItem({...selectedItem, reward: e.target.value})} placeholder="e.g., RD$500, Free meal" />
              </div>
              <div className="form-group">
                <label>Trigger Type</label>
                <select value={selectedItem.triggerType} onChange={(e) => setSelectedItem({...selectedItem, triggerType: e.target.value})}>
                  <option value="location">Location</option>
                  <option value="time">Time</option>
                  <option value="qr_scan">QR Scan</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trigger Value</label>
                <input type="text" value={selectedItem.triggerValue || ''} onChange={(e) => setSelectedItem({...selectedItem, triggerValue: e.target.value})} placeholder="Depends on trigger type" />
              </div>
              <div className="form-group">
                <label>Max Claims</label>
                <input type="number" value={selectedItem.maxClaims || 0} onChange={(e) => setSelectedItem({...selectedItem, maxClaims: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input type="datetime-local" value={selectedItem.expiresAt ? new Date(selectedItem.expiresAt).toISOString().slice(0, 16) : ''} onChange={(e) => setSelectedItem({...selectedItem, expiresAt: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Active</label>
                <select value={selectedItem.active ? 'true' : 'false'} onChange={(e) => setSelectedItem({...selectedItem, active: e.target.value === 'true'})}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Cancel</button>
              <button className="modal-btn save-btn" onClick={handleSave}>{isCreating ? 'Create' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Editable Row Component para edición inline
function EditableRow({ row, columns, tableName, onUpdate, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRow, setEditedRow] = useState(row);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!row.id) {
      alert('Cannot update row without ID');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/database/tables/${tableName}/row/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify(editedRow)
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!row.id) {
      alert('Cannot delete row without ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this row?')) return;

    try {
      const response = await fetch(`/api/admin/database/tables/${tableName}/row/${row.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'admin-session' }
      });

      if (response.ok) {
        onDelete();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditedRow(row);
    setIsEditing(false);
  };

  return (
    <tr className={isEditing ? 'editing-row' : ''}>
      {columns.map((col: string) => (
        <td key={col} className="editable-cell">
          {isEditing ? (
            <input
              type="text"
              value={editedRow[col] !== null && editedRow[col] !== undefined ? String(editedRow[col]) : ''}
              onChange={(e) => setEditedRow({ ...editedRow, [col]: e.target.value })}
              className="cell-input"
            />
          ) : (
            <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
              {row[col] !== null && row[col] !== undefined
                ? typeof row[col] === 'object'
                  ? JSON.stringify(row[col])
                  : String(row[col])
                : '-'}
            </span>
          )}
        </td>
      ))}
      <td>
        <div className="row-actions">
          {isEditing ? (
            <>
              <button 
                className="action-btn save-btn-inline" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="action-btn cancel-btn-inline" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                className="action-btn edit-btn" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button 
                className="action-btn delete-btn" 
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// Database Tab - Visor de todas las tablas + SQL Editor
function DatabaseTab() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable && !showSqlEditor) {
      loadTableData();
    }
  }, [selectedTable, page, showSqlEditor]);

  const loadTables = async () => {
    try {
      const response = await fetch('/api/admin/database/tables', {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/database/tables/${selectedTable}?page=${page}&limit=50`, {
        headers: { 'Authorization': 'admin-session' }
      });
      const data = await response.json();
      setTableData(data.rows);
      setTotal(data.pagination.total);
      
      if (data.rows.length > 0) {
        setColumns(Object.keys(data.rows[0]));
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeSql = async () => {
    if (!sqlQuery.trim()) return;
    
    try {
      setLoading(true);
      setSqlError('');
      setSqlResult(null);
      
      const response = await fetch('/api/admin/database/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-session'
        },
        body: JSON.stringify({ query: sqlQuery })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSqlResult(data);
        // Recargar lista de tablas por si se creó una nueva
        loadTables();
      } else {
        setSqlError(data.error);
      }
    } catch (error: any) {
      setSqlError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    { label: 'Show All Tables', query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" },
    { label: 'Create Test Table', query: "CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(255), created_at TIMESTAMP DEFAULT NOW());" },
    { label: 'Show Table Structure', query: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${selectedTable || 'users'}';` }
  ];

  return (
    <div className="database-browser">
      <div className="database-sidebar">
        <div className="sidebar-header">
          <h3>Tables</h3>
          <button 
            className={`sql-toggle-btn ${showSqlEditor ? 'active' : ''}`}
            onClick={() => setShowSqlEditor(!showSqlEditor)}
          >
            {showSqlEditor ? 'Table View' : 'SQL Editor'}
          </button>
        </div>
        <div className="table-list">
          {tables.map(table => (
            <button
              key={table}
              className={`table-item ${selectedTable === table ? 'active' : ''}`}
              onClick={() => {
                setSelectedTable(table);
                setShowSqlEditor(false);
                setPage(1);
              }}
            >
              {table}
            </button>
          ))}
        </div>
      </div>

      <div className="database-content">
        {showSqlEditor ? (
          <div className="sql-editor-container">
            <div className="sql-editor-header">
              <h3>SQL Query Editor</h3>
              <div className="quick-queries">
                {quickQueries.map((q, idx) => (
                  <button
                    key={idx}
                    className="quick-query-btn"
                    onClick={() => setSqlQuery(q.query)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              className="sql-textarea"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Enter your SQL query here...&#10;Examples:&#10;  SELECT * FROM users LIMIT 10;&#10;  CREATE TABLE new_table (id SERIAL PRIMARY KEY, name VARCHAR(255));&#10;  ALTER TABLE users ADD COLUMN new_column VARCHAR(100);&#10;  INSERT INTO users (full_name, email) VALUES ('John Doe', 'john@example.com');"
              rows={12}
            />
            
            <div className="sql-actions">
              <button 
                className="execute-btn"
                onClick={executeSql}
                disabled={loading || !sqlQuery.trim()}
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
              <button 
                className="clear-btn"
                onClick={() => {
                  setSqlQuery('');
                  setSqlResult(null);
                  setSqlError('');
                }}
              >
                Clear
              </button>
            </div>

            {sqlError && (
              <div className="sql-error">
                <strong>Error:</strong> {sqlError}
              </div>
            )}

            {sqlResult && (
              <div className="sql-result">
                <div className="result-header">
                  <strong>Success!</strong> 
                  <span>Rows affected: {sqlResult.rowCount || 0}</span>
                </div>
                {sqlResult.rows && sqlResult.rows.length > 0 && (
                  <div className="result-table">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(sqlResult.rows[0]).map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.rows.map((row: any, idx: number) => (
                          <tr key={idx}>
                            {Object.values(row).map((val: any, i: number) => (
                              <td key={i}>{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : !selectedTable ? (
          <div className="empty-state">
            <h3>Select a table to view data</h3>
            <p>Choose a table from the sidebar or use SQL Editor for custom queries</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading table data...</div>
        ) : (
          <div className="data-table-container">
            <div className="table-header">
              <h3>{selectedTable}</h3>
              <span className="total-count">{total} rows</span>
            </div>

            <div className="data-table database-table">
              <table>
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <EditableRow
                      key={row.id || idx}
                      row={row}
                      columns={columns}
                      tableName={selectedTable}
                      onUpdate={loadTableData}
                      onDelete={loadTableData}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {Math.ceil(total / 50)}
              </span>
              <button
                disabled={page >= Math.ceil(total / 50)}
                onClick={() => setPage(p => p + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
