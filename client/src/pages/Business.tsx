import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function Business() {
  const [, setLocation] = useLocation();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      position: 'relative'
    }}>
      {/* Video Background */}
      <video 
        src="/b1b.mp4" 
        autoPlay 
        playsInline 
        muted 
        loop 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.9) 100%)',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Hero Section */}
        <section style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px' }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: "'Antipasto Pro', sans-serif",
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 200,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
                lineHeight: 1.1
              }}
            >
              Crece tu negocio<br />con TAPP
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 300,
                marginBottom: '3rem',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto 3rem'
              }}
            >
              Atrae más clientes, aumenta tus ventas y construye lealtad<br />
              sin pagar comisiones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={() => setLocation('/register/establishment')}
                style={{
                  padding: '1.1rem 2.5rem',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Solicitar Acceso
              </button>

              <button
                onClick={() => setLocation('/auth')}
                style={{
                  padding: '1.1rem 2.5rem',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                Iniciar Sesión
              </button>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{
          padding: '6rem 2rem',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 200,
              textAlign: 'center',
              marginBottom: '4rem',
              letterSpacing: '-0.01em'
            }}>
              Por qué unirse a TAPP
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '3rem'
            }}>
              {[
                {
                  title: '0% Comisiones',
                  description: 'No cobramos comisiones por transacción. Todos los beneficios son para ti y tus clientes.',
                  icon: '∅'
                },
                {
                  title: 'Más Clientes',
                  description: 'Accede a una red creciente de usuarios que buscan negocios locales como el tuyo.',
                  icon: '↑'
                },
                {
                  title: 'Fidelización',
                  description: 'Construye lealtad con descuentos, cashback y beneficios exclusivos para tus clientes.',
                  icon: '◆'
                },
                {
                  title: 'Fácil de Usar',
                  description: 'Implementación simple. Los clientes solo tapean su tarjeta NFC y listo.',
                  icon: '⚡'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{
                    padding: '2.5rem 2rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0'
                  }}
                >
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.8
                  }}>
                    {benefit.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    marginBottom: '0.75rem',
                    letterSpacing: '0.02em'
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.95rem',
                    fontWeight: 300,
                    lineHeight: 1.6
                  }}>
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{
          padding: '6rem 2rem'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '4rem',
            textAlign: 'center'
          }}>
            {[
              { value: '100+', label: 'Establecimientos' },
              { value: '0%', label: 'Comisiones' },
              { value: '25%', label: 'Descuento Máx' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div style={{
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  fontWeight: 200,
                  marginBottom: '0.5rem',
                  fontFamily: "'Antipasto Pro', sans-serif"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 500
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '6rem 2rem',
          background: 'rgba(255,255,255,0.03)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 200,
              marginBottom: '1.5rem',
              letterSpacing: '-0.01em'
            }}>
              Listo para crecer
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '3rem',
              fontWeight: 300,
              lineHeight: 1.6
            }}>
              Únete a TAPP y empieza a atraer más clientes hoy mismo.<br />
              Sin costos de instalación. Sin comisiones.
            </p>
            <button
              onClick={() => setLocation('/register/establishment')}
              style={{
                padding: '1.2rem 3rem',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: '0',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Solicitar Acceso Ahora
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={() => setLocation('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 300,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            ← Volver al inicio
          </button>
        </footer>
      </div>
    </div>
  );
}
