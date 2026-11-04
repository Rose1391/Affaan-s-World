/* ============ DOEL'S ISLAND — the kid world · family faces & voices · shape sorter · music hut · easel · stickers ============ */
// the island is a fixed 400 × 1070 stage that scales as one piece (container units), so nothing can overlap on any screen.
// Spots follow one winding trail top → bottom in a left / right / centre rhythm.
const SPOT_LIST = [
  // id, emoji, English, বাংলা, colour
  ['family', '🏠', "Who's this?", 'কে এটা?', '#E4573D'], ['colors', '🌈', 'Colours', 'রং', '#9B6BE0'], ['letters', '🔤', 'Letters', 'অক্ষর', '#E8473C'],
  ['stories', '📖', 'Stories', 'গল্প', '#14998C'], ['numbers', '🐟', 'Count fish', 'গুনি', '#2F7FB8'], ['world', '🐄', 'Farm & world', 'খামার', '#3DAA66'],
  ['music', '🥁', 'Music', 'গান-বাজনা', '#D9862B'], ['art', '🎨', 'Paint', 'আঁকি', '#E46A8C'], ['sorter', '🧩', 'Shapes', 'আকার', '#7A4FD8'],
  ['peekaboo', '🙈', 'Peekaboo', 'কুক্কু', '#F57C00'], ['bubbles', '🫧', 'Bubbles', 'বুদবুদ', '#3BA7FF'], ['people', '🌟', 'Heroes', 'মহান ব্যক্তিত্ব', '#C99A00'], ['explore', '🌍', 'World', 'বিশ্ব', '#1F7AC9'], ['bangladesh', '🇧🇩', 'Bangladesh', 'বাংলাদেশ', '#006A4E'],
  ['games', '🎮', 'Games', 'খেলা', '#D9467E']];
