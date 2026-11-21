import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PerksSectionProps {
  userData: any;
  onNavigateToSettings?: () => void;
}

export default function PerksSection({ userData, onNavigateToSettings }: PerksSectionProps) {
  const [selectedPerk, setSelectedPerk] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch perks from API
  const { data: perksData, isLoading } = useQuery({
    queryKey: ['perks'],
    queryFn: async () => {
      const res = await fetch('/api/perks', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch perks');
      return res.json();
    },
  });

  // Redeem perk mutation
  const redeemMutation = useMutation({
    mutationFn: async (perkId: string) => {
      const res = await fetch(`/api/perks/${perkId}/redeem`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to redeem perk');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perks'] });
      alert('Perk redeemed successfully!');
      setSelectedPerk(null);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to redeem perk');
    },
  });

  const perks = perksData?.perks || [];

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Loading perks...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Compact Header */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem' }}>
        <p style={{
          fontSize: '0.6875rem',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '0.25rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          {new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
        </p>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.03em'
        }}>
          {userData?.user?.fullName?.split(' ')[0] || 'Friend'}
        </h1>
      </div>

      {/* Points Banner */}
      <div style={{
        margin: '0 1.25rem 1.5rem',
        background: '#fff',
        color: '#000',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <p style={{
            fontSize: '0.6875rem',
            opacity: 0.5,
            marginBottom: '0.375rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Rewards
          </p>
          <p style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1
          }}>
            {userData?.user?.points?.toLocaleString() || 0}
          </p>
        </div>
        <button style={{
          background: '#000',
          color: '#fff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Use
        </button>
      </div>

      {/* Perks Grid with Images */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        <h2 style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          margin: '0 0 1rem 0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)'
        }}>
          Available Perks ({perks.length})
        </h2>

        {perks.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <p>No perks available right now</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Check back soon for new offers</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {perks.map((item: any, i: number) => {
              const perk = item.perk;
              const establishment = item.establishment;
              
              return (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedPerk(item)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              {/* Image */}
              <div style={{
                width: '100%',
                height: '160px',
                background: perk.image ? `url(${perk.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {/* Offer Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  background: '#fff',
                  color: '#000',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em'
                }}>
                  {perk.type === 'discount' && `${perk.value}% OFF`}
                  {perk.type === 'cashback' && `${perk.value}% Cashback`}
                  {perk.type === 'points' && `+${perk.value} pts`}
                  {perk.type === 'freebie' && 'Free Item'}
                </div>

                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  margin: '0 0 0.25rem 0',
                  letterSpacing: '-0.01em'
                }}>
                  {establishment?.businessName || 'Establishment'}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.5)',
                  margin: '0 0 0.75rem 0'
                }}>
                  {establishment?.category || perk.title}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.4)'
                }}>
                  <span>{establishment?.city || 'Santo Domingo'}</span>
                  <span>Valid until {new Date(perk.validUntil).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}
    </div>

      {/* Modal */}
      {selectedPerk && (
        <div
          onClick={() => setSelectedPerk(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            overflowY: 'auto'
          }}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#000',
              minHeight: '100vh'
            }}
          >
            {/* Hero Image */}
            <div style={{
              width: '100%',
              height: '280px',
              background: selectedPerk.perk.image ? `url(${selectedPerk.perk.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedPerk(null)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              {/* Gradient */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'linear-gradient(to top, #000, transparent)'
              }} />
            </div>

            {/* Content */}
            <div style={{ padding: '2rem 1.5rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.03em'
              }}>
                {selectedPerk.establishment?.businessName || 'Establishment'}
              </h2>

              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.5)',
                margin: '0 0 2rem 0'
              }}>
                {selectedPerk.establishment?.category} · {selectedPerk.establishment?.city}
              </p>

              {/* Offer Box */}
              <div style={{
                background: '#fff',
                color: '#000',
                padding: '2rem 1.5rem',
                marginBottom: '2rem'
              }}>
                <p style={{
                  fontSize: '0.6875rem',
                  opacity: 0.5,
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600
                }}>
                  Your offer
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  margin: '0 0 1rem 0',
                  letterSpacing: '-0.03em'
                }}>
                  {selectedPerk.perk.type === 'discount' && `${selectedPerk.perk.value}% OFF`}
                  {selectedPerk.perk.type === 'cashback' && `${selectedPerk.perk.value}% Cashback`}
                  {selectedPerk.perk.type === 'points' && `+${selectedPerk.perk.value} Points`}
                  {selectedPerk.perk.type === 'freebie' && 'Free Item'}
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  opacity: 0.7,
                  margin: 0
                }}>
                  {selectedPerk.perk.description || selectedPerk.perk.title}
                </p>
              </div>

              <p style={{
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '2rem',
                lineHeight: 1.6
              }}>
                Show this screen and tap your TAPP card at {selectedPerk.establishment?.businessName} to redeem.
              </p>

              <button 
                onClick={() => redeemMutation.mutate(selectedPerk.perk.id)}
                disabled={redeemMutation.isPending}
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: redeemMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: redeemMutation.isPending ? 0.6 : 1
                }}
              >
                {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
