import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { ChevronLeft, Key, Settings, Copy, Check } from 'lucide-react';

export const SettingsView = () => {
  const { roomState } = useRoom();
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');

  if (roomState.joinedRole !== 'ADMIN') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Unauthorized</div>;
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="layout-container" style={{ paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="neo-button" onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="var(--accent-yellow)" /> Event Settings
        </h2>
      </header>

      <div className="neo-box">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Role Keys</h3>
        
        {Object.entries(roomState.keys).map(([role, key]) => (
          <div key={role} className="neo-box-inset" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <small style={{ color: 'var(--text-secondary)' }}>{role} KEY</small>
              <h3 style={{ fontFamily: 'monospace', letterSpacing: '2px', color: 'white' }}>{key}</h3>
            </div>
            <button className="neo-button" onClick={() => handleCopy(key, role)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              {copied === role ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
            </button>
          </div>
        ))}
      </div>
      
      <div className="neo-box" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Event Info</h3>
        <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <strong>Name:</strong> <span>{roomState.name}</span>
        </p>
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong>Duration:</strong> <span>{roomState.duration} Hours</span>
        </p>
      </div>

    </div>
  );
};
