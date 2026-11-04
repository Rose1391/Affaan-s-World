/* ============ WORLD EXPLORER — flags · capitals · currencies · the 3D globe (English + বাংলা) ============
 195 countries (193 UN members + Palestine and Vatican City). Each part has Learn (browse by continent, tap to hear)
 and Quiz (pick the right one of three). The globe is drawn with d3-geo (orthographic) on a canvas: drag to spin,
 pinch or scroll to zoom, tap a country to see its flag, capital and currency, or play "Find the country". */
const EX = { tab: 'flags', ct: 'all', mode: 'learn', q: '', lang: 'en', quiz: null, score: 0 };
const EX_TABS = [['flags', '🏳️', 'Flags', 'পতাকা'], ['capitals', '🏛️', 'Capitals', 'রাজধানী'], ['currency', '💰', 'Currencies', 'মুদ্রা'], ['globe', '🌍', 'Globe', 'গ্লোব']];
// Bangla possessive: vowel ending → "র" (ইতালির), consonant ending → "ের" (বাংলাদেশের)
const bnOf = n => /[ািীুূৃেৈোৌঅআইঈউঊঋএঐওঔ]$/.test(n) ? n + 'র' : n + 'ের';
const exFlag = (c, cls = '') => `<img class="exflag ${cls}" src="./flags/${c.id.toLowerCase()}.svg" alt="Flag of ${esc(c.en)}" loading="lazy" decoding="async">`;
const exList = () => { const q = EX.q.trim().toLowerCase();
  return COUNTRIES.filter(c => (q || EX.ct === 'all' || c.ct === EX.ct) && (!q || [c.en, c.bn, c.cap, c.capBn, c.cur, c.curBn, c.code].some(v => v.toLowerCase().includes(q)))).sort((a, b) => a.en.localeCompare(b.en)); };
const exSay = (c, tab) => {
  const parts = tab === 'capitals' ? [[`The capital of ${c.en} is ${c.cap}.`, 'en-US', .88], [`${bnOf(c.bn)} রাজধানী ${c.capBn}।`, 'bn-BD', .88]]
    : tab === 'currency' ? [[`${c.en} uses the ${c.cur}.`, 'en-US', .88], [`${bnOf(c.bn)} মুদ্রা ${c.curBn}।`, 'bn-BD', .88]]
    : [[c.en + '.', 'en-US', .85], [c.bn + '।', 'bn-BD', .85]];
  return Voice.say(`CT:${tab}:${c.id}`, parts);
};

