import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState({
    general: true,
    transactions: true,
    offers: false
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  return (
    <div style={{ padding: '1.5rem 1.25rem' }}>
      {/* General Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
              Notificaciones
            </h3>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Recibir notificaciones generales sobre actualizaciones y novedades de TAPP
            </p>
          </div>
          <Toggle
            enabled={notifications.general}
            onChange={() => toggleNotification('general')}
          />
        </div>
      </motion.div>

      {/* Section Title */}
      <h2 style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        margin: '0 0 1rem 0',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        paddingLeft: '0.25rem'
      }}>
        Categorías específicas
      </h2>

      {/* Transactions & Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1rem'
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
              Transacciones y Beneficios
            </h3>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Recibir notificaciones al celular sobre tus transacciones, puntos ganados y beneficios disponibles
            </p>
          </div>
          <Toggle
            enabled={notifications.transactions}
            onChange={() => toggleNotification('transactions')}
          />
        </div>
      </motion.div>

      {/* Offers Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          padding: '1.25rem'
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
              Avisos de ofertas
            </h3>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Recibir notificaciones sobre nuevas ofertas, descuentos especiales y promociones exclusivas de establecimientos
            </p>
          </div>
          <Toggle
            enabled={notifications.offers}
            onChange={() => toggleNotification('offers')}
          />
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px'
        }}
      >
        <p style={{
          fontSize: '0.8125rem',
          color: 'rgba(59, 130, 246, 0.9)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          💡 Puedes personalizar qué notificaciones deseas recibir en cualquier momento desde esta sección
        </p>
      </motion.div>
    </div>
  );
}
