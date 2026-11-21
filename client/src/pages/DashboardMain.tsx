import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  balance: string;
  accountNumber: string;
  points: number;
  level: string;
}

export default function DashboardMain() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'membership' | 'preregister' | 'support'>('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.suspended) {
            window.location.href = '/account-suspended';
            return;
          }
          setUserData(data.user);
          setLoading(false);
        } else {
          if (response.status === 401 || response.status === 403) {
            window.location.href = '/auth';
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/auth';
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #f0f0f0',
            borderTop: '3px solid #16141f',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .dashboard-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          padding: clamp(1.5rem, 3vw, 2rem);
          transition: all 0.3s ease;
        }
        .dashboard-card:hover {
          border-color: rgba(0,0,0,0.12);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .dash-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .dash-btn-primary {
          background: #16141f;
          color: white;
        }
        .dash-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(22,20,31,0.3);
        }
        .dash-btn-secondary {
          background: white;
          color: #16141f;
          border: 1.5px solid rgba(0,0,0,0.1);
        }
        .dash-btn-secondary:hover {
          border-color: rgba(0,0,0,0.2);
          background: #fafafa;
        }
        .nav-item {
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: rgba(22,20,31,0.6);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-item:hover {
          background: rgba(0,0,0,0.04);
          color: #16141f;
        }
        .nav-item.active {
          background: #16141f;
          color: white;
        }
        @media (max-width: 968px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            flex-direction: row !important;
            padding: 12px !important;
            border-top: 1px solid rgba(0,0,0,0.08) !important;
            z-index: 100 !important;
            overflow-x: auto !important;
          }
          .nav-item {
            flex-direction: column !important;
            padding: 8px 16px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }
          .main-content {
            padding-bottom: 80px !important;
          }
        }
      `}</style>

      {/* App Download Popup */}
      {showAppDownload && (
        <div
          onClick={() => setShowAppDownload(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 'clamp(2rem, 4vw, 3rem)',
              maxWidth: 480,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
            <h3 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              marginBottom: 12,
              fontFamily: "'Modulus', -apple-system, sans-serif"
            }}>
              Download Wavy App
            </h3>
            <p style={{ 
              fontSize: 16, 
              color: 'rgba(22,20,31,0.6)', 
              marginBottom: 32,
              lineHeight: 1.6
            }}>
              Get the full experience with our mobile app. Discover places, earn rewards, and manage your account on the go.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="dash-btn dash-btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </button>
              <button className="dash-btn dash-btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Google Play
              </button>
            </div>
            <button
              onClick={() => setShowAppDownload(false)}
              style={{
                marginTop: 20,
                background: 'none',
                border: 'none',
                color: 'rgba(22,20,31,0.5)',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div className="sidebar" style={{
          width: 260,
          background: 'white',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}>
          {/* Logo */}
          <div 
            onClick={() => setLocation('/')}
            style={{ 
              marginBottom: 40,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <img src="/roko.png" alt="Wavy" style={{ width: 40, height: 40 }} />
            <h1 style={{ 
              fontFamily: "'Modulus', -apple-system, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: '#16141f',
              margin: 0
            }}>
              wavy
            </h1>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              Overview
            </div>
            <div 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
              </svg>
              Profile
            </div>
            <div 
              className={`nav-item ${activeSection === 'membership' ? 'active' : ''}`}
              onClick={() => setActiveSection('membership')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 3h4v4M8 3H4v4"/>
              </svg>
              Membership
            </div>
            <div 
              className={`nav-item ${activeSection === 'preregister' ? 'active' : ''}`}
              onClick={() => setActiveSection('preregister')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
              App Pre-register
            </div>
            <div 
              className={`nav-item ${activeSection === 'support' ? 'active' : ''}`}
              onClick={() => setActiveSection('support')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
              Support
            </div>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ border: 'none', background: 'none', width: '100%', justifyContent: 'flex-start' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content" style={{ flex: 1, padding: 'clamp(2rem, 4vw, 3rem)' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ 
              fontSize: 'clamp(28px, 4vw, 36px)', 
              fontWeight: 700,
              marginBottom: 8,
              fontFamily: "'Modulus', -apple-system, sans-serif"
            }}>
              {activeSection === 'overview' && 'Welcome back' + (userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : '')}
              {activeSection === 'profile' && 'Profile Settings'}
              {activeSection === 'membership' && 'Membership & Billing'}
              {activeSection === 'preregister' && 'Mobile App Pre-register'}
              {activeSection === 'support' && 'Help & Support'}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)' }}>
              {activeSection === 'overview' && 'Manage your account and explore what Wavy has to offer'}
              {activeSection === 'profile' && 'Update your personal information and preferences'}
              {activeSection === 'membership' && 'Manage your subscription and payment methods'}
              {activeSection === 'preregister' && 'Be the first to experience Wavy mobile'}
              {activeSection === 'support' && 'Get help or reach out to our team'}
            </p>
          </div>

          {/* Content Sections */}
          {activeSection === 'overview' && (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Account Info Card */}
              <div className="dashboard-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Account Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{userData?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', marginBottom: 4 }}>Account Number</div>
                    <div style={{ fontSize: 15, fontWeight: 500, fontFamily: 'monospace' }}>{userData?.accountNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', marginBottom: 4 }}>Member Level</div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#16141f',
                      color: 'white',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {userData?.level || 'Member'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="dashboard-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button 
                    className="dash-btn dash-btn-secondary"
                    onClick={() => setShowAppDownload(true)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download App
                  </button>
                  <button 
                    className="dash-btn dash-btn-secondary"
                    onClick={() => setActiveSection('membership')}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 3h4v4M8 3H4v4"/>
                    </svg>
                    Upgrade Plan
                  </button>
                  <button 
                    className="dash-btn dash-btn-secondary"
                    onClick={() => setLocation('/help')}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <path d="M12 17h.01"/>
                    </svg>
                    Help Center
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Your Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#16141f', marginBottom: 4 }}>
                      {userData?.points || 0}
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>Points Earned</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#16141f', marginBottom: 4 }}>
                      ${parseFloat(userData?.balance || '0').toFixed(2)}
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>Balance</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#5e79db', marginBottom: 4 }}>
                      0
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>Places Visited</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#5e79db', marginBottom: 4 }}>
                      0
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>Rewards Claimed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div style={{ maxWidth: 600 }}>
              <div className="dashboard-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userData?.fullName}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 12,
                        fontSize: 15,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={userData?.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 12,
                        fontSize: 15,
                        fontFamily: 'inherit',
                        background: '#f8f8f8',
                        color: 'rgba(22,20,31,0.5)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={userData?.phone}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 12,
                        fontSize: 15,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <button type="submit" className="dash-btn dash-btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'membership' && (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {/* Current Plan */}
              <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Current Plan</h3>
                    <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>Free Member</p>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    background: 'rgba(94,121,219,0.1)',
                    color: '#5e79db',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    Active
                  </div>
                </div>
                <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.7)', marginBottom: 24, lineHeight: 1.6 }}>
                  You're currently on the free plan. Upgrade to unlock premium features and exclusive benefits.
                </p>
                <button className="dash-btn dash-btn-primary">
                  Upgrade to Premium
                </button>
              </div>

              {/* Payment Method */}
              <div className="dashboard-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Payment Method</h3>
                <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)', marginBottom: 20 }}>
                  No payment method added yet
                </p>
                <button className="dash-btn dash-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Add Card
                </button>
              </div>

              {/* Billing History */}
              <div className="dashboard-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Billing History</h3>
                <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  No transactions yet
                </p>
              </div>
            </div>
          )}

          {activeSection === 'preregister' && (
            <div style={{ maxWidth: 600 }}>
              <div className="dashboard-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                    Join the Waitlist
                  </h3>
                  <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)', lineHeight: 1.6 }}>
                    Be among the first to experience Wavy on mobile. Pre-register now and get exclusive early access benefits.
                  </p>
                </div>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue={userData?.phone}
                      placeholder="+1 (555) 000-0000"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 12,
                        fontSize: 15,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Device Type
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 12,
                        fontSize: 15,
                        fontFamily: 'inherit',
                        background: 'white'
                      }}
                    >
                      <option value="">Select your device</option>
                      <option value="ios">iPhone (iOS)</option>
                      <option value="android">Android</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <button type="submit" className="dash-btn dash-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Reserve My Spot
                  </button>
                </form>
                <div style={{ 
                  marginTop: 24,
                  padding: 16,
                  background: 'rgba(94,121,219,0.05)',
                  borderRadius: 12,
                  fontSize: 13,
                  color: 'rgba(22,20,31,0.7)',
                  lineHeight: 1.5
                }}>
                  ✨ Early access users will receive exclusive perks, bonus points, and priority support.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {/* Contact Support */}
              <div className="dashboard-card">
                <div style={{ marginBottom: 16 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16141f" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Contact Support</h3>
                <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)', marginBottom: 20 }}>
                  Get in touch with our team for personalized assistance
                </p>
                <button 
                  className="dash-btn dash-btn-secondary"
                  onClick={() => setLocation('/contact')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Send Message
                </button>
              </div>

              {/* Help Center */}
              <div className="dashboard-card">
                <div style={{ marginBottom: 16 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16141f" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Help Center</h3>
                <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)', marginBottom: 20 }}>
                  Browse FAQs and find answers to common questions
                </p>
                <button 
                  className="dash-btn dash-btn-secondary"
                  onClick={() => setLocation('/help')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Visit Help Center
                </button>
              </div>

              {/* Email Us */}
              <div className="dashboard-card">
                <div style={{ marginBottom: 16 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16141f" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Email Us</h3>
                <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)', marginBottom: 20 }}>
                  Reach out directly via email
                </p>
                <a 
                  href="mailto:support@wavy.do"
                  className="dash-btn dash-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  support@wavy.do
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
