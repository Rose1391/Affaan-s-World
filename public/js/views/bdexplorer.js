/* ============ OUR BANGLADESH — map (2D / 3D), divisions, districts, national symbols, anthem ============
 Map: d3-geo Mercator on a canvas. In 3D the country tilts back and every district stands as a raised tile; the one you
 tap rises higher. Drag to move, pinch or scroll to zoom, tap a district to hear its name and what it is famous for,
 or play "Find the district". Divisions and districts each have Learn and Quiz; the national symbols have their own
 illustrated cards and a quiz; the anthem shows its ten lines (Tagore, 1905, public domain). */
const BDX = { tab: 'map', mode: 'learn', div: 'all', mapMode: 'districts', tilt: 0, quiz: null, score: 0, lang: 'en' };
const BDX_TABS = [['map', '🗺️', 'Map', 'মানচিত্র'], ['divisions', '🏛️', 'Divisions', 'বিভাগ'], ['districts', '📍', 'Districts', 'জেলা'], ['symbols', '🇧🇩', 'Symbols', 'প্রতীক'], ['anthem', '🎵', 'Anthem', 'সংগীত']];
const bdDiv = id => BD_DIVISIONS.find(d => d.id === id);
// real photos the family adds for the national symbols (kind 'bdphoto' {k, photoId})
let BD_PICS = {};
async function loadBdPics() { try { BD_PICS = Object.fromEntries((await DB.list('bdphoto')).filter(r => r.photoId).map(r => [r.k, r.photoId])); } catch (e) { } }
loadBdPics(); Bus.on('change', () => loadBdPics());
const bdSymArt = (s, cls = '') => BD_PICS[s.k] ? `<div class="bdart photo ${cls}"><img data-photo="${esc(BD_PICS[s.k])}" data-size="full" alt="${esc(s.v)}"><span class="bdbadge">${s.k === 'flag' ? '<img src="./flags/bd.svg" alt="">' : BD_ART[s.art] || ''}</span></div>`
  : `<div class="bdart ${cls}">${s.k === 'flag' ? '<img src="./flags/bd.svg" alt="">' : BD_ART[s.art] || ''}</div>`;
const bdDist = id => BD_DISTRICTS.find(d => d.id === id);
const bdSayDist = d => { const v = bdDiv(d.div); return Voice.say('BD:d:' + d.id, [[`${d.en}, in ${v.en} division. Famous for ${d.fact}.`, 'en-US', .88], [`${d.bn} জেলা, ${v.bn} বিভাগে। এটি বিখ্যাত, ${d.factBn}।`, "bn-BD", .88]]); };

