import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { Settings, Copy, Check } from 'lucide-react';

export const CreateRoomView = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [copied, setCopied] = useState('');
  const navigate = useNavigate();
  const { createRoom, roomState } = useRoom();

  const handleCreate = (e) => {
    e.preventDefault();
    if (name && duration) {
      createRoom(name, Number(duration));
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (roomState.id) {
    return (
      <div className="layout-container" style={{ justifyContent: 'center' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--accent-yellow)' }}>Room Created!</h2>
        
        <div className="neo-box" style={{ marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Share these keys with your team:</p>
          
          {Object.entries(roomState.keys).map(([role, key]) => (
            <div key={role} className="neo-box-inset" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small>{role.replace('_', ' ')} KEY</small>
                <h3 style={{ fontFamily: 'monospace', letterSpacing: '2px', color: 'white' }}>{key}</h3>
              </div>
              <button className="neo-button" onClick={() => handleCopy(key, role)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                {copied === role ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
              </button>
            </div>
          ))}
        </div>

        <button className="neo-button neo-button-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
          Enter Event Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Settings size={28} color="var(--accent-yellow)" /> Create New Event
      </h2>

      <div className="neo-box">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Event Name</label>
            <input 
              required
              type="text" 
              className="neo-input" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Annual Tech Summit" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Duration (Hours)</label>
            <input 
              required
              type="number" 
              className="neo-input" 
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 12" 
            />
          </div>
          <button type="submit" className="neo-button neo-button-primary" style={{ marginTop: '1rem' }}>
            Generate Secure Room
          </button>
        </form>
      </div>
    </div>
  );
};
