import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Timeline from '../components/landing/Timeline';

export default function CleanHome() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        :root {
          --color-paper: #ffffff;
          --color-ink: #000000;
          --color-quiet-graphite: #595959;
          --color-soft-gray: #919191;
          --color-oat-surface: #f7f4f1;
          --color-ledger-brown: #3b281d;
          --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
          --spacing-unit: 4px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: var(--color-paper);
          color: var(--color-ink);
          font-family: var(--font-inter);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 54px;
          background: var(--color-paper);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s ease;
        }

        .nav.scrolled {
          border-bottom-color: var(--color-oat-surface);
        }

        .nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink);
          text-decoration: none;
        }

        .nav-logo {
          width: 32px;
          height: 32px;
        }

        .nav-links {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .nav-link {
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.32px;
          color: var(--color-ink);
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .nav-link:hover {
          background: var(--color-oat-surface);
        }

        .btn-pill {
          padding: 10px 24px;
          background: var(--color-ledger-brown);
          color: var(--color-paper);
          border: none;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-pill:hover {
          transform: translateY(-1px);
        }

        /* Hero */
        .hero {
          padding: 140px 40px 100px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-content {
          max-width: 800px;
        }

        .eyebrow {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: 0.39px;
          text-transform: uppercase;
          color: var(--color-quiet-graphite);
          margin-bottom: 32px;
        }

        .display {
          font-size: clamp(42px, 6vw, 82px);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.029em;
          color: var(--color-ink);
          margin-bottom: 32px;
        }

        .lede {
          font-size: 16px;
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: -0.4px;
          color: var(--color-quiet-graphite);
          max-width: 600px;
          margin-bottom: 40px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 16px 32px;
          background: var(--color-ledger-brown);
          color: var(--color-paper);
          border: none;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .btn-secondary {
          padding: 16px 32px;
          background: var(--color-oat-surface);
          color: var(--color-ink);
          border: none;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.2;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #ebe8e5;
        }

        /* Hero Image */
        .hero-media {
          margin-top: 80px;
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 2/1;
          background: var(--color-oat-surface);
        }

        .hero-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Section */
        .section {
          padding: 120px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 80px;
        }

        .section-heading {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--color-ink);
          margin-bottom: 20px;
        }

        .section-description {
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: -0.4px;
          color: var(--color-quiet-graphite);
        }

        /* Product Grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .product-card {
          background: var(--color-oat-surface);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-4px);
        }

        .product-image {
          aspect-ratio: 1;
          background: var(--color-paper);
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-content {
          padding: 32px;
        }

        .product-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.11px;
          text-transform: uppercase;
          color: var(--color-quiet-graphite);
          margin-bottom: 16px;
        }

        .product-title {
          font-size: 18px;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.4px;
          color: var(--color-ink);
          margin-bottom: 8px;
        }

        .product-description {
          font-size: 14px;
          line-height: 1.4;
          color: var(--color-quiet-graphite);
        }

        /* Split Section */
        .split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .split-text h2 {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .split-text p {
          font-size: 16px;
          line-height: 1.5;
          letter-spacing: -0.4px;
          color: var(--color-quiet-graphite);
          margin-bottom: 20px;
        }

        .split-image {
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        .split-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .expandable {
          margin-top: 24px;
          padding: 20px 0;
          border-top: 1px solid var(--color-oat-surface);
        }

        .expandable summary {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-ink);
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .expandable summary::before {
          content: '→';
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .expandable[open] summary::before {
          transform: rotate(90deg);
        }

        .expandable-content {
          margin-top: 16px;
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-quiet-graphite);
        }

        /* FAQ */
        .faq-list {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          gap: 8px;
        }

        .faq-item {
          background: var(--color-paper);
          border: 1px solid var(--color-oat-surface);
          border-radius: 16px;
          padding: 28px 32px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-item:hover {
          border-color: #e0ddd9;
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          font-size: 18px;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.4px;
        }

        .faq-arrow {
          flex-shrink: 0;
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .faq-item.open .faq-arrow {
          transform: rotate(90deg);
        }

        .faq-answer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--color-oat-surface);
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-quiet-graphite);
          display: none;
        }

        .faq-item.open .faq-answer {
          display: block;
        }

        /* Footer */
        .footer {
          background: var(--color-ledger-brown);
          color: var(--color-paper);
          padding: 80px 40px 40px;
        }

        .footer-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo-block {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-logo {
          width: 32px;
          height: 32px;
          filter: brightness(0) invert(1);
        }

        .footer-tagline {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255,255,255,0.7);
          max-width: 340px;
        }

        .footer-column h4 {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.11px;
          margin-bottom: 20px;
          color: rgba(255,255,255,0.9);
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: var(--color-paper);
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: 1fr;
          }

          .split-section {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .nav-links {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 20px 60px;
          }

          .section {
            padding: 80px 20px;
          }

          .nav-inner {
            padding: 0 20px;
          }

          .footer {
            padding: 60px 20px 30px;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <img src="/roko.png" alt="Wavy" className="nav-logo" />
            <span>Wavy</span>
          </a>
          
          <div className="nav-links">
            <a href="#products" className="nav-link">Products</a>
            <a href="#science" className="nav-link">Science</a>
            <a href="#about" className="nav-link">About</a>
            <button className="btn-pill" onClick={() => setLocation('/auth')}>
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">For the days you live in</div>
          <h1 className="display">
            Daily supplements & hand care. Daily haircare, bergamot & vanilla.
          </h1>
          <p className="lede">
            Three everyday-care products: Probiotics, Hand Lotion and Hair Growth, 
            a hair supplement. Explore each product separately to find the details 
            that matter to you.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setLocation('/explore')}>
              Shop
            </button>
            <button className="btn-secondary" onClick={() => setLocation('/business')}>
              Science
            </button>
          </div>
        </div>

        <div className="hero-media">
          <img 
            src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1600&q=80" 
            alt="Wavy products" 
          />
        </div>
      </section>

      {/* Products */}
      <section className="section" id="products">
        <div className="section-header">
          <div className="eyebrow">Out</div>
          <h2 className="section-heading">Probiotics</h2>
          <p className="section-description">
            Lockdanthus & Blikibokerien calcarea.
          </p>
        </div>

        <div className="product-grid">
          <div className="product-card" onClick={() => setLocation('/explore')}>
            <div className="product-image">
              <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80" alt="Probiotics" />
            </div>
            <div className="product-content">
              <div className="product-label">Out</div>
              <h3 className="product-title">Probiotics</h3>
              <p className="product-description">
                Lockdanthus & Blikibokerien calcarea. $38
              </p>
            </div>
          </div>

          <div className="product-card" onClick={() => setLocation('/explore')}>
            <div className="product-image">
              <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80" alt="Hand Lotion" />
            </div>
            <div className="product-content">
              <div className="product-label">Hands</div>
              <h3 className="product-title">Hand Lotion</h3>
              <p className="product-description">
                Daily hand care. Bergamot & Vanilla. $32
              </p>
            </div>
          </div>

          <div className="product-card" onClick={() => setLocation('/explore')}>
            <div className="product-image">
              <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80" alt="Hair Growth" />
            </div>
            <div className="product-content">
              <div className="product-label">Hair</div>
              <h3 className="product-title">Hair Growth</h3>
              <p className="product-description">
                A daily hair supplement for men. $44
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Know what goes in */}
      <section className="section" id="science">
        <div className="split-section">
          <div className="split-text">
            <h2>Know what goes in.</h2>
            <p>
              An ingredient name is only the beginning. The amount, the formula 
              and the research matter too.
            </p>
            <p>
              Research on one ingredient doesn't establish what a finished product 
              can do. We keep that clear.
            </p>
            
            <details className="expandable">
              <summary>Why the ingredients?</summary>
              <div className="expandable-content">
                Research on one ingredient doesn't establish what a finished 
                product can do. We keep the record clear.
              </div>
            </details>

            <details className="expandable">
              <summary>Why the contaminants?</summary>
              <div className="expandable-content">
                We test each batch to make sure it meets our purity and quality standards.
              </div>
            </details>

            <details className="expandable">
              <summary>What do you expect?</summary>
              <div className="expandable-content">
                Real results, backed by science, without exaggerated promises.
              </div>
            </details>
          </div>

          <div className="split-image">
            <img 
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80" 
              alt="Quality ingredients" 
            />
          </div>
        </div>
      </section>

      {/* A few things */}
      <section className="section">
        <div className="split-section">
          <div className="split-image">
            <img 
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80" 
              alt="Products" 
            />
          </div>

          <div className="split-text">
            <h2>A few things. Chosen with care.</h2>
            <p>
              We're building a small range around three parts of daily care: 
              products, hair supplements and hand lotion.
            </p>
            <p>
              For us, the details matter: what's in a formula, how it's used 
              and how clearly we explain it. You should be able to understand 
              a product before deciding if it deserves a place in your routine.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <Timeline
        title="Product Story"
        periodLabel="2020-2024"
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
        imageAlt="Wavy Journey"
        textColor="#000000"
        mutedTextColor="#595959"
        activeColor="#000000"
        backgroundColor="#ffffff"
        topItems={[
          { id: "2020-march", year: "2020", month: "March", content: "Signal research turns scattered notes into a clear product thesis" },
          { id: "2021-july", year: "2021", month: "July", content: "Founding release ships with the first live customer journeys" },
          { id: "2023-april", year: "2023", month: "April", content: "Automation layer connects insight, publishing, and sales motion" },
        ]}
        bottomItems={[
          { id: "2020-november", year: "2020", month: "November", content: "Prototype sprint validates the experience with real operators" },
          { id: "2022-october", year: "2022", month: "October", content: "Community feedback reshapes the roadmap into sharper releases" },
        ]}
      />

      {/* FAQ */}
      <section className="section">
        <div className="section-header">
          <div className="eyebrow">Questions</div>
          <h2 className="section-heading">
            You might have a few questions now.
          </h2>
          <p className="section-description">
            About the range, the label and your order.
          </p>
        </div>

        <div className="faq-list">
          {[
            {
              id: 'faq-1',
              q: "What's in the 'Wavedash' range?",
              a: "Three everyday-care products: Probiotics, Hand Lotion and Hair Growth, a hair supplement. Explore each product separately to find the details that matter to you."
            },
            {
              id: 'faq-2',
              q: "Where should I look for ingredient details?",
              a: "Each product page has a complete ingredients section, including amounts, sources and supporting studies."
            },
            {
              id: 'faq-3',
              q: "How do I use and store my product?",
              a: "Clear instructions come with each product. Generally, keep in a cool, dry place, away from direct sunlight."
            },
            {
              id: 'faq-4',
              q: "Is shipping free?",
              a: "Yes, free shipping on orders over $50. Delivery in 3-5 business days."
            },
            {
              id: 'faq-5',
              q: "Can I cancel Hair Growth today?",
              a: "You can cancel your subscription anytime from your account."
            },
            {
              id: 'faq-6',
              q: "Where can I learn more before choosing?",
              a: "Visit our Science section for detailed studies and explanations of each ingredient."
            }
          ].map((faq) => (
            <div 
              key={faq.id}
              className={`faq-item ${expandedFaq === faq.id ? 'open' : ''}`}
              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-arrow">→</span>
              </div>
              <div className="faq-answer">
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-block">
              <img src="/roko.png" alt="Wavy" className="footer-logo" />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Wavy</span>
            </div>
            <p className="footer-tagline">
              Good things, occasionally. Receive new weekends, new additions 
              and things we can send you by family, A-address welcome.
            </p>
          </div>

          <div className="footer-column">
            <h4>Shop</h4>
            <div className="footer-links">
              <a href="/explore" className="footer-link">Science</a>
              <a href="/benefits" className="footer-link">Shipping & returns</a>
              <a href="/events" className="footer-link">About</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <div className="footer-links">
              <a href="/support" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Shipping & returns</a>
              <a href="#" className="footer-link">Instagram</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>About</h4>
            <div className="footer-links">
              <a href="/about" className="footer-link">About</a>
              <a href="/terms" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Privacy</a>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 'clamp(36px,5vw,56px)', fontSize: 'clamp(72px,17vw,232px)', fontWeight: 500, lineHeight: 0.82, letterSpacing: '-0.06em', textAlign: 'center', color: 'transparent', background: 'linear-gradient(180deg,rgba(0,0,0,0.02) 0%,transparent 92%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', userSelect: 'none', whiteSpace: 'nowrap' }}>wavy</div>

        <div className="footer-bottom">
          <span>© 2027 Wavy</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="footer-link">Privacy</a>
            <a href="/terms" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
