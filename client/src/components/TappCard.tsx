import { useState, useEffect } from 'react';

export default function TappCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const parallaxX = (mousePosition.x - 0.5) * 20;
  const parallaxY = (mousePosition.y - 0.5) * 20;

  return (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '420px',
        perspective: '2000px'
      }}
      className="tapp-card-container"
      data-testid="tapp-card"
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1.586' }}>
        <button
          onClick={handleFlip}
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '12px',
            zIndex: 1001,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'opacity 0.3s ease',
            opacity: 0.5
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5';
          }}
        >
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.65rem',
            fontWeight: 400,
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            {isFlipped ? 'Frente' : 'Reverso'}
          </span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M13 8H3M13 8L10 5M13 8L10 11" 
              stroke="rgba(255, 255, 255, 0.9)" 
              strokeWidth="1.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.9s cubic-bezier(0.23, 1, 0.32, 1)',
            transform: `rotateY(${isFlipped ? 180 : 0}deg) translateX(${parallaxX}px) translateY(${parallaxY}px)`
          }}
        >
          {/* Front of card - Premium Black Design */}
          <div
            className="tapp-credit-card"
            style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
              borderRadius: '16px',
              padding: '0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              overflow: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            {/* Subtle gradient overlay - minimal */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60%',
              height: '100%',
              background: 'radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.03) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />

            {/* Content wrapper with proper padding */}
            <div style={{
              padding: '2rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Header - NFC icon and TAPP logo */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                {/* NFC Symbol - minimal and premium */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="2" fill="rgba(255,255,255,0.9)" />
                  <path d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22" 
                    stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26" 
                    stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>

                {/* TAPP wordmark */}
                <h2 
                  style={{
                    fontFamily: "'Antipasto Pro', sans-serif",
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.2rem)',
                    fontWeight: 200,
                    letterSpacing: '0.2em',
                    color: 'rgba(255, 255, 255, 0.95)',
                    margin: 0,
                    textTransform: 'lowercase'
                  }}
                >
                  tapp
                </h2>
              </div>

              {/* NFC Icon */}
              <div style={{ 
                marginTop: 'auto',
                marginBottom: '1.2rem'
              }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.7)" />
                  <path d="M20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28" 
                    stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 6C12.268 6 6 12.268 6 20C6 27.732 12.268 34 20 34" 
                    stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Footer - Name and expiry */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                    letterSpacing: '0.1em',
                    fontWeight: 500
                  }}>
                    Member
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 400
                  }}>
                    Cardholder
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                    letterSpacing: '0.1em',
                    fontWeight: 500
                  }}>
                    Valid thru
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    letterSpacing: '0.08em',
                    fontWeight: 400,
                    fontFamily: "'Space Mono', monospace"
                  }}>
                    12/27
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card - Minimal and Premium */}
          <div
            className="tapp-credit-card-back"
            style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
              borderRadius: '16px',
              padding: '0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              overflow: 'hidden'
            }}
          >
            {/* Magnetic stripe - ultra minimal */}
            <div style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)',
              marginTop: '2.5rem'
            }} />

            {/* Content wrapper */}
            <div style={{
              padding: '2rem',
              paddingTop: '2.5rem'
            }}>
              {/* PIN section - minimal design */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '3rem'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '0.6rem 1.2rem',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem',
                    letterSpacing: '0.1em',
                    fontWeight: 500
                  }}>
                    PIN
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.3em'
                  }}>
                    ••••
                  </div>
                </div>
              </div>

              {/* Info section at bottom */}
              <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                right: '2rem'
              }}>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(255, 255, 255, 0.3)',
                  lineHeight: 1.6,
                  letterSpacing: '0.05em'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    Esta tarjeta es propiedad de TAPP
                  </div>
                  <div>
                    support@tapp.do
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
