import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessPerks() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPerk, setEditingPerk] = useState<any>(null);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [formData, setFormData] = useState({
    type: 'discount',
    title: '',
    description: '',
    value: '',
    image: '',
    validFrom: '',
    validUntil: '',
    maxRedemptions: ''
  });

  // Fetch real perks from database
  const { data: perksData, isLoading } = useQuery({
    queryKey: ['businessPerks'],
    queryFn: async () => {
      const res = await fetch('/api/business/perks', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch perks');
      return res.json();
    }
  });

  const perks = perksData?.perks || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Prepare data - convert empty strings to null/undefined
      const perkData = {
        type: data.type,
        title: data.title,
        description: data.description || undefined,
        value: data.value,
        image: data.image || undefined,
        validFrom: data.validFrom, // Send as ISO string
        validUntil: data.validUntil, // Send as ISO string
        maxRedemptions: data.maxRedemptions ? parseInt(data.maxRedemptions) : undefined
      };
      
      const res = await fetch('/api/business/perks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(perkData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create perk');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPerks'] });
      setShowCreateModal(false);
      setFormData({ 
        type: 'discount', 
        title: '', 
        description: '', 
        value: '', 
        image: '',
        validFrom: '',
        validUntil: '',
        maxRedemptions: ''
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
      const perkData: any = {
        type: data.type,
        title: data.title,
        description: data.description || undefined,
        value: String(data.value),
        image: data.image || undefined,
        validFrom: typeof data.validFrom === 'string' ? new Date(data.validFrom) : data.validFrom,
        validUntil: typeof data.validUntil === 'string' ? new Date(data.validUntil) : data.validUntil,
        maxRedemptions: data.maxRedemptions ? parseInt(data.maxRedemptions) : undefined
      };
      
      const res = await fetch(`/api/business/perks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(perkData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update perk');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPerks'] });
      setEditingPerk(null);
      setFormData({ 
        type: 'discount', 
        title: '', 
        description: '', 
        value: '', 
        image: '',
        validFrom: '',
        validUntil: '',
        maxRedemptions: ''
      });
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleEdit = (perk: any) => {
    setEditingPerk(perk);
    setFormData({
      type: perk.type,
      title: perk.title,
      description: perk.description || '',
      value: perk.value,
      image: perk.image || '',
      validFrom: perk.validFrom ? new Date(perk.validFrom).toISOString().slice(0, 16) : '',
      validUntil: perk.validUntil ? new Date(perk.validUntil).toISOString().slice(0, 16) : '',
      maxRedemptions: perk.maxRedemptions?.toString() || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerk) {
      updateMutation.mutate({ id: editingPerk.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setEditingPerk(null);
    setShowCreateModal(false);
    setFormData({ 
      type: 'discount', 
      title: '', 
      description: '', 
      value: '', 
      image: '',
      validFrom: '',
      validUntil: '',
      maxRedemptions: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/perks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete perk');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPerks'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this perk?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <BusinessLayout activeSection="perks">
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

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--ink);
            min-width: 160px;
            justify-content: center;
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

        .empty-state {
            background: #ffffff;
            padding: 80px 60px;
            border-radius: 16px;
            border: 1px solid var(--border);
            text-align: center;
            margin-top: 40px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .empty-state h3 {
            font-size: 24px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 12px;
        }

        .empty-state p {
            font-size: 15px;
            color: var(--muted);
            margin-bottom: 24px;
        }

        .perks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            width: 100%;
        }

        @media (max-width: 1400px) {
            .perks-grid {
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            }
        }

        @media (max-width: 1024px) {
            .perks-grid {
                grid-template-columns: 1fr;
            }
        }

        .perk-card {
            background: #ffffff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid var(--border);
            transition: all 180ms ease;
            display: flex;
            flex-direction: column;
        }

        .perk-card:hover {
            border-color: rgba(15, 23, 42, 0.16);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .perk-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .perk-type {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: rgba(14, 17, 22, 0.04);
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
        }

        .perk-type.discount {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .perk-type.cashback {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .perk-type.points {
            background: rgba(168, 85, 247, 0.1);
            color: #a855f7;
        }

        .perk-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: 6px;
        }

        .perk-description {
            font-size: 13px;
            color: var(--muted);
            line-height: 1.5;
            margin-bottom: 12px;
            flex: 1;
        }

        .perk-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 4px;
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .perk-value-suffix {
            font-size: 18px;
            font-weight: 600;
            color: var(--muted);
        }

        .perk-dates {
            font-size: 11px;
            color: var(--muted);
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--border);
        }

        .perk-actions {
            display: flex;
            gap: 6px;
            margin-top: 16px;
        }

        .perk-btn {
            flex: 1;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--ink);
            text-align: center;
        }

        .perk-btn:hover {
            background: rgba(14, 17, 22, 0.04);
        }

        .perk-btn-primary {
            background: var(--ink);
            color: #ffffff;
            border-color: var(--ink);
        }

        .perk-btn-danger {
            color: var(--error);
            border-color: var(--error);
        }

        .perk-btn-danger:hover {
            background: rgba(239, 68, 68, 0.1);
        }
      `}</style>

      <div className="editorial-header">
        <span className="section-number">01</span>
        <div className="header-content">
          <h1 className="section-title">Perks & Discounts</h1>
          <p className="section-description">Manage cashback rates, discounts, and rewards for your customers</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create New Perk
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading your perks...</p>
        </div>
      ) : perks.length === 0 ? (
        <div className="empty-state">
          <h3>No perks created yet</h3>
          <p>Create your first perk to start rewarding your customers</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Your First Perk
          </button>
        </div>
      ) : (
        <div className="perks-grid">
          {perks.map((perk: any) => (
            <div key={perk.id} className="perk-card">
              <div className="perk-header">
                <span className={`perk-type ${perk.type}`}>{perk.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                <div className="perk-value">
                  {perk.value}
                  <span className="perk-value-suffix">
                    {perk.type === 'points' ? 'pts' : '%'}
                  </span>
                </div>
              </div>
              <h3 className="perk-title">{perk.title}</h3>
              <p className="perk-description">{perk.description || 'No description'}</p>
              <div className="perk-dates">
                Válido hasta: {new Date(perk.validUntil).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
              <div className="perk-actions">
                <button className="perk-btn perk-btn-primary" onClick={() => handleEdit(perk)}>Editar</button>
                <button 
                  className="perk-btn perk-btn-danger" 
                  onClick={() => handleDelete(perk.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreateModal || editingPerk) && (
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
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              {editingPerk ? 'Edit Perk' : 'Create New Perk'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Type
                </label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="discount">Discount (%)</option>
                  <option value="cashback">Cashback (%)</option>
                  <option value="points">Points</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Title *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., 20% Off All Items"
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
                  Value * {formData.type === 'points' ? '(points)' : '(%)'}
                </label>
                <input 
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder={formData.type === 'points' ? '100' : '20'}
                  min="0"
                  max={formData.type === 'points' ? undefined : 100}
                  step={formData.type === 'points' ? '1' : '0.1'}
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
                  placeholder="Describe this perk..."
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
                  Imagen
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: imageInputType === 'url' ? 'var(--ink)' : '#ffffff',
                      color: imageInputType === 'url' ? '#ffffff' : 'var(--ink)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('upload')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: imageInputType === 'upload' ? 'var(--ink)' : '#ffffff',
                      color: imageInputType === 'upload' ? '#ffffff' : 'var(--ink)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    Subir Archivo
                  </button>
                </div>

                {imageInputType === 'url' ? (
                  <input 
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px', 
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                          }} 
                        />
                      </div>
                    )}
                  </div>
                )}
                <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  Opcional - agrega una imagen para este perk
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Valid From *
                  </label>
                  <input 
                    type="datetime-local"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Valid Until *
                  </label>
                  <input 
                    type="datetime-local"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Max Redemptions
                </label>
                <input 
                  type="number"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({...formData, maxRedemptions: e.target.value})}
                  placeholder="e.g., 100"
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
                  Leave empty for unlimited redemptions
                </small>
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
                    ? (editingPerk ? 'Updating...' : 'Creating...') 
                    : (editingPerk ? 'Update Perk' : 'Create Perk')
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
