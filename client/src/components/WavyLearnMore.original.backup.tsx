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
      gsap.fromTo(".bento-card",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".bento-section", start: "top 70%" },
        }
      );

      gsap.fromTo(".feature-item",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ".features-section", start: "top 70%" },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const onLink = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/")) {
      e.preventDefault();
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
        
        /* CTA/Join styles */
        .lml-join { padding-bottom: clamp(20px,2.5vw,32px); }
        .lml-joinbox { position: relative; height: clamp(460px,42vw,560px); border-radius: 26px; overflow: hidden; isolation: isolate; background: radial-gradient(56% 50% at 50% 34%, rgba(94,121,219,0.3), transparent 72%), linear-gradient(180deg, #B8C5E0 0%, #8aa0f0 44%, #5e79db 76%); }
        .lml-joincopy { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); z-index: 4; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; color: white; }
        .lml-joincopy .lml-h2 { color: inherit; font-size: clamp(32px,4.5vw,52px); font-weight: 500; margin-bottom: 12px; letter-spacing: -0.02em; }
        .lml-joincopy p { margin-top: 12px; max-width: 42em; font-size: 14.5px; line-height: 1.5; opacity: .9; }
        .lml-form { display: flex; gap: 6px; width: min(100%,430px); margin-top: 24px; padding: 6px; border-radius: 999px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); box-shadow: 0 18px 40px -26px rgba(20,10,60,.5), inset 0 0 0 1px rgba(22,20,31,0.09); }
        .lml-form input { flex: 1; min-width: 0; padding: 0 16px; font-size: 14px; color: #16141f; background: transparent; border: none; }
        .lml-form input::placeholder { color: rgba(143,140,156,1); }
        .lml-form input:focus-visible { outline: none; }
        .lml-form:focus-within { box-shadow: 0 18px 40px -26px rgba(20,10,60,.5), inset 0 0 0 1.5px #5e79db; }
        .lml-form .lml-btn { background: #5e79db; color: white; height: 38px; padding: 0 20px; font-size: 13px; }
        .lml-formnote { min-height: 20px; margin-top: 10px; font-size: 12px; opacity: .85; }
        .lml-done { display: inline-flex; align-items: center; gap: 10px; margin-top: 24px; padding: 12px 20px; border-radius: 999px; background: white; color: #16141f; font-size: 14px; box-shadow: 0 18px 40px -26px rgba(20,10,60,.5); }
        
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

      {/* Navbar - EXACT COPY from landing */}
      <header className="lml-nav" data-scrolled={scrolled ? "true" : "false"}>
        <div className="lml-wrap">
          <div className="lml-navin">
            <a href="/" className="lml-brand" onClick={(e) => onLink(e, "/")}>
              <span>wavy</span>
            </a>
            <nav className="lml-links" aria-label="Primary">
              <a href="/#features" className="lml-link" onClick={(e) => onLink(e, "/#features")}>Features</a>
              <a href="/#use-cases" className="lml-link" onClick={(e) => onLink(e, "/#use-cases")}>Use Cases</a>
              <a href="/#faq" className="lml-link" onClick={(e) => onLink(e, "/#faq")}>FAQ</a>
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
      <section className="bento-section" style={{ maxWidth: 1700, margin: '0 auto', padding: 'clamp(5rem,8vw,8rem) clamp(20px,4vw,60px)' }}>
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

          {/* Card 2: Rewards - 5 cols */}
          <div className="bento-card" style={{ gridColumn: 'span 5', background: '#fafafa', borderRadius: 32, padding: 'clamp(2.5rem,4vw,4.5rem)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(22,20,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>REWARDS SYSTEM</div>
            <h3 style={{ fontSize: 'clamp(28px,3.5vw,38px)', fontWeight: 500, marginBottom: 24, lineHeight: 1.25 }}>Earn points automatically</h3>
            
            <div style={{ margin: '3rem 0 2.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(94,121,219,0.08), rgba(184,197,224,0.12))', borderRadius: 28, padding: '2.8rem', color: '#16141f', boxShadow: '0 18px 48px rgba(94,121,219,0.12)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(94,121,219,0.15)' }}>
                <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: 280, height: 280, background: 'rgba(94,121,219,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 8, fontWeight: 500 }}>Your Balance</div>
                  <div style={{ fontSize: 42, fontWeight: 700, marginBottom: '2.2rem', color: '#5e79db' }}>2,450 pts</div>
                  
                  {[
                    { name: 'Coffee Stop', points: '+50', time: '2 hours ago' },
                    { name: 'Gym Check-in', points: '+30', time: 'Yesterday' },
                    { name: 'Pizza Lunch', points: '+45', time: '3 days ago' }
                  ].map((tx, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '16px 20px', marginBottom: 14, border: '1px solid rgba(94,121,219,0.12)', boxShadow: '0 2px 8px rgba(94,121,219,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#16141f' }}>{tx.name}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#5e79db' }}>{tx.points}</span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6, color: '#16141f' }}>{tx.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>
              Every visit to participating places earns you points. Redeem for discounts, cashback, or exclusive perks. The more you explore, the more you save and earn.
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
      <section style={{ background: 'white', padding: 'clamp(10rem,14vw,16rem) clamp(20px,4vw,60px)' }}>
        <div style={{ maxWidth: 1700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(6rem,10vw,10rem)' }}>
            <h2 style={{ fontSize: 'clamp(44px,7vw,78px)', fontWeight: 400, marginBottom: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Built for every lifestyle</h2>
            <p style={{ fontSize: 'clamp(19px,2.4vw,26px)', color: 'rgba(22,20,31,0.6)' }}>Whether you explore daily or occasionally, Wavy adapts to how you discover and rewards your unique journey</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[
              { icon: 'M17 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z', type: 'svg', badge: 'Daily Explorer', title: 'Morning Coffee Run', desc: 'Get your daily caffeine fix while earning rewards automatically. Discover new cafes in your neighborhood, collect digital stamps with every purchase, and unlock free drinks at your favorite spots. Track your coffee journey and get personalized recommendations for new roasts and blends.' },
              { icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', type: 'svg', badge: 'Weekend Warrior', title: 'Weekend Adventures', desc: 'Plan your perfect weekend with curated recommendations for brunches, live music, art galleries, and hidden gems. Get exclusive weekend-only offers from top-rated places and early access to tickets for special events. Make the most of your free time with personalized itineraries.' },
              { type: 'icon', badge: 'Fitness Focused', title: 'Healthy Lifestyle', desc: 'Discover gyms, yoga studios, healthy restaurants, juice bars, and wellness centers in your area. Track your fitness check-ins, earn special wellness rewards, and find workout buddies at your favorite spots. Get nutrition tips and exclusive deals on health-focused products and services.' }
            ].map((uc, i) => (
              <div key={i} style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 28, padding: 'clamp(3rem,5vw,5rem) clamp(2.5rem,4vw,4rem)' }}>
                <div style={{ width: 76, height: 76, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.8rem', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                  {uc.type === 'icon' ? (
                    <Dumbbell size={36} color="#5e79db" strokeWidth={2} />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5e79db" strokeWidth="2"><path d={uc.icon} /></svg>
                  )}
                </div>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'rgba(94,121,219,0.8)', background: 'rgba(94,121,219,0.1)', padding: '8px 16px', borderRadius: 100, marginBottom: '2.2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{uc.badge}</span>
                <h3 style={{ fontSize: 'clamp(26px,3.2vw,32px)', fontWeight: 500, marginBottom: '1.4rem', letterSpacing: '-0.01em' }}>{uc.title}</h3>
                <p style={{ fontSize: 'clamp(17px,2vw,20px)', color: 'rgba(22,20,31,0.65)', lineHeight: 1.7 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Join section with email form */}
      <section className="lml-join">
        <div className="lml-wrap">
          <div className="lml-joinbox">
            {/* Background decoration similar to landing meadow */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              {/* Gradient layers to simulate meadow depth */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(138,160,240,0.4) 0%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%', background: 'linear-gradient(to top, rgba(94,121,219,0.5) 0%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to top, rgba(78,102,189,0.6) 0%, transparent 100%)' }} />
              
              {/* Decorative dots to simulate flowers/texture */}
              {Array.from({ length: 80 }).map((_, i) => {
                const left = Math.random() * 100;
                const bottom = Math.random() * 35;
                const size = 2 + Math.random() * 4;
                const opacity = 0.3 + Math.random() * 0.4;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      bottom: `${bottom}%`,
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.6)',
                      opacity,
                      boxShadow: `0 0 ${size * 2}px rgba(255,255,255,0.4)`
                    }}
                  />
                );
              })}
              
              {/* Larger accent circles (coins) */}
              <div style={{ position: 'absolute', left: '14%', bottom: '12%', width: 'clamp(80px,11vw,150px)', height: 'clamp(80px,11vw,150px)', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(184,197,224,0.7))', boxShadow: '0 8px 32px rgba(94,121,219,0.4)' }} />
              <div style={{ position: 'absolute', right: '18%', bottom: '10%', width: 'clamp(70px,9vw,120px)', height: 'clamp(70px,9vw,120px)', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(184,197,224,0.65))', boxShadow: '0 8px 32px rgba(94,121,219,0.4)' }} />
            </div>
            
            <div className="lml-joincopy">
              <h2 className="lml-h2">Ready to explore?</h2>
              <p>Join thousands of people discovering amazing places nearby</p>
              {joinState === 'done' ? (
                <div className="lml-done" role="status">
                  <img src="/roko.png" alt="" style={{ width: 40, height: 40 }} />
                  Thanks! Check your inbox.
                </div>
              ) : (
                <>
                  <form className="lml-form" data-state={joinState} noValidate onSubmit={handleSubmit}>
                    <label htmlFor="join-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Email address</label>
                    <input
                      ref={emailRef}
                      id="join-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      aria-invalid={joinNote ? true : undefined}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (joinNote) setJoinNote('');
                      }}
                    />
                    <button type="submit" className="lml-btn" disabled={joinState === 'sending'}>
                      {joinState === 'sending' ? 'Sending...' : 'Get Started'}
                    </button>
                  </form>
                  {joinNote && <p className="lml-formnote" data-state={joinNote ? 'error' : 'idle'} aria-live="polite">{joinNote}</p>}
                </>
              )}
            </div>
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
                <a href="https://github.com/wavy" aria-label="GitHub" target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M12 1.5a10.5 10.5 0 0 0-3.3 20.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.7 1.1 1.7 1.1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10.5 10.5 0 0 0 12 1.5Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="lml-col">
              <h4>Product</h4>
              <ul>
                <li><a href="/#features" onClick={(e) => onLink(e, "/#features")}>Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>
            <div className="lml-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>
            <div className="lml-col">
              <h4>Support</h4>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/docs">Documentation</a></li>
                <li><a href="/status">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="lml-word" aria-hidden="true">wavy</div>
          <div className="lml-bar">
            <span>© 2024 Wavy. All rights reserved.</span>
            <nav aria-label="Legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/cookies">Cookies</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
