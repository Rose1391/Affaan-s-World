/* ============ DOEL'S ISLAND — the kid world · family faces & voices · shape sorter · music hut · easel · stickers ============ */
const SPOTS = [
  // id, emoji, English, বাংলা, left%, top%, colour
  ['family', '🏠', "Who's this?", 'কে এটা?', 27, 12, '#E4573D'], ['colors', '🌈', 'Colours', 'রং', 74, 9, '#9B6BE0'],
  ['letters', '🔤', 'Letters', 'অক্ষর', 70, 25, '#E8473C'], ['stories', '📖', 'Stories', 'গল্প', 25, 31, '#14998C'],
  ['numbers', '🐟', 'Count fish', 'গুনি', 53, 42, '#2F7FB8'], ['world', '🐄', 'Farm & world', 'খামার', 21, 52, '#3DAA66'],
  ['music', '🥁', 'Music', 'গান-বাজনা', 77, 49, '#D9862B'], ['art', '🎨', 'Paint', 'আঁকি', 28, 69, '#E46A8C'],
  ['sorter', '🧩', 'Shapes', 'আকার', 72, 66, '#7A4FD8'], ['peekaboo', '🙈', 'Peekaboo', 'কুক্কু', 50, 79, '#F57C00'],
  ['bubbles', '🫧', 'Bubbles', 'বুদবুদ', 22, 88, '#3BA7FF'], ['people', '🌟', 'Heroes', 'মহান ব্যক্তি', 77, 85, '#C99A00'],
  ['games', '🎮', 'Games', 'খেলা', 50, 96, '#D9467E']];
const PICK_WHY = { family: 'Familiar faces and voices are what toddlers love most', colors: 'He is learning his first colour (30-month milestone)', stories: 'Two-word phrases → stories grow his sentences',
  peekaboo: 'Hide-and-reveal builds memory and joy', letters: 'Letter sounds start to click from 2½', music: 'Rhythm and cause-and-effect', sorter: 'Matching shapes builds thinking and fine motor', numbers: 'Counting together, one by one', art: 'Free scribbling builds the grip for writing', bubbles: 'Pure cause and effect — and colour words' };

// age- and record-aware picks for today (max 3)
async function kidPicks() {
  const m = ageOn(Child.birth).months, ms = await milestoneState(), fam = await DB.list('family'), nW = (await DB.list('word')).length;
  const has = id => ms[id]?.achieved, out = [];
  if (fam.length) out.push('family');
  if (!has('30m-11')) out.push('colors');
  if (has('24m-04') || nW >= 25) out.push('stories'); else out.push('peekaboo');
  if (m >= 30) out.push('letters'); else if (!has('24m-07')) out.push('sorter'); else out.push('music');
  out.push('art', 'bubbles');
  return [...new Set(out)].slice(0, 3);
}

