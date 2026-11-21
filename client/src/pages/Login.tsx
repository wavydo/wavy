import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<'user' | 'establishment' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; userType: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.userType === 'user') {
        setLocation('/dashboard/user');
      } else if (data.userType === 'establishment') {
        setLocation('/dashboard/establishment');
      } else if (data.userType === 'admin') {
        setLocation('/dashboard/admin');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password, userType });
  };

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
        background: 'rgba(0,0,0,0.6)',
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
        <div style={{
          width: '100%',
          maxWidth: '440px'
        }}>
          <div style={{
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 200,
              color: '#fff',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              Bienvenido
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.95rem',
              fontWeight: 300
            }}>
              Inicia sesión para continuar
            </p>
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              color: 'rgba(239, 68, 68, 0.9)',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* User Type Pills */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              padding: '0.35rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {[
                { value: 'user', label: 'Cliente' },
                { value: 'establishment', label: 'Negocio' },
                { value: 'admin', label: 'Admin' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserType(type.value as any)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: userType === type.value 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: userType === type.value ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
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
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
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
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: '100%',
                padding: '1.1rem',
                background: '#fff',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loginMutation.isPending ? 'Iniciando...' : 'Continuar'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            {userType === 'user' && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 300 }}>
                ¿No tienes cuenta?{' '}
                <a
                  href="/auth"
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                >
                  Regístrate
                </a>
              </p>
            )}
            {userType === 'establishment' && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 300 }}>
                ¿Nuevo negocio?{' '}
                <a
                  href="/register/establishment"
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 500,
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                >
                  Solicita acceso
                </a>
              </p>
            )}
            <button
              onClick={() => setLocation('/')}
              style={{
                marginTop: '1.5rem',
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
        </div>
      </div>
    </div>
  );
}
