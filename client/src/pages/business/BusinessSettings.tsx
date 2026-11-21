import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessSettings() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Expandable sections state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy toggles state
  const [hideGlobally, setHideGlobally] = useState(false);
  const [requestDeletion, setRequestDeletion] = useState(false);

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    logo: '',
    discountPercentage: ''
  });

  // Fetch business data
  const { data: businessData, isLoading } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: async () => {
      const res = await fetch('/api/business/settings', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch business settings');
      const data = await res.json();
      
      // Populate form with fetched data
      if (data.establishment) {
        setBusinessForm({
          businessName: data.establishment.businessName || '',
          ownerName: data.establishment.ownerName || '',
          category: data.establishment.category || '',
          phone: data.establishment.phone || '',
          email: data.establishment.email || '',
          address: data.establishment.address || '',
          city: data.establishment.city || '',
          logo: data.establishment.logo || '',
          discountPercentage: data.establishment.discountPercentage?.toString() || ''
        });
      }
      
      return data;
    }
  });

  // Update business settings mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async (data: typeof businessForm) => {
      const res = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessSettings'] });
      queryClient.invalidateQueries({ queryKey: ['businessUser'] });
      alert('Business settings updated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      return res.json();
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      alert('Contraseña cambiada exitosamente!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessMutation.mutate(businessForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordForm);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessForm({...businessForm, logo: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    setBusinessForm({...businessForm, logo: ''});
  };

  return (
    <BusinessLayout activeSection="settings">
      <style>{`
        .settings-container {
          width: 100%;
          max-width: none;
        }

        .page-header {
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

        .settings-section {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 32px;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .form-input,
        .form-select {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          transition: all 180ms ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--ink);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .btn {
          padding: 12px 24px;
          border-radius: 10px;
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

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Image Upload Area */
        .logo-upload-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logo-preview {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(14, 17, 22, 0.02);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .logo-preview img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .logo-preview-actions {
          display: flex;
          gap: 8px;
        }

        .logo-upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px dashed var(--border);
          border-radius: 10px;
          background: rgba(14, 17, 22, 0.02);
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .logo-upload-button:hover {
          border-color: var(--ink);
          background: rgba(14, 17, 22, 0.04);
          color: var(--ink);
        }

        .logo-upload-button svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
        }

        /* Expandable Sections */
        .expandable-section {
          margin-bottom: 12px;
        }

        .expandable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(14, 17, 22, 0.02);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .expandable-header:hover {
          background: rgba(14, 17, 22, 0.04);
        }

        .expandable-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }

        .expandable-icon {
          width: 20px;
          height: 20px;
          transition: transform 180ms ease;
        }

        .expandable-icon.open {
          transform: rotate(180deg);
        }

        .expandable-content {
          padding: 20px;
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 10px 10px;
          background: #ffffff;
        }

        /* Toggle Switch */
        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }

        .toggle-item:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }

        .toggle-info {
          flex: 1;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .toggle-description {
          font-size: 13px;
          color: var(--muted);
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 28px;
          background: #cbd5e1;
          border-radius: 14px;
          cursor: pointer;
          transition: background 200ms ease;
        }

        .toggle-switch.active {
          background: #3b82f6;
        }

        .toggle-switch.danger.active {
          background: #ef4444;
        }

        .toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform 200ms ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toggle-switch.active .toggle-knob {
          transform: translateX(20px);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .settings-container {
            padding: 0 16px;
          }
        }
      `}</style>

      <div className="settings-container">
        <div className="page-header">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Gestiona la información y ajustes de tu negocio</p>
        </div>

        {/* Business Information */}
        <div className="settings-section">
          <h2 className="section-title">Información del Negocio</h2>
          
          {isLoading ? (
            <p style={{ color: 'var(--muted)' }}>Cargando configuración...</p>
          ) : (
            <form onSubmit={handleBusinessSubmit}>
              {/* Logo Upload */}
              <div className="form-group full-width">
                <label className="form-label">Logo del Negocio</label>
                <div className="logo-upload-area">
                  {businessForm.logo ? (
                    <div className="logo-preview">
                      <img src={businessForm.logo} alt="Logo" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Logo actual</p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Haz clic en "Cambiar" para actualizar</p>
                      </div>
                      <div className="logo-preview-actions">
                        <label className="btn">
                          Cambiar
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button type="button" className="btn" onClick={handleDeleteLogo} style={{ color: 'var(--error)' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="logo-upload-button">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Subir Logo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Negocio</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={businessForm.businessName}
                    onChange={(e) => setBusinessForm({...businessForm, businessName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Dueño</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={businessForm.ownerName}
                    onChange={(e) => setBusinessForm({...businessForm, ownerName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={businessForm.category}
                    onChange={(e) => setBusinessForm({...businessForm, category: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="retail">Retail</option>
                    <option value="services">Servicios</option>
                    <option value="entertainment">Entretenimiento</option>
                    <option value="health">Salud</option>
                    <option value="education">Educación</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel"
                    className="form-input"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email"
                    className="form-input"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm({...businessForm, city: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Dirección</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={businessForm.address}
                    onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descuento Base (%)</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={businessForm.discountPercentage}
                    onChange={(e) => setBusinessForm({...businessForm, discountPercentage: e.target.value})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={updateBusinessMutation.isPending}>
                  {updateBusinessMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <h2 className="section-title">Configuración de Cuenta</h2>

          {/* Cambiar Contraseña - Expandable */}
          <div className="expandable-section">
            <div 
              className="expandable-header"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <span className="expandable-title">Cambiar Contraseña</span>
              <svg 
                className={`expandable-icon ${showPasswordChange ? 'open' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            
            {showPasswordChange && (
              <div className="expandable-content">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Contraseña Actual</label>
                    <input 
                      type="password"
                      className="form-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Nueva Contraseña</label>
                    <input 
                      type="password"
                      className="form-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input 
                      type="password"
                      className="form-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Privacidad - Expandable */}
          <div className="expandable-section">
            <div 
              className="expandable-header"
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
            >
              <span className="expandable-title">Privacidad</span>
              <svg 
                className={`expandable-icon ${showPrivacySettings ? 'open' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            
            {showPrivacySettings && (
              <div className="expandable-content">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">Ocultar de búsquedas globales</div>
                    <div className="toggle-description">
                      Tu negocio no aparecerá en búsquedas públicas de la app
                    </div>
                  </div>
                  <div 
                    className={`toggle-switch ${hideGlobally ? 'active' : ''}`}
                    onClick={() => setHideGlobally(!hideGlobally)}
                  >
                    <div className="toggle-knob"></div>
                  </div>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">Solicitar eliminación de cuenta</div>
                    <div className="toggle-description">
                      Marca esta opción para iniciar el proceso de eliminación de tu cuenta
                    </div>
                  </div>
                  <div 
                    className={`toggle-switch danger ${requestDeletion ? 'active' : ''}`}
                    onClick={() => {
                      if (!requestDeletion) {
                        if (confirm('¿Estás seguro de que deseas solicitar la eliminación de tu cuenta? Esta acción no se puede deshacer.')) {
                          setRequestDeletion(true);
                        }
                      } else {
                        setRequestDeletion(false);
                      }
                    }}
                  >
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
