import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { ChevronLeft, MapPin, Navigation, Crosshair } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

export const MapView = () => {
  const { roomState, updateLocation } = useRoom();
  const navigate = useNavigate();
  const [locInput, setLocInput] = useState('');

  const isAdmin = roomState.joinedRole === 'ADMIN';

  const handleUpdate = (e) => {
    e.preventDefault();
    if (locInput) {
      updateLocation(locInput);
      setLocInput('');
    }
  };

  const handleAutoGPS = async () => {
    try {
      // Prompt for permission and get GPS position natively
      const coordinates = await Geolocation.getCurrentPosition();
      const gpsString = `${coordinates.coords.latitude.toFixed(4)}, ${coordinates.coords.longitude.toFixed(4)}`;
      updateLocation(gpsString);
      setLocInput('');
    } catch (err) {
      console.log('GPS error or denied: ', err);
      // Fallback or alert user
      alert("Could not fetch GPS location. Are permissions enabled?");
    }
  };

  const myLocation = roomState.users.find(u => u.id === roomState.selfId)?.location;

  return (
    <div className="layout-container" style={{ paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="neo-button" onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={24} color="var(--accent-green)" /> Tracking Map
        </h2>
      </header>

      {/* Radar Map Visualization (Abstracted Neon Map) */}
      <div className="neo-box-inset" style={{ 
        position: 'relative', 
        height: '350px', 
        marginBottom: '2rem', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, var(--panel-bg) 0%, var(--bg-color) 100%)'
      }}>
        {/* Radar Rings */}
        <div style={{ position: 'absolute', width: '100px', height: '100px', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', border: '1px solid rgba(0,255,136,0.1)', borderRadius: '50%' }} />
        
        {/* Custom Users on Map */}
        {(isAdmin ? roomState.users : roomState.users.filter(u => u.role === roomState.joinedRole))
          .filter(u => u.location)
          .map((user, idx) => {
            // Pseudo-random placement based on index for the visual mock
            const top = `${30 + (idx * 15 % 40)}%`;
            const left = `${20 + (idx * 25 % 60)}%`;
            
            return (
              <div key={user.id || idx} style={{ position: 'absolute', top, left, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(-50%, -50%)' }}>
                <div style={{ 
                  background: user.role === 'ADMIN' ? 'var(--accent-yellow)' : 'var(--accent-green)',
                  width: '12px', height: '12px', borderRadius: '50%',
                  boxShadow: `0 0 10px ${user.role === 'ADMIN' ? 'var(--accent-yellow)' : 'var(--accent-green)'}`
                }} />
                <div className="neo-box" style={{ padding: '0.2rem 0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  <strong style={{ display: 'block' }}>{user.role}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{user.location}</span>
                </div>
              </div>
            );
        })}

        {(!myLocation && !isAdmin) && (
          <div style={{ zIndex: 10, color: 'var(--text-secondary)' }}>Please update your location.</div>
        )}
      </div>

      <div className="neo-box">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={18} color="var(--accent-yellow)" /> Tag My Location
        </h3>
        <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="neo-input" 
            placeholder="e.g. Hyderabad, Gate A" 
            value={locInput}
            onChange={e => setLocInput(e.target.value)}
            style={{ flex: 1, minWidth: '0' }}
          />
          <button type="submit" className="neo-button neo-button-primary" style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-sm)' }}>
            Update
          </button>
        </form>
        
        <button className="neo-button" onClick={handleAutoGPS} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Crosshair size={18} color="var(--accent-green)" /> Use Exact Auto-GPS Tag
        </button>
        {myLocation && (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Current Tag: <strong style={{ color: 'white' }}>{myLocation}</strong>
          </p>
        )}
      </div>
      
      {isAdmin && (
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Admins have a global overview of all event personnel who have checked in.
        </p>
      )}

    </div>
  );
};
