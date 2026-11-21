import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import gsap from 'gsap';

export default function ResetPassword() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid reset link');
    }
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.reset-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const resetMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Password reset failed');
      }
      
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
    },
    onError: (error: Error) => {
      setError(error.message);
      // If token is invalid/expired, redirect after 3 seconds
      if (error.message.includes('Invalid or expired')) {
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    resetMutation.mutate({ token, newPassword });
  };

  return (
    <div ref={rootRef} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', minHeight: '100vh', background: 'linear-gradient(180deg, #f3f3f6 0%, #fff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`
        .reset-input {
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
        .reset-input::placeholder {
          color: rgba(22,20,31,0.4);
        }
        .reset-input:focus {
          outline: none;
          border-color: #5e79db;
          box-shadow: 0 0 0 3px rgba(94,121,219,0.1);
        }
        .reset-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #16141f;
          color: white;
        }
        .reset-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22,20,31,0.3);
        }
        .reset-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="reset-content" style={{ background: 'white', borderRadius: 20, padding: 'clamp(2rem,5vw,3rem)', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <img 
              src="/roko.png" 
              alt="Wavy" 
              style={{ 
                width: '100%',
                maxWidth: 200,
                height: 'auto'
              }}
            />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#16141f', marginBottom: '0.5rem' }}>
            {success ? 'Password Reset!' : 'Create New Password'}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(22,20,31,0.6)' }}>
            {success ? 'You can now sign in with your new password' : 'Choose a strong password for your account'}
          </p>
        </div>

        {success ? (
          <div style={{ 
            padding: '16px 20px', 
            background: 'rgba(34,197,94,0.1)', 
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ marginBottom: 12 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#22c55e', marginBottom: 8 }}>
              Password successfully reset!
            </p>
            <p style={{ fontSize: 14, color: 'rgba(22,20,31,0.7)' }}>
              Redirecting to login...
            </p>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="reset-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                />
                <p style={{ fontSize: 12, color: 'rgba(22,20,31,0.5)', marginTop: 6 }}>
                  At least 8 characters
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16141f' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="reset-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetMutation.isPending || !token}
                className="reset-btn"
                style={{ marginTop: 8 }}
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <a
                href="/auth"
                onClick={(e) => { e.preventDefault(); setLocation('/auth'); }}
                style={{ fontSize: 14, color: '#5e79db', textDecoration: 'none', fontWeight: 600 }}
              >
                Back to login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
