import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const PanicButton = ({ onTrigger }) => {
  const [confirming, setConfirming] = useState(false);

  const handleClick = async () => {
    if (!confirming) {
      // First Tap: Warning state. Fire a heavy tap.
      try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
      
      setConfirming(true);
      // Auto-cancel after 5 seconds to prevent accidental sends sticking around forever
      setTimeout(() => setConfirming(false), 5000);
    } else {
      // Confirmation Tap: Trigger the alert! Provide a literal buzz.
      try { await Haptics.vibrate(); } catch (e) {}
      onTrigger();
      setConfirming(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
      {confirming && (
        <button 
          onClick={() => setConfirming(false)}
          className="neo-button" 
          style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--panel-bg)' }}
        >
          <X size={18} /> Cancel
        </button>
      )}
      <button 
        onClick={handleClick}
        className={`neo-button ${confirming ? 'neo-button-danger' : ''}`}
        style={{ 
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: confirming ? 'var(--accent-red)' : 'var(--panel-bg)',
          color: confirming ? 'white' : 'var(--accent-red)',
          boxShadow: confirming ? 'var(--shadow-red-glow)' : 'var(--shadow-outset-sm)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
        }}
      >
        <AlertOctagon size={confirming ? 32 : 28} />
        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{confirming ? 'SEND' : 'PANIC'}</span>
      </button>
    </div>
  );
};
