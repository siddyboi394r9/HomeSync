'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageCircle, Send, Pin, PinOff, StickyNote, Bell, Smile } from 'lucide-react';

export default function ChatPage() {
  const { messages, notifications, updateData } = useApp();
  const [newMsg, setNewMsg] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [newNote, setNewNote] = useState('');
  const bottomRef = useRef(null);

  const pinnedMessages = messages.filter(m => m.pinned);
  const chatMessages = messages.filter(m => !m.pinned).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    updateData('messages', [...messages, {
      id: Date.now().toString(), sender: 'Siddharth', content: newMsg,
      timestamp: new Date().toISOString(), pinned: false
    }]);
    setNewMsg('');
  };

  const togglePin = (id) => {
    updateData('messages', messages.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    updateData('messages', [...messages, {
      id: Date.now().toString(), sender: 'Siddharth', content: newNote,
      timestamp: new Date().toISOString(), pinned: true
    }]);
    setNewNote('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <div>
          <h1><MessageCircle size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Communication Hub</h1>
          <p>Quick messages, pinned notes, and activity feed.</p>
        </div>
      </div>

      <div className="chat-layout">
        {/* Main Chat */}
        <div className="chat-main">
          <div className="tabs" style={{ marginBottom: 0, borderRadius: '12px 12px 0 0' }}>
            <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
            <button className={`tab ${activeTab === 'pinned' ? 'active' : ''}`} onClick={() => setActiveTab('pinned')}>📌 Pinned ({pinnedMessages.length})</button>
            <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>📝 Quick Notes</button>
          </div>

          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="messages-area">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender === 'Siddharth' ? 'sent' : 'received'}`}>
                    <div className="msg-bubble">
                      <span className="msg-sender-name">{msg.sender}</span>
                      <p>{msg.content}</p>
                      <span className="msg-time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <button className="pin-btn" onClick={() => togglePin(msg.id)} title={msg.pinned ? 'Unpin' : 'Pin'}>
                      {msg.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                />
                <button className="send-btn" onClick={sendMessage} disabled={!newMsg.trim()}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pinned' && (
            <div className="pinned-area">
              {pinnedMessages.length === 0 ? (
                <div className="empty-state"><Pin size={40} /><h3>No pinned messages</h3><p>Pin important messages to keep them handy.</p></div>
              ) : (
                pinnedMessages.map(msg => (
                  <div key={msg.id} className="pinned-item">
                    <div className="pi-content">
                      <span className="pi-sender">{msg.sender}</span>
                      <p>{msg.content}</p>
                      <span className="pi-time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <button className="btn btn-ghost btn-icon sm" onClick={() => togglePin(msg.id)}><PinOff size={14} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-area">
              <div className="note-input-area">
                <input className="input" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a quick note (auto-pins)..." onKeyDown={e => { if (e.key === 'Enter') addNote(); }} />
                <button className="btn btn-primary btn-sm" onClick={addNote}>Save Note</button>
              </div>
              <div className="notes-list">
                {pinnedMessages.map(msg => (
                  <div key={msg.id} className="note-card">
                    <StickyNote size={16} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                    <div className="nc-content">
                      <p>{msg.content}</p>
                      <span className="nc-meta">{msg.sender} · {formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Sidebar */}
        <div className="activity-sidebar">
          <h3><Bell size={18} /> Activity Feed</h3>
          <div className="activity-list">
            {notifications.map(n => (
              <div key={n.id} className={`activity-item ${n.read ? 'read' : ''}`}>
                <div className="ai-dot" />
                <div className="ai-content">
                  <p>{n.message}</p>
                  <span>{new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-page { max-width: 1100px; animation: fadeIn 0.4s ease; }
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .chat-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; height: calc(100vh - 200px); min-height: 500px; }
        .chat-main { display: flex; flex-direction: column; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; }

        .chat-container { flex: 1; display: flex; flex-direction: column; }
        .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .message { display: flex; align-items: flex-end; gap: 8px; max-width: 75%; }
        .message.sent { margin-left: auto; flex-direction: row-reverse; }
        .msg-bubble { padding: 12px 16px; border-radius: 16px; max-width: 100%; }
        .message.received .msg-bubble { background: var(--bg-tertiary); border-bottom-left-radius: 4px; }
        .message.sent .msg-bubble { background: linear-gradient(135deg, var(--accent-primary), var(--red-600)); border-bottom-right-radius: 4px; }
        .msg-sender-name { font-size: 0.6875rem; font-weight: 600; color: var(--text-tertiary); display: block; margin-bottom: 2px; }
        .message.sent .msg-sender-name { color: rgba(255,255,255,0.6); }
        .msg-bubble p { font-size: 0.9375rem; line-height: 1.5; color: var(--text-primary); }
        .msg-time { font-size: 0.6875rem; color: var(--text-muted); display: block; margin-top: 4px; }
        .message.sent .msg-time { color: rgba(255,255,255,0.5); }
        .pin-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0; transition: opacity 0.15s; padding: 4px; }
        .message:hover .pin-btn { opacity: 1; }
        .pin-btn:hover { color: var(--accent-primary); }

        .chat-input-area { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border-subtle); background: var(--bg-tertiary); }
        .chat-input { flex: 1; background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: 12px; padding: 12px 16px; color: var(--text-primary); font-size: 0.9375rem; outline: none; transition: border-color 0.2s; }
        .chat-input:focus { border-color: var(--accent-primary); }
        .chat-input::placeholder { color: var(--text-muted); }
        .send-btn { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-primary), var(--red-600)); color: white; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-glow); }
        .send-btn:hover { transform: scale(1.05); box-shadow: var(--shadow-glow-strong); }
        .send-btn:disabled { opacity: 0.4; transform: none; cursor: default; }

        .pinned-area, .notes-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .pinned-item { display: flex; gap: 12px; padding: 16px; background: var(--bg-tertiary); border-radius: 12px; border-left: 3px solid var(--accent-gold); }
        .pi-content { flex: 1; }
        .pi-sender { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
        .pi-content p { font-size: 0.9375rem; margin: 4px 0; color: var(--text-primary); }
        .pi-time { font-size: 0.6875rem; color: var(--text-muted); }

        .note-input-area { display: flex; gap: 8px; margin-bottom: 16px; }
        .notes-list { display: flex; flex-direction: column; gap: 8px; }
        .note-card { display: flex; gap: 12px; padding: 14px; background: var(--bg-tertiary); border-radius: 10px; }
        .nc-content { flex: 1; }
        .nc-content p { font-size: 0.875rem; color: var(--text-primary); margin-bottom: 4px; }
        .nc-meta { font-size: 0.6875rem; color: var(--text-muted); }

        .activity-sidebar { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px; overflow-y: auto; }
        .activity-sidebar h3 { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 1rem; }
        .activity-list { display: flex; flex-direction: column; gap: 14px; }
        .activity-item { display: flex; gap: 12px; }
        .activity-item.read { opacity: 0.5; }
        .ai-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); margin-top: 6px; flex-shrink: 0; }
        .activity-item.read .ai-dot { background: var(--text-muted); }
        .ai-content p { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4; }
        .ai-content span { font-size: 0.6875rem; color: var(--text-muted); }

        @media (max-width: 768px) {
          .chat-layout { grid-template-columns: 1fr; height: auto; }
          .activity-sidebar { max-height: 300px; }
          .message { max-width: 85%; }
        }
      `}</style>
    </div>
  );
}
