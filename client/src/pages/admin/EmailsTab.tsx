import { useState, useEffect } from 'react';
import { EnvelopeSimple, PaperPlaneTilt, Trash, ArrowsClockwise, Plus, X } from 'phosphor-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

export default function EmailsTab() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  // Form states
  const [fromName, setFromName] = useState('');
  const [fromAlias, setFromAlias] = useState('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  // Add recipient field
  const addRecipient = () => {
    if (recipients.length < 5) {
      setRecipients([...recipients, '']);
    }
  };

  // Remove recipient field
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  // Update recipient value
  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  // Add CC email
  const addCcEmail = () => {
    if (ccEmails.length < 2) {
      setCcEmails([...ccEmails, '']);
    }
  };

  // Remove CC email
  const removeCcEmail = (index: number) => {
    setCcEmails(ccEmails.filter((_, i) => i !== index));
  };

  // Update CC email value
  const updateCcEmail = (index: number, value: string) => {
    const newCcEmails = [...ccEmails];
    newCcEmails[index] = value;
    setCcEmails(newCcEmails);
  };

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

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

  useEffect(() => {
    fetchEmails();
  }, []);

  // Send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const fullFrom = fromName ? `${fromName} <${fromAlias}@wavy.do>` : `${fromAlias}@wavy.do`;
    
    // Filter out empty recipients
    const validRecipients = recipients.filter(r => r.trim() !== '');
    const validCcEmails = ccEmails.filter(cc => cc.trim() !== '');

    console.log('🔍 Frontend - Preparing to send email:', {
      fromName,
      fromAlias,
      fullFrom,
      recipients,
      validRecipients,
      ccEmails,
      validCcEmails,
      subject,
      bodyLength: body.length
    });

    if (validRecipients.length === 0) {
      alert('Please add at least one recipient');
      setSending(false);
      return;
    }

    const payload = { 
      from: fullFrom, 
      to: validRecipients, 
      cc: validCcEmails.length > 0 ? validCcEmails : undefined,
      subject, 
      body 
    };

    console.log('🔍 Frontend - Sending payload:', JSON.stringify(payload, null, 2));

    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('🔍 Frontend - Response status:', res.status);

      const data = await res.json();
      console.log('🔍 Frontend - Response data:', data);

      if (data.success) {
        alert('Email sent successfully!');
        setShowCompose(false);
        setFromName('');
        setFromAlias('');
        setRecipients(['']);
        setCcEmails([]);
        setSubject('');
        setBody('');
        fetchEmails();
      } else {
        alert('Failed to send email: ' + data.error);
      }
    } catch (error) {
      console.error('🔍 Frontend - Error sending email:', error);
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
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px',
            color: '#1a1a1a',
            fontWeight: 600
          }}>
            Email Management
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: '#666',
            fontSize: '14px'
          }}>
            Send and receive emails via Resend
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchEmails}
            style={{
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            <ArrowsClockwise size={18} weight="bold" />
            Refresh
          </button>
          <button
            onClick={() => setShowCompose(true)}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5558e3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366f1';
            }}
          >
            <Plus size={18} weight="bold" />
            Compose Email
          </button>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div
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
            padding: '20px'
          }}
          onClick={() => setShowCompose(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a1a', fontWeight: 600 }}>
                Compose Email
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#666'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSendEmail}>
              {/* From Name Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#333'
                }}>
                  From Name (optional)
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Wavy Team"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    color: '#333'
                  }}
                />
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  The display name that appears in the recipient's inbox
                </p>
              </div>

              {/* From Field with Alias */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#333'
                }}>
                  From Email
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  background: 'white'
                }}>
                  <input
                    type="text"
                    value={fromAlias}
                    onChange={(e) => setFromAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    required
                    placeholder="alias"
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#333',
                      flex: 1,
                      minWidth: '80px'
                    }}
                  />
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    whiteSpace: 'nowrap'
                  }}>
                    @wavy.do
                  </span>
                </div>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  Examples: support, noreply, hello, team, info
                </p>
                {fromName && fromAlias && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#0369a1'
                  }}>
                    <strong>Preview:</strong> {fromName} &lt;{fromAlias}@wavy.do&gt;
                  </div>
                )}
              </div>

              {/* To Field - Multiple Recipients */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{ 
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    To (Recipients)
                  </label>
                  {recipients.length < 5 && (
                    <button
                      type="button"
                      onClick={addRecipient}
                      style={{
                        padding: '4px 12px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={14} weight="bold" />
                      Add Recipient
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recipients.map((recipient, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        required={index === 0}
                        placeholder={`recipient${index + 1}@example.com`}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0',
                          fontSize: '14px',
                          color: '#333'
                        }}
                      />
                      {recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          style={{
                            padding: '8px',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={18} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  Add up to 5 recipients
                </p>
              </div>

              {/* CC Field - Additional Recipients */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{ 
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    CC (Optional - Copy Recipients)
                  </label>
                  {ccEmails.length < 2 && (
                    <button
                      type="button"
                      onClick={addCcEmail}
                      style={{
                        padding: '4px 12px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={14} weight="bold" />
                      Add CC
                    </button>
                  )}
                </div>
                {ccEmails.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ccEmails.map((cc, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="email"
                          value={cc}
                          onChange={(e) => updateCcEmail(index, e.target.value)}
                          placeholder={`cc${index + 1}@example.com`}
                          style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                            color: '#333'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeCcEmail(index)}
                          style={{
                            padding: '8px',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={18} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  Add up to 2 additional recipients who will receive a copy
                </p>
              </div>

              {/* Subject Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#333'
                }}>
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
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    color: '#333'
                  }}
                />
              </div>

              {/* Rich Text Editor */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#333'
                }}>
                  Message
                </label>
                <div style={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <ReactQuill
                    theme="snow"
                    value={body}
                    onChange={setBody}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your email message here..."
                    style={{ 
                      minHeight: '300px',
                      background: 'white'
                    }}
                  />
                </div>
                <p style={{ 
                  margin: '6px 0 0 0', 
                  fontSize: '12px', 
                  color: '#999'
                }}>
                  Use the toolbar to format text, add links, and insert images
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: '10px 20px',
                    background: sending ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <PaperPlaneTilt size={18} weight="bold" />
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Email Modal */}
      {selectedEmail && (
        <div
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
            padding: '20px'
          }}
          onClick={() => setSelectedEmail(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '20px',
              gap: '15px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a1a', fontWeight: 600, flex: 1 }}>
                {selectedEmail.subject}
              </h3>
              <button
                onClick={() => handleDeleteEmail(selectedEmail.id)}
                style={{
                  padding: '8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash size={18} weight="bold" />
              </button>
            </div>

            <div style={{ 
              marginBottom: '20px', 
              paddingBottom: '20px', 
              borderBottom: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                <strong>From:</strong> <span style={{ color: '#666' }}>{selectedEmail.from}</span>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                <strong>To:</strong> <span style={{ color: '#666' }}>{selectedEmail.to}</span>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                <strong>Date:</strong> <span style={{ color: '#666' }}>
                  {new Date(selectedEmail.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                <strong>Type:</strong>{' '}
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: selectedEmail.type === 'sent' ? '#dbeafe' : '#dcfce7',
                    color: selectedEmail.type === 'sent' ? '#1e40af' : '#15803d',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {selectedEmail.type}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#333' }}>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: selectedEmail.status === 'sent' || selectedEmail.status === 'delivered' 
                      ? '#dcfce7' 
                      : '#fee2e2',
                    color: selectedEmail.status === 'sent' || selectedEmail.status === 'delivered' 
                      ? '#15803d' 
                      : '#991b1b',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {selectedEmail.status}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                background: '#f9fafb',
                borderRadius: '8px',
                minHeight: '200px',
                color: '#333',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
            />

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedEmail(null)}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emails List */}
      <div>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            color: '#666'
          }}>
            Loading emails...
          </div>
        ) : emails.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            color: '#999'
          }}>
            <EnvelopeSimple size={64} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p style={{ fontSize: '16px', margin: 0 }}>No emails yet</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gap: '12px'
          }}>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleViewEmail(email)}
                style={{
                  padding: '20px',
                  background: email.readAt ? 'white' : '#f0f4ff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  gap: '15px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <EnvelopeSimple size={18} style={{ color: '#6366f1', flexShrink: 0 }} weight="bold" />
                      <strong style={{ 
                        fontSize: '15px',
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {email.subject}
                      </strong>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          background: email.type === 'sent' ? '#dbeafe' : '#dcfce7',
                          color: email.type === 'sent' ? '#1e40af' : '#15803d',
                          fontSize: '11px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {email.type}
                      </span>
                    </div>
                    <p style={{ 
                      margin: '8px 0', 
                      color: '#666', 
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <strong style={{ color: '#333' }}>From:</strong> {email.from} 
                      {' → '}
                      <strong style={{ color: '#333' }}>To:</strong> {email.to}
                    </p>
                    <p style={{ 
                      margin: '0', 
                      color: '#999', 
                      fontSize: '12px'
                    }}>
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
                      flexShrink: 0
                    }}
                  >
                    <Trash size={18} weight="bold" />
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
