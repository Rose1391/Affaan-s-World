/* ============ playful sound effects (Web Audio synth — no files, works offline) ============
 Unlocked on the first tap together with speech; respects the same Sound on/off switch. */
const Sfx = (() => {
  let ctx = null;
  function ac() {
    try {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.18, when = 0, slide = 0) {
    if (!Speech.isEnabled()) return;
    const c = ac(); if (!c) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  return {
    unlock: () => { const c = ac(); if (c) { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } },
    tap: () => tone(660, 0.07, 'triangle', 0.1),
    pop: () => { tone(480, 0.12, 'sine', 0.28, 0, 2.4); tone(1200, 0.05, 'triangle', 0.06, 0.02); },
    boing: () => tone(190, 0.38, 'sine', 0.24, 0, 2.6),
    sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.16, 'sine', 0.05, i * 0.05)),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.13, i * 0.09)),
    oops: () => tone(320, 0.22, 'sine', 0.1, 0, 0.62),
    chirp: () => { tone(2200, 0.07, 'sine', 0.08, 0, 1.4); tone(2600, 0.08, 'sine', 0.08, 0.1, 1.3); tone(2400, 0.06, 'sine', 0.07, 0.2, 1.5); },
    whoosh: () => tone(300, 0.25, 'sawtooth', 0.03, 0, 3)
  };
})();
['pointerdown', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, () => Sfx.unlock(), { once: true, capture: true }));
