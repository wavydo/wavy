import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Careers() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.careers-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      gsap.fromTo('.careers-hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      const jobCards = document.querySelectorAll('.job-card');
      if (jobCards.length > 0) {
        gsap.fromTo('.job-card',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.jobs-grid', start: 'top 70%' }
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const onLink = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      window.scrollTo(0, 0);
      setLocation(href);
    }
  };

  const openings = [
    {
      title: 'Senior Full-Stack Engineer',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build the core platform that connects millions of people with local businesses. Work with React, Node.js, PostgreSQL, and real-time location services.'
    },
    {
      title: 'Product Designer',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design experiences that feel invisible. Make complex proximity technology simple enough that users don\'t think about it.'
    },
    {
      title: 'Business Development',
      location: 'Santo Domingo, DR',
      type: 'Full-time',
      description: 'Help local businesses understand why Wavy is different. Build partnerships with restaurants, shops, and venues in the DR.'
    }
  ];

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .careers-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .careers-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .careers-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .careers-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .careers-links { display: flex; gap: 6px; }
        .careers-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .careers-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .careers-navend { display: flex; align-items: center; gap: 8px; }
        .careers-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .careers-btn:hover { transform: translateY(-1px); }
        @media (max-width: 860px) {
          .careers-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="careers-nav">
        <div className="careers-wrap">
          <div className="careers-navin">
            <a href="/" className="careers-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="careers-links" aria-label="Primary">
              <a href="/learn-more" className="careers-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="careers-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="careers-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="careers-navend">
              <a href="/auth" className="careers-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="careers-hero-title" style={{ fontSize: 'clamp(48px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Build something <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800, WebkitTextStroke: '0.5px #5e79db' }}>people use</span>
          </h1>
          <p className="careers-hero-subtitle" style={{ fontSize: 'clamp(18px,2.2vw,22px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto' }}>
            We're working on something real. No corporate BS, no pointless meetings. Just building a product that solves an actual problem.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section style={{ padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', background: '#f3f3f6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,5vw,4rem)' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Open positions
            </h2>
            <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(22,20,31,0.6)' }}>
              3 roles available right now
            </p>
          </div>

          <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            {/* Card 1 - Large left (Senior Full-Stack) */}
            <div 
              className="job-card"
              style={{ 
                gridColumn: 'span 7',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2.5rem,4vw,3rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#5e79db';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(94,121,219,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => window.location.href = 'mailto:careers@wavy.do?subject=Senior Full-Stack Engineer'}
            >
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Senior Full-Stack Engineer
              </h3>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <MapPin size={16} />
                  Remote
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <Briefcase size={16} />
                  Full-time
                </div>
              </div>

              <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Build the core platform that connects millions of people with local businesses. Work with React, Node.js, PostgreSQL, and real-time location services.
              </p>

              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#16141f',
                color: 'white',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}>
                Apply now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            {/* Card 2 - Small top right (Product Designer) */}
            <div 
              className="job-card"
              style={{ 
                gridColumn: 'span 5',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2rem,3.5vw,2.5rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#5e79db';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(94,121,219,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => window.location.href = 'mailto:careers@wavy.do?subject=Product Designer'}
            >
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Product Designer
              </h3>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <MapPin size={16} />
                  Remote
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <Briefcase size={16} />
                  Full-time
                </div>
              </div>

              <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Design experiences that feel invisible. Make complex proximity technology simple enough that users don't think about it.
              </p>

              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#16141f',
                color: 'white',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}>
                Apply now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            {/* Card 3 - Full width bottom (Business Development) */}
            <div 
              className="job-card"
              style={{ 
                gridColumn: 'span 12',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2.5rem,4vw,3rem)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#5e79db';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(94,121,219,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => window.location.href = 'mailto:careers@wavy.do?subject=Business Development'}
            >
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Business Development
              </h3>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <MapPin size={16} />
                  Santo Domingo, DR
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>
                  <Briefcase size={16} />
                  Full-time
                </div>
              </div>

              <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Help local businesses understand why Wavy is different. Build partnerships with restaurants, shops, and venues in the DR.
              </p>

              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#16141f',
                color: 'white',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                transition: 'transform 0.2s'
              }}>
                Apply now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 860px) {
              section div[style*="gridColumn"] { grid-column: span 12 !important; }
            }
          `}</style>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Don't see the right role?
          </h2>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We're always looking for talented people. If you think you'd be a good fit, reach out anyway. Tell us what you'd want to work on.
          </p>
          <a 
            href="mailto:careers@wavy.do"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#16141f', 
              color: 'white', 
              padding: '16px 32px', 
              borderRadius: 100, 
              fontSize: 16, 
              fontWeight: 600, 
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Send us an email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 'clamp(40px,5vw,64px) 0 28px', background: '#f3f3f6' }}>
        <div style={{ maxWidth: 1920, margin: '0 auto', padding: '0 clamp(20px,4vw,60px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,minmax(0,1fr))', gap: 32 }}>
            <div>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#16141f', fontFamily: "'Modulus', -apple-system, sans-serif" }}>wavy</span>
              <p style={{ marginTop: 14, maxWidth: '30em', fontSize: 13, lineHeight: 1.55, color: 'rgba(22,20,31,0.6)' }}>
                Discover places and offers around you. Everything you need to explore your neighborhood in one place.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                <a href="https://x.com/wavy" aria-label="X" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'white', color: 'rgba(22,20,31,0.6)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'all .25s', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />
                  </svg>
                </a>
                <a href="https://instagram.com/wavy.do" aria-label="Instagram" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'white', color: 'rgba(22,20,31,0.6)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'all .25s', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Product</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/learn-more" onClick={(e) => onLink(e, "/learn-more")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Features</a></li>
                <li><a href="/business" onClick={(e) => onLink(e, "/business")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Business</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Company</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/about" onClick={(e) => onLink(e, "/about")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>About</a></li>
                <li><a href="/careers" onClick={(e) => onLink(e, "/careers")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Support</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/help" onClick={(e) => onLink(e, "/help")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Help Center</a></li>
                <li><a href="/contact" onClick={(e) => onLink(e, "/contact")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Contact</a></li>
              </ul>
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: 'clamp(36px,5vw,56px)', fontSize: 'clamp(72px,17vw,232px)', fontWeight: 500, lineHeight: 0.82, letterSpacing: '-0.06em', textAlign: 'center', color: 'transparent', background: 'linear-gradient(180deg,rgba(0,0,0,0.02) 0%,transparent 92%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', userSelect: 'none', whiteSpace: 'nowrap' }}>wavy</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 12, color: 'rgba(22,20,31,0.5)' }}>
            <span>© 2024 Wavy. All rights reserved.</span>
            <nav style={{ display: 'flex', gap: 18 }}>
              <a href="/privacy" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Terms</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
