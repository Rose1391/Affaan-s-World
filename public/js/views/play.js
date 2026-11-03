/* ============ PLAY TOGETHER ============
 Parent landing (#/play) → pick 10/12/15 min → kid mode (#/kid…) with big targets.
 When time is up: “Time to play outside!” A grown-up holds the button to leave. */
const Kid = (() => {
  const KEY = 'affaan_kidSession';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const set = s => localStorage.setItem(KEY, JSON.stringify(s));
  let timer = null;
  async function activeSession() { return get(); }
  function start(min) { set({ id: uid(), start: Date.now(), dur: min * 60000, taps: {}, stars: 0, ended: false }); Speech.unlock(); Sfx.unlock(); go('kid'); }
  function tap(area) { const s = get(); if (!s) return; s.taps[area] = (s.taps[area] || 0) + 1; set(s); }
  function left() { const s = get(); return s ? Math.max(0, s.start + s.dur - Date.now()) : 0; }
  async function finish() {
    const s = get(); if (!s) return;
    const minutes = Math.max(1, Math.round((Math.min(Date.now(), s.start + s.dur) - s.start) / 60000));
    await DB.put('playsession', { date: isoDate(new Date(s.start)), startedAt: new Date(s.start).toISOString(), minutes, planned: Math.round(s.dur / 60000), taps: s.taps, stars: s.stars || 0 }, s.id);
    localStorage.removeItem(KEY); clearInterval(timer); timer = null; Speech.stop();
    go('play');
  }
  function tick() {
    const s = get(); const el = $('#kidTimer');
    if (!s) { clearInterval(timer); timer = null; return; }
    const ms = left(), m = Math.floor(ms / 60000), sec = Math.floor(ms / 1000) % 60;
    if (el) { el.querySelector('b').textContent = `${m}:${pad2(sec)}`; el.style.setProperty('--p', (1 - ms / s.dur) * 100 + '%'); }
    if (ms <= 0 && !s.ended) { s.ended = true; set(s); go('kid/outside'); }
  }
  function ensureTimer() { if (!timer) timer = setInterval(tick, 1000); tick(); }
  // ⭐ reward: a star flies from the tapped thing to the counter
  function reward(el, n = 1) {
    const s = get(); if (!s || s.ended) return; s.stars = (s.stars || 0) + n; set(s);
    Sfx.sparkle(); if (el) FX.stars(el, n);
    setTimeout(() => { const c = $('#kStars'); if (c) { c.querySelector('b').textContent = s.stars; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }, 850);
  }
  return { activeSession, start, tap, finish, ensureTimer, get, left, reward };
})();

/* ---------- parent landing ---------- */
let playTab = 'start';
ACT.playTab = el => { playTab = el.dataset.v; route(); };
ACT.startKid = el => Kid.start(Number(el.dataset.min));
Views.play = async () => {
  const sessions = (await DB.list('playsession')).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const wk = isoDate(addDays(new Date(), -6));
  const weekMin = sessions.filter(s => s.date >= wk).reduce((a, s) => a + s.minutes, 0);
  let body = '';
  if (playTab === 'start') {
    body = `
    <div class="kidstart">
      <div>
        <h2>Short, shared screen time <span class="bn">একসাথে অল্প সময়</span></h2>
        <p class="muted">Sit together. The app hides everything else, counts down, then sends him outside to play. No ads, no links out.</p>
        <div class="timepick">${[10, 12, 15].map(m => `<button class="tbtn" data-act="startKid" data-min="${m}"><b>${m}</b><span>min · <span class="bn">${bnNum(m)} মিনিট</span></span></button>`).join('')}</div>
        <p class="muted sm">This week: <b>${weekMin} min</b> in ${sessions.filter(s => s.date >= wk).length} sessions · Healthy guidance at 2–5 yrs: ≤1 hour/day of screens, co-viewed.</p>
      </div>
    </div>
    ${shead('🎈', 'Inside the session', 'যা থাকছে')}
    <div class="chips">${['🔤 Letters · অক্ষর', '🔢 Numbers · সংখ্যা', '🎨 Colours & Shapes · রং ও আকার', '📖 6 Stories · গল্প', '🌍 Our World · পৃথিবী', '🌟 Great People · মহান ব্যক্তি', '🫧 Bubble Pop · বুদবুদ', '🙈 Peekaboo · কুক্কু', '🎮 3 more games · খেলা'].map(x => `<span class="chip">${x}</span>`).join('')}</div>`;
  } else if (playTab === 'spark') body = await renderSpark();
  else if (playTab === 'books') body = await renderBooks();
  else body = renderTips();
  return `${pageHead('Play together', 'একসাথে খেলি', 'Bilingual learning · short sessions · then outside')}
  <div class="pad">${tabs([['start', 'Start', 'শুরু'], ['spark', 'Daily Spark', 'আজকের খেলা'], ['books', 'Books', 'বই'], ['tips', 'Tips', 'পরামর্শ']], playTab, 'playTab')}${body}</div>`;
};

/* ---- Daily Spark / Books / Tips (from v4 Parent Corner) ---- */
let sparkOffset = 0;
async function renderSpark() {
  const age = ageOn(Child.birth).months;
  const pool = ACTIVITIES.filter(a => a.ageMin <= age + 3).sort((a, b) => a.id.localeCompare(b.id));
  const seed = parseInt(todayISO().replace(/-/g, ''), 10);
  const a = pool[(seed + sparkOffset) % pool.length];
  const done = await KV.get('sparkDone', {}); const t = todayISO();
  const isDone = (done[t] || []).includes(a.id);
  let streak = 0; for (let c = new Date(); ; c = addDays(c, -1)) { if ((done[isoDate(c)] || []).length) streak++; else break; }
  return `<p class="muted center">Off-screen activity streak: <b>${streak}</b> days</p>
   <div class="panel spark"><span class="pill">${esc(a.area)} · ${a.mins} min</span><h3>${esc(a.title)}</h3><p>${esc(a.what)}</p>
   <p class="why"><b>Why this helps.</b> ${esc(a.why)}</p>
   <div class="btnrow"><button class="btn ${isDone ? 'okbtn' : 'primary'}" data-act="sparkDone" data-id="${a.id}">${isDone ? '✓ Done today' : 'Mark done'}</button><button class="btn ghost" data-act="sparkNext">Another idea ↻</button></div></div>`;
}
ACT.sparkNext = () => { sparkOffset++; route(); };
ACT.sparkDone = async el => { const d = await KV.get('sparkDone', {}), t = todayISO(); d[t] = d[t] || []; d[t] = d[t].includes(el.dataset.id) ? d[t].filter(x => x !== el.dataset.id) : [...d[t], el.dataset.id]; await KV.set('sparkDone', d); route(); };
async function renderBooks() {
  const days = await KV.get('readDays', {}), read = await KV.get('booksRead', {});
  let s = 0; for (let c = new Date(); ; c = addDays(c, -1)) { if (days[isoDate(c)]) s++; else break; }
  return `<p class="muted center">Reading streak: <b>${s}</b> days</p>
   <button class="btn ${days[todayISO()] ? 'okbtn' : 'primary'} wide" data-act="readToday">${days[todayISO()] ? '✓ Read together today' : 'Mark: read together today'}</button>
   <div class="list">${BOOKS.map(b => `<div class="row"><div class="grow"><b>${esc(b.title)}</b><div class="muted sm">${esc(b.author)} · from ${b.ageMin} mo · ${esc(b.tag)}</div><div class="sm">${esc(b.note)}</div></div>
     <button class="tick ${read[b.title] ? 'on' : ''}" data-act="bookToggle" data-t="${esc(b.title)}" aria-label="Read">${icon('check')}</button></div>`).join('')}</div>`;
}
ACT.readToday = async () => { const d = await KV.get('readDays', {}); d[todayISO()] = !d[todayISO()]; if (!d[todayISO()]) delete d[todayISO()]; await KV.set('readDays', d); route(); };
ACT.bookToggle = async el => { const r = await KV.get('booksRead', {}); r[el.dataset.t] = !r[el.dataset.t]; await KV.set('booksRead', r); route(); };
function renderTips() {
  return Object.entries(RESOURCES).map(([k, list]) => `<div class="sec-h"><h2>${esc(k)}</h2></div>${list.map(r => `<details class="acc"><summary>${esc(r.title)}</summary><p>${esc(r.body)}</p></details>`).join('')}`).join('');
}


/* ================= KID MODE — built for a 2-year-old ================= */
const kidState = { letterSet: 'en', numLang: 'en', cs: 'col', world: Object.keys(WORLD)[0], people: Object.keys(PEOPLE)[0], story: null, page: 0 };
const LETTER_SETS = {
  en: { label: 'ABC', data: LETTERS_EN, color: '#E8604C', area: 'letters_en', tpl: l => [[`${l[0]}.`, 'en-US', 0.7], [`${l[0]} for ${l[1]}!`, 'en-US', 0.85]], word: l => `${l[0]} for ${l[1]}` },
  bv: { label: 'স্বরবর্ণ', data: BN_VOWELS, color: '#C0392B', area: 'letters_bn_v', tpl: l => [[`${l[0]}।`, 'bn-BD', 0.7], [`${l[0]} তে ${l[1]}।`, 'bn-BD', 0.85]], word: l => `${l[0]} তে ${l[1]}`, bn: true },
  bc: { label: 'ব্যঞ্জনবর্ণ', data: BN_CONS, color: '#A93226', area: 'letters_bn_c', tpl: l => [[`${l[0]}।`, 'bn-BD', 0.7], [`${l[0]} তে ${l[1]}।`, 'bn-BD', 0.85]], word: l => `${l[0]} তে ${l[1]}`, bn: true }
};
const KID_MENU = [
  ['bubbles', '🫧', 'Bubbles', 'বুদবুদ', '#5EC8FF', '#2F8FE0', true], ['peekaboo', '🙈', 'Peekaboo', 'কুক্কু', '#FFB74D', '#F57C00', true],
  ['letters', '🔤', 'Letters', 'অক্ষর', '#FF8A65', '#E8473C'], ['numbers', '🔢', 'Numbers', 'সংখ্যা', '#6FA8FF', '#2F5FD0'],
  ['colors', '🎨', 'Colours', 'রং ও আকার', '#B38CFF', '#7A4FD8'], ['stories', '📖', 'Stories', 'গল্প', '#4DD0C4', '#14998C'],
  ['world', '🌍', 'Our World', 'পৃথিবী', '#7ED67A', '#2E9E4A'], ['people', '🌟', 'Heroes', 'মহান ব্যক্তি', '#FFD54F', '#E0A000'],
  ['games', '🎮', 'Games', 'খেলা', '#FF8FC0', '#D9467E']
];
/* Doel — Bangladesh's national bird, Affaan's play buddy */
const doelSVG = (cls = '') => `<svg class="doel ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="58" cy="113" rx="26" ry="4" fill="rgba(30,52,104,.15)"/>
  <path d="M80 76 C86 56 92 38 98 24 C104 18 116 22 114 32 C110 50 100 68 92 84Z" fill="#232838"/><path d="M103 26 C110 24 114 28 112 34 C109 46 104 56 99 64" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
  <ellipse cx="58" cy="74" rx="34" ry="30" fill="#232838"/><ellipse cx="54" cy="84" rx="24" ry="19" fill="#fff"/>
  <path d="M72 62 q16 8 13 26 q-13 -3 -18 -16z" fill="#2E3446"/><path d="M73 67 q9 6 9 16" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="49" cy="45" r="25" fill="#232838"/>
  <g class="eye"><circle cx="40" cy="43" r="7.5" fill="#fff"/><circle cx="41.5" cy="44" r="4.2" fill="#14161F"/><circle cx="43" cy="42.3" r="1.5" fill="#fff"/></g>
  <g class="eye"><circle cx="59" cy="43" r="7.5" fill="#fff"/><circle cx="60.5" cy="44" r="4.2" fill="#14161F"/><circle cx="62" cy="42.3" r="1.5" fill="#fff"/></g>
  <circle cx="33" cy="54" r="4.5" fill="#FF8FA3" opacity=".75"/><circle cx="66" cy="54" r="4.5" fill="#FF8FA3" opacity=".75"/>
  <path d="M45 52 h9 l-4.5 6z" fill="#FFB020"/>
  <path d="M50 102 v9 M64 102 v9" stroke="#E08A2E" stroke-width="4" stroke-linecap="round"/>
</svg>`;

/* fx: flying stars + confetti */
const FX = {
  layer() { let f = $('.fx'); if (!f) { f = document.createElement('div'); f.className = 'fx'; document.body.appendChild(f); } return f; },
  stars(fromEl, n = 1) {
    const fx = FX.layer(), tgt = $('#kStars'); if (!tgt || !fromEl.getBoundingClientRect) return;
    const r = fromEl.getBoundingClientRect(), t = tgt.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.className = 'flystar'; s.textContent = '⭐';
      s.style.left = (r.left + r.width / 2 - 17) + 'px'; s.style.top = (r.top + r.height / 2 - 17) + 'px'; fx.appendChild(s);
      setTimeout(() => { s.style.transform = `translate(${t.left - r.left - r.width / 2 + 22}px,${t.top - r.top - r.height / 2 + 6}px) scale(.45) rotate(200deg)`; s.style.opacity = '.4'; }, 30 + i * 110);
      setTimeout(() => s.remove(), 900 + i * 110);
    }
  },
  confetti(x, y, n = 26) {
    const fx = FX.layer(), cols = ['#FF5A5F', '#FFC93C', '#4CD07D', '#3BA7FF', '#A86BFF', '#FF7EB6'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'conf';
      const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
      c.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % cols.length]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 60}px;--r:${Math.random() * 720 - 360}deg`;
      fx.appendChild(c); setTimeout(() => c.remove(), 1300);
    }
  },
  burst(el, n) { const r = el.getBoundingClientRect(); FX.confetti(r.left + r.width / 2, r.top + r.height / 2, n); }
};
const doelHappy = () => { $$('.kid .doel').forEach(d => { d.classList.remove('happy'); void d.getBoundingClientRect(); d.classList.add('happy'); }); };

function kidShell(inner, { back = true, title = '', color = '#2E4A8F' } = {}) {
  const s = Kid.get();
  return `<div class="kid">
    <div class="ksky"><div class="sun"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div></div>
    <div class="kbar">
      ${back ? `<button class="kback" data-act="kBack" aria-label="Back to menu">${icon('back')}</button>` : ''}
      <div class="ktitle" style="color:${color}">${title}</div>
      <div id="kStars" class="kstars" aria-label="Stars">⭐<b>${s?.stars || 0}</b></div>
      <div id="kidTimer" class="ktimer"><b>--:--</b></div>
      <button class="khold" data-hold="exit" aria-label="Grown-ups: press and hold to exit"><span>Hold</span><i></i></button>
    </div>
    ${inner}
    <div class="bigcard" id="bigcard" hidden></div>
  </div>`;
}
ACT.kBack = () => { Sfx.whoosh(); go('kid'); };
Views.kid = async (p) => {
  const [sub, arg] = p; const s = Kid.get();
  if (s?.ended && sub !== 'outside') { location.replace('#/kid/outside'); return ''; }
  if (sub === 'outside') return outsideScreen();
  if (sub === 'letters') return kidShell(lettersHTML(), { title: 'Letters<br><span class="bn">অক্ষর</span>', color: '#C0392B' });
  if (sub === 'numbers') return kidShell(numbersHTML(), { title: 'Numbers<br><span class="bn">সংখ্যা</span>', color: '#1E3468' });
  if (sub === 'colors') return kidShell(colorsHTML(), { title: 'Colours<br><span class="bn">রং</span>', color: '#5B3E96' });
  if (sub === 'stories') return kidShell(storiesHTML(), { title: 'Stories<br><span class="bn">গল্প</span>', color: '#0F5D68' });
  if (sub === 'story') return kidShell(readerHTML(arg), { color: '#0F5D68' });
  if (sub === 'world') return kidShell(worldHTML(), { title: 'Our World<br><span class="bn">পৃথিবী</span>', color: '#256B3E' });
  if (sub === 'people') return kidShell(peopleHTML(), { title: 'Heroes<br><span class="bn">মহান ব্যক্তি</span>', color: '#B07A00' });
  if (sub === 'games') return kidShell(gamesHTML(), { title: 'Games<br><span class="bn">খেলা</span>', color: '#B03A6E' });
  if (sub === 'bubbles') return kidShell(`<div class="kpad"><div class="bubbles" id="bubbles"><div class="bubhint">Pop! <span class="bn">ফাটাও!</span></div></div></div>`, { title: 'Bubbles<br><span class="bn">বুদবুদ</span>', color: '#1F6FC0' });
  if (sub === 'peekaboo') return kidShell(peekHTML(), { title: 'Peekaboo<br><span class="bn">কুক্কু</span>', color: '#D06A00' });
  if (sub === 'game') return kidShell(`<div id="gameStage" class="kpad"></div>`, { title: 'Games<br><span class="bn">খেলা</span>', color: '#B03A6E' });
  const me = heroPhoto ? `<img data-photo="${esc(heroPhoto)}" data-size="full" alt="">` : `<img src="./img/bg-affaan.jpg" alt="" style="object-position:40% 30%">`;
  return kidShell(`<div class="kpad">
    <div class="khead"><div class="kme">${me}</div>
      <div class="khello"><b>Hi ${esc(Child.first())}!</b><span class="bn">চলো খেলি!</span></div></div>
    <div class="ktiles">${KID_MENU.map(([id, em, en, bn, c1, c2, isNew], i) => `<button class="ktile ${isNew ? 'new' : ''}" style="--c1:${c1};--c2:${c2};--d:${(i * 0.37).toFixed(2)}s" data-act="kOpen" data-to="${id}"><span class="em">${em}</span><b>${en}</b><span class="bn">${bn}</span></button>`).join('')}</div>
    <div class="kfoot"><button data-act="kDoel" aria-label="Doel bird">${doelSVG()}</button><span class="bubble">Tap me! <span class="bn">আমাকে ছোঁও!</span></span></div>
  </div>`, { back: false });
};
Views.kid.after = (p) => {
  Kid.ensureTimer();
  if (p[0] === 'game') startGame(p[1]);
  if (p[0] === 'bubbles') startBubbles();
  if (p[0] === 'outside') setTimeout(() => { Sfx.win(); FX.confetti(innerWidth / 2, innerHeight / 3, 60); Speech.seq([['Time to play outside!', 'en-US', 0.85], ['চলো, এবার বাইরে খেলি!', 'bn-BD', 0.85]]); }, 300);
};
ACT.kOpen = el => { Sfx.tap(); go('kid/' + el.dataset.to); };
ACT.kDoel = el => { Sfx.chirp(); doelHappy(); Kid.reward(el, 1); Speech.seq([[`Hello ${Child.first()}! Let's play!`, 'en-US', 0.9], ['চলো খেলি!', 'bn-BD', 0.9]]); };
function outsideScreen() {
  const n = Kid.get()?.stars || 0;
  return `<div class="outside">
    <div class="sunwrap"><svg viewBox="0 0 200 200" class="sunart" aria-hidden="true"><circle cx="100" cy="90" r="38" fill="#FFC94A"/>${Array.from({ length: 12 }, (_, i) => `<rect x="97" y="22" width="6" height="22" rx="3" fill="#FFC94A" transform="rotate(${i * 30} 100 90)"/>`).join('')}
      <path d="M0 170 Q50 140 100 165 T200 160 V200 H0z" fill="#5BAE6A"/><circle cx="150" cy="160" r="12" fill="#E8604C"/><path d="M40 168 v-30 m0 0 c-14 0 -14 -22 0 -22 c14 0 14 22 0 22" stroke="#2F7A45" stroke-width="5" fill="#3F9A5F"/></svg></div>
    <h1>Time to play outside!</h1><h2 class="bn">চলো, এবার বাইরে খেলি!</h2>
    ${n ? `<div class="earned">⭐ ${n} ${n === 1 ? 'star' : 'stars'} today!</div>` : ''}
    <p>Great learning today, ${esc(Child.first())}. Run, jump, kick a ball! ⚽<br><span class="bn">আজ অনেক শিখেছ। এবার দৌড়াও, লাফাও, বল খেলো!</span></p>
    ${doelSVG('happy')}
    <button class="khold big" data-hold="exit"><span>Grown-ups: press & hold</span><i></i></button>
  </div>`;
}
/* press-and-hold to leave (toddler-proof) */
(() => {
  let t = null, el = null;
  const startHold = e => {
    const b = e.target.closest('[data-hold]'); if (!b) return; e.preventDefault(); el = b; b.classList.add('holding');
    t = setTimeout(() => { b.classList.remove('holding'); Kid.finish(); }, 1600);
  };
  const cancel = () => { clearTimeout(t); t = null; if (el) el.classList.remove('holding'); el = null; };
  document.addEventListener('pointerdown', startHold);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => document.addEventListener(ev, cancel));
  document.addEventListener('contextmenu', e => { if (e.target.closest('[data-hold]')) e.preventDefault(); });
})();
const popAnim = el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

