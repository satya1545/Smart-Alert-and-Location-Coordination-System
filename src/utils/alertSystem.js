import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Trigger device vibration and a sound when an emergency or alert happens.

export const triggerAlert = async (type) => {
  // Vibration logic: Try Native Haptics first, fallback to web API
  try {
    if (type === 'EMERGENCY') {
      await Haptics.vibrate({ duration: 1000 });
      setTimeout(() => Haptics.vibrate({ duration: 1000 }), 1500); // Pulse effect
    } else {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  } catch (err) {
    // If running in a pure browser without Capacitor hardware access:
    if (navigator.vibrate) {
      if (type === 'EMERGENCY') {
        navigator.vibrate([1000, 500, 1000, 500, 1000]);
      } else {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }

  // Audio Logic (requires user interaction first in modern browsers to play sound)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type === 'EMERGENCY' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(type === 'EMERGENCY' ? 800 : 440, audioContext.currentTime);

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch (err) {
    console.log("Audio API failed or blocked:", err);
  }
};