/* ---------- illustrations for the national symbols ---------- */
const BD_ART = {
  flag: '<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="4" fill="#006A4E"/><circle cx="45" cy="30" r="20" fill="#F42A41"/></svg>',
  anthem: '<svg viewBox="0 0 100 70"><path d="M30 14 L70 6 V44" stroke="#2B3A55" stroke-width="5" fill="none"/><ellipse cx="24" cy="50" rx="10" ry="8" fill="#2B3A55"/><ellipse cx="64" cy="44" rx="10" ry="8" fill="#2B3A55"/><path d="M30 14 V50" stroke="#2B3A55" stroke-width="5"/><circle cx="82" cy="18" r="7" fill="#F42A41"/><rect x="74" y="24" width="18" height="12" rx="2" fill="#006A4E"/></svg>',
  lily: '<svg viewBox="0 0 100 70"><ellipse cx="50" cy="56" rx="40" ry="9" fill="#3E8A45"/><path d="M50 56 L90 52" stroke="#2D6B35" stroke-width="2"/>' + Array.from({ length: 8 }, (_, i) => `<ellipse cx="50" cy="34" rx="7" ry="20" fill="${i % 2 ? '#FFFFFF' : '#FBEFF4'}" stroke="#E7B6C8" stroke-width="1" transform="rotate(${-70 + i * 20} 50 50)"/>`).join('') + '<circle cx="50" cy="42" r="6" fill="#F7D24A"/></svg>',
  jackfruit: '<svg viewBox="0 0 100 80"><path d="M50 8 q4 -6 10 -4" stroke="#5A3E26" stroke-width="3" fill="none"/><ellipse cx="50" cy="44" rx="30" ry="34" fill="#9BB83A"/>' + Array.from({ length: 60 }, (_, i) => { const a = i * 2.4, r = Math.sqrt(i) * 4.2; return `<circle cx="${(50 + Math.cos(a) * r * 1.0).toFixed(1)}" cy="${(44 + Math.sin(a) * r * 1.15).toFixed(1)}" r="1.6" fill="#6E8A22"/>`; }).join('') + '<ellipse cx="40" cy="30" rx="8" ry="12" fill="#fff" opacity=".18"/></svg>',
  doel: '<svg viewBox="0 0 100 70"><path d="M8 52 H92" stroke="#7A5634" stroke-width="4" stroke-linecap="round"/><path d="M30 34 L6 18 L10 14 L34 28Z" fill="#111"/><path d="M8 17 L30 31" stroke="#fff" stroke-width="2"/><ellipse cx="46" cy="38" rx="20" ry="11" fill="#111"/><ellipse cx="50" cy="44" rx="15" ry="6" fill="#F6F3EA"/><circle cx="66" cy="28" r="8" fill="#111"/><path d="M73 27 L84 29 L73 31Z" fill="#111"/><circle cx="68" cy="26" r="1.6" fill="#fff"/><path d="M50 34 L32 38" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M44 49 V52 M52 49 V52" stroke="#3A2A1A" stroke-width="2"/></svg>',
  tiger: '<svg viewBox="0 0 100 80"><circle cx="24" cy="18" r="9" fill="#E8861F"/><circle cx="76" cy="18" r="9" fill="#E8861F"/><circle cx="24" cy="18" r="4" fill="#F7E6D0"/><circle cx="76" cy="18" r="4" fill="#F7E6D0"/><ellipse cx="50" cy="44" rx="34" ry="30" fill="#EE8F22"/><ellipse cx="50" cy="56" rx="20" ry="16" fill="#F7EEDF"/><path d="M50 16 v10 M38 18 l3 9 M62 18 l-3 9 M18 40 h10 M18 48 h9 M82 40 h-10 M82 48 h-9" stroke="#2A1A0E" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="40" r="4" fill="#2A1A0E"/><circle cx="62" cy="40" r="4" fill="#2A1A0E"/><circle cx="39" cy="39" r="1.2" fill="#fff"/><circle cx="63" cy="39" r="1.2" fill="#fff"/><path d="M45 52 h10 l-5 5z" fill="#3A1E12"/><path d="M50 57 q-6 6 -10 2 M50 57 q6 6 10 2" stroke="#3A1E12" stroke-width="1.6" fill="none"/></svg>',
  hilsa: '<svg viewBox="0 0 100 60"><path d="M8 30 Q30 8 70 22 L90 10 L86 30 L90 50 L70 38 Q30 52 8 30Z" fill="#C9D3DC" stroke="#8C9AA8" stroke-width="1.5"/><path d="M14 30 Q36 18 70 26" stroke="#9FB0C0" stroke-width="2" fill="none"/><circle cx="20" cy="28" r="3" fill="#2B3A55"/><path d="M32 22 v16" stroke="#E7B9A5" stroke-width="2"/><ellipse cx="45" cy="34" rx="12" ry="4" fill="#fff" opacity=".35"/></svg>',
  mango: '<svg viewBox="0 0 100 80"><rect x="44" y="44" width="12" height="32" rx="4" fill="#6B4A2A"/><circle cx="50" cy="32" r="26" fill="#3F8A37"/><circle cx="30" cy="40" r="16" fill="#4E9A3E"/><circle cx="70" cy="40" r="16" fill="#4E9A3E"/><circle cx="50" cy="18" r="16" fill="#5FAA48"/><ellipse cx="36" cy="46" rx="5" ry="7" fill="#F2C14E"/><ellipse cx="62" cy="48" rx="5" ry="7" fill="#F2A43A"/><ellipse cx="52" cy="38" rx="4.5" ry="6.5" fill="#F2C14E"/></svg>',
  poet: '<svg viewBox="0 0 100 80"><rect x="22" y="14" width="56" height="58" rx="6" fill="#FFF8EC" stroke="#C9A04A" stroke-width="2"/><path d="M32 30 h36 M32 40 h30 M32 50 h34 M32 60 h20" stroke="#B0632F" stroke-width="3" stroke-linecap="round"/><path d="M70 8 L82 20 L60 58 L52 62 L54 54Z" fill="#2B3A55"/></svg>',
  kabaddi: '<svg viewBox="0 0 100 70"><path d="M8 62 H92 M50 20 V62" stroke="#8A6A3A" stroke-width="2" stroke-dasharray="4 3"/><circle cx="30" cy="20" r="6" fill="#C0392B"/><path d="M30 26 L28 44 L20 58 M28 44 L36 58 M29 32 L42 30 M29 32 L18 38" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="22" r="6" fill="#2B7BB9"/><path d="M70 28 L72 46 L64 58 M72 46 L80 58 M71 34 L58 34 M71 34 L82 40" stroke="#2B7BB9" stroke-width="5" stroke-linecap="round"/></svg>',
  language: '<svg viewBox="0 0 100 70"><rect x="10" y="10" width="80" height="50" rx="10" fill="#FFF8EC" stroke="#C9A04A" stroke-width="2"/><text x="50" y="47" text-anchor="middle" font-size="32" font-family="Hind Siliguri, sans-serif" font-weight="700" fill="#B0451E">অ আ</text></svg>',
  soudho: '<svg viewBox="0 0 100 70"><path d="M6 64 H94" stroke="#7A8A6A" stroke-width="3"/>' + [[50, 8, 14], [42, 18, 12], [58, 18, 12], [34, 28, 10], [66, 28, 10], [26, 38, 9], [74, 38, 9]].map(([x, top, w]) => `<path d="M${x - w} 64 L${x} ${top} L${x + w} 64Z" fill="#9AA5A8" stroke="#6F7C80" stroke-width="1"/>`).join('') + '</svg>',
  minar: '<svg viewBox="0 0 100 70"><rect x="6" y="60" width="88" height="4" fill="#BDB4A3"/><rect x="12" y="56" width="76" height="4" fill="#D3CBBB"/><circle cx="50" cy="26" r="17" fill="#E2322B"/>' + [[22, 34, 9], [32, 28, 9], [59, 28, 9], [69, 34, 9]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${56 - y}" fill="none" stroke="#F4F1EA" stroke-width="2.4"/><path d="M${x + w / 3} ${y} V56 M${x + 2 * w / 3} ${y} V56" stroke="#F4F1EA" stroke-width="1.2"/>`).join('') + '<path d="M42 56 V22 L48 12 H60 L58 22 V56" fill="none" stroke="#F4F1EA" stroke-width="2.8" stroke-linejoin="round"/><path d="M42 22 H58 M47 22 V56 M53 22 V56 M46 15 H59" stroke="#F4F1EA" stroke-width="1.3"/></svg>',
  emblem: '<svg viewBox="0 0 100 80"><path d="M14 64 Q30 72 50 64 Q70 72 86 64" stroke="#2B7BB9" stroke-width="3" fill="none"/><path d="M50 62 Q32 50 30 22 M50 62 Q68 50 70 22" stroke="#C99A2E" stroke-width="4" fill="none"/>' + Array.from({ length: 6 }, (_, i) => `<ellipse cx="${(31 + i * 1).toFixed(0)}" cy="${26 + i * 6}" rx="3" ry="5" fill="#E2B33E" transform="rotate(-25 ${31 + i} ${26 + i * 6})"/><ellipse cx="${69 - i}" cy="${26 + i * 6}" rx="3" ry="5" fill="#E2B33E" transform="rotate(25 ${69 - i} ${26 + i * 6})"/>`).join('') + '<path d="M50 56 Q42 44 46 34 Q50 40 50 56 Q50 40 54 34 Q58 44 50 56Z" fill="#F4F1EA" stroke="#C9A04A"/><path d="M50 30 Q44 22 50 14 Q56 22 50 30Z" fill="#3E8A45"/>' + [38, 46, 54, 62].map(x => `<path d="M${x} 6 l1.5 3 3 .4 -2.3 2 .6 3 -2.8 -1.6 -2.8 1.6 .6 -3 -2.3 -2 3 -.4z" fill="#F2C14E"/>`).join('') + '</svg>',
  parliament: '<svg viewBox="0 0 100 70"><rect x="8" y="22" width="84" height="40" fill="#B9A58A"/><path d="M8 62 H92" stroke="#7A6A4A" stroke-width="3"/><circle cx="30" cy="40" r="7" fill="#5A4A36"/><path d="M58 32 L66 50 L50 50Z" fill="#5A4A36"/><rect x="74" y="34" width="10" height="16" fill="#5A4A36"/><rect x="16" y="28" width="6" height="26" fill="#5A4A36"/><path d="M4 66 H96" stroke="#5FA4D8" stroke-width="4"/></svg>',
  mosque: '<svg viewBox="0 0 100 70"><rect x="26" y="20" width="48" height="44" fill="#F1ECE1" stroke="#9A8E7A" stroke-width="1.5"/><path d="M26 20 H74 M26 32 H74 M26 44 H74" stroke="#9A8E7A" stroke-width="1.5"/><rect x="44" y="48" width="12" height="16" fill="#6A5A46"/><rect x="80" y="12" width="6" height="52" fill="#F1ECE1" stroke="#9A8E7A"/><path d="M80 12 L83 4 L86 12" fill="#3E8A45"/><path d="M8 64 H92" stroke="#7A6A4A" stroke-width="3"/></svg>',
  song: '<svg viewBox="0 0 100 70"><path d="M10 50 h20 l10 -20 l10 30 l10 -40 l10 30 l10 -10 h10" stroke="#C0392B" stroke-width="4" fill="none" stroke-linejoin="round"/><circle cx="20" cy="18" r="8" fill="#F2C14E"/></svg>',
  taka: '<svg viewBox="0 0 100 70"><rect x="8" y="14" width="84" height="44" rx="6" fill="#DDEFD6" stroke="#5B8C4A" stroke-width="2"/><circle cx="50" cy="36" r="15" fill="#fff" stroke="#5B8C4A" stroke-width="2"/><text x="50" y="44" text-anchor="middle" font-size="22" font-weight="800" fill="#2E6B3A">৳</text></svg>',
  capital: '<svg viewBox="0 0 100 70"><path d="M4 62 H96" stroke="#5FA4D8" stroke-width="5"/>' + [[12, 30], [24, 20], [36, 34], [48, 14], [60, 26], [72, 18], [84, 32]].map(([x, y]) => `<rect x="${x - 5}" y="${y}" width="10" height="${58 - y}" fill="#8FA1B5"/>` + Array.from({ length: Math.floor((58 - y) / 8) }, (_, k) => `<rect x="${x - 3}" y="${y + 3 + k * 8}" width="2" height="3" fill="#F7E3A0"/><rect x="${x + 1}" y="${y + 3 + k * 8}" width="2" height="3" fill="#F7E3A0"/>`).join('')).join('') + '</svg>',
  days: '<svg viewBox="0 0 100 70"><rect x="14" y="12" width="72" height="52" rx="6" fill="#fff" stroke="#C9A04A" stroke-width="2"/><rect x="14" y="12" width="72" height="14" rx="6" fill="#006A4E"/><circle cx="50" cy="44" r="10" fill="#F42A41"/></svg>',
  sundarban: '<svg viewBox="0 0 100 70"><path d="M0 56 Q50 50 100 56 V70 H0Z" fill="#5C8FA6"/>' + [14, 32, 52, 72, 88].map((x, i) => `<path d="M${x} 56 V${30 - i % 2 * 6}" stroke="#4A3626" stroke-width="3"/><path d="M${x - 6} 58 L${x} 50 L${x + 6} 58" stroke="#4A3626" stroke-width="1.5" fill="none"/><circle cx="${x}" cy="${26 - i % 2 * 6}" r="10" fill="#3E7A38"/>`).join('') + '<path d="M58 46 q6 -6 12 0 l4 -3 v6z" fill="#EE8F22"/></svg>',
};

function bangladeshHTML() {
  const tabs = `<div class="extabs bdtabs">${BDX_TABS.map(([k, ic, en, bn]) => `<button class="extab ${BDX.tab === k ? 'on' : ''}" data-act="bdTab" data-v="${k}"><span>${ic}</span><b>${en}</b><i class="bn">${bn}</i></button>`).join('')}</div>`;
  let body = '';
  if (BDX.tab === 'map') body = bdMapHTML();
  else if (BDX.tab === 'divisions') body = bdDivisionsHTML();
  else if (BDX.tab === 'districts') body = bdDistrictsHTML();
  else if (BDX.tab === 'symbols') body = bdSymbolsHTML();
  else body = bdAnthemHTML();
  return `<div class="kpad expad bdpad">${tabs}${body}</div>`;
}
const bdModeBar = () => `<div class="extools"><div class="exmode"><button class="${BDX.mode === 'learn' ? 'on' : ''}" data-act="bdMode" data-v="learn">📖 Learn · <span class="bn">শিখি</span></button><button class="${BDX.mode === 'quiz' ? 'on' : ''}" data-act="bdMode" data-v="quiz">⭐ Quiz · <span class="bn">খেলি</span></button></div>${BDX.mode === 'quiz' ? `<span class="exscore">⭐ ${BDX.score}</span>` : ''}</div>`;
function bdDivisionsHTML() {
  if (BDX.mode === 'quiz') return bdModeBar() + bdQuizHTML('divisions');
  return bdModeBar() + `<p class="excount">8 divisions · ৬৪ districts · <span class="bn">৮টি বিভাগ · ৬৪টি জেলা</span></p><div class="bdgrid">${BD_DIVISIONS.map(v => { const ds = BD_DISTRICTS.filter(d => d.div === v.id);
    return `<article class="bdcard" style="--dc:${v.c}"><button class="bdhead" data-act="bdShowDiv" data-id="${v.id}"><b>${esc(v.en)}</b><span class="bn">${esc(v.bn)} বিভাগ</span><small>${ds.length} districts · ${esc(v.note[0])}</small><small class="bn">${bnNum(ds.length)}টি জেলা · ${esc(v.note[1])}</small><em>🗺️ See on map</em></button>
      <div class="bdchips">${ds.map(d => `<button class="bdchip" data-act="bdTapDist" data-id="${d.id}">${esc(d.en)} · <span class="bn">${esc(d.bn)}</span></button>`).join('')}</div></article>`; }).join('')}</div>`;
}
function bdDistrictsHTML() {
  const filter = `<div class="exconts"><button class="exct ${BDX.div === 'all' ? 'on' : ''}" data-act="bdDivF" data-v="all">All 64 · <span class="bn">সব</span></button>${BD_DIVISIONS.map(v => `<button class="exct ${BDX.div === v.id ? 'on' : ''}" data-act="bdDivF" data-v="${v.id}" style="--cc:${v.c}">${esc(v.en)} · <span class="bn">${esc(v.bn)}</span></button>`).join('')}</div>`;
  if (BDX.mode === 'quiz') return filter + bdModeBar() + bdQuizHTML('districts');
  const L = BD_DISTRICTS.filter(d => BDX.div === 'all' || d.div === BDX.div).sort((a, b) => a.en.localeCompare(b.en));
  return filter + bdModeBar() + `<div class="exgrid capitals">${L.map(d => { const v = bdDiv(d.div); return `<button class="excard bddist" style="--dc:${v.c}" data-act="bdTapDist" data-id="${d.id}"><span class="bddot">${esc(v.en)} · <span class="bn">${esc(v.bn)}</span></span><b>${esc(d.en)}</b><span class="bn">${esc(d.bn)}</span><small>${esc(d.fact)}</small><small class="bn">${esc(d.factBn)}</small></button>`; }).join('')}</div>`;
}
function bdSymbolsHTML() {
  if (BDX.mode === 'quiz') return bdModeBar() + bdQuizHTML('symbols');
  return bdModeBar() + `<div class="bdsyms">${BD_SYMBOLS.map(s => `<button class="bdsym ${BD_PICS[s.k] ? 'hasphoto' : ''}" data-act="bdTapSym" data-k="${s.k}">${bdSymArt(s)}<small>${esc(s.t)} · <span class="bn">${esc(s.tBn)}</span></small><b>${esc(s.v)}</b><span class="bn">${esc(s.vBn)}</span><p>${esc(s.n)}</p><p class="bn">${esc(s.nBn)}</p></button>`).join('')}</div>`;
}
function bdAnthemHTML() {
  const rec = Voice.has('BD:anthem');
  return `<div class="bdanthem"><div class="bdart big">${BD_ART.flag}</div><h3>Amar Shonar Bangla · <span class="bn">আমার সোনার বাংলা</span></h3><p class="muted">Words and music: Rabindranath Tagore · <span class="bn">কথা ও সুর: রবীন্দ্রনাথ ঠাকুর</span></p>
    <ol class="bdlyr">${BD_ANTHEM.map((l, i) => `<li class="bn" data-i="${i}">${esc(l)}</li>`).join('')}</ol>
    <p class="muted sm"><i>${esc(BD_ANTHEM_EN)}</i></p>
    <div class="btnrow">${rec ? `<button class="hear big" data-act="bdAnthem">▶ Play our family singing · <span class="bn">আমাদের গাওয়া শুনি</span></button>` : `<p class="muted sm">Sing it together! A grown-up can record the family singing it in Play → Voices (“Our anthem”), and it will play here with the lines lighting up.<br><span class="bn">একসাথে গাও! বড়রা প্লে → কণ্ঠ থেকে পরিবারের গাওয়া রেকর্ড করতে পারবেন।</span></p>`}</div></div>`;
}
// quizzes
function bdNewQuiz(kind) {
  const R = a => a[Math.floor(Math.random() * a.length)];
  if (kind === 'symbols') { const s = R(BD_SYMBOLS.filter(x => !['days', 'capital'].includes(x.k))), opts = [s]; while (opts.length < 3) { const o = R(BD_SYMBOLS); if (!opts.includes(o)) opts.push(o); } BDX.quiz = { kind, ans: s.k, opts: opts.sort(() => Math.random() - .5).map(o => o.k) }; return; }
  if (kind === 'divisions') { const d = R(BD_DISTRICTS), opts = [d.div]; while (opts.length < 3) { const o = R(BD_DIVISIONS).id; if (!opts.includes(o)) opts.push(o); } BDX.quiz = { kind, q: d.id, ans: d.div, opts: opts.sort(() => Math.random() - .5) }; return; }
  const pool = BD_DISTRICTS.filter(d => BDX.div === 'all' || d.div === BDX.div), d = R(pool), opts = [d.id]; while (opts.length < 3) { const o = R(BD_DISTRICTS).id; if (!opts.includes(o)) opts.push(o); }
  BDX.quiz = { kind, ans: d.id, opts: opts.sort(() => Math.random() - .5) };
}
function bdQuizHTML(kind) {
  if (!BDX.quiz || BDX.quiz.kind !== kind) bdNewQuiz(kind); const Q = BDX.quiz;
  let q, opts;
  if (kind === 'symbols') { const s = BD_SYMBOLS.find(x => x.k === Q.ans); q = [`What is our ${s.t.toLowerCase()}?`, `আমাদের ${s.tBn} কী?`]; opts = Q.opts.map(k => { const o = BD_SYMBOLS.find(x => x.k === k); return `<button class="exopt bdopt" data-act="bdAns" data-v="${k}">${bdSymArt(o, 'sm')}<b>${esc(o.v)}</b><span class="bn">${esc(o.vBn)}</span></button>`; }); }
  else if (kind === 'divisions') { const d = bdDist(Q.q); q = [`Which division is ${d.en} in?`, `${d.bn} কোন বিভাগে?`]; opts = Q.opts.map(id => { const v = bdDiv(id); return `<button class="exopt" style="--dc:${v.c}" data-act="bdAns" data-v="${id}"><b>${esc(v.en)}</b><span class="bn">${esc(v.bn)}</span></button>`; }); }
  else { const d = bdDist(Q.ans); q = [`Which district is famous for: ${d.fact}?`, `কোন জেলা বিখ্যাত: ${d.factBn}?`]; opts = Q.opts.map(id => { const o = bdDist(id); return `<button class="exopt" data-act="bdAns" data-v="${id}"><b>${esc(o.en)}</b><span class="bn">${esc(o.bn)}</span></button>`; }); }
  return `<div class="exquiz"><div class="exq"><b>${esc(q[0])}</b><span class="bn">${esc(q[1])}</span></div><div class="exopts">${opts.join('')}</div><div class="exfb" id="bdFb"></div></div>`;
}
ACT.bdTab = el => { Sfx.tap(); BDX.tab = el.dataset.v; BDX.quiz = null; route(); };
ACT.bdMode = el => { Sfx.tap(); BDX.mode = el.dataset.v; BDX.quiz = null; route(); };
ACT.bdDivF = el => { Sfx.tap(); BDX.div = el.dataset.v; BDX.quiz = null; route(); };
ACT.bdTapDist = el => { popAnim(el); Kid.tap('bangladesh'); bdSayDist(bdDist(el.dataset.id)); };
ACT.bdShowDiv = el => { Sfx.tap(); BDX.tab = 'map'; BDX.mapMode = 'divisions'; BDX.focusDiv = el.dataset.id; route(); };
ACT.bdTapSym = el => { const s = BD_SYMBOLS.find(x => x.k === el.dataset.k); popAnim(el); Kid.tap('bangladesh'); Voice.say('BD:s:' + s.k, [[`Our ${s.t.toLowerCase()} is ${s.v}.`, 'en-US', .88], [`আমাদের ${s.tBn} ${s.vBn}।`, 'bn-BD', .88]]); };
ACT.bdAns = el => {
  const Q = BDX.quiz, fb = $('#bdFb');
  if (el.dataset.v === Q.ans) { el.classList.add('right'); Kid.reward(el); Sfx.win && Sfx.win(); BDX.score += 2; Kid.tap('bangladesh');
    let said;
    if (Q.kind === 'symbols') { const s = BD_SYMBOLS.find(x => x.k === Q.ans); fb.innerHTML = `✓ ${esc(s.v)} · <span class="bn">${esc(s.vBn)}</span>`; said = Voice.say('BD:s:' + s.k, [[`Our ${s.t.toLowerCase()} is ${s.v}.`, 'en-US', .88], [`আমাদের ${s.tBn} ${s.vBn}।`, 'bn-BD', .88]]); }
    else if (Q.kind === 'divisions') { const v = bdDiv(Q.ans); fb.innerHTML = `✓ ${esc(v.en)} · <span class="bn">${esc(v.bn)}</span>`; said = bdSayDist(bdDist(Q.q)); }
    else { const d = bdDist(Q.ans); fb.innerHTML = `✓ ${esc(d.en)} · <span class="bn">${esc(d.bn)}</span>`; said = bdSayDist(d); }
    Promise.all([said, new Promise(r => setTimeout(r, 1400))]).then(() => setTimeout(() => { if (BDX.mode !== 'quiz' || BDX.quiz !== Q) return; BDX.quiz = null; route(); }, 600));
  } else { el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 600); Sfx.tap(); fb.innerHTML = `Try again · <span class="bn">আবার চেষ্টা করো</span>`; }
};
ACT.bdAnthem = () => { const lis = $$('.bdlyr li'); Voice.play('BD:anthem'); const per = 5200; lis.forEach((li, i) => setTimeout(() => { lis.forEach(x => x.classList.remove('on')); li.classList.add('on'); }, i * per)); };

