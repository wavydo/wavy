import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PerksSection from '../components/dashboard/PerksSection';
import EventsSection from '../components/dashboard/EventsSection';
import ExploreSection from '../components/dashboard/ExploreSection';
import ProfileSection from '../components/dashboard/ProfileSection';
import SettingsSection from '../components/dashboard/SettingsSection';
import TapModal from '../components/dashboard/TapModal';

type TabType = 'perks' | 'events' | 'explore' | 'profile' | 'settings';

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('perks');
  const [showTapModal, setShowTapModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userDashboard'],
    queryFn: async () => {
      const res = await fetch('/api/user/dashboard', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        throw new Error('Failed to load dashboard');
      }
      return res.json();
    },
    retry: false,
  });

  // Redirect to auth if unauthorized
  useEffect(() => {
    if (error && error.message === 'UNAUTHORIZED') {
      setLocation('/auth');
    }
  }, [error, setLocation]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.clear();
    setLocation('/auth');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }} />
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 400,
            letterSpacing: '0.05em'
          }}>Loading TAPP</p>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    // DESKTOP LAYOUT - Sidebar navigation, larger content area
    return (
      <>
        <div style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex'
        }}>
          {/* SIDEBAR */}
          <aside style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#000',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem'
          }}>
            {/* Logo */}
            <div style={{ marginBottom: '3rem' }}>
              <h1 style={{
                fontFamily: "'Antipasto Pro', sans-serif",
                fontSize: '2rem',
                fontWeight: 200,
                letterSpacing: '0.2em',
                textTransform: 'lowercase',
                margin: 0
              }}>
                tapp
              </h1>
              <p style={{
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.3)',
                marginTop: '0.5rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Network
              </p>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'perks', label: 'Perks', icon: '◆' },
                { id: 'events', label: 'Events', icon: '○' },
                { id: 'explore', label: 'Explore', icon: '◇' },
                { id: 'settings', label: 'Settings', icon: '⚙' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                    padding: '1rem 1.25rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    letterSpacing: '0.01em'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* TAP Button */}
            <button
              onClick={() => setShowTapModal(true)}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: '#fff',
                color: '#000',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              TAP NOW
            </button>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{
            marginLeft: '280px',
            width: 'calc(100% - 280px)',
            minHeight: '100vh',
            background: '#000'
          }}>
            <AnimatePresence mode="wait">
              {activeTab === 'perks' && (
                <motion.div
                  key="perks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PerksSection userData={userData} />
                </motion.div>
              )}
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventsSection userData={userData} />
                </motion.div>
              )}
              {activeTab === 'explore' && (
                <motion.div
                  key="explore"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ExploreSection userData={userData} />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileSection userData={userData} onLogout={handleLogout} />
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsSection userData={userData} onLogout={handleLogout} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <TapModal isOpen={showTapModal} onClose={() => setShowTapModal(false)} />

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // MOBILE LAYOUT - Original compact design
  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        paddingBottom: '80px'
      }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem'
        }}>
          <h1 style={{
            fontFamily: "'Antipasto Pro', sans-serif",
            fontSize: '1.625rem',
            fontWeight: 200,
            letterSpacing: '0.2em',
            textTransform: 'lowercase',
            margin: 0
          }}>
            tapp
          </h1>

          <button
            onClick={() => setShowTapModal(true)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 16px rgba(255,255,255,0.12)'
            }}
          >
            <span style={{ fontSize: '1.25rem', color: '#000' }}>◆</span>
          </button>
        </header>

        {/* Main Content */}
        <main style={{
          marginTop: '64px',
          minHeight: 'calc(100vh - 144px)'
        }}>
          <AnimatePresence mode="wait">
            {activeTab === 'perks' && (
              <motion.div
                key="perks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <PerksSection userData={userData} />
              </motion.div>
            )}
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <EventsSection userData={userData} />
              </motion.div>
            )}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <ExploreSection userData={userData} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <ProfileSection userData={userData} onLogout={handleLogout} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <SettingsSection userData={userData} onLogout={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '76px',
          background: 'rgba(0,0,0,0.98)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          zIndex: 100,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center',
          padding: '0 0.75rem'
        }}>
          {[
            { id: 'perks', label: 'Perks', icon: '◆' },
            { id: 'events', label: 'Events', icon: '○' },
            { id: 'explore', label: 'Explore', icon: '◇' },
            { id: 'settings', label: 'Settings', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                padding: '0.75rem 0.5rem',
                transition: 'color 0.2s'
              }}
            >
              <span style={{
                fontSize: '1.375rem',
                transition: 'transform 0.2s',
                transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)'
              }}>
                {tab.icon}
              </span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                letterSpacing: '0.02em'
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <TapModal isOpen={showTapModal} onClose={() => setShowTapModal(false)} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
