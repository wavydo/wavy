import { useState, useEffect } from 'react';
import { Mail, Send, Trash2, Eye, RefreshCw, Plus } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  type: 'sent' | 'received';
  resendId: string | null;
  status: string;
  error: string | null;
  createdAt: string;
  readAt: string | null;
}

interface EmailOption {
  value: string;
  label: string;
}

export default function EmailsTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailOptions, setEmailOptions] = useState<EmailOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  // Form states
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch email options
  const fetchEmailOptions = async () => {
    try {
      const res = await fetch('/api/admin/emails/options', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setEmailOptions(data.options);
        if (data.options.length > 0) {
          setFrom(data.options[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching email options:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchEmailOptions();
  }, []);

  // Send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ from, to, subject, body }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Email sent successfully!');
        setShowCompose(false);
        setTo('');
        setSubject('');
        setBody('');
        fetchEmails();
      } else {
        alert('Failed to send email: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // Delete email
  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return;

    try {
      const res = await fetch(`/api/admin/emails/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        setEmails(emails.filter((e) => e.id !== id));
        setSelectedEmail(null);
      } else {
        alert('Failed to delete email');
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      alert('Failed to delete email');
    }
  };

  // Mark email as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/emails/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        setEmails(
          emails.map((e) =>
            e.id === id ? { ...e, readAt: data.email.readAt } : e
          )
        );
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  // View email
  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    if (email.type === 'received' && !email.readAt) {
      handleMarkAsRead(email.id);
    }
  };

  return (
    <div className="emails-tab">
      <div className="emails-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Email Management</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Send and receive emails via Resend
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchEmails}
            style={{
              padding: '10px 15px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowCompose(true)}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Plus size={16} />
            Compose Email
          </button>
        </div>
      </div>

      {showCompose && (
        <div
          className="compose-modal"
          style={{
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
          }}
          onClick={() => setShowCompose(false)}
        >
          <div
            className="compose-form"
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Compose Email</h3>
            <form onSubmit={handleSendEmail}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                  From
                </label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                >
                  {emailOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                  To
                </label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  placeholder="recipient@example.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Email subject"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                  Message (HTML supported)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={10}
                  placeholder="Email body (HTML supported)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: '10px 20px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Send size={16} />
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEmail && (
        <div
          className="email-view-modal"
          style={{
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
          }}
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="email-view"
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{selectedEmail.subject}</h3>
              <button
                onClick={() => handleDeleteEmail(selectedEmail.id)}
                style={{
                  padding: '8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>From:</strong> {selectedEmail.from}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>To:</strong> {selectedEmail.to}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Date:</strong> {new Date(selectedEmail.createdAt).toLocaleString()}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Type:</strong>{' '}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: selectedEmail.type === 'sent' ? '#dbeafe' : '#dcfce7',
                    color: selectedEmail.type === 'sent' ? '#1e40af' : '#15803d',
                    fontSize: '12px',
                  }}
                >
                  {selectedEmail.type}
                </span>
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: selectedEmail.status === 'sent' || selectedEmail.status === 'delivered' ? '#dcfce7' : '#fee2e2',
                    color: selectedEmail.status === 'sent' || selectedEmail.status === 'delivered' ? '#15803d' : '#991b1b',
                    fontSize: '12px',
                  }}
                >
                  {selectedEmail.status}
                </span>
              </p>
            </div>

            <div
              style={{
                padding: '20px',
                background: '#f9fafb',
                borderRadius: '8px',
                minHeight: '200px',
              }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
            />

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedEmail(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="emails-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading emails...</div>
        ) : emails.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <Mail size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>No emails yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleViewEmail(email)}
                style={{
                  padding: '20px',
                  background: email.readAt ? 'white' : '#f0f0f0',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <Mail size={16} style={{ opacity: 0.5 }} />
                      <strong>{email.subject}</strong>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: email.type === 'sent' ? '#dbeafe' : '#dcfce7',
                          color: email.type === 'sent' ? '#1e40af' : '#15803d',
                          fontSize: '11px',
                        }}
                      >
                        {email.type}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                      <strong>From:</strong> {email.from} → <strong>To:</strong> {email.to}
                    </p>
                    <p style={{ margin: '5px 0', color: '#999', fontSize: '12px' }}>
                      {new Date(email.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmail(email.id);
                    }}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
