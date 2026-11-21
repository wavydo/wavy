import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocation } from 'wouter';
import TappCard from '@/components/TappCard';
import AboutSections from '@/components/AboutSections';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isCamActive, setIsCamActive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { geoData } = useGeolocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      
      // Fade out in the last 0.5 seconds
      if (duration - currentTime <= 0.5) {
        video.style.opacity = String((duration - currentTime) / 0.5);
      }
      // Fade in during the first 0.5 seconds
      else if (currentTime <= 0.5) {
        video.style.opacity = String(currentTime / 0.5);
      }
      // Full opacity in the middle
      else {
        video.style.opacity = '1';
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Animate controls on scroll - solo en desktop
  useEffect(() => {
    const heroSection = heroRef.current;
    const controls = controlsRef.current;
    if (!heroSection || !controls) return;

    // Solo animar en desktop
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return; // No animar en mobile

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          if (progress < 0.5) {
            // En el hero - posición normal
            gsap.to(controls, {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.2
            });
          } else {
            // Al scrollear - minimizar y subir suavemente
            const moveProgress = (progress - 0.5) / 0.5; // De 0.5 a 1
            gsap.to(controls, {
              y: -window.innerHeight * 0.7 * moveProgress, // Subir el 70% de la pantalla
              scale: 0.7 - (moveProgress * 0.1), // Minimizar un poco
              opacity: 1 - (moveProgress * 0.6), // Fade suave
              duration: 0.2
            });
          }
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* Primera Sección - Hero con Tarjeta (lo que era Home) */}
      <section 
        ref={heroRef}
        className="section-container fullscreen-media-container" 
        style={{ 
          position: 'relative', 
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}
      >
        {/* Video Background con fade out suave */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}>
          <video 
            ref={videoRef}
            src="/b1b.mp4" 
            autoPlay 
            playsInline 
            muted 
            loop 
            preload="auto"
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            data-testid="video-background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              top: 0,
              left: 0,
              transition: 'opacity 0.1s ease',
              pointerEvents: 'none'
            }}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              video.play().catch(() => {
                setTimeout(() => video.play().catch(() => {}), 100);
              });
            }}
            onClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Overlay con gradiente suave hacia negro en el bottom para transición perfecta */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,1) 100%)',
            pointerEvents: 'none'
          }}></div>
        </div>

        {/* Gradiente adicional en el borde inferior para fusión perfecta */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '20vh',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)',
          zIndex: 5,
          pointerEvents: 'none'
        }}></div>

        {/* Content Layer */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100vh'
        }}>
          {/* Hero Text Section */}
          <div 
            className="hero-text-section"
            style={{
              position: 'absolute',
              top: '15%',
              left: '5%',
              maxWidth: '500px',
              color: 'white'
            }}
          >
            <h1 style={{
              fontFamily: "'Antipasto Pro', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 200,
              letterSpacing: '0.05em',
              marginBottom: '1rem',
              lineHeight: 1.2,
              color: '#ffffff'
            }}>
              Paga menos,
              <br />
              aprovecha más
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 300,
              letterSpacing: '0.02em',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '450px'
            }}>
              Conecta con negocios locales, ahorra en cada compra y crea impacto real en tu comunidad.
            </p>
          </div>

          <TappCard />
          
          {/* Controls container - centrado y animado */}
          <div 
            ref={controlsRef}
            className="overlay-content-container"
            style={{
              position: 'fixed',
              bottom: '30px',
              left: '30px',
              right: '30px',
              width: 'auto',
              zIndex: 100,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              pointerEvents: 'auto'
            }}
          >
            {/* Ubicación - izquierda (reducida) */}
            <div className="partner-text-container location-container" style={{ flex: '0 0 auto', transform: 'scale(0.9)', transformOrigin: 'left center' }}>
              <button className="button-mic-element size-s" data-testid="partner-location-status">
                <span className="icon">
                  {geoData && (
                    <img 
                      src={`https://flagcdn.com/w20/${geoData.countryCode}.png`}
                      alt={geoData.country}
                      style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                      className="flag-icon"
                    />
                  )}
                </span>
              </button>
              <span className="name country-name" data-testid="partner-country">{geoData?.country || 'Loading...'}</span>
            </div>

            {/* Nav buttons - centro (reducido y absolutamente centrado) */}
            <div style={{ 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%) scale(0.9)',
              bottom: '0'
            }}>
            <div className="ui-container">
              <div className="navigation-controls-container">
                <button 
                  className="button-cam-element switch"
                  onClick={() => setLocation('/auth')}
                  data-testid="button-auth"
                >
                  <span className="icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="4.5" r="2.5" stroke="white" strokeWidth="1.5"/>
                      <path d="M2 12.5C2 10.015 4.239 8 7 8C9.761 8 12 10.015 12 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <button 
                  className="button-share-element"
                  onClick={() => {
                    // Scroll to About sections
                    const aboutSection = document.querySelector('.about-sections-container');
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  data-testid="button-about"
                >
                  <span className="icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 8.29 1.42 9.48 2.14 10.43" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7Z" stroke="white" strokeWidth="1.5"/>
                      <path d="M9 9V7C9 5.34315 10.3431 4 12 4V4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="button-settings" 
                    onClick={() => setMenuOpen(!menuOpen)}
                    data-testid="button-settings"
                  >
                    <span></span>
                  </button>
                  {menuOpen && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '60px',
                        right: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        minWidth: '200px',
                        overflow: 'hidden',
                        zIndex: 1000
                      }}
                      data-testid="settings-menu"
                    >
                      <button
                        onClick={() => {
                          window.location.href = 'mailto:contact@tradearray.org';
                          setMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        data-testid="menu-contact"
                      >
                        Contact Us
                      </button>
                      <button
                        onClick={() => {
                          setLocation('/terms');
                          setMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        data-testid="menu-terms"
                      >
                        Terms & Conditions
                      </button>
                      <button
                        onClick={() => {
                          window.open('http://discord.tradearray.org', '_blank');
                          setMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        data-testid="menu-array-discord"
                      >
                        Array's Discord
                      </button>
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          backgroundColor: 'transparent',
                          color: 'rgba(255, 255, 255, 0.3)',
                          border: 'none',
                          cursor: 'not-allowed',
                          fontSize: '14px',
                          opacity: 0.5
                        }}
                        data-testid="menu-sponsoring"
                      >
                        Sponsoring
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Todas las secciones de About */}
      <AboutSections />

      {/* Estilos responsive para mobile */}
      <style>{`
        /* Mobile styles */
        @media (max-width: 768px) {
          /* Tarjeta más pequeña, más arriba y centrada */
          .tapp-card-container {
            transform: translate(-50%, -50%) scale(0.7) !important;
            top: 52% !important;
          }

          /* Hero text más abajo */
          .hero-text-section {
            top: 18% !important;
            left: 5% !important;
            right: 5% !important;
            max-width: 90% !important;
          }

          .hero-text-section h1 {
            font-size: clamp(1.8rem, 8vw, 2.5rem) !important;
            margin-bottom: 0.75rem !important;
          }

          .hero-text-section p {
            font-size: clamp(0.85rem, 3.5vw, 1rem) !important;
          }

          /* Bandera: más pequeña y centrada horizontalmente arriba */
          .location-container {
            position: fixed !important;
            top: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) scale(0.75) !important;
            bottom: auto !important;
          }

          .location-container .country-name {
            display: none !important;
          }

          .location-container .flag-icon {
            width: 16px !important;
            height: 16px !important;
          }

          .location-container .button-mic-element {
            width: 32px !important;
            height: 32px !important;
          }

          /* Nav tab mantiene su posición y tamaño en mobile */
          .overlay-content-container > div[style*="absolute"] {
            transform: translateX(-50%) !important;
            bottom: 0 !important;
          }

          /* Controles container ajustado */
          .overlay-content-container {
            bottom: 20px !important;
            left: 20px !important;
            right: 20px !important;
          }
        }

        /* Para pantallas muy pequeñas */
        @media (max-width: 480px) {
          .tapp-card-container {
            transform: translate(-50%, -50%) scale(0.6) !important;
            top: 54% !important;
          }

          .hero-text-section {
            top: 15% !important;
          }

          .location-container {
            top: 18px !important;
            transform: translateX(-50%) scale(0.7) !important;
          }

          .location-container .flag-icon {
            width: 14px !important;
            height: 14px !important;
          }

          .location-container .button-mic-element {
            width: 28px !important;
            height: 28px !important;
          }

          /* Nav tab mantiene tamaño normal en mobile pequeño también */
          .overlay-content-container > div[style*="absolute"] {
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
    </>
  );
}