function islandScene() {
  let trees = '', fl = '';
  const R = (() => { let h = 7; return () => (h = (h * 9301 + 49297) % 233280) / 233280; })();
  for (let i = 0; i < 26; i++) { const x = 40 + R() * 320, y = 60 + R() * 640; trees += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><path d="M0 0 v10" stroke="#7A4A2A" stroke-width="3"/><circle cy="-4" r="${(8 + R() * 6).toFixed(0)}" fill="${R() > .5 ? '#4FA34A' : '#6DB650'}"/></g>`; }
  for (let i = 0; i < 40; i++) fl += `<circle cx="${(40 + R() * 320).toFixed(0)}" cy="${(60 + R() * 640).toFixed(0)}" r="2.4" fill="${['#F28DB2', '#FFD45E', '#fff'][i % 3]}"/>`;
  return `<svg class="isl-bg" viewBox="0 0 400 760" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="iSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3F5"/><stop offset="1" stop-color="#3BA7E0"/></linearGradient></defs>
    <rect width="400" height="760" fill="url(#iSea)"/>
    <g class="isl-waves" stroke="#fff" stroke-width="2" fill="none" opacity=".5"><path d="M10 40 q10 -6 20 0 t20 0"/><path d="M350 120 q10 -6 20 0 t20 0"/><path d="M20 400 q10 -6 20 0 t20 0"/><path d="M340 600 q10 -6 20 0 t20 0"/><path d="M30 720 q10 -6 20 0 t20 0"/></g>
    <path d="M60 30 C150 0 300 10 360 60 C400 140 370 260 380 380 C392 520 370 640 330 720 C250 760 120 758 60 720 C20 620 30 520 22 400 C14 260 20 110 60 30Z" fill="#F4DFA9"/>
    <path d="M74 44 C160 16 292 26 346 70 C382 146 356 262 366 380 C378 516 356 630 318 706 C244 742 128 740 72 706 C36 610 46 518 38 400 C30 264 36 120 74 44Z" fill="#8FD06A"/>
    <path d="M74 44 C160 16 292 26 346 70 C382 146 356 262 366 380 C378 516 356 630 318 706 C244 742 128 740 72 706 C36 610 46 518 38 400 C30 264 36 120 74 44Z" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 6" opacity=".7"/>
    <path d="M300 40 C260 140 240 220 210 300 C190 360 220 420 200 480 C180 560 200 640 180 750" stroke="#5FB3E0" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M300 40 C260 140 240 220 210 300 C190 360 220 420 200 480 C180 560 200 640 180 750" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="4 10" opacity=".6"/>
    <path d="M108 92 C160 140 280 150 280 190 C280 250 110 230 100 300 C92 380 210 330 212 400 C214 460 90 420 100 520 C110 600 280 520 288 600 C296 660 200 640 200 720" stroke="#F7E7BE" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="1 16"/>
    ${trees}${fl}
    <g class="isl-boat"><path d="M0 0 q22 10 48 0 l-6 7 q-18 5 -36 0z" fill="#8A4B2A"/><path d="M24 -18 v16" stroke="#5B3A22" stroke-width="2"/><path d="M24 -18 l14 8 l-14 5z" fill="#E4573D"/></g>
  </svg>`;
}
async function islandHTML() {
  const picks = await kidPicks();
  const me = heroPhoto ? `<img data-photo="${esc(heroPhoto)}" data-size="full" alt="">` : `<img src="./img/bg-affaan.jpg" alt="" style="object-position:40% 30%">`;
  return `<div class="kpad island-wrap">
    <div class="khead"><div class="kme">${me}</div><div class="khello"><b>Hi ${esc(Child.first())}!</b><span class="bn">কোথায় যাবো?</span></div><button class="kdoel-btn" data-act="kDoel" aria-label="Doel">${doelSVG()}</button></div>
    <div class="island">${islandScene()}
      ${SPOTS.map(([id, em, en, bn, x, y, c]) => `<button class="spot ${picks.includes(id) ? 'rec' : ''}" style="left:${x}%;top:${y}%;--c:${c}" data-act="kOpen" data-to="${id}"><span class="sp-ic">${em}</span><b>${en}</b><span class="bn">${bn}</span></button>`).join('')}
    </div></div>`;
}

/* ---------------- WHO'S THIS? — family faces with their own voices ---------------- */
const RELATIONS = [['Abbu', 'আব্বু'], ['Ammu', 'আম্মু'], ['Dada', 'দাদা'], ['Dadi', 'দাদি'], ['Nana', 'নানা'], ['Nani', 'নানি'], ['Chacha', 'চাচা'], ['Chachi', 'চাচি'], ['Phupi', 'ফুপি'], ['Mama', 'মামা'], ['Mami', 'মামি'], ['Khala', 'খালা'], ['Bhaiya', 'ভাইয়া'], ['Apu', 'আপু'], ['Friend', 'বন্ধু']];
let famMode = 'meet', famTarget = null;
async function familyHTML() {
  const fam = await DB.list('family');
  if (!fam.length) return `<div class="kpad"><div class="kcard famempty"><span style="font-size:60px">👨‍👩‍👦</span><b>Ask Abbu or Ammu</b><span class="bn">আব্বু-আম্মুকে বলো</span>
    <small>Grown-ups: add family photos in <b>Play → Family</b>, then record their voices.</small></div></div>`;
  const list = famMode === 'find' ? pickFind(fam) : fam;
  return `<div class="kpad"><div class="ktabs"><button class="ktab ${famMode === 'meet' ? 'on' : ''}" data-act="famMode" data-v="meet">👋 Say hello</button><button class="ktab ${famMode === 'find' ? 'on' : ''}" data-act="famMode" data-v="find">🔍 Find</button></div>
    ${famMode === 'find' ? `<div class="play-prompt center">Where is ${esc(famTarget.rel || famTarget.name)}? <span class="bn">${esc(famTarget.relBn || famTarget.nameBn || '')} কোথায়?</span></div>` : ''}
    <div class="faces ${list.length <= 2 ? 'two' : ''}">${list.map(f => `<button class="face" data-act="famTap" data-id="${f.id}">${f.photoId ? Media.img(f.photoId, 'full') : `<span class="noimg">${esc((f.name || '?')[0])}</span>`}<b>${esc(f.rel || f.name)}</b><span class="bn">${esc(f.relBn || f.nameBn || '')}</span></button>`).join('')}</div>
    <div class="play-fb center" id="gFb"></div><div class="kfoot">${doelSVG()}</div></div>`;
}
function pickFind(fam) {
  const pool = [...fam].sort(() => Math.random() - .5).slice(0, Math.min(3, fam.length));
  famTarget = pool[Math.floor(Math.random() * pool.length)]; return pool;
}
const famHello = f => Voice.say('F:' + f.id, [[`Hello ${Child.first()}! I am ${f.rel || f.name}!`, 'en-US', 0.9], [`আমি ${f.relBn || f.nameBn || f.name}!`, 'bn-BD', 0.9]]);
const famAsk = f => Voice.say('FQ:' + f.id, [[`Where is ${f.rel || f.name}?`, 'en-US', 0.9], [`${f.relBn || f.nameBn || f.name} কোথায়?`, 'bn-BD', 0.9]]);
ACT.famMode = el => { famMode = el.dataset.v; Sfx.tap(); route(); };
ACT.famTap = async el => {
  const f = await DB.data(el.dataset.id); f.id = el.dataset.id; popAnim(el); Kid.tap('family');
  if (famMode === 'meet') { Kid.reward(el); famHello(f); return; }
  if (f.id === famTarget.id) { const fb = gameWin(el, () => route()); fb.textContent = `Yes! ${f.rel || f.name}! 🎉`; fb.className = 'play-fb good'; famHello(f); }
  else { gameMiss(el, 'Look again · আবার দেখো'); setTimeout(() => famAsk(famTarget), 500); }
};

/* ---------------- SHAPE SORTER — drag each shape into its home ---------------- */
const SORT_SHAPES = [['Circle', 'বৃত্ত', '<circle cx="50" cy="50" r="40"/>', '#E4573D'], ['Square', 'বর্গ', '<rect x="12" y="12" width="76" height="76" rx="8"/>', '#2F7FB8'],
  ['Triangle', 'ত্রিভুজ', '<path d="M50 8 L94 88 H6Z"/>', '#3DAA66'], ['Star', 'তারা', '<path d="M50 6 L62 38 L96 38 L68 58 L79 92 L50 72 L21 92 L32 58 L4 38 L38 38Z"/>', '#F2B53A'],
  ['Heart', 'হৃদয়', '<path d="M50 88 C20 66 6 50 6 32 C6 18 16 8 29 8 C39 8 46 14 50 22 C54 14 61 8 71 8 C84 8 94 18 94 32 C94 50 80 66 50 88Z"/>', '#E46A8C']];
function sorterHTML() {
  const set = [...SORT_SHAPES].sort(() => Math.random() - .5).slice(0, 4), pieces = [...set].sort(() => Math.random() - .5);
  return `<div class="kpad"><div class="play-prompt center">Put each shape home! <span class="bn">আকারগুলো ঘরে রাখো!</span></div>
    <div class="sorter"><div class="holes">${set.map(s => `<div class="hole" data-shape="${s[0]}"><svg viewBox="0 0 100 100">${s[2]}</svg></div>`).join('')}</div>
      <div class="pieces">${pieces.map(s => `<div class="piece" data-shape="${s[0]}" style="--pc:${s[3]}"><svg viewBox="0 0 100 100">${s[2]}</svg></div>`).join('')}</div></div>
    <div class="play-fb center" id="gFb"></div></div>`;
}
function bindSorter() {
  const root = $('.sorter'); if (!root) return;
  $$('.piece', root).forEach(p => {
    let sx = 0, sy = 0, dragging = false, moved = false;
    p.addEventListener('pointerdown', e => { if (p.classList.contains('placed')) return; dragging = true; moved = false; sx = e.clientX; sy = e.clientY; p.setPointerCapture(e.pointerId); p.classList.add('drag'); Sfx.tap(); });
    p.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; p.style.transform = `translate(${dx}px,${dy}px) scale(1.12)`; });
    const drop = e => {
      if (!dragging) return; dragging = false; p.classList.remove('drag');
      const sh = SORT_SHAPES.find(x => x[0] === p.dataset.shape);
      if (!moved) { p.style.transform = ''; Voice.say('S:' + sh[0], [[sh[0] + '.', 'en-US', 0.85], [sh[1] + '।', 'bn-BD', 0.85]]); return; }
      const pr = p.getBoundingClientRect(), cx = pr.left + pr.width / 2, cy = pr.top + pr.height / 2;
      const hole = $$('.hole', root).find(h => { const r = h.getBoundingClientRect(); return cx > r.left - 20 && cx < r.right + 20 && cy > r.top - 20 && cy < r.bottom + 20; });
      if (hole && hole.dataset.shape === p.dataset.shape && !hole.classList.contains('full')) {
        const hr = hole.getBoundingClientRect(), r0 = p.getBoundingClientRect();
        const cur = (p.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/) || [0, 0, 0]).slice(1).map(Number);
        p.style.transform = `translate(${cur[0] + hr.left - r0.left + (hr.width - r0.width) / 2}px,${cur[1] + hr.top - r0.top + (hr.height - r0.height) / 2}px)`;
        p.classList.add('placed'); hole.classList.add('full'); Sfx.pop(); FX.burst(hole, 14); Kid.reward(hole); Kid.tap('sorter');
        Voice.say('S:' + sh[0], [[sh[0] + '!', 'en-US', 0.85], [sh[1] + '!', 'bn-BD', 0.85]]);
        if ($$('.piece:not(.placed)', root).length === 0) { const fb = gameWin(root, () => { route(); }); fb.textContent = 'All home! 🎉 সব ঘরে!'; fb.className = 'play-fb good center'; }
      } else { p.style.transition = 'transform .35s cubic-bezier(.3,1.6,.5,1)'; p.style.transform = ''; setTimeout(() => p.style.transition = '', 360); Sfx.boing(); }
    };
    p.addEventListener('pointerup', drop); p.addEventListener('pointercancel', drop);
  });
}

/* ---------------- MUSIC HUT — xylophone · tabla · ektara ---------------- */
let musicTab = 'xylo';
const XYLO = [[262, '#E4573D'], [294, '#FF8A3D'], [330, '#F2C14E'], [349, '#3DAA66'], [392, '#2BB5A8'], [440, '#2F7FB8'], [494, '#7A4FD8'], [523, '#E46A8C']];
function musicHTML() {
  const tabs = `<div class="ktabs"><button class="ktab ${musicTab === 'xylo' ? 'on' : ''}" data-act="musTab" data-v="xylo">🎹 Xylophone</button><button class="ktab ${musicTab === 'tabla' ? 'on' : ''}" data-act="musTab" data-v="tabla">🥁 Tabla · <span class="bn">তবলা</span></button><button class="ktab ${musicTab === 'ektara' ? 'on' : ''}" data-act="musTab" data-v="ektara">🪕 Ektara · <span class="bn">একতারা</span></button></div>`;
  if (musicTab === 'tabla') return `<div class="kpad">${tabs}<div class="tabla"><button class="drum bayan" data-drum="bayan"><span>Dhaa</span></button><button class="drum dayan" data-drum="dayan"><span>Ta</span></button></div><p class="center hint-k">Tap both drums — boom and ta! <span class="bn">ধা ধিন ধিন ধা!</span></p></div>`;
  if (musicTab === 'ektara') return `<div class="kpad">${tabs}<div class="ektara"><div class="ek-neck"></div><div class="ek-string" id="ekString"></div><div class="ek-gourd"></div></div><p class="center hint-k">Tap the string high or low · <span class="bn">তারে টোকা দাও</span></p></div>`;
  return `<div class="kpad">${tabs}<div class="xylo">${XYLO.map(([f, c], i) => `<button class="xbar" data-f="${f}" style="--c:${c};--h:${100 - i * 7}%"><i></i><i></i></button>`).join('')}</div><p class="center hint-k">Slide your finger across! · <span class="bn">আঙুল বুলিয়ে দেখো</span></p></div>`;
}
ACT.musTab = el => { musicTab = el.dataset.v; Sfx.tap(); route(); };
function bindMusic() {
  let down = false; const hit = b => { if (!b) return; Sfx.bar(+b.dataset.f); b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring'); Kid.tap('music'); };
  $$('.xbar').forEach(b => { b.addEventListener('pointerdown', e => { down = true; b.releasePointerCapture?.(e.pointerId); hit(b); }); b.addEventListener('pointerenter', () => down && hit(b)); });
  document.addEventListener('pointerup', () => down = false, { once: false });
  $$('.drum').forEach(d => d.addEventListener('pointerdown', () => { d.dataset.drum === 'bayan' ? Sfx.drum(95, 1.9, 0.7, 0.5) : Sfx.drum(420, 0.75, 0.25, 0.32); d.classList.remove('hit'); void d.offsetWidth; d.classList.add('hit'); Kid.tap('music'); }));
  const s = $('#ekString'); if (s) s.addEventListener('pointerdown', e => { const r = s.getBoundingClientRect(), k = 1 - (e.clientY - r.top) / r.height; Sfx.pluck(147 * Math.pow(2, k * 1.4)); s.classList.remove('twang'); void s.offsetWidth; s.classList.add('twang'); Kid.tap('music'); });
  let taps = 0; $$('.xbar,.drum,#ekString').forEach(e => e.addEventListener('pointerdown', () => { if (++taps % 12 === 0) Kid.reward(e); }));
}

/* ---------------- EASEL — finger paint, rainbow brush, stamps; “keep” saves to the gallery ---------------- */
let brush = { c: '#E4573D', mode: 'paint' };
const PAINT = ['#E4573D', '#FF8A3D', '#F2C14E', '#3DAA66', '#2F7FB8', '#7A4FD8', '#E46A8C', '#5B3A22'];
function artHTML() {
  return `<div class="kpad"><div class="easel"><canvas id="easel" width="900" height="1100"></canvas></div>
    <div class="paints">${PAINT.map(c => `<button class="pt ${brush.mode === 'paint' && brush.c === c ? 'on' : ''}" style="--c:${c}" data-act="artColor" data-c="${c}" aria-label="colour"></button>`).join('')}
      <button class="pt rainbow ${brush.mode === 'rainbow' ? 'on' : ''}" data-act="artColor" data-c="rainbow" aria-label="rainbow"></button>
      ${['⭐', '🌸', '🐟', '❤️'].map(s => `<button class="pt stamp ${brush.mode === 'stamp' && brush.c === s ? 'on' : ''}" data-act="artStamp" data-s="${s}">${s}</button>`).join('')}
      <button class="pt tool" data-act="artClear" aria-label="clear">🧽</button><button class="pt tool keep" data-act="artKeep" aria-label="keep">📷</button></div></div>`;
}
ACT.artColor = el => { brush = el.dataset.c === 'rainbow' ? { c: 'rainbow', mode: 'rainbow' } : { c: el.dataset.c, mode: 'paint' }; Sfx.tap(); $$('.pt').forEach(b => b.classList.toggle('on', b === el)); };
ACT.artStamp = el => { brush = { c: el.dataset.s, mode: 'stamp' }; Sfx.tap(); $$('.pt').forEach(b => b.classList.toggle('on', b === el)); };
ACT.artClear = () => { const c = $('#easel'); paper(c.getContext('2d'), c); Sfx.whoosh(); };
ACT.artKeep = async el => {
  const c = $('#easel'); const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
  const p = await Media.save(new File([b], 'painting.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
  await DB.put('media', { photoId: p.id, date: todayISO(), caption: `${Child.first()}'s painting`, tags: ['art'], type: 'photo' });
  Sfx.win(); FX.burst(el, 30); Kid.reward(el, 3); toast('Saved to the gallery 🎨');
};
function paper(g, c) { g.fillStyle = '#FFFDF6'; g.fillRect(0, 0, c.width, c.height); }
function bindEasel() {
  const c = $('#easel'); if (!c) return; const g = c.getContext('2d'); paper(g, c);
  g.lineCap = 'round'; g.lineJoin = 'round'; let last = null, hue = 0, strokes = 0;
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.addEventListener('pointerdown', e => {
    c.setPointerCapture(e.pointerId); const p = pos(e);
    if (brush.mode === 'stamp') { g.font = '110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(brush.c, p[0], p[1]); Sfx.pop(); last = null; return; }
    last = p; g.beginPath(); g.arc(p[0], p[1], 15, 0, 7); g.fillStyle = brush.mode === 'rainbow' ? `hsl(${hue},85%,55%)` : brush.c; g.fill();
    if (++strokes % 8 === 0) Kid.reward(c);
  });
  c.addEventListener('pointermove', e => {
    if (!last) return; const p = pos(e); hue = (hue + 6) % 360;
    g.strokeStyle = brush.mode === 'rainbow' ? `hsl(${hue},85%,55%)` : brush.c; g.lineWidth = 30;
    g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(p[0], p[1]); g.stroke(); last = p;
  });
  const up = () => { if (last) Kid.tap('art'); last = null; }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
}

/* ---------------- STICKERS for the garden (one per session, chosen on the outside screen) ---------------- */
const STICKERS = ['🦋', '🌻', '🐞', '🐝', '🌈', '🍄', '🐸', '🐠', '🌷', '🐣', '🍎', '🐢', '🦆', '🌼'];
const stickerChoices = () => [...STICKERS].sort(() => Math.random() - .5).slice(0, 3);
ACT.pickSticker = async el => {
  const s = Kid.get(); if (!s || s.sticker) return;
  s.sticker = el.dataset.s; localStorage.setItem('affaan_kidSession', JSON.stringify(s));
  await DB.put('sticker', { emoji: el.dataset.s, x: +(0.06 + Math.random() * 0.88).toFixed(3), y: +Math.random().toFixed(3), date: todayISO() });
  Sfx.win(); FX.burst(el, 40); doelHappy();
  $$('.stk').forEach(b => b.classList.toggle('chosen', b === el)); $('.stk-q').textContent = 'It’s in your garden now! · বাগানে চলে গেছে!';
  Speech.seq([['It is in your garden now!', 'en-US', 0.9]]);
};

/* ---------------- gentle wind-down: the last minute dims, Doel gets sleepy, a soft lullaby ---------------- */
const WindDown = {
  update(ms) {
    const s = Kid.get(); if (!s || s.ended) { document.body.classList.remove('winddown'); return; }
    if (ms <= 60000) {
      document.body.classList.add('winddown'); document.body.style.setProperty('--wd', (1 - ms / 60000).toFixed(3));
      if (!s.wd) { s.wd = true; localStorage.setItem('affaan_kidSession', JSON.stringify(s)); Sfx.lullaby(); setTimeout(() => Voice.say('G:sleepy', [['Almost time to go outside. Let us finish up!', 'en-US', 0.82], ['এবার বাইরে খেলার সময় হয়ে এলো', 'bn-BD', 0.82]]), 2600); }
    } else document.body.classList.remove('winddown');
  },
  clear() { document.body.classList.remove('winddown'); document.body.style.removeProperty('--wd'); }
};

/* ================= PARENT SIDE: family setup + Voice Studio ================= */
async function familySetupHTML() {
  const fam = await DB.list('family');
  return `<p class="muted sm">Add the people Affaan loves. He'll see their photos in <b>Who's this?</b> and hear their voices — record them in <b>Voices</b>.</p>
    <div class="famgrid">${fam.map(f => `<button class="fam" data-act="famEdit" data-id="${f.id}">${f.photoId ? Media.img(f.photoId) : `<span class="noimg">${esc((f.name || '?')[0])}</span>`}<b>${esc(f.rel || f.name)}</b><span class="sm muted">${esc(f.name || '')}</span>
      <span class="vstat">${Voice.has('F:' + f.id) ? '🎙️ voice' : '<span class="warn">no voice yet</span>'}</span></button>`).join('')}
      <button class="fam add" data-act="famEdit">${icon('plus')}<b>Add person</b><span class="bn sm">যোগ করুন</span></button></div>`;
}
ACT.famEdit = async el => {
  const id = el.dataset?.id, r = id ? await DB.data(id) : {};
  Sheet.open({ title: (id ? 'Edit' : 'Add') + ' family member · <span class="bn">পরিবার</span>',
    body: `${F.row(F.select('rel', 'Who', 'সম্পর্ক', RELATIONS.map(([e, b]) => [e, `${e} · ${b}`]), r.rel || 'Nani'), F.text('name', 'Their name', 'নাম', r.name || '', 'placeholder="optional"'))}
      ${F.photos(r.photoId ? [r.photoId] : [], 'A clear face photo', 'মুখের ছবি')}
      <p class="muted sm">Then record “Hello ${esc(Child.first())}, I’m …” in the Voices tab — he’ll hear it when he taps this face.</p>`,
    save: async (fd, f) => { const ids = await formPhotos(f); const rel = val(fd, 'rel'); const relBn = (RELATIONS.find(x => x[0] === rel) || [])[1] || '';
      await DB.put('family', { rel, relBn, name: val(fd, 'name'), photoId: ids[ids.length - 1] || '' }, id); },
    del: id ? () => DB.del(id) : null });
};

// Voice Studio: every line Affaan hears, grouped; record ▸ listen ▸ delete
async function voiceGroups() {
  const fam = await DB.list('family'), words = await DB.list('word'), first = Child.first();
  const G = [];
  G.push(['Greetings & praise', 'শুভেচ্ছা', [['G:hello', `Hello ${first}! Let's play!`], ['G:yes', 'Yes! Well done!'], ['G:outside', 'Time to play outside!'], ['G:sleepy', 'Almost time to go outside…']]]);
  if (fam.length) G.push(['Family', 'পরিবার', fam.flatMap(f => [['F:' + f.id, `${f.rel}: “Hello ${first}, I’m ${f.rel}!”`], ['FQ:' + f.id, `“Where is ${f.rel}?”`]])]);
  G.push(['Letters · ABC', 'ইংরেজি অক্ষর', LETTERS_EN.map(l => ['L:en:' + l[0], `${l[0]} — “${l[0]} for ${l[1]}”`])]);
  G.push(['স্বরবর্ণ', 'Bangla vowels', BN_VOWELS.map(l => ['L:bv:' + l[0], `${l[0]} — “${l[0]} তে ${l[1]}”`])]);
  G.push(['ব্যঞ্জনবর্ণ', 'Bangla consonants', BN_CONS.map(l => ['L:bc:' + l[0], `${l[0]} — “${l[0]} তে ${l[1]}”`])]);
  G.push(['Numbers', 'সংখ্যা', [...NUMBERS.map((n, i) => ['N:en:' + (i + 1), `${n.wEn} — count to ${i + 1}`]), ...NUMBERS.map((n, i) => ['N:bn:' + (i + 1), `${n.wBn} — ${n.bn} পর্যন্ত গোনো`])]]);
  G.push(['Colours & shapes', 'রং ও আকার', [...COLORS_L.map(c => ['C:' + c.en, `${c.en} · ${c.bn}`]), ...SHAPES_L.map(s => ['S:' + s.en, `${s.en} · ${s.bn}`]), ...SORT_SHAPES.filter(s => !SHAPES_L.find(x => x.en === s[0])).map(s => ['S:' + s[0], `${s[0]} · ${s[1]}`])]]);
  const animals = new Map(); Object.values(WORLD).forEach(w => w.items.forEach(it => animals.set(it[0], it[1]))); PK_ANIMALS.forEach(a => animals.set(a[0], a[1]));
  G.push(['Animals & nature', 'প্রাণী ও প্রকৃতি', [...animals].map(([en, bn]) => ['W:' + en, `${en} · ${bn}`])]);
  STORIES.forEach(st => G.push([`Story: ${st.tEn}`, st.tBn, st.pages.flatMap((p, i) => [[`ST:${st.id}:${i}:en`, `Page ${i + 1} (English): ${p.en}`], [`ST:${st.id}:${i}:bn`, `পৃষ্ঠা ${bnNum(i + 1)}: ${p.bn}`]])]));
  PERSONALITIES.forEach((f, n) => G.push([`Great Personalities ${n + 1}: ${f.en}`, f.bn, f.people.map(p => ['P:' + p.n, `${p.n} — “${p.dEn}”`])]));
  if (words.length) G.push(['His words', 'তার শব্দ', words.map(w => ['WD:' + w.word, `“${w.word}”`])]);
  return G;
}
let openGroup = 0;
async function voicesHTML() {
  const G = await voiceGroups(), total = G.reduce((t, g) => t + g[2].length, 0), done = G.reduce((t, g) => t + g[2].filter(([k]) => Voice.has(k)).length, 0);
  return `<div class="callout blue"><b>🎙️ Your voice, not a robot's</b>Record each line once — Affaan hears <i>you</i> whenever he taps it. Both parents' recordings sync. A quiet room helps.</div>
    <div class="vprog"><div class="meter"><i style="width:${(done / total * 100).toFixed(1)}%"></i></div><span class="sm muted">${done} of ${total} lines recorded</span></div>
    ${G.map(([en, bn, items], gi) => { const d = items.filter(([k]) => Voice.has(k)).length;
      return `<details class="acc vgroup" ${gi === openGroup ? 'open' : ''} data-g="${gi}"><summary><span>${esc(en)} <span class="bn muted sm">${esc(bn)}</span></span><span class="pill ${d === items.length ? 'blue' : ''}">${d}/${items.length}</span></summary>
        <div class="vlist">${items.map(([k, label]) => `<div class="vrow2 ${Voice.has(k) ? 'has' : ''}" data-key="${esc(k)}"><span class="grow">${esc(label)}</span>
          <button class="vbtn rec" data-act="vRec" data-key="${esc(k)}" data-label="${esc(label)}" aria-label="Record">●</button>
          ${Voice.has(k) ? `<button class="vbtn" data-act="vPlay" data-key="${esc(k)}" aria-label="Play">▶</button><button class="vbtn del" data-act="vDel" data-key="${esc(k)}" aria-label="Delete">✕</button>` : ''}</div>`).join('')}</div></details>`; }).join('')}`;
}
ACT.vRec = async el => {
  const k = el.dataset.key;
  if (Voice.recording()) { const blob = await Voice.finish(); return; }
  try {
    el.classList.add('live'); el.textContent = '■ 0s';
    const max = k.startsWith('ST:') ? 45 : 8;
    const blob = await Voice.start(max, s => el.textContent = `■ ${Math.floor(s)}s`);
    el.classList.remove('live'); el.textContent = '●';
    if (!blob || blob.size < 800) { toast('Too short — hold on a little longer', 'err'); return; }
    openGroup = +el.closest('details').dataset.g;
    await Voice.save(k, el.dataset.label, blob); await Voice.play(k); toast('Saved 🎙️'); route();
  } catch (e) { el.classList.remove('live'); el.textContent = '●'; toast(e.name === 'NotAllowedError' ? 'Allow the microphone to record' : e.message, 'err'); }
};
ACT.vPlay = el => Voice.play(el.dataset.key);
ACT.vDel = async el => { if (!confirm('Delete this recording?')) return; openGroup = +el.closest('details').dataset.g; await Voice.remove(el.dataset.key); route(); };