/* ---- letters ---- */
function lettersHTML() {
  const s = LETTER_SETS[kidState.letterSet];
  return `<div class="kpad"><div class="ktabs">${Object.entries(LETTER_SETS).map(([k, v]) => `<button class="ktab bn ${k === kidState.letterSet ? 'on' : ''}" style="${k === kidState.letterSet ? 'background:' + v.color + ';box-shadow:0 4px 0 #8A2A20' : ''}" data-act="kLetterSet" data-v="${k}">${v.label}</button>`).join('')}</div>
   <div class="lgrid">${s.data.map((l, i) => `<button class="kcard lcard" data-act="kLetter" data-i="${i}"><span class="glyph bn" style="color:${s.color}">${l[0]}</span><span class="obj">${l[2]}</span><span class="word bn">${esc(l[1])}</span></button>`).join('')}</div></div>`;
}
ACT.kLetterSet = el => { Sfx.tap(); kidState.letterSet = el.dataset.v; route(); };
let bigParts = null;
ACT.kLetter = el => {
  const s = LETTER_SETS[kidState.letterSet], l = s.data[+el.dataset.i]; popAnim(el); Kid.tap(s.area); Kid.reward(el);
  bigParts = s.tpl(l);
  const bc = $('#bigcard');
  bc.innerHTML = `<div class="bigin"><div class="glyph bn" style="color:${s.color}">${l[0]}</div><div class="obj">${l[2]}</div><div class="word ${s.bn ? 'bn' : ''}">${esc(s.word(l))}</div>
    ${s.bn && !Speech.hasBangla() ? '<div class="word2">(Add a Bangla voice in phone settings to hear this)</div>' : ''}
    <button class="again" data-act="kAgain">🔊 Again! <span class="bn">আবার</span></button><button class="kclose" data-act="kCloseBig">Close</button></div>`;
  bc.hidden = false; Speech.seq(bigParts);
};
ACT.kAgain = el => { Sfx.tap(); bigParts && Speech.seq(bigParts); };
ACT.kCloseBig = () => { $('#bigcard').hidden = true; Speech.stop(); };
document.addEventListener('click', e => { if (e.target.id === 'bigcard') ACT.kCloseBig(); });

