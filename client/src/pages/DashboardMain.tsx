import { useState, useEffect, useRef } from 'react';
import './DashboardMain.css';
import './DashboardMainMobile.css';
import '../components/SkeletonLoader.css';
import BottomNav from '../components/BottomNav';

// Tipos para los datos del dashboard
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
    totalSpent: string;
    monthlySpent: string;
  };
  monthlyStats: {
    placesTapped: number;
    rewardsEarned: number;
  };
  transactions: Array<{
    id: string;
    amount: string;
    finalAmount: string;
    discount: string;
    points: number;
    date: string;
    establishment: string;
    category: string;
  }>;
  cards: Array<{
    id: string;
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cardType: string;
    status: string;
    lastUsed: string | null;
  }>;
  perks: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    value: string;
    validUntil: string;
    establishment: string;
  }>;
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

export default function DashboardMain() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [accountVisible, setAccountVisible] = useState(false); // DEBE estar oculto por defecto
  const [transactionsExpanded, setTransactionsExpanded] = useState(false);
  const [transferCollapsed, setTransferCollapsed] = useState(true);
  const [walletExpanded, setWalletExpanded] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [copyTooltipVisible, setCopyTooltipVisible] = useState(false);

  const totalCards = dashboardData?.cards.length || 3;

  // Cargar datos reales del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔄 Fetching dashboard data...');
        const response = await fetch('/api/dashboard/user-data', {
          credentials: 'include', // Incluir cookies de sesión
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if account is suspended
          if (data.suspended) {
            console.log('⚠️ Account suspended, redirecting...');
            window.location.href = '/account-suspended';
            return;
          }

          console.log('✅ Dashboard data loaded:', {
            user: data.user?.email,
            balance: data.user?.balance,
            transactionsCount: data.transactions?.length,
            cardsCount: data.cards?.length
          });
          setDashboardData(data);
          setIsLoading(false);
        } else {
          const errorData = await response.json().catch(() => ({}));
          
          // Check if suspended in error response
          if (errorData.suspended) {
            console.log('⚠️ Account suspended, redirecting...');
            window.location.href = '/account-suspended';
            return;
          }

          console.error('❌ Failed to fetch dashboard data:', response.status, response.statusText);
          // Si no está autenticado, redirigir al login
          if (response.status === 401 || response.status === 403) {
            console.log('⚠️ No autenticado, redirigiendo a auth...');
            window.location.href = '/auth';
          } else {
            // Para otros errores, dejar de cargar pero mostrar mensaje
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        setIsLoading(false);
        // Redirigir al auth si hay error de red
        window.location.href = '/auth';
      }
    };

    fetchDashboardData();
  }, []);

  // Simulate loading and apply entrance animations
  useEffect(() => {
    if (!dashboardData) return; // Esperar a que los datos se carguen
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Apply entrance animations after loading
      setTimeout(() => {
        const topbar = document.querySelector('.topbar');
        const balanceCard = document.querySelector('.bank_balance_card');
        const timePeriodTabs = document.querySelector('.time-period-tabs');
        const noticeCard = document.querySelector('.tapp-notice-card');
        const aetherCard = document.querySelector('.aether-card');
        const networkCard = document.querySelector('.network-stats-card');
        const transactionSection = document.querySelector('.transaction_info');
        const transferSection = document.querySelector('.transfer_money_section');
        const cardsSection = document.querySelector('.cards');
        
        if (topbar) topbar.classList.add('animate-fadeInDown');
        if (balanceCard) balanceCard.classList.add('animate-fadeInUp', 'animate-delay-100');
        if (timePeriodTabs) timePeriodTabs.classList.add('animate-fadeIn', 'animate-delay-200');
        if (noticeCard) noticeCard.classList.add('animate-fadeInUp', 'animate-delay-300');
        if (aetherCard) aetherCard.classList.add('animate-scaleIn', 'animate-delay-400');
        if (networkCard) networkCard.classList.add('animate-fadeIn', 'animate-delay-200');
        if (transactionSection) transactionSection.classList.add('animate-fadeInUp', 'animate-delay-300');
        if (transferSection) transferSection.classList.add('animate-fadeInLeft', 'animate-delay-100');
        if (cardsSection) cardsSection.classList.add('animate-fadeInUp', 'animate-delay-200');
      }, 50);
    }, 600);
    return () => clearTimeout(timer);
  }, [dashboardData]);

  // Hide global header when this component mounts
  useEffect(() => {
    const header = document.querySelector('header');
    const body = document.body;
    
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    
    // Add dashboard class to body for consistent background
    body.classList.add('dashboard-active');
    
    // Override body styles - DO NOT set overflow:hidden, causes layout issues in desktop
    body.style.cursor = 'auto';
    body.style.color = '#000000'; // Override white text from index.css
    
    // Show header again when component unmounts
    return () => {
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      
      // Remove dashboard class and restore styles
      body.classList.remove('dashboard-active');
      body.style.cursor = '';
      body.style.color = ''; // Restore original color
    };
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('menu_btn');
      
      if (sidebar && menuBtn && sidebarActive && 
          !sidebar.contains(target) && 
          !menuBtn.contains(target)) {
        setSidebarActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarActive]);

  // Close wallet when clicking outside on mobile
  useEffect(() => {
    const handleWalletClickOutside = (e: MouseEvent) => {
      if (walletExpanded && window.innerWidth <= 870) {
        const target = e.target as HTMLElement;
        const cardsContainer = document.querySelector('.custom-cards-container');
        const sliderController = document.querySelector('.sliber_controller');
        
        if (cardsContainer && !cardsContainer.contains(target) && 
            sliderController && !sliderController.contains(target)) {
          closeWallet();
        }
      }
    };

    document.addEventListener('click', handleWalletClickOutside);
    return () => document.removeEventListener('click', handleWalletClickOutside);
  }, [walletExpanded]);

  // Handle window resize - close wallet if expanded on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 870 && walletExpanded) {
        closeWallet();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [walletExpanded]);

  // Wheel scroll navigation for cards on desktop
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleWheelScroll = (e: WheelEvent) => {
      // Only work on desktop
      if (window.innerWidth <= 870) return;
      
      e.preventDefault();
      
      // Debounce scroll events
      if (isScrolling) return;
      isScrolling = true;
      
      clearTimeout(scrollTimeout);
      
      // Determine scroll direction
      const delta = e.deltaY || e.deltaX;
      
      if (delta > 0) {
        nextCard();
      } else if (delta < 0) {
        prevCard();
      }
      
      // Reset scroll lock after delay
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 600);
    };

    const cardsElement = document.getElementById('cardsWallet');
    if (cardsElement) {
      cardsElement.addEventListener('wheel', handleWheelScroll, { passive: false });
    }

    return () => {
      if (cardsElement) {
        cardsElement.removeEventListener('wheel', handleWheelScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, [currentCard]);

  // Touch and drag events for cards
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let startX = 0;
    let isDragging = false;

    const cardsWrapper = document.querySelector('.cards-wrapper');
    if (!cardsWrapper) return;

    // Mouse drag for desktop
    const handleMouseDown = (e: MouseEvent) => {
      if (window.innerWidth > 870 || walletExpanded) {
        startX = e.clientX;
        isDragging = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          prevCard();
        } else {
          nextCard();
        }
      }
    };

    const handleMouseLeave = () => {
      isDragging = false;
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (walletExpanded) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!walletExpanded) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!walletExpanded) return;
      
      const diffX = touchEndX - touchStartX;
      const diffY = Math.abs(touchEndY - touchStartY);
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > 50 && diffY < Math.abs(diffX)) {
        if (diffX > 0) {
          prevCard();
        } else {
          nextCard();
        }
      }
    };

    cardsWrapper.addEventListener('mousedown', handleMouseDown as EventListener);
    cardsWrapper.addEventListener('mousemove', handleMouseMove as EventListener);
    cardsWrapper.addEventListener('mouseup', handleMouseUp as EventListener);
    cardsWrapper.addEventListener('mouseleave', handleMouseLeave);
    cardsWrapper.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    cardsWrapper.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
    cardsWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      cardsWrapper.removeEventListener('mousedown', handleMouseDown as EventListener);
      cardsWrapper.removeEventListener('mousemove', handleMouseMove as EventListener);
      cardsWrapper.removeEventListener('mouseup', handleMouseUp as EventListener);
      cardsWrapper.removeEventListener('mouseleave', handleMouseLeave);
      cardsWrapper.removeEventListener('touchstart', handleTouchStart as EventListener);
      cardsWrapper.removeEventListener('touchmove', handleTouchMove as EventListener);
      cardsWrapper.removeEventListener('touchend', handleTouchEnd);
    };
  }, [walletExpanded, currentCard]);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  const toggleAccountVisibility = () => {
    setAccountVisible(!accountVisible);
  };

  const copyAccountNumber = async () => {
    if (!dashboardData?.user.accountNumber) return;
    
    try {
      await navigator.clipboard.writeText(dashboardData.user.accountNumber);
      setCopyTooltipVisible(true);
      setTimeout(() => {
        setCopyTooltipVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleTransactions = () => {
    setTransactionsExpanded(!transactionsExpanded);
  };

  const toggleTransferSection = () => {
    setTransferCollapsed(!transferCollapsed);
  };

  const expandWallet = (e: React.MouseEvent) => {
    if (window.innerWidth <= 870 && !walletExpanded) {
      e.stopPropagation();
      setWalletExpanded(true);
      document.body.style.overflow = 'hidden';
      
      // CREAR MODAL CON EFECTOS FLOTANTES
      setTimeout(() => {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.id = 'simple-modal-overlay';
        overlay.className = 'dashboard-main-container light';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(15px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: 'Poppins', sans-serif;
        `;
        
        // Crear contenedor principal centrado
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        `;
        
        // Crear contenedor flotante para la card
        const floatingContainer = document.createElement('div');
        floatingContainer.style.cssText = `
          animation: gentleFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.4));
          margin-bottom: 60px;
          transform: scale(1.1);
        `;
        
        // Crear botón X
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
          position: absolute;
          top: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          font-size: 32px;
          color: white;
          cursor: pointer;
          z-index: 9999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        `;
        closeBtn.onclick = closeWallet;
        
        // Buscar solo la card activa actual
        const activeCard = document.querySelector('#cardsWallet .custom-card.active');
        if (activeCard) {
          const cardClone = activeCard.cloneNode(true) as HTMLElement;
          cardClone.style.cssText = `
            position: relative;
            transform: none !important;
            right: auto !important;
            left: 0 !important;
            margin: 0 auto !important;
            z-index: 10;
            display: block;
          `;
          
          floatingContainer.appendChild(cardClone);
        }
        
        // Crear texto instructivo con flecha
        const instructionContainer = document.createElement('div');
        instructionContainer.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            font-family: 'Poppins', sans-serif;
            text-align: center;
          ">
            <div style="
              font-size: 28px;
              margin-bottom: 12px;
              animation: arrowBounce 2.5s ease-in-out infinite;
              filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
            ">↑</div>
            <div style="
              font-size: 18px;
              font-weight: 300;
              letter-spacing: 1px;
              opacity: 0.9;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              animation: textFade 3s ease-in-out infinite;
            ">Tap to use your card</div>
          </div>
        `;
        
        // Agregar keyframes para animaciones
        const style = document.createElement('style');
        style.textContent = `
          @keyframes gentleFloat {
            0%, 100% { 
              transform: scale(1.1) translateY(0px) rotate(0deg); 
            }
            33% { 
              transform: scale(1.12) translateY(-10px) rotate(0.5deg); 
            }
            66% { 
              transform: scale(1.13) translateY(-16px) rotate(-0.5deg); 
            }
          }
          
          @keyframes arrowBounce {
            0%, 100% { 
              transform: translateY(0px) scale(1); 
              opacity: 0.7; 
            }
            50% { 
              transform: translateY(-8px) scale(1.15); 
              opacity: 1; 
            }
          }
          
          @keyframes textFade {
            0%, 100% { 
              opacity: 0.7; 
            }
            50% { 
              opacity: 0.95; 
            }
          }
        `;
        document.head.appendChild(style);
        
        mainContainer.appendChild(floatingContainer);
        mainContainer.appendChild(instructionContainer);
        
        overlay.appendChild(mainContainer);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
      }, 10);
    }
  };

  const closeWallet = () => {
    setWalletExpanded(false);
    document.body.style.overflow = '';
    
    // ELIMINAR EL MODAL SIMPLE
    const overlay = document.getElementById('simple-modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  };

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const goToCard = (index: number) => {
    setCurrentCard(index);
  };

  const openNotificationModal = () => {
    setNotificationModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeNotificationModal = (e?: React.MouseEvent) => {
    if (e && e.target !== e.currentTarget) return;
    setNotificationModalOpen(false);
    document.body.style.overflow = '';
  };

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => item.classList.remove('unread'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return false;
  };

  // Get card classes based on position
  const getCardClass = (index: number) => {
    const position = index - currentCard;
    const classes = ['custom-card'];
    
    if (index === 0) classes.push('tapp-card');
    if (index === 1) classes.push('card-2');
    if (index === 2) classes.push('card-3');
    
    if (position === 0) {
      classes.push('active');
    } else if (position === 1 || (position === -2 && totalCards === 3)) {
      classes.push('next');
    } else if (position === -1 || (position === 2 && totalCards === 3)) {
      classes.push('prev');
    } else {
      classes.push('hidden');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="dashboard-main-container light">
      {/* Si está cargando o no hay datos, mostrar loading */}
      {(isLoading || !dashboardData) ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #333',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Cargando dashboard...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      ) : (
      <div className="container">
        <nav className={`sidebar ${sidebarActive ? "active" : ""}`} id="sidebar">
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
                <a href="#" className="nav_link active" aria-label="dashboard">
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
                <a href="/dashboard/settings" className="nav_link" aria-label="settings">
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
                <a href="#" aria-label="grab offer">buy now</a>
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
                    <div className="profile_text">
                        <p className="name">{dashboardData?.user.fullName || 'User'}</p>
                        <p className="occupation">{dashboardData?.user.level || 'member'}</p>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path className="icon" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                </svg>
            </div>
        </nav>
        <section className="main_content">
            <div className="topbar">
                <button id="menu_btn" onClick={toggleSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
                    </svg>
                </button>
                <div className="overview_text">
                    <p className="title">Overview</p>
                    <p className="desc">Hi {dashboardData?.user.fullName.split(' ')[0] || 'User'}, welcome back!</p>
                </div>
                <div className="topbar_icons">
                    <a 
                      href="/dashboard/settings" 
                      aria-label="user settings" 
                      className="topbar_icon"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </a>
                </div>
            </div>
            <section id="dashboard-grid-section">
                <main>
                    <div className="overview_text">
                        <p className="title">Overview</p>
                        <p className="desc">Hi {dashboardData?.user.fullName.split(' ')[0] || 'User'}, welcome back!</p>
                    </div>
                    <div className="bank_balance_card">
                        <p className="balance_label">Your Balance</p>
                        <p className="balance">RD${dashboardData?.user.balance ? parseFloat(dashboardData.user.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
                        
                        <div className="account_no">
                            <div className="account_info">
                                <span className="account_label">TAPP Account</span>
                                <span className={`account_number ${accountVisible ? '' : 'hidden'}`} id="accountNumber">
                                  {accountVisible ? dashboardData?.user.accountNumber : ''}
                                </span>
                            </div>
                            <div className="account_actions">
                                <button className="account_btn toggle_account_btn" onClick={toggleAccountVisibility} aria-label="toggle account visibility">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button className={`account_btn copy_account_btn ${copyTooltipVisible ? 'copied' : ''}`} onClick={copyAccountNumber} aria-label="copy account number">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                    </svg>
                                </button>
                                <span className={`copy-tooltip ${copyTooltipVisible ? 'show' : ''}`}>Copied!</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Clean Time Period Selector */}
                    <div className="time-period-tabs">
                        <input type="radio" name="time-period" id="period-day" />
                        <label htmlFor="period-day">Day</label>
                        <input type="radio" name="time-period" id="period-week" defaultChecked />
                        <label htmlFor="period-week">Week</label>
                        <input type="radio" name="time-period" id="period-month" />
                        <label htmlFor="period-month">Month</label>
                        <input type="radio" name="time-period" id="period-year" />
                        <label htmlFor="period-year">Year</label>
                    </div>
                    
                    {/* TAPP Premium Notice Card */}
                    <div className="tapp-notice-card">
                        <div className="tapp-notice-header">
                            <span className="tapp-notice-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M16 10C16 10 15 8 12 8C9 8 8 10 8 10"/>
                                    <path d="M9 16s1 2 3 2 3-2 3-2"/>
                                    <path d="M12 2v3"/>
                                    <path d="M12 19v3"/>
                                    <path d="M5 5l2 2"/>
                                    <path d="M17 17l2 2"/>
                                    <path d="M2 12h3"/>
                                    <path d="M19 12h3"/>
                                    <path d="M5 19l2-2"/>
                                    <path d="M17 7l2-2"/>
                                </svg>
                            </span>
                            <span className="tapp-notice-badge">NEW PERK</span>
                        </div>
                        <h3 className="tapp-notice-title">2x rewards at Casa 23 tonight</h3>
                        <p className="tapp-notice-desc">Double points on all taps between 8PM-11PM. Three friends are already planning to go.</p>
                        <div className="tapp-notice-actions">
                            <button className="tapp-notice-btn primary">View perk</button>
                            <button className="tapp-notice-btn">Later</button>
                        </div>
                    </div>
                    <div className="transaction_info">
                        {(!dashboardData?.transactions || dashboardData.transactions.length === 0) && (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            No transactions found. Debug info logged to console.
                          </div>
                        )}
                        {dashboardData?.transactions.slice(0, 4).map((transaction, index) => {
                          const isExpense = ['Uber Eats', 'La Esquina', 'Starbucks', 'Cinema', 'Supermercado Nacional', 'Farmacia Carol'].includes(transaction.establishment);
                          const isReward = ['Casa 23', 'Mofongo House', 'TAPP Drop'].includes(transaction.establishment);
                          const isIncome = ['Event Split', 'Andrea Split'].includes(transaction.establishment);
                          
                          const getTransactionType = () => {
                            if (isExpense) return 'Transfer to';
                            if (isReward) return 'Reward from';
                            if (isIncome) return 'Received from';
                            return 'Transaction with';
                          };
                          
                          const getDescription = () => {
                            switch (transaction.establishment) {
                              case 'Uber Eats': return 'Food delivery';
                              case 'Casa 23': return 'TAPP cashback';
                              case 'La Esquina': return 'Dinner';
                              case 'Event Split': return 'Mambo Night payment';
                              case 'Starbucks': return 'Coffee';
                              case 'Mofongo House': return 'First visit bonus';
                              case 'Cinema': return 'Movie tickets';
                              case 'Supermercado Nacional': return 'Groceries';
                              case 'TAPP Drop': return 'Thursday special';
                              case 'Farmacia Carol': return 'Medicine';
                              case 'Andrea Split': return 'Beach trip settlement';
                              default: return transaction.category;
                            }
                          };
                          
                          return (
                            <div key={transaction.id} className="transaction_data">
                              <div className="get_send_money">
                                <span className={`icon ${isExpense ? 'outgoing' : 'incoming'}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {isExpense ? (
                                      <>
                                        <line x1="12" y1="19" x2="12" y2="5"/>
                                        <polyline points="5 12 12 5 19 12"/>
                                      </>
                                    ) : (
                                      <>
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <polyline points="19 12 12 19 5 12"/>
                                      </>
                                    )}
                                  </svg>
                                </span>
                                <div className="trasaction_details">
                                  <p className="transaction_metadata">{getTransactionType()} <span>{transaction.establishment}</span></p>
                                  <p>{getDescription()}</p>
                                </div>
                              </div>
                              <p className={`transaction_value ${isExpense ? 'outgoing' : 'incoming'}`}>
                                {isExpense ? '-' : '+'}RD${parseFloat(transaction.finalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                    
                    {/* Hidden transactions - shown when expanded */}
                    {transactionsExpanded && dashboardData?.transactions.length > 4 && (
                      <div className="transaction_info hidden-transactions">
                        {/* Group transactions by date */}
                        {(() => {
                          const groupedTransactions = dashboardData.transactions.slice(4).reduce((groups, transaction) => {
                            const transactionDate = new Date(transaction.date);
                            const dateKey = transactionDate.toDateString();
                            if (!groups[dateKey]) {
                              groups[dateKey] = [];
                            }
                            groups[dateKey].push(transaction);
                            return groups;
                          }, {} as Record<string, typeof dashboardData.transactions>);
                          
                          return Object.entries(groupedTransactions).map(([dateKey, transactions]) => {
                            const date = new Date(dateKey);
                            const isToday = new Date().toDateString() === dateKey;
                            const isYesterday = new Date(Date.now() - 24*60*60*1000).toDateString() === dateKey;
                            
                            let dateLabel = '';
                            if (isToday) {
                              dateLabel = 'Today';
                            } else if (isYesterday) {
                              dateLabel = 'Yesterday';
                            } else {
                              dateLabel = date.toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              });
                            }
                            
                            return (
                              <div key={dateKey}>
                                <div className="transaction_date">{dateLabel}</div>
                                {transactions.map((transaction) => {
                                  const isExpense = ['Uber Eats', 'La Esquina', 'Starbucks', 'Cinema', 'Supermercado Nacional', 'Farmacia Carol'].includes(transaction.establishment);
                                  const isReward = ['Casa 23', 'Mofongo House', 'TAPP Drop'].includes(transaction.establishment);
                                  const isIncome = ['Event Split', 'Andrea Split'].includes(transaction.establishment);
                                  
                                  const getTransactionType = () => {
                                    if (isExpense) return 'Transfer to';
                                    if (isReward) return 'Reward from';
                                    if (isIncome) return 'Received from';
                                    return 'Transaction with';
                                  };
                                  
                                  const getDescription = () => {
                                    switch (transaction.establishment) {
                                      case 'Uber Eats': return 'Food delivery';
                                      case 'Casa 23': return 'TAPP cashback';
                                      case 'La Esquina': return 'Dinner';
                                      case 'Event Split': return 'Mambo Night payment';
                                      case 'Starbucks': return 'Coffee';
                                      case 'Mofongo House': return 'First visit bonus';
                                      case 'Cinema': return 'Movie tickets';
                                      case 'Supermercado Nacional': return 'Groceries';
                                      case 'TAPP Drop': return 'Thursday special';
                                      case 'Farmacia Carol': return 'Medicine';
                                      case 'Andrea Split': return 'Beach trip settlement';
                                      default: return transaction.category;
                                    }
                                  };
                                  
                                  return (
                                    <div key={transaction.id} className="transaction_data">
                                      <div className="get_send_money">
                                        <span className={`icon ${isExpense ? 'outgoing' : 'incoming'}`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {isExpense ? (
                                              <>
                                                <line x1="12" y1="19" x2="12" y2="5"/>
                                                <polyline points="5 12 12 5 19 12"/>
                                              </>
                                            ) : (
                                              <>
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <polyline points="19 12 12 19 5 12"/>
                                              </>
                                            )}
                                          </svg>
                                        </span>
                                        <div className="trasaction_details">
                                          <p className="transaction_metadata">{getTransactionType()} <span>{transaction.establishment}</span></p>
                                          <p>{getDescription()}</p>
                                        </div>
                                      </div>
                                      <p className={`transaction_value ${isExpense ? 'outgoing' : 'incoming'}`}>
                                        {isExpense ? '-' : '+'}RD${parseFloat(transaction.finalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                    
                    <button className={`show_more ${transactionsExpanded ? 'expanded' : ''}`} id="showMoreBtn" onClick={toggleTransactions} aria-label="show_all">
                        <span className="show-more-text">{transactionsExpanded ? 'Show less' : 'Show all'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                        </svg>
                    </button>
                </main>
                <aside className="dashboard-aside">
                    <div className={`transfer_money_section ${transferCollapsed ? 'collapsed' : ''}`}>
                        <div className="section-header" onClick={toggleTransferSection}>
                            <p className="title">quick transfer</p>
                            <button className="expand-toggle" type="button" aria-label="Toggle quick transfer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6"/>
                                </svg>
                            </button>
                        </div>
                        <div className="collapsible-content">
                            <div className="button_group">
                                <button className="via_no" aria-label="via_no">via mobile no.</button>
                                <button className="via_ac" aria-label="via_ac">via account no.</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="phone_no_info">
                                    <label htmlFor="phone_no"><img src="https://raw.githubusercontent.com/shyamtala003/finance_dashboard/%40sjtala/images/india.png" alt="" />&nbsp;+1 </label>
                                    <input type="number" name="phone_no" id="phone_no" placeholder="8095551234" />
                                    <img src="https://raw.githubusercontent.com/shyamtala003/finance_dashboard/%40sjtala/images/profile_pic.webp" alt="" />
                                </div>
                                <div className="amount">
                                    <div>
                                        <label htmlFor="ruppes">RD$</label>
                                        <input type="number" name="phone_no" id="rupees" placeholder="1,500.00" />
                                    </div>
                                    <span>DOP</span>
                                </div>
                                <input type="submit" value="send to john" />
                            </form>
                        </div>
                    </div>
                    {/* TAPP Network Stats */}
                    <div className="network-stats-card">
                        <div className="network-stats-header">
                            <h3 className="network-stats-title">Your TAPP Activity</h3>
                            <span className="network-stats-period">This month</span>
                        </div>
                        <div className="network-stats-grid">
                            <div className="network-stat-item">
                                <span className="network-stat-label">Places tapped</span>
                                <span className="network-stat-value">{dashboardData?.monthlyStats.placesTapped || 0}</span>
                                <span className="network-stat-change positive">
                                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 9L6 5L10 9"/>
                                    </svg>
                                    +3 from last month
                                </span>
                            </div>
                            <div className="network-stat-item">
                                <span className="network-stat-label">Rewards earned</span>
                                <span className="network-stat-value">{dashboardData?.monthlyStats.rewardsEarned ? dashboardData.monthlyStats.rewardsEarned.toLocaleString('en-US') : 0}</span>
                                <span className="network-stat-change positive">
                                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 9L6 5L10 9"/>
                                    </svg>
                                    +420 points
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Aether Glass Card */}
                    <article className="aether-card">
                        <header className="aether-card__header">
                            <span className="aether-card__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M16 10C16 10 15 8 12 8C9 8 8 10 8 10"/>
                                    <path d="M12 2v3"/>
                                    <path d="M12 19v3"/>
                                    <path d="M5 5l2 2"/>
                                    <path d="M17 17l2 2"/>
                                    <path d="M2 12h3"/>
                                    <path d="M19 12h3"/>
                                    <path d="M5 19l2-2"/>
                                    <path d="M17 7l2-2"/>
                                </svg>
                            </span>
                            <span className="aether-card__badge">TAPP Network</span>
                        </header>
                        <h3 className="aether-card__title">Unlock exclusive perks</h3>
                        <p className="aether-card__body">
                            Join 3 upcoming events and earn premium status. Get early access to drops, 2x rewards, and exclusive merchant benefits.
                        </p>
                        <footer className="aether-card__footer">
                            <span className="aether-card__meta">rewards · events</span>
                            <button className="aether-card__action" type="button">Explore</button>
                        </footer>
                    </article>
                    
                    <div className={`cards ${walletExpanded ? 'expanded' : ''}`} id="cardsWallet">
                        <div className="title_with_button">
                            <p className="title">your cards</p>
                            <button className="close-wallet" onClick={closeWallet}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
                                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                                </svg>
                            </button>
                            <div className="sliber_controller">
                                <div className="swipe_previous" onClick={prevCard}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm0-9h4v2h-4v3l-4-4 4-4v3z" />
                                    </svg>
                                </div>
                                <div className="swipe_next" onClick={nextCard}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M12 11V8l4 4-4 4v-3H8v-2h4zm0-9c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="custom-cards-container" onClick={expandWallet}>
                            <div className="cards-wrapper">
                                {/* TAPP Card - Diseño Real Premium Minimalista */}
                                <div className={getCardClass(0)} data-index="0">
                                    <div className="card-inner">
                                        {/* Subtle gradient overlay */}
                                        <div className="card-gradient-overlay"></div>
                                        
                                        {/* Header: NFC + tapp logo */}
                                        <div className="card-header">
                                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                                <circle cx="16" cy="16" r="2" fill="rgba(255,255,255,0.9)" />
                                                <path d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22" 
                                                    stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                                                <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26" 
                                                    stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                            <h2 className="tapp-wordmark">tapp</h2>
                                        </div>

                                        {/* Footer: Member name + expiry */}
                                        <div className="card-footer-real">
                                            <div>
                                                <div className="card-label-minimal">Member</div>
                                                <div className="card-value">{dashboardData?.cards[0]?.cardholderName || 'Cardholder'}</div>
                                            </div>
                                            <div className="card-expiry-box">
                                                <div className="card-label-minimal">Valid thru</div>
                                                <div className="card-value card-mono">{dashboardData?.cards[0]?.expiryDate || '12/27'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Card 2 - Variante Azul */}
                                <div className={getCardClass(1)} data-index="1">
                                    <div className="card-inner">
                                        {/* Subtle blue gradient overlay */}
                                        <div className="card-gradient-overlay-blue"></div>
                                        
                                        {/* Header: NFC + tapp logo */}
                                        <div className="card-header">
                                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                                <circle cx="16" cy="16" r="2" fill="rgba(100,150,255,0.9)" />
                                                <path d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22" 
                                                    stroke="rgba(100,150,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                                                <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26" 
                                                    stroke="rgba(100,150,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                            <h2 className="tapp-wordmark">tapp</h2>
                                        </div>

                                        {/* Footer: Member name + expiry */}
                                        <div className="card-footer-real">
                                            <div>
                                                <div className="card-label-minimal">Member</div>
                                                <div className="card-value">{dashboardData?.cards[1]?.cardholderName || 'Cardholder'}</div>
                                            </div>
                                            <div className="card-expiry-box">
                                                <div className="card-label-minimal">Valid thru</div>
                                                <div className="card-value card-mono">{dashboardData?.cards[1]?.expiryDate || '08/28'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Card 3 - Premium con líneas elegantes */}
                                <div className={getCardClass(2)} data-index="2">
                                    <div className="card-inner">
                                        {/* Elegant curved lines pattern */}
                                        <svg className="card-premium-curves" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M-20 40 Q80 30, 140 50 T320 55" stroke="rgba(120,100,180,0.15)" strokeWidth="1.5" fill="none"/>
                                            <path d="M-30 80 Q70 70, 150 85 T330 90" stroke="rgba(120,100,180,0.12)" strokeWidth="1.5" fill="none"/>
                                            <path d="M-20 120 Q90 105, 160 125 T320 130" stroke="rgba(120,100,180,0.1)" strokeWidth="1.5" fill="none"/>
                                        </svg>
                                        
                                        {/* Header: NFC + tapp logo */}
                                        <div className="card-header">
                                            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                                <circle cx="16" cy="16" r="2" fill="rgba(120,100,180,0.9)" />
                                                <path d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22" 
                                                    stroke="rgba(120,100,180,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                                                <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26" 
                                                    stroke="rgba(120,100,180,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                            <h2 className="tapp-wordmark">tapp</h2>
                                        </div>

                                        {/* Footer: Member name + expiry + premium */}
                                        <div className="card-footer-real">
                                            <div>
                                                <div className="card-label-minimal">Member</div>
                                                <div className="card-value">{dashboardData?.cards[2]?.cardholderName || 'Cardholder'}</div>
                                            </div>
                                            <div className="card-expiry-box">
                                                <div className="card-label-minimal">Valid thru</div>
                                                <div className="card-value card-mono">{dashboardData?.cards[2]?.expiryDate || '12/29'}</div>
                                                <div>
                                                    Premium
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="swiper-page">
                            <span className={`dot ${currentCard === 0 ? 'active' : ''}`} onClick={() => goToCard(0)}></span>
                            <span className={`dot ${currentCard === 1 ? 'active' : ''}`} onClick={() => goToCard(1)}></span>
                            <span className={`dot ${currentCard === 2 ? 'active' : ''}`} onClick={() => goToCard(2)}></span>
                        </div>
                    </div>
                </aside>
            </section>
        </section>
        
        {/* Notification Modal */}
        <div className={`notification-modal-overlay ${notificationModalOpen ? 'active' : ''}`} id="notificationModal" onClick={closeNotificationModal}>
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                <h3 className="notification-header-title">Notifications</h3>
                <button className="notification-mark-all" onClick={markAllAsRead}>Mark all read</button>
            </div>
            
            <div className="notification-item unread">
                <span className="notification-icon reward">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                </span>
                <div className="notification-body">
                    <p className="notification-title">2x rewards ending soon</p>
                    <p className="notification-desc">Your 2x rewards at Casa 23 expire tonight at 11PM. Don't miss out!</p>
                </div>
                <span className="notification-time">5m ago</span>
            </div>
            
            <div className="notification-item unread">
                <span className="notification-icon event">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </span>
                <div className="notification-body">
                    <p className="notification-title">3 friends joined Salsa Night</p>
                    <p className="notification-desc">Andrea, Carlos and Juan are going to Salsa Night tomorrow. Join them?</p>
                </div>
                <span className="notification-time">1h ago</span>
            </div>
            
            <div className="notification-item">
                <span className="notification-icon reward">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </span>
                <div className="notification-body">
                    <p className="notification-title">You earned 840 points</p>
                    <p className="notification-desc">RD$120 cashback from Casa 23 added to your rewards.</p>
                </div>
                <span className="notification-time">3h ago</span>
            </div>
            
            <div className="notification-item">
                <span className="notification-icon event">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </span>
                <div className="notification-body">
                    <p className="notification-title">New TAPP Drop nearby</p>
                    <p className="notification-desc">30 spots available at Mofongo House. Free appetizer + 2x points.</p>
                </div>
                <span className="notification-time">5h ago</span>
            </div>
            
            <div className="notification-item">
                <span className="notification-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </span>
                <div className="notification-body">
                    <p className="notification-title">Event split settled</p>
                    <p className="notification-desc">Andrea paid their share (RD$3,200) for Mambo Night.</p>
                </div>
                <span className="notification-time">1d ago</span>
            </div>
        </div>
      </div>
      </div>
      )}
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
