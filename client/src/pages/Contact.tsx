import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero
      gsap.fromTo('.contact-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      gsap.fromTo('.contact-hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      // Animate contact cards
      const cards = document.querySelectorAll('.contact-card');
      if (cards.length > 0) {
        gsap.fromTo('.contact-card',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.contact-cards', start: 'top 70%' }
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

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .contact-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .contact-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .contact-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .contact-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .contact-links { display: flex; gap: 6px; }
        .contact-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .contact-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .contact-navend { display: flex; align-items: center; gap: 8px; }
        .contact-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .contact-btn:hover { transform: translateY(-1px); }
        .contact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 860px) {
          .contact-grid { grid-template-columns: 1fr; }
          .contact-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="contact-nav">
        <div className="contact-wrap">
          <div className="contact-navin">
            <a href="/" className="contact-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="contact-links" aria-label="Primary">
              <a href="/learn-more" className="contact-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="contact-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="contact-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="contact-navend">
              <a href="/auth" className="contact-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(3rem,5vw,5rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 className="contact-hero-title" style={{ fontSize: 'clamp(48px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Get in <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800, WebkitTextStroke: '0.5px #5e79db' }}>touch</span>
          </h1>
          <p className="contact-hero-subtitle" style={{ fontSize: 'clamp(18px,2.2vw,22px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6 }}>
            Have questions? We're here to help. Choose your preferred way to reach us.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section style={{ padding: 'clamp(3rem,5vw,5rem) clamp(20px,4vw,60px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="contact-cards contact-grid">
            {[
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
                title: 'Email',
                desc: 'Send us an email anytime',
                contact: 'hello@wavy.do',
                action: 'mailto:hello@wavy.do'
              },
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                title: 'Phone',
                desc: 'Call us during business hours',
                contact: '+1 (809) 504-2837',
                action: 'tel:+18095042837'
              },
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                title: 'Live Chat',
                desc: 'Chat with our support team',
                contact: 'Available 9am-6pm EST',
                action: '#'
              },
              {
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
                title: 'Help Center',
                desc: 'Browse FAQs and guides',
                contact: 'Find answers instantly',
                action: '/help',
                isInternal: true
              }
            ].map((method, i) => (
              <a 
                key={i} 
                href={method.action}
                onClick={method.isInternal ? (e) => onLink(e, method.action) : undefined}
                className="contact-card"
                style={{ 
                  background: '#fafafa', 
                  border: '1px solid rgba(0,0,0,0.04)', 
                  borderRadius: 24, 
                  padding: 'clamp(2.5rem,4vw,3rem)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(94,121,219,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ width: 64, height: 64, background: 'rgba(94,121,219,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5e79db', marginBottom: '1.5rem' }}>
                  {method.icon}
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 500, marginBottom: '0.75rem' }}>{method.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.6)', marginBottom: '1rem', lineHeight: 1.6 }}>{method.desc}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#5e79db' }}>{method.contact}</p>
              </a>
            ))}
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
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
