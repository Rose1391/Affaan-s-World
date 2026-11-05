/* ============ SPEECH ENGINE — natural English + Bangladeshi Bangla ============
 What it does, and why:
 - Picks the best installed voice for each language by quality, not the first one found: Bangladesh Bangla (bn-BD)
   before Indian Bangla (bn-IN), and "Natural / Neural / Online / Google" voices first — e.g. Microsoft Nabanita or
   Pradeep (Natural) in Edge, Google Bangla (Bangladesh) on Android. A parent can choose a voice in Settings.
 - A Bangla line is never handed to an English voice (that is what made it sound broken). If no Bangla voice exists on
   the device, the Bangla line is skipped and Settings explains how to add one (or record the family voice).
 - Natural tone: pitch 1.0 and an unhurried, normal rate for Bangla; a warm, slightly slower English for a toddler.
 - Text is prepared for listening: "(সাঃ)" → সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম, "(রাঃ)" → রাদিয়াল্লাহু আনহু, symbols and emoji
   removed, and long text split at । ? ! and commas so Chrome never cuts a sentence off.
 - Each part is spoken to the very end before the next begins (end event + a "still speaking?" watch + a generous cap),
   with a short natural pause between English and Bangla. seq() returns a promise and Speech.idle() tells callers
   (quizzes, games) when the voice has finished, so nothing moves on in the middle of a sentence.
 - Mobile browsers block speech until a user gesture: the first tap anywhere unlocks audio. */
