import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { ChevronLeft, Bell } from 'lucide-react';

export const AlertsView = () => {
  const { roomState } = useRoom();
  const navigate = useNavigate();

  return (
    <div className="layout-container" style={{ paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="neo-button" onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={24} color="var(--accent-yellow)" /> All Alerts
        </h2>
      </header>

      <div className="neo-box-inset" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {roomState.alerts.map(alert => (
          <div key={alert.id} className="neo-box" style={{ 
            padding: '1.5rem',
            background: 'var(--panel-bg)', 
            borderLeft: `4px solid ${alert.type === 'EMERGENCY' ? 'var(--accent-red)' : 'var(--accent-yellow)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <strong style={{ color: alert.type === 'EMERGENCY' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
                {alert.sender} sent to {alert.target}
              </strong>
              <small style={{ color: 'var(--text-secondary)' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </small>
            </div>
            <p style={{ color: 'white' }}>{alert.message}</p>
          </div>
        ))}
        {roomState.alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No alerts have been sent yet.
          </div>
        )}
      </div>
    </div>
  );
};
