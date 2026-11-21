import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BiometricAuthScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        background: enabled ? '#10b981' : 'rgba(255,255,255,0.1)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s'
      }}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '2px'
        }}
      />
    </button>
  );

  const handleToggle = () => {
    if (!biometricEnabled) {
      setShowSetupModal(true);
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleSetup = () => {
    // Aquí iría la lógica real de autenticación biométrica
    setBiometricEnabled(true);
    setShowSetupModal(false);
  };

  return (
    <div style={{ padding: '1.5rem 1.25rem' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 0.75rem 0',
          color: '#fff'
        }}>
          Autenticación Biométrica
        </h2>
        <p style={{
          fontSize: '0.9375rem',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
          lineHeight: '1.6'
        }}>
          Protege tu cuenta con tu huella digital o reconocimiento facial
        </p>
      </motion.div>

      {/* Main Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              margin: '0 0 0.5rem 0',
              color: '#fff'
            }}>
              Habilitar autenticación biométrica
            </h3>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Usa tu huella digital o Face ID para acceder rápidamente a tu cuenta TAPP
            </p>
          </div>
          <Toggle
            enabled={biometricEnabled}
            onChange={handleToggle}
          />
        </div>
      </motion.div>

      {/* Benefits */}
      <h2 style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        margin: '0 0 1rem 0',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        paddingLeft: '0.25rem'
      }}>
        Beneficios
      </h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '1.5rem' }}
      >
        {[
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ),
            title: 'Mayor seguridad',
            description: 'Tu información está protegida con encriptación de nivel bancario'
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
            title: 'Acceso rápido',
            description: 'Inicia sesión en segundos sin necesidad de recordar contraseñas'
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            ),
            title: 'Privacidad garantizada',
            description: 'Tus datos biométricos nunca salen de tu dispositivo'
          }
        ].map((benefit, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              marginBottom: '0.75rem',
              display: 'flex',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              {benefit.icon}
            </div>
            <div>
              <h4 style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                margin: '0 0 0.25rem 0',
                color: '#fff'
              }}>
                {benefit.title}
              </h4>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Status Badge */}
      {biometricEnabled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            flexShrink: 0
          }} />
          <p style={{
            fontSize: '0.8125rem',
            color: '#10b981',
            margin: 0,
            fontWeight: 600
          }}>
            Autenticación biométrica activa
          </p>
        </motion.div>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div
          onClick={() => setShowSetupModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: '0 0 0.75rem 0',
              color: '#fff'
            }}>
              Configurar autenticación
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 2rem 0',
              lineHeight: '1.5'
            }}>
              Para habilitar la autenticación biométrica, necesitarás verificar tu identidad con tu huella digital o Face ID
            </p>
            <button
              onClick={handleSetup}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '0.75rem'
              }}
            >
              Continuar
            </button>
            <button
              onClick={() => setShowSetupModal(false)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
