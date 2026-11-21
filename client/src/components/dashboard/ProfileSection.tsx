import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProfileSectionProps {
  userData: any;
  onLogout: () => void;
}

export default function ProfileSection({ userData, onLogout }: ProfileSectionProps) {
  const [showCard, setShowCard] = useState(false);

  const stats = [
    { label: 'Places', value: '24' },
    { label: 'Events', value: '8' },
    { label: 'Points', value: '12.4K' }
  ];

  const activity = [
    { place: 'Casa 23', detail: '+250 pts', time: '2h ago' },
    { place: 'Wine Tasting', detail: 'Attended', time: '1d ago' },
    { place: 'La Esquina', detail: 'Redeemed', time: '2d ago' },
    { place: 'El Mesón', detail: '+500 pts', time: '3d ago' }
  ];

  return (
    <div style={{ padding: '0', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '2.5rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fff',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            {(userData?.user?.fullName || userData?.user?.name || userData?.user?.username || userData?.user?.email || 'U')?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em'
            }}>
              {userData?.user?.fullName || userData?.user?.name || userData?.user?.username || userData?.user?.email?.split('@')[0] || 'User'}
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.4)',
              margin: 0
            }}>
              Member since 2026
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.02em'
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowCard(true)}
        style={{
          margin: '1.5rem',
          background: '#fff',
          color: '#000',
          padding: '1.5rem',
          cursor: 'pointer'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'lowercase'
          }}>
            tapp
          </div>
          <div style={{
            fontSize: '0.75rem',
            opacity: 0.4,
            letterSpacing: '0.05em'
          }}>
            •••• {String(userData?.user?.id).slice(-4) || '0000'}
          </div>
        </div>
      </motion.div>

      {/* Activity */}
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          margin: '0 0 1rem 0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)'
        }}>
          Recent
        </h2>

        {activity.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '0.875rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <p style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                margin: '0 0 0.25rem 0'
              }}>
                {item.place}
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
                margin: 0
              }}>
                {item.time}
              </p>
            </div>
            <div style={{
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500
            }}>
              {item.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '1.5rem' }}>
        <button
          onClick={onLogout}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Log out
        </button>
      </div>

      {/* Card Modal */}
      {showCard && (
        <div
          onClick={() => setShowCard(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#000',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%'
            }}
          >
            <div style={{
              aspectRatio: '1.586',
              background: '#fff',
              color: '#000',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 300,
                letterSpacing: '0.15em',
                textTransform: 'lowercase',
                marginBottom: '3rem'
              }}>
                tapp
              </div>

              <div style={{
                fontSize: '1.125rem',
                letterSpacing: '0.08em',
                marginBottom: '1rem',
                opacity: 0.7
              }}>
                •••• •••• •••• {String(userData?.user?.id).slice(-4) || '0000'}
              </div>

              <div style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600
              }}>
                {userData?.user?.fullName || userData?.user?.name || userData?.user?.username || 'TAPP MEMBER'}
              </div>
            </div>

            <button
              onClick={() => setShowCard(false)}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
