import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { MapPin, Bell, LogOut, MessageSquare, Settings, MessageCircle } from 'lucide-react';
import { PanicButton } from '../components/PanicButton';
import { ChatBox } from '../components/ChatBox';
import { triggerAlert } from '../utils/alertSystem';

export const EventDashboard = () => {
  const { roomState, logout, sendAlert } = useRoom();
  const navigate = useNavigate();
  const isAdmin = roomState.joinedRole === 'ADMIN';

  const [alertForm, setAlertForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTarget, setAlertTarget] = useState('EVERYONE');

  const handlePanic = () => {
    // Send critical emergency alert
    sendAlert({ type: 'EMERGENCY', target: 'EVERYONE', message: 'CRITICAL EMERGENCY TRIGGERED' });
    triggerAlert('EMERGENCY');
  };

  const handleSendAlert = (e) => {
    e.preventDefault();
    if (alertMessage) {
      sendAlert({ type: 'STANDARD', target: alertTarget, message: alertMessage });
      triggerAlert('STANDARD');
      setAlertForm(false);
      setAlertMessage('');
    }
  };

  return (
    <div className="layout-container" style={{ position: 'relative', paddingBottom: '100px' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Event</h2>
          <h1 style={{ color: 'var(--accent-yellow)', fontSize: '1.8rem' }}>{roomState.name || 'Unknown Event'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="neo-box-inset" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {roomState.joinedRole}
          </span>
          <button className="neo-button" style={{ padding: '0.5rem' }} onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} color="var(--accent-red)" />
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
        <button className="neo-button" style={{ padding: '1.5rem', flexDirection: 'column' }} onClick={() => navigate('/map')}>
          <MapPin size={32} color="var(--accent-green)" style={{ marginBottom: '0.5rem' }} />
          <span>Interactive Map</span>
        </button>
        <button className="neo-button" style={{ padding: '1.5rem', flexDirection: 'column' }} onClick={() => navigate('/alerts')}>
          <Bell size={32} color="var(--accent-yellow)" style={{ marginBottom: '0.5rem' }} />
          <span>All Alerts</span>
        </button>
        <button className="neo-button" style={{ padding: '1.5rem', flexDirection: 'column' }} onClick={() => navigate('/chat')}>
          <MessageCircle size={32} color="var(--accent-yellow)" style={{ marginBottom: '0.5rem' }} />
          <span>Live Chat</span>
        </button>
        
        {isAdmin && (
          <>
            <button className="neo-button neo-button-primary" style={{ padding: '1.5rem', flexDirection: 'column' }} onClick={() => setAlertForm(!alertForm)}>
              <MessageSquare size={32} style={{ marginBottom: '0.5rem' }} />
              <span>Send Alert</span>
            </button>
            <button className="neo-button" style={{ padding: '1.5rem', flexDirection: 'column' }} onClick={() => navigate('/settings')}>
              <Settings size={32} color="var(--text-secondary)" style={{ marginBottom: '0.5rem' }} />
              <span>Settings</span>
            </button>
          </>
        )}
      </div>

      {/* Admin Alert Form Overlay */}
      {isAdmin && alertForm && (
        <div className="neo-box" style={{ marginBottom: '2rem', border: '1px solid var(--accent-yellow)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-yellow)' }}>Broadcast Alert</h3>
          <form onSubmit={handleSendAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <select className="neo-input" value={alertTarget} onChange={e => setAlertTarget(e.target.value)} style={{ padding: '0.8rem' }}>
              <option value="EVERYONE">Everyone</option>
              <option value="VOLUNTEER">Volunteers Only</option>
              <option value="ORGANIZER">Organizers Only</option>
              <option value="DELEGATE">Delegates Only</option>
              <option value="LOGISTICS_COORDINATOR">Logistics Only</option>
              <option value="SPEAKER">Speakers Only</option>
            </select>
            <textarea 
              className="neo-input" 
              placeholder="Alert Details..." 
              value={alertMessage}
              onChange={e => setAlertMessage(e.target.value)}
              style={{ minHeight: '80px', borderRadius: 'var(--radius-sm)' }}
            />
            <button type="submit" className="neo-button neo-button-primary">Send Alert</button>
          </form>
        </div>
      )}

      {/* Recent Alerts View */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
      <div className="neo-box-inset" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {roomState.alerts.slice(0, 3).map(alert => (
          <div key={alert.id} style={{ 
            padding: '1rem', 
            background: alert.type === 'EMERGENCY' ? 'rgba(255,77,77,0.1)' : 'var(--bg-color)',
            borderLeft: `4px solid ${alert.type === 'EMERGENCY' ? 'var(--accent-red)' : 'var(--accent-yellow)'}`,
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ color: alert.type === 'EMERGENCY' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>{alert.type} - TO {alert.target}</strong>
              <small style={{ color: 'var(--text-secondary)' }}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </small>
            </div>
            <p>{alert.message}</p>
          </div>
        ))}
        {roomState.alerts.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No alerts yet.</p>}
        {roomState.alerts.length > 0 && (
          <button className="neo-button" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate('/alerts')}>View All History</button>
        )}
      </div>

      <PanicButton onTrigger={handlePanic} />
    </div>
  );
};
