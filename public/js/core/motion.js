/* ============ MOTION LAYER — EYE 3 family: alpana mandalas, live board objects, wipe, tilt, rings, opening show ============ */
const Motion = (() => {
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- alpana artwork, generated (painted through CSS masks) ---------- */
  function mandalaSVG() {
    const P = 'M0,-48 C13,-62 8,-76 0,-84 C-8,-76 -13,-62 0,-48 Z', p = 'M0,-57 C4.4,-63 2.6,-68 0,-73 C-2.6,-68 -4.4,-63 0,-57 Z', I = 'M0,-14 C10,-22 7,-32 0,-39 C-7,-32 -10,-22 0,-14 Z';
    let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200"><g fill="none" stroke="#000" stroke-linejoin="round">';
    s += '<circle r="97" stroke-width="3"/><circle r="91" stroke-width="1.3"/><circle r="45" stroke-width="2"/><circle r="40" stroke-width="1.1"/><circle r="9" stroke-width="2"/>';
    for (let i = 0; i < 16; i++) s += `<path transform="rotate(${i * 22.5})" d="${P}" stroke-width="2"/>`;
    for (let i = 0; i < 8; i++) s += `<path transform="rotate(${i * 45 + 22.5})" d="${I}" stroke-width="1.8"/>`;
    s += '</g><g fill="#000">';
    for (let i = 0; i < 16; i++) s += `<path transform="rotate(${i * 22.5})" d="${p}"/>`;
    for (let i = 0; i < 40; i++) { const a = i * Math.PI / 20; s += `<circle cx="${(86 * Math.sin(a)).toFixed(1)}" cy="${(-86 * Math.cos(a)).toFixed(1)}" r="1.8"/>`; }
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; s += `<circle cx="${(27 * Math.sin(a)).toFixed(1)}" cy="${(-27 * Math.cos(a)).toFixed(1)}" r="1.4"/>`; }
    s += '<circle r="3.4"/></g></svg>';
    return s;
  }
  const VINE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 16" preserveAspectRatio="none"><path d="M0,8 Q12,0 24,8 T48,8" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"/><path d="M11,4 q4,-5 9,-3 q-3,5 -9,3z M37,12 q-4,5 -9,3 q3,-5 9,-3z"/><circle cx="24" cy="8" r="2"/><circle cx="0" cy="8" r="2"/><circle cx="48" cy="8" r="2"/></svg>';
  const url = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  function flowerSVG() {
    let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><g fill="#000">';
    for (let i = 0; i < 6; i++) s += `<ellipse cx="0" cy="-24" rx="13" ry="22" transform="rotate(${i * 60})"/>`;
    return s + '</g><circle r="9" fill="#000"/></svg>';
  }
  const LEAF = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M6 34 C6 16 18 6 34 6 C34 24 24 34 6 34Z"/><path d="M6 34 L26 14" stroke="#fff" stroke-width="1.6"/></svg>';
  function installArt() { const r = document.documentElement.style; r.setProperty('--m-mandala', url(mandalaSVG())); r.setProperty('--m-vine', url(VINE)); r.setProperty('--m-flower', url(flowerSVG())); r.setProperty('--m-leaf', url(LEAF)); }

  /* ---------- one live object per section (SVG + CSS keyframes) ---------- */
  const OBJ = {
    home: () => `<i class="ob-mandala"></i>`,
    play: () => `<svg viewBox="0 0 64 64"><ellipse class="ob-shadow" cx="32" cy="58" rx="12" ry="3"/><g class="ob-ball"><circle cx="32" cy="22" r="12"/><path d="M20 22h24M32 10c6 6 6 18 0 24M32 10c-6 6 -6 18 0 24"/></g><path class="ob-spark" d="M52 10l2 4 4 1-4 2-1 4-2-4-4-1 4-2z"/></svg>`,
    dev: () => `<svg viewBox="0 0 64 64"><path d="M10 56h44"/><path class="ob-stem" pathLength="1" d="M32 56 C32 46 31 38 33 28"/><path class="ob-leaf l1" d="M33 40 C24 40 20 34 20 30 C27 30 32 34 33 40Z"/><path class="ob-leaf l2" d="M33 32 C40 32 46 26 46 21 C38 21 34 26 33 32Z"/><path class="ob-arrow" d="M50 50 L50 14 M44 20 L50 14 L56 20"/></svg>`,
    health: () => `<svg viewBox="0 0 64 64"><path class="ob-heart" d="M32 50 C18 40 10 32 10 23 C10 16 15 12 21 12 C26 12 29 15 32 19 C35 15 38 12 43 12 C49 12 54 16 54 23 C54 32 46 40 32 50Z"/><polyline class="ob-ecg" pathLength="1" points="4,34 18,34 22,26 27,42 31,22 35,34 60,34"/></svg>`,
    calendar: () => `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20"/><g class="ob-ticks">${Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30} 32 32)" d="M32 14v3"/>`).join('')}</g><path class="ob-hh" d="M32 32V22"/><path class="ob-mm" d="M32 32V16"/><path class="ob-ss" d="M32 34V14"/><circle cx="32" cy="32" r="1.8" class="ob-fill"/><g class="ob-orbit"><circle cx="32" cy="4" r="3.2" class="ob-fill"/></g></svg>`,
    gallery: () => `<svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="36" rx="7"/><path d="M22 16l4-6h12l4 6"/><g class="ob-aperture">${Array.from({ length: 6 }, (_, i) => `<path transform="rotate(${i * 60} 32 34)" d="M32 34 L32 22 L41 27"/>`).join('')}<circle cx="32" cy="34" r="12"/></g><circle class="ob-flash" cx="48" cy="23" r="3"/></svg>`,
    reports: () => `<svg viewBox="0 0 64 64"><path d="M8 56h48"/>${[14, 26, 38, 50].map((x, i) => `<rect class="ob-bar b${i}" x="${x - 4}" y="16" width="8" height="40" rx="2"/>`).join('')}<polyline class="ob-trend" pathLength="1" points="10,44 22,36 34,40 46,24 56,18"/></svg>`,
    settings: () => `<svg viewBox="0 0 64 64"><g class="ob-gear g1">${gear(24, 26, 13)}</g><g class="ob-gear g2">${gear(44, 42, 9)}</g></svg>`
  };
  function gear(cx, cy, r) {
    let d = ''; for (let i = 0; i < 8; i++) d += `<rect x="${cx - 2.6}" y="${cy - r - 4}" width="5.2" height="6" rx="1.2" transform="rotate(${i * 45} ${cx} ${cy})"/>`;
    return `<g style="transform-origin:${cx}px ${cy}px">${d}<circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.38}"/></g>`;
  }
  const obj = (kind, cls = '') => `<span class="ob ob-${kind} ${cls}" aria-hidden="true">${(OBJ[kind] || OBJ.home)()}</span>`;
  // real Dhaka time on every clock object
  function tickClocks() {
    const p = Cal.dhakaParts();
    $$('.ob-calendar').forEach(c => {
      const set = (sel, deg) => { const e = c.querySelector(sel); if (e) e.setAttribute('transform', `rotate(${deg} 32 32)`); };
      set('.ob-hh', (p.h % 12) * 30 + p.mi * 0.5); set('.ob-mm', p.mi * 6 + p.s * 0.1); set('.ob-ss', p.s * 6);
    });
    $$('[data-live=clock]').forEach(e => e.textContent = Cal.clock());
  }
  setInterval(tickClocks, 1000);

  /* ---------- gold mandala wipe between sections ---------- */
  function wipe() {
    if (still()) return;
    let w = $('#wipe'); if (!w) { w = document.createElement('div'); w.id = 'wipe'; w.innerHTML = '<i></i>'; document.body.appendChild(w); }
    w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
  }

  /* ---------- tiles tilt towards the pointer, with a gold sheen ---------- */
  function tilt(root = document) {
    if (still()) return;
    $$('[data-tilt]', root).forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
        t.style.setProperty('--sx', (x + .5) * 100 + '%'); t.style.setProperty('--sy', (y + .5) * 100 + '%'); t.classList.add('tilting');
      });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; t.classList.remove('tilting'); });
    });
  }

  /* ---------- numbers count up when they appear ---------- */
  function countUp(root = document) {
    $$('[data-count]', root).forEach(e => {
      const to = +e.dataset.count; if (still() || !to) { e.textContent = to.toLocaleString(); return; }
      const t0 = performance.now(), dur = 900 + Math.min(600, to * 8);
      const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); e.textContent = v.toLocaleString(); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* ---------- progress / countdown ring ---------- */
  function ring(pct, label, sub, color = 'var(--gold)', size = 74) {
    const r = 30, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct));
    return `<div class="ring" style="--rc:${color}"><svg viewBox="0 0 72 72" width="${size}" height="${size}"><circle cx="36" cy="36" r="${r}" class="rt"/><circle cx="36" cy="36" r="${r}" class="rv" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - v)).toFixed(1)}" style="--c:${c.toFixed(1)}"/></svg><b>${label}</b><span>${sub}</span></div>`;
  }

  /* ---------- the OPENING show — a garden sunrise (≈5.5 s, every cold open, any tap skips) ---------- */
  async function intro() {
    if (still() || !(await DB.meta.get('intro', true))) return;
    const a = ageOn(Child.birth), g = Cal.greeting(), t = Cal.today();
    let photo = './img/bg-affaan.jpg';
    try { const it = (await galleryItems()).find(i => i.type === 'photo'); if (it) photo = (await Media.url(it.photoId, 'full')) || photo; } catch (e) { }
    const title = "Affaan's World".split('').map((ch, i) => ch === ' ' ? '<span class="sp"></span>' : `<span style="animation-delay:${(3.0 + i * 0.06).toFixed(2)}s">${esc(ch)}</span>`).join('');
    let petals = ''; for (let i = 0; i < 16; i++) petals += `<i style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(1.2 + Math.random() * 3).toFixed(2)}s;animation-duration:${(5 + Math.random() * 4).toFixed(1)}s;background:${['#F28DB2', '#F2C14E', '#FFFFFF', '#8FD06A'][i % 4]}"></i>`;
    const el = document.createElement('div'); el.id = 'intro'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<div class="in-sky"></div><div class="in-sun"></div>
      <svg class="in-hills" viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice">
        <path class="h1" d="M0 120 C70 80 130 110 200 92 C270 74 330 108 400 86 V220 H0Z" fill="#9CCB8A"/>
        <path class="h1" d="M0 120 C70 80 130 110 200 92 C270 74 330 108 400 86" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 4" opacity=".7"/>
        <path class="h2" d="M0 150 C80 128 150 146 220 132 C290 118 340 140 400 126 V220 H0Z" fill="#6FB25A"/>
        <path class="h2" d="M0 150 C80 128 150 146 220 132 C290 118 340 140 400 126" fill="none" stroke="#fff" stroke-width="1.3" stroke-dasharray="3 4" opacity=".7"/>
        <path class="river" d="M0 176 C120 166 260 182 400 170 V188 C260 196 120 186 0 194Z" fill="#5FB3E0"/>
        <circle class="seed" cx="200" cy="40" r="4" fill="#8A5A30"/>
        <path class="trunk" pathLength="1" d="M200 152 C199 132 201 112 200 92" stroke="#8A5A30" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path class="br b1" pathLength="1" d="M200 112 Q186 100 174 98" stroke="#8A5A30" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <path class="br b2" pathLength="1" d="M200 104 Q214 92 228 92" stroke="#8A5A30" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <g class="crown">${Array.from({ length: 34 }, (_, i) => { const an = i * 2.39996, r = Math.sqrt(i + 1) * 4.4; return `<ellipse cx="${(200 + Math.cos(an) * r * 1.2).toFixed(1)}" cy="${(84 + Math.sin(an) * r * .8).toFixed(1)}" rx="5" ry="3" fill="${i % 5 === 0 ? '#E8B93A' : '#3E9B45'}" transform="rotate(${(an * 57.3).toFixed(0)} ${(200 + Math.cos(an) * r * 1.2).toFixed(1)} ${(84 + Math.sin(an) * r * .8).toFixed(1)})" style="animation-delay:${(2.0 + i * 0.025).toFixed(2)}s"/>`; }).join('')}</g>
        <g class="flowers">${[[176, 96, '#E46A8C'], [224, 86, '#4F8FDB'], [206, 72, '#9B6BE0'], [186, 78, '#3DAA66']].map(([x, y, c], i) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}" style="animation-delay:${(2.5 + i * .12).toFixed(2)}s"/>`).join('')}</g>
      </svg>
      <div class="in-petals">${petals}</div>
      <div class="in-doel">${doelSVG()}</div>
      <div class="in-photo" style="background-image:url('${photo}')"></div>
      <div class="in-text"><div class="in-title">${title}</div><div class="in-bn">আফফানের পৃথিবী</div>
        <div class="in-greet">${g[0]} · day ${a.days.toLocaleString()} · ${bnNum(t.bd.d)} ${t.bd.month}</div></div>
      <div class="in-skip">tap anywhere to skip</div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-on');
    await new Promise(res => {
      let done = false;
      const end = fast => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => { el.remove(); document.documentElement.classList.remove('intro-on'); res(); }, fast ? 300 : 650); };
      el.addEventListener('pointerdown', () => end(true)); document.addEventListener('keydown', () => end(true), { once: true });
      setTimeout(() => end(false), 5600);
    });
  }
  return { installArt, obj, tickClocks, wipe, tilt, countUp, ring, intro, still };
})();
