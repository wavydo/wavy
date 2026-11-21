import { useLocation } from 'wouter';
import './BottomNav.css';

export default function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {/* Benefits */}
        <a 
          href="/dashboard/benefits" 
          className={`nav-item ${isActive('/dashboard/benefits') ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Benefits</span>
        </a>

        {/* Events */}
        <a 
          href="/dashboard/events" 
          className={`nav-item ${isActive('/dashboard/events') ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Events</span>
        </a>

        {/* NFC Center Button */}
        <button className="nfc-button" aria-label="NFC Tap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/>
            <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/>
            <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/>
            <path d="M16.37 2a20.16 20.16 0 0 1 0 20"/>
          </svg>
        </button>

        {/* Cards */}
        <a 
          href="/dashboard/cards" 
          className={`nav-item ${isActive('/dashboard/cards') ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span>Cards</span>
        </a>

        {/* Home */}
        <a 
          href="/dashboard/user" 
          className={`nav-item ${isActive('/dashboard/user') ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </a>
      </div>
    </nav>
  );
}
