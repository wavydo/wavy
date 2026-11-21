import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero
      gsap.fromTo('.about-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      gsap.fromTo('.about-hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      // Animate story section
      gsap.fromTo('.about-story',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-story', start: 'top 70%' }
        }
      );

      // Animate value cards
      const cards = document.querySelectorAll('.value-card');
      if (cards.length > 0) {
        gsap.fromTo('.value-card',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.values-section', start: 'top 65%' }
          }
        );
      }

      // Animate CTA
      gsap.fromTo('.about-cta',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-cta', start: 'top 75%' }
        }
      );
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

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .about-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .about-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .about-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .about-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .about-links { display: flex; gap: 6px; }
        .about-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .about-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .about-navend { display: flex; align-items: center; gap: 8px; }
        .about-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .about-btn:hover { transform: translateY(-1px); }
        .about-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr; }
          .about-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="about-nav">
        <div className="about-wrap">
          <div className="about-navin">
            <a href="/" className="about-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="about-links" aria-label="Primary">
              <a href="/learn-more" className="about-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="about-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="about-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="about-navend">
              <a href="/auth" className="about-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="about-hero-title" style={{ fontSize: 'clamp(48px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#16141f' }}>
            About <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800 }}>Wavy</span>
          </h1>
          <p className="about-hero-subtitle" style={{ fontSize: 'clamp(18px,2.2vw,22px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto' }}>
            A proximity-based platform that connects you with nearby places, exclusive offers, and local experiences—all in real-time, right when you need them.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story" style={{ padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48, maxWidth: 800, margin: '0 auto' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 400, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Our Story
              </h2>
              <div style={{ display: 'grid', gap: 20 }}>
                <p style={{ fontSize: 'clamp(16px,2vw,18px)', color: 'rgba(22,20,31,0.7)', lineHeight: 1.7 }}>
                  Wavy started because we were frustrated. You're walking down the street, and the perfect coffee shop with a 20% off special is right there—but you have no idea. Meanwhile, you're scrolling through apps trying to find something to do.
                </p>
                <p style={{ fontSize: 'clamp(16px,2vw,18px)', color: 'rgba(22,20,31,0.7)', lineHeight: 1.7 }}>
                  So we built something simple: your phone tells you when you're near something good. A restaurant offering happy hour. A store with a sale. An event starting in an hour. You don't search—it just finds you.
                </p>
                <p style={{ fontSize: 'clamp(16px,2vw,18px)', color: 'rgba(22,20,31,0.7)', lineHeight: 1.7 }}>
                  And because we're not trying to be creepy about it, your location data stays on your phone. We show you what's nearby, you decide what to do, and that's it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="values-section" style={{ padding: 'clamp(3rem,5vw,5rem) clamp(20px,4vw,60px)', background: '#f3f3f6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,5vw,4rem)' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              How we think
            </h2>
            <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(22,20,31,0.6)' }}>
              No corporate mission statements here
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
            {/* Card 1 - Large top left */}
            <div 
              className="value-card"
              style={{ 
                gridColumn: 'span 7',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2.5rem,4vw,3rem)',
                transition: 'all 0.3s ease',
                position: 'relative'
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
            >
              <div style={{ 
                width: 4, 
                height: 40, 
                background: '#5e79db', 
                borderRadius: 2,
                marginBottom: '1.25rem'
              }} />
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.65rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Why we built this
              </h3>
              <p style={{ fontSize: 15.5, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65 }}>
                We got tired of opening 5 different apps just to see what's happening around us. Your phone already knows where you are—it should just tell you when something good is nearby.
              </p>
            </div>

            {/* Card 2 - Small top right */}
            <div 
              className="value-card"
              style={{ 
                gridColumn: 'span 5',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2rem,3.5vw,2.5rem)',
                transition: 'all 0.3s ease',
                position: 'relative'
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
            >
              <div style={{ 
                width: 4, 
                height: 40, 
                background: '#5e79db', 
                borderRadius: 2,
                marginBottom: '1.25rem'
              }} />
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.65rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Local businesses matter
              </h3>
              <p style={{ fontSize: 15.5, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65 }}>
                The coffee shop on your corner isn't trying to be Starbucks. We give small businesses the same tools as the big chains, without the enterprise price tag.
              </p>
            </div>

            {/* Card 3 - Small bottom left */}
            <div 
              className="value-card"
              style={{ 
                gridColumn: 'span 5',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2rem,3.5vw,2.5rem)',
                transition: 'all 0.3s ease',
                position: 'relative'
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
            >
              <div style={{ 
                width: 4, 
                height: 40, 
                background: '#5e79db', 
                borderRadius: 2,
                marginBottom: '1.25rem'
              }} />
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.65rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                Your data is yours
              </h3>
              <p style={{ fontSize: 15.5, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65 }}>
                We don't sell your location history. We don't track where you go. We just show you what's around you right now, then forget about it.
              </p>
            </div>

            {/* Card 4 - Large bottom right */}
            <div 
              className="value-card"
              style={{ 
                gridColumn: 'span 7',
                background: 'white', 
                border: '1px solid rgba(0,0,0,0.06)', 
                borderRadius: 20, 
                padding: 'clamp(2.5rem,4vw,3rem)',
                transition: 'all 0.3s ease',
                position: 'relative'
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
            >
              <div style={{ 
                width: 4, 
                height: 40, 
                background: '#5e79db', 
                borderRadius: 2,
                marginBottom: '1.25rem'
              }} />
              <h3 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.65rem', letterSpacing: '-0.01em', color: '#16141f' }}>
                No BS, just results
              </h3>
              <p style={{ fontSize: 15.5, color: 'rgba(22,20,31,0.7)', lineHeight: 1.65 }}>
                Walk into a place, get your reward. No scanning QR codes, no checking in, no "please download our app." It just works.
              </p>
            </div>
          </div>

          <style>{`
            @media (max-width: 860px) {
              .about-grid > div { grid-column: span 12 !important; }
            }
          `}</style>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-cta" style={{ padding: 'clamp(4rem,6vw,7rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 400, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Want to help build this?
          </h2>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We're a small team building something people actually want to use. If that sounds interesting, let's talk.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/careers" 
              onClick={(e) => onLink(e, "/careers")}
              style={{ 
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
              View Open Positions
            </a>
            <a 
              href="/contact" 
              onClick={(e) => onLink(e, "/contact")}
              style={{ 
                background: 'white', 
                color: '#16141f', 
                padding: '16px 32px', 
                borderRadius: 100, 
                fontSize: 16, 
                fontWeight: 600, 
                border: '2px solid rgba(0,0,0,0.1)',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#5e79db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
              }}
            >
              Get in Touch
            </a>
          </div>
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
                <a href="https://github.com/wavy" aria-label="GitHub" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'white', color: 'rgba(22,20,31,0.6)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', transition: 'all .25s', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 500, color: 'rgba(22,20,31,0.5)', marginBottom: 14 }}>Product</h4>
              <ul style={{ display: 'grid', gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="/learn-more#features" onClick={(e) => onLink(e, "/learn-more#features")} style={{ fontSize: 13.5, color: '#16141f', opacity: 0.85, textDecoration: 'none', transition: 'opacity .2s' }}>Features</a></li>
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
              <a href="/cookies" style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Cookies</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
