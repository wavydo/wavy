import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EventsSectionProps {
  userData: any;
}

export default function EventsSection({ userData }: EventsSectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch events from API
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  // Purchase ticket mutation
  const purchaseMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/events/${eventId}/purchase`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to purchase ticket');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      alert('Ticket purchased successfully!');
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to purchase ticket');
    },
  });

  const events = eventsData?.events || [];

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Compact Header */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.03em'
        }}>
          Events
        </h1>
      </div>

      {/* Events Grid with Images */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        {events.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <p>No upcoming events</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Check back soon for new experiences</p>
          </div>
        ) : (
          events.map((item: any, i: number) => {
            const event = item.event;
            const establishment = item.establishment;
            const eventDate = new Date(event.date);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedEvent(item)}
                style={{
                  marginBottom: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {/* Event Cover Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: event.coverImage || event.image 
                    ? `url(${event.coverImage || event.image})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Price Badge */}
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
                    {event.price === '0' || event.price === 0 ? 'Free' : `RD$ ${parseFloat(event.price).toLocaleString()}`}
                  </div>

                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                  }} />

                  {/* Event Info Over Image */}
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      margin: '0 0 0.25rem 0',
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      {event.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.8)',
                      margin: 0,
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                    }}>
                      {event.venue}
                    </p>
                  </div>
                </div>

                {/* Bottom Info */}
                <div style={{
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.4)'
                }}>
                  <span>{eventDate.toLocaleDateString()} at {event.startTime}</span>
                  <span>{event.currentAttendees || 0} going</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
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
              height: '320px',
              background: selectedEvent.event.coverImage || selectedEvent.event.image
                ? `url(${selectedEvent.event.coverImage || selectedEvent.event.image})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedEvent(null)}
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
                height: '70%',
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
                {selectedEvent.event.title}
              </h2>

              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.5)',
                margin: '0 0 2rem 0'
              }}>
                {selectedEvent.event.venue}
              </p>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                padding: '2rem 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '2rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}>
                    When
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {new Date(selectedEvent.event.date).toLocaleDateString()} at {selectedEvent.event.startTime}
                    {selectedEvent.event.endTime && ` - ${selectedEvent.event.endTime}`}
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                  }}>
                    Attending
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {selectedEvent.event.currentAttendees || 0} people
                    {selectedEvent.event.capacity && ` / ${selectedEvent.event.capacity} max`}
                  </p>
                </div>

                {selectedEvent.establishment && (
                  <div>
                    <p style={{
                      fontSize: '0.6875rem',
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 600
                    }}>
                      Hosted by
                    </p>
                    <p style={{
                      fontSize: '1rem',
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {selectedEvent.establishment.businessName}
                    </p>
                  </div>
                )}
              </div>

              {selectedEvent.event.description && (
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.6,
                  marginBottom: '2rem'
                }}>
                  {selectedEvent.event.description}
                </p>
              )}

              {/* Price Box */}
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
                  Ticket price
                </p>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '-0.03em'
                }}>
                  {selectedEvent.event.price === '0' || selectedEvent.event.price === 0 
                    ? 'Free' 
                    : `RD$ ${parseFloat(selectedEvent.event.price).toLocaleString()}`}
                </p>
              </div>

              <button 
                onClick={() => purchaseMutation.mutate(selectedEvent.event.id)}
                disabled={purchaseMutation.isPending}
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: purchaseMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: purchaseMutation.isPending ? 0.6 : 1
                }}
              >
                {purchaseMutation.isPending ? 'Purchasing...' : 'Get ticket'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
