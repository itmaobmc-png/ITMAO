// Helper utilities for SmartStok

export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatKHR = (amount) => {
  return new Intl.NumberFormat('km-KH', {
    maximumFractionDigits: 0
  }).format(Math.round(amount || 0)) + ' ៛';
};

export const usdToRiel = (usdAmount, rate = 4100) => {
  return Math.round((usdAmount || 0) * rate);
};

export const formatDate = (dateString, lang = 'km') => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (lang === 'km') {
    return d.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Web Audio API pure beep sound effects (no external audio files needed)
export const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
};

export const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Play a friendly two-tone chord
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now + 0.1);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // Ignore
  }
};

// Storage helpers
export const loadStorage = (key, defaultVal) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch (err) {
    console.error('Error reading localStorage for key:', key, err);
    return defaultVal;
  }
};

export const saveStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Error saving to localStorage for key:', key, err);
  }
};
