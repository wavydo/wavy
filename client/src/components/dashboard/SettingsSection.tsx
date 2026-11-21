import { useState } from 'react';
import { motion } from 'framer-motion';
import PersonalDataScreen from './settings/PersonalDataScreen';
import NotificationsScreen from './settings/NotificationsScreen';
import BiometricAuthScreen from './settings/BiometricAuthScreen';

interface SettingsSectionProps {
  userData: any;
  onLogout: () => void;
  theme?: 'dark' | 'light';
}

type ScreenType = 'menu' | 'personal-data' | 'notifications' | 'biometric';

export default function SettingsSection({ userData, onLogout, theme = 'dark' }: SettingsSectionProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('menu');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#000' : '#f8fafc',
    text: theme === 'dark' ? '#fff' : '#0e1116',
    textSecondary: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748b',
    border: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.1)',
    cardBg: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
    buttonBg: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
    profileBg: theme === 'dark' ? '#fff' : '#0e1116',
    profileText: theme === 'dark' ? '#000' : '#fff',
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    {
      id: 'personal-data',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      label: 'Datos personales',
      screen: 'personal-data' as ScreenType
    },
    {
      id: 'notifications',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      label: 'Notificaciones',
      screen: 'notifications' as ScreenType
    },
    {
      id: 'linked-cards',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      label: 'Tarjetas vinculadas',
      screen: null,
      disabled: true
    },
    {
      id: 'biometric',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
      label: 'Autenticación biométrica',
      screen: 'biometric' as ScreenType
    }
  ];

  if (currentScreen !== 'menu') {
    return (
      <div style={{ background: colors.background, minHeight: '100vh', color: colors.text }}>
        {/* Back Button Header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentScreen('menu')}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              padding: '0.5rem',
              marginLeft: '-0.5rem'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0
          }}>
            {currentScreen === 'personal-data' && 'Datos personales'}
            {currentScreen === 'notifications' && 'Notificaciones'}
            {currentScreen === 'biometric' && 'Autenticación biométrica'}
          </h1>
        </div>

        {/* Screen Content */}
        {currentScreen === 'personal-data' && <PersonalDataScreen userData={userData} />}
        {currentScreen === 'notifications' && <NotificationsScreen />}
        {currentScreen === 'biometric' && <BiometricAuthScreen />}
      </div>
    );
  }

  return (
    <div style={{ background: colors.background, minHeight: '100vh', color: colors.text, padding: '1.5rem 1.25rem' }}>
      {/* Close Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <label htmlFor="profile-image" style={{ cursor: 'pointer' }}>
          <input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: profileImage ? `url(${profileImage}) center/cover` : colors.profileBg,
            color: colors.profileText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!profileImage && (userData?.user?.fullName || 'U')?.charAt(0)?.toUpperCase()}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '0.5rem',
              padding: '0.25rem',
              textAlign: 'center'
            }}>
              Edit
            </div>
          </div>
        </label>

        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: '0 0 0.25rem 0'
          }}>
            {userData?.user?.fullName || userData?.user?.name || userData?.user?.username || 'Usuario'}
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            {userData?.user?.email || 'user@tapp.com'}
          </p>
        </div>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: colors.cardBg,
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          border: `1px solid ${colors.border}`
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => item.screen && setCurrentScreen(item.screen)}
            disabled={item.disabled}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: index < menuItems.length - 1 ? `1px solid ${colors.border}` : 'none',
              color: item.disabled ? colors.textSecondary : colors.text,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
              opacity: item.disabled ? 0.5 : 1
            }}
          >
            <div style={{ opacity: 0.6 }}>{item.icon}</div>
            <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500 }}>
              {item.label}
            </span>
            {!item.disabled && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </button>
        ))}
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onLogout}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          background: colors.buttonBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          color: colors.textSecondary,
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </motion.button>
    </div>
  );
}