/* ---- numbers ---- */
const BN_NUM_WORDS = ['এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ'];
function numbersHTML() {
  const L = kidState.numLang;
  return `<div class="kpad"><div class="ktabs"><button class="ktab ${L === 'en' ? 'on' : ''}" data-act="kNumLang" data-v="en">English 123</button><button class="ktab bn ${L === 'bn' ? 'on' : ''}" data-act="kNumLang" data-v="bn">বাংলা ১২৩</button></div>
  <div class="ngrid">${NUMBERS.map((n, i) => `<button class="kcard ncard" data-act="kNum" data-i="${i}"><span class="num bn">${L === 'en' ? n.en : n.bn}</span><span class="nword bn">${L === 'en' ? n.wEn : n.wBn}</span><span class="objs" id="no${i}">${n.emoji}</span></button>`).join('')}</div></div>`;
}
ACT.kNumLang = el => { Sfx.tap(); kidState.numLang = el.dataset.v; route(); };
ACT.kNum = el => {
  const i = +el.dataset.i, n = NUMBERS[i], count = i + 1; popAnim(el); Kid.tap('numbers'); Kid.reward(el);
  const box = $('#no' + i); box.textContent = ''; let k = 0; const iv = setInterval(() => { box.textContent += n.emoji; Sfx.tap(); if (++k >= count) clearInterval(iv); }, 260);
  let seq;
  if (kidState.numLang === 'en') { seq = [[`${n.wEn}.`, 'en-US', 0.75]]; for (let c = 1; c <= count; c++) seq.push([String(c), 'en-US', 0.85]); seq.push([`${n.wEn} ${n.objEn}!`, 'en-US', 0.85]); }
  else { seq = [[`${n.wBn}।`, 'bn-BD', 0.75]]; for (let c = 1; c <= count; c++) seq.push([BN_NUM_WORDS[c - 1], 'bn-BD', 0.85]); seq.push([`${n.wBn}টি ${n.objBn}!`, 'bn-BD', 0.85]); }
  Speech.seq(seq);
};

