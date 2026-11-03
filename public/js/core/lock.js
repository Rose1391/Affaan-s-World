/* ============ PIN lock ============
 PIN is stored only as a salted PBKDF2-SHA256 hash on this device (never synced).
 Locks on open and after the app has been in the background for the chosen time. */
const Lock = (() => {
  const ITER = 150000;
  let entered = '', mode = 'unlock', firstPin = '', fails = 0, coolUntil = 0, onDone = null, hiddenAt = 0, locked = false;
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  async function hash(pin, saltB64) {
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256));
  }
  async function setPin(pin) { const salt = b64(crypto.getRandomValues(new Uint8Array(16))); await DB.meta.set('pin', { salt, hash: await hash(pin, salt), len: pin.length }); }
  async function check(pin) { const p = await DB.meta.get('pin'); return !!p && (await hash(pin, p.salt)) === p.hash; }
  const hasPin = async () => !!(await DB.meta.get('pin'));

  function render() {
    const el = $('#lock');
    const titles = {
      unlock: ['Enter PIN', 'পিন দিন'], create: ['Create a PIN', 'নতুন পিন তৈরি করুন'], confirm: ['Confirm PIN', 'পিন আবার দিন'],
      old: ['Current PIN', 'বর্তমান পিন']
    }[mode];
    const cool = Date.now() < coolUntil;
    el.innerHTML = `
      <div class="lock-in">
        <div class="lock-brand"><img src="./icons/icon-192.png" alt=""><div><b>Affaan's <em>World</em></b><span class="bn">আফফানের পৃথিবী</span></div></div>
        <h2>${titles[0]} <span class="bn">· ${titles[1]}</span></h2>
        <p class="lock-sub">${mode === 'create' ? '4–6 digits. Protects health records on this phone.' : mode === 'confirm' ? 'Type the same PIN again.' : cool ? 'Too many tries — wait a moment.' : '&nbsp;'}</p>
        <div class="dots">${Array.from({ length: Math.max(4, entered.length) }, (_, i) => `<i class="${i < entered.length ? 'on' : ''}"></i>`).join('')}</div>
        <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}<small class="bn">${bnNum(n)}</small></button>`).join('')}
          <button data-k="ok" class="kp-ok" ${entered.length < 4 ? 'disabled' : ''}>OK</button><button data-k="0">0<small class="bn">০</small></button><button data-k="del" aria-label="Delete">⌫</button></div>
        ${mode === 'unlock' ? '<button class="linkbtn" data-k="forgot">Forgot PIN? · পিন ভুলে গেছেন?</button>' : mode === 'old' ? '<button class="linkbtn" data-k="cancel">Cancel</button>' : ''}
      </div>`;
  }
  async function key(k) {
    if (Date.now() < coolUntil) return;
    if (k === 'del') entered = entered.slice(0, -1);
    else if (k === 'forgot') return forgot();
    else if (k === 'cancel') { hide(); return; }
    else if (k === 'ok') return submit();
    else if (/\d/.test(k) && entered.length < 6) { entered += k; if (navigator.vibrate) navigator.vibrate(8); }
    render();
    if (mode === 'unlock' && entered.length >= 4) { const p = await DB.meta.get('pin'); if (p && entered.length === (p.len || 4)) submit(); }
  }
  async function submit() {
    if (entered.length < 4) return;
    if (mode === 'create') { firstPin = entered; entered = ''; mode = 'confirm'; render(); return; }
    if (mode === 'confirm') {
      if (entered !== firstPin) { entered = ''; mode = 'create'; render(); $('.lock-sub').textContent = "PINs didn't match — try again."; shake(); return; }
      await setPin(entered); toast('PIN saved · পিন সংরক্ষিত'); return finish();
    }
    if (await check(entered)) { fails = 0; if (mode === 'old') { entered = ''; mode = 'create'; render(); return; } return finish(); }
    fails++; entered = ''; if (fails >= 5) { coolUntil = Date.now() + 30000; setTimeout(render, 30100); }
    render(); shake();
  }
  function shake() { const d = $('#lock .dots'); if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); } }
  function finish() { hide(); const f = onDone; onDone = null; if (f) f(); }
  function show(m, cb) {
    mode = m; entered = ''; firstPin = ''; onDone = cb; locked = true;
    document.body.classList.add('locked'); $('#lock').hidden = false; render();
  }
  function hide() { locked = false; document.body.classList.remove('locked'); $('#lock').hidden = true; $('#lock').innerHTML = ''; }
  async function forgot() {
    const st = Sync.state();
    if (st.signedIn && navigator.onLine) {
      const pw = prompt(`Reset PIN: enter the account password for ${st.email}`);
      if (!pw) return;
      try { await Sync.verifyPassword(pw); mode = 'create'; entered = ''; render(); } catch (e) { alert('Password not accepted: ' + e.message); }
      return;
    }
    if (confirm('Without a signed-in account the PIN cannot be recovered.\n\nErase ALL data on this device and start fresh? (Restore later from a backup ZIP or by signing in to sync.)')) {
      if (prompt('Type ERASE to confirm') === 'ERASE') { await DB.wipe(); localStorage.clear(); location.reload(); }
    }
  }
  function bind() {
    $('#lock').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) key(b.dataset.k); });
    document.addEventListener('keydown', e => { if (!locked) return; if (/^\d$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del'); else if (e.key === 'Enter') key('ok'); });
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      const after = await DB.meta.get('lockAfter', 60);   // seconds
      if (!locked && hiddenAt && Date.now() - hiddenAt >= after * 1000 && await hasPin()) show('unlock', () => Bus.emit('unlocked'));
    });
  }
  async function start(cb) { bind(); if (await hasPin()) show('unlock', cb); else show('create', cb); }
  const lockNow = () => show('unlock', () => Bus.emit('unlocked'));
  const change = () => show('old', () => { });
  return { start, lockNow, change, isLocked: () => locked };
})();