const ISL_W = 400, ISL_H = 1110;
const SPOTS = SPOT_LIST.map((s, i) => [...s.slice(0, 4), [92, 308, 200][i % 3], 102 + i * 64, s[4]]);
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
  const R = (() => { let h = 11; return () => (h = (h * 9301 + 49297) % 233280) / 233280; })();
  const f1 = n => n.toFixed(1), pts = SPOTS.map(s => [s[4], s[5]]);
  // smooth trail through every spot (Catmull-Rom → cubic Bézier)
  const trailPts = [[200, 34], ...pts, [200, 1036]];
  let trail = `M${trailPts[0].join(' ')}`;
  for (let i = 0; i < trailPts.length - 1; i++) { const p0 = trailPts[i - 1] || trailPts[i], p1 = trailPts[i], p2 = trailPts[i + 1], p3 = trailPts[i + 2] || p2;
    trail += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`; }
  const isle = 'M70 40 C150 6 270 10 348 52 C392 130 372 300 384 470 C396 640 374 820 352 960 C330 1040 250 1062 190 1060 C120 1058 56 1040 40 960 C22 820 30 650 20 480 C12 300 20 110 70 40Z';
  const free = (x, y, r) => pts.every(([px, py]) => Math.hypot(px - x, (py - y) * 1.1) > r) && Math.hypot(200 - x, 70 - y) > 60;
  // trees, bushes and flowers placed only where they don't crowd a spot
  let trees = '', fl = '', tufts = '';
  for (let k = 0, n = 0; k < 400 && n < 34; k++) { const x = 52 + R() * 296, y = 70 + R() * 940; if (!free(x, y, 70)) continue; n++;
    const r = 9 + R() * 9, c = R() > .5 ? 'iTreeA' : 'iTreeB';
    trees += `<g transform="translate(${f1(x)} ${f1(y)})"><ellipse cx="${f1(r * .3)}" cy="${f1(r * .9)}" rx="${f1(r * 1.05)}" ry="${f1(r * .38)}" fill="#1E5A2A" opacity=".22"/><path d="M-1.6 ${f1(r * .2)} h3.2 v${f1(r * .75)} h-3.2z" fill="#7A4A2A"/><circle r="${f1(r)}" fill="url(#${c})"/><circle cx="${f1(-r * .45)}" cy="${f1(r * .2)}" r="${f1(r * .7)}" fill="url(#${c})"/><circle cx="${f1(r * .5)}" cy="${f1(r * .25)}" r="${f1(r * .65)}" fill="url(#${c})"/></g>`; }
  for (let k = 0, n = 0; k < 600 && n < 70; k++) { const x = 46 + R() * 308, y = 60 + R() * 960; if (!free(x, y, 48)) continue; n++;
    fl += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.8 + R() * 1.6)}" fill="${['#FF8FB8', '#FFD54F', '#FFFFFF', '#B89CFF'][n % 4]}"/>`;
    tufts += `<path d="M${f1(x + 8)} ${f1(y + 6)} l2 -6 l2 6 l2 -5 l1.5 5" stroke="#4E9A3E" stroke-width="1.2" fill="none" opacity=".55"/>`; }
  let palms = ''; [[46, 260], [356, 380], [40, 640], [360, 820], [330, 140], [64, 900]].forEach(([x, y], i) => {
    palms += `<g transform="translate(${x} ${y})"><ellipse cx="6" cy="16" rx="14" ry="4" fill="#000" opacity=".12"/><path d="M0 16 Q2 4 -2 -10" stroke="#9A6A3A" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g class="isl-palm" style="animation-delay:${-i * .7}s"><path d="M-2 -10 q-14 -4 -20 6 M-2 -10 q14 -6 20 4 M-2 -10 q-8 -12 -18 -10 M-2 -10 q8 -12 18 -8 M-2 -10 q0 -10 2 -16" stroke="#3E8E3A" stroke-width="4" fill="none" stroke-linecap="round"/></g></g>`; });
  const anim = !(window.Motion && Motion.still && Motion.still());
  const bird = (d, dur, delay, s) => `<g><g transform="scale(${s})"><path class="isl-flap" d="M-8 0 q4 -5 8 0 q4 -5 8 0" stroke="#2B2620" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>${anim ? `<animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${d}"/>` : ''}</g>`;
  const fly = (cx, cy, c, dur) => `<g>${anim ? `<animateMotion dur="${dur}s" repeatCount="indefinite" path="M${cx} ${cy} c14 -18 30 -4 22 10 c-8 14 -34 8 -40 -4 c-6 -12 6 -22 18 -6z"/>` : ''}<g class="isl-fly"><ellipse cx="-3" cy="0" rx="3.4" ry="2.4" fill="${c}"/><ellipse cx="3" cy="0" rx="3.4" ry="2.4" fill="${c}"/></g></g>`;
  return `<svg class="isl-bg" viewBox="0 0 ${ISL_W} ${ISL_H}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="iSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FD2F2"/><stop offset=".5" stop-color="#3BB0E4"/><stop offset="1" stop-color="#2690D2"/></linearGradient>
      <radialGradient id="iLand" cx=".45" cy=".35" r=".8"><stop offset="0" stop-color="#A6DE74"/><stop offset=".6" stop-color="#86CB5E"/><stop offset="1" stop-color="#5FAE48"/></radialGradient>
      <linearGradient id="iSand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE7B5"/><stop offset="1" stop-color="#EBCB86"/></linearGradient>
      <radialGradient id="iTreeA" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#8FD86A"/><stop offset=".55" stop-color="#4FA340"/><stop offset="1" stop-color="#2F7A32"/></radialGradient>
      <radialGradient id="iTreeB" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#B5E37A"/><stop offset=".55" stop-color="#6DB650"/><stop offset="1" stop-color="#3E8E3A"/></radialGradient>
      <linearGradient id="iRiver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FE0F7"/><stop offset="1" stop-color="#3FA7DC"/></linearGradient>
      <filter id="iBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="iSoft"><feGaussianBlur stdDeviation="2.2"/></filter>
    </defs>
    <rect width="${ISL_W}" height="${ISL_H}" fill="url(#iSea)"/>
    <g class="isl-glints" fill="#fff">${Array.from({ length: 22 }, (_, i) => `<rect x="${f1(8 + R() * 384)}" y="${f1(8 + R() * 1050)}" width="${f1(6 + R() * 10)}" height="1.6" rx=".8" style="animation-delay:${f1(-R() * 4)}s"/>`).join('')}</g>
    <path d="${isle}" fill="#B8F0FA" filter="url(#iBlur)" transform="translate(200 535) scale(1.07) translate(-200 -535)" opacity=".9"/>
    <path d="${isle}" fill="none" stroke="#fff" stroke-width="3" opacity=".75" class="isl-foam" transform="translate(200 535) scale(1.035) translate(-200 -535)"/>
    <path d="${isle}" fill="url(#iSand)"/>
    <path d="${isle}" fill="url(#iLand)" transform="translate(200 535) scale(.93 .955) translate(-200 -535)"/>
    <g opacity=".35"><ellipse cx="120" cy="420" rx="70" ry="40" fill="#C2EA8C"/><ellipse cx="290" cy="700" rx="64" ry="44" fill="#C2EA8C"/><ellipse cx="150" cy="880" rx="60" ry="34" fill="#9FD670"/></g>
    ${tufts}
    <path d="M318 96 C300 180 360 260 330 340 C300 420 352 500 330 600 C310 690 360 760 336 860 C318 930 330 990 360 1040" stroke="url(#iRiver)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M318 96 C300 180 360 260 330 340 C300 420 352 500 330 600 C310 690 360 760 336 860 C318 930 330 990 360 1040" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="6 14" opacity=".7" class="isl-flow"/>
    <ellipse cx="318" cy="94" rx="22" ry="12" fill="url(#iRiver)"/>
    <path d="${trail}" stroke="#C9A866" stroke-width="15" fill="none" stroke-linecap="round" opacity=".45" filter="url(#iSoft)"/>
    <path d="${trail}" stroke="#F6E6BE" stroke-width="11" fill="none" stroke-linecap="round" class="isl-trail" pathLength="1"/>
    <path d="${trail}" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="2 9" stroke-linecap="round" opacity=".8"/>
    ${fl}${trees}${palms}
    <g transform="translate(200 70)"><ellipse cx="8" cy="34" rx="44" ry="9" fill="#1E5A2A" opacity=".25"/><path d="M-6 34 C-4 18 -5 6 -2 -6 L4 -6 C6 8 6 20 9 34Z" fill="#7A4A2A"/>
      <circle cx="0" cy="-22" r="30" fill="url(#iTreeA)"/><circle cx="-24" cy="-10" r="20" fill="url(#iTreeA)"/><circle cx="25" cy="-12" r="21" fill="url(#iTreeB)"/><circle cx="0" cy="-38" r="18" fill="url(#iTreeB)"/>
      <g class="isl-fruit">${[[-14, -24], [12, -30], [20, -6], [-26, -4], [2, -10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#FF8A3D"/>`).join('')}</g></g>
    <g class="isl-boat">${anim ? '<animateMotion dur="30s" repeatCount="indefinite" path="M-50 1092 C80 1084 140 1100 220 1090 S360 1086 450 1094"/>' : ''}<g class="isl-bob"><path d="M-22 0 q22 10 44 0 l-5 7 q-17 5 -34 0z" fill="#8A4B2A"/><path d="M0 -20 v18" stroke="#5B3A22" stroke-width="2"/><path d="M0 -20 l14 9 l-14 5z" fill="#E4573D"/></g></g>
    ${bird('M-30 220 C120 170 260 260 440 190', 19, 0, 1)}${bird('M-30 250 C120 200 280 290 440 220', 19, 1.2, .8)}${bird('M430 640 C300 600 120 690 -40 620', 23, 4, .9)}
    ${fly(150, 500, '#FFB13B', 9)}${fly(260, 820, '#FF7EB6', 11)}${fly(120, 160, '#7FC8FF', 10)}
  </svg>`;
}
async function islandHTML() {
  const picks = await kidPicks();
  const me = heroPhoto ? `<img data-photo="${esc(heroPhoto)}" data-size="full" alt="">` : `<img src="./img/bg-affaan.jpg" alt="" style="object-position:40% 30%">`;
  return `<div class="kpad island-wrap">
    <div class="khead"><div class="kme">${me}</div><div class="khello"><b>Hi ${esc(Child.first())}!</b><span class="bn">কোথায় যাবো?</span></div><button class="kdoel-btn" data-act="kDoel" aria-label="Doel">${doelSVG()}</button></div>
    <div class="island">${islandScene()}
      ${SPOTS.map(([id, em, en, bn, x, y, c], i) => `<button class="spot ${picks.includes(id) ? 'rec' : ''}" style="left:${(x / ISL_W * 100).toFixed(2)}%;top:${(y / ISL_H * 100).toFixed(2)}%;--c:${c};--i:${i}" data-act="kOpen" data-to="${id}"><span class="sp-ic">${em}</span><b>${en}</b><span class="bn">${bn}</span></button>`).join('')}
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
  G.push(['Our anthem', 'জাতীয় সংগীত', [['BD:anthem', 'Sing “Amar Shonar Bangla” together (plays in Our Bangladesh → Anthem)']]]);
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
