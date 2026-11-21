import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalDataScreenProps {
  userData: any;
}

export default function PersonalDataScreen({ userData }: PersonalDataScreenProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>('general');
  
  const [formData, setFormData] = useState({
    // General
    fullName: userData?.user?.fullName || '',
    dateOfBirth: userData?.user?.dateOfBirth || '',
    country: userData?.user?.country || 'República Dominicana',
    
    // Contact
    phone: userData?.user?.phone || '',
    email: userData?.user?.email || '',
    
    // Address
    address: userData?.user?.address || '',
    city: userData?.user?.city || '',
    zipCode: userData?.user?.zipCode || '',
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const dropdowns = [
    {
      id: 'general',
      title: 'General',
      fields: [
        { label: 'Nombre completo', value: formData.fullName, key: 'fullName', type: 'text' },
        { label: 'Fecha de nacimiento', value: formData.dateOfBirth, key: 'dateOfBirth', type: 'date' },
        { label: 'País de residencia', value: formData.country, key: 'country', type: 'text' }
      ]
    },
    {
      id: 'contact',
      title: 'Datos de contacto',
      fields: [
        { label: 'Teléfono móvil', value: formData.phone, key: 'phone', type: 'tel' },
        { label: 'Correo electrónico', value: formData.email, key: 'email', type: 'email' }
      ]
    },
    {
      id: 'address',
      title: 'Dirección',
      fields: [
        { label: 'Dirección de residencia', value: formData.address, key: 'address', type: 'text' },
        { label: 'Ciudad', value: formData.city, key: 'city', type: 'text' },
        { label: 'Código postal', value: formData.zipCode, key: 'zipCode', type: 'text' }
      ]
    }
  ];

  return (
    <div style={{ padding: '1.5rem 1.25rem' }}>
      {dropdowns.map((dropdown, index) => (
        <motion.div
          key={dropdown.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }}
        >
          {/* Dropdown Header */}
          <button
            onClick={() => toggleDropdown(dropdown.id)}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>
              {dropdown.title}
            </span>
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: openDropdown === dropdown.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </motion.svg>
          </button>

          {/* Dropdown Content */}
          <AnimatePresence>
            {openDropdown === dropdown.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  padding: '0 1.25rem 1.25rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {dropdown.fields.map((field, fieldIndex) => (
                    <div
                      key={field.key}
                      style={{
                        paddingTop: fieldIndex === 0 ? '1.25rem' : '1rem',
                        paddingBottom: fieldIndex === dropdown.fields.length - 1 ? 0 : '1rem',
                        borderBottom: fieldIndex < dropdown.fields.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                      }}
                    >
                      <label style={{
                        display: 'block',
                        fontSize: '0.8125rem',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: '0.5rem',
                        fontWeight: 500
                      }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.9375rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          width: '100%',
          padding: '1rem',
          background: '#fff',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '1rem'
        }}
        onClick={() => alert('Datos guardados exitosamente')}
      >
        Guardar cambios
      </motion.button>
    </div>
  );
}
