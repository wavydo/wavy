import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import BusinessLayout from '../../components/business/BusinessLayout';

export default function BusinessEvents() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    capacity: '',
    ticketPrice: '',
    image: ''
  });
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');

  // Fetch real events from database
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['businessEvents'],
    queryFn: async () => {
      const res = await fetch('/api/business/events', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  const allEvents = eventsData?.events || [];
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Prepare data - convert empty strings to null/undefined
      const eventData = {
        title: data.title,
        description: data.description || undefined,
        eventDate: data.eventDate, // Send as ISO string
        location: data.location || undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        ticketPrice: data.ticketPrice ? data.ticketPrice : undefined,
        image: data.image || undefined
      };
      
      const res = await fetch('/api/business/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        capacity: '',
        ticketPrice: '',
        image: ''
      });
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: typeof formData }) => {
      // Prepare data similar to create
      const eventData: any = {
        title: data.title,
        description: data.description || undefined,
        eventDate: typeof data.eventDate === 'string' ? new Date(data.eventDate) : data.eventDate,
        location: data.location || undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        image: data.image || undefined
      };
      
      // Only add ticketPrice if it exists and convert to string for decimal type
      if (data.ticketPrice !== undefined && data.ticketPrice !== null && data.ticketPrice !== '') {
        eventData.ticketPrice = String(data.ticketPrice);
      }
      
      const res = await fetch(`/api/business/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });
      
      if (res.status === 401 || res.status === 403) {
        setLocation('/auth');
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] });
      setEditingEvent(null);
      resetForm();
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      capacity: event.capacity?.toString() || '',
      ticketPrice: event.ticketPrice || '',
      image: event.image || ''
    });
  };

  const resetForm = () => {
    setEditingEvent(null);
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      capacity: '',
      ticketPrice: '',
      image: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Filter events based on status
  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (!event.active) return 'draft';
    if (eventDate > now) return 'upcoming';
    if (eventDate < now) return 'past';
    return 'upcoming'; // Default
  };

  const events = allEvents.filter((event: any) => {
    if (activeFilter === 'all') return true;
    return getEventStatus(event) === activeFilter;
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/events/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEvents'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString('en', { month: 'short' }),
      day: date.getDate()
    };
  };

  return (
    <BusinessLayout activeSection="events">
      <style>{`
        .editorial-header {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 40px;
            padding-bottom: 32px;
            border-bottom: 1px solid var(--border);
        }

        .section-number {
            font-size: 14px;
            font-weight: 600;
            color: #cbd5e1;
            min-width: 32px;
            padding-top: 4px;
        }

        .header-content {
            flex: 1;
        }

        .section-title {
            font-size: 32px;
            font-weight: 300;
            color: var(--ink);
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .section-description {
            font-size: 15px;
            color: var(--muted);
            line-height: 1.6;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--ink);
        }

        .btn:hover {
            border-color: var(--ink);
            transform: translateY(-1px);
        }

        .btn-primary {
            background: var(--ink);
            color: #ffffff;
            border-color: var(--ink);
        }

        .btn-primary:hover {
            background: #1a1f28;
        }

        .btn svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
        }

        /* Event Filter Tabs */
        .event-filters {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .filter-tab {
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            color: var(--muted);
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid transparent;
        }

        .filter-tab:hover {
            color: var(--ink);
            background: rgba(14, 17, 22, 0.04);
        }

        .filter-tab.active {
            background: var(--ink);
            color: #ffffff;
        }

        /* Events List */
        .events-list {
            display: grid;
            gap: 20px;
            width: 100%;
        }

        .event-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid var(--border);
            overflow: hidden;
            transition: all 180ms ease;
        }

        .event-card:hover {
            border-color: rgba(15, 23, 42, 0.16);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .event-content {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 24px;
            padding: 24px;
        }

        .event-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: rgba(14, 17, 22, 0.04);
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .event-month {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
        }

        .event-day {
            font-size: 32px;
            font-weight: 700;
            color: var(--ink);
            line-height: 1;
        }

        .event-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .event-header-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .event-status {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .event-status.upcoming {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
        }

        .event-status.live {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .event-status.past {
            background: rgba(91, 100, 114, 0.1);
            color: var(--muted);
        }

        .event-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--ink);
            margin: 0;
        }

        .event-description {
            font-size: 14px;
            color: var(--muted);
            line-height: 1.5;
        }

        .event-meta {
            display: flex;
            gap: 20px;
            margin-top: 8px;
        }

        .event-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--muted);
        }

        .event-meta-item svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
        }

        .event-stats {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 24px;
            border-left: 1px solid var(--border);
        }

        .event-stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
        }

        .event-stat-label {
            font-size: 11px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
        }

        .event-stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--ink);
        }

        .event-actions {
            display: flex;
            gap: 8px;
            padding: 16px 24px;
            border-top: 1px solid var(--border);
            background: rgba(14, 17, 22, 0.02);
        }

        .event-btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 180ms ease;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--ink);
        }

        .event-btn:hover {
            background: rgba(14, 17, 22, 0.04);
        }

        @media (max-width: 1024px) {
            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }

            .event-content {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .event-stats {
                flex-direction: row;
                padding-left: 0;
                padding-top: 16px;
                border-left: none;
                border-top: 1px solid var(--border);
            }

            .event-stat {
                flex: 1;
                align-items: flex-start;
            }
        }
      `}</style>

      <div className="editorial-header">
        <span className="section-number">02</span>
        <div className="header-content">
          <h1 className="section-title">Events</h1>
          <p className="section-description">Create and manage events, experiences, and ticketing</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Event
        </button>
      </div>

      {/* Event Filters */}
      <div className="event-filters">
        <div className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Events</div>
        <div className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveFilter('upcoming')}>Upcoming</div>
        <div className={`filter-tab ${activeFilter === 'live' ? 'active' : ''}`} onClick={() => setActiveFilter('live')}>Live</div>
        <div className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`} onClick={() => setActiveFilter('past')}>Past</div>
        <div className={`filter-tab ${activeFilter === 'draft' ? 'active' : ''}`} onClick={() => setActiveFilter('draft')}>Draft</div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          padding: '60px 40px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)', 
          textAlign: 'center' 
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            {activeFilter === 'all' ? 'No events yet' : `No ${activeFilter} events`}
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '24px' }}>
            Create your first event to start engaging with customers
          </p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Event
          </button>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event: any) => {
            const status = getEventStatus(event);
            const dateInfo = formatDate(event.eventDate);
            return (
              <div key={event.id} className="event-card">
                <div className="event-content">
                  <div className="event-date">
                    <span className="event-month">{dateInfo.month}</span>
                    <span className="event-day">{dateInfo.day}</span>
                  </div>
                  <div className="event-details">
                    <div className="event-header-row">
                      <span className={`event-status ${status}`}>
                        {status === 'live' ? 'Live Now' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <h3 className="event-title">{event.title}</h3>
                    </div>
                    <p className="event-description">
                      {event.description || 'No description provided'}
                    </p>
                    <div className="event-meta">
                      {event.location && (
                        <div className="event-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.ticketPrice && parseFloat(event.ticketPrice) > 0 && (
                        <div className="event-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                            <path d="M12 2v20M2 12h20"/>
                          </svg>
                          <span>RD${parseFloat(event.ticketPrice).toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="event-stats">
                    <div className="event-stat">
                      <span className="event-stat-label">Capacity</span>
                      <span className="event-stat-value">{event.capacity || 'Unlimited'}</span>
                    </div>
                    {event.currentAttendees !== undefined && (
                      <div className="event-stat">
                        <span className="event-stat-label">Attending</span>
                        <span className="event-stat-value">{event.currentAttendees}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="event-actions">
                  <button className="event-btn" onClick={(e) => { 
                    e.stopPropagation();
                    setEditingEvent(null);
                    setFormData({
                      title: event.title,
                      description: event.description || '',
                      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
                      location: event.location || '',
                      capacity: event.capacity?.toString() || '',
                      ticketPrice: event.ticketPrice || '',
                      image: event.image || ''
                    });
                    setShowCreateModal(true);
                  }}>Ver Detalles</button>
                  <button className="event-btn" onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>Editar</button>
                  <button 
                    className="event-btn" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                    style={{ color: 'var(--error)' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showCreateModal || editingEvent) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }} onClick={() => resetForm()}>
          <div style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Event Title *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Weekend Brunch Special"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Description
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your event..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Event Date & Time *
                </label>
                <input 
                  type="datetime-local"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Location
                </label>
                <input 
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Main Dining Room"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Capacity
                  </label>
                  <input 
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g., 50"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Leave empty for unlimited
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                    Ticket Price (RD$)
                  </label>
                  <input 
                    type="number"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                    placeholder="e.g., 1500"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    0 for free events
                  </small>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--ink)' }}>
                  Cover Image
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: imageInputType === 'url' ? 'var(--ink)' : '#ffffff',
                      color: imageInputType === 'url' ? '#ffffff' : 'var(--ink)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('upload')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: imageInputType === 'upload' ? 'var(--ink)' : '#ffffff',
                      color: imageInputType === 'upload' ? '#ffffff' : 'var(--ink)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    Subir Archivo
                  </button>
                </div>

                {imageInputType === 'url' ? (
                  <input 
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                    {formData.image && (
                      <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px', 
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                          }} 
                        />
                      </div>
                    )}
                  </div>
                )}
                <small style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  Opcional - agrega una imagen para tu evento
                </small>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn" 
                  onClick={() => resetForm()}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? (editingEvent ? 'Updating...' : 'Creating...') 
                    : (editingEvent ? 'Update Event' : 'Create Event')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OLD HARDCODED EVENTS - REMOVED */}
      <div style={{ display: 'none' }}>
        {/* Live Event */}
        <div className="event-card">
          <div className="event-content">
            <div className="event-date">
              <span className="event-month">Aug</span>
              <span className="event-day">30</span>
            </div>
            <div className="event-details">
              <div className="event-header-row">
                <span className="event-status live">Live Now</span>
                <h3 className="event-title">Weekend Brunch Special</h3>
              </div>
              <p className="event-description">
                Unlimited brunch buffet with live music. TAPP members get complimentary mimosas and 2X points on all purchases.
              </p>
              <div className="event-meta">
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>10:00 AM - 3:00 PM</span>
                </div>
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                  <span>RD$1,500/person</span>
                </div>
              </div>
            </div>
            <div className="event-stats">
              <div className="event-stat">
                <span className="event-stat-label">Attending</span>
                <span className="event-stat-value">127</span>
              </div>
              <div className="event-stat">
                <span className="event-stat-label">Revenue</span>
                <span className="event-stat-value">RD$190K</span>
              </div>
            </div>
          </div>
          <div className="event-actions">
            <button className="event-btn">View Details</button>
            <button className="event-btn">Manage Tickets</button>
            <button className="event-btn">Edit</button>
          </div>
        </div>

        {/* Upcoming Event */}
        <div className="event-card">
          <div className="event-content">
            <div className="event-date">
              <span className="event-month">Sep</span>
              <span className="event-day">05</span>
            </div>
            <div className="event-details">
              <div className="event-header-row">
                <span className="event-status upcoming">Upcoming</span>
                <h3 className="event-title">Wine Tasting Night</h3>
              </div>
              <p className="event-description">
                Premium wine selection from local vineyards. Includes 5-course pairing menu and sommelier guide. Limited to 50 seats.
              </p>
              <div className="event-meta">
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>7:00 PM - 11:00 PM</span>
                </div>
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                  <span>RD$2,800/person</span>
                </div>
              </div>
            </div>
            <div className="event-stats">
              <div className="event-stat">
                <span className="event-stat-label">Tickets Sold</span>
                <span className="event-stat-value">38/50</span>
              </div>
              <div className="event-stat">
                <span className="event-stat-label">Revenue</span>
                <span className="event-stat-value">RD$106K</span>
              </div>
            </div>
          </div>
          <div className="event-actions">
            <button className="event-btn">View Details</button>
            <button className="event-btn">Manage Tickets</button>
            <button className="event-btn">Edit</button>
          </div>
        </div>

        {/* Past Event */}
        <div className="event-card">
          <div className="event-content">
            <div className="event-date">
              <span className="event-month">Aug</span>
              <span className="event-day">22</span>
            </div>
            <div className="event-details">
              <div className="event-header-row">
                <span className="event-status past">Past</span>
                <h3 className="event-title">Live Jazz Thursday</h3>
              </div>
              <p className="event-description">
                Smooth jazz performances by local artists. Signature cocktails and tapas menu available all night.
              </p>
              <div className="event-meta">
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>8:00 PM - 12:00 AM</span>
                </div>
                <div className="event-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                  <span>RD$800/person</span>
                </div>
              </div>
            </div>
            <div className="event-stats">
              <div className="event-stat">
                <span className="event-stat-label">Attended</span>
                <span className="event-stat-value">89</span>
              </div>
              <div className="event-stat">
                <span className="event-stat-label">Revenue</span>
                <span className="event-stat-value">RD$71K</span>
              </div>
            </div>
          </div>
          <div className="event-actions">
            <button className="event-btn">View Report</button>
            <button className="event-btn">Customer Feedback</button>
            <button className="event-btn">Duplicate Event</button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
