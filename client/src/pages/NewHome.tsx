import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { NotchedCard } from '../components/landing/NotchedCard';
import Timeline from '../components/landing/Timeline';

export default function NewHome() {
  const [, setLocation] = useLocation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: 'var(--ink, #0a0a0a)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        :root {
          --ink: #0e1116;
          --muted: #64748b;
          --border: #e2e8f0;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 80px;
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: ${scrollY > 50 ? 'rgba(255,255,255,0.9)' : 'transparent'};
          backdrop-filter: ${scrollY > 50 ? 'blur(12px)' : 'none'};
          transition: all 0.3s ease;
          border-bottom: ${scrollY > 50 ? '1px solid var(--border)' : 'none'};
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .nav-link {
          color: var(--ink);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: opacity 0.2s ease;
          cursor: pointer;
        }

        .nav-link:hover {
          opacity: 0.7;
        }

        .cta-button {
          padding: 12px 24px;
          background: var(--ink);
          color: white;
          border: none;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .hero-content {
          max-width: 1200px;
          width: 100%;
          text-align: center;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(14, 17, 22, 0.04);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--ink);
          margin-bottom: 24px;
        }

        .hero-title strong {
          font-weight: 600;
        }

        .hero-subtitle {
          font-size: clamp(18px, 2vw, 22px);
          color: var(--muted);
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto 40px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .primary-button {
          padding: 16px 32px;
          background: var(--ink);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .secondary-button {
          padding: 16px 32px;
          background: white;
          color: var(--ink);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-button:hover {
          border-color: var(--ink);
          transform: translateY(-2px);
        }

        .section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 120px 40px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(14, 17, 22, 0.04);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-title {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -1px;
          color: var(--ink);
          margin-bottom: 16px;
        }

        .section-description {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 40px;
          margin-top: 60px;
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          border-color: rgba(14, 17, 22, 0.16);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(14, 17, 22, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 28px;
        }

        .feature-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.6;
        }

        .image-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .image-wrapper {
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .image-wrapper:hover img {
          transform: scale(1.05);
        }

        .text-content h2 {
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 300;
          line-height: 1.2;
          letter-spacing: -0.5px;
          color: var(--ink);
          margin-bottom: 20px;
        }

        .text-content h2 strong {
          font-weight: 600;
        }

        .text-content p {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--ink);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: gap 0.2s ease;
        }

        .text-link:hover {
          gap: 12px;
        }

        .faq-section {
          background: #f8f9fa;
          padding: 120px 40px;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-item:hover {
          border-color: rgba(14, 17, 22, 0.16);
        }

        .faq-question {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .faq-answer {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.7;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .footer {
          background: var(--ink);
          color: white;
          padding: 80px 40px 40px;
        }

        .footer-content {
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

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-tagline {
          color: rgba(255,255,255,0.7);
          font-size: 15px;
          line-height: 1.6;
          max-width: 300px;
        }

        .footer-column h4 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          color: rgba(255,255,255,0.9);
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 15px;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: white;
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .nav {
            padding: 16px 20px;
          }

          .nav-links {
            display: none;
          }

          .hero-section {
            padding: 100px 20px 60px;
          }

          .section {
            padding: 80px 20px;
          }

          .image-section {
            grid-template-columns: 1fr;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="nav">
        <div className="logo-container">
          <img src="/roko.png" alt="Wavy" className="logo" />
          <span className="brand-name">Wavy</span>
        </div>
        <div className="nav-links">
          <a href="#science" className="nav-link">Ciencia</a>
          <a href="#about" className="nav-link">Acerca</a>
          <a href="#faq" className="nav-link">FAQ</a>
          <button className="cta-button" onClick={() => setLocation('/auth')}>
            Comenzar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Para los días que vives</span>
          <h1 className="hero-title">
            Más <strong>poder de compra</strong>,<br />
            más experiencias.
          </h1>
          <p className="hero-subtitle">
            Wavy transforma cada compra en una oportunidad. Cashback instantáneo, 
            descuentos exclusivos y acceso a experiencias únicas en tus lugares favoritos.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setLocation('/auth')}>
              Comenzar ahora
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 8h10.5M9 3.8 13.2 8 9 12.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="secondary-button" onClick={() => setLocation('/business')}>
              Para negocios
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="section-header">
          <span className="section-badge">Características</span>
          <h2 className="section-title">Diseñado para tu día a día</h2>
          <p className="section-description">
            Todo lo que necesitas para aprovechar al máximo cada compra,
            en una experiencia simple y elegante.
          </p>
        </div>

        <div className="cards-grid">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3 className="feature-title">Cashback Instantáneo</h3>
            <p className="feature-description">
              Recibe dinero de vuelta en cada compra. Sin esperas, sin complicaciones.
              Tu cashback se acumula automáticamente.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Descuentos Exclusivos</h3>
            <p className="feature-description">
              Accede a ofertas especiales en restaurantes, tiendas y servicios.
              Beneficios diseñados para ti.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">Experiencias Únicas</h3>
            <p className="feature-description">
              Eventos especiales, acceso anticipado y experiencias que no encontrarás
              en ningún otro lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Products Showcase with NotchedCards */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="section-header">
          <span className="section-badge">Productos</span>
          <h2 className="section-title">Todo en un solo lugar</h2>
        </div>

        <div className="cards-grid">
          <NotchedCard
            href="/explore"
            title="Explora"
            description="Descubre negocios cerca de ti con beneficios exclusivos"
            image="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80"
            imageAlt="Explore"
            badge="Nuevo"
            tags={["Restaurantes", "Tiendas", "Servicios"]}
            surface="#f8f9fa"
          />
          
          <NotchedCard
            href="/events"
            title="Eventos"
            description="Accede a experiencias exclusivas y eventos especiales"
            image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
            imageAlt="Events"
            tags={["Música", "Arte", "Gastronomía"]}
            surface="#f8f9fa"
          />

          <NotchedCard
            href="/cards"
            title="Mi Tarjeta"
            description="Tu tarjeta virtual con todos tus beneficios siempre a mano"
            image="https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80"
            imageAlt="Card"
            tags={["Digital", "Seguro"]}
            surface="#f8f9fa"
          />
        </div>
      </section>

      {/* Know what goes in - YukoHealth style */}
      <section className="section">
        <div className="image-section">
          <div className="text-content">
            <h2>
              Conoce <strong>cada beneficio.</strong>
            </h2>
            <p>
              Un nombre de beneficio es solo el comienzo. El valor real está en
              los detalles: cuánto ahorras, dónde puedes usarlo y cómo aprovecharlo al máximo.
            </p>
            <p>
              Investigamos cada negocio partner para asegurarnos de que obtengas
              los mejores beneficios. Mantenemos la transparencia total.
            </p>
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '12px' }}>
                ¿Por qué estos beneficios? →
              </summary>
              <p style={{ paddingLeft: '20px', marginTop: '8px' }}>
                Investigamos cada negocio partner para asegurarte los mejores beneficios.
                Solo trabajamos con establecimientos que cumplan nuestros estándares.
              </p>
            </details>
          </div>

          <div className="image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80" 
              alt="Quality" 
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <Timeline
        title="Nuestra Historia"
        periodLabel="2020-2024"
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
        imageAlt="Wavy Team"
        textColor="var(--ink)"
        mutedTextColor="var(--muted)"
        activeColor="var(--ink)"
        backgroundColor="#ffffff"
        topItems={[
          { 
            id: "2020-march", 
            year: "2020", 
            month: "March", 
            content: "Idea inicial surge de la necesidad de democratizar beneficios premium" 
          },
          { 
            id: "2021-july", 
            year: "2021", 
            month: "July", 
            content: "Lanzamiento beta con los primeros negocios partners en Santo Domingo" 
          },
          { 
            id: "2023-april", 
            year: "2023", 
            month: "April", 
            content: "Expansión nacional y nuevas categorías de beneficios" 
          },
        ]}
        bottomItems={[
          { 
            id: "2020-november", 
            year: "2020", 
            month: "November", 
            content: "Validación del concepto con usuarios reales y feedback positivo" 
          },
          { 
            id: "2022-october", 
            year: "2022", 
            month: "October", 
            content: "Sistema de recompensas completamente rediseñado" 
          },
        ]}
      />

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <div className="faq-container">
          <div className="section-header">
            <span className="section-badge">Preguntas</span>
            <h2 className="section-title">Posiblemente tengas<br/>algunas preguntas ahora.</h2>
            <p className="section-description">
              Sobre el rango, el uso, el ideal y tu pedido.
            </p>
          </div>

          <div className="faq-item">
            <div className="faq-question">
              ¿Qué incluye Wavy?
              <span>→</span>
            </div>
            <div className="faq-answer">
              Wavy incluye cashback instantáneo en compras, acceso a descuentos exclusivos 
              en negocios partners, y entrada a eventos y experiencias especiales.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">
              ¿Dónde puedo usar mis beneficios?
              <span>→</span>
            </div>
            <div className="faq-answer">
              Puedes usar tus beneficios en cientos de negocios partners: restaurantes,
              tiendas, servicios y más. Verifica la app para ver ubicaciones específicas.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">
              ¿Cómo funciona el cashback?
              <span>→</span>
            </div>
            <div className="faq-answer">
              El cashback se acredita automáticamente a tu cuenta después de cada compra
              elegible. Puedes verlo en tiempo real y usarlo en futuras compras.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">
              ¿Tiene costo la membresía?
              <span>→</span>
            </div>
            <div className="faq-answer">
              Wavy es completamente gratuito. Sin costos ocultos, sin suscripciones.
              Solo beneficios que te ayudan a ahorrar.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/roko.png" alt="Wavy" className="logo" />
              <span className="brand-name" style={{ color: 'white' }}>Wavy</span>
            </div>
            <p className="footer-tagline">
              Cosas buenas, ocasionalmente. Recibe nuevas colecciones, nuevas adiciones 
              y cosas que podemos enviarte por familia, totalmente sin costo.
            </p>
          </div>

          <div className="footer-column">
            <h4>Tienda</h4>
            <div className="footer-links">
              <a href="/explore" className="footer-link">Explorar</a>
              <a href="/events" className="footer-link">Eventos</a>
              <a href="/benefits" className="footer-link">Beneficios</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Contacto</h4>
            <div className="footer-links">
              <a href="/support" className="footer-link">Soporte</a>
              <a href="mailto:hello@wavy.com" className="footer-link">Email</a>
              <a href="https://instagram.com/wavyapp" className="footer-link">Instagram</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Acerca</h4>
            <div className="footer-links">
              <a href="/about" className="footer-link">Nosotros</a>
              <a href="/terms" className="footer-link">Términos</a>
              <a href="/privacy" className="footer-link">Privacidad</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 Wavy</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/privacy" className="footer-link">Privacidad</a>
            <a href="/terms" className="footer-link">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