/* ---- colours & shapes ---- */
function colorsHTML() {
  const t = kidState.cs;
  return `<div class="kpad"><div class="ktabs"><button class="ktab ${t === 'col' ? 'on' : ''}" data-act="kCS" data-v="col">🎨 Colours · <span class="bn">রং</span></button><button class="ktab ${t === 'shp' ? 'on' : ''}" data-act="kCS" data-v="shp">⭐ Shapes · <span class="bn">আকার</span></button></div>
  <div class="cgrid">${t === 'col' ? COLORS_L.map((c, i) => `<button class="ccard ${c.dark ? 'dark' : ''}" style="background:${c.hex}" data-act="kColor" data-i="${i}"><span class="em">${c.emoji}</span><b>${esc(c.en)}</b><span class="bn">${esc(c.bn)}</span></button>`).join('')
      : SHAPES_L.map((s, i) => `<button class="kcard scard" data-act="kShape" data-i="${i}"><svg viewBox="0 0 100 100">${s.svg}</svg><b>${esc(s.en)}</b><span class="bn">${esc(s.bn)} ${s.emoji}</span></button>`).join('')}</div></div>`;
}
ACT.kCS = el => { Sfx.tap(); kidState.cs = el.dataset.v; route(); };
ACT.kColor = el => { const c = COLORS_L[+el.dataset.i]; popAnim(el); Kid.tap('colors'); Kid.reward(el); Speech.seq([[c.en + '.', 'en-US', 0.8], [c.bn + '।', 'bn-BD', 0.8]]); };
ACT.kShape = el => { const s = SHAPES_L[+el.dataset.i]; popAnim(el); Kid.tap('shapes'); Kid.reward(el); Speech.seq([[s.en + '.', 'en-US', 0.8], [s.bn + '।', 'bn-BD', 0.8]]); };

