import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { Shield, Key, Plus, Settings, Copy, Check, LogIn } from 'lucide-react';

export const LandingView = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('join');
  
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [copied, setCopied] = useState('');
  const [justCreated, setJustCreated] = useState(false);

  const navigate = useNavigate();
  const { joinRoom, createRoom, roomState } = useRoom();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code) return;
    
    try {
      const success = await joinRoom(code.trim().toUpperCase());
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid role code');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (name && duration) {
      try {
        await createRoom(name, Number(duration));
        setJustCreated(true);
      } catch (err) {
        if (err.code === 'permission-denied') {
          setError('Permission Denied: Please update your Firebase Firestore rules.');
        } else {
          setError(`Failed to create room: ${err.message || 'Please check your connection.'}`);
        }
        console.error(err);
      }
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (roomState.joinedRole && !justCreated) {
    return (
      <div className="layout-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <Shield size={64} color="var(--accent-green)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.5))' }} />
        <h2 style={{ marginBottom: '1rem' }}>You are logged into an event</h2>
        <button className="neo-button neo-button-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginBottom: '1rem' }}>
           Return to Dashboard
        </button>
      </div>
    );
  }

  if (roomState.id && justCreated) {
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

        <button className="neo-button neo-button-primary" onClick={() => { setJustCreated(false); navigate('/dashboard'); }} style={{ width: '100%' }}>
          Enter Event Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Shield size={64} color="var(--accent-yellow)" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(212,255,0,0.5))' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Event Guardian</h1>
        <p>Coordinate & protect event personnel securely</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={`neo-button ${activeTab === 'join' ? 'neo-button-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('join')}
        >
          <LogIn size={18} /> Join Event
        </button>
        <button 
          className={`neo-button ${activeTab === 'create' ? 'neo-button-primary' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('create')}
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      {activeTab === 'join' ? (
        <div className="neo-box" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--accent-yellow)" /> Access with Code
          </h3>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Enter Role Code (e.g. VOL-1A2B3D)" 
              className="neo-input" 
              value={code} 
              onChange={(e) => { setCode(e.target.value); setError(''); }}
            />
            {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginLeft: '1rem' }}>{error}</p>}
            <button type="submit" className="neo-button neo-button-primary">JOIN EVENT</button>
          </form>
        </div>
      ) : (
        <div className="neo-box" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} color="var(--accent-yellow)" /> New Admin Event
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Event Name</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Duration (Hours)</label>
              <input 
                required
                type="number" 
                className="neo-input" 
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 12" 
              />
            </div>
            <button type="submit" className="neo-button neo-button-primary" style={{ marginTop: '0.5rem' }}>
              Create & Generate Keys
            </button>
            {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};
