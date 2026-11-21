import { useState, useEffect } from 'react';
import './Events.css';
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';

interface DashboardData {
  user: {
    fullName: string;
    level: string;
  };
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    date: string;
    location: string | null;
    capacity: number | null;
    attendees: number;
    price: string | null;
    establishment: string;
  }>;
}

export default function Events() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeFilter, setActiveFilter] = useState('All Events');

  // Cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching events data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Events data loaded:', data.events?.length, 'events');
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

  const filters = ['All Events', 'This Week', 'VIP Only', 'Free Entry', 'Music & Arts', 'Food & Dining'];

  return (
    <div className="events-page-container">
      {/* Sidebar */}
      <nav className={`events-sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
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
          <a href="/dashboard/events" className="nav_link active" aria-label="events">
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
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div className="nav_link_text">Cards</div>
          </a>
          <a href="#" className="nav_link" aria-label="wallet">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
            </div>
            <div className="nav_link_text">Wallet</div>
          </a>
          <a href="#" className="nav_link" aria-label="settings">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Main Content */}
      <div className="events-main-content">
        {/* Mobile menu button */}
        <button id="menu_btn" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
          </svg>
        </button>

        <div className="events-container">
          {/* Page Header */}
          <div className="page-header animate-fadeInDown">
            <div className="page-title-group">
              <h1 className="page-title">Upcoming Events</h1>
              <p className="page-subtitle">Exclusive experiences and gatherings across the TAPP network</p>
            </div>
          </div>

          {isLoading ? (
            // Loading skeletons
            <>
              <div className="skeleton-card" style={{ minHeight: '400px', marginBottom: '60px' }}>
                <div className="skeleton skeleton-title" style={{ width: '200px', height: '28px', marginBottom: '32px' }}></div>
                <div className="skeleton skeleton-image" style={{ height: '280px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card" style={{ minHeight: '380px' }}>
                    <div className="skeleton skeleton-image" style={{ height: '200px', marginBottom: '20px' }}></div>
                    <div className="skeleton skeleton-title" style={{ width: '70%', height: '24px', marginBottom: '12px' }}></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text short"></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
          {/* Display Cards Section with Skew Effect */}
          <div className="display-cards-section animate-fadeInUp animate-delay-100">
            {/* Left Stats */}
            <div className="stats-sidebar-left">
              <div className="stat-mini-card">
                <div className="stat-mini-header">
                  <span className="stat-mini-label">Total Events</span>
                  <span className="stat-mini-tag">LIVE</span>
                </div>
                <div className="stat-mini-value">{dashboardData?.events.length || 0}</div>
                <div className="stat-mini-change">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  +{dashboardData?.events.filter(e => {
                    const eventDate = new Date(e.date);
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return eventDate >= oneMonthAgo;
                  }).length || 0} this month
                </div>
                <p className="stat-mini-caption">Upcoming events across your network</p>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-header">
                  <span className="stat-mini-label">Your RSVPs</span>
                  <span className="stat-mini-tag">RSVP</span>
                </div>
                <div className="stat-mini-value">0</div>
                <div className="stat-mini-change">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  0 this week
                </div>
                <p className="stat-mini-caption">Events you've confirmed attendance</p>
              </div>
            </div>

            {/* Right Display Cards */}
            <div className="display-cards-grid">
              <div className="display-card">
                <div className="card-header">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <p className="card-badge">Featured</p>
                </div>
                <p className="card-description">Salsa Night at Zona Colonial</p>
                <p className="card-date">Tonight at 9PM</p>
              </div>
              <div className="display-card">
                <div className="card-header">
                  <div className="card-icon" style={{background: '#7c3aed'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <p className="card-badge" style={{color: '#7c3aed'}}>This Week</p>
                </div>
                <p className="card-description">Wine Tasting Experience</p>
                <p className="card-date">Friday at 7PM</p>
              </div>
              <div className="display-card">
                <div className="card-header">
                  <div className="card-icon" style={{background: '#ec4899'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <p className="card-badge" style={{color: '#ec4899'}}>Popular</p>
                </div>
                <p className="card-description">Rooftop Jazz Session</p>
                <p className="card-date">Saturday at 8PM</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            {filters.map((filter) => (
              <div
                key={filter}
                className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </div>
            ))}
          </div>

          {/* Events Grid with Real Data */}
          <div className="events-grid animate-fadeInUp animate-delay-200">
            {dashboardData?.events && dashboardData.events.length > 0 ? (
              dashboardData.events.map((event) => {
                const eventDate = new Date(event.date);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                const time = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                
                const isFree = !event.price || parseFloat(event.price) === 0;
                const priceValue = event.price ? parseFloat(event.price) : 0;
                
                const eventImages: Record<string, string> = {
                  'Noche de Salsa en Casa 23': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
                  'Festival de Comida Dominicana': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
                  'Happy Hour Viernes': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
                  'Cine al Aire Libre': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
                  'Torneo de Dominó': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop'
                };
                
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <img src={eventImages[event.title] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'} alt={event.title}/>
                      <div className={`event-badge ${isFree ? 'free' : priceValue >= 500 ? 'vip' : ''}`}>
                        {isFree ? 'FREE ENTRY' : priceValue >= 500 ? 'VIP' : event.establishment}
                      </div>
                    </div>
                    <div className="event-content">
                      <div className="event-date-section">
                        <div className="event-date-box">
                          <div className="event-date-content">
                            <div className="event-day">{day}</div>
                            <div className="event-month">{month}</div>
                          </div>
                        </div>
                        <div className="event-time-info">
                          <div className="event-time">{eventDate.toLocaleDateString('en-US', { weekday: 'long' })} • {time}</div>
                          <div className="event-location">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {event.location || event.establishment}
                          </div>
                        </div>
                      </div>
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-description">
                        {event.description || `Join us for an amazing experience at ${event.establishment}`}
                      </p>
                      <div className="event-footer">
                        <div className="event-attendees">
                          <div className="attendees-avatars">
                            <img src="https://i.pravatar.cc/150?img=1" alt=""/>
                            <img src="https://i.pravatar.cc/150?img=2" alt=""/>
                            <img src="https://i.pravatar.cc/150?img=3" alt=""/>
                          </div>
                          <span className="attendees-count">+{event.attendees} going</span>
                        </div>
                        <a href="#" className="event-button">
                          {isFree ? 'Register' : `RD$${priceValue.toLocaleString('en-US')}`}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '18px', color: 'var(--muted)' }}>No events available at the moment. Check back soon!</p>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
