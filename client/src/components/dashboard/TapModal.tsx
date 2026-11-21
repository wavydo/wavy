import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TapModal({ isOpen, onClose }: TapModalProps) {
  const [tapStatus, setTapStatus] = useState<'ready' | 'scanning' | 'success'>('ready');
  const [scannedPlace, setScannedPlace] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTapStatus('ready');
      setScannedPlace(null);
    }
  }, [isOpen]);

  const simulateTap = () => {
    setTapStatus('scanning');
    setTimeout(() => {
      setScannedPlace({ name: 'Casa 23', reward: '+250 Points' });
      setTapStatus('success');
    }, 1500);
  };

  const handleClose = () => {
    setTapStatus('ready');
    setScannedPlace(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.98)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#000',
              padding: '3rem 2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {/* Ready */}
            {tapStatus === 'ready' && (
              <>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 2.5rem',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }} />
                </div>

                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  letterSpacing: '-0.03em'
                }}>
                  Ready to TAP
                </h2>

                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '2.5rem',
                  lineHeight: 1.5
                }}>
                  Hold near reader
                </p>

                <button
                  onClick={simulateTap}
                  style={{
                    padding: '0.875rem 2rem',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Simulate
                </button>
              </>
            )}

            {/* Scanning */}
            {tapStatus === 'scanning' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 2.5rem',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#fff'
                  }}
                />

                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  letterSpacing: '-0.03em'
                }}>
                  Scanning...
                </h2>

                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.4)',
                  margin: 0
                }}>
                  Please wait
                </p>
              </>
            )}

            {/* Success */}
            {tapStatus === 'success' && scannedPlace && (
              <>
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 2.5rem',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 300
                }}>
                  ✓
                </div>

                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: '0 0 0.75rem 0',
                  letterSpacing: '-0.03em'
                }}>
                  Success
                </h2>

                <p style={{
                  fontSize: '1.125rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '2.5rem'
                }}>
                  {scannedPlace.name}
                </p>

                <div style={{
                  padding: '2rem 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '2.5rem'
                }}>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}>
                    Reward
                  </p>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.03em'
                  }}>
                    {scannedPlace.reward}
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  style={{
                    padding: '0.875rem 2rem',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