function exploreHTML() {
  const tabs = `<div class="extabs">${EX_TABS.map(([k, ic, en, bn]) => `<button class="extab ${EX.tab === k ? 'on' : ''}" data-act="exTab" data-v="${k}"><span>${ic}</span><b>${en}</b><i class="bn">${bn}</i></button>`).join('')}</div>`;
  if (EX.tab === 'globe') return `<div class="kpad expad">${tabs}${globeHTML()}</div>`;
  const conts = `<div class="exconts"><button class="exct ${EX.ct === 'all' ? 'on' : ''}" data-act="exCt" data-v="all">🌐 All · সব</button>${Object.entries(CONTINENTS).map(([k, v]) => `<button class="exct ${EX.ct === k ? 'on' : ''}" data-act="exCt" data-v="${k}" style="--cc:${v[2]}">${v[0]} · <span class="bn">${v[1]}</span></button>`).join('')}</div>`;
  const tools = `<div class="extools"><div class="exmode"><button class="${EX.mode === 'learn' ? 'on' : ''}" data-act="exMode" data-v="learn">📖 Learn · <span class="bn">শিখি</span></button><button class="${EX.mode === 'quiz' ? 'on' : ''}" data-act="exMode" data-v="quiz">⭐ Quiz · <span class="bn">খেলি</span></button></div>
    ${EX.mode === 'learn' ? `<input class="exsearch" type="search" placeholder="Search · খুঁজুন" value="${esc(EX.q)}" data-input="exSearch" aria-label="Search countries">` : `<span class="exscore">⭐ ${EX.score}</span>`}</div>`;
  return `<div class="kpad expad">${tabs}${conts}${tools}<div id="exBody">${EX.mode === 'quiz' ? exQuizHTML() : exLearnHTML()}</div></div>`;
}
function exLearnHTML() {
  const L = exList(); if (!L.length) return `<p class="exempty">No country found · <span class="bn">কিছু পাওয়া যায়নি</span></p>`;
  const card = c => EX.tab === 'flags'
    ? `<button class="excard flagcard" data-act="exTap" data-id="${c.id}">${exFlag(c)}<b>${esc(c.en)}</b><span class="bn">${esc(c.bn)}</span></button>`
    : EX.tab === 'capitals'
    ? `<button class="excard capcard" data-act="exTap" data-id="${c.id}">${exFlag(c, 'sm')}<small>Capital of ${esc(c.en)} · <span class="bn">${esc(bnOf(c.bn))} রাজধানী</span></small><b>${esc(c.cap)}</b><span class="bn">${esc(c.capBn)}</span></button>`
    : `<button class="excard curcard" data-act="exTap" data-id="${c.id}">${exFlag(c, 'sm')}<small>${esc(c.en)} · <span class="bn">${esc(c.bn)}</span></small><b>${esc(c.cur)}</b><span class="bn">${esc(c.curBn)}</span><em>${esc(c.code)}</em></button>`;
  return `<p class="excount">${L.length} ${L.length === 1 ? 'country' : 'countries'} · <span class="bn">${bnNum(L.length)}টি দেশ</span></p><div class="exgrid ${EX.tab}">${L.map(card).join('')}</div>`;
}
// quiz: one question, three choices from the chosen continent
function exNewQuiz() {
  let pool = COUNTRIES.filter(c => EX.ct === 'all' || c.ct === EX.ct); if (pool.length < 3) pool = COUNTRIES;
  const pick = () => pool[Math.floor(Math.random() * pool.length)];
  const ans = pick(), key = c => EX.tab === 'capitals' ? c.cap : EX.tab === 'currency' ? c.cur : c.id;
  const opts = [ans]; let guard = 0;
  while (opts.length < 3 && guard++ < 200) { const o = pick(); if (!opts.some(x => key(x) === key(o))) opts.push(o); }
  EX.quiz = { ans: ans.id, opts: opts.sort(() => Math.random() - .5).map(o => o.id), tries: 0 };
}
function exQuizHTML() {
  if (!EX.quiz) exNewQuiz();
  const C = id => COUNTRIES.find(c => c.id === id), a = C(EX.quiz.ans);
  const q = EX.tab === 'flags' ? [`Which is the flag of ${a.en}?`, `কোনটি ${bnOf(a.bn)} পতাকা?`]
    : EX.tab === 'capitals' ? [`What is the capital of ${a.en}?`, `${bnOf(a.bn)} রাজধানী কোনটি?`] : [`Which money does ${a.en} use?`, `${bnOf(a.bn)} মুদ্রা কোনটি?`];
  const opt = id => { const c = C(id); return EX.tab === 'flags' ? `<button class="exopt flagopt" data-act="exAns" data-id="${id}">${exFlag(c)}</button>`
    : `<button class="exopt" data-act="exAns" data-id="${id}"><b>${esc(EX.tab === 'capitals' ? c.cap : c.cur)}</b><span class="bn">${esc(EX.tab === 'capitals' ? c.capBn : c.curBn)}</span></button>`; };
  return `<div class="exquiz"><div class="exq">${EX.tab !== 'flags' ? exFlag(a, 'qflag') : ''}<b>${esc(q[0])}</b><span class="bn">${esc(q[1])}</span></div>
    <div class="exopts ${EX.tab}">${EX.quiz.opts.map(opt).join('')}</div><div class="exfb" id="exFb"></div></div>`;
}
ACT.exTab = el => { Sfx.tap(); EX.tab = el.dataset.v; EX.quiz = null; route(); };
ACT.exCt = el => { Sfx.tap(); EX.ct = el.dataset.v; EX.quiz = null; route(); };
ACT.exMode = el => { Sfx.tap(); EX.mode = el.dataset.v; EX.quiz = null; route(); };
ACT.exSearch = el => { EX.q = el.value; const b = $('#exBody'); if (b) b.innerHTML = exLearnHTML(); };
ACT.exTap = el => { const c = COUNTRIES.find(x => x.id === el.dataset.id); popAnim(el); Kid.tap('explore'); exSay(c, EX.tab); };
ACT.exAns = el => {
  const c = COUNTRIES.find(x => x.id === EX.quiz.ans), fb = $('#exFb');
  if (el.dataset.id === EX.quiz.ans) {
    el.classList.add('right'); Kid.reward(el); Sfx.win && Sfx.win(); EX.score += EX.quiz.tries ? 1 : 2;
    if (fb) fb.innerHTML = `✓ ${esc(EX.tab === 'capitals' ? c.cap : EX.tab === 'currency' ? c.cur : c.en)} · <span class="bn">${esc(EX.tab === 'capitals' ? c.capBn : EX.tab === 'currency' ? c.curBn : c.bn)}</span>`;
    Kid.tap('explore'); const q = EX.quiz;
    Promise.all([exSay(c, EX.tab), new Promise(r => setTimeout(r, 1400))]).then(() => setTimeout(() => { if (EX.mode !== 'quiz' || EX.quiz !== q) return; EX.quiz = null; route(); }, 600));
  } else { EX.quiz.tries++; el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 600); Sfx.tap();
    if (fb) fb.innerHTML = `Try again · <span class="bn">আবার চেষ্টা করো</span>`; }
};

