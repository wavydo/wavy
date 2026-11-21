import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterEstablishment() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0); // Multi-step form
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    category: 'colmado',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/auth/register/establishment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setError('');
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const steps = [
    { title: 'Información del negocio', subtitle: 'Cuéntanos sobre tu establecimiento' },
    { title: 'Datos de contacto', subtitle: 'Cómo podemos comunicarnos contigo' },
    { title: 'Ubicación', subtitle: 'Dónde está ubicado tu negocio' }
  ];

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 200,
            color: '#fff',
            marginBottom: '1rem'
          }}>
            ¡Solicitud Enviada!
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Tu solicitud ha sido recibida correctamente. Nuestro equipo la revisará y te contactaremos por email en las próximas 48 horas.
          </p>
          
          <button
            onClick={() => setLocation('/')}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden'
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
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1
      }}></div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            maxWidth: '520px'
          }}
        >
          {/* Progress Indicator */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '3rem',
            justifyContent: 'center'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: step === i ? '48px' : '24px',
                  height: '4px',
                  borderRadius: '4px',
                  background: step >= i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              marginBottom: '2.5rem',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: 200,
                color: '#fff',
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em'
              }}>
                {steps[step].title}
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.95rem',
                fontWeight: 300
              }}>
                {steps[step].subtitle}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: 'rgba(239, 68, 68, 0.9)',
                  fontSize: '0.9rem',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    <div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Nombre del negocio"
                        required
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Nombre del dueño"
                        required
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>

                    <div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: formData.category ? '#fff' : 'rgba(255,255,255,0.5)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          cursor: 'pointer',
                          fontWeight: 300
                        }}
                      >
                        <option value="colmado">Colmado</option>
                        <option value="restaurante">Restaurante</option>
                        <option value="farmacia">Farmacia</option>
                        <option value="barberia">Barbería</option>
                        <option value="gym">Gimnasio</option>
                        <option value="cafeteria">Cafetería</option>
                        <option value="supermercado">Supermercado</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Teléfono"
                        required
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                  >
                    <div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Dirección completa"
                        required
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ciudad"
                        required
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontWeight: 300
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>

                    <div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descripción (opcional)"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.25rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontWeight: 300,
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    style={{
                      flex: 1,
                      padding: '1.1rem',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '1.1rem',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: registerMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: registerMutation.isPending ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!registerMutation.isPending) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {registerMutation.isPending ? 'Enviando...' : step === 2 ? 'Enviar solicitud' : 'Continuar'}
                </button>
              </div>
            </form>

            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
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
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                ← Volver
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
