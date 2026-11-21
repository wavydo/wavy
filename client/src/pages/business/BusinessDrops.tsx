import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessDrops() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDrop, setEditingDrop] = useState<any>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    triggerType: 'location',
    triggerValue: '',
    maxClaims: '',
    expiresAt: ''
  });

  // Fetch real drops from database
  const { data: dropsData, isLoading } = useQuery({
    queryKey: ['businessDrops'],
    queryFn: async () => {
      const res = await fetch('/api/business/drops', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch drops');
      return res.json();
    }
  });

  const drops = dropsData?.drops || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Prepare data - convert empty strings to null/undefined
      const dropData = {
        title: data.title,
        description: data.description || undefined,
        reward: data.reward,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue || undefined,
        maxClaims: data.maxClaims ? parseInt(data.maxClaims) : undefined,
        expiresAt: data.expiresAt ? data.expiresAt : undefined
      };
      
      const res = await fetch('/api/business/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dropData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create drop');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDrops'] });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        reward: '',
        triggerType: 'location',
        triggerValue: '',
        maxClaims: '',
        expiresAt: ''
      });
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: typeof formData }) => {
      // Prepare data similar to create
      const dropData: any = {
        title: data.title,
        description: data.description || undefined,
        reward: data.reward,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue || undefined,
        maxClaims: data.maxClaims ? parseInt(data.maxClaims) : undefined
      };
      
      // Only add expiresAt if it exists and convert to Date object
      if (data.expiresAt) {
        dropData.expiresAt = typeof data.expiresAt === 'string' ? new Date(data.expiresAt) : data.expiresAt;
      }
      
      const res = await fetch(`/api/business/drops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dropData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update drop');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDrops'] });
      setEditingDrop(null);
      resetForm();
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleEdit = (drop: any) => {
    setEditingDrop(drop);
    setFormData({
      title: drop.title,
      description: drop.description || '',
      reward: drop.reward,
      triggerType: drop.triggerType,
      triggerValue: drop.triggerValue || '',
      maxClaims: drop.maxClaims?.toString() || '',
      expiresAt: drop.expiresAt ? new Date(drop.expiresAt).toISOString().slice(0, 16) : ''
    });
  };

  const resetForm = () => {
    setEditingDrop(null);
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      reward: '',
      triggerType: 'location',
      triggerValue: '',
      maxClaims: '',
      expiresAt: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDrop) {
      updateMutation.mutate({ id: editingDrop.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/drops/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete drop');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDrops'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this drop?')) {
      deleteMutation.mutate(id);
    }
  };

  const getDropStatus = (drop: any) => {
    const now = new Date();
    if (drop.expiresAt) {
      const expiresAt = new Date(drop.expiresAt);
      if (expiresAt < now) return 'completed';
    }
    if (!drop.active) return 'draft';
    return 'active';
  };

  const getTimeRemaining = (expiresAt: string) => {
    if (!expiresAt) return 'No expiry';
    
    const now = new Date();
    const end = new Date(expiresAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <BusinessLayout activeSection="drops">
      <style>{`
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 32px;
        }

        .page-title {
            font-size: 32px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 4px;
        }

        .page-subtitle {
            font-size: 15px;
            color: var(--muted);
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

        .btn-primary {
            background: var(--ink);
            color: #ffffff;
            border-color: var(--ink);
        }

        .btn-primary:hover {
            background: #1a1f28;
        }

        .btn svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
        }

        /* Info Card */
        .info-card {
            background: #ffffff;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--border);
            margin-bottom: 32px;
        }

        .info-card-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 8px;
        }

        .info-card-desc {
            font-size: 14px;
            color: var(--muted);
            line-height: 1.6;
        }

        /* Drops Grid */
        .drops-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr));
            gap: 24px;
            width: 100%;
        }

        .drop-card {
            background: #ffffff;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: all 180ms ease;
            position: relative;
            overflow: hidden;
        }

        .drop-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--ink), #5b6472);
        }

        .drop-card.active::before {
            background: linear-gradient(90deg, var(--success), #10b981);
        }

        .drop-card:hover {
            border-color: rgba(15, 23, 42, 0.16);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .drop-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .drop-status {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            background: rgba(14, 17, 22, 0.04);
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
        }

        .drop-status.active {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .drop-status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
        }

        .drop-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 8px;
        }

        .drop-description {
            font-size: 14px;
            color: var(--muted);
            line-height: 1.5;
            margin-bottom: 16px;
        }

        .drop-time {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: rgba(14, 17, 22, 0.02);
            border-radius: 10px;
            margin-bottom: 16px;
        }

        .drop-time svg {
            width: 18px;
            height: 18px;
            stroke: var(--muted);
        }

        .drop-time-text {
            font-size: 13px;
            color: var(--muted);
            font-weight: 500;
        }

        .drop-spots {
            margin-bottom: 16px;
        }

        .drop-spots-label {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: var(--muted);
            font-weight: 600;
            margin-bottom: 8px;
        }

        .drop-spots-bar {
            width: 100%;
            height: 8px;
            background: rgba(14, 17, 22, 0.06);
            border-radius: 999px;
            overflow: hidden;
        }

        .drop-spots-fill {
            height: 100%;
            background: var(--ink);
            border-radius: 999px;
            transition: width 300ms ease;
        }

        .drop-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            margin-bottom: 16px;
        }

        .drop-stat {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .drop-stat-label {
            font-size: 11px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
        }

        .drop-stat-value {
            font-size: 18px;
            font-weight: 700;
            color: var(--ink);
        }

        .drop-actions {
            display: flex;
            gap: 8px;
        }

        .drop-btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--ink);
        }

        .drop-btn:hover {
            background: rgba(14, 17, 22, 0.04);
        }

        .drop-btn-primary {
            background: var(--ink);
            color: #ffffff;
            border-color: var(--ink);
        }

        .drop-btn-primary:hover {
            background: #1a1f28;
        }

        @media (max-width: 1024px) {
            .drops-grid {
                grid-template-columns: 1fr;
            }

            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">TAPP Drops</h1>
          <p className="page-subtitle">Create time-limited offers to fill capacity and drive demand</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Launch Drop
        </button>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <h3 className="info-card-title">What are TAPP Drops?</h3>
        <p className="info-card-desc">
          Drops are time-sensitive offers sent to nearby TAPP members. Perfect for filling empty tables, slow periods, or last-minute capacity. 
          Members receive push notifications and your drop appears at the top of their feed.
        </p>
      </div>

      {/* Drops Grid */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading drops...
        </div>
      ) : drops.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          padding: '60px 40px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)', 
          textAlign: 'center',
          marginTop: '32px'
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            No drops created yet
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '24px' }}>
            Launch your first TAPP Drop to fill empty tables and drive demand
          </p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Launch Drop
          </button>
        </div>
      ) : (
        <div className="drops-grid">
          {drops.map((drop: any) => {
            const status = getDropStatus(drop);
            const spotsUsed = drop.currentClaims || 0;
            const spotsTotal = drop.maxClaims || 100;
            const spotsPercent = spotsTotal > 0 ? (spotsUsed / spotsTotal) * 100 : 0;
            
            return (
              <div key={drop.id} className={`drop-card ${status === 'active' ? 'active' : ''}`}>
                <div className="drop-header">
                  <span className={`drop-status ${status === 'active' ? 'active' : ''}`}>
                    <span className="drop-status-dot"></span>
                    {status === 'active' ? 'Active' : status === 'draft' ? 'Draft' : 'Completed'}
                  </span>
                </div>
                <h3 className="drop-title">{drop.title}</h3>
                <p className="drop-description">
                  {drop.description || 'No description provided'}
                </p>
                <div className="drop-time">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span className="drop-time-text">
                    {status === 'active' ? `Ends in ${getTimeRemaining(drop.expiresAt)}` :
                     status === 'draft' ? 'Not launched yet' :
                     `Ended ${drop.expiresAt ? new Date(drop.expiresAt).toLocaleDateString() : 'N/A'}`}
                  </span>
                </div>
                <div className="drop-spots">
                  <div className="drop-spots-label">
                    <span>Claims Used</span>
                    <span>{spotsUsed}/{drop.maxClaims || '∞'}</span>
                  </div>
                  <div className="drop-spots-bar">
                    <div className="drop-spots-fill" style={{ width: `${spotsPercent}%` }}></div>
                  </div>
                </div>
                <div className="drop-stats">
                  <div className="drop-stat">
                    <span className="drop-stat-label">Reward</span>
                    <span className="drop-stat-value">{drop.reward}</span>
                  </div>
                  <div className="drop-stat">
                    <span className="drop-stat-label">Type</span>
                    <span className="drop-stat-value">{drop.triggerType}</span>
                  </div>
                  <div className="drop-stat">
                    <span className="drop-stat-label">Claims</span>
                    <span className="drop-stat-value">{spotsUsed}</span>
                  </div>
                </div>
                <div className="drop-actions">
                  {status === 'active' && (
                    <>
                      <button className="drop-btn" onClick={(e) => { e.stopPropagation(); handleEdit(drop); }}>Edit</button>
                      <button className="drop-btn" onClick={(e) => { e.stopPropagation(); alert('End drop functionality coming soon!'); }}>End Drop</button>
                    </>
                  )}
                  {status === 'draft' && (
                    <>
                      <button className="drop-btn drop-btn-primary" onClick={(e) => { e.stopPropagation(); alert('Activate functionality coming soon!'); }}>Activate</button>
                      <button className="drop-btn" onClick={(e) => { e.stopPropagation(); handleEdit(drop); }}>Edit</button>
                    </>
                  )}
                  {status === 'completed' && (
                    <>
                      <button className="drop-btn" onClick={(e) => { e.stopPropagation(); alert('View report functionality coming soon!'); }}>View Report</button>
                      <button className="drop-btn" onClick={(e) => { e.stopPropagation(); alert('Duplicate functionality coming soon!'); }}>Duplicate</button>
                    </>
                  )}
                  <button 
                    className="drop-btn" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(drop.id); }}
                    style={{ color: 'var(--error)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showCreateModal || editingDrop) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => resetForm()}>
          <div style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              {editingDrop ? 'Edit Drop' : 'Launch New Drop'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Drop Title *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Flash Sale: 50% Off Lunch"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Description
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what makes this drop special..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Reward *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.reward}
                  onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  placeholder="e.g., RD$500 off, Free appetizer, 50% discount"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Trigger Type *
                </label>
                <select 
                  value={formData.triggerType}
                  onChange={(e) => setFormData({...formData, triggerType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="location">Location-based (nearby users)</option>
                  <option value="time">Time-based (scheduled)</option>
                  <option value="qr_scan">QR Code scan</option>
                  <option value="random">Random selection</option>
                </select>
              </div>

              {formData.triggerType === 'location' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Radius (meters)
                  </label>
                  <input 
                    type="number"
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({...formData, triggerValue: e.target.value})}
                    placeholder="500"
                    min="50"
                    max="5000"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Distance from your location to show this drop
                  </small>
                </div>
              )}

              {formData.triggerType === 'time' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Activation Time
                  </label>
                  <input 
                    type="datetime-local"
                    value={formData.triggerValue}
                    onChange={(e) => setFormData({...formData, triggerValue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Max Claims
                  </label>
                  <input 
                    type="number"
                    value={formData.maxClaims}
                    onChange={(e) => setFormData({...formData, maxClaims: e.target.value})}
                    placeholder="e.g., 50"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Leave empty for unlimited
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Expires At
                  </label>
                  <input 
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    When this drop ends
                  </small>
                </div>
              </div>

              <div style={{ 
                padding: '16px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '8px', 
                marginBottom: '24px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6', marginBottom: '4px' }}>
                  💡 Pro Tip
                </div>
                <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.5 }}>
                  Launch drops during slow periods to fill capacity. Best times: weekday afternoons, early dinners, or rainy days.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn" 
                  onClick={() => resetForm()}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? (editingDrop ? 'Updating...' : 'Launching...') 
                    : (editingDrop ? 'Update Drop' : 'Launch Drop')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
