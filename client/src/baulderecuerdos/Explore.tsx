import { useState, useEffect } from 'react';
import './Explore.css';
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';

interface DashboardData {
  user: {
    fullName: string;
    level: string;
  };
  establishments: Array<{
    id: string;
    name: string;
    category: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  }>;
}

export default function Explore() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching explore data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Explore data loaded:', data.establishments?.length, 'establishments');
          console.log('📦 Full establishments data:', data.establishments);
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

  // Mapeo de categorías a imágenes
  const categoryImages: Record<string, string> = {
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    'restaurante': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    'cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
    'cafeteria': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
    'bar': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
    'retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    'grocery': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop',
    'colmado': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop',
    'supermercado': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop',
    'pharmacy': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop',
    'farmacia': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop',
    'entertainment': 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&h=400&fit=crop',
    'barberia': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop',
    'gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    'peer_transfer': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
    'otro': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
    'other': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
  };

  // Función para obtener rating aleatorio (temporal hasta que tengamos ratings reales)
  const getRandomRating = () => (4.5 + Math.random() * 0.5).toFixed(1);

  // Función para obtener distancia aleatoria (temporal hasta que tengamos ubicaciones reales)
  const getRandomDistance = () => (0.5 + Math.random() * 2).toFixed(1);

  const filters = ['All Events', 'This Week', 'VIP Only', 'Free Entry', 'Music & Arts', 'Food & Dining'];

  return (
    <div className="explore-page-container">
      {/* Sidebar */}
      <nav className={`explore-sidebar ${sidebarActive ? 'active' : ''}`} id="sidebar">
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
          <a href="/dashboard/explore" className="nav_link active">
            <div className="nav_link_icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <div className="nav_link_text">Explore</div>
          </a>
          <a href="/dashboard/cards" className="nav_link">
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
      <div className="explore-main-content">
        <div className="explore-container">
          {/* Page Header */}
          <div className="page-header animate-fadeInDown">
            <div className="page-title-group">
              <h1 className="page-title">Explore</h1>
              <p className="page-subtitle">Discover {dashboardData?.establishments?.length || 0} merchants in your network. Tap, earn, and unlock exclusive perks nearby.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-section animate-fadeInUp animate-delay-100">
            <div className="search-container">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search merchants, categories, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            // Loading skeletons
            <>
              <div className="category-section">
                <div className="skeleton skeleton-title" style={{ width: '120px', height: '24px', marginBottom: '24px' }}></div>
                <div className="category-scroll" style={{ display: 'flex', gap: '16px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" style={{ minWidth: '320px', height: '180px' }}></div>
                  ))}
                </div>
              </div>
              <div className="category-section">
                <div className="skeleton skeleton-title" style={{ width: '100px', height: '24px', marginBottom: '24px' }}></div>
                <div className="category-scroll" style={{ display: 'flex', gap: '16px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" style={{ minWidth: '320px', height: '180px' }}></div>
                  ))}
                </div>
              </div>
              <div className="category-section">
                <div className="skeleton skeleton-title" style={{ width: '90px', height: '24px', marginBottom: '24px' }}></div>
                <div className="category-scroll" style={{ display: 'flex', gap: '16px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" style={{ minWidth: '320px', height: '180px' }}></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
          {/* Restaurants & Food */}
          {dashboardData?.establishments && dashboardData.establishments.filter(e => 
            ['restaurant', 'restaurante', 'cafeteria', 'cafe'].includes(e.category)
          ).length > 0 && (
          <div className="category-section animate-fadeInUp animate-delay-200">
            <div className="category-header">
              <h2 className="category-title">Restaurants & Cafés</h2>
              <span className="category-count">
                {dashboardData.establishments.filter(e => 
                  ['restaurant', 'restaurante', 'cafeteria', 'cafe'].includes(e.category)
                ).length} merchants
              </span>
            </div>
            <div className="category-scroll">
              {dashboardData.establishments
                .filter(e => ['restaurant', 'restaurante', 'cafeteria', 'cafe'].includes(e.category))
                .map((merchant) => {
                  const image = categoryImages[merchant.category as keyof typeof categoryImages] || categoryImages.other;
                  const rating = getRandomRating();
                  const distance = getRandomDistance();
                  
                  return (
                    <div key={merchant.id} className="merchant-card">
                      <div className="merchant-image">
                        <img src={image} alt={merchant.name} />
                      </div>
                      <div className="merchant-content">
                        <div className="merchant-header">
                          <div className="merchant-info">
                            <h3>{merchant.name}</h3>
                            <p className="merchant-category">{merchant.category}</p>
                          </div>
                          <div className="merchant-rating">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span className="rating-value">{rating}</span>
                          </div>
                        </div>
                        <div className="merchant-perks">
                          <span className="perk-pill">TAPP Rewards</span>
                        </div>
                        <div className="merchant-footer">
                          <div className="merchant-distance">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {distance} km
                          </div>
                          <button className="visit-btn">Visit</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}

          {/* Retail & Shopping */}
          {dashboardData?.establishments && dashboardData.establishments.filter(e => 
            ['retail', 'colmado', 'supermercado', 'grocery'].includes(e.category)
          ).length > 0 && (
          <div className="category-section animate-fadeInUp animate-delay-300">
            <div className="category-header">
              <h2 className="category-title">Retail & Shopping</h2>
              <span className="category-count">
                {dashboardData.establishments.filter(e => 
                  ['retail', 'colmado', 'supermercado', 'grocery'].includes(e.category)
                ).length} merchants
              </span>
            </div>
            <div className="category-scroll">
              {dashboardData.establishments
                .filter(e => ['retail', 'colmado', 'supermercado', 'grocery'].includes(e.category))
                .map((merchant) => {
                  const image = categoryImages[merchant.category as keyof typeof categoryImages] || categoryImages.other;
                  const rating = getRandomRating();
                  const distance = getRandomDistance();
                  
                  return (
                    <div key={merchant.id} className="merchant-card">
                      <div className="merchant-image">
                        <img src={image} alt={merchant.name} />
                      </div>
                      <div className="merchant-content">
                        <div className="merchant-header">
                          <div className="merchant-info">
                            <h3>{merchant.name}</h3>
                            <p className="merchant-category">{merchant.category}</p>
                          </div>
                          <div className="merchant-rating">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span className="rating-value">{rating}</span>
                          </div>
                        </div>
                        <div className="merchant-perks">
                          <span className="perk-pill">TAPP Rewards</span>
                        </div>
                        <div className="merchant-footer">
                          <div className="merchant-distance">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {distance} km
                          </div>
                          <button className="visit-btn">Visit</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}

          {/* Services & Entertainment */}
          {dashboardData?.establishments && dashboardData.establishments.filter(e => 
            ['barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category)
          ).length > 0 && (
          <div className="category-section animate-fadeInUp animate-delay-400">
            <div className="category-header">
              <h2 className="category-title">Services & Entertainment</h2>
              <span className="category-count">
                {dashboardData.establishments.filter(e => 
                  ['barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category)
                ).length} merchants
              </span>
            </div>
            <div className="category-scroll">
              {dashboardData.establishments
                .filter(e => ['barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category))
                .map((merchant) => {
                  const image = categoryImages[merchant.category as keyof typeof categoryImages] || categoryImages.other;
                  const rating = getRandomRating();
                  const distance = getRandomDistance();
                  
                  return (
                    <div key={merchant.id} className="merchant-card">
                      <div className="merchant-image">
                        <img src={image} alt={merchant.name} />
                      </div>
                      <div className="merchant-content">
                        <div className="merchant-header">
                          <div className="merchant-info">
                            <h3>{merchant.name}</h3>
                            <p className="merchant-category">{merchant.category}</p>
                          </div>
                          <div className="merchant-rating">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span className="rating-value">{rating}</span>
                          </div>
                        </div>
                        <div className="merchant-perks">
                          <span className="perk-pill">TAPP Rewards</span>
                        </div>
                        <div className="merchant-footer">
                          <div className="merchant-distance">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {distance} km
                          </div>
                          <button className="visit-btn">Visit</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}

          {/* All Merchants - Solo si hay otros que no están en las categorías anteriores */}
          {dashboardData?.establishments && dashboardData.establishments.filter(e => 
            !['restaurant', 'restaurante', 'cafeteria', 'cafe', 'retail', 'colmado', 'supermercado', 'grocery', 'barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category)
          ).length > 0 && (
          <div className="category-section animate-fadeInUp animate-delay-500">
            <div className="category-header">
              <h2 className="category-title">Other Merchants</h2>
              <span className="category-count">
                {dashboardData.establishments.filter(e => 
                  !['restaurant', 'restaurante', 'cafeteria', 'cafe', 'retail', 'colmado', 'supermercado', 'grocery', 'barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category)
                ).length} merchants
              </span>
            </div>
            <div className="category-scroll">
              {dashboardData.establishments
                .filter(e => !['restaurant', 'restaurante', 'cafeteria', 'cafe', 'retail', 'colmado', 'supermercado', 'grocery', 'barberia', 'gym', 'entertainment', 'farmacia', 'pharmacy'].includes(e.category))
                .map((merchant) => {
                  const image = categoryImages[merchant.category as keyof typeof categoryImages] || categoryImages.other;
                  const rating = getRandomRating();
                  const distance = getRandomDistance();
                  
                  return (
                    <div key={merchant.id} className="merchant-card">
                      <div className="merchant-image">
                        <img src={image} alt={merchant.name} />
                      </div>
                      <div className="merchant-content">
                        <div className="merchant-header">
                          <div className="merchant-info">
                            <h3>{merchant.name}</h3>
                            <p className="merchant-category">{merchant.category}</p>
                          </div>
                          <div className="merchant-rating">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span className="rating-value">{rating}</span>
                          </div>
                        </div>
                        <div className="merchant-perks">
                          <span className="perk-pill">TAPP Rewards</span>
                        </div>
                        <div className="merchant-footer">
                          <div className="merchant-distance">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {distance} km
                          </div>
                          <button className="visit-btn">Visit</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}
          </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
