import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface BusinessLayoutProps {
  children: React.ReactNode;
  activeSection: string;
}

export default function BusinessLayout({ children, activeSection }: BusinessLayoutProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  // Apply zoom to body for business dashboard
  useEffect(() => {
    const applyZoom = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.zoom = '0.85';
      } else {
        document.body.style.zoom = '1';
      }
    };

    applyZoom();
    window.addEventListener('resize', applyZoom);

    return () => {
      document.body.style.zoom = '1';
      window.removeEventListener('resize', applyZoom);
    };
  }, []);

  const { data: businessData } = useQuery({
    queryKey: ['businessUser'],
    queryFn: async () => {
      const res = await fetch('/api/user', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    }
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      queryClient.clear();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openSidebar = () => setIsMobileMenuOpen(true);
  const closeSidebar = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('menu_btn');
      
      if (window.innerWidth <= 1024) {
        if (sidebar && menuBtn && !sidebar.contains(event.target as Node) && !menuBtn.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* RESET EVERYTHING FOR BUSINESS DASHBOARD */
        * {
            box-sizing: border-box;
        }

        body {
            background: #f8f9fa;
            font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Make all buttons wider */
        .btn,
        .action-btn {
            padding: 12px 32px !important;
            min-width: 140px;
        }

        /* Override custom cursors for business dashboard */
        * {
            cursor: auto !important;
        }

        button,
        a,
        .btn,
        .action-btn,
        .nav_link,
        .perk-btn,
        .event-btn,
        .drop-btn,
        .filter-tab {
            cursor: pointer !important;
        }

        input,
        textarea {
            cursor: text !important;
        }

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
        }

        :root {
            --font-inter: 'Inter', -apple-system, sans-serif;
            --ink: #0e1116;
            --muted: #5b6472;
            --surface: #ffffff;
            --bg: #f8f9fa;
            --text-grey: #a1a3af;
            --border: rgba(15, 23, 42, 0.08);
            --success: #10b981;
            --error: #ef4444;
            --warning: #f59e0b;
        }

        body {
            font-family: var(--font-inter);
            background: var(--bg);
            color: var(--ink);
            overflow-x: hidden;
        }

        /* CRITICAL: Prevent any dark overlays */
        body::before,
        body::after {
            display: none !important;
        }

        .container {
            display: flex;
            flex: 1;
            min-height: 100vh;
            position: relative;
            width: 100%;
        }

        /* Sidebar */
        nav {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100%;
            background: #ffffff;
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            z-index: 100;
            flex-shrink: 0;
        }

        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 28px 20px 20px;
            border-bottom: 1px solid var(--border);
        }

        .logo img {
            width: 48px;
            height: 48px;
        }

        .business-info {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
        }

        .business-name {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--ink);
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .nav_links {
            flex: 1;
            padding: 10px 12px;
        }

        .nav_link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            margin-bottom: 4px;
            border-radius: 10px;
            color: var(--muted);
            font-size: 14px;
            font-weight: 500;
            transition: all 180ms ease;
            cursor: pointer;
            background: transparent;
            width: 100%;
            text-align: left;
        }

        .nav_link:hover {
            background: rgba(14, 17, 22, 0.04);
            color: var(--ink);
        }

        .nav_link.active {
            background: rgba(14, 17, 22, 0.06);
            color: var(--ink);
        }

        .nav_link svg {
            width: 20px;
            height: 20px;
            stroke: currentColor;
        }

        .nav-section-title {
            padding: 20px 16px 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-grey);
        }

        .life_cover_offer {
            margin: 20px 12px;
            padding: 20px 16px;
            background: rgba(14, 17, 22, 0.02);
            border-radius: 16px;
            text-align: center;
        }

        .life_cover_offer img {
            width: 100px;
            height: 100px;
            margin-bottom: 12px;
        }

        .life_cover_text .title {
            font-size: 14px;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: 6px;
        }

        .life_cover_text .desc {
            font-size: 12px;
            color: var(--muted);
            line-height: 1.5;
            margin-bottom: 12px;
        }

        .life_cover_offer a {
            display: inline-block;
            padding: 10px 20px;
            background: var(--ink);
            color: #ffffff;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            transition: all 180ms ease;
        }

        .life_cover_offer a:hover {
            background: #1a1f28;
            transform: translateY(-1px);
        }

        .profile {
            padding: 16px 20px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-top: 1px solid var(--border);
        }

        .profile img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .profile .name {
            font-size: 14px;
            font-weight: 600;
            color: var(--ink);
        }

        .profile .occupation {
            font-size: 12px;
            color: var(--muted);
        }

        .logout-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: transparent;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 180ms ease;
            flex-shrink: 0;
        }

        .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
        }

        .logout-btn svg {
            stroke: var(--muted);
            transition: all 180ms ease;
        }

        .logout-btn:hover svg {
            stroke: #ef4444;
        }

        /* Main Content - USE ALL AVAILABLE SPACE */
        .main-content {
            margin-left: 280px;
            min-height: 100vh;
            padding: 32px 40px;
            box-sizing: border-box;
        }

        /* Mobile Menu */
        #menu_btn {
            display: none;
            position: fixed;
            top: 24px;
            left: 24px;
            width: 44px;
            height: 44px;
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 12px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 101;
        }

        #btn_close {
            display: none;
        }

        @media (max-width: 1024px) {
            nav {
                left: -100%;
                transition: left 0.3s ease;
                background: #ffffff;
            }

            nav.active {
                left: 0;
            }

            #btn_close {
                display: block;
                position: absolute;
                top: 24px;
                right: 20px;
                padding: 8px;
                background: transparent;
                cursor: pointer;
            }

            .main-content {
                margin-left: 0;
                width: 100vw;
                padding: 80px 20px 32px;
            }

            #menu_btn {
                display: flex;
            }
        }
      `}</style>

        {/* Sidebar */}
        <nav id="sidebar" className={isMobileMenuOpen ? 'active' : ''}>
          <button id="btn_close" onClick={closeSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="logo">
            <img 
              src="/roko.png?v=1" 
              alt="Wavy" 
              style={{ 
                width: '48px', 
                height: '48px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Logo failed to load');
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="business-info">
            <span className="business-name">{businessData?.establishment?.businessName || 'Business'}</span>
          </div>

          <div className="nav_links">
            <button 
              onClick={() => setLocation('/business/overview')} 
              className={`nav_link ${activeSection === 'overview' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Overview</span>
            </button>

            <div className="nav-section-title">Manage</div>

            <button 
              onClick={() => setLocation('/business/perks')} 
              className={`nav_link ${activeSection === 'perks' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.5 15.5L19 19"/>
              </svg>
              <span>Perks & Discounts</span>
            </button>

            <button 
              onClick={() => setLocation('/business/events')} 
              className={`nav_link ${activeSection === 'events' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Events</span>
            </button>

            <div className="nav-section-title">Customers</div>

            <button 
              onClick={() => setLocation('/business/customers')} 
              className={`nav_link ${activeSection === 'customers' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>Customers</span>
            </button>

            <button 
              onClick={() => setLocation('/business/analytics')} 
              className={`nav_link ${activeSection === 'analytics' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>Analytics</span>
            </button>

            <div className="nav-section-title">Support</div>

            <button 
              onClick={() => setLocation('/business/support')} 
              className={`nav_link ${activeSection === 'support' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>
              </svg>
              <span>Asistencia</span>
            </button>

            <div className="nav-section-title">Settings</div>

            <button 
              onClick={() => setLocation('/business/settings')} 
              className={`nav_link ${activeSection === 'settings' ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Configuración</span>
            </button>
          </div>

          <div className="life_cover_offer">
            <img src="https://raw.githubusercontent.com/shyamtala003/finance_dashboard/%40sjtala/images/women.svg" alt="" />
            <div className="life_cover_text">
              <p className="title">¿Quieres ser Partner?</p>
              <p className="desc">Únete a la red de Wavy y ofrece beneficios exclusivos a miles de usuarios</p>
            </div>
            <a href="#">Solicitar</a>
          </div>

          <div className="profile">
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(14, 17, 22, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {businessData?.establishment?.logo ? (
                <img 
                  src={businessData.establishment.logo} 
                  alt="Business logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p className="name">{businessData?.establishment?.businessName || 'Business Account'}</p>
              <p className="occupation">Business</p>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" width="18" height="18">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button id="menu_btn" onClick={openSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
    </>
  );
}
