import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { ChatBox } from '../components/ChatBox';

export const ChatView = () => {
  const { roomState, sendMessage } = useRoom();
  const navigate = useNavigate();

  const handleSend = (msgOptions) => {
    sendMessage(msgOptions);
  };

  const isAdmin = roomState.joinedRole === 'ADMIN';

  // Filter messages based on role.
  // Admins see all messages.
  // Others see messages targeted to EVERYONE or their specific role.
  const visibleMessages = roomState.messages.filter(msg => 
    isAdmin || msg.target === 'EVERYONE' || msg.target === roomState.joinedRole || msg.sender === roomState.joinedRole
  );

  return (
    <div className="layout-container" style={{ paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="neo-button" onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={24} color="var(--accent-yellow)" /> Event Chat
        </h2>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatBox onSend={handleSend} messages={visibleMessages} isAdmin={isAdmin} currentRole={roomState.joinedRole} />
      </div>
    </div>
  );
};