/* ---- stories (6 bilingual readers) ---- */
function storiesHTML() {
  return `<div class="kpad">${STORIES.map(s => `<button class="storycard" style="background:linear-gradient(135deg,${s.color},${s.color}cc)" data-act="kOpen" data-to="story/${s.id}">
    <span class="cov">${s.cover}</span><span class="st"><span class="kind bn">${esc(s.kind)}</span><b>${esc(s.tEn)}</b><span class="bn">${esc(s.tBn)}</span></span></button>`).join('')}</div>`;
}
function readerHTML(id) {
  const s = STORIES.find(x => x.id === id) || STORIES[0];
  if (kidState.story !== s.id) { kidState.story = s.id; kidState.page = 0; Kid.tap('stories'); }
  const p = s.pages[kidState.page];
  return `<div class="kpad"><div class="rhead" style="background:linear-gradient(135deg,${s.color},${s.color}cc)"><b>${esc(s.tEn)}</b><span class="bn">${esc(s.tBn)}</span></div>
    <div class="reader-art"><span>${p.art}</span></div>
    <div class="reader-text"><p class="en">${esc(p.en)}</p><p class="bnl bn">${esc(p.bn)}</p>
      <div class="speakrow"><button style="background:#2E4A8F" data-act="kRead" data-l="en">🔊 English</button><button class="bn" style="background:#1B7F8E" data-act="kRead" data-l="bn">🔊 বাংলায়</button></div></div>
    <div class="pagerow"><button data-act="kPage" data-d="-1" ${kidState.page === 0 ? 'disabled' : ''}>←</button><span>${kidState.page + 1} / ${s.pages.length}</span><button data-act="kPage" data-d="1" ${kidState.page === s.pages.length - 1 ? 'disabled' : ''}>Next →</button></div></div>`;
}
ACT.kPage = el => {
  const s = STORIES.find(x => x.id === kidState.story); Sfx.whoosh();
  kidState.page = Math.min(Math.max(kidState.page + Number(el.dataset.d), 0), s.pages.length - 1);
  const last = kidState.page === s.pages.length - 1 && Number(el.dataset.d) > 0;
  route().then(() => { if (last) { const b = $('.pagerow span'); Kid.reward(b, 3); Sfx.win(); FX.burst(b, 30); } });
};
ACT.kRead = el => { const p = STORIES.find(x => x.id === kidState.story).pages[kidState.page]; Kid.tap('stories'); Speech.seq(el.dataset.l === 'en' ? [[p.en, 'en-US', 0.82]] : [[p.bn, 'bn-BD', 0.82]]); };

