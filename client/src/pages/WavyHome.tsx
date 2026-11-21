import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import Timeline from '../components/landing/Timeline';

export default function WavyHome() {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="wavy-root">
      <style>{`
        .wavy-root {
          --wavy-bg: #fafaf9;
          --wavy-card: #ffffff;
          --wavy-text: #1c1917;
          --wavy-soft: #78716c;
          --wavy-line: rgba(0,0,0,0.08);
          --wavy-accent: #0a0a0a;
          position: relative;
          min-height: 100vh;
          background: var(--wavy-bg);
          color: var(--wavy-text);
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Navigation */
        .wavy-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 12px 0;
          transition: all 0.35s ease;
          background: transparent;
        }
        
        .wavy-nav.scrolled {
          background: rgba(250, 250, 249, 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 1px 0 var(--wavy-line);
        }
        
        .wavy-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
        }
        
        .wavy-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: var(--wavy-text);
          letter-spacing: -0.02em;
        }
        
        .wavy-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }
        
        .wavy-nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .wavy-nav-link {
          padding: 8px 14px;
          font-size: 14px;
          color: var(--wavy-text);
          opacity: 0.75;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .wavy-nav-link:hover {
          opacity: 1;
          background: rgba(0,0,0,0.04);
        }
        
        .wavy-btn {
          padding: 10px 20px;
          background: var(--wavy-accent);
          color: white;
          border: none;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .wavy-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -4px rgba(0,0,0,0.2);
        }

        /* Hero */
        .wavy-hero {
          padding: 140px clamp(20px, 4vw, 60px) 100px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .wavy-hero-content {
          max-width: 900px;
        }

        .wavy-hero-kicker {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0,0,0,0.04);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          color: var(--wavy-soft);
          margin-bottom: 32px;
          text-transform: lowercase;
          letter-spacing: 0.02em;
        }

        .wavy-hero-title {
          font-size: clamp(40px, 6.5vw, 84px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: var(--wavy-text);
          margin-bottom: 28px;
        }

        .wavy-hero-subtitle {
          font-size: clamp(17px, 2vw, 21px);
          line-height: 1.5;
          color: var(--wavy-soft);
          max-width: 680px;
          margin-bottom: 40px;
        }

        .wavy-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .wavy-btn-lg {
          padding: 16px 32px;
          font-size: 15px;
          border-radius: 12px;
        }

        .wavy-btn-secondary {
          background: var(--wavy-card);
          color: var(--wavy-text);
          border: 1px solid var(--wavy-line);
        }

        /* Hero Image */
        .wavy-hero-image {
          margin-top: 80px;
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .wavy-hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Product Cards Section */
        .wavy-products {
          padding: 140px clamp(20px, 4vw, 60px);
          max-width: 1400px;
          margin: 0 auto;
        }

        .wavy-section-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 80px;
        }

        .wavy-section-kicker {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(0,0,0,0.04);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          color: var(--wavy-soft);
          margin-bottom: 20px;
          text-transform: lowercase;
        }

        .wavy-section-title {
          font-size: clamp(32px, 4.5vw, 54px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .wavy-section-description {
          font-size: 17px;
          color: var(--wavy-soft);
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto;
        }

        /* Product Grid */
        .wavy-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .wavy-product-card {
          background: var(--wavy-card);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--wavy-line);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .wavy-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
          border-color: rgba(0,0,0,0.12);
        }

        .wavy-product-image {
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #f5f5f4;
        }

        .wavy-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .wavy-product-card:hover .wavy-product-image img {
          transform: scale(1.05);
        }

        .wavy-product-content {
          padding: 28px;
        }

        .wavy-product-title {
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .wavy-product-description {
          font-size: 14px;
          color: var(--wavy-soft);
          line-height: 1.6;
        }

        /* Split Content Section */
        .wavy-split {
          padding: 140px clamp(20px, 4vw, 60px);
          max-width: 1400px;
          margin: 0 auto;
        }

        .wavy-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 6vw, 100px);
          align-items: center;
        }

        .wavy-split-text h2 {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .wavy-split-text p {
          font-size: 16px;
          color: var(--wavy-soft);
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .wavy-split-image {
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #f5f5f4;
        }

        .wavy-split-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wavy-expandable {
          margin-top: 28px;
        }

        .wavy-expandable summary {
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          color: var(--wavy-text);
          list-style: none;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wavy-expandable summary::before {
          content: '→';
          font-size: 16px;
        }

        .wavy-expandable[open] summary::before {
          content: '↓';
        }

        .wavy-expandable-content {
          margin-top: 12px;
          padding-left: 24px;
          font-size: 15px;
          color: var(--wavy-soft);
          line-height: 1.7;
        }

        /* FAQ Section */
        .wavy-faq {
          padding: 140px clamp(20px, 4vw, 60px);
          max-width: 900px;
          margin: 0 auto;
        }

        .wavy-faq-list {
          display: grid;
          gap: 12px;
          margin-top: 60px;
        }

        .wavy-faq-item {
          background: var(--wavy-card);
          border: 1px solid var(--wavy-line);
          border-radius: 16px;
          padding: 24px 28px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wavy-faq-item:hover {
          border-color: rgba(0,0,0,0.12);
        }

        .wavy-faq-question {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .wavy-faq-arrow {
          font-size: 20px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .wavy-faq-item.open .wavy-faq-arrow {
          transform: rotate(90deg);
        }

        .wavy-faq-answer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--wavy-line);
          font-size: 15px;
          color: var(--wavy-soft);
          line-height: 1.7;
          display: none;
        }

        .wavy-faq-item.open .wavy-faq-answer {
          display: block;
        }

        /* Footer */
        .wavy-footer {
          background: var(--wavy-accent);
          color: white;
          padding: 80px clamp(20px, 4vw, 60px) 40px;
        }

        .wavy-footer-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .wavy-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wavy-footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wavy-footer-logo .wavy-logo {
          filter: brightness(0) invert(1);
        }

        .wavy-footer-tagline {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          max-width: 340px;
        }

        .wavy-footer-column h4 {
          font-size: 13px;
          font-weight: 500;
          text-transform: lowercase;
          letter-spacing: 0.02em;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .wavy-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wavy-footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          transition: color 0.2s ease;
        }

        .wavy-footer-link:hover {
          color: white;
        }

        .wavy-footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .wavy-product-grid {
            grid-template-columns: 1fr;
          }

          .wavy-split-grid {
            grid-template-columns: 1fr;
          }

          .wavy-footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .wavy-nav-links {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .wavy-hero {
            padding: 100px 20px 60px;
          }

          .wavy-hero-title {
            font-size: 36px;
          }

          .wavy-products, .wavy-split, .wavy-faq {
            padding: 80px 20px;
          }

          .wavy-footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`wavy-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wavy-nav-inner">
          <a href="/" className="wavy-brand">
            <img src="/roko.png" alt="Wavy" className="wavy-logo" />
            <span>wavy</span>
          </a>
          
          <div className="wavy-nav-links">
            <a href="#science" className="wavy-nav-link">ciencia</a>
            <a href="#about" className="wavy-nav-link">acerca</a>
            <a href="#faq" className="wavy-nav-link">preguntas</a>
            <button className="wavy-btn" onClick={() => setLocation('/auth')}>
              comenzar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="wavy-hero">
        <div className="wavy-hero-content">
          <span className="wavy-hero-kicker">para los días que vives</span>
          <h1 className="wavy-hero-title">
            suplementos & hand care. daily haircare & bergamot x vanilla.
          </h1>
          <p className="wavy-hero-subtitle">
            tres productos para el cuidado diario: probiotics, hand lotion y hair growth, un suplemento capilar.
            explora cada producto por separado para encontrar los detalles que importan a ti.
          </p>
          <div className="wavy-hero-actions">
            <button className="wavy-btn wavy-btn-lg" onClick={() => setLocation('/explore')}>
              explorar tienda
            </button>
            <button className="wavy-btn wavy-btn-lg wavy-btn-secondary" onClick={() => setLocation('/business')}>
              para negocios
            </button>
          </div>
        </div>

        <div className="wavy-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1600&q=80" 
            alt="Wavy Experience" 
          />
        </div>
      </section>

      {/* Products Section */}
      <section className="wavy-products">
        <div className="wavy-section-header">
          <span className="wavy-section-kicker">out</span>
          <h2 className="wavy-section-title">probiotics</h2>
          <p className="wavy-section-description">
            lockdanthus & blikibokerien calcarea.
          </p>
        </div>

        <div className="wavy-product-grid">
          <div className="wavy-product-card" onClick={() => setLocation('/explore')}>
            <div className="wavy-product-image">
              <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80" alt="Probiotics" />
            </div>
            <div className="wavy-product-content">
              <h3 className="wavy-product-title">probiotics</h3>
              <p className="wavy-product-description">
                lockdanthus & blikibokerien calcarea. $38
              </p>
            </div>
          </div>

          <div className="wavy-product-card" onClick={() => setLocation('/explore')}>
            <div className="wavy-product-image">
              <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80" alt="Hand Lotion" />
            </div>
            <div className="wavy-product-content">
              <h3 className="wavy-product-title">hand lotion</h3>
              <p className="wavy-product-description">
                daily hand care. bergamot & vanilla. $32
              </p>
            </div>
          </div>

          <div className="wavy-product-card" onClick={() => setLocation('/explore')}>
            <div className="wavy-product-image">
              <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80" alt="Hair Growth" />
            </div>
            <div className="wavy-product-content">
              <h3 className="wavy-product-title">hair growth</h3>
              <p className="wavy-product-description">
                a daily hair supplement for men. $44
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Know what goes in */}
      <section className="wavy-split" id="science">
        <div className="wavy-split-grid">
          <div className="wavy-split-text">
            <h2>conoce lo que llevas.</h2>
            <p>
              un nombre de ingrediente es solo el comienzo. la cantidad, 
              la fórmula y la investigación, todo importa también.
            </p>
            <p>
              investigamos o uno ingrediente no establece lo que un 
              producto terminado puede hacer. mantenemos eso claro.
            </p>
            
            <details className="wavy-expandable">
              <summary>¿por qué los ingredientes?</summary>
              <div className="wavy-expandable-content">
                investigar o uno ingrediente no establece lo que un producto 
                terminado puede hacer. mantenemos el registro claro.
              </div>
            </details>

            <details className="wavy-expandable">
              <summary>¿por qué los contaminantes?</summary>
              <div className="wavy-expandable-content">
                probamos cada lote para asegurarnos de que cumple con nuestros 
                estándares de pureza y calidad.
              </div>
            </details>

            <details className="wavy-expandable">
              <summary>¿qué esperas?</summary>
              <div className="wavy-expandable-content">
                resultados reales, basados en ciencia, sin promesas exageradas.
              </div>
            </details>
          </div>

          <div className="wavy-split-image">
            <img 
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80" 
              alt="Quality ingredients" 
            />
          </div>
        </div>
      </section>

      {/* A few things section */}
      <section className="wavy-split" style={{ background: 'var(--wavy-card)' }}>
        <div className="wavy-split-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="wavy-split-image">
            <img 
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80" 
              alt="Products" 
            />
          </div>

          <div className="wavy-split-text">
            <h2>a few things.<br/>chosen with care.</h2>
            <p>
              estamos construyendo un pequeño rango alrededor de tres partes 
              de cuidado diario: productos, suplementos capilares y hand lotion.
            </p>
            <p>
              para nosotros, los detalles importan: qué hay en una fórmula, 
              cómo se usa y cuán claramente lo explicamos. debes poder entender 
              un producto antes de decidir si merece un lugar en tu rutina.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <Timeline
        title="nuestra historia"
        periodLabel="2020-2024"
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
        imageAlt="Wavy Team"
        textColor="#1c1917"
        mutedTextColor="#78716c"
        activeColor="#0a0a0a"
        backgroundColor="#fafaf9"
        topItems={[
          { id: "2020-march", year: "2020", month: "March", content: "la idea surge de democratizar beneficios premium" },
          { id: "2021-july", year: "2021", month: "July", content: "lanzamiento beta con primeros negocios partners" },
          { id: "2023-april", year: "2023", month: "April", content: "expansión nacional y nuevas categorías" },
        ]}
        bottomItems={[
          { id: "2020-november", year: "2020", month: "November", content: "validación del concepto con usuarios reales" },
          { id: "2022-october", year: "2022", month: "October", content: "sistema de recompensas rediseñado" },
        ]}
      />

      {/* FAQ */}
      <section className="wavy-faq" id="faq">
        <div className="wavy-section-header">
          <span className="wavy-section-kicker">preguntas</span>
          <h2 className="wavy-section-title">
            posiblemente tengas<br/>algunas preguntas ahora.
          </h2>
          <p className="wavy-section-description">
            sobre el rango, el uso, el ideal y tu pedido.
          </p>
        </div>

        <div className="wavy-faq-list">
          {[
            {
              id: 'faq-1',
              q: "¿qué está en el 'wavedash' range?",
              a: "tres productos de cuidado diario: probiotics, hand lotion y hair growth, un suplemento capilar. explora cada producto por separado para encontrar los detalles que importan a ti."
            },
            {
              id: 'faq-2',
              q: "¿dónde debo buscar detalles de ingredientes?",
              a: "cada página de producto tiene una sección completa de ingredientes, incluyendo cantidades, fuentes y estudios de respaldo."
            },
            {
              id: 'faq-3',
              q: "¿cómo uso y almaceno mi producto?",
              a: "instrucciones claras vienen con cada producto. generalmente, mantén en lugar fresco y seco, lejos de luz solar directa."
            },
            {
              id: 'faq-4',
              q: "¿el envío es gratuito?",
              a: "sí, envío gratuito en pedidos sobre RD$500. entregas en 3-5 días hábiles."
            },
            {
              id: 'faq-5',
              q: "¿puedo cancelar hair growth hoy?",
              a: "puedes cancelar tu suscripción en cualquier momento desde tu cuenta."
            },
            {
              id: 'faq-6',
              q: "¿dónde puedo aprender más antes de elegir?",
              a: "visita nuestra sección de ciencia para estudios detallados y explicaciones de cada ingrediente."
            }
          ].map((faq) => (
            <div 
              key={faq.id}
              className={`wavy-faq-item ${expandedFaq === faq.id ? 'open' : ''}`}
              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <div className="wavy-faq-question">
                <span>{faq.q}</span>
                <span className="wavy-faq-arrow">→</span>
              </div>
              <div className="wavy-faq-answer">
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="wavy-footer">
        <div className="wavy-footer-grid">
          <div className="wavy-footer-brand">
            <div className="wavy-footer-logo">
              <img src="/roko.png" alt="Wavy" className="wavy-logo" />
              <span style={{ fontSize: '18px', fontWeight: 600 }}>wavy</span>
            </div>
            <p className="wavy-footer-tagline">
              cosas buenas, ocasionalmente. recibe nuevas colecciones, 
              nuevas adiciones y cosas que podemos enviarte por familia, 
              totalmente sin costo.
            </p>
          </div>

          <div className="wavy-footer-column">
            <h4>tienda</h4>
            <div className="wavy-footer-links">
              <a href="/explore" className="wavy-footer-link">explorar</a>
              <a href="/benefits" className="wavy-footer-link">beneficios</a>
              <a href="/events" className="wavy-footer-link">eventos</a>
            </div>
          </div>

          <div className="wavy-footer-column">
            <h4>contacto</h4>
            <div className="wavy-footer-links">
              <a href="/support" className="wavy-footer-link">soporte</a>
              <a href="#" className="wavy-footer-link">envío & devoluciones</a>
              <a href="#" className="wavy-footer-link">instagram</a>
            </div>
          </div>

          <div className="wavy-footer-column">
            <h4>acerca</h4>
            <div className="wavy-footer-links">
              <a href="/about" className="wavy-footer-link">nosotros</a>
              <a href="/terms" className="wavy-footer-link">términos</a>
              <a href="#" className="wavy-footer-link">privacidad</a>
            </div>
          </div>
        </div>

        <div className="wavy-footer-bottom">
          <span>© 2024 wavy</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="wavy-footer-link">privacidad</a>
            <a href="/terms" className="wavy-footer-link">términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