/* ---------------- the globe ---------------- */
function globeHTML() {
  return `<div class="globewrap"><div class="globe-stage" id="globeStage"><canvas id="globeCv" aria-label="3D globe"></canvas>
      <div class="globe-loading">Loading the world… · <span class="bn">পৃথিবী আসছে…</span></div></div>
    <div class="globe-bar"><button class="gbtn" data-act="gLang">${EX.lang === 'en' ? 'বাংলা নাম' : 'English names'}</button>
      <button class="gbtn" data-act="gFind">🎯 Find a country · <span class="bn">দেশ খুঁজি</span></button>
      <input class="exsearch" type="search" placeholder="Go to… · যাও…" data-change="gGo" list="gList" aria-label="Go to a country"><datalist id="gList">${COUNTRIES.map(c => `<option value="${esc(c.en)}">${esc(c.bn)}</option>`).join('')}</datalist></div>
    <div class="globe-info" id="gInfo"><p class="muted">Spin the globe and tap a country · <span class="bn">গ্লোব ঘোরাও, দেশে চাপ দাও</span></p></div></div>`;
}
const GlobeView = (() => {
  let loaded = null, feats = null, byId = {}, inst = null;
  const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  async function load() {
    if (!loaded) loaded = (async () => {
      await loadScript('./vendor/d3-array.min.js'); await loadScript('./vendor/d3-geo.min.js'); await loadScript('./vendor/topojson-client.min.js');
      const topo = await (await fetch('./data/world-110m.json')).json();
      const num2id = Object.fromEntries(Object.entries(ISO_NUM).map(([a, n]) => [n, a]));
      feats = topojson.feature(topo, topo.objects.countries).features.map(f => { f.cid = num2id[f.id] || null; f.c = f.cid ? COUNTRIES.find(c => c.id === f.cid) : null; f.cen = d3.geoCentroid(f); f.area = d3.geoArea(f); return f; });
      COUNTRIES.forEach(c => { byId[c.id] = { c, f: feats.find(f => f.cid === c.id) || null, ll: c.lat != null ? [c.lon, c.lat] : null }; });
      Object.values(byId).forEach(o => { if (!o.ll && o.f) o.ll = o.f.cen; });
    })();
    return loaded;
  }
  async function mount() {
    stop(); const stage = $('#globeStage'), cv = $('#globeCv'); if (!stage || !cv) return;
    try { await load(); } catch (e) { stage.querySelector('.globe-loading').textContent = 'The globe could not load.'; return; }
    if (!document.body.contains(cv)) return;
    stage.querySelector('.globe-loading')?.remove();
    const ctx = cv.getContext('2d'), still = Motion.still();
    let W, H, dpr, R0, zoom = 1, rot = [-90, -20, 0], vel = [0, 0], dragging = false, idleT = 0, sel = null, find = null, raf = 0, stopped = false, lastTap = 0;
    const proj = d3.geoOrthographic().clipAngle(90).precision(.4), path = d3.geoPath(proj, ctx), grat = d3.geoGraticule10(), sphere = { type: 'Sphere' };
    const ctCol = k => (CONTINENTS[k] || [, , '#9AA8A0'])[2];
    // each country its own shade of its continent's colour, so neighbours stand apart
    const shade = (hex, t) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t))); return `rgb(${c})`; };
    feats.forEach((f, i) => { const h = f.cid ? (f.cid.charCodeAt(0) * 7 + f.cid.charCodeAt(1) * 13) % 9 : 4; f.fill = f.c ? shade(ctCol(f.c.ct), (h - 4) * .07) : '#B9B3A2'; });
    const size = () => { const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); R0 = Math.min(W, H) * .43; };
    size();
    const visible = ll => d3.geoDistance(ll, [-rot[0], -rot[1]]) < Math.PI / 2 - .02;
    function draw() {
      proj.translate([W / 2, H / 2]).scale(R0 * zoom).rotate(rot);
      ctx.clearRect(0, 0, W, H); const r = R0 * zoom, cx = W / 2, cy = H / 2;
      // atmosphere
      const at = ctx.createRadialGradient(cx, cy, r * .95, cx, cy, r * 1.16); at.addColorStop(0, 'rgba(120,200,255,.45)'); at.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = at; ctx.beginPath(); ctx.arc(cx, cy, r * 1.16, 0, 6.29); ctx.fill();
      // ocean
      const oc = ctx.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); oc.addColorStop(0, '#5FB6E8'); oc.addColorStop(.6, '#2470B8'); oc.addColorStop(1, '#123E7A');
      ctx.fillStyle = oc; ctx.beginPath(); path(sphere); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = .7 * dpr; ctx.beginPath(); path(grat); ctx.stroke();
      // countries
      for (const f of feats) { const isSel = sel && f.cid === sel, isFind = find && find.show && f.cid === find.ans;
        ctx.beginPath(); path(f);
        ctx.fillStyle = isSel ? '#FFE27A' : isFind ? '#FF7A59' : f.fill;
        ctx.globalAlpha = isSel || isFind ? 1 : f.c ? .9 : .7; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = isSel ? '#FFF6D8' : 'rgba(255,255,255,.75)'; ctx.lineWidth = (isSel ? 1.6 : .55) * dpr; ctx.stroke(); }
      // small states as dots
      for (const o of Object.values(byId)) if (!o.f && o.ll && visible(o.ll)) { const p = proj(o.ll); const on = sel === o.c.id;
        ctx.fillStyle = on ? '#F6C64A' : ctCol(o.c.ct); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.arc(p[0], p[1], (on ? 5 : 3.2) * dpr, 0, 6.29); ctx.fill(); ctx.stroke(); }
      // shading: day side highlight and limb darkening
      const sh = ctx.createRadialGradient(cx - r * .45, cy - r * .5, r * .05, cx, cy, r * 1.02); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(.8, 'rgba(0,10,40,.12)'); sh.addColorStop(1, 'rgba(0,10,40,.5)');
      ctx.fillStyle = sh; ctx.beginPath(); path(sphere); ctx.fill();
      // labels: bigger countries first, no overlaps
      const boxes = [], fs = Math.round(11 * dpr), lang = EX.lang;
      ctx.font = `700 ${fs}px "Outfit","Hind Siliguri",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cands = Object.values(byId).filter(o => o.ll && visible(o.ll)).map(o => ({ o, a: o.f ? o.f.area : 0 })).sort((p, q) => (q.o.c.id === sel) - (p.o.c.id === sel) || q.a - p.a);
      for (const { o, a } of cands) { const minA = .0016 / (zoom * zoom); if (o.c.id !== sel && a < minA && !(zoom > 2.4)) continue;
        const p = proj(o.ll), txt = lang === 'en' ? o.c.en : o.c.bn, w = ctx.measureText(txt).width + 8 * dpr, h = fs + 6 * dpr, b = [p[0] - w / 2, p[1] - h / 2 + (o.f ? 0 : 10 * dpr), w, h];
        if (boxes.some(q => b[0] < q[0] + q[2] && b[0] + b[2] > q[0] && b[1] < q[1] + q[3] && b[1] + b[3] > q[1])) continue; boxes.push(b);
        ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(10,30,60,.65)'; ctx.strokeText(txt, b[0] + w / 2, b[1] + h / 2); ctx.fillStyle = o.c.id === sel ? '#FFE9A8' : '#fff'; ctx.fillText(txt, b[0] + w / 2, b[1] + h / 2);
        if (boxes.length > 70) break; }
    }
    function loop() { if (stopped) return; raf = requestAnimationFrame(loop);
      if (!dragging) { if (Math.abs(vel[0]) + Math.abs(vel[1]) > .01) { rot[0] += vel[0]; rot[1] = Math.max(-80, Math.min(80, rot[1] + vel[1])); vel = vel.map(v => v * .94); }
        else if (!still && performance.now() - idleT > 6000 && !anim) rot[0] += .08; }
      if (anim) { const k = Math.min(1, (performance.now() - anim.t0) / anim.d), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; rot = [anim.a[0] + (anim.b[0] - anim.a[0]) * e, anim.a[1] + (anim.b[1] - anim.a[1]) * e, 0]; zoom = anim.z0 + (anim.z1 - anim.z0) * e; if (k >= 1) anim = null; }
      draw(); }
    let anim = null;
    const flyTo = (id, z) => { const o = byId[id]; if (!o || !o.ll) return; let tx = -o.ll[0], ty = -o.ll[1]; while (tx - rot[0] > 180) tx -= 360; while (tx - rot[0] < -180) tx += 360;
      anim = { t0: performance.now(), d: 1100, a: [rot[0], rot[1]], b: [tx, Math.max(-75, Math.min(75, ty))], z0: zoom, z1: z || Math.max(zoom, o.f && o.f.area > .02 ? 1.3 : 2.6) }; idleT = performance.now(); };
    const info = id => { const c = COUNTRIES.find(x => x.id === id), el = $('#gInfo'); if (!el || !c) return;
      el.innerHTML = `<div class="ginfo">${exFlag(c, 'ginf')}<div><b>${esc(c.en)}</b><span class="bn">${esc(c.bn)}</span><small>🏛️ ${esc(c.cap)} · <span class="bn">${esc(c.capBn)}</span></small><small>💰 ${esc(c.cur)} · <span class="bn">${esc(c.curBn)}</span></small><small>🌐 ${CONTINENTS[c.ct][0]} · <span class="bn">${CONTINENTS[c.ct][1]}</span></small></div><button class="hear" data-act="gSay" data-id="${c.id}">🔊</button></div>`; };
    const pick = (x, y) => { const ll = proj.invert([x, y]); if (!ll || d3.geoDistance(ll, [-rot[0], -rot[1]]) > Math.PI / 2) return null;
      let best = null, bd = 1e9; for (const o of Object.values(byId)) if (!o.f && o.ll && visible(o.ll)) { const p = proj(o.ll), d = Math.hypot(p[0] - x, p[1] - y); if (d < 14 * dpr && d < bd) { bd = d; best = o.c.id; } }
      if (best) return best; const f = feats.find(f => f.c && d3.geoContains(f, ll)); return f ? f.cid : null; };
    const onTap = id => { if (!id) return; sel = id; info(id); Kid.tap('explore');
      const c = COUNTRIES.find(x => x.id === id);
      if (find) { if (id === find.ans) { find.done = true; $('#gInfo').insertAdjacentHTML('afterbegin', `<p class="gfind ok">🎉 Yes! You found ${esc(c.en)} · <span class="bn">${esc(c.bn)} পেয়েছ!</span></p>`); Kid.reward($('#gInfo')); exSay(c, 'flags'); find = null; }
        else { find.tries++; const a = COUNTRIES.find(x => x.id === find.ans); $('#gInfo').insertAdjacentHTML('afterbegin', `<p class="gfind">That is ${esc(c.en)}. Find ${esc(a.en)} · <span class="bn">এটা ${esc(c.bn)}। ${esc(a.bn)} খোঁজো</span></p>`);
          if (find.tries >= 2) { find.show = true; flyTo(find.ans); } } }
      else exSay(c, 'flags'); };
    // pointer: drag to spin, pinch to zoom, tap to pick
    const pts = new Map(); let start = null, pinch0 = null;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.offsetX * dpr, e.offsetY * dpr]); dragging = true; anim = null; vel = [0, 0]; idleT = performance.now();
      start = { x: e.offsetX * dpr, y: e.offsetY * dpr, t: performance.now(), moved: 0 }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: zoom }; } });
    cv.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId), cur = [e.offsetX * dpr, e.offsetY * dpr]; pts.set(e.pointerId, cur);
      if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; zoom = Math.max(.8, Math.min(8, pinch0.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0.d)); start && (start.moved = 99); return; }
      const k = 0.25 / zoom * (1 / dpr) * 1.6, dx = cur[0] - prev[0], dy = cur[1] - prev[1]; if (start) start.moved += Math.abs(dx) + Math.abs(dy);
      rot[0] += dx * k; rot[1] = Math.max(-80, Math.min(80, rot[1] - dy * k)); vel = [dx * k, -dy * k]; });
    const up = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; if (pts.size) return; dragging = false; idleT = performance.now();
      if (start && start.moved < 8 * dpr && performance.now() - start.t < 400) { vel = [0, 0]; onTap(pick(start.x, start.y)); } start = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(.8, Math.min(8, zoom * Math.exp(-e.deltaY * .0015))); idleT = performance.now(); }, { passive: false });
    const onResize = () => size(); addEventListener('resize', onResize);
    // start on Bangladesh
    rot = [-90.3, -23.7, 0]; flyTo('BD', 1); sel = null;
    loop();
    inst = { stop() { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', onResize); }, flyTo, onTap, info,
      find() { const pool = Object.values(byId).filter(o => o.f && o.f.area > .0012); const o = pool[Math.floor(Math.random() * pool.length)]; find = { ans: o.c.id, tries: 0, show: false }; sel = null;
        $('#gInfo').innerHTML = `<p class="gfind ask">🎯 Find <b>${esc(o.c.en)}</b> · <span class="bn"><b>${esc(o.c.bn)}</b> খুঁজে বের করো</span></p>`; Voice.say('GF:' + o.c.id, [[`Can you find ${o.c.en}?`, 'en-US', .88], [`${o.c.bn} কোথায়?`, 'bn-BD', .88]]); } };
  }
  function stop() { if (inst) { inst.stop(); inst = null; } }
  return { mount, stop, get: () => inst, load };
})();
ACT.gLang = el => { EX.lang = EX.lang === 'en' ? 'bn' : 'en'; el.textContent = EX.lang === 'en' ? 'বাংলা নাম' : 'English names'; Sfx.tap(); };
ACT.gFind = () => { Sfx.tap(); GlobeView.get()?.find(); };
ACT.gGo = el => { const v = el.value.trim().toLowerCase(); const c = COUNTRIES.find(x => x.en.toLowerCase() === v || x.bn === el.value.trim()) || COUNTRIES.find(x => x.en.toLowerCase().startsWith(v) || x.bn.startsWith(el.value.trim()));
  if (c && GlobeView.get()) { GlobeView.get().flyTo(c.id); GlobeView.get().onTap(c.id); } el.value = ''; el.blur(); };
ACT.gSay = el => { const c = COUNTRIES.find(x => x.id === el.dataset.id); Voice.say(`CT:globe:${c.id}`, [[`${c.en}. Capital: ${c.cap}. Money: ${c.cur}.`, 'en-US', .88], [`${c.bn}। রাজধানী ${c.capBn}। মুদ্রা ${c.curBn}।`, 'bn-BD', .88]]); };
