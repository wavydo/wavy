import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import './Benefits.css'; // Reutilizamos los estilos de Benefits
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';
import SettingsSection from '../components/dashboard/SettingsSection';

interface DashboardData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    balance: string;
    accountNumber: string | null;
    points: number;
    level: string;
  };
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching settings data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Settings data loaded:', data.user?.email);
          setDashboardData(data);
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

  // Hide global header when this component mounts
  useEffect(() => {
    const header = document.querySelector('header');
    const body = document.body;
    
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    
    // Add dashboard class to body for consistent background
    body.classList.add('dashboard-active');
    
    // Override body styles - DO NOT set overflow:hidden
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

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setLocation('/auth');
    });
  };

  return (
    <div className="benefits-page-container">
      {/* Sidebar */}
      <nav className={`benefits-sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
        <button id="btn_close" onClick={closeSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
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
          <a href="/dashboard/user" className="nav_link" aria-label="dashboard">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="nav_link_text">Dashboard</div>
          </a>
          <a href="/dashboard/benefits" className="nav_link" aria-label="benefits">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7h-9"/>
                <path d="M14 17H5"/>
                <circle cx="17" cy="17" r="3"/>
                <circle cx="7" cy="7" r="3"/>
              </svg>
            </div>
            <div className="nav_link_text">Benefits</div>
          </a>
          <a href="/dashboard/events" className="nav_link" aria-label="events">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="nav_link_text">Events</div>
          </a>
          <a href="/dashboard/explore" className="nav_link" aria-label="explore">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <div className="nav_link_text">Explore</div>
          </a>
          <a href="/dashboard/cards" className="nav_link" aria-label="cards">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div className="nav_link_text">Cards</div>
          </a>
          <a href="/dashboard/settings" className="nav_link active" aria-label="settings">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m-2.828 2.828L6.343 16.657m13.314 0l-4.243-4.243m-2.828-2.828L6.343 7.343"/>
              </svg>
            </div>
            <div className="nav_link_text">Settings</div>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="benefits-main-content">
        {/* Header */}
        <header className="benefits-header">
          <button id="btn_menu" onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
            </svg>
          </button>
          <h1 className="benefits-page-title">Settings</h1>
          <div style={{ width: '24px' }}></div>
        </header>

        {/* Settings Content */}
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="skeleton-loader" style={{ height: '200px', borderRadius: '16px' }}></div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <SettingsSection 
              userData={dashboardData} 
              onLogout={handleLogout}
              theme="light"
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
