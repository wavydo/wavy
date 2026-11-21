import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BusinessPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    businessType: '',
    monthlyVisitors: '',
    message: ''
  });
  const [formState, setFormState] = useState<'idle' | 'sending' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero content
      gsap.fromTo('.business-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      
      gsap.fromTo('.business-hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      // Animate form
      gsap.fromTo('.business-form',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.business-form', start: 'top 80%' }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.company) {
      setErrorMessage('Please fill in all required fields');
      setFormState('error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      setFormState('error');
      return;
    }

    setFormState('sending');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormState('success');
      setFormData({ name: '', email: '', company: '', phone: '', businessType: '', monthlyVisitors: '', message: '' });
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
      setFormState('error');
    }
  };

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .pricing-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .pricing-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .pricing-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .pricing-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .pricing-links { display: flex; gap: 6px; }
        .pricing-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .pricing-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .pricing-navend { display: flex; align-items: center; gap: 8px; }
        .pricing-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; border: none; cursor: pointer; }
        .pricing-btn:hover { transform: translateY(-1px); }
        .pricing-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pricing-input { width: 100%; padding: 16px 20px; border: 2px solid rgba(0,0,0,0.08); border-radius: 12px; font-size: 15px; font-family: inherit; transition: all 0.2s; }
        .pricing-input:focus { outline: none; border-color: #5e79db; box-shadow: 0 0 0 4px rgba(94,121,219,0.1); }
        .pricing-textarea { width: 100%; padding: 16px 20px; border: 2px solid rgba(0,0,0,0.08); border-radius: 12px; font-size: 15px; font-family: inherit; resize: vertical; min-height: 120px; transition: all 0.2s; }
        .pricing-textarea:focus { outline: none; border-color: #5e79db; box-shadow: 0 0 0 4px rgba(94,121,219,0.1); }
        .pricing-select { width: 100%; padding: 16px 20px; border: 2px solid rgba(0,0,0,0.08); border-radius: 12px; font-size: 15px; font-family: inherit; background: white; cursor: pointer; transition: all 0.2s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2316141f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 20px center; padding-right: 48px; }
        .pricing-select:focus { outline: none; border-color: #5e79db; box-shadow: 0 0 0 4px rgba(94,121,219,0.1); }
        .pricing-select option { padding: 12px; }
        @media (max-width: 860px) {
          .pricing-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="pricing-nav">
        <div className="pricing-wrap">
          <div className="pricing-navin">
            <a href="/" className="pricing-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="pricing-links" aria-label="Primary">
              <a href="/learn-more" className="pricing-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="pricing-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="pricing-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="pricing-navend">
              <a href="/auth" className="pricing-btn" onClick={(e) => onLink(e, "/auth")}>Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', padding: 'clamp(3rem,5vw,5rem) clamp(20px,4vw,60px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="business-hero-title" style={{ fontSize: 'clamp(48px,7vw,72px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Flexible <span style={{ color: '#5e79db', fontFamily: "'Modulus', -apple-system, sans-serif", fontWeight: 800, WebkitTextStroke: '0.5px #5e79db' }}>pricing</span> for your business
          </h1>
          <p className="business-hero-subtitle" style={{ fontSize: 'clamp(18px,2.2vw,22px)', color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto' }}>
            We offer customized pricing plans tailored to your business needs. Tell us about your business and we'll create the perfect plan for you.
          </p>
        </div>
      </section>

      {/* Request Pricing Form */}
      <section style={{ padding: '0 clamp(20px,4vw,60px) clamp(4rem,6vw,6rem)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {formState === 'success' ? (
            <div style={{ 
              background: 'white', 
              borderRadius: 24, 
              padding: 'clamp(3rem,5vw,4rem)', 
              textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'rgba(16,185,129,0.1)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 500, marginBottom: '1rem' }}>Request received!</h3>
              <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Thank you for your interest. Our team will review your information and send you a customized pricing proposal within 24 hours.
              </p>
              <button
                onClick={() => setFormState('idle')}
                style={{
                  background: '#5e79db',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="business-form" style={{ background: 'white', borderRadius: 24, padding: 'clamp(2.5rem,4vw,3.5rem)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'grid', gap: 24 }}>
                {/* Row 1: Name and Company */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="pricing-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Company Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="pricing-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Company Inc."
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Email and Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="pricing-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="pricing-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Row 3: Two Dropdowns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Business Type
                    </label>
                    <select
                      className="pricing-select"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    >
                      <option value="">Select your business type</option>
                      <option value="restaurant">Restaurant / Cafe</option>
                      <option value="retail">Retail Store</option>
                      <option value="fitness">Gym / Fitness Center</option>
                      <option value="entertainment">Entertainment Venue</option>
                      <option value="services">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Expected Monthly Visitors
                    </label>
                    <select
                      className="pricing-select"
                      value={formData.monthlyVisitors}
                      onChange={(e) => setFormData({ ...formData, monthlyVisitors: e.target.value })}
                    >
                      <option value="">Select visitor range</option>
                      <option value="0-100">0 - 100</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000+">5,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Additional Information
                  </label>
                  <textarea
                    className="pricing-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your specific needs, number of locations, or any special requirements..."
                  />
                </div>

                {formState === 'error' && errorMessage && (
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(239,68,68,0.1)', 
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 12, 
                    color: '#dc2626',
                    fontSize: 14,
                    fontWeight: 500
                  }}>
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === 'sending'}
                  style={{
                    background: formState === 'sending' ? '#9ca3af' : '#16141f',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: 100,
                    fontSize: 16,
                    fontWeight: 600,
                    border: 'none',
                    cursor: formState === 'sending' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (formState !== 'sending') {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(22,20,31,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {formState === 'sending' ? 'Sending...' : 'Request Pricing Information'}
                </button>

                <p style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', textAlign: 'center', margin: 0 }}>
                  By submitting this form, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          )}
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