/* ---- our world ---- */
function worldHTML() {
  const w = WORLD[kidState.world];
  return `<div class="kpad"><div class="ktabs">${Object.keys(WORLD).map(k => `<button class="ktab bn ${k === kidState.world ? 'on' : ''}" style="${k === kidState.world ? 'background:' + WORLD[k].color + ';box-shadow:0 4px 0 rgba(0,0,0,.25)' : ''}" data-act="kWorld" data-v="${esc(k)}">${WORLD[k].icon} ${esc(k)}</button>`).join('')}</div>
  <div class="cgrid">${w.items.map((it, i) => `<button class="kcard wcard" data-act="kWorldTap" data-i="${i}"><span class="em">${it[2]}</span><b style="color:${w.color}">${esc(it[0])}</b><span class="bn">${esc(it[1])}</span></button>`).join('')}</div></div>`;
}
ACT.kWorld = el => { Sfx.tap(); kidState.world = el.dataset.v; route(); };
ACT.kWorldTap = el => { const it = WORLD[kidState.world].items[+el.dataset.i]; popAnim(el); Kid.tap('world'); Kid.reward(el); Speech.seq([[it[0] + '.', 'en-US', 0.82], [it[1] + '।', 'bn-BD', 0.82]]); };

/* ---- great people ---- */
function peopleHTML() {
  return `<div class="kpad"><div class="ktabs">${Object.keys(PEOPLE).map(k => `<button class="ktab bn ${k === kidState.people ? 'on' : ''}" data-act="kPeople" data-v="${esc(k)}">${esc(k)}</button>`).join('')}</div>
  ${PEOPLE[kidState.people].map((p, i) => `<div class="person"><div class="avatar" style="background:${p.c}">${p.e}</div><div class="grow"><b>${esc(p.n)}</b><div class="bn muted">${esc(p.bn)}</div>
    <p>${esc(p.dEn)}</p><p class="bn">${esc(p.dBn)}</p><button class="hear" data-act="kPerson" data-i="${i}">🔊 Listen · <span class="bn">শোনো</span></button></div></div>`).join('')}</div>`;
}
ACT.kPeople = el => { Sfx.tap(); kidState.people = el.dataset.v; route(); };
ACT.kPerson = el => { const p = PEOPLE[kidState.people][+el.dataset.i]; Kid.tap('people'); Kid.reward(el); Speech.seq([[p.n + '. ' + p.dEn, 'en-US', 0.85], [p.dBn, 'bn-BD', 0.85]]); };

