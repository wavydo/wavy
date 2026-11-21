import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="app-header app-header-home-only" data-testid="app-header">
      <div className="app-header-home-content">
        <div 
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <h1 
            className="app-logo-text"
            data-testid="app-logo"
            style={{
              fontFamily: "'Antipasto Pro', sans-serif",
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              fontWeight: 200,
              letterSpacing: '0.15em',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              textTransform: 'lowercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            tapp
          </h1>

          {/* Elegant Dropdown Menu */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 1rem)',
            left: '50%',
            transform: `translateX(-50%) translateY(${isMenuOpen ? '0' : '-10px'})`,
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000
          }}>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              width: '12px',
              height: '12px',
              background: 'rgba(20, 20, 25, 0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'translateX(-50%) rotate(45deg)',
            }}></div>

            <div style={{
              background: 'rgba(20, 20, 25, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0.5rem',
              minWidth: '180px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
              {[
                { label: 'Inicio', href: '/', icon: '→' },
                { label: 'Acerca de', href: '/about', icon: '◆' },
                { label: 'Acceder', href: '/auth', icon: '⊕' }
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.02em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.5,
                    fontWeight: 200
                  }}>
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
