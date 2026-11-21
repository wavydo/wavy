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
  const [showAppModal, setShowAppModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

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
        } else {
          if (response.status === 401 || response.status === 403) {
            window.location.href = '/auth';
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/auth';
      } finally {
        setLoading(false);
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
      window.location.href = '/';
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
        background: '#fafafa'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #f0f0f0',
          borderTopColor: '#16141f',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.2s;
        }
        
        .card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .button {
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .button-primary {
          background: #16141f;
          color: white;
        }
        
        .button-primary:hover {
          background: #2a2738;
          transform: translateY(-1px);
        }
        
        .button-secondary {
          background: white;
          color: #16141f;
          border: 1.5px solid #e5e5e5;
        }
        
        .button-secondary:hover {
          border-color: #16141f;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .header {
            padding: 20px !important;
          }
          .main-content {
            padding: 20px !important;
          }
          .card {
            padding: 20px !important;
          }
          .two-column-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header" style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div 
            onClick={() => setLocation('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <img src="/roko.png" alt="Wavy" style={{ width: 36, height: 36 }} />
            <span style={{
              fontFamily: "'Modulus', -apple-system, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: '#16141f'
            }}>
              wavy
            </span>
          </div>
          
          <nav className="desktop-only" style={{ display: 'flex', gap: 24 }}>
            <a href="/help" style={{ color: '#666', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Help</a>
            <a href="/contact" style={{ color: '#666', fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Contact</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            style={{
              background: '#16141f',
              color: 'white',
              padding: '6px 40px',
              borderRadius: '100px',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              whiteSpace: 'nowrap',
              lineHeight: 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Download App
          </button>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              padding: '8px 12px',
              lineHeight: 1
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            margin: 0,
            marginBottom: 8,
            fontFamily: "'Modulus', -apple-system, sans-serif",
            color: '#16141f'
          }}>
            Welcome back{userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : ''}
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: 0 }}>
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Overview */}
        <div className="card" style={{ marginBottom: 40 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
            padding: '8px 0'
          }}>
            <div style={{ borderRight: '1px solid #f0f0f0', paddingRight: 32 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Account</div>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'SF Mono, Monaco, monospace', color: '#16141f', letterSpacing: '-0.5px' }}>
                {userData?.accountNumber || '——————'}
              </div>
            </div>

            <div style={{ borderRight: '1px solid #f0f0f0', paddingRight: 32 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Wallet</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#16141f', letterSpacing: '-0.5px' }}>
                ${parseFloat(userData?.balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ borderRight: '1px solid #f0f0f0', paddingRight: 32 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Points</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#16141f', letterSpacing: '-0.5px' }}>
                {(userData?.points || 0).toLocaleString('en-US')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Joined</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#16141f', letterSpacing: '-0.5px' }}>
                Nov 2024
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {/* Left Column - Account Info */}
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0', color: '#16141f' }}>
              Profile
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Avatar + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#16141f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'Raleway', sans-serif",
                  flexShrink: 0
                }}>
                  {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, color: '#16141f', fontWeight: 600, marginBottom: 2 }}>{userData?.fullName}</div>
                  <div style={{ fontSize: 14, color: '#999' }}>Member since 2024</div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Email address</label>
                </div>
                <div style={{
                  padding: '12px 14px',
                  background: '#fafafa',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  fontSize: 15,
                  color: '#999',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{userData?.email}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Email cannot be changed</div>
              </div>

              {/* Phone Field - Editable */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Phone number</label>
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.nextElementSibling as HTMLInputElement;
                      if (input && input.disabled) {
                        input.disabled = false;
                        input.focus();
                        e.currentTarget.textContent = 'Save';
                        e.currentTarget.style.color = '#16141f';
                      } else if (input) {
                        input.disabled = true;
                        e.currentTarget.textContent = 'Edit';
                        e.currentTarget.style.color = '#666';
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Edit
                  </button>
                </div>
                <input
                  type="tel"
                  defaultValue={userData?.phone}
                  disabled
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16141f';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              {/* Full Name Field - Editable */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Full name</label>
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.nextElementSibling as HTMLInputElement;
                      if (input && input.disabled) {
                        input.disabled = false;
                        input.focus();
                        e.currentTarget.textContent = 'Save';
                        e.currentTarget.style.color = '#16141f';
                      } else if (input) {
                        input.disabled = true;
                        e.currentTarget.textContent = 'Edit';
                        e.currentTarget.style.color = '#666';
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Edit
                  </button>
                </div>
                <input
                  type="text"
                  defaultValue={userData?.fullName}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    background: 'white',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16141f';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              {/* Password Field */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Password</label>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Change
                  </button>
                </div>
                <div style={{
                  padding: '12px 14px',
                  background: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  fontSize: 15,
                  color: '#16141f'
                }}>
                  ••••••••••••
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0', color: '#16141f' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                style={{
                  width: '100%',
                  padding: '10px 7px',
                  background: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  color: '#16141f',
                  textAlign: 'left',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#16141f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  background: '#f5f5f5',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Download App</div>
                  <div style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Get the mobile experience</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <button 
                onClick={() => setLocation('/help')}
                style={{
                  width: '100%',
                  padding: '10px 7px',
                  background: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  color: '#16141f',
                  textAlign: 'left',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#16141f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  background: '#f5f5f5',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <path d="M12 17h.01"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Help Center</div>
                  <div style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Browse FAQs and guides</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <button 
                onClick={() => setLocation('/contact')}
                style={{
                  width: '100%',
                  padding: '10px 7px',
                  background: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  color: '#16141f',
                  textAlign: 'left',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#16141f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  background: '#f5f5f5',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Contact Support</div>
                  <div style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Get personalized help</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Download Modal */}
      {showAppModal && (
        <div
          onClick={() => setShowAppModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
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
              borderRadius: 20,
              padding: 40,
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowAppModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#999',
                cursor: 'pointer',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8
              }}
            >
              ×
            </button>

            <div style={{ fontSize: 56, marginBottom: 20 }}>📱</div>
            <h3 style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              fontFamily: "'Modulus', -apple-system, sans-serif",
              color: '#16141f'
            }}>
              Download Wavy
            </h3>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
              Get the full Wavy experience on your phone. Discover places, earn rewards, and manage your account on the go.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="button button-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </button>
              <button className="button button-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Google Play
              </button>
            </div>

            <div style={{
              marginTop: 24,
              padding: 16,
              background: '#f8f8f8',
              borderRadius: 12,
              fontSize: 13,
              color: '#666'
            }}>
              🎉 Pre-register now to get early access and exclusive rewards
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