/* ---- NEW: bubble pop (cause & effect + colour words, alternating English / বাংলা) ---- */
const BUB = [['Red', 'লাল', '#FF5A5F'], ['Blue', 'নীল', '#3BA7FF'], ['Yellow', 'হলুদ', '#FFC93C'], ['Green', 'সবুজ', '#4CD07D'], ['Orange', 'কমলা', '#FF9F43'], ['Purple', 'বেগুনি', '#A86BFF'], ['Pink', 'গোলাপি', '#FF7EB6']];
const BUB_INSIDE = ['', '', '', '⭐', '🐟', '🍎', '🦋', '🐤'];
let bubTimer = null, bubLang = 'en';
function startBubbles() {
  clearInterval(bubTimer);
  const spawn = () => {
    const box = $('#bubbles'); if (!box) { clearInterval(bubTimer); return; }
    if (box.querySelectorAll('.bub:not(.popped)').length >= 7) return;
    const i = Math.floor(Math.random() * BUB.length), size = 74 + Math.random() * 46;
    const b = document.createElement('button'); b.className = 'bub'; b.dataset.act = 'bubPop'; b.dataset.i = i; b.setAttribute('aria-label', BUB[i][0] + ' bubble');
    b.style.cssText = `--s:${size}px;--bc:${BUB[i][2]};--t:${7 + Math.random() * 4}s;left:${4 + Math.random() * 72}%`;
    b.textContent = BUB_INSIDE[Math.floor(Math.random() * BUB_INSIDE.length)];
    b.addEventListener('animationend', e => { if (e.animationName === 'rise') b.remove(); });
    box.appendChild(b);
  };
  spawn(); setTimeout(spawn, 400); bubTimer = setInterval(spawn, 900);
}
ACT.bubPop = el => {
  if (el.classList.contains('popped')) return;
  el.classList.add('popped'); Sfx.pop(); FX.burst(el, 12); Kid.tap('bubbles'); Kid.reward(el);
  const c = BUB[+el.dataset.i]; Speech.seq(bubLang === 'en' ? [[c[0] + '!', 'en-US', 0.9]] : [[c[1] + '!', 'bn-BD', 0.9]]); bubLang = bubLang === 'en' ? 'bn' : 'en';
  const h = $('.bubhint'); if (h) h.remove();
  setTimeout(() => el.remove(), 340);
};

/* ---- NEW: peekaboo (object permanence + animal names) ---- */
const PK_ANIMALS = [['Cow', 'গরু', '🐮'], ['Cat', 'বিড়াল', '🐱'], ['Dog', 'কুকুর', '🐶'], ['Duck', 'হাঁস', '🦆'], ['Elephant', 'হাতি', '🐘'], ['Lion', 'সিংহ', '🦁'], ['Monkey', 'বানর', '🐵'], ['Fish', 'মাছ', '🐟'], ['Rabbit', 'খরগোশ', '🐰'], ['Tiger', 'বাঘ', '🐯'], ['Bird', 'পাখি', '🐦'], ['Frog', 'ব্যাঙ', '🐸'], ['Horse', 'ঘোড়া', '🐴'], ['Goat', 'ছাগল', '🐐']];
const PK_CURTAINS = [['#FF8A65', '#E8473C', '☁️'], ['#6FA8FF', '#2F5FD0', '🌙'], ['#7ED67A', '#2E9E4A', '🌳'], ['#B38CFF', '#7A4FD8', '⭐']];
const pickAnimal = (not = []) => { const pool = PK_ANIMALS.filter(a => !not.includes(a[0])); return pool[Math.floor(Math.random() * pool.length)]; };
function peekHTML() {
  const chosen = []; for (let i = 0; i < 4; i++) chosen.push(pickAnimal(chosen.map(a => a[0])));
  return `<div class="kpad"><div class="play-prompt" style="text-align:center">Who's hiding? <span class="bn">কে লুকিয়ে আছে?</span></div>
    <div class="peek">${chosen.map((a, i) => `<button class="pk" data-act="peek" data-a="${a[0]}" aria-label="Peekaboo"><span class="an">${a[2]}</span><span class="nm">${a[0]} · <span class="bn">${a[1]}</span></span>
      <span class="curtain" style="--c1:${PK_CURTAINS[i][0]};--c2:${PK_CURTAINS[i][1]}">${PK_CURTAINS[i][2]}</span></button>`).join('')}</div>
    <div class="kfoot">${doelSVG()}</div></div>`;
}
ACT.peek = el => {
  if (el.classList.contains('open')) return;
  const a = PK_ANIMALS.find(x => x[0] === el.dataset.a);
  el.classList.add('open'); Sfx.boing(); Kid.tap('peekaboo'); Kid.reward(el); doelHappy();
  Speech.seq([['Peekaboo! ' + a[0] + '!', 'en-US', 0.9], [a[1] + '!', 'bn-BD', 0.9]]);
  setTimeout(() => {
    if (!document.body.contains(el)) return;
    el.classList.remove('open');
    setTimeout(() => { // a new friend hides behind the curtain
      const others = $$('.pk').map(p => p.dataset.a), n = pickAnimal(others);
      el.dataset.a = n[0]; el.querySelector('.an').textContent = n[2]; el.querySelector('.nm').innerHTML = `${n[0]} · <span class="bn">${n[1]}</span>`;
    }, 450);
  }, 3200);
};

