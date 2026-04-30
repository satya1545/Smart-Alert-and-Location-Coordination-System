import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const ChatBox = ({ onSend, messages, isAdmin, currentRole }) => {
  const [text, setText] = useState('');
  const [role, setRole] = useState('EVERYONE');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    // Non-admins strictly send to EVERYONE
    const finalTarget = isAdmin ? role : 'EVERYONE';
    onSend({ text, target: finalTarget });
    setText('');
  };

  return (
    <div className="neo-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxHeight: '400px' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-yellow)' }}>Live Chat</h3>
      
      <div className="neo-box-inset" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem' }}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender === currentRole;

          return (
            <div key={idx} className={`chat-bubble-container ${isMe ? 'chat-bubble-right' : 'chat-bubble-left'}`}>
              <div style={{ 
                background: isMe ? 'var(--panel-bg)' : 'rgba(212, 255, 0, 0.1)', 
                padding: '0.8rem 1rem', 
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-outset-sm)',
                border: isMe ? 'none' : '1px solid rgba(212, 255, 0, 0.2)',
              }} className={isMe ? 'chat-bubble-right' : 'chat-bubble-left'}>
                {!isMe && <small style={{ color: 'var(--accent-yellow)', fontSize: '0.70rem', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>{msg.sender}</small>}
                <p style={{ color: 'white', fontSize: '0.95rem' }}>{msg.text}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', gap: '0.5rem', alignItems: 'center' }}>
                  {msg.target !== 'EVERYONE' && <small style={{ color: 'var(--accent-red)', fontSize: '0.65rem' }}>🔒 {msg.target}</small>}
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>No messages yet.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', width: '100%' }}>
        {isAdmin && (
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            style={{ background: 'var(--bg-color)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: 'var(--radius-sm)', outline: 'none', boxShadow: 'var(--shadow-inset)', maxWidth: '100px' }}
          >
            <option value="EVERYONE">All</option>
            <option value="VOLUNTEER">Volunteers</option>
            <option value="ORGANIZER">Organizers</option>
            <option value="DELEGATE">Delegates</option>
            <option value="LOGISTICS">Logistics</option>
            <option value="SPEAKER">Speakers</option>
          </select>
        )}
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..." 
          className="neo-input"
          style={{ padding: '0.8rem 1rem', flex: 1, minWidth: '0' }}
        />
        <button type="submit" className="neo-button neo-button-primary" style={{ padding: '0 1rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
