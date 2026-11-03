/* ============ ROBUST SPEECH ENGINE (carried over from v4 — the audio fix) ============
 - Mobile browsers block speech until a user gesture: the first tap anywhere
   (usually the PIN keypad) speaks a silent utterance to unlock audio.
 - Voices load asynchronously on most phones: we listen for voiceschanged AND poll
   briefly, and re-pick the voice at speak time, never at startup. */
const Speech = (function () {
  const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voices = [], unlocked = false, enabled = true;
  try { enabled = JSON.parse(localStorage.getItem('rehbar_soundOn') ?? 'true'); } catch (e) { }
  function load() { if (ok) voices = speechSynthesis.getVoices() || []; }
  if (ok) {
    load();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load); else speechSynthesis.onvoiceschanged = load;
    let tries = 0; const iv = setInterval(() => { load(); if (voices.length || ++tries > 40) clearInterval(iv); }, 250);
  }
  function pick(lang) {
    if (!voices.length) load();
    if (!voices.length) return null;
    const base = lang.slice(0, 2);
    return voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase())
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(base))
      || (base === 'bn' ? voices.find(v => /bangla|bengali/i.test(v.name)) : null)
      || null;
  }
  function hasBangla() { return !!pick('bn-BD'); }
  function unlock() {
    if (!ok || unlocked) return; unlocked = true;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { }
  }
  function speakOne(text, lang, rate) {
    return new Promise(res => {
      if (!ok || !enabled || !text) { res(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = rate || 0.85; u.pitch = 1.12;
      const v = pick(lang); if (v) u.voice = v;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1500 + text.length * 140);          // never hang the queue if onend is lost (iOS)
      speechSynthesis.speak(u);
      if (speechSynthesis.paused) speechSynthesis.resume();  // Chrome/Android sometimes starts paused
    });
  }
  let token = 0;
  async function seq(parts) {
    if (!ok || !enabled) return;
    unlock();
    const my = ++token;
    speechSynthesis.cancel();
    await new Promise(r => setTimeout(r, 60));            // let cancel settle on iOS
    for (const p of parts) { if (my !== token) return; await speakOne(p[0], p[1], p[2]); }
  }
  function stop() { token++; if (ok) speechSynthesis.cancel(); }
  function setEnabled(v) { enabled = v; try { localStorage.setItem('rehbar_soundOn', JSON.stringify(v)); } catch (e) { } if (!v) stop(); else unlock(); }
  function isEnabled() { return enabled; }
  function voiceInfo() { load(); return { ok, count: voices.length, en: (pick('en-US') || {}).name || null, bn: (pick('bn-BD') || {}).name || null, unlocked }; }
  return { ok, seq, stop, setEnabled, isEnabled, hasBangla, unlock, voiceInfo };
})();
// prime unlock on the very first touch anywhere (capture phase so nothing can swallow it)
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => Speech.unlock(), { once: true, capture: true }));