/* ---------------- the map ---------------- */
function bdMapHTML() {
  return `<div class="bdmapbar"><div class="exmode"><button class="${BDX.mapMode === 'districts' ? 'on' : ''}" data-act="bdMapMode" data-v="districts">📍 Districts · <span class="bn">জেলা</span></button><button class="${BDX.mapMode === 'divisions' ? 'on' : ''}" data-act="bdMapMode" data-v="divisions">🏛️ Divisions · <span class="bn">বিভাগ</span></button></div>
    <button class="gbtn" data-act="bd3d">${BDX.tilt ? '🗺️ 2D' : '🧊 3D'}</button><button class="gbtn" data-act="bdLang">${BDX.lang === 'en' ? 'বাংলা' : 'English'}</button><button class="gbtn" data-act="bdFind">🎯 Find · <span class="bn">খুঁজি</span></button></div>
    <div class="bdstage" id="bdStage"><canvas id="bdCv" aria-label="Map of Bangladesh"></canvas><div class="globe-loading">Loading the map… · <span class="bn">মানচিত্র আসছে…</span></div></div>
    <div class="globe-info" id="bdInfo"><p class="muted">Tap a district or a division · <span class="bn">জেলা বা বিভাগে চাপ দাও</span></p></div>`;
}
const BdMap = (() => {
  let data = null, inst = null;
  const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  async function load() {
    if (!data) data = (async () => { await loadScript('./vendor/d3-array.min.js'); await loadScript('./vendor/d3-geo.min.js'); await loadScript('./vendor/topojson-client.min.js');
      const topo = await (await fetch('./data/bd.json')).json();
      // d3 wants each polygon wound clockwise on the sphere; flip any that come out the other way (they would cover the globe)
      const rewind = g => { if (!g) return g; const fix = poly => d3.geoArea({ type: 'Polygon', coordinates: poly }) > 2 * Math.PI ? poly.map(r => r.slice().reverse()) : poly;
        if (g.type === 'Polygon') g.coordinates = fix(g.coordinates); else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(fix); return g; };
      const dist = topojson.feature(topo, topo.objects.districts).features, divs = topojson.feature(topo, topo.objects.divisions).features;
      dist.forEach(f => rewind(f.geometry)); divs.forEach(f => rewind(f.geometry));
      dist.forEach(f => { f.d = bdDist(String(f.properties.id)); f.cen = d3.geoCentroid(f); });
      divs.forEach(f => { f.v = bdDiv(String(f.properties.id)); f.cen = d3.geoCentroid(f); });
      const all = rewind(topojson.merge(topo, topo.objects.divisions.geometries));
      return { dist, divs, all }; })();
    return data;
  }
  async function mount() {
    stop(); const stage = $('#bdStage'), cv = $('#bdCv'); if (!stage) return;
    let D; try { D = await load(); } catch (e) { stage.querySelector('.globe-loading').textContent = 'The map could not load.'; return; }
    if (!document.body.contains(cv)) return; stage.querySelector('.globe-loading')?.remove();
    const ctx = cv.getContext('2d');
    let W, H, dpr, proj, path, k = 1, tx = 0, ty = 0, tilt = BDX.tilt ? .9 : 0, tiltT = tilt, sel = null, find = null, raf = 0, stopped = false, lift = {};
    const size = () => { const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      proj = d3.geoMercator().fitExtent([[W * .06, H * .05], [W * .94, H * .95]], D.all); path = d3.geoPath(proj, ctx); };
    size();
    const fillOf = f => BDX.mapMode === 'divisions' ? (f.v || bdDiv(f.d.div)).c : bdDiv(f.d.div).c;
    const shade = (hex, t) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t))); return `rgb(${c})`; };
    // view: zoom/pan, then the 3D tilt about the horizontal centre line
    const view = () => { const c = Math.cos(tiltT * 1.0); ctx.setTransform(k, 0, 0, k * c, tx + W / 2 * (1 - k), ty + H / 2 * (1 - k * c) + tiltT * H * .06); };
    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      const sea = ctx.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#CFE9F7'); sea.addColorStop(1, '#7FC2E6'); ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
      view();
      const feats = BDX.mapMode === 'divisions' ? D.divs : D.dist, depth = 10 * dpr / k * Math.sin(tiltT) * 2.2;
      // extrusion (3D): darker walls stacked under each tile; the selected one rises
      if (tiltT > .02) for (const f of feats) { const id = f.d ? f.d.id : f.v.id, up = (lift[id] || 0) * 18 * dpr / k;
        ctx.fillStyle = shade(fillOf(f), -.45); for (let s = depth + up; s > 0; s -= Math.max(1, depth / 6)) { ctx.save(); ctx.translate(0, s - up); ctx.beginPath(); path(f); ctx.fill(); ctx.restore(); } }
      for (const f of feats) { const id = f.d ? f.d.id : f.v.id, isSel = sel === id, isFind = find && find.show && find.ans === id, up = (lift[id] || 0) * 18 * dpr / k;
        ctx.save(); if (up) ctx.translate(0, -up);
        ctx.beginPath(); path(f); ctx.fillStyle = isSel ? '#FFE27A' : isFind ? '#FF7A59' : shade(fillOf(f), BDX.mapMode === 'divisions' ? .05 : ((+id * 37) % 7 - 3) * .06); ctx.fill();
        ctx.strokeStyle = isSel ? '#8A5A00' : 'rgba(255,255,255,.9)'; ctx.lineWidth = (isSel ? 2.2 : .9) * dpr / k; ctx.stroke(); ctx.restore(); }
      if (BDX.mapMode === 'districts') { ctx.strokeStyle = 'rgba(40,40,40,.55)'; ctx.lineWidth = 1.6 * dpr / k; for (const f of D.divs) { ctx.beginPath(); path(f); ctx.stroke(); } }
      // labels in screen space so they stay upright and readable
      ctx.setTransform(1, 0, 0, 1, 0, 0); const c = Math.cos(tiltT), fs = Math.round((BDX.mapMode === 'divisions' ? 15 : 10.5) * dpr * Math.min(1.6, Math.max(1, k * .8)));
      ctx.font = `800 ${fs}px "Outfit","Hind Siliguri",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const boxes = [];
      const toScreen = ([x, y]) => [x * k + tx + W / 2 * (1 - k), y * k * c + ty + H / 2 * (1 - k * c) + tiltT * H * .06];
      for (const f of feats.slice().sort((a, b) => (sel === (b.d ? b.d.id : b.v.id)) - (sel === (a.d ? a.d.id : a.v.id)))) { const o = f.d || f.v, id = o.id, up = (lift[id] || 0) * 18 * dpr, p = toScreen(proj(f.cen)); p[1] -= up;
        const txt = BDX.lang === 'en' ? o.en : o.bn, w = ctx.measureText(txt).width + 6 * dpr, h = fs + 4 * dpr;
        if (boxes.some(b => Math.abs(b[0] - p[0]) < (b[2] + w) / 2 && Math.abs(b[1] - p[1]) < h)) continue; boxes.push([p[0], p[1], w]);
        ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.strokeText(txt, p[0], p[1]); ctx.fillStyle = sel === id ? '#8A3A00' : '#1E2A44'; ctx.fillText(txt, p[0], p[1]); }
      // compass and the Bay of Bengal
      ctx.fillStyle = 'rgba(30,80,120,.6)'; ctx.font = `italic 700 ${Math.round(12 * dpr)}px "Outfit",sans-serif`; ctx.fillText(BDX.lang === 'en' ? 'Bay of Bengal' : 'বঙ্গোপসাগর', W * .5, H * .93);
      ctx.fillText('N ↑', W * .93, H * .06);
    }
    function loop(now) { if (stopped) return; raf = requestAnimationFrame(loop);
      tiltT += ((BDX.tilt ? .9 : 0) - tiltT) * .12; for (const id in lift) { lift[id] += ((id === sel ? 1 : 0) - lift[id]) * .18; if (lift[id] < .01 && id !== sel) delete lift[id]; }
      draw(now / 1000); }
    const pickAt = (sx, sy) => { const c = Math.cos(tiltT); const x = (sx - tx - W / 2 * (1 - k)) / k, y = (sy - ty - H / 2 * (1 - k * c) - tiltT * H * .06) / (k * c);
      const ll = proj.invert([x, y]); if (!ll) return null; const feats = BDX.mapMode === 'divisions' ? D.divs : D.dist; const f = feats.find(f => d3.geoContains(f, ll)); return f ? (f.d || f.v).id : null; };
    const info = id => { const el = $('#bdInfo'); if (!el) return;
      if (BDX.mapMode === 'divisions') { const v = bdDiv(id), ds = BD_DISTRICTS.filter(d => d.div === id); el.innerHTML = `<div class="bdinfo" style="--dc:${v.c}"><b>${esc(v.en)} Division · <span class="bn">${esc(v.bn)} বিভাগ</span></b><small>${esc(v.note[0])} · <span class="bn">${esc(v.note[1])}</span></small><div class="bdchips">${ds.map(d => `<span class="bdchip">${esc(d.en)} · <span class="bn">${esc(d.bn)}</span></span>`).join('')}</div></div>`;
        Voice.say('BD:v:' + id, [[`${v.en} division has ${ds.length} districts.`, 'en-US', .88], [`${v.bn} বিভাগে ${bnNum(ds.length)}টি জেলা।`, 'bn-BD', .88]]); return; }
      const d = bdDist(id), v = bdDiv(d.div); el.innerHTML = `<div class="bdinfo" style="--dc:${v.c}"><b>${esc(d.en)} · <span class="bn">${esc(d.bn)}</span></b><span class="bddot">${esc(v.en)} Division · <span class="bn">${esc(v.bn)} বিভাগ</span></span><small>⭐ ${esc(d.fact)}</small><small class="bn">⭐ ${esc(d.factBn)}</small></div>`; bdSayDist(d); };
    const onTap = id => { if (!id) return; sel = id; Kid.tap('bangladesh');
      if (find) { const want = find.ans; if (id === want) { info(id); $('#bdInfo').insertAdjacentHTML('afterbegin', `<p class="gfind ok">🎉 You found it! · <span class="bn">পেয়েছ!</span></p>`); Kid.reward($('#bdInfo')); find = null; }
        else { find.tries++; const w = bdDist(want); $('#bdInfo').innerHTML = `<p class="gfind">That is ${esc(bdDist(id).en)}. Find ${esc(w.en)} · <span class="bn">এটা ${esc(bdDist(id).bn)}। ${esc(w.bn)} খোঁজো</span></p>`; if (find.tries >= 2) find.show = true; } }
      else info(id); };
    // pointer: drag to pan, pinch / wheel to zoom, tap to pick
    const pts = new Map(); let start = null, pinch0 = null;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.offsetX * dpr, e.offsetY * dpr]); start = { x: e.offsetX * dpr, y: e.offsetY * dpr, t: performance.now(), moved: 0 };
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k }; } });
    cv.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId), cur = [e.offsetX * dpr, e.offsetY * dpr]; pts.set(e.pointerId, cur);
      if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; k = Math.max(1, Math.min(6, pinch0.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0.d)); if (start) start.moved = 99; return; }
      if (k > 1.01) { tx += cur[0] - prev[0]; ty += cur[1] - prev[1]; } if (start) start.moved += Math.abs(cur[0] - prev[0]) + Math.abs(cur[1] - prev[1]); });
    const up = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; if (pts.size) return;
      if (k <= 1.01) { tx = 0; ty = 0; } if (start && start.moved < 8 * dpr && performance.now() - start.t < 450) onTap(pickAt(start.x, start.y)); start = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); k = Math.max(1, Math.min(6, k * Math.exp(-e.deltaY * .0015))); if (k <= 1.01) { tx = 0; ty = 0; } }, { passive: false });
    const onResize = () => size(); addEventListener('resize', onResize);
    if (BDX.focusDiv) { const id = BDX.focusDiv; BDX.focusDiv = null; sel = id; setTimeout(() => info(id), 50); }
    raf = requestAnimationFrame(loop);
    inst = { stop() { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', onResize); }, onTap, pickAt,
      find() { BDX.mapMode = 'districts'; const d = BD_DISTRICTS[Math.floor(Math.random() * 64)]; find = { ans: d.id, tries: 0, show: false }; sel = null;
        $('#bdInfo').innerHTML = `<p class="gfind ask">🎯 Find <b>${esc(d.en)}</b> · <span class="bn"><b>${esc(d.bn)}</b> খুঁজে বের করো</span></p>`; Voice.say('BD:f:' + d.id, [[`Can you find ${d.en}?`, 'en-US', .88], [`${d.bn} কোথায়?`, 'bn-BD', .88]]); } };
  }
  function stop() { if (inst) { inst.stop(); inst = null; } }
  return { mount, stop, get: () => inst, load };
})();
ACT.bdMapMode = el => { Sfx.tap(); BDX.mapMode = el.dataset.v; route(); };
ACT.bd3d = () => { Sfx.tap(); BDX.tilt = BDX.tilt ? 0 : 1; const b = $('[data-act=bd3d]'); if (b) b.textContent = BDX.tilt ? '🗺️ 2D' : '🧊 3D'; };
ACT.bdLang = el => { BDX.lang = BDX.lang === 'en' ? 'bn' : 'en'; el.textContent = BDX.lang === 'en' ? 'বাংলা' : 'English'; Sfx.tap(); };
ACT.bdFind = () => { Sfx.tap(); if (BDX.mapMode !== 'districts') { BDX.mapMode = 'districts'; route(); setTimeout(() => BdMap.get()?.find(), 400); } else BdMap.get()?.find(); };