const Speech = (function () {
  const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voices = [], unlocked = false, enabled = true, busy = false, waiters = [];
  try { enabled = JSON.parse(localStorage.getItem('rehbar_soundOn') ?? 'true'); } catch (e) { }
  const prefKey = l => 'affaan_voice_' + l;
  function load() { if (ok) voices = speechSynthesis.getVoices() || []; }
  if (ok) {
    load();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load); else speechSynthesis.onvoiceschanged = load;
    let tries = 0; const iv = setInterval(() => { load(); if (voices.length || ++tries > 40) clearInterval(iv); }, 250);
  }
  const norm = l => (l || '').toLowerCase().replace('_', '-');
  // how good is this voice for this language?
  function score(v, lang) {
    const vl = norm(v.lang), base = lang.slice(0, 2), n = v.name || '';
    let s = -1;
    if (vl === norm(lang)) s = 50; else if (vl.startsWith(base)) s = 35; else if (base === 'bn' && /bangla|bengali|বাংলা/i.test(n)) s = 30; else return -1;
    if (base === 'bn') { if (vl === 'bn-bd' || /bangladesh/i.test(n)) s += 20; if (/nabanita|pradeep/i.test(n)) s += 15; }
    if (base === 'en') { if (/en-(gb|in|au)/.test(vl)) s += 4; if (/female|samantha|serena|libby|sonia|aria|jenny|neerja/i.test(n)) s += 6; }
    if (/natural|neural|online|premium|enhanced|wavenet|studio/i.test(n)) s += 30;
    if (/google/i.test(n)) s += 14; if (/microsoft/i.test(n)) s += 6;
    if (v.localService === false) s += 4;
    if (/compact|eloquence|novelty|whisper|bad news|bells|bubbles|zarvox|trinoids|cellos|organ|boing/i.test(n)) s -= 40;
    return s;
  }
  function candidates(lang) { if (!voices.length) load(); return voices.map(v => [v, score(v, lang)]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1]).map(x => x[0]); }
  function pick(lang) {
    const list = candidates(lang); if (!list.length) return null;
    let want = null; try { want = localStorage.getItem(prefKey(lang.slice(0, 2))); } catch (e) { }
    return (want && list.find(v => v.voiceURI === want || v.name === want)) || list[0];
  }
  function hasBangla() { return !!pick('bn-BD'); }
  function unlock() {
    if (!ok || unlocked) return; unlocked = true;
    try { load(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) { }
  }
  // prepare text for listening
  function clean(text, bn) {
    let t = String(text || '');
    if (bn) t = t.replace(/\(সাঃ\)|\(সা\.\)|\(স\.\)/g, ', সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম,').replace(/\(রাঃ\)|\(রা\.\)/g, ', রাদিয়াল্লাহু আনহু,').replace(/\(রহঃ\)/g, ', রাহমাতুল্লাহি আলাইহি,')
      .replace(/৳/g, ' টাকা ').replace(/ড\.\s?/g, 'ডক্টর ').replace(/॥/g, '।');
    else t = t.replace(/\(PBUH\)/gi, ', peace be upon him,').replace(/\(RA\)/g, ', may Allah be pleased with him,').replace(/\bD\.C\./g, 'D C').replace(/৳/g, ' taka ');
    return t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ').replace(/[·•|]/g, ', ').replace(/[“”"«»]/g, '').replace(/\s*[—–]\s*/g, ', ')
      .replace(/\s*,\s*,+/g, ', ').replace(/^\s*,\s*/, '').replace(/\s+/g, ' ').replace(/\s+([,।!?.])/g, '$1').replace(/,([।!?.])/g, '$1').trim();
  }
  // split into speakable chunks (Chrome stops long utterances); keep the sentence punctuation
  function chunks(text) {
    if (text.length <= 160) return text ? [text] : [];       // short lines in one go: each extra start costs the phone time
    const parts = text.match(/[^।!?.]+[।!?.]*/g) || [text], out = [];
    for (let p of parts) { p = p.trim(); if (!p) continue;
      while (p.length > 150) { let cut = p.lastIndexOf(',', 150); if (cut < 40) cut = p.lastIndexOf(' ', 150); if (cut < 40) cut = 150; out.push(p.slice(0, cut + 1).trim()); p = p.slice(cut + 1).trim(); }
      if (p) out.push(p); }
    return out;
  }
  // phones differ: some refuse an utterance with a voice object or a voice's own lang code. "plain" mode (remembered)
  // speaks with just the language, which every mobile browser accepts.
  let plain = false; try { plain = localStorage.getItem('affaan_tts_plain') === '1'; } catch (e) { }
  const diag = { last: '', errors: 0, plain: () => plain };
  const tag = l => (l || '').replace('_', '-');
  function utter(text, lang, rate, voice, simple) {
    return new Promise(res => {
      let u; const bn = lang.startsWith('bn');
      try {
        u = new SpeechSynthesisUtterance(text);
        u.lang = tag(lang);                                       // always the requested language, e.g. en-US / bn-BD
        if (voice && !simple && !plain) u.voice = voice;          // only ever assign a real voice object
        u.rate = bn ? Math.min(1, Math.max(.82, (rate || .9) + .06)) : Math.min(1, Math.max(.75, rate || .9));
        u.pitch = bn ? 1 : 1.04; u.volume = 1;
      } catch (e) { diag.last = 'build: ' + e.message; res('fail'); return; }
      let done = false, started = false; const t0 = performance.now();
      const fin = r => { if (done) return; done = true; clearInterval(watch); clearTimeout(cap); res(r || (started ? 'ok' : 'nostart')); };
      u.onstart = () => { started = true; };
      u.onend = () => fin('ok');
      u.onerror = e => { const er = (e && e.error) || 'error'; diag.last = er; diag.errors++; if (er === 'not-allowed') unlocked = false; fin(er === 'interrupted' || er === 'canceled' ? 'ok' : 'fail'); };
      // a "still speaking?" watch for browsers that lose the end event; a generous cap so nothing ever hangs
      const watch = setInterval(() => { if (speechSynthesis.speaking || speechSynthesis.pending) { if (speechSynthesis.speaking) started = true; return; } if (started || performance.now() - t0 > 4000) fin(); }, 100);
      const cap = setTimeout(() => fin(), 6000 + text.length * (bn ? 260 : 180));
      try { speechSynthesis.speak(u); if (speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { diag.last = 'speak: ' + e.message; fin('fail'); }
    });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // voices load a moment after the app opens: wait for them briefly before deciding anything
  async function ready() { for (let i = 0; i < 12 && !voices.length; i++) { load(); if (voices.length) break; await sleep(150); } }
  async function speakOne(text, lang, rate, my) {
    const bn = lang.startsWith('bn');
    await ready();
    const voice = pick(bn ? 'bn-BD' : lang);
    // never let an English voice read Bangla: skip only when the phone's voice list is known and has no Bangla at all
    if (bn && !voice && voices.length && !voices.some(v => /^bn/i.test(tag(v.lang)))) { diag.last = 'no Bangla voice on this device'; return; }
    for (const c of chunks(clean(text, bn))) {
      if (my !== token) return;
      let r = await utter(c, bn ? 'bn-BD' : lang, rate, voice);
      if (r !== 'ok' && my === token) {                           // retry once the simplest way, and remember it worked
        speechSynthesis.cancel(); await sleep(120);
        const r2 = await utter(c, bn ? 'bn-BD' : lang, rate, voice, true);
        if (r2 === 'ok' && !plain) { plain = true; try { localStorage.setItem('affaan_tts_plain', '1'); } catch (e) { } }
      }
      if (my !== token) return; await sleep(30);
    }
  }
  let token = 0;
  // Queued playback: every piece (English, then Bangla) is handed to the phone at once, so it prepares the Bangla voice
  // while still speaking the English and the Bangla follows almost immediately ("Cow" → "গরু"). Phones that do not
  // play a queue properly fall back to speaking one piece at a time (remembered).
  let oneByOne = false; try { oneByOne = localStorage.getItem('affaan_tts_seq') === '1'; } catch (e) { }
  function build(text, lang, rate, voice) {
    const u = new SpeechSynthesisUtterance(text), bn = lang.startsWith('bn');
    u.lang = tag(lang); if (voice && !plain) u.voice = voice;
    u.rate = bn ? Math.min(1, Math.max(.82, (rate || .9) + .06)) : Math.min(1, Math.max(.75, rate || .9));
    u.pitch = bn ? 1 : 1.04; u.volume = 1; return u;
  }
  async function pieces(parts) {
    await ready(); const out = [];
    for (const p of parts) { if (!p || !p[0]) continue; const lang = p[1] || 'en-US', bn = lang.startsWith('bn'), voice = pick(bn ? 'bn-BD' : lang);
      if (bn && !voice && voices.length && !voices.some(v => /^bn/i.test(tag(v.lang)))) { diag.last = 'no Bangla voice on this device'; continue; }
      for (const c of chunks(clean(p[0], bn))) out.push({ text: c, lang: bn ? 'bn-BD' : lang, rate: p[2], voice, bn }); }
    return out;
  }
  function playQueue(list, my) {
    return new Promise(res => {
      let started = 0, ended = 0, done = false; const t0 = performance.now();
      const fin = r => { if (done) return; done = true; clearInterval(watch); clearTimeout(cap); res(r); };
      const us = list.map(it => { let u; try { u = build(it.text, it.lang, it.rate, it.voice); } catch (e) { return null; }
        u.onstart = () => { started++; }; u.onend = () => { ended++; if (ended >= us.length) fin('ok'); };
        u.onerror = e => { const er = (e && e.error) || 'error'; diag.last = er; diag.errors++; if (er === 'not-allowed') unlocked = false; ended++; if (ended >= us.length) fin(started ? 'ok' : 'fail'); }; return u; }).filter(Boolean);
      if (!us.length) return fin('ok');
      const total = list.reduce((n, it) => n + it.text.length * (it.bn ? 260 : 180), 0);
      const watch = setInterval(() => { if (my !== token) return fin('stopped');
        if (speechSynthesis.speaking || speechSynthesis.pending) { if (speechSynthesis.speaking && !started) started = 1; return; }
        if (started || performance.now() - t0 > 3000) fin(started ? 'ok' : 'nostart'); }, 100);
      const cap = setTimeout(() => fin(started ? 'ok' : 'nostart'), 6000 + total);
      try { us.forEach(u => speechSynthesis.speak(u)); if (speechSynthesis.paused) speechSynthesis.resume(); } catch (e) { diag.last = 'speak: ' + e.message; fin('fail'); }
    });
  }
  async function seq(parts) {
    if (!ok || !enabled) return;
    unlock();
    const my = ++token; busy = true;
    try { speechSynthesis.cancel(); } catch (e) { }
    await sleep(120);                                           // let cancel settle (iOS / Chrome Android)
    try {
      if (!oneByOne) {
        const list = await pieces(parts); if (my !== token) return;
        const r = await playQueue(list, my);
        if (r === 'ok' || r === 'stopped' || my !== token) return;
        oneByOne = true; try { localStorage.setItem('affaan_tts_seq', '1'); } catch (e) { }   // this phone needs one at a time
        try { speechSynthesis.cancel(); } catch (e) { } await sleep(120);
      }
      for (let i = 0; i < parts.length; i++) { const p = parts[i]; if (my !== token) return; if (!p || !p[0]) continue;
        await speakOne(p[0], p[1] || 'en-US', p[2], my);
        if (i < parts.length - 1) await sleep(60); }
    }
    catch (e) { diag.last = 'seq: ' + e.message; }
    finally { if (my === token) { busy = false; const w = waiters; waiters = []; w.forEach(f => f()); } }
  }
  // resolves when the voice has finished (or after `max` ms)
  function idle(max = 15000) { if (!busy) return Promise.resolve(); return new Promise(r => { const t = setTimeout(r, max); waiters.push(() => { clearTimeout(t); r(); }); }); }
  function stop() { token++; busy = false; const w = waiters; waiters = []; w.forEach(f => f()); if (ok) speechSynthesis.cancel(); }
  function setEnabled(v) { enabled = v; try { localStorage.setItem('rehbar_soundOn', JSON.stringify(v)); } catch (e) { } if (!v) stop(); else unlock(); }
  function isEnabled() { return enabled; }
  function setVoice(base, uri) { try { if (uri) localStorage.setItem(prefKey(base), uri); else localStorage.removeItem(prefKey(base)); } catch (e) { } }
  function list(base) { return candidates(base === 'bn' ? 'bn-BD' : 'en-US').map(v => ({ uri: v.voiceURI || v.name, name: v.name, lang: v.lang })); }
  function resetPlain() { plain = false; oneByOne = false; try { localStorage.removeItem('affaan_tts_plain'); localStorage.removeItem('affaan_tts_seq'); } catch (e) { } }
  function voiceInfo() { load(); return { ok, plain, last: diag.last, errors: diag.errors, count: voices.length, en: (pick('en-US') || {}).name || null, bn: (pick('bn-BD') || {}).name || null, bnLang: (pick('bn-BD') || {}).lang || null, unlocked }; }
  return { ok, seq, stop, idle, resetPlain, setEnabled, isEnabled, hasBangla, unlock, voiceInfo, list, setVoice, clean, chunks, isBusy: () => busy };
})();
// prime unlock on the very first touch anywhere (capture phase so nothing can swallow it)
['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => Speech.unlock(), { capture: true }));
