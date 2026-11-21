import { useState, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import gsap from 'gsap';

export default function Auth() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: 'user' as 'user' | 'establishment' | 'admin'
  });

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-logo',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }
      );

      gsap.fromTo('.auth-form',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [mode]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: typeof loginData) => {
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
        setLocation('/business/overview');
      } else if (data.userType === 'admin') {
        setLocation('/dashboard/admin');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: typeof signupData) => {
      const res = await fetch('/api/auth/register/user', {
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
      setLocation('/dashboard/user');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send reset email');
      }
      
      return res.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);
    forgotPasswordMutation.mutate(forgotEmail);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(loginData);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    signupMutation.mutate(signupData);
  };

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', minHeight: '100vh', background: 'white', display: 'flex' }}>
      <style>{`
        @font-face {
          font-family: 'Modulus';
          src: url('/modulus.ttf') format('truetype');
        }
        .auth-input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
          background: white;
          color: #16141f;
        }
        .auth-input::placeholder {
          color: rgba(22,20,31,0.4);
        }
        .auth-input:focus {
          outline: none;
          border-color: #5e79db;
          box-shadow: 0 0 0 3px rgba(94,121,219,0.1);
        }
        .auth-btn {
          width: 100%;
          padding: 2px 1px !important;
          border-radius: 10px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-btn-primary {
          background: #16141f;
          color: white;
        }
        .auth-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22,20,31,0.3);
        }
        .auth-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-btn-social {
          background: white;
          color: #16141f;
          border: 1.5px solid rgba(0,0,0,0.1);
        }
        .auth-btn-social:hover {
          border-color: rgba(0,0,0,0.2);
          background: #fafafa;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (max-width: 968px) {
          .auth-split {
            flex-direction: column !important;
          }
          .auth-left {
            order: 1;
            min-height: auto !important;
            padding: 2rem 1.5rem 0 1.5rem !important;
            justify-content: flex-start !important;
            text-align: center !important;
            display: flex !important;
            align-items: center !important;
          }
          .auth-left .auth-logo {
            margin-bottom: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            text-align: center !important;
          }
          .auth-left .auth-logo img {
            margin-bottom: -2rem !important;
            margin-left: auto !important;
            margin-right: auto !important;
            max-width: 140px !important;
            position: relative !important;
            z-index: 2 !important;
            display: block !important;
            transform: translateX(0) !important;
          }
          .auth-left .auth-logo h1 {
            position: relative !important;
            z-index: 1 !important;
            padding-top: 0 !important;
            margin-top: -1rem !important;
            margin-bottom: 0.15rem !important;
            margin-left: 0 !important;
            font-size: 24px !important;
            text-align: center !important;
          }
          .auth-left .auth-logo p {
            position: relative !important;
            z-index: 1 !important;
            font-size: 12px !important;
            max-width: 100% !important;
            margin-bottom: 1.25rem !important;
            margin-left: 0 !important;
            text-align: center !important;
          }
          .auth-right {
            order: 2;
            min-height: auto !important;
            padding: 1.5rem 1.5rem 3rem 1.5rem !important;
          }
          .auth-form {
            max-width: 100% !important;
          }
          .auth-form h2 {
            font-size: 22px !important;
          }
          .auth-form > div:first-child p {
            font-size: 13px !important;
          }
          .auth-input {
            padding: 12px 14px !important;
            font-size: 14px !important;
          }
          label {
            font-size: 13px !important;
          }
          /* Forgot password modal mobile */
          .auth-forgot-modal {
            padding: 1.5rem !important;
            max-width: 90% !important;
          }
          .auth-forgot-modal h3 {
            font-size: 20px !important;
          }
          .auth-forgot-modal p {
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="auth-split" style={{ display: 'flex', width: '100%', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        
        {/* Back button - top left */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); setLocation('/'); }}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            margin: 0,
            background: 'none',
            border: 'none',
            boxShadow: 'none',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(22,20,31,0.5)',
            textDecoration: 'none',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#16141f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(22,20,31,0.5)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to home</span>
        </a>
        
        {/* Left Side - Logo */}
        <div className="auth-left" style={{ flex: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '4rem 4rem 4rem 6rem', minHeight: '100vh', position: 'relative' }}>
          <div className="auth-logo" style={{ textAlign: 'left', position: 'relative', zIndex: 2 }}>
            <img 
              src="/roko.png" 
              alt="Wavy" 
              style={{ 
                width: '100%',
                maxWidth: 280,
                height: 'auto',
                marginBottom: '-1.5rem',
                marginLeft: 'calc(-4rem - 10px)'
              }}
            />
            <h1 style={{ 
              fontFamily: "'Modulus', -apple-system, sans-serif", 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: 800, 
              color: '#16141f',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
              background: 'transparent'
            }}>
              wavy
            </h1>
            <p style={{ 
              fontSize: 'clamp(16px, 2vw, 18px)', 
              color: 'rgba(22,20,31,0.6)', 
              lineHeight: 1.6, 
              maxWidth: 300,
              background: 'transparent'
            }}>
              Discover places and offers around you
            </p>
          </div>

          {/* Vertical divider */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: '10%',
            bottom: '10%',
            width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, transparent)'
          }} />
        </div>

        {/* Right Side - Form */}
        <div className="auth-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 3rem', minHeight: '100vh' }}>
          <div className="auth-form" style={{ width: '100%', maxWidth: 420 }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 28, fontWeight: 600, color: '#16141f', marginBottom: '0.5rem' }}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.6)' }}>
                {mode === 'login' ? 'Sign in to continue' : 'Get started with Wavy'}
              </p>
            </div>

            {/* Social Buttons */}
            <div style={{ display: 'grid', gap: 10, marginBottom: '2rem' }}>
              <button className="auth-btn auth-btn-social" style={{ padding: '2px 1px', fontSize: '13px', fontWeight: 500, borderRadius: '10px' }} onClick={() => console.log('Google')}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button className="auth-btn auth-btn-social" style={{ padding: '2px 1px', fontSize: '13px', fontWeight: 500, borderRadius: '10px' }} onClick={() => console.log('Apple')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              <button className="auth-btn auth-btn-social" style={{ padding: '2px 1px', fontSize: '13px', fontWeight: 500, borderRadius: '10px' }} onClick={() => console.log('Passkey')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="16" r="1"/>
                  <rect x="3" y="10" width="18" height="12" rx="2"/>
                  <path d="M7 10V7a5 5 0 0110 0v3"/>
                </svg>
                Sign in with Passkey
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }}></div>
              <span style={{ fontSize: 13, color: 'rgba(22,20,31,0.5)', fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }}></div>
            </div>

            {error && (
              <div style={{ 
                padding: '12px 16px', 
                background: 'rgba(239,68,68,0.1)', 
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12, 
                color: '#dc2626',
                fontSize: 14,
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    className="auth-input"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: '#16141f' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#5e79db', 
                        fontSize: 13, 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    className="auth-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#5e79db' }}
                  />
                  <span style={{ color: 'rgba(22,20,31,0.7)' }}>Keep me signed in</span>
                </label>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="auth-btn auth-btn-primary"
                  style={{ marginTop: 8, padding: '2px 1px', fontSize: '13px', fontWeight: 500, borderRadius: '10px' }}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    className="auth-input"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Phone number
                  </label>
                  <input
                    type="tel"
                    className="auth-input"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="auth-input"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <p style={{ fontSize: 12, color: 'rgba(22,20,31,0.5)', marginTop: 6 }}>
                    At least 8 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="auth-btn auth-btn-primary"
                  style={{ marginTop: 8, padding: '2px 1px', fontSize: '13px', fontWeight: 500, borderRadius: '10px' }}
                >
                  {signupMutation.isPending ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'nowrap' }}>
                <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#5e79db', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: 0, whiteSpace: 'nowrap' }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <p style={{ fontSize: 12, color: 'rgba(22,20,31,0.5)', textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
              By continuing, you agree to Wavy's{' '}
              <a href="/terms" style={{ color: '#5e79db', textDecoration: 'none' }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: '#5e79db', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          onClick={() => { setShowForgotPassword(false); setResetSuccess(false); setError(''); setForgotEmail(''); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="auth-forgot-modal"
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#16141f', marginBottom: '0.4rem' }}>
                  Reset password
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(22,20,31,0.6)' }}>
                  We'll send you a link to reset your password
                </p>
              </div>
              <button
                onClick={() => { setShowForgotPassword(false); setResetSuccess(false); setError(''); setForgotEmail(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 8,
                  cursor: 'pointer',
                  color: 'rgba(22,20,31,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#16141f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(22,20,31,0.4)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {resetSuccess ? (
              <div style={{ 
                padding: '16px 20px', 
                background: 'rgba(34,197,94,0.1)', 
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12,
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>
                      Email sent!
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(22,20,31,0.7)', lineHeight: 1.5 }}>
                      Check your inbox for a password reset link. It may take a few minutes to arrive.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(239,68,68,0.1)', 
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 12, 
                    color: '#dc2626',
                    fontSize: 14,
                    marginBottom: '1.5rem'
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      className="auth-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="auth-btn auth-btn-primary"
                    style={{ 
                      padding: '2px 1px', 
                      fontSize: '13px', 
                      fontWeight: 500,
                      borderRadius: '10px',
                      width: '100%'
                    }}
                  >
                    {forgotPasswordMutation.isPending ? 'Sending...' : 'Send link'}
                  </button>
                </form>
              </>
            )}

            {resetSuccess && (
              <button
                onClick={() => { setShowForgotPassword(false); setResetSuccess(false); setError(''); setForgotEmail(''); }}
                className="auth-btn auth-btn-primary"
                style={{ 
                  padding: '8px 16px', 
                  fontSize: 13, 
                  fontWeight: 500,
                  width: '100%'
                }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
