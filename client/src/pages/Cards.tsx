import { useState, useEffect } from 'react';
import './Cards.css';
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';
import cardService from '../services/cardService';

interface DashboardData {
  user: {
    fullName: string;
    level: string;
  };
  cards: Array<{
    id: string;
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cardType: string;
    status: string;
    lastUsed: string | null;
  }>;
  transactions: Array<{
    id: string;
    amount: string;
    finalAmount: string;
    discount: string | null;
    points: number;
    date: string;
    establishment: string;
    category: string;
  }>;
}

export default function Cards() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [toggles, setToggles] = useState({
    cardEnabled: true,
    contactless: true,
    online: true,
    international: false,
  });
  const [dailyLimit, setDailyLimit] = useState('10000');
  const [monthlyLimit, setMonthlyLimit] = useState('100000');
  const [cardLocked, setCardLocked] = useState(false);
  
  // Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  
  // PIN form
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Report form
  const [reportType, setReportType] = useState<'lost' | 'stolen' | 'damaged' | 'fraud' | 'other'>('other');
  const [reportDescription, setReportDescription] = useState('');
  
  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos reales incluyendo configuración de tarjeta
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching cards data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Cards data loaded:', data.cards?.length, 'cards');
          setDashboardData(data);
          
          // Cargar configuración detallada de la primera tarjeta
          if (data.cards && data.cards.length > 0) {
            await loadCardConfig(data.cards[0].id);
          }
        } else {
          console.error('❌ Failed to fetch data:', response.status);
          if (response.status === 401 || response.status === 403) {
            window.location.href = '/auth';
          }
        }
      } catch (error) {
        console.error('❌ Error:', error);
        window.location.href = '/auth';
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar configuración detallada de la tarjeta
  const loadCardConfig = async (cardId: string) => {
    try {
      const config = await cardService.getCardDetails(cardId);
      
      setCardLocked(config.cardLocked);
      setToggles({
        cardEnabled: !config.cardLocked,
        contactless: config.contactlessEnabled,
        online: config.onlineTransactionsEnabled,
        international: config.internationalUsageEnabled,
      });
      setDailyLimit(String(config.dailyLimit));
      setMonthlyLimit(String(config.monthlyLimit));
      
      console.log('✅ Card config loaded:', config);
    } catch (error) {
      console.error('❌ Error loading card config:', error);
    }
  };

  // Manejar bloqueo/desbloqueo de tarjeta
  const handleToggleCardLock = async () => {
    if (!primaryCard) return;
    
    setShowLockConfirm(false);
    setIsUpdating(true);
    
    try {
      const newLockedState = !cardLocked;
      await cardService.toggleCardLock(primaryCard.id, newLockedState);
      setCardLocked(newLockedState);
      setToggles({ ...toggles, cardEnabled: !newLockedState });
      
      alert(newLockedState ? '🔒 Card locked successfully' : '🔓 Card unlocked successfully');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar cambio de PIN
  const handleChangePin = async () => {
    if (!primaryCard) return;
    
    // Validaciones
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    setIsUpdating(true);
    setPinError('');
    
    try {
      await cardService.changePin(primaryCard.id, oldPin, newPin);
      alert('✅ PIN changed successfully');
      setShowPinModal(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      setPinError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar toggle de configuraciones
  const handleToggleSetting = async (key: keyof typeof toggles) => {
    if (!primaryCard || key === 'cardEnabled') return;
    
    const newValue = !toggles[key];
    setToggles({ ...toggles, [key]: newValue });
    
    try {
      const settingMap = {
        contactless: 'contactlessEnabled',
        online: 'onlineTransactionsEnabled',
        international: 'internationalUsageEnabled',
      };
      
      console.log(`📝 Updating ${key} to ${newValue}`);
      
      await cardService.updateSettings(primaryCard.id, {
        [settingMap[key]]: newValue,
      } as any);
      
      console.log(`✅ ${key} updated to ${newValue}`);
    } catch (error: any) {
      console.error(`❌ Error updating ${key}:`, error);
      // Revertir en caso de error
      setToggles({ ...toggles, [key]: !newValue });
      alert(`Failed to update ${key}: ${error.message || 'Unknown error'}`);
    }
  };

  // Actualizar límites
  const handleUpdateLimit = async (type: 'daily' | 'monthly') => {
    if (!primaryCard) return;
    
    setIsUpdating(true);
    
    try {
      const value = type === 'daily' ? parseFloat(dailyLimit) : parseFloat(monthlyLimit);
      
      if (isNaN(value) || value < 0) {
        alert('❌ Please enter a valid amount');
        return;
      }
      
      console.log(`📝 Updating ${type} limit to ${value}`);
      
      await cardService.updateLimits(primaryCard.id, {
        [type === 'daily' ? 'dailyLimit' : 'monthlyLimit']: value,
      });
      
      alert(`✅ ${type === 'daily' ? 'Daily' : 'Monthly'} limit updated successfully`);
      console.log(`✅ ${type} limit updated to ${value}`);
      
    } catch (error: any) {
      console.error(`❌ Error updating ${type} limit:`, error);
      alert(`Failed to update ${type} limit: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reportar problema
  const handleReportIssue = async () => {
    if (!primaryCard) return;
    
    if (!reportDescription.trim()) {
      alert('❌ Please provide a description');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await cardService.reportIssue(primaryCard.id, {
        reportType,
        description: reportDescription,
      });
      
      alert('✅ Report submitted successfully');
      
      // Si es robo o pérdida, la tarjeta se bloqueó automáticamente
      if (reportType === 'stolen' || reportType === 'lost') {
        alert('🔒 Your card has been automatically locked for security');
        setCardLocked(true);
        setToggles({ ...toggles, cardEnabled: false });
      }
      
      setShowReportModal(false);
      setReportDescription('');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Hide global header when this component mounts
  useEffect(() => {
    const header = document.querySelector('header');
    const body = document.body;
    
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    
    // Add dashboard class to body for consistent background
    body.classList.add('dashboard-active');
    
    // Override body styles - DO NOT modify overflow
    body.style.cursor = 'auto';
    
    // Show header again when component unmounts
    return () => {
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      
      // Remove dashboard class and restore styles
      body.classList.remove('dashboard-active');
      body.style.cursor = '';
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  const flipCard = () => {
    setCardFlipped(!cardFlipped);
  };

  const toggleSwitch = (key: keyof typeof toggles) => {
    if (key === 'cardEnabled') {
      // Para card enabled, mostrar confirmación de bloqueo
      setShowLockConfirm(true);
    } else {
      handleToggleSetting(key);
    }
  };

  // Obtener la primera tarjeta (si existe)
  const primaryCard = dashboardData?.cards && dashboardData.cards.length > 0 ? dashboardData.cards[0] : null;

  // Formatear número de tarjeta para mostrar solo los últimos 4 dígitos
  const formatCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `•••• ${last4}`;
  };

  // Obtener icono por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'cafe':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        );
      case 'retail':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        );
    }
  };

  return (
    <div className="cards-page-container">
      {/* Sidebar */}
      <nav className={`cards-sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
        <button id="btn_close" onClick={closeSidebar}>
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
          <a href="/dashboard/user" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="nav_link_text">Dashboard</div>
          </a>
          <a href="/dashboard/benefits" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-9"/>
                <path d="M14 17H5"/>
                <circle cx="17" cy="17" r="3"/>
                <circle cx="7" cy="7" r="3"/>
              </svg>
            </div>
            <div className="nav_link_text">Benefits</div>
          </a>
          <a href="/dashboard/events" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="nav_link_text">Events</div>
          </a>
          <a href="/dashboard/explore" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <div className="nav_link_text">Explore</div>
          </a>
          <a href="/dashboard/cards" className="nav_link active">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div className="nav_link_text">Cards</div>
          </a>
          <a href="#" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
            </div>
            <div className="nav_link_text">Wallet</div>
          </a>
          <a href="#" className="nav_link">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div className="nav_link_text">Settings</div>
          </a>
        </div>
        <div className="life_cover_offer">
          <img src="https://raw.githubusercontent.com/shyamtala003/finance_dashboard/%40sjtala/images/women.svg" alt="" />
          <div className="life_cover_text">
            <p className="title">Congratulations!</p>
            <p className="desc">You'r eligible for instant Life cover upto 2,00,000 without any medical test for documentation</p>
          </div>
          <a href="#">buy now</a>
        </div>
        <div className="profile">
          <div className="img_with_name">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {dashboardData?.user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="name">{dashboardData?.user?.fullName || 'User'}</p>
              <p className="occupation">{dashboardData?.user?.level || 'member'}</p>
            </div>
          </div>
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
            <path d="M12 6a3.5 3.5 0 0 0-3.5 3.5h2A1.5 1.5 0 1 1 12 11a1 1 0 0 0-1 1v2h2v-1.16A3.49 3.49 0 0 0 12 6zm-1 9h2v2h-2z"/>
          </svg>
        </div>
      </nav>

      {/* Mobile menu button */}
      <button id="menu_btn" onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
        </svg>
      </button>

      {/* Main Content */}
      <div className="cards-main-content">
        <div className="cards-container">
          {/* Page Header */}
          <div className="page-header animate-fadeInDown">
            <div className="page-title-group">
              <h1 className="page-title">Cards</h1>
              <p className="page-subtitle">Manage your TAPP cards, settings, and security preferences. Full control at your fingertips.</p>
            </div>
          </div>

          {isLoading ? (
            // Loading skeletons
            <div className="cards-main-grid">
              <div className="skeleton-card" style={{ minHeight: '600px' }}>
                <div className="skeleton skeleton-title" style={{ width: '40%', height: '24px', marginBottom: '24px' }}></div>
                <div className="skeleton skeleton-image" style={{ height: '328px', marginBottom: '24px' }}></div>
                <div className="skeleton skeleton-button" style={{ width: '100%', height: '44px', marginBottom: '16px' }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className="skeleton skeleton-button" style={{ height: '48px' }}></div>
                  <div className="skeleton skeleton-button" style={{ height: '48px' }}></div>
                  <div className="skeleton skeleton-button" style={{ height: '48px' }}></div>
                  <div className="skeleton skeleton-button" style={{ height: '48px' }}></div>
                </div>
              </div>
              <div className="skeleton-card" style={{ minHeight: '400px' }}>
                <div className="skeleton skeleton-text" style={{ marginBottom: '20px' }}></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            </div>
          ) : (
            <div className="cards-placeholder">
              <h3>Cards Section</h3>
              <p>Card functionality temporarily disabled for debugging</p>
            </div>
          )}
          <div className="cards-main-grid">
            {/* Card Showcase */}
            <div className="card-showcase-section animate-fadeInUp animate-delay-100">
              <div className="showcase-header">
                <h2 className="showcase-title">Your TAPP Card</h2>
                <div className="card-status-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Active
                </div>
              </div>

              {/* 3D Card Mockup */}
              <div className="card-mockup-container">
                <div className={`card-mockup ${cardFlipped ? 'flipped' : ''}`}>
                  {/* Front */}
                  <div className="card-face card-front">
                    <div className="card-gradient-overlay"></div>
                    <div className="card-header">
                      <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="2" fill="rgba(255,255,255,0.9)" />
                        <path d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22" 
                          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26" 
                          stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <h2 className="tapp-wordmark">tapp</h2>
                    </div>
                    <div className="card-footer-real">
                      <div>
                        <div className="card-label-minimal">Member</div>
                        <div className="card-value">{primaryCard?.cardholderName || 'Cardholder'}</div>
                      </div>
                      <div className="card-expiry-box">
                        <div className="card-label-minimal">Valid thru</div>
                        <div className="card-value card-mono">{primaryCard?.expiryDate || '12/27'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="card-face card-back">
                    <div className="card-magnetic-strip"></div>
                    <div className="card-back-content">
                      <div className="card-signature-panel">
                        <span className="signature-text">{dashboardData?.user?.fullName || 'User Name'}</span>
                        <span className="cvv-box">***</span>
                      </div>
                      <div className="card-back-info">
                        This card is property of TAPP Network. If found, please return to any TAPP location or call +1-809-XXX-XXXX. Unauthorized use is prohibited.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flip Button */}
              <button className="flip-card-btn" onClick={flipCard}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Flip Card
              </button>

              {/* Quick Actions */}
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => setShowLockConfirm(true)} disabled={isUpdating}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  {cardLocked ? 'Unlock Card' : 'Lock Card'}
                </button>
                <button className="quick-action-btn" onClick={() => setShowPinModal(true)} disabled={isUpdating}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Change PIN
                </button>
                <button className="quick-action-btn" onClick={flipCard}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Details
                </button>
                <button className="quick-action-btn" onClick={() => setShowReportModal(true)} disabled={isUpdating}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  Report Issue
                </button>
              </div>

              {/* Recent Activity - Inline */}
              <div className="recent-activity-inline">
                <div className="recent-activity-header">
                  <h3 className="recent-activity-title">Recent Activity</h3>
                  <a className="view-all-link-small">View All →</a>
                </div>
                <div className="transaction-list-compact">
                  {dashboardData?.transactions && dashboardData.transactions.length > 0 ? (
                    dashboardData.transactions.slice(0, 4).map((transaction) => {
                      const amount = parseFloat(transaction.finalAmount);
                      const isPositive = amount > 0;
                      const date = new Date(transaction.date);
                      const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div key={transaction.id} className="transaction-item-compact">
                          <div className="transaction-icon-small">
                            {getCategoryIcon(transaction.category)}
                          </div>
                          <div className="transaction-info-compact">
                            <div className="transaction-merchant-small">{transaction.establishment}</div>
                            <div className="transaction-date-small">{formattedDate}</div>
                          </div>
                          <div className="transaction-amounts">
                            <div className={`transaction-amount-small ${isPositive ? 'positive' : ''}`}>
                              {isPositive ? '+' : '-'}RD$ {Math.abs(amount).toLocaleString('en-US')}
                            </div>
                            <div className="transaction-points-small">+{transaction.points} points</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: 'var(--muted)' }}>No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="card-controls-section animate-fadeInUp animate-delay-200">
              {/* Card Status Control */}
              <div className="control-panel">
                <div className="control-panel-header">
                  <div className="control-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <rect x="3" y="7" width="18" height="13" rx="2"/>
                      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </div>
                  <div>
                    <div className="control-panel-title">Card Status</div>
                    <div className="control-panel-desc">Manage card activation and restrictions</div>
                  </div>
                </div>
                <div className="toggle-control">
                  <div className="toggle-label">
                    <div className="toggle-title">Card Enabled</div>
                    <div className="toggle-subtitle">Allow transactions with this card</div>
                  </div>
                  <div className={`toggle-switch ${toggles.cardEnabled ? 'active' : ''}`} onClick={() => toggleSwitch('cardEnabled')}></div>
                </div>
                <div className="toggle-control">
                  <div className="toggle-label">
                    <div className="toggle-title">Contactless Payments</div>
                    <div className="toggle-subtitle">Tap-to-pay at merchants</div>
                  </div>
                  <div className={`toggle-switch ${toggles.contactless ? 'active' : ''}`} onClick={() => toggleSwitch('contactless')}></div>
                </div>
                <div className="toggle-control">
                  <div className="toggle-label">
                    <div className="toggle-title">Online Transactions</div>
                    <div className="toggle-subtitle">E-commerce and app purchases</div>
                  </div>
                  <div className={`toggle-switch ${toggles.online ? 'active' : ''}`} onClick={() => toggleSwitch('online')}></div>
                </div>
                <div className="toggle-control">
                  <div className="toggle-label">
                    <div className="toggle-title">International Usage</div>
                    <div className="toggle-subtitle">Use card outside Dominican Republic</div>
                  </div>
                  <div className={`toggle-switch ${toggles.international ? 'active' : ''}`} onClick={() => toggleSwitch('international')}></div>
                </div>
              </div>

              {/* Spending Limits */}
              <div className="control-panel">
                <div className="control-panel-header">
                  <div className="control-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 6v6l3 3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="control-panel-title">Spending Controls</div>
                    <div className="control-panel-desc">Set daily and monthly limits</div>
                  </div>
                </div>
                <div className="spending-limit-control">
                  <div className="toggle-label" style={{marginBottom: '8px'}}>
                    <div className="toggle-title">Daily Limit</div>
                    <div className="toggle-subtitle">Maximum spending per day</div>
                  </div>
                  <div className="limit-input-group">
                    <input 
                      type="number" 
                      className="limit-input" 
                      placeholder="10000" 
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      disabled={isUpdating}
                    />
                    <button 
                      className="limit-btn" 
                      onClick={() => handleUpdateLimit('daily')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
                <div className="spending-limit-control">
                  <div className="toggle-label" style={{marginBottom: '8px'}}>
                    <div className="toggle-title">Monthly Limit</div>
                    <div className="toggle-subtitle">Maximum spending per month</div>
                  </div>
                  <div className="limit-input-group">
                    <input 
                      type="number" 
                      className="limit-input" 
                      placeholder="100000" 
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(e.target.value)}
                      disabled={isUpdating}
                    />
                    <button 
                      className="limit-btn" 
                      onClick={() => handleUpdateLimit('monthly')}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="control-panel">
                <div className="control-panel-header">
                  <div className="control-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="control-panel-title">Security</div>
                    <div className="control-panel-desc">Protection and authentication</div>
                  </div>
                </div>
                <div className="security-grid">
                  <div className="security-item">
                    <div className="security-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </div>
                    <div className="security-item-content">
                      <div className="security-item-title">Transaction Notifications</div>
                      <div className="security-item-desc">Real-time alerts for every purchase</div>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <path d="M7 10v12"/>
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                      </svg>
                    </div>
                    <div className="security-item-content">
                      <div className="security-item-title">Biometric Authentication</div>
                      <div className="security-item-desc">Fingerprint or Face ID verification</div>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <circle cx="12" cy="10" r="3"/>
                        <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/>
                      </svg>
                    </div>
                    <div className="security-item-content">
                      <div className="security-item-title">Location Restrictions</div>
                      <div className="security-item-desc">Block transactions outside trusted areas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* MODALS */}
      
      {/* Lock/Unlock Confirmation Modal */}
      {showLockConfirm && (
        <div className="modal-overlay" onClick={() => setShowLockConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{cardLocked ? '🔓 Unlock Card?' : '🔒 Lock Card?'}</h3>
            <p>
              {cardLocked 
                ? 'Your card will be unlocked and you can use it for transactions.'
                : 'Your card will be locked and cannot be used for any transactions until you unlock it.'}
            </p>
            <div className="modal-actions">
              <button className="modal-btn-secondary" onClick={() => setShowLockConfirm(false)}>
                Cancel
              </button>
              <button className="modal-btn-primary" onClick={handleToggleCardLock} disabled={isUpdating}>
                {isUpdating ? 'Processing...' : cardLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Change PIN</h3>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--muted)' }}>
              Enter your new 4-digit PIN
            </p>
            
            {pinError && (
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                {pinError}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <input
                type="password"
                maxLength={4}
                placeholder="Current PIN (if set)"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '8px'
                }}
                disabled={isUpdating}
              />
              <input
                type="password"
                maxLength={4}
                placeholder="New PIN (4 digits)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '8px'
                }}
                disabled={isUpdating}
              />
              <input
                type="password"
                maxLength={4}
                placeholder="Confirm New PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '8px'
                }}
                disabled={isUpdating}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-btn-secondary" 
                onClick={() => {
                  setShowPinModal(false);
                  setPinError('');
                  setOldPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                className="modal-btn-primary" 
                onClick={handleChangePin}
                disabled={isUpdating || newPin.length !== 4}
              >
                {isUpdating ? 'Changing...' : 'Change PIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🚨 Report Card Issue</h3>
            <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--muted)' }}>
              Report a problem with your card. For lost/stolen cards, we'll automatically lock it for security.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Issue Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
                disabled={isUpdating}
              >
                <option value="lost">Lost Card</option>
                <option value="stolen">Stolen Card</option>
                <option value="damaged">Damaged Card</option>
                <option value="fraud">Suspected Fraud</option>
                <option value="other">Other Issue</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Description
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                disabled={isUpdating}
              />
            </div>
            
            {(reportType === 'lost' || reportType === 'stolen') && (
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#ef4444'
              }}>
                ⚠️ Your card will be automatically locked after submitting this report.
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="modal-btn-secondary" 
                onClick={() => {
                  setShowReportModal(false);
                  setReportDescription('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                className="modal-btn-primary" 
                onClick={handleReportIssue}
                disabled={isUpdating}
                style={{
                  background: (reportType === 'lost' || reportType === 'stolen') ? '#ef4444' : undefined
                }}
              >
                {isUpdating ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
