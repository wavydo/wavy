import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Privacy() {
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
        .privacy-nav { position: sticky; top: 0; z-index: 40; padding: 20px 0; background: color-mix(in oklab, #f3f3f6 80%, transparent); backdrop-filter: blur(14px) saturate(1.3); box-shadow: 0 1px 0 rgba(0,0,0,0.06); }
        .privacy-wrap { max-width: 1920px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 60px); }
        .privacy-navin { display: flex; justify-content: space-between; align-items: center; height: 48px; }
        .privacy-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #16141f; font-family: 'Modulus', -apple-system, sans-serif; -webkit-text-stroke: 0.5px #16141f; text-decoration: none; }
        .privacy-links { display: flex; gap: 6px; }
        .privacy-link { position: relative; padding: 8px 12px; border-radius: 999px; font-size: 13px; color: #16141f; opacity: 0.82; transition: opacity .2s, background-color .25s; text-decoration: none; }
        .privacy-link:hover { opacity: 1; background: color-mix(in oklab, #16141f 6%, transparent); }
        .privacy-navend { display: flex; align-items: center; gap: 8px; }
        .privacy-btn { background: #16141f; color: white; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
        .privacy-btn:hover { transform: translateY(-1px); }
        @media (max-width: 860px) {
          .privacy-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="privacy-nav">
        <div className="privacy-wrap">
          <div className="privacy-navin">
            <a href="/" className="privacy-brand" onClick={(e) => onLink(e, "/")}>wavy</a>
            <nav className="privacy-links" aria-label="Primary">
              <a href="/learn-more" className="privacy-link" onClick={(e) => onLink(e, "/learn-more")}>Features</a>
              <a href="/about" className="privacy-link" onClick={(e) => onLink(e, "/about")}>About us</a>
              <a href="/contact" className="privacy-link" onClick={(e) => onLink(e, "/contact")}>Contact</a>
            </nav>
            <div className="privacy-navend">
              <a href="/auth" onClick={(e) => onLink(e, "/auth")} className="privacy-btn">Get Started</a>
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(22,20,31,0.6)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ lineHeight: 1.8, color: '#16141f' }}>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>1. Introduction</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              At Wavy, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              By using Wavy, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>2. Information We Collect</h2>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Personal Information</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We collect personal information that you provide directly to us when you:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Create an account (name, email address, phone number)</li>
              <li style={{ marginBottom: '0.5rem' }}>Update your profile information</li>
              <li style={{ marginBottom: '0.5rem' }}>Communicate with us through customer support</li>
              <li style={{ marginBottom: '0.5rem' }}>Participate in surveys or promotions</li>
            </ul>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Location Data</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Our service relies on location data to provide proximity-based features. We collect:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Precise location data (GPS coordinates) when you use the app</li>
              <li style={{ marginBottom: '0.5rem' }}>Approximate location based on IP address</li>
              <li style={{ marginBottom: '0.5rem' }}>Location history when you interact with establishments</li>
            </ul>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Usage Data</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We automatically collect certain information about your device and how you interact with our service:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Device information (model, operating system, unique identifiers)</li>
              <li style={{ marginBottom: '0.5rem' }}>App usage data (features accessed, time spent, interactions)</li>
              <li style={{ marginBottom: '0.5rem' }}>Log data (IP address, browser type, access times)</li>
              <li style={{ marginBottom: '0.5rem' }}>Crash reports and performance diagnostics</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We use the information we collect to:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Provide, maintain, and improve our services</li>
              <li style={{ marginBottom: '0.5rem' }}>Show you nearby establishments and personalized offers</li>
              <li style={{ marginBottom: '0.5rem' }}>Process transactions and send related information</li>
              <li style={{ marginBottom: '0.5rem' }}>Send you technical notices, updates, and support messages</li>
              <li style={{ marginBottom: '0.5rem' }}>Respond to your comments, questions, and requests</li>
              <li style={{ marginBottom: '0.5rem' }}>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li style={{ marginBottom: '0.5rem' }}>Analyze usage patterns to improve user experience</li>
              <li style={{ marginBottom: '0.5rem' }}>Send promotional communications (with your consent)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>4. Information Sharing and Disclosure</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>With Establishments</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              When you redeem an offer or check in at an establishment, we share necessary information (such as your name and redemption details) to facilitate the transaction.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Service Providers</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We work with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Legal Requirements</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We may disclose your information if required by law or in response to valid requests by public authorities.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Business Transfers</h3>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              If Wavy is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>5. Data Security</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Encryption of data in transit and at rest</li>
              <li style={{ marginBottom: '0.5rem' }}>Regular security assessments and updates</li>
              <li style={{ marginBottom: '0.5rem' }}>Access controls and authentication measures</li>
              <li style={{ marginBottom: '0.5rem' }}>Secure data storage practices</li>
            </ul>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>6. Your Privacy Rights</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Access:</strong> Request access to your personal information</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Objection:</strong> Object to processing of your personal information</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Restriction:</strong> Request restriction of processing</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              To exercise these rights, please contact us at privacy@wavy.com. We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>7. Location Data Controls</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              You can control location permissions through your device settings. Please note that:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Disabling location services will limit core functionality of the app</li>
              <li style={{ marginBottom: '0.5rem' }}>You can choose "While Using the App" or "Always" permissions</li>
              <li style={{ marginBottom: '0.5rem' }}>We only access location when necessary to provide our services</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>8. Children's Privacy</h2>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately and we will delete such information.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>9. Cookies and Tracking Technologies</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. Types of cookies we use:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Essential Cookies:</strong> Necessary for the service to function</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Analytics Cookies:</strong> Help us understand how users interact with our service</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some features of our service.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>10. Data Retention</h2>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal, regulatory, or security purposes.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>11. International Data Transfers</h2>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Your information may be transferred to and maintained on servers located outside of your country where data protection laws may differ. By using our service, you consent to the transfer of your information to these locations. We take steps to ensure your data receives adequate protection.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>12. Changes to This Privacy Policy</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul style={{ marginLeft: '2rem', marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              <li style={{ marginBottom: '0.5rem' }}>Posting the new Privacy Policy on this page</li>
              <li style={{ marginBottom: '0.5rem' }}>Updating the "Last updated" date</li>
              <li style={{ marginBottom: '0.5rem' }}>Sending you an email notification for material changes</li>
            </ul>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              We encourage you to review this Privacy Policy periodically. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>13. Contact Us</h2>
            <p style={{ marginBottom: '1rem', color: 'rgba(22,20,31,0.8)' }}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <p style={{ color: 'rgba(22,20,31,0.8)' }}>
              Email: privacy@wavy.com<br />
              Phone: +1 809 504 2837<br />
              Address: Wavy Privacy Team
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
