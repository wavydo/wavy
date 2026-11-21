import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './SupportModal.css';
import { 
  User, 
  ArrowSquareOut, 
  Trash, 
  X, 
  PaperPlaneRight, 
  Info, 
  ArrowUp, 
  CheckCircle,
  CircleNotch,
  ChatCircle,
  Clock,
  Warning
} from 'phosphor-react';

const SOCKET_URL = 'http://localhost:3001';

interface SupportChat {
  id: string;
  userId: string;
  status: 'open' | 'closed' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject?: string;
  category?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  deviceInfo?: string;
  locationInfo?: string;
  adminNotes?: string;
  internalNotes?: string;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderType: 'user' | 'admin';
  senderId: string;
  senderName: string;
  messageType: 'text' | 'image' | 'file' | 'banner';
  content: string;
  attachmentUrl?: string;
  bannerColor?: string;
  isRead: boolean;
  createdAt: string;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (title: string, description: string, color: string) => void;
}

function BannerModal({ isOpen, onClose, onSend }: BannerModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  
  const bannerOptions = [
    { color: 'blue', label: 'Información', icon: Info, bg: '#dbeafe', text: '#1e40af' },
    { color: 'green', label: 'Resuelto', icon: CheckCircle, bg: '#d1fae5', text: '#065f46' },
    { color: 'yellow', label: 'Atención', icon: Warning, bg: '#fef3c7', text: '#92400e' },
    { color: 'red', label: 'Urgente', icon: ArrowUp, bg: '#fee2e2', text: '#991b1b' },
  ];

  if (!isOpen) return null;

  const handleSend = () => {
    if (title.trim() && description.trim()) {
      onSend(title, description, selectedColor);
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="banner-modal-overlay" onClick={onClose}>
      <div className="banner-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="banner-modal-header">
          <h3 className="banner-modal-title">Enviar Banner Personalizado</h3>
          <button className="banner-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="banner-modal-content">
          <div className="banner-options-grid">
            {bannerOptions.map((option) => {
              const IconComp = option.icon;
              return (
                <button
                  key={option.color}
                  onClick={() => setSelectedColor(option.color)}
                  className={`banner-option ${selectedColor === option.color ? 'selected' : ''}`}
                  style={{
                    backgroundColor: selectedColor === option.color ? option.bg : '#ffffff',
                    borderColor: selectedColor === option.color ? option.text : '#e5e7eb',
                  }}
                >
                  <IconComp size={24} color={option.text} weight="duotone" />
                  <span style={{ color: option.text }}>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="banner-message-input-group">
            <label>Título del Banner</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ej: Solicitud recibida"
              maxLength={50}
            />
            <span className="char-count">{title.length}/50</span>
          </div>

          <div className="banner-message-input-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Escribe la descripción que se mostrará..."
              maxLength={200}
              rows={3}
            />
            <span className="char-count">{description.length}/200</span>
          </div>

          {(title || description) && (
            <div className="banner-preview">
              <span className="preview-label">Vista previa:</span>
              <div 
                className="preview-banner"
                style={{
                  backgroundColor: bannerOptions.find(o => o.color === selectedColor)?.bg,
                  color: bannerOptions.find(o => o.color === selectedColor)?.text,
                }}
              >
                {(() => {
                  const IconComp = bannerOptions.find(o => o.color === selectedColor)?.icon;
                  return IconComp ? (
                    <IconComp 
                      size={20}
                      color={bannerOptions.find(o => o.color === selectedColor)?.text}
                      weight="duotone"
                    />
                  ) : null;
                })()}
                <div className="preview-banner-text">
                  {title && <div className="preview-banner-title">{title}</div>}
                  {description && <div className="preview-banner-description">{description}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="banner-modal-footer">
          <button className="banner-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="banner-modal-btn-send" 
            onClick={handleSend}
            disabled={!title.trim() || !description.trim()}
          >
            <PaperPlaneRight size={16} weight="duotone" />
            Enviar Banner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupportTab() {
  // Force reload timestamp - v2.0.1
  console.log('🚀 SupportTab loaded - Version 2.0.1 with Phosphor icons');
  
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [filter]);

  const connectWebSocket = async () => {
    console.log('🚀🚀🚀 PHOSPHOR VERSION 3.0 - PORT 3001 🚀🚀🚀', new Date().toISOString());
    try {
      // Intentar obtener token de sesión (si existe)
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
        ...(token && { auth: { token } })
      });

      socket.on('connect', () => {
        console.log('🔌 Admin WebSocket conectado');
      });

      socket.on('new-message', (message: Message) => {
        console.log('📩 Nuevo mensaje recibido:', message);
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      });

      socket.on('new-chat', (chat: SupportChat) => {
        console.log('📞 Nuevo chat creado:', chat);
        loadChats();
      });

      socket.on('chat-list-updated', () => {
        console.log('📋 Lista de chats actualizada');
        loadChats();
      });

      socket.on('user-typing', (data: any) => {
        if (data.userType === 'user' && selectedChat && data.chatId === selectedChat.id) {
          setIsUserTyping(true);
          setTimeout(() => setIsUserTyping(false), 3000);
        }
      });

      socket.on('user-stopped-typing', (data: any) => {
        if (data.userType === 'user') {
          setIsUserTyping(false);
        }
      });

      socket.on('messages-read', (data: { messageIds: string[], readByType: 'user' | 'admin', readAt: string }) => {
        console.log('👁️ Messages marked as read:', data);
        // Actualizar los mensajes localmente
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        ));
      });

      socketRef.current = socket;
      
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all' 
        ? '/api/admin/support/chats' 
        : `/api/admin/support/chats?status=${filter}`;
      
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/admin/support/chat/${chatId}/messages`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        scrollToBottom();
        
        // Join chat room via WebSocket
        if (socketRef.current) {
          socketRef.current.emit('join-chat', chatId);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const openChat = (chat: SupportChat) => {
    setSelectedChat(chat);
    setAdminNotes(chat.adminNotes || chat.internalNotes || '');
    loadMessages(chat.id);
  };

  const closeModal = () => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit('leave-chat', selectedChat.id);
    }
    setSelectedChat(null);
    setMessages([]);
    setReplyText('');
    setAdminNotes('');
    setShowUserInfo(false);
    setShowNotes(false);
  };

  const sendMessage = async () => {
    if (!selectedChat || !replyText.trim()) return;

    try {
      setIsSending(true);
      
      // Stop typing
      if (socketRef.current) {
        socketRef.current.emit('typing-stop', selectedChat.id);
      }
      
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText, messageType: 'text' }),
      });

      if (response.ok) {
        setReplyText('');
        // Message will arrive via WebSocket
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendBanner = async (title: string, description: string, color: string) => {
    if (!selectedChat) return;
    try {
      // Combinar título y descripción en el contenido
      const content = `${title}\n${description}`;
      
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          messageType: 'banner', 
          bannerColor: color 
        }),
      });
      if (response.ok) {
        // Message will arrive via WebSocket
      }
    } catch (error) {
      console.error('Error sending banner:', error);
    }
  };

  const handleReplyTextChange = (text: string) => {
    setReplyText(text);
    
    if (!socketRef.current || !selectedChat) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (text.trim()) {
      socketRef.current.emit('typing-start', selectedChat.id);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing-stop', selectedChat.id);
      }, 2000);
    }
  };

  const updateChatStatus = async (status: 'open' | 'closed' | 'escalated') => {
    if (!selectedChat) return;
    try {
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        await loadChats();
        setSelectedChat({ ...selectedChat, status });
        const msgs = {
          closed: {
            title: 'Chat Cerrado',
            description: 'Este chat ha sido cerrado. Gracias por contactarnos.',
            color: 'red'
          },
          escalated: {
            title: 'Caso Escalado',
            description: 'Tu caso ha sido escalado a un supervisor.',
            color: 'red'
          },
          open: {
            title: 'Chat Reabierto',
            description: 'Tu chat ha sido reabierto.',
            color: 'blue'
          }
        };
        const msg = msgs[status];
        await sendBanner(msg.title, msg.description, msg.color);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updatePriority = async (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    if (!selectedChat) return;
    try {
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      if (response.ok) {
        await loadChats();
        setSelectedChat({ ...selectedChat, priority });
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const saveNotes = async () => {
    if (!selectedChat) return;
    try {
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: adminNotes }),
      });
      if (response.ok) {
        alert('Notas guardadas');
        await loadChats();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const deleteChat = async () => {
    if (!selectedChat) return;
    
    if (!confirm('¿Eliminar este chat permanentemente?')) return;
    
    console.log('🗑️ Iniciando eliminación del chat:', selectedChat.id);
    
    try {
      // Primero cerrar el chat antes de eliminarlo
      console.log('1️⃣ Cerrando chat...');
      const closeResponse = await fetch(`/api/admin/support/chat/${selectedChat.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      
      if (!closeResponse.ok) {
        console.error('Error al cerrar chat:', await closeResponse.text());
      }
      
      // Enviar banner de cierre
      console.log('2️⃣ Enviando banner de cierre...');
      await sendBanner('Chat Cerrado', 'Este chat ha sido cerrado y eliminado por el administrador.', 'red');
      
      // Esperar un momento para que el banner se envíe
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ahora eliminar
      console.log('3️⃣ Eliminando chat...');
      const response = await fetch(`/api/admin/support/chat/${selectedChat.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      console.log('DELETE response status:', response.status);
      const responseData = await response.json();
      console.log('DELETE response data:', responseData);
      
      if (response.ok) {
        alert('Chat eliminado exitosamente');
        closeModal();
        await loadChats();
      } else {
        alert('Error al eliminar: ' + (responseData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      alert('Error al eliminar el chat: ' + error.message);
    }
  };

  const openUserProfile = () => {
    if (!selectedChat) return;
    window.open(`/admin?tab=users&userId=${selectedChat.userId}`, '_blank');
  };

  const openChats = chats.filter(c => c.status === 'open' || c.status === 'escalated');
  const urgentChats = chats.filter(c => c.priority === 'urgent' || c.priority === 'high');
  const closedToday = chats.filter(c => {
    if (c.status !== 'closed') return false;
    return new Date(c.lastMessageAt).toDateString() === new Date().toDateString();
  });

  const getBannerIcon = (color?: string) => {
    switch (color) {
      case 'red': return ArrowUp;
      case 'yellow': return Warning;
      case 'green': return CheckCircle;
      case 'blue':
      default: return Info;
    }
  };

  return (
    <div className="admin-support" style={{ padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        background: '#fff', 
        borderRadius: '12px', 
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ChatCircle size={24} color="#6366f1" weight="duotone" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#0e1116' }}>
            Sistema de Soporte
          </h3>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
          Gestiona consultas de soporte en tiempo real con WebSocket
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', width: '100%' }}>
        {[
          { label: 'Activos', value: openChats.length, color: '#0ea5e9', icon: ChatCircle },
          { label: 'Urgentes', value: urgentChats.length, color: '#ef4444', icon: Warning },
          { label: 'Resueltos Hoy', value: closedToday.length, color: '#10b981', icon: CheckCircle },
          { label: 'Total', value: chats.length, color: '#8b5cf6', icon: Clock },
        ].map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={20} color={stat.color} weight="duotone" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>
                  {stat.value}
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { value: 'all', label: 'Todos', count: chats.length },
          { value: 'open', label: 'Abiertos', count: openChats.length },
          { value: 'closed', label: 'Cerrados', count: chats.length - openChats.length },
        ].map(f => (
          <button 
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: filter === f.value ? '2px solid #6366f1' : '1px solid #e5e7eb',
              background: filter === f.value ? '#ede9fe' : '#ffffff',
              color: filter === f.value ? '#6366f1' : '#64748b',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Chats List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <CircleNotch size={32} color="#6366f1" weight="bold" className="spin" />
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '12px' }}>Cargando chats...</div>
        </div>
      ) : chats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <ChatCircle size={48} color="#cbd5e1" weight="duotone" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e1116', marginBottom: '8px' }}>
            No hay chats
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Los chats aparecerán cuando los usuarios contacten soporte
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {chats.map((chat, idx) => (
            <div 
              key={chat.id}
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: idx < chats.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => openChat(chat)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                }}>
                  {chat.userName.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#0e1116', fontSize: '0.9375rem' }}>
                      {chat.userName}
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.625rem',
                      borderRadius: '6px',
                      fontSize: '0.6875rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: chat.status === 'open' ? '#dbeafe' : chat.status === 'escalated' ? '#fee2e2' : '#f3f4f6',
                      color: chat.status === 'open' ? '#1e40af' : chat.status === 'escalated' ? '#991b1b' : '#64748b',
                    }}>
                      {chat.status}
                    </span>
                    {chat.priority !== 'normal' && (
                      <span style={{ 
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: chat.priority === 'urgent' ? '#fef3c7' : '#fee2e2',
                        color: chat.priority === 'urgent' ? '#92400e' : '#991b1b',
                      }}>
                        {chat.priority}
                      </span>
                    )}
                    {chat.unreadCount > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '0.125rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                      }}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    {chat.userEmail}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {chat.subject} • {new Date(chat.lastMessageAt).toLocaleString('es-ES', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedChat && (
        <div className="tapp-support-modal-overlay" onClick={closeModal}>
          <div className="tapp-support-modal-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="tapp-support-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: '600',
                }}>
                  {selectedChat.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="tapp-support-modal-title">{selectedChat.userName}</h3>
                  <p className="tapp-support-modal-subtitle">{selectedChat.userEmail} • {selectedChat.subject || 'Support Request'}</p>
                </div>
              </div>
              <button className="tapp-support-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            {/* Actions */}
            <div className="tapp-support-modal-actions">
              <div className="tapp-support-modal-actions-left">
                <select className="tapp-support-select" value={selectedChat.status} onChange={(e) => updateChatStatus(e.target.value as any)}>
                  <option value="open">Abierto</option>
                  <option value="escalated">Escalado</option>
                  <option value="closed">Cerrado</option>
                </select>

                <select className="tapp-support-select" value={selectedChat.priority} onChange={(e) => updatePriority(e.target.value as any)}>
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="tapp-support-modal-actions-right">
                <button className="tapp-support-btn" onClick={() => setShowUserInfo(!showUserInfo)}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Info Usuario</span>
                </button>
                <button className="tapp-support-btn" onClick={openUserProfile}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Ver Perfil</span>
                </button>
                <button className="tapp-support-btn tapp-support-btn-danger" onClick={deleteChat}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            {/* User Info */}
            {showUserInfo && (
              <div className="tapp-support-user-info">
                <div className="tapp-support-user-info-grid">
                  <div className="tapp-support-user-info-item">
                    <div className="tapp-support-user-info-label">Teléfono</div>
                    <div className="tapp-support-user-info-value">{selectedChat.userPhone || 'No disponible'}</div>
                  </div>
                  <div className="tapp-support-user-info-item">
                    <div className="tapp-support-user-info-label">Dispositivo</div>
                    <div className="tapp-support-user-info-value">{selectedChat.deviceInfo ? 'Disponible' : 'No disponible'}</div>
                  </div>
                  <div className="tapp-support-user-info-item">
                    <div className="tapp-support-user-info-label">Creado</div>
                    <div className="tapp-support-user-info-value">
                      {new Date(selectedChat.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Banners */}
            <div className="tapp-support-banners">
              <div className="tapp-support-banners-title">Enviar Banner Rápido:</div>
              <div className="tapp-support-banners-grid">
                <button className="tapp-support-banner-btn blue" onClick={() => sendBanner('Revisando', 'Estamos revisando tu solicitud', 'blue')}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Revisando</span>
                </button>
                <button className="tapp-support-banner-btn green" onClick={() => sendBanner('Resuelto', 'Tu solicitud ha sido resuelta exitosamente', 'green')}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Resuelto</span>
                </button>
                <button className="tapp-support-banner-btn yellow" onClick={() => sendBanner('Más Información', 'Necesitamos información adicional para continuar', 'yellow')}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Más Info</span>
                </button>
                <button className="tapp-support-banner-btn custom" onClick={() => setShowBannerModal(true)}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span>Personalizado</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="tapp-support-messages-container">
              {isLoadingMessages ? (
                <div className="tapp-support-loading">
                  <CircleNotch size={24} weight="bold" className="spin" />
                  <span>Cargando mensajes...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="tapp-support-loading">No hay mensajes</div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isUser = msg.senderType === 'user';
                    
                    if (msg.messageType === 'banner') {
                      const IconComp = getBannerIcon(msg.bannerColor);
                      // Separar título y descripción (vienen en una línea con \n)
                      const lines = msg.content.split('\n');
                      const title = lines[0] || '';
                      const description = lines.slice(1).join('\n') || '';
                      
                      return (
                        <div key={msg.id} className={`tapp-support-message-banner ${msg.bannerColor || 'blue'}`}>
                          <IconComp size={20} weight="duotone" />
                          <div className="banner-content">
                            {title && <div className="banner-title">{title}</div>}
                            {description && <div className="banner-description">{description}</div>}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`tapp-support-message ${msg.senderType}`}>
                        {!isUser && (
                          <div className="message-avatar admin">
                            <img 
                              src="/roko.PNG" 
                              alt="Support" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                        <div className={`tapp-support-message-bubble ${msg.senderType}`}>
                          <div className="tapp-support-message-sender">
                            {isUser ? msg.senderName : 'Support'}
                          </div>
                          <div className="tapp-support-message-content">{msg.content}</div>
                          <div className="tapp-support-message-time">
                            {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {isUser && (
                          <div className="message-avatar user">{selectedChat.userName.charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  
                  {/* Typing Indicator */}
                  {isUserTyping && (
                    <div className="tapp-support-typing-indicator">
                      <div className="message-avatar user">{selectedChat.userName.charAt(0).toUpperCase()}</div>
                      <div className="tapp-support-typing-bubble">
                        <div className="tapp-support-typing-dots">
                          <span className="tapp-support-typing-dot"></span>
                          <span className="tapp-support-typing-dot"></span>
                          <span className="tapp-support-typing-dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="tapp-support-input-area">
              <div className="tapp-support-input-wrapper">
                <input
                  type="text"
                  className="tapp-support-input"
                  value={replyText}
                  onChange={(e) => handleReplyTextChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Escribe tu respuesta..."
                  disabled={selectedChat.status === 'closed'}
                />
                <button
                  className="tapp-support-send-btn"
                  onClick={sendMessage}
                  disabled={!replyText.trim() || isSending || selectedChat.status === 'closed'}
                >
                  {isSending ? <CircleNotch size={16} weight="bold" className="spin" /> : <PaperPlaneRight size={16} weight="duotone" />}
                  {isSending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>

              {/* Notes */}
              <div className="tapp-support-notes">
                <button className="tapp-support-notes-toggle" onClick={() => setShowNotes(!showNotes)}>
                  {showNotes ? '▼' : '▶'} Notas Internas (solo admin)
                </button>
                {showNotes && (
                  <div className="tapp-support-notes-content">
                    <textarea
                      className="tapp-support-notes-textarea"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Notas privadas..."
                    />
                    <button className="tapp-support-notes-save" onClick={saveNotes}>
                      Guardar Notas
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      
      {/* Banner Modal */}
      <BannerModal 
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onSend={sendBanner}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
