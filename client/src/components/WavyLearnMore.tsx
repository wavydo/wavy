"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dumbbell, Percent, User, Bell } from "lucide-react";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function WavyLearnMore() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [joinState, setJoinState] = useState<'idle' | 'sending' | 'error' | 'done'>('idle');
  const [joinNote, setJoinNote] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const bentoCards = document.querySelectorAll(".bento-card");
      if (bentoCards.length > 0) {
        gsap.fromTo(".bento-card",
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: ".bento-section", start: "top 70%" },
          }
        );
      }

      // Animate use case cards
      const useCaseCards = document.querySelectorAll(".use-case-card");
      if (useCaseCards.length > 0) {
        gsap.fromTo(".use-case-card",
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out",
            scrollTrigger: { trigger: "#use-cases", start: "top 60%" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinState === 'sending') return;
    
    const trimmed = email.trim();
    if (!trimmed) {
      setJoinNote('Please enter your email address');
      setJoinState('error');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setJoinNote('Please enter a valid email address');
      setJoinState('error');
      return;
    }
    
    setJoinState('sending');
    setJoinNote('');
    
    try {
      // Simulate API call - replace with your actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJoinState('done');
      setEmail('');
    } catch (err) {
      setJoinNote('Something went wrong. Please try again.');
      setJoinState('error');
    }
  };

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        .lml-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; transition: background-color .35s, box-shadow .35s, backdrop-filter .35s; }
        .lml-nav[data-scrolled="true"] { background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .lml-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .lml-navin { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 48px; }
        .lml-brand { display: inline-flex; align-items: center; gap: -4px; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; justify-self: start; font-family: 'Modulus', -apple-system, sans-serif; line-height: 1; -webkit-text-stroke: 0.5px #16141f; paint-order: stroke fill; text-decoration: none; }
        .lml-links { display: flex; gap: 6px; }
        .lml-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .lml-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .lml-navend { justify-self: end; display: flex; align-items: center; gap: 8px; }
        .lml-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; border: none; cursor: pointer; display: inline-block; }
        .lml-btn:hover { transform: translateY(-1px); }
        .lml-menu { display: none; }
        
        
        /* Footer styles */
        .lml-foot { padding: clamp(40px,5vw,64px) 0 28px; }
        .lml-footgrid { display: grid; grid-template-columns: 1.4fr repeat(3,minmax(0,1fr)); gap: 32px; }
        .lml-foot .lml-brand { font-size: 17px; }
        .lml-tagline { margin-top: 14px; max-width: 30em; font-size: 13px; line-height: 1.55; color: rgba(92,89,105,1); }
        .lml-socials { display: flex; gap: 8px; margin-top: 18px; }
        .lml-socials a { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: #ffffff; color: rgba(92,89,105,1); box-shadow: inset 0 0 0 1px rgba(22,20,31,0.09); transition: color .25s, transform .3s cubic-bezier(.3,1.5,.5,1); }
        .lml-socials a:hover { color: #16141f; transform: translateY(-2px); }
        .lml-col h4 { font-size: 12px; font-weight: 500; color: rgba(143,140,156,1); }
        .lml-col ul { display: grid; gap: 9px; margin-top: 14px; list-style: none; padding: 0; }
        .lml-col a { font-size: 13.5px; color: #16141f; opacity: .85; transition: opacity .2s; text-decoration: none; }
        .lml-col a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }
        .lml-word { position: relative; margin-top: clamp(36px,5vw,56px); font-size: clamp(72px,17vw,232px); font-weight: 500; line-height: .82; letter-spacing: -0.06em; text-align: center; color: transparent; background: linear-gradient(180deg, #dfe7fa 0%, transparent 92%); -webkit-background-clip: text; background-clip: text; user-select: none; white-space: nowrap; }
        .lml-bar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-top: 18px; border-top: 1px solid rgba(22,20,31,0.09); font-size: 12px; color: rgba(143,140,156,1); }
        .lml-bar nav { display: flex; gap: 18px; }
        .lml-bar a { color: inherit; text-decoration: none; }
        .lml-bar a:hover { color: #16141f; }
        
        @media (max-width: 860px) {
          .lml-navin { grid-template-columns: 1fr auto; }
          .lml-links { display: none; }
          .lml-menu { display: flex; width: 38px; height: 38px; border-radius: 999px; align-items: center; justify-content: center; background: rgba(22,20,31,0.06); border: none; cursor: pointer; }
          .lml-footgrid { grid-template-columns: 1fr 1fr; }
          .lml-footgrid > :first-child { grid-column: 1 / -1; }
        }
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
      `}</style>

      {/* Mobile-specific responsive styles */}
      <style>{`
        @media (max-width: 860px) {
          .bento-section > div { grid-template-columns: 1fr !important; }
          .bento-card { grid-column: span 1 !important; }
          #use-cases > div > div:last-child { grid-template-columns: 1fr !important; }
          .bento-section { padding: clamp(3rem,8vw,5rem) clamp(16px,4vw,24px) !important; }
          #use-cases { padding: clamp(5rem,10vw,8rem) clamp(16px,4vw,24px) clamp(3rem,6vw,5rem) !important; }
          .bento-card, .use-case-card { padding: clamp(1.8rem,4vw,2.5rem) clamp(1.5rem,4vw,2rem) !important; }
          .bento-card > div:nth-child(3) { min-height: 280px !important; }
          .bento-card > div:nth-child(3) > div { height: 320px !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(2) { width: 48px !important; height: 48px !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(2) svg { width: 22px !important; height: 22px !important; }
          .bento-card > div:nth-child(3) > div > div:not(:nth-child(1)):not(:nth-child(2)) > div:first-child { width: 36px !important; height: 36px !important; }
          .bento-card > div:nth-child(3) > div > div:not(:nth-child(1)):not(:nth-child(2)) > div:first-child svg,
          .bento-card > div:nth-child(3) > div > div:not(:nth-child(1)):not(:nth-child(2)) > div:first-child [data-lucide] { width: 16px !important; height: 16px !important; }
          .bento-card > div:nth-child(3) > div > div:not(:nth-child(1)):not(:nth-child(2)) > div:last-child { font-size: 9px !important; padding: 3px 8px !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(3) { top: 12% !important; left: 15% !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(4) { bottom: 15% !important; left: 12% !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(5) { top: 15% !important; right: 18% !important; }
          .bento-card > div:nth-child(3) > div > div:nth-child(6) { bottom: 12% !important; right: 15% !important; }
          .bento-card:nth-child(2) > div:nth-child(3) > div { min-height: 240px !important; }
          .bento-card:nth-child(2) > div:nth-child(3) > div > img { display: block !important; }
          .bento-card:nth-child(2) > div:nth-child(3) > div > div:first-child { 
            display: none !important;
          }
          .bento-card:nth-child(2) > div:nth-child(3) > div > div:last-child { padding: 1.2rem !important; }
          .bento-card:nth-child(2) > div:nth-child(3) > div > div:last-child > div:first-child { font-size: 18px !important; margin-bottom: 0.5rem !important; }
          .bento-card:nth-child(2) > div:nth-child(3) > div > div:last-child > div:last-child { font-size: 13px !important; }
          .bento-card:nth-child(3) > div:nth-child(3) { margin: 2rem 0 1.5rem !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div {
            padding: 14px 16px !important;
            margin-bottom: 10px !important;
            border-radius: 16px !important;
            min-height: auto !important;
            height: auto !important;
          }
          .bento-card:nth-child(3) > div:nth-child(3) > div > div:first-child { width: 38px !important; height: 38px !important; border-radius: 12px !important; flex-shrink: 0 !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div > div:first-child [data-lucide] { width: 18px !important; height: 18px !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div > div:nth-child(2) { flex: 1 !important; min-width: 0 !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div > div:nth-child(2) > div:first-child { font-size: 13.5px !important; margin-bottom: 4px !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div > div:nth-child(2) > div:last-child { font-size: 12px !important; }
          .bento-card:nth-child(3) > div:nth-child(3) > div > svg { width: 18px !important; height: 18px !important; flex-shrink: 0 !important; }
          .bento-card:nth-child(4) > div:nth-child(3) { display: flex !important; justify-content: center !important; align-items: center !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div { 
            padding: 1.5rem 1.2rem !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child {
            margin-bottom: 1.2rem !important;
            gap: 10px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
          }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child > div:first-child { 
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
            flex-shrink: 0 !important;
          }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child > div:first-child svg { width: 20px !important; height: 20px !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child > div:last-child { flex: 1 !important; min-width: 0 !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child > div:last-child h3 { font-size: 15px !important; margin-bottom: 3px !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:first-child > div:last-child p { font-size: 11px !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) {
            padding: 12px 0 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) > div:first-child { 
            flex: 1 !important;
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) > div:first-child > div:first-child { font-size: 13px !important; margin-bottom: 3px !important; font-weight: 500 !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) > div:first-child > div:last-child { font-size: 11px !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) > div:last-child { width: 48px !important; height: 26px !important; flex-shrink: 0 !important; }
          .bento-card:nth-child(4) > div:nth-child(3) > div > div:not(:first-child) > div:last-child > div { width: 20px !important; height: 20px !important; top: 3px !important; }
          #use-cases > div > div:first-child { margin-bottom: clamp(3rem,8vw,6rem) !important; padding: 0 8px !important; }
          #use-cases > div > div:first-child h2 { font-size: clamp(32px,9vw,44px) !important; margin-bottom: 1.5rem !important; word-wrap: break-word !important; hyphens: auto !important; }
          #use-cases > div > div:first-child p { font-size: clamp(16px,4.5vw,19px) !important; padding: 0 4px !important; }
          .use-case-card { padding: 1.8rem 1.4rem !important; }
          .use-case-card > div:first-child { width: 58px !important; height: 58px !important; margin-bottom: 1.5rem !important; border-radius: 16px !important; }
          .use-case-card > div:first-child svg,
          .use-case-card > div:first-child [data-lucide] { width: 28px !important; height: 28px !important; }
          .use-case-card h3 { font-size: clamp(20px,5.5vw,26px) !important; margin-bottom: 1rem !important; }
          .use-case-card p { font-size: clamp(14px,4vw,17px) !important; line-height: 1.6 !important; }
        }
        @media (max-width: 640px) {
          .bento-card, .use-case-card { padding: 1.5rem 1.2rem !important; }
          section:first-of-type { padding: clamp(3rem,6vw,5rem) clamp(16px,4vw,24px) !important; }
          .bento-card > div:nth-child(3) > div { height: 280px !important; }
          #use-cases > div > div:first-child h2 { font-size: clamp(28px,8vw,36px) !important; }
        }
      `}</style>

      {/* Navbar - EXACT COPY from landing */}
      <header className="lml-nav" data-scrolled={scrolled ? "true" : "false"}>
        <div className="lml-wrap">
          <div className="lml-navin">
            <a href="/" className="lml-brand" onClick={(e) => onLink(e, "/")}>
              <span>wavy</span>
            </a>
            <nav className="lml-links" aria-label="Primary">
              <a href="#features" className="lml-link" onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>Features</a>
              <a href="/about" className="lml-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="lml-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="lml-navend">
              <a href="/auth" className="lml-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
              <button type="button" className="lml-menu" aria-label="Menu">
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(5rem,8vw,8rem) clamp(20px,4vw,60px) clamp(5rem,8vw,8rem)', textAlign: 'center' }}>
        <div style={{ marginBottom: '0.75rem', marginTop: '-1rem' }}>
          <img src="/roko.png" alt="Wavy" style={{ width: 'clamp(120px, 15vw, 200px)', height: 'auto' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(48px,7vw,84px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
          Everything you need to know about <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800, WebkitTextStroke: '0.5px #5e79db' }}>wavy</span>
        </h1>

        <p style={{ fontSize: 'clamp(18px,2.4vw,24px)', color: 'rgba(22,20,31,0.6)', maxWidth: 1000, margin: '0 auto', lineHeight: 1.6 }}>
          Wavy uses smart proximity technology to connect you with amazing local places, exclusive offers, and personalized rewards. Discover how our platform transforms the way you explore your neighborhood and earn benefits from the places you love.
        </p>
      </section>

      {/* Bento Grid - EXPANDED */}
      <section id="features" className="bento-section" style={{ maxWidth: 1700, margin: '0 auto', padding: 'clamp(5rem,8vw,8rem) clamp(20px,4vw,60px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 28 }}>
          
          {/* Card 1: Proximity - 7 cols */}
          <div className="bento-card" style={{ gridColumn: 'span 7', background: '#fafafa', borderRadius: 32, padding: 'clamp(2.5rem,4vw,4.5rem)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(22,20,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>PROXIMITY DISCOVERY</div>
            <h3 style={{ fontSize: 'clamp(28px,3.5vw,38px)', fontWeight: 500, marginBottom: 24, lineHeight: 1.25, letterSpacing: '-0.01em' }}>Find places around you instantly</h3>
            
            <div style={{ margin: '3rem 0 2.5rem', minHeight: 360, position: 'relative' }}>
              <div style={{ width: '100%', height: 360, background: 'linear-gradient(135deg,rgba(94,121,219,0.03),rgba(94,121,219,0.08))', borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
                {/* Grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right,rgba(94,121,219,0.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(94,121,219,0.08) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
                
                {/* User marker */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 68, height: 68, background: '#5e79db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 36px rgba(94,121,219,0.4)', zIndex: 10 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                {/* Places */}
                {[
                  { top: '15%', left: '22%', icon: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z', type: 'svg', label: 'Cafe · 45m' },
                  { bottom: '22%', left: '18%', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', type: 'svg', label: 'Restaurant · 130m' },
                  { top: '18%', right: '24%', icon: 'M9 18V5l12-2v13M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', type: 'svg', label: 'Concert · 210m' },
                  { bottom: '18%', right: '20%', type: 'icon', label: 'Gym · 95m' }
                ].map((place, i) => (
                  <div key={i} style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, ...{ top: place.top, bottom: place.bottom, left: place.left, right: place.right } }}>
                    <div style={{ width: 52, height: 52, background: '#5e79db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(94,121,219,0.25)' }}>
                      {place.type === 'icon' ? (
                        <Dumbbell size={24} color="white" strokeWidth={2} />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={place.icon} /></svg>
                      )}
                    </div>
                    <div style={{ background: 'white', padding: '6px 13px', borderRadius: 100, fontSize: 11, fontWeight: 600, boxShadow: '0 3px 12px rgba(0,0,0,0.1)' }}>{place.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>
              Wavy automatically detects your location and shows you the best places nearby—restaurants, cafes, events, and unique experiences. Real-time distance updates keep you informed as you move through your neighborhood, ensuring you never miss out on something special just around the corner.
            </p>
          </div>

          {/* Card 2: Rewards & Offers - 5 cols */}
          <div className="bento-card" style={{ gridColumn: 'span 5', background: '#fafafa', borderRadius: 32, padding: 'clamp(2.5rem,4vw,4.5rem)', border: '1px solid rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(22,20,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>REWARDS & OFFERS</div>
            <h3 style={{ fontSize: 'clamp(28px,3.5vw,38px)', fontWeight: 500, marginBottom: 24, lineHeight: 1.25 }}>Exclusive rewards near you</h3>
            
            <div style={{ margin: '3rem 0 2.5rem', position: 'relative' }}>
              <div style={{ 
                borderRadius: 28, 
                position: 'relative', 
                overflow: 'hidden', 
                minHeight: '420px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 48px rgba(0,0,0,0.08)',
                background: '#e0e7ff'
              }}>
                {/* Background image - using placeholder */}
                <img 
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=600&fit=crop"
                  alt="Rewards and Offers"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Subtle overlay gradient */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(94,121,219,0.15) 0%, rgba(94,121,219,0.4) 100%)'
                }} />
                
                {/* Content overlay at bottom */}
                <div style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '2.5rem',
                  background: 'linear-gradient(to top, rgba(22,20,31,0.9), transparent)',
                  color: 'white',
                  zIndex: 10
                }}>
                  <div style={{ 
                    fontSize: 'clamp(18px, 2.2vw, 24px)', 
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}>
                    50% Off Today
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(14px, 1.5vw, 16px)', 
                    opacity: 0.95,
                    lineHeight: 1.5,
                    textShadow: '0 1px 5px rgba(0,0,0,0.3)'
                  }}>
                    Get instant cashback at 500+ locations
                  </div>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>
              Discover exclusive offers and cashback rewards at nearby places. Get notified when you are close to businesses with active promotions just for you.
            </p>
          </div>

          {/* Card 3: Notifications - 5 cols */}
          <div className="bento-card" style={{ gridColumn: 'span 5', background: '#fafafa', borderRadius: 32, padding: 'clamp(2.5rem,4vw,4.5rem)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(22,20,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>SMART NOTIFICATIONS</div>
            <h3 style={{ fontSize: 'clamp(28px,3.5vw,38px)', fontWeight: 500, marginBottom: 24, lineHeight: 1.25 }}>Never miss an offer</h3>
            
            <div style={{ margin: '3rem 0 2.5rem' }}>
              {[
                { IconComponent: Percent, title: '50% off at Pizzeria Luna', subtitle: 'Valid until 8pm · 100m away' },
                { IconComponent: User, title: 'Gold Member Unlocked', subtitle: 'Get 10% extra rewards' },
                { IconComponent: Bell, title: 'Jazz Night Tonight', subtitle: 'Blue Note Cafe · 200m' }
              ].map((notif, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 20, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 6px 22px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(94,121,219,0.08)', color: '#5e79db', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <notif.IconComponent size={24} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{notif.title}</div>
                    <div style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)' }}>{notif.subtitle}</div>
                  </div>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(22,20,31,0.3)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              ))}
            </div>
            
            <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>
              Get personalized notifications when you're near places with active offers, events, or deals tailored to your preferences and location.
            </p>
          </div>

          {/* Card 4: Privacy - 7 cols */}
          <div className="bento-card" style={{ gridColumn: 'span 7', background: '#fafafa', borderRadius: 32, padding: 'clamp(2.5rem,4vw,4.5rem)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(22,20,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>PRIVACY & CONTROL</div>
            <h3 style={{ fontSize: 'clamp(28px,3.5vw,38px)', fontWeight: 500, marginBottom: 24, lineHeight: 1.25 }}>Your data stays yours</h3>
            
            <div style={{ margin: '3rem 0 2.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(94,121,219,0.08), rgba(184,197,224,0.12))', borderRadius: 28, padding: '3rem', boxShadow: '0 12px 40px rgba(94,121,219,0.12)', border: '1px solid rgba(94,121,219,0.15)', maxWidth: 600, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '3rem' }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(94,121,219,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5e79db' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 6, color: '#16141f' }}>Privacy Settings</h3>
                    <p style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', margin: 0 }}>Control your data</p>
                  </div>
                </div>
                
                {[
                  { label: 'Location sharing', sub: 'Only when app is open', active: true },
                  { label: 'Personalized offers', sub: 'Based on your preferences', active: true },
                  { label: 'Analytics', sub: 'Help improve Wavy', active: false }
                ].map((setting, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>{setting.label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)' }}>{setting.sub}</div>
                    </div>
                    <div style={{ width: 56, height: 32, background: setting.active ? '#5e79db' : '#e5e7eb', borderRadius: 100, position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                      <div style={{ position: 'absolute', top: 4, left: setting.active ? 28 : 4, width: 24, height: 24, background: 'white', borderRadius: '50%', transition: 'left 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>
              Full control over your location data and preferences. Share only what you want, when you want. Your information is never sold to third parties, and you can adjust your privacy settings at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases - EXPANDED */}
      <section id="use-cases" style={{ background: 'white', padding: 'clamp(10rem,14vw,16rem) clamp(20px,4vw,60px)' }}>
        <div style={{ maxWidth: 1700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(6rem,10vw,10rem)' }}>
            <h2 style={{ fontSize: 'clamp(44px,7vw,78px)', fontWeight: 400, marginBottom: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Built for every lifestyle</h2>
            <p style={{ fontSize: 'clamp(19px,2.4vw,26px)', color: 'rgba(22,20,31,0.6)' }}>Whether you explore daily or occasionally, Wavy adapts to how you discover and rewards your unique journey</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[
              { icon: 'M17 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z', type: 'svg', title: 'Morning Coffee Run', desc: 'You walk past a cafe. Your phone buzzes: "20% off if you order in the next hour." No app to open, no punch card to remember. Just walk in and order. That\'s it.' },
              { icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', type: 'svg', title: 'Weekend Plans', desc: 'Friday night, no plans. Open Wavy and see what\'s happening: live music at that bar you like, half-price cocktails at the new place, comedy show starts in 2 hours. Pick one and go.' },
              { type: 'icon', title: 'Your Usual Spots', desc: 'That gym you go to three times a week? You\'re earning points every time you check in. Enough points, they give you a free month. You didn\'t download anything or scan anything. It just happens.' }
            ].map((uc, i) => (
              <div 
                key={i} 
                className="use-case-card"
                style={{ 
                  background: '#fafafa', 
                  border: '1px solid rgba(0,0,0,0.04)', 
                  borderRadius: 28, 
                  padding: 'clamp(3rem,5vw,5rem) clamp(2.5rem,4vw,4rem)',
                  opacity: 0,
                  transform: 'translateY(40px)'
                }}
              >
                <div style={{ width: 76, height: 76, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.8rem', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                  {uc.type === 'icon' ? (
                    <Dumbbell size={36} color="#5e79db" strokeWidth={2} />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5e79db" strokeWidth="2"><path d={uc.icon} /></svg>
                  )}
                </div>
                <h3 style={{ fontSize: 'clamp(26px,3.2vw,32px)', fontWeight: 500, marginBottom: '1.4rem', letterSpacing: '-0.01em' }}>{uc.title}</h3>
                <p style={{ fontSize: 'clamp(17px,2vw,20px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - EXACT COPY from landing */}
      <footer className="lml-foot">
        <div className="lml-wrap">
          <div className="lml-footgrid">
            <div>
              <span className="lml-brand">wavy</span>
              <p className="lml-tagline">Discover places and offers around you. Everything you need to explore your neighborhood in one place.</p>
              <div className="lml-socials">
                <a href="https://x.com/wavy" aria-label="X" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />
                  </svg>
                </a>
                <a href="https://instagram.com/wavy.do" aria-label="Instagram" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="lml-col">
              <h4>Product</h4>
              <ul>
                <li><a href="/learn-more#features" onClick={(e) => onLink(e, "/learn-more#features")}>Features</a></li>
                <li><a href="/business" onClick={(e) => onLink(e, "/business")}>Business</a></li>
              </ul>
            </div>
            <div className="lml-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about" onClick={(e) => onLink(e, "/about")}>About</a></li>
                <li><a href="/careers" onClick={(e) => onLink(e, "/careers")}>Careers</a></li>
              </ul>
            </div>
            <div className="lml-col">
              <h4>Support</h4>
              <ul>
                <li><a href="/help" onClick={(e) => onLink(e, "/help")}>Help Center</a></li>
                <li><a href="/contact" onClick={(e) => onLink(e, "/contact")}>Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="lml-word" aria-hidden="true">wavy</div>
          <div className="lml-bar">
            <span>© 2024 Wavy. All rights reserved.</span>
            <nav aria-label="Legal">
              <a href="/privacy" onClick={(e) => onLink(e, "/privacy")}>Privacy</a>
              <a href="/terms" onClick={(e) => onLink(e, "/terms")}>Terms</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
