import { useState } from 'react';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessSupport() {
  const [, setLocation] = useLocation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqCategories = [
    {
      title: 'Primeros Pasos',
      items: [
        { q: '¿Cómo creo mi primer perk?', a: 'Ve a Perks & Discounts y haz clic en "Create New Perk". Completa los campos y guarda.' },
        { q: '¿Cómo funcionan los eventos?', a: 'Los eventos te permiten crear experiencias para tus clientes. Crea uno desde la sección Events.' },
        { q: '¿Cómo veo mis clientes?', a: 'En la sección Dashboard puedes ver todos los clientes que han interactuado con tu negocio.' }
      ]
    },
    {
      title: 'Gestión de Perks',
      items: [
        { q: '¿Puedo editar un perk activo?', a: 'Sí, haz clic en el perk que quieras editar y modifica los campos. Los cambios se aplican inmediatamente.' },
        { q: '¿Cómo establezco fechas de expiración?', a: 'Al crear o editar un perk, usa los campos "Valid From" y "Valid Until" para establecer el período de vigencia.' },
        { q: '¿Cuántos perks puedo tener activos?', a: 'No hay límite. Puedes tener todos los perks activos que necesites.' }
      ]
    },
    {
      title: 'Analytics y Datos',
      items: [
        { q: '¿Cuándo aparecen los datos?', a: 'Los datos aparecen en tiempo real una vez que los clientes comiencen a usar tus perks y eventos.' },
        { q: '¿Cómo interpreto el crecimiento?', a: 'El porcentaje de crecimiento compara el mes actual con el anterior.' },
        { q: '¿Puedo exportar mis datos?', a: 'Esta función estará disponible próximamente.' }
      ]
    },
    {
      title: 'Configuración',
      items: [
        { q: '¿Cómo cambio mi logo?', a: 'Ve a Configuración y sube una imagen desde tu computadora en la sección "Logo del Negocio".' },
        { q: '¿Puedo cambiar la categoría?', a: 'Sí, en Configuración puedes seleccionar tu categoría de negocio.' },
        { q: '¿Cómo actualizo mi información?', a: 'Todos los campos en Configuración son editables. Haz los cambios y haz clic en "Guardar Cambios".' }
      ]
    }
  ];

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <BusinessLayout activeSection="support">
      <style>{`
        .support-wrapper {
          width: 100%;
          max-width: none;
        }

        .editorial-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }

        .section-number {
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
          min-width: 32px;
          padding-top: 4px;
        }

        .header-content {
          flex: 1;
        }

        .section-title {
          font-size: 32px;
          font-weight: 300;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .section-description {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Quick Help Grid */
        .quick-help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 48px;
        }

        .quick-help-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          transition: all 180ms ease;
          cursor: pointer;
        }

        .quick-help-card:hover {
          border-color: rgba(15, 23, 42, 0.16);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .quick-help-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(14, 17, 22, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .quick-help-icon svg {
          width: 20px;
          height: 20px;
          stroke: var(--ink);
        }

        .quick-help-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .quick-help-description {
          font-size: 13px;
          color: var(--muted);
        }

        /* FAQ Section */
        .faq-section {
          width: 100%;
        }

        .faq-category {
          margin-bottom: 32px;
        }

        .faq-category:last-child {
          margin-bottom: 60px;
        }

        .faq-category-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .faq-item {
          margin-bottom: 8px;
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .faq-question:hover {
          border-color: rgba(15, 23, 42, 0.12);
          background: rgba(14, 17, 22, 0.02);
        }

        .faq-question-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          flex: 1;
        }

        .faq-icon {
          width: 20px;
          height: 20px;
          transition: transform 180ms ease;
          flex-shrink: 0;
        }

        .faq-icon.open {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 16px 18px;
          background: rgba(14, 17, 22, 0.02);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 10px 10px;
          margin-top: -6px;
        }

        .faq-answer-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .editorial-header {
            flex-direction: column;
            gap: 12px;
          }

          .quick-help-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="support-wrapper">
        {/* Editorial Header */}
        <div className="editorial-header">
          <span className="section-number">05</span>
          <div className="header-content">
            <h1 className="section-title">Centro de Ayuda</h1>
            <p className="section-description">
              Soporte, documentación y recursos para tu negocio
            </p>
          </div>
        </div>

        {/* Quick Help Grid */}
        <div className="quick-help-grid">
          <div className="quick-help-card">
            <div className="quick-help-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h3 className="quick-help-title">Guías</h3>
            <p className="quick-help-description">Tutoriales paso a paso</p>
          </div>

          <div 
            className="quick-help-card"
            onClick={() => window.open('/admin/support', '_blank')}
          >
            <div className="quick-help-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="quick-help-title">Chat</h3>
            <p className="quick-help-description">Habla con soporte</p>
          </div>

          <div className="quick-help-card">
            <div className="quick-help-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 className="quick-help-title">FAQ</h3>
            <p className="quick-help-description">Preguntas frecuentes</p>
          </div>

          <div className="quick-help-card">
            <div className="quick-help-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <h3 className="quick-help-title">Video Tutoriales</h3>
            <p className="quick-help-description">Aprende visualmente</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h3 className="faq-category-title">{category.title}</h3>
              {category.items.map((item, itemIndex) => {
                const faqId = `faq-${categoryIndex}-${itemIndex}`;
                const isExpanded = expandedFaq === faqId;
                
                return (
                  <div key={itemIndex} className="faq-item">
                    <div 
                      className="faq-question"
                      onClick={() => toggleFaq(faqId)}
                    >
                      <span className="faq-question-text">{item.q}</span>
                      <svg 
                        className={`faq-icon ${isExpanded ? 'open' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#64748b" 
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                    {isExpanded && (
                      <div className="faq-answer">
                        <p className="faq-answer-text">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
}
