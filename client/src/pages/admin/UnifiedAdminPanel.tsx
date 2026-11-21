import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import '../Dashboard.css';
import './AdminPanel.css';
import SupportTab from './SupportTab';

type Tab = 'overview' | 'transactions' | 'users' | 'establishments' | 'database' | 'issuing' | 'support';

interface Transaction {
  id: string;
  paired_id?: string;
  sender_id: string;
  recipient_id: string;
  sender_account?: string;
  recipient_account?: string;
  sender_name?: string;
  recipient_name?: string;
  amount: string;
  type: string;
  status: string;
  created_at: string;
  is_grouped?: boolean;
  transactions?: any[];
  note?: string;
  user_name?: string;
  user_account?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  account_number: string;
  balance: string;
  account_suspended: boolean;
  created_at: string;
}

interface Establishment {
  id: string;
  email: string;
  name: string;
  account_number: string;
  balance: string;
  account_suspended: boolean;
  created_at: string;
  category?: string;
  address?: string;
  owner_name?: string;
  phone?: string;
  approved?: boolean;
}

interface CardRequest {
  id: string;
  userId: string;
  user_id: string; // Snake case from DB
  fullName: string;
  full_name: string; // Snake case from DB
  dateOfBirth: string;
  date_of_birth: string; // Snake case from DB
  idNumber: string;
  id_number: string; // Snake case from DB
  phoneNumber: string;
  phone_number: string; // Snake case from DB
  address: string;
  city: string;
  postalCode: string | null;
  postal_code: string | null; // Snake case from DB
  occupation: string | null;
  monthlyIncome: string | null;
  monthly_income: string | null; // Snake case from DB
  requestReason: string | null;
  request_reason: string | null; // Snake case from DB
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedAt: string | null;
  reviewed_at: string | null; // Snake case from DB
  reviewNotes: string | null;
  review_notes: string | null; // Snake case from DB
  cardId: string | null;
  card_id: string | null; // Snake case from DB
  rejectionReason: string | null;
  rejection_reason: string | null; // Snake case from DB
  createdAt: string;
  created_at: string; // Snake case from DB
  userEmail?: string;
  userName?: string;
}

interface CardIssueReport {
  id: string;
  cardId: string;
  userId: string;
  issueType: string;
  description: string;
  deviceModel: string | null;
  deviceOS: string | null;
  appVersion: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  cardNumber?: string;
}

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: string;
}

