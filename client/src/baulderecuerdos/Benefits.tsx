import { useState, useEffect } from 'react';
import './Benefits.css';
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';

interface DashboardData {
  user: {
    fullName: string;
    level: string;
    points: number;
  };
  perks: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    value: string;
    validUntil: string;
    establishment: string;
  }>;
}

export default function Benefits() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching benefits data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Benefits data loaded:', data.perks?.length, 'perks');
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
          <a href="/dashboard/benefits" className="nav_link active" aria-label="benefits">
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
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#666'
            }}>
              {dashboardData?.user.fullName ? dashboardData.user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="name">{dashboardData?.user.fullName || 'User'}</p>
              <p className="occupation">{dashboardData?.user.level || 'member'}</p>
            </div>
          </div>
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
            <path d="M12 6a3.5 3.5 0 0 0-3.5 3.5h2A1.5 1.5 0 1 1 12 11a1 1 0 0 0-1 1v2h2v-1.16A3.49 3.49 0 0 0 12 6zm-1 9h2v2h-2z"/>
          </svg>
        </div>
      </nav>

      {/* Main Content */}
      <div className="benefits-main-content">
        {/* Mobile menu button */}
        <button id="menu_btn" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
          </svg>
        </button>

        <div className="benefits-container">
          <div className="page-header animate-fadeInDown">
            <div className="page-title-group">
              <h1 className="page-title">Your Benefits</h1>
              <p className="page-subtitle">Unlock exclusive rewards, experiences, and perks across the TAPP network</p>
            </div>
          </div>

          {isLoading ? (
            // Loading skeletons
            <>
              {/* Display Cards Skeleton */}
              <div className="display-cards">
                <div className="skeleton-card" style={{ minHeight: '200px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-title" style={{ width: '70%', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                  <div className="skeleton skeleton-button" style={{ marginTop: '16px', width: '140px' }}></div>
                </div>
                <div className="skeleton-card" style={{ minHeight: '200px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-title" style={{ width: '70%', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                  <div className="skeleton skeleton-button" style={{ marginTop: '16px', width: '140px' }}></div>
                </div>
                <div className="skeleton-card" style={{ minHeight: '200px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-title" style={{ width: '70%', marginBottom: '12px' }}></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                  <div className="skeleton skeleton-button" style={{ marginTop: '16px', width: '140px' }}></div>
                </div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className="stats-grid">
                <div className="skeleton-card" style={{ minHeight: '120px' }}></div>
                <div className="skeleton-card" style={{ minHeight: '120px' }}></div>
                <div className="skeleton-card" style={{ minHeight: '120px' }}></div>
              </div>

              {/* Loader Section Skeleton */}
              <div className="skeleton-card" style={{ minHeight: '80px', marginBottom: '40px' }}></div>

              {/* Benefits Grid Skeleton */}
              <div className="benefits-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card" style={{ minHeight: '400px' }}>
                    <div className="skeleton skeleton-image" style={{ height: '200px', marginBottom: '20px' }}></div>
                    <div className="skeleton skeleton-title" style={{ marginBottom: '12px' }}></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                  </div>
                ))}
              </div>

              {/* Interactive Section Skeleton */}
              <div className="skeleton-card" style={{ minHeight: '300px', marginTop: '40px' }}></div>

              {/* CTA Section Skeleton */}
              <div className="skeleton-card" style={{ minHeight: '200px', marginTop: '40px' }}></div>
            </>
          ) : (
            <>
          {/* Display Cards Stacked */}
          <div className="display-cards animate-fadeInUp animate-delay-100">
            <div className="display-card animate-scaleIn animate-delay-100">
              <span className="display-card-badge">Featured</span>
              <h3 className="display-card-title">Weekend Double Rewards</h3>
              <p className="display-card-desc">
                This Saturday and Sunday, earn 2x points at all TAPP merchants. Plus unlock 1,000 bonus points.
              </p>
              <button className="display-card-btn">Learn More →</button>
            </div>
            <div className="display-card animate-scaleIn animate-delay-200">
              <span className="display-card-badge">New</span>
              <h3 className="display-card-title">Premium Drop Tonight</h3>
              <p className="display-card-desc">
                Join 50 members for exclusive wine tasting at Vinoteca del Mar. Limited spots available.
              </p>
              <button className="display-card-btn">Reserve Spot →</button>
            </div>
            <div className="display-card animate-scaleIn animate-delay-300">
              <span className="display-card-badge">Coming Soon</span>
              <h3 className="display-card-title">Network Expansion</h3>
              <p className="display-card-desc">
                10 new merchants joining next month. Be the first to tap and earn welcome bonuses.
              </p>
              <button className="display-card-btn">Get Notified →</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid animate-fadeInUp animate-delay-200">
            <div className="stat-card large">
              <div className="stat-label">Total Earned</div>
              <div className="stat-value">{dashboardData?.user.points ? dashboardData.user.points.toLocaleString('en-US') : 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active</div>
              <div className="stat-value">{dashboardData?.perks?.length || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rating</div>
              <div className="stat-value">4.9</div>
            </div>
          </div>

          {/* Vista Loader Section */}
          <div className="loader-section animate-fadeIn animate-delay-300">
            <div className="vista-loader">
              <div className="vista-loader__track"></div>
              <div className="vista-loader__fill"></div>
            </div>
            <p className="loader-text">Checking for new personalized offers...</p>
          </div>

          {/* Benefits Grid with Real Data */}
          <div className="benefits-grid">
            {dashboardData?.perks && dashboardData.perks.length > 0 ? (
              dashboardData.perks.map((perk, index) => {
                const typeLabels: Record<string, string> = {
                  discount: 'Discount',
                  cashback: 'Cashback',
                  points: 'Points',
                  freebie: 'Free Item'
                };
                
                const typeImages: Record<string, string> = {
                  discount: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop',
                  cashback: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
                  points: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
                  freebie: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'
                };
                
                return (
                  <article key={perk.id} className={`benefit-card animate-fadeInUp animate-delay-${(index % 3) + 1}00`}>
                    <header className="benefit-meta-header">
                      <span className="benefit-index"><em>n°</em>{String(index + 1).padStart(3, '0')}</span>
                      <span className="benefit-badge-label">{typeLabels[perk.type] || perk.type}</span>
                    </header>
                    <figure className="benefit-figure">
                      <img src={typeImages[perk.type] || typeImages.discount} alt={perk.title}/>
                    </figure>
                    <div>
                      <h3 className="benefit-title">
                        {perk.title}
                        <span className="obra-tooltip-trigger">
                          <span className="obra-tooltip-icon">i</span>
                          <span className="obra-tooltip">{perk.description || `Available at ${perk.establishment}`}</span>
                        </span>
                      </h3>
                      <p className="benefit-desc">
                        {perk.description || `Exclusive ${perk.type} available at ${perk.establishment}`}
                      </p>
                    </div>
                    <footer className="benefit-footer">
                      <span className="benefit-tag">{perk.establishment}</span>
                      <a href="#" className="benefit-link">Redeem →</a>
                    </footer>
                  </article>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '18px', color: 'var(--muted)' }}>No perks available at the moment. Check back soon!</p>
              </div>
            )}
          </div>

          {/* Interactive Section */}
          <section className="interactive-section animate-fadeInUp animate-delay-100">
            <h2 className="section-title">Customize Your Experience</h2>
            <p className="section-desc">Tell us your preferences to get better recommendations</p>

            <div className="interactive-grid">
              {/* Radio Group */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--ink)' }}>
                  How often do you go out?
                </h3>
                <div className="vista-radios" role="radiogroup">
                  <label className="vista-radio">
                    <input type="radio" name="frequency" defaultChecked />
                    <span className="vista-radio__mark"></span>
                    <span className="vista-radio__copy">
                      <span className="vista-radio__title">Casual</span>
                      <span className="vista-radio__meta">1-2 times per week</span>
                    </span>
                  </label>
                  <label className="vista-radio">
                    <input type="radio" name="frequency" />
                    <span className="vista-radio__mark"></span>
                    <span className="vista-radio__copy">
                      <span className="vista-radio__title">Regular</span>
                      <span className="vista-radio__meta">3-4 times per week</span>
                    </span>
                  </label>
                  <label className="vista-radio">
                    <input type="radio" name="frequency" />
                    <span className="vista-radio__mark"></span>
                    <span className="vista-radio__copy">
                      <span className="vista-radio__title">Frequent</span>
                      <span className="vista-radio__meta">5+ times per week</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Input Fields */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--ink)' }}>
                  Notification Preferences
                </h3>
                <div className="fields-group">
                  <label className="cairn-field">
                    <span className="cairn-field__label">Favorite Cuisine</span>
                    <input className="cairn-field__input" type="text" placeholder="Italian, Japanese, Dominican..." />
                    <span className="cairn-field__help">We'll notify you about related benefits</span>
                  </label>
                  <label className="cairn-field">
                    <span className="cairn-field__label">Preferred Neighborhood</span>
                    <input className="cairn-field__input" type="text" placeholder="Piantini, Zona Colonial..." />
                    <span className="cairn-field__help">Get alerts for nearby drops and events</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section animate-fadeInUp animate-delay-200">
            <div className="cta-card">
              <h2 className="cta-title">Ready for More?</h2>
              <p className="cta-desc">
                Upgrade to TAPP Premium and unlock 3x rewards at select merchants, 
                VIP event access, priority support, and exclusive member-only drops.
              </p>
              <button className="vista-btn">
                Upgrade to Premium
                <svg viewBox="0 0 24 24">
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </button>
            </div>
          </section>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
