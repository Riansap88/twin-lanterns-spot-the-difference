// All sound is synthesised with WebAudio: no audio files, no network. The context is
// created on the first user gesture, so the game stays silent (and error-free) until
// the player starts it.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') void ctx.resume();
      return ctx;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, start, duration, type, gain) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, ac.currentTime + start);
    amp.gain.exponentialRampToValueAtTime(gain || 0.12, ac.currentTime + start + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + duration + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    setMuted(value) {
      muted = value;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(660, 0, 0.06, 'triangle', 0.06);
    },
    find() {
      tone(523.25, 0, 0.14, 'sine', 0.14);
      tone(659.25, 0.07, 0.14, 'sine', 0.14);
      tone(783.99, 0.14, 0.22, 'sine', 0.14);
    },
    miss() {
      tone(160, 0, 0.18, 'sawtooth', 0.05);
      tone(110, 0.05, 0.2, 'sawtooth', 0.05);
    },
    hint() {
      tone(880, 0, 0.1, 'sine', 0.08);
      tone(1174.66, 0.08, 0.16, 'sine', 0.08);
    },
    clear() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => tone(n, i * 0.11, 0.22, 'triangle', 0.12));
    },
    tick() {
      tone(1200, 0, 0.04, 'square', 0.03);
    },
  };
}