/* ---- games (3 from v4 + the 2 new ones) ---- */
const GAME_ICONS = { colourtap: '🎨', countstars: '⭐', soundmatch: '🐾' };
function gamesHTML() {
  return `<div class="kpad">
    <button class="gamecard" data-act="kOpen" data-to="bubbles"><span class="gi">🫧</span><span><b>Bubble Pop · <span class="bn">বুদবুদ</span></b><small>Pop the bubbles — hear each colour in English and বাংলা.</small></span></button>
    <button class="gamecard" data-act="kOpen" data-to="peekaboo"><span class="gi">🙈</span><span><b>Peekaboo · <span class="bn">কুক্কু</span></b><small>Lift the curtain — who's hiding? Animal names in both languages.</small></span></button>
    ${GAMES.map(g => `<button class="gamecard" data-act="kOpen" data-to="game/${g.id}"><span class="gi">${GAME_ICONS[g.id] || '🎲'}</span><span><b>${esc(g.title)}</b><small>${esc(g.desc)}</small></span></button>`).join('')}
  <p class="center" style="font-family:var(--body);color:#5D6880;font-size:14px">Play these together, on your lap — a joyful shared minute.</p></div>`;
}
function startGame(id) { Kid.tap('play'); const st = $('#gameStage'); if (!st) return; if (id === 'colourtap') colourTap(st); else if (id === 'countstars') countStars(st); else soundMatch(st); }
function gameWin(el, again) {
  const fb = $('#gFb'); Sfx.win(); FX.burst(el, 34); Kid.reward(el, 3); doelHappy();
  setTimeout(() => $('#gameStage') && again($('#gameStage')), 1500);
  return fb;
}
function gameMiss(el, msg) { const fb = $('#gFb'); Sfx.oops(); el.classList.remove('shake-no'); void el.offsetWidth; el.classList.add('shake-no'); fb.textContent = msg; fb.className = 'play-fb try'; }
const GC = [['Red', '#FF5A5F', 'লাল'], ['Blue', '#3BA7FF', 'নীল'], ['Yellow', '#FFC93C', 'হলুদ'], ['Green', '#4CD07D', 'সবুজ']];
let gameTarget = null;
function colourTap(st) {
  const t = GC[Math.floor(Math.random() * GC.length)]; gameTarget = t[0]; const opts = [...GC].sort(() => Math.random() - .5);
  st.innerHTML = `<div class="play-area"><div class="play-prompt">Tap <span style="color:${t[1]}">${t[0]}</span>! <span class="bn">· ${t[2]}</span></div><div class="play-sub">Say the colour aloud with him</div>
   <div class="colour-grid">${opts.map(c => `<button class="colour-btn" style="background:${c[1]}" data-act="gColour" data-v="${c[0]}" aria-label="${c[0]}"></button>`).join('')}</div><div class="play-fb" id="gFb"></div><div class="kfoot">${doelSVG()}</div></div>`;
  Speech.seq([['Tap ' + t[0] + '!', 'en-US', 0.85], [t[2] + '!', 'bn-BD', 0.85]]);
}
ACT.gColour = el => { if (el.dataset.v === gameTarget) { const fb = gameWin(el, colourTap); fb.textContent = 'Yes! Well done 🎉'; fb.className = 'play-fb good'; Speech.seq([['Yes! Well done!', 'en-US', 0.85]]); } else gameMiss(el, 'Try again!'); };
function countStars(st) {
  const n = Math.floor(Math.random() * 4) + 1; gameTarget = n; const opts = [...new Set([n, Math.max(1, n - 1), Math.min(9, n + 1), n + 2])].slice(0, 3).sort((a, b) => a - b);
  st.innerHTML = `<div class="play-area"><div class="play-prompt">How many? <span class="bn">· কয়টি?</span></div><div class="play-sub">Count them together, out loud</div>
   <div class="stars">${'⭐'.repeat(n)}</div><div class="num-grid">${opts.map(o => `<button class="num-btn" data-act="gCount" data-v="${o}">${o}</button>`).join('')}</div><div class="play-fb" id="gFb"></div><div class="kfoot">${doelSVG()}</div></div>`;
  Speech.seq([['How many stars?', 'en-US', 0.85]]);
}
ACT.gCount = el => { if (+el.dataset.v === gameTarget) { const fb = gameWin(el, countStars); fb.textContent = 'That is right! 🎉'; fb.className = 'play-fb good'; Speech.seq([[gameTarget + '! Well counted!', 'en-US', 0.85]]); } else gameMiss(el, 'Count again together'); };
const GA = [['Cat', '🐱', 'বিড়াল'], ['Dog', '🐶', 'কুকুর'], ['Cow', '🐮', 'গরু'], ['Duck', '🦆', 'হাঁস'], ['Sheep', '🐑', 'ভেড়া'], ['Frog', '🐸', 'ব্যাঙ']];
function soundMatch(st) {
  const pick = [...GA].sort(() => Math.random() - .5).slice(0, 3), t = pick[Math.floor(Math.random() * 3)]; gameTarget = t[0]; const opts = [...pick].sort(() => Math.random() - .5);
  st.innerHTML = `<div class="play-area"><div class="play-prompt">Where is the ${t[0]}? <span class="bn">· ${t[2]} কোথায়?</span></div><div class="play-sub">Make its sound together, then tap it</div>
   <div class="num-grid">${opts.map(a => `<button class="num-btn emoji" data-act="gAnimal" data-v="${a[0]}" aria-label="${a[0]}">${a[1]}</button>`).join('')}</div><div class="play-fb" id="gFb"></div><div class="kfoot">${doelSVG()}</div></div>`;
  Speech.seq([['Where is the ' + t[0] + '?', 'en-US', 0.85], [t[2] + ' কোথায়?', 'bn-BD', 0.85]]);
}
ACT.gAnimal = el => { if (el.dataset.v === gameTarget) { const fb = gameWin(el, soundMatch); fb.textContent = 'Yes! You found it 🎉'; fb.className = 'play-fb good'; Speech.seq([['Yes! The ' + gameTarget + '!', 'en-US', 0.85]]); } else gameMiss(el, 'Listen again'); };
