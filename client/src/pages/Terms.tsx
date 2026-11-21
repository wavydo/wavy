import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Terms() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onLink = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/")) {
      e.preventDefault();
      window.scrollTo(0, 0);
      setLocation(href);
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#fff', color: '#16141f' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .terms-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .terms-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .terms-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .terms-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .terms-links { display: flex; gap: 6px; }
        .terms-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .terms-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .terms-navend { display: flex; align-items: center; gap: 8px; }
        .terms-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .terms-btn:hover { transform: translateY(-1px); }
        @media (max-width: 860px) {
          .terms-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="terms-nav">
        <div className="terms-wrap">
          <div className="terms-navin">
            <a href="/" className="terms-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="terms-links" aria-label="Primary">
              <a href="/learn-more" className="terms-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="terms-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="terms-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="terms-navend">
              <a href="/auth" onClick={(e) => onLink(e, "/auth")} className="terms-btn">Get Started</a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem 6rem 2rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontFamily: "'Modulus', -apple-system, sans-serif",
            fontSize: 48, 
            fontWeight: 800, 
            color: '#16141f',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ lineHeight: 1.8, color: '#16141f' }}>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              By accessing or using Wavy's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              These terms apply to all users of the service, including users who are also contributors of content, information, and other materials or services on the platform.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>2. Description of Service</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Wavy is a proximity-based rewards platform that connects users with nearby establishments offering exclusive deals, promotions, and experiences. Our service includes mobile applications, web applications, and related technology.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice. We will not be liable to you or any third party should we exercise this right.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>3. User Accounts</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              To access certain features of the service, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              You are responsible for safeguarding your account credentials and for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We reserve the right to refuse service, terminate accounts, or remove or edit content in our sole discretion.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>4. Privacy and Location Data</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Our service requires access to your location data to provide proximity-based recommendations. By using Wavy, you consent to the collection and use of your location information as described in our Privacy Policy.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              You can control location permissions through your device settings. However, disabling location services may limit or prevent access to certain features of our service.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>5. User Conduct</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              You agree not to use the service to:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Violate any applicable laws or regulations</li>
              <li style={{ marginBottom: '0.5rem' }}>Infringe upon the rights of others</li>
              <li style={{ marginBottom: '0.5rem' }}>Transmit any harmful, offensive, or objectionable content</li>
              <li style={{ marginBottom: '0.5rem' }}>Attempt to gain unauthorized access to our systems or networks</li>
              <li style={{ marginBottom: '0.5rem' }}>Interfere with or disrupt the service or servers</li>
              <li style={{ marginBottom: '0.5rem' }}>Use automated systems to access the service without authorization</li>
              <li style={{ marginBottom: '0.5rem' }}>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>6. Rewards and Offers</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Rewards, deals, and offers displayed on Wavy are provided by third-party establishments. Wavy acts as a platform to connect users with these offers but is not responsible for their fulfillment, quality, or availability.
            </p>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Offers may be subject to additional terms and conditions set by the establishments. Users must comply with such terms when redeeming offers.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We reserve the right to modify or cancel any rewards program at any time. Accumulated points or rewards may expire according to the terms of each specific program.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>7. Intellectual Property</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              All content, features, and functionality of the service, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the property of Wavy or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from our service without our express written permission.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>8. Third-Party Services</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Our service may contain links to third-party websites or services that are not owned or controlled by Wavy. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              You acknowledge and agree that Wavy shall not be responsible or liable for any damage or loss caused by or in connection with your use of any such third-party content or services.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>9. Disclaimers</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              The service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. Wavy does not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We make no representations or warranties about the accuracy, reliability, completeness, or timeliness of any content provided through the service.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>10. Limitation of Liability</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              To the maximum extent permitted by law, Wavy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Our total liability to you for all claims arising from or relating to the service shall not exceed the amount you paid to us in the twelve months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>11. Indemnification</h2>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              You agree to indemnify, defend, and hold harmless Wavy and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the service, your violation of these terms, or your violation of any rights of another.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>12. Changes to Terms</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Your continued use of the service after any changes constitutes your acceptance of the new terms. If you do not agree to the revised terms, you must stop using the service.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>13. Governing Law</h2>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Wavy is registered, without regard to its conflict of law provisions.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>14. Contact Information</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Email: legal@wavy.com<br />
              Phone: +1 809 504 2837
            </p>
          </section>
        </div>
      </div>

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
              <a href="/privacy" onClick={(e) => onLink(e, "/privacy")} style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" onClick={(e) => onLink(e, "/terms")} style={{ color: 'rgba(22,20,31,0.5)', textDecoration: 'none' }}>Terms</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