export default function UnifiedAdminPanel() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarActive, setSidebarActive] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [cardRequests, setCardRequests] = useState<CardRequest[]>([]);
  const [cardReports, setCardReports] = useState<CardIssueReport[]>([]);
  const [issuingSubTab, setIssuingSubTab] = useState<'requests' | 'reports'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  
  // Database tab states
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSchema, setTableSchema] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; columnName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [tablePagination, setTablePagination] = useState({ page: 1, total: 0, pages: 0 });
  
  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [selectedCardRequest, setSelectedCardRequest] = useState<CardRequest | null>(null);
  const [showApproveCardModal, setShowApproveCardModal] = useState(false);
  const [showRejectCardModal, setShowRejectCardModal] = useState(false);
  const [cardApprovalData, setCardApprovalData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    pin: '',
    dailyLimit: '',
    monthlyLimit: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResolveDisputeModal, setShowResolveDisputeModal] = useState(false);
  const [disputeResolution, setDisputeResolution] = useState<'sender' | 'recipient' | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ query: 'SELECT 1' })
        });
        
        if (res.status === 401 || res.status === 403) {
          setLocation('/admin/auth');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setLocation('/admin/auth');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Hide global header
  useEffect(() => {
    const header = document.querySelector('header');
    const body = document.body;
    
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    body.classList.add('dashboard-active');
    
    return () => {
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      body.classList.remove('dashboard-active');
    };
  }, []);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'establishments') {
      loadEstablishments();
    } else if (activeTab === 'issuing') {
      loadCardRequests();
      loadCardReports();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM transactions) as total_transactions,
          (SELECT COALESCE(SUM(amount::numeric), 0) FROM transactions WHERE status = 'completed') as total_volume
      `;
      
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]) {
          setStats({
            totalUsers: data.results[0].total_users || 0,
            totalTransactions: data.results[0].total_transactions || 0,
            totalVolume: data.results[0].total_volume || '0'
          });
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    console.log('📊 Loading transactions...');
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'GET',
        credentials: 'include',
      });
      
      console.log('📊 Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('📊 Transactions received:', data.transactions?.length);
        console.log('📊 First transaction:', data.transactions?.[0]);
        setTransactions(data.transactions || []);
      } else {
        console.error('❌ Failed to load transactions:', await res.text());
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const query = 'SELECT id, email, full_name, account_number, balance, account_suspended, created_at FROM users ORDER BY created_at DESC';
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.results || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstablishments = async () => {
    setLoading(true);
    try {
      const query = `SELECT 
        id, 
        email, 
        business_name as name, 
        category, 
        address,
        phone,
        owner_name,
        subscription_status as account_suspended,
        approved,
        created_at,
        total_revenue as balance
      FROM establishments 
      ORDER BY created_at DESC`;
      
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Mapear los datos para que coincidan con la interfaz
        const mapped = (data.results || []).map((est: any) => ({
          ...est,
          account_number: est.id.slice(0, 8), // Usar parte del ID como "account number"
          account_suspended: est.account_suspended !== 'active' || !est.approved
        }));
        setEstablishments(mapped);
      }
    } catch (error) {
      console.error('Failed to load establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCardRequests = async () => {
    setLoading(true);
    try {
      const query = `SELECT 
        cr.*,
        u.email as "userEmail",
        u.full_name as "userName"
      FROM card_requests cr
      LEFT JOIN users u ON cr.user_id = u.id
      ORDER BY cr.created_at DESC`;
      
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('🔍 Card Requests from DB:', data.results?.length, 'requests');
        if (data.results?.length > 0) {
          console.log('🔍 First request sample:', data.results[0]);
        }
        setCardRequests(data.results || []);
      }
    } catch (error) {
      console.error('Failed to load card requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCardReports = async () => {
    setLoading(true);
    try {
      const query = `SELECT 
        cir.*,
        u.email as "userEmail",
        u.full_name as "userName",
        nc.card_number as "cardNumber"
      FROM card_issue_reports cir
      LEFT JOIN users u ON cir.user_id = u.id
      LEFT JOIN nfc_cards nc ON cir.card_id = nc.id
      ORDER BY cir.created_at DESC`;
      
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCardReports(data.results || []);
      }
    } catch (error) {
      console.error('Failed to load card reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all database tables
  const loadDatabaseTables = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/admin/database/tables', {
        credentials: 'include'
      });
      if (res.ok) {
        const tables = await res.json();
        setDbTables(tables);
        console.log('✅ Loaded tables:', tables);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      setDbError('Failed to load database tables');
    } finally {
      setDbLoading(false);
    }
  };

  // Load table data and schema
  const loadTableData = async (tableName: string, page: number = 1) => {
    setDbLoading(true);
    setDbError(null);
    console.log('🔍 Loading table:', tableName, 'page:', page);
    try {
      // Load data
      const dataRes = await fetch(`/api/admin/database/tables/${tableName}?page=${page}&limit=100`, {
        credentials: 'include'
      });
      
      if (!dataRes.ok) {
        throw new Error('Failed to load table data');
      }
      
      const data = await dataRes.json();
      setTableData(data.rows || []);
      setTablePagination(data.pagination || { page: 1, total: 0, pages: 0 });
      
      // Load schema
      const schemaRes = await fetch(`/api/admin/database/schema/${tableName}`, {
        credentials: 'include'
      });
      
      if (schemaRes.ok) {
        const schema = await schemaRes.json();
        setTableSchema(schema.columns || []);
      }
      
      console.log('✅ Loaded table data:', data.rows?.length, 'rows');
    } catch (error: any) {
      console.error('Failed to load table data:', error);
      setDbError(error.message || 'Failed to load table data');
    } finally {
      setDbLoading(false);
    }
  };

  // Update cell value
  const updateCellValue = async (rowId: string, columnName: string, newValue: any) => {
    if (!selectedTable) return;
    
    try {
      const res = await fetch(`/api/admin/database/tables/${selectedTable}/row/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [columnName]: newValue })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update cell');
      }
      
      // Reload table data
      await loadTableData(selectedTable, tablePagination.page);
      console.log('✅ Cell updated');
    } catch (error: any) {
      console.error('Failed to update cell:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  // Delete row
  const deleteRow = async (rowId: string) => {
    if (!selectedTable || !confirm('Delete this row?')) return;
    
    try {
      const res = await fetch(`/api/admin/database/tables/${selectedTable}/row/${rowId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete row');
      }
      
      // Reload table data
      await loadTableData(selectedTable, tablePagination.page);
      console.log('✅ Row deleted');
    } catch (error: any) {
      console.error('Failed to delete row:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Load tables when database tab is opened
  useEffect(() => {
    if (activeTab === 'database' && dbTables.length === 0) {
      loadDatabaseTables();
    }
  }, [activeTab]);

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      setLocation('/admin/auth');
    });
  };

  const handleReverseTransaction = async (txId: string) => {
    if (!confirm('¿Estás seguro de revertir esta transacción?')) return;
    
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/reverse`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.status === 401) {
        alert('Sesión expirada. Redirigiendo al login...');
        setLocation('/admin/auth');
        return;
      }
      
      if (res.ok) {
        alert('Transacción revertida exitosamente');
        loadTransactions();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo revertir la transacción'}`);
      }
    } catch (error) {
      console.error('Error reversing transaction:', error);
      alert('Error al revertir transacción');
    }
  };

  const handleSuspendTransaction = async (tx: Transaction) => {
    // Si ya está suspendida, abrir modal de resolución
    if (tx.status === 'suspended') {
      setSelectedTransaction(tx);
      setShowResolveDisputeModal(true);
      return;
    }
    
    // Si no está suspendida, suspender
    if (!confirm('¿Suspender esta transacción? Los fondos serán retenidos.')) return;
    
    try {
      const res = await fetch(`/api/admin/transactions/${tx.id}/suspend`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Transacción suspendida');
        loadTransactions();
      }
    } catch (error) {
      alert('Error al suspender transacción');
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedTransaction || !disputeResolution) {
      alert('Selecciona a quién entregar los fondos');
      return;
    }

    try {
      const res = await fetch(`/api/admin/transactions/${selectedTransaction.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          resolution: disputeResolution,
          reason: `Fondos entregados a ${disputeResolution === 'sender' ? 'remitente' : 'destinatario'}`
        })
      });
      
      if (res.ok) {
        alert('Disputa resuelta exitosamente');
        setShowResolveDisputeModal(false);
        setSelectedTransaction(null);
        setDisputeResolution(null);
        loadTransactions();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'No se pudo resolver la disputa'}`);
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Error al resolver disputa');
    }
  };

  const handleSendWarning = async (user: User) => {
    const title = prompt('Título de la advertencia:');
    if (!title) return;

    const message = prompt('Mensaje de la advertencia:');
    if (!message) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, message, severity: 'warning' })
      });

      if (res.ok) {
        alert('Advertencia enviada exitosamente');
        loadUsers();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Error al enviar advertencia'}`);
      }
    } catch (error) {
      console.error('Error sending warning:', error);
      alert('Error al enviar advertencia');
    }
  };

  const handleApproveCard = async () => {
    if (!selectedCardRequest) return;

    const { pin, dailyLimit, monthlyLimit } = cardApprovalData;

    if (!pin) {
      alert('Please enter a PIN for the card');
      return;
    }

    try {
      const res = await fetch(`/api/admin/card-requests/${selectedCardRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pin,
          dailyLimit: dailyLimit || '1000',
          monthlyLimit: monthlyLimit || '5000',
        })
      });

      if (res.ok) {
        alert('Card request approved successfully! Card details generated automatically.');
        setShowApproveCardModal(false);
        setSelectedCardRequest(null);
        setCardApprovalData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          pin: '',
          dailyLimit: '',
          monthlyLimit: '',
        });
        loadCardRequests();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to approve request'}`);
      }
    } catch (error) {
      console.error('Error approving card:', error);
      alert('Error approving card request');
    }
  };

  const handleRejectCard = async () => {
    if (!selectedCardRequest || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const res = await fetch(`/api/admin/card-requests/${selectedCardRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rejectionReason })
      });

      if (res.ok) {
        alert('Card request rejected');
        setShowRejectCardModal(false);
        setSelectedCardRequest(null);
        setRejectionReason('');
        loadCardRequests();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to reject request'}`);
      }
    } catch (error) {
      console.error('Error rejecting card:', error);
      alert('Error rejecting card request');
    }
  };

  const handleSuspendUser = async (user: User) => {
    const reason = prompt('Razón de la suspensión:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        alert('Usuario suspendido exitosamente');
        loadUsers();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Error al suspender usuario'}`);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error al suspender usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.full_name?.toLowerCase().includes(search) ||
      user.account_number?.toLowerCase().includes(search)
    );
  });

  const businessUsers = filteredUsers.filter(u => u.email?.includes('@business') || u.email?.includes('@tapp'));
  const clientUsers = filteredUsers.filter(u => !u.email?.includes('@business') && !u.email?.includes('@tapp'));

  return (
    <div className="dashboard-page-container admin-panel">
      {/* Sidebar - EXACTO al Dashboard */}
      <nav className={`dashboard-sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
        <button id="btn_close" onClick={() => setSidebarActive(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"/>
          </svg>
        </button>
        
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            <path d="M16 9C12.134 9 9 12.134 9 16C9 19.866 12.134 23 16 23" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            <path d="M16 5C9.925 5 5 9.925 5 16C5 22.075 9.925 27 16 27" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
          </svg>
          <span>tapp</span>
        </div>

        <div className="nav_links">
          <a 
            onClick={() => setActiveTab('overview')} 
            className={`nav_link ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="nav_link_text">Overview</div>
          </a>
          
          <a 
            onClick={() => setActiveTab('transactions')} 
            className={`nav_link ${activeTab === 'transactions' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="nav_link_text">Transactions</div>
          </a>
          
          <a 
            onClick={() => setActiveTab('users')} 
            className={`nav_link ${activeTab === 'users' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="nav_link_text">Users</div>
          </a>

          <a 
            onClick={() => setActiveTab('establishments')} 
            className={`nav_link ${activeTab === 'establishments' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div className="nav_link_text">Establishments</div>
          </a>

          <a 
            onClick={() => setActiveTab('issuing')} 
            className={`nav_link ${activeTab === 'issuing' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <div className="nav_link_text">Issuing</div>
          </a>

          <a 
            onClick={() => setActiveTab('support')} 
            className={`nav_link ${activeTab === 'support' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"></path>
              </svg>
            </div>
            <div className="nav_link_text">Asistencia</div>
          </a>

          <a 
            onClick={() => setActiveTab('database')} 
            className={`nav_link ${activeTab === 'database' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <div className="nav_link_text">Database</div>
          </a>
        </div>

        <div className="life_cover_offer">
          <img src="https://raw.githubusercontent.com/shyamtala003/finance_dashboard/%40sjtala/images/women.svg" alt="" />
        </div>

        <div className="admin-logout-section">
          <button onClick={handleLogout} className="admin-logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content - EXACTO al Dashboard */}
      <div className="dashboard-main-content">
        {/* Mobile menu button */}
        <button id="menu_btn" onClick={() => setSidebarActive(!sidebarActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
          </svg>
        </button>

        {/* Topbar */}
        <div className="dashboard-topbar topbar animate-fadeInDown">
          <div className="overview_text">
            <p className="title">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'establishments' && 'Establishment Management'}
              {activeTab === 'issuing' && 'Card Issuing'}
              {activeTab === 'support' && 'Asistencia'}
              {activeTab === 'database' && 'Database Editor'}
            </p>
            <p className="desc">Admin Control Panel</p>
          </div>
          <div className="topbar_icons">
            <a href="#" className="alert">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </a>
            <a href="#" onClick={() => setActiveTab('overview')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="dashboard-content-wrapper">
          <main className="dashboard-content-main">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="admin-overview animate-fadeInUp">
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">{stats?.totalTransactions || 0}</div>
                    <div className="stat-label">Transactions</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">RD$ {parseFloat(stats?.totalVolume || '0').toFixed(2)}</div>
                    <div className="stat-label">Total Volume</div>
                  </div>
                </div>

                <div className="admin-quick-actions">
                  <button onClick={() => setActiveTab('transactions')} className="admin-action-btn">
                    View All Transactions
                  </button>
                  <button onClick={() => setActiveTab('users')} className="admin-action-btn">
                    Manage Users
                  </button>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div className="admin-transactions animate-fadeInUp">
                {loading ? (
                  <div className="admin-loading">Loading transactions...</div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                              No transactions found
                            </td>
                          </tr>
                        ) : (
                          transactions.map(tx => (
                            <tr key={tx.id}>
                              <td className="mono-text">
                                {tx.id.slice(0, 8)}
                                {tx.type === 'p2p_transfer' && <span style={{ marginLeft: '4px', fontSize: '11px', color: '#0ea5e9' }}>P2P</span>}
                              </td>
                              <td className="mono-text">
                                {tx.sender_account || tx.user_account || 'N/A'}
                                {tx.sender_name && <div style={{ fontSize: '11px', color: '#5b6472' }}>{tx.sender_name}</div>}
                              </td>
                              <td className="mono-text">
                                {tx.recipient_account || 'N/A'}
                              </td>
                              <td className="amount-text">RD$ {parseFloat(tx.amount).toFixed(2)}</td>
                              <td>
                                <span className={`status-badge status-${tx.status}`} style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {tx.status === 'reversed' && <span style={{ color: '#3b82f6' }}>↻</span>}
                                  {tx.status === 'suspended' && <span style={{ color: '#eab308' }}>⏱</span>}
                                  {tx.status}
                                </span>
                              </td>
                              <td>{new Date(tx.created_at).toLocaleString()}</td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    onClick={() => setSelectedTransaction(tx)} 
                                    className="action-btn view-btn"
                                    title="Ver detalles"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('¿Reversar esta transacción?')) {
                                        handleReverseTransaction(tx.id);
                                      }
                                    }} 
                                    className={`action-btn ${(tx.status === 'reversed' || tx.status === 'resolved') ? 'view-btn' : 'reverse-btn'}`}
                                    title={
                                      tx.status === 'reversed' ? 'Ya reversada' : 
                                      tx.status === 'resolved' ? 'Ya resuelta' : 
                                      'Reversar'
                                    }
                                    disabled={tx.status === 'reversed' || tx.status === 'resolved'}
                                    style={{
                                      opacity: (tx.status === 'reversed' || tx.status === 'resolved') ? 0.5 : 1,
                                      cursor: (tx.status === 'reversed' || tx.status === 'resolved') ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                      {(tx.status === 'reversed' || tx.status === 'resolved') ? (
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                      ) : (
                                        <>
                                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                          <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" strokeWidth="2"/>
                                        </>
                                      )}
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleSuspendTransaction(tx)}
                                    className={`action-btn suspend-btn ${tx.status === 'suspended' ? 'active' : ''}`}
                                    title={
                                      tx.status === 'suspended' ? 'Resolver disputa' : 
                                      (tx.status === 'reversed' || tx.status === 'resolved') ? 'Ya finalizada' : 
                                      'Suspender'
                                    }
                                    disabled={tx.status === 'reversed' || tx.status === 'resolved'}
                                    style={{
                                      opacity: (tx.status === 'reversed' || tx.status === 'resolved') ? 0.5 : 1,
                                      cursor: (tx.status === 'reversed' || tx.status === 'resolved') ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="admin-users animate-fadeInUp">
                <div className="admin-search-bar">
                  <input
                    type="text"
                    placeholder="Search by name, email, or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                {loading ? (
                  <div className="admin-loading">Loading users...</div>
                ) : (
                  <>
                    {/* Business Users */}
                    <div className="user-category">
                      <h3 className="category-title">Business Users ({businessUsers.length})</h3>
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Email</th>
                              <th>Name</th>
                              <th>Account</th>
                              <th>Balance</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businessUsers.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                                  No business users found
                                </td>
                              </tr>
                            ) : (
                              businessUsers.map(user => (
                                <tr key={user.id}>
                                  <td>{user.email}</td>
                                  <td>{user.full_name || 'N/A'}</td>
                                  <td className="mono-text">{user.account_number}</td>
                                  <td className="amount-text">RD$ {parseFloat(user.balance).toFixed(2)}</td>
                                  <td>
                                    <span className={`status-badge ${user.account_suspended ? 'status-suspended' : 'status-active'}`}>
                                      {user.account_suspended ? 'Suspended' : 'Active'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => setLocation(`/admin/users/${user.id}`)}
                                        className="action-btn details-btn"
                                        title="Ver detalles completos"
                                      >
                                        Details
                                      </button>
                                      <button 
                                        onClick={() => handleSendWarning(user)}
                                        className="action-btn warning-btn"
                                        title="Enviar advertencia"
                                      >
                                        Warn
                                      </button>
                                      <button 
                                        onClick={() => handleSuspendUser(user)}
                                        className="action-btn suspend-btn"
                                        title="Suspender cuenta"
                                      >
                                        Suspend
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Client Users */}
                    <div className="user-category" style={{ marginTop: '40px' }}>
                      <h3 className="category-title">Client Users ({clientUsers.length})</h3>
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Email</th>
                              <th>Name</th>
                              <th>Account</th>
                              <th>Balance</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientUsers.length === 0 ? (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                                  No client users found
                                </td>
                              </tr>
                            ) : (
                              clientUsers.map(user => (
                                <tr key={user.id}>
                                  <td>{user.email}</td>
                                  <td>{user.full_name || 'N/A'}</td>
                                  <td className="mono-text">{user.account_number}</td>
                                  <td className="amount-text">RD$ {parseFloat(user.balance).toFixed(2)}</td>
                                  <td>
                                    <span className={`status-badge ${user.account_suspended ? 'status-suspended' : 'status-active'}`}>
                                      {user.account_suspended ? 'Suspended' : 'Active'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => setLocation(`/admin/users/${user.id}`)}
                                        className="action-btn details-btn"
                                        title="Ver detalles completos"
                                      >
                                        Details
                                      </button>
                                      <button 
                                        onClick={() => handleSendWarning(user)}
                                        className="action-btn warning-btn"
                                        title="Enviar advertencia"
                                      >
                                        Warn
                                      </button>
                                      <button 
                                        onClick={() => handleSuspendUser(user)}
                                        className="action-btn suspend-btn"
                                        title="Suspender cuenta"
                                      >
                                        Suspend
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ESTABLISHMENTS TAB */}
            {activeTab === 'establishments' && (
              <div className="admin-users animate-fadeInUp">
                <div className="admin-search-bar">
                  <input
                    type="text"
                    placeholder="Search by name, email, or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                  <div className="user-table-container">
                    <h3 style={{ marginBottom: '1rem', color: '#0e1116' }}>Establishments</h3>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Business Name</th>
                            <th>Owner</th>
                            <th>Category</th>
                            <th>Revenue</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {establishments.length === 0 ? (
                            <tr>
                              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                                No establishments found
                              </td>
                            </tr>
                          ) : (
                            establishments
                              .filter(est => 
                                searchTerm === '' || 
                                est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                est.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (est.owner_name && est.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
                              )
                              .map(est => (
                                <tr key={est.id}>
                                  <td>{est.email}</td>
                                  <td>{est.name}</td>
                                  <td>{est.owner_name || 'N/A'}</td>
                                  <td>{est.category || 'N/A'}</td>
                                  <td className="amount-text">RD$ {parseFloat(est.balance || '0').toFixed(2)}</td>
                                  <td>
                                    <span className={`status-badge ${est.account_suspended ? 'status-suspended' : 'status-completed'}`}>
                                      {est.account_suspended ? 'Suspended' : 'Active'}
                                    </span>
                                  </td>
                                  <td>{new Date(est.created_at).toLocaleDateString()}</td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => setSelectedEstablishment(est)} 
                                        className="action-btn view-btn"
                                        title="Ver detalles"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2"/>
                                          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const action = est.approved ? 'suspend' : 'approve';
                                          if (confirm(`${action === 'suspend' ? 'Suspend' : 'Approve'} ${est.name}?`)) {
                                            fetch('/api/admin/query', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              credentials: 'include',
                                              body: JSON.stringify({ 
                                                query: `UPDATE establishments SET approved = ${!est.approved}, subscription_status = '${est.approved ? 'suspended' : 'active'}' WHERE id = '${est.id}'`
                                              })
                                            }).then(() => loadEstablishments());
                                          }
                                        }}
                                        className={`action-btn ${est.approved ? 'suspend-btn' : 'view-btn'}`}
                                        title={est.approved ? 'Suspend' : 'Approve'}
                                      >
                                        {est.approved ? '⊗' : '✓'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ISSUING TAB */}
            {activeTab === 'issuing' && (
              <div className="admin-issuing animate-fadeInUp">
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: '#0e1116', fontSize: '1.25rem', fontWeight: '600' }}>Card Issuing</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setIssuingSubTab('requests')}
                      style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: issuingSubTab === 'requests' ? '#0e1116' : '#f1f3f5',
                        color: issuingSubTab === 'requests' ? '#ffffff' : '#5b6472',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        minWidth: '100px',
                      }}
                    >
                      Requests
                    </button>
                    <button
                      onClick={() => setIssuingSubTab('reports')}
                      style={{
                        padding: '0.625rem 1.25rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: issuingSubTab === 'reports' ? '#0e1116' : '#f1f3f5',
                        color: issuingSubTab === 'reports' ? '#ffffff' : '#5b6472',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        minWidth: '100px',
                      }}
                    >
                      Reports
                    </button>
                  </div>
                </div>

                {/* CARD REQUESTS */}
                {issuingSubTab === 'requests' && (
                  <div className="admin-table-container" style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ minWidth: '100%', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ minWidth: '180px' }}>Applicant</th>
                          <th style={{ minWidth: '120px' }}>Contact</th>
                          <th style={{ minWidth: '150px' }}>ID Info</th>
                          <th style={{ minWidth: '200px' }}>Location</th>
                          <th style={{ minWidth: '150px' }}>Employment</th>
                          <th style={{ minWidth: '180px' }}>Reason</th>
                          <th style={{ minWidth: '100px' }}>Status</th>
                          <th style={{ minWidth: '100px' }}>Date</th>
                          <th style={{ minWidth: '160px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                              Loading requests...
                            </td>
                          </tr>
                        ) : cardRequests.length === 0 ? (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                              No card requests found
                            </td>
                          </tr>
                        ) : (
                          cardRequests.map((request) => (
                            <tr key={request.id}>
                              {/* Applicant */}
                              <td>
                                <div style={{ minWidth: '160px' }}>
                                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    {request.full_name || request.fullName}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#5b6472' }}>
                                    DOB: {request.date_of_birth || request.dateOfBirth || '-'}
                                  </div>
                                </div>
                              </td>

                              {/* Contact */}
                              <td>
                                <div style={{ fontSize: '0.85rem', minWidth: '110px' }}>
                                  <div style={{ marginBottom: '0.25rem' }}>{request.phone_number || request.phoneNumber}</div>
                                  <div style={{ color: '#5b6472', fontSize: '0.8rem' }}>
                                    {request.userEmail || request.userName}
                                  </div>
                                </div>
                              </td>

                              {/* ID Info */}
                              <td>
                                <div style={{ fontSize: '0.85rem', minWidth: '130px' }}>
                                  <div style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                                    {request.id_number || request.idNumber}
                                  </div>
                                </div>
                              </td>

                              {/* Location */}
                              <td>
                                <div style={{ fontSize: '0.85rem', minWidth: '180px' }}>
                                  <div style={{ marginBottom: '0.25rem', fontWeight: '500' }}>{request.city}</div>
                                  <div style={{ color: '#5b6472', fontSize: '0.8rem', lineHeight: '1.3' }}>
                                    {request.address ? (request.address.length > 40 ? request.address.substring(0, 40) + '...' : request.address) : '-'}
                                  </div>
                                  {(request.postal_code || request.postalCode) && (
                                    <div style={{ color: '#5b6472', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                      ZIP: {request.postal_code || request.postalCode}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Employment */}
                              <td>
                                <div style={{ fontSize: '0.85rem', minWidth: '130px' }}>
                                  <div style={{ marginBottom: '0.25rem' }}>
                                    {request.occupation || <span style={{ color: '#9ca3af' }}>Not provided</span>}
                                  </div>
                                  {(request.monthly_income || request.monthlyIncome) && (
                                    <div style={{ color: '#5b6472', fontSize: '0.8rem' }}>
                                      Income: {request.monthly_income || request.monthlyIncome}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Reason */}
                              <td>
                                <div style={{ fontSize: '0.85rem', lineHeight: '1.3', minWidth: '160px' }}>
                                  {(request.request_reason || request.requestReason) ? (
                                    (request.request_reason || request.requestReason).length > 50 
                                      ? (request.request_reason || request.requestReason).substring(0, 50) + '...'
                                      : (request.request_reason || request.requestReason)
                                  ) : '-'}
                                </div>
                              </td>

                              {/* Status */}
                              <td>
                                <span
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-block',
                                    backgroundColor:
                                      request.status === 'approved'
                                        ? '#d1fae5'
                                        : request.status === 'rejected'
                                        ? '#fee2e2'
                                        : request.status === 'under_review'
                                        ? '#fef3c7'
                                        : '#e0e7ff',
                                    color:
                                      request.status === 'approved'
                                        ? '#065f46'
                                        : request.status === 'rejected'
                                        ? '#991b1b'
                                        : request.status === 'under_review'
                                        ? '#92400e'
                                        : '#3730a3',
                                  }}
                                >
                                  {request.status}
                                </span>
                              </td>

                              {/* Date */}
                              <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                {new Date(request.created_at || request.createdAt).toLocaleDateString()}
                              </td>

                              {/* Actions */}
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  {request.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedCardRequest(request);
                                          setShowApproveCardModal(true);
                                        }}
                                        style={{
                                          padding: '0.5rem 1rem',
                                          borderRadius: '6px',
                                          border: 'none',
                                          backgroundColor: '#10b981',
                                          color: '#ffffff',
                                          cursor: 'pointer',
                                          fontSize: '0.8125rem',
                                          fontWeight: '600',
                                          whiteSpace: 'nowrap',
                                          minWidth: '80px',
                                        }}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedCardRequest(request);
                                          setShowRejectCardModal(true);
                                        }}
                                        style={{
                                          padding: '0.5rem 1rem',
                                          borderRadius: '6px',
                                          border: 'none',
                                          backgroundColor: '#ef4444',
                                          color: '#ffffff',
                                          cursor: 'pointer',
                                          fontSize: '0.8125rem',
                                          fontWeight: '600',
                                          whiteSpace: 'nowrap',
                                          minWidth: '80px',
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {request.status === 'approved' && (
                                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '500' }}>✓ Approved</span>
                                  )}
                                  {request.status === 'rejected' && (
                                    <div style={{ fontSize: '0.8rem' }}>
                                      <span style={{ color: '#ef4444', fontWeight: '500' }}>✗ Rejected</span>
                                      {request.rejectionReason && (
                                        <div style={{ color: '#5b6472', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                                          {request.rejectionReason.length > 30 
                                            ? request.rejectionReason.substring(0, 30) + '...'
                                            : request.rejectionReason}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* CARD REPORTS */}
                {issuingSubTab === 'reports' && (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Issue Type</th>
                          <th>Description</th>
                          <th>Card</th>
                          <th>User</th>
                          <th>Device</th>
                          <th>Status</th>
                          <th>Reported</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                              Loading reports...
                            </td>
                          </tr>
                        ) : cardReports.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#5b6472' }}>
                              No issue reports found
                            </td>
                          </tr>
                        ) : (
                          cardReports.map((report) => (
                            <tr key={report.id}>
                              <td>
                                <span
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                  }}
                                >
                                  {report.issueType}
                                </span>
                              </td>
                              <td style={{ maxWidth: '300px' }}>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {report.description}
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.85rem' }}>
                                  {report.cardNumber ? `****${report.cardNumber.slice(-4)}` : report.cardId}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{report.userName}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#5b6472' }}>{report.userEmail}</div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.85rem' }}>
                                  {report.deviceModel && <div>{report.deviceModel}</div>}
                                  {report.deviceOS && <div style={{ color: '#5b6472' }}>{report.deviceOS}</div>}
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    backgroundColor:
                                      report.status === 'resolved' || report.status === 'closed'
                                        ? '#d1fae5'
                                        : report.status === 'in_progress'
                                        ? '#fef3c7'
                                        : '#fee2e2',
                                    color:
                                      report.status === 'resolved' || report.status === 'closed'
                                        ? '#065f46'
                                        : report.status === 'in_progress'
                                        ? '#92400e'
                                        : '#991b1b',
                                  }}
                                >
                                  {report.status}
                                </span>
                              </td>
                              <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* DATABASE TAB */}
            {activeTab === 'database' && (
              <div className="admin-database animate-fadeInUp">
                <h3 style={{ marginBottom: '1.5rem', color: '#0e1116' }}>Database Editor</h3>
                
                <div style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
                  {/* Sidebar de tablas */}
                  <div style={{
                    width: '250px',
                    flexShrink: 0,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '1rem',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#5b6472' }}>
                      TABLES ({dbTables.length})
                    </h4>
                    
                    {dbLoading && !selectedTable ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#5b6472' }}>
                        Loading...
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {dbTables.map(table => (
                          <button
                            key={table}
                            onClick={() => {
                              setSelectedTable(table);
                              loadTableData(table);
                            }}
                            style={{
                              padding: '0.75rem',
                              backgroundColor: selectedTable === table ? '#0066ff' : 'transparent',
                              color: selectedTable === table ? 'white' : '#0e1116',
                              border: 'none',
                              borderRadius: '6px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: selectedTable === table ? '600' : '400',
                              transition: 'all 0.2s',
                              width: '100%',
                              overflow: 'visible',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              hyphens: 'auto'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedTable !== table) {
                                e.currentTarget.style.backgroundColor = '#e9ecef';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedTable !== table) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {table}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Área de contenido */}
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0,
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}>
                    {!selectedTable ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#5b6472'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Select a table to view and edit</p>
                        <p style={{ fontSize: '0.9rem' }}>Choose from the list on the left</p>
                      </div>
                    ) : dbLoading ? (
                      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#5b6472' }}>
                        Loading table data...
                      </div>
                    ) : dbError ? (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        color: '#c00'
                      }}>
                        <strong>Error:</strong> {dbError}
                      </div>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <h4 style={{ margin: 0, color: '#0e1116' }}>{selectedTable}</h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#5b6472' }}>
                              {tablePagination.total} rows total
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {tablePagination.page > 1 && (
                              <button
                                onClick={() => loadTableData(selectedTable, tablePagination.page - 1)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#f0f2f5',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ← Previous
                              </button>
                            )}
                            <span style={{ padding: '0.5rem 1rem', color: '#5b6472' }}>
                              Page {tablePagination.page} of {tablePagination.pages}
                            </span>
                            {tablePagination.page < tablePagination.pages && (
                              <button
                                onClick={() => loadTableData(selectedTable, tablePagination.page + 1)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#f0f2f5',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="db-table-scroll-container">
                          <table className="db-editable-table">
                            <thead>
                              <tr>
                                {tableData.length > 0 && Object.keys(tableData[0]).map(col => (
                                  <th key={col}>{col}</th>
                                ))}
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map((row, rowIdx) => (
                                <tr key={row.id || rowIdx}>
                                  {Object.entries(row).map(([columnName, value]: [string, any]) => {
                                    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.columnName === columnName;
                                    
                                    return (
                                      <td 
                                        key={columnName}
                                        onDoubleClick={() => {
                                          if (columnName !== 'id') { // No editar ID
                                            setEditingCell({ rowIdx, columnName });
                                            setEditValue(value === null ? '' : String(value));
                                          }
                                        }}
                                        style={{
                                          cursor: columnName !== 'id' ? 'pointer' : 'default',
                                          backgroundColor: isEditing ? '#fff3cd' : 'transparent',
                                          position: 'relative'
                                        }}
                                      >
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => {
                                              updateCellValue(row.id, columnName, editValue);
                                              setEditingCell(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                updateCellValue(row.id, columnName, editValue);
                                                setEditingCell(null);
                                              } else if (e.key === 'Escape') {
                                                setEditingCell(null);
                                              }
                                            }}
                                            autoFocus
                                            style={{
                                              width: '100%',
                                              padding: '0.25rem',
                                              border: '2px solid #0066ff',
                                              borderRadius: '4px'
                                            }}
                                          />
                                        ) : (
                                          <>
                                            {value === null ? (
                                              <em style={{ color: '#999' }}>null</em>
                                            ) : typeof value === 'boolean' ? (
                                              value ? '✓ true' : '✗ false'
                                            ) : (
                                              String(value)
                                            )}
                                          </>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td>
                                    <button
                                      onClick={() => deleteRow(row.id)}
                                      className="action-btn suspend-btn"
                                      style={{ fontSize: '0.75rem' }}
                                      title="Delete row"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT TAB */}
            {activeTab === 'support' && (
              <SupportTab />
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalles de transacción */}
      {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Transaction Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value mono-text">{selectedTransaction.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">RD$ {parseFloat(selectedTransaction.amount).toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedTransaction.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${selectedTransaction.status}`}>{selectedTransaction.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{new Date(selectedTransaction.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">From:</span>
                <span className="detail-value mono-text">{selectedTransaction.sender_account || selectedTransaction.sender_id || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">To:</span>
                <span className="detail-value mono-text">{selectedTransaction.recipient_account || selectedTransaction.recipient_id || 'N/A'}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedTransaction(null)} className="modal-btn cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resolución de disputa */}
      {showResolveDisputeModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowResolveDisputeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Resolver Disputa</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Selecciona a quién se entregarán los fondos de esta transacción suspendida.
            </p>
            
            <div className="detail-grid" style={{ marginBottom: '24px' }}>
              <div className="detail-item">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value mono-text">{selectedTransaction.id.slice(0, 12)}...</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">RD$ {parseFloat(selectedTransaction.amount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#0e1116' }}>
                ¿A quién entregar los fondos?
              </label>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
                <button
                  onClick={() => setDisputeResolution('sender')}
                  className={`modal-btn ${disputeResolution === 'sender' ? 'primary-btn' : 'secondary-btn'}`}
                  style={{ 
                    flex: 1, 
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minHeight: '80px'
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Remitente</span>
                  <small style={{ fontSize: '11px', opacity: 0.7, wordBreak: 'break-all', textAlign: 'center' }}>
                    {selectedTransaction.sender_account || selectedTransaction.sender_id?.slice(0, 8) || 'N/A'}
                  </small>
                </button>
                <button
                  onClick={() => setDisputeResolution('recipient')}
                  className={`modal-btn ${disputeResolution === 'recipient' ? 'primary-btn' : 'secondary-btn'}`}
                  style={{ 
                    flex: 1, 
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minHeight: '80px'
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Destinatario</span>
                  <small style={{ fontSize: '11px', opacity: 0.7, wordBreak: 'break-all', textAlign: 'center' }}>
                    {selectedTransaction.recipient_account || selectedTransaction.recipient_id?.slice(0, 8) || 'N/A'}
                  </small>
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button onClick={() => {
                setShowResolveDisputeModal(false);
                setDisputeResolution(null);
              }} className="modal-btn cancel-btn" style={{ minWidth: '120px' }}>
                Cancelar
              </button>
              <button 
                onClick={handleResolveDispute} 
                className="modal-btn primary-btn"
                disabled={!disputeResolution}
                style={{ minWidth: '160px', whiteSpace: 'nowrap' }}
              >
                Resolver Disputa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de establishment */}
      {selectedEstablishment && (
        <div className="modal-overlay" onClick={() => setSelectedEstablishment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Establishment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value mono-text">{selectedEstablishment.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Business Name:</span>
                <span className="detail-value">{selectedEstablishment.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Owner:</span>
                <span className="detail-value">{selectedEstablishment.owner_name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedEstablishment.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedEstablishment.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedEstablishment.category || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedEstablishment.address || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Revenue:</span>
                <span className="detail-value">RD$ {parseFloat(selectedEstablishment.balance || '0').toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedEstablishment.account_suspended ? 'status-suspended' : 'status-completed'}`}>
                  {selectedEstablishment.account_suspended ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Approved:</span>
                <span className="detail-value">{selectedEstablishment.approved ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">{new Date(selectedEstablishment.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setSelectedEstablishment(null)} className="modal-btn cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aprobación de tarjeta */}
      {showApproveCardModal && selectedCardRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Approve Card Request</h3>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '15px', fontWeight: '600' }}>Applicant Information</h4>
                <div style={{ fontSize: '0.85rem', color: '#5b6472', display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedCardRequest.full_name || selectedCardRequest.fullName}</div>
                  <div><strong>Date of Birth:</strong> {selectedCardRequest.date_of_birth || selectedCardRequest.dateOfBirth || '-'}</div>
                  <div><strong>ID Number:</strong> {selectedCardRequest.id_number || selectedCardRequest.idNumber}</div>
                  <div><strong>Phone:</strong> {selectedCardRequest.phone_number || selectedCardRequest.phoneNumber}</div>
                  <div><strong>Address:</strong> {selectedCardRequest.address}</div>
                  <div><strong>City:</strong> {selectedCardRequest.city}</div>
                  <div><strong>Postal Code:</strong> {selectedCardRequest.postal_code || selectedCardRequest.postalCode || '-'}</div>
                  <div><strong>Occupation:</strong> {selectedCardRequest.occupation || '-'}</div>
                  <div><strong>Monthly Income:</strong> {selectedCardRequest.monthly_income || selectedCardRequest.monthlyIncome || '-'}</div>
                  <div><strong>Reason:</strong> {selectedCardRequest.request_reason || selectedCardRequest.requestReason || '-'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>
                    Card Number (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value="Will be generated automatically"
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>
                    Expiry Date (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value="Will be generated automatically"
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>CVV (Auto-generated)</label>
                  <input
                    type="text"
                    value="Will be generated automatically"
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>PIN *</label>
                  <input
                    type="text"
                    value={cardApprovalData.pin}
                    onChange={(e) => setCardApprovalData({ ...cardApprovalData, pin: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      color: '#0e1116',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>
                    Daily Limit ($)
                  </label>
                  <input
                    type="number"
                    value={cardApprovalData.dailyLimit}
                    onChange={(e) => setCardApprovalData({ ...cardApprovalData, dailyLimit: e.target.value })}
                    placeholder="1000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      color: '#0e1116',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0e1116' }}>
                    Monthly Limit ($)
                  </label>
                  <input
                    type="number"
                    value={cardApprovalData.monthlyLimit}
                    onChange={(e) => setCardApprovalData({ ...cardApprovalData, monthlyLimit: e.target.value })}
                    placeholder="5000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      color: '#0e1116',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowApproveCardModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleApproveCard} className="modal-btn confirm-btn">
                Approve & Issue Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo de tarjeta */}
      {showRejectCardModal && selectedCardRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Reject Card Request</h3>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '15px', fontWeight: '600' }}>Applicant Information</h4>
                <div style={{ fontSize: '0.85rem', color: '#5b6472', display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedCardRequest.full_name || selectedCardRequest.fullName}</div>
                  <div><strong>Date of Birth:</strong> {selectedCardRequest.date_of_birth || selectedCardRequest.dateOfBirth || '-'}</div>
                  <div><strong>ID Number:</strong> {selectedCardRequest.id_number || selectedCardRequest.idNumber}</div>
                  <div><strong>Phone:</strong> {selectedCardRequest.phone_number || selectedCardRequest.phoneNumber}</div>
                  <div><strong>City:</strong> {selectedCardRequest.city}</div>
                  <div><strong>Occupation:</strong> {selectedCardRequest.occupation || '-'}</div>
                  <div><strong>Reason:</strong> {selectedCardRequest.request_reason || selectedCardRequest.requestReason || '-'}</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowRejectCardModal(false)} className="modal-btn cancel-btn">
                Cancel
              </button>
              <button onClick={handleRejectCard} className="modal-btn confirm-btn" style={{ backgroundColor: '#ef4444' }}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
