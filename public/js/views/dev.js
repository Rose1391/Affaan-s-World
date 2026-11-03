/* ============ DEVELOPMENT: milestones · growth · words & skills · journal ============ */
let devTag = 'all';
Views.dev = async ([tab = 'milestones', arg]) => {
  const t = [['milestones', 'Milestones', 'মাইলফলক'], ['growth', 'Growth', 'বৃদ্ধি'], ['words', 'Words & skills', 'শব্দ ও দক্ষতা'], ['journal', 'Journal', 'জার্নাল']];
  let body = '';
  if (tab === 'growth') body = await growthHTML();
  else if (tab === 'words') body = await wordsHTML();
  else if (tab === 'journal') body = await journalHTML();
  else body = await milestonesHTML(arg);
  return `${pageHead('Development', 'বিকাশ', `${esc(Child.first())} is ${ageText(ageOn(Child.birth))}`)}
   <div class="pad">${tabs(t, tab, 'devTab')}${body}</div>`;
};
ACT.devTab = el => go('dev/' + el.dataset.v);

/* ---------- milestones (CDC) ---------- */
function currentBandId() {
  const age = ageOn(Child.birth).months;
  return (CDC_BANDS.find(b => b.months >= age) || CDC_BANDS[CDC_BANDS.length - 1]).id;
}
async function milestonesHTML(bandId) {
  const ms = await milestoneState(); const age = ageOn(Child.birth).months;
  const band = CDC_BANDS.find(b => b.id === bandId) || CDC_BANDS.find(b => b.id === currentBandId());
  const media = await DB.list('media');
  const items = band.items.filter(i => devTag === 'all' || i.tag === devTag);
  const done = band.items.filter(i => ms[i.id]?.achieved).length;
  const past = band.months < age;
  return `
  <div class="bandbar">${CDC_BANDS.map(b => { const d = b.items.filter(i => ms[i.id]?.achieved).length;
    return `<button class="band ${b.id === band.id ? 'on' : ''}" data-act="go" data-to="dev/milestones/${b.id}"><b>${b.en}</b><span class="bn">${b.bn}</span><i class="bmeter"><i style="width:${d / b.items.length * 100}%"></i></i><small>${d}/${b.items.length}</small></button>`; }).join('')}</div>
  <div class="chips filt">${[['all', 'All', 'সব']].concat(Object.entries(DEV_TAGS).map(([k, v]) => [k, v.en, v.bn])).map(([k, en, bn]) =>
    `<button class="chip ${devTag === k ? 'on' : ''}" data-act="devTagSet" data-v="${k}" ${k !== 'all' ? `style="--c:${DEV_TAGS[k].color}"` : ''}>${k !== 'all' ? '<i class="tagdot"></i>' : ''}${en} <span class="bn">${bn}</span></button>`).join('')}</div>
  <div class="toolbar"><p class="muted sm" style="margin:0">Most children do these <b>by ${band.en}</b>. ${done} of ${band.items.length} recorded.${past && done < band.items.length ? ' <span class="warn">Some not yet recorded.</span>' : ''}</p>
    <div class="vtoggle"><button class="${msView === 'path' ? 'on' : ''}" data-act="msView" data-v="path">🪨 Path</button><button class="${msView === 'list' ? 'on' : ''}" data-act="msView" data-v="list">☰ List</button></div></div>
  ${msView === 'path' ? stonePath(band, items, ms) : '<div class="mlist">'}${(msView === 'path' ? [] : items).map(i => { const r = ms[i.id]; const photos = [...(r?.photoIds || []), ...media.filter(m => m.milestoneId === i.id).map(m => m.photoId)];
    return `<button class="mitem ${r?.achieved ? 'done' : ''}" data-act="milestone" data-id="${i.id}">
      <span class="mcheck">${icon('check')}</span>
      <span class="mtxt"><span class="en">${esc(i.en)}</span><span class="bn">${esc(i.bn)}</span>
        <span class="meta"><i class="tagdot" style="background:${DEV_TAGS[i.tag].color}"></i>${DEV_TAGS[i.tag].en}${r?.achieved ? ` · <b>${fmtDate(r.achieved)}</b> (${ageShort(Child.birth, r.achieved)})` : ''}${r?.note ? ' · ' + esc(r.note.slice(0, 50)) : ''}</span></span>
      ${photos.length ? `<span class="mph">${Media.img(photos[0])}</span>` : ''}</button>`; }).join('')}${msView === 'list' ? '</div>' : ''}
  <div class="callout"><b>Act early · <span class="bn">দেরি করবেন না</span></b><p>If ${esc(Child.first())} isn't meeting milestones, loses skills he once had, or you're worried, talk with the paediatrician. Don't wait. These checklists are not a substitute for a developmental screening.</p>
  <p class="bn sm">মাইলফলক দেরিতে হলে, আগের দক্ষতা হারালে বা চিন্তা হলে শিশু বিশেষজ্ঞের সাথে কথা বলুন। অপেক্ষা করবেন না।</p><p class="muted sm">Source: CDC “Learn the Signs. Act Early.”</p></div>`;
}
ACT.devTagSet = el => { devTag = el.dataset.v; route(); };
let msView = 'path';
ACT.msView = el => { msView = el.dataset.v; route(); };
// stepping stones across the river: each milestone a stone; reached stones bloom in their domain colour
function stonePath(band, items, ms) {
  const lastDone = items.filter(i => ms[i.id]?.achieved).sort((a, b) => ms[a.id].achieved.localeCompare(ms[b.id].achieved)).pop();
  return `<div class="spath"><div class="river-bg"></div>
    <div class="sp-head"><span>🏝️</span><b>${band.en}</b><span class="bn">${band.bn}</span></div>
    ${items.map((it, i) => { const r = ms[it.id], x = 50 + Math.sin(i * 0.85) * 26, left = x > 50, c = DEV_TAGS[it.tag].color;
      return `<div class="sp-row" style="--x:${x.toFixed(1)}%"><button class="stone ${r?.achieved ? 'bloom' : ''}" style="--c:${c}" data-act="milestone" data-id="${it.id}" aria-label="${esc(it.en)}">
          ${r?.achieved ? `<svg viewBox="-12 -12 24 24" class="st-fl">${Array.from({ length: 5 }, (_, k) => `<ellipse cx="0" cy="-6" rx="4" ry="6" transform="rotate(${k * 72})" fill="${c}"/>`).join('')}<circle r="3.2" fill="#FFE27A"/></svg>` : `<i class="st-dot" style="background:${c}"></i>`}
          ${lastDone && lastDone.id === it.id ? `<span class="st-doel">${doelSVG()}</span>` : ''}</button>
        <span class="sp-lab ${left ? 'l' : 'r'}"><b>${esc(it.en.split(/,| like /)[0])}</b><small>${r?.achieved ? '✓ ' + fmtDate(r.achieved) : DEV_TAGS[it.tag].en}</small></span></div>`; }).join('')}
    <div class="sp-head end"><span>🌳</span><b>${(CDC_BANDS[CDC_BANDS.indexOf(band) + 1] || { en: 'School!' }).en}</b><span class="bn">পরের ধাপ</span></div></div>`;
}
ACT.milestone = async el => milestoneSheet(el.dataset.id);
async function milestoneSheet(id) {
  const it = CDC_BY_ID[id], r = await DB.data('ms:' + id) || {};
  Sheet.open({
    title: `<span class="tagdot" style="background:${DEV_TAGS[it.tag].color}"></span> ${DEV_TAGS[it.tag].en} · <span class="bn">${DEV_TAGS[it.tag].bn}</span>`,
    body: `<p class="qtext">${esc(it.en)}</p><p class="qtext bn">${esc(it.bn)}</p>
      <label class="switch"><input type="checkbox" name="ach" ${r.achieved || !Object.keys(r).length ? "checked" : ""}><span></span> Achieved · <span class="bn">অর্জিত</span></label>
      ${F.date('achieved', 'Date achieved', 'তারিখ', r.achieved || todayISO())}
      ${F.area('note', 'Note', 'নোট', r.note || '', 'rows="2" placeholder="How it happened…"')}
      ${F.photos(r.photoIds || [], 'Photo', 'ছবি', 'image/*,video/*')}`,
    save: async (fd, f) => {
      const ach = !!fd.get('ach'); const photoIds = await formPhotos(f);
      if (!ach && !val(fd, 'note') && !photoIds.length) { if (r.achieved || r.note) await DB.del('ms:' + id); return; }
      await DB.put('milestone', { band: it.band, achieved: ach ? val(fd, 'achieved') || todayISO() : '', note: val(fd, 'note'), photoIds }, 'ms:' + id);
    }
  });
}
ACT.pickMilestone = async () => {
  const ms = await milestoneState(), cur = currentBandId();
  const bands = CDC_BANDS.filter(b => b.months <= CDC_BANDS.find(x => x.id === cur).months + 12);
  Sheet.open({
    title: 'Which milestone? · <span class="bn">কোন মাইলফলক?</span>',
    body: bands.map(b => `<h4 class="subh">${b.en} <span class="bn">${b.bn}</span></h4>${b.items.filter(i => !ms[i.id]?.achieved).map(i => `<button type="button" class="pickrow" data-act="pickMs" data-id="${i.id}"><i class="tagdot" style="background:${DEV_TAGS[i.tag].color}"></i>${esc(i.en)}</button>`).join('') || '<p class="muted sm">All recorded ✓</p>'}`).join('')
  });
};
ACT.pickMs = el => { Sheet.close(); milestoneSheet(el.dataset.id); };

/* ---------- growth log + charts ---------- */
async function growthHTML() {
  const g = (await DB.list('growth')).sort((a, b) => a.date.localeCompare(b.date));
  const chart = (key, label, bn, unit) => {
    const pts = g.filter(x => x[key] != null && x[key] !== '').map(x => [ageMonthsFloat(Child.birth, x.date), Number(x[key])]);
    const last = pts[pts.length - 1], z = last ? WHO.z(key, last[0], last[1]) : null;
    return `<div class="chart"><div class="chart-h"><b>${label}</b> <span class="bn">${bn}</span>${last && z != null ? `<span class="pctl ${Math.abs(z) > 2 ? 'warn' : ''}">${last[1]} ${unit} · <b>${WHO.ordinalPct(z)}</b> percentile</span>` : ''}</div>${whoChart(pts, key, unit)}</div>`;
  };
  return `
  <form class="quickrow" data-form="growth">
    ${F.date('date', 'Date', 'তারিখ')}${F.num('weight', 'Weight', 'ওজন', '', 'kg', 'min="1" max="60"')}${F.num('height', 'Height', 'উচ্চতা', '', 'cm', 'min="30" max="160"')}${F.num('head', 'Head', 'মাথা', '', 'cm', 'min="25" max="65"')}
    <button type="button" class="btn primary" data-act="growthQuick">Add</button>
  </form>
  ${doorFrame(g)}
  ${chart('weight', 'Weight', 'ওজন', 'kg')}
  ${chart('height', 'Height / length', 'উচ্চতা', 'cm')}
  ${chart('head', 'Head circumference', 'মাথার পরিধি', 'cm')}
  <p class="muted sm">Shaded bands: WHO Child Growth Standards for boys — outer band 3rd–97th percentile, inner band 15th–85th, line = median. A reading outside the bands, or a line that crosses bands, is worth showing the paediatrician.</p>
  ${g.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Age</th><th>Weight</th><th>Height</th><th>Head</th></tr></thead><tbody>
    ${g.slice().reverse().map(x => `<tr data-act="growthEdit" data-id="${x.id}"><td>${fmtDate(x.date)}</td><td>${ageShort(Child.birth, x.date)}</td><td>${x.weight ?? '—'}</td><td>${x.height ?? '—'}</td><td>${x.head ?? '—'}</td></tr>`).join('')}</tbody></table>` : empty('No measurements yet — add the first one above.', 'প্রথম মাপ যোগ করুন')}`;
}
// the door-frame: pencil marks for every height, his silhouette at real scale beside familiar things
function doorFrame(g) {
  const hs = g.filter(x => x.height != null), last = hs[hs.length - 1], H = 130, sc = 2.1, base = 290, y = cm => (base - cm * sc).toFixed(1);
  const kid = last ? last.height : 0;
  let s = `<svg viewBox="0 0 340 300" class="door" role="img" aria-label="Height door-frame"><rect x="0" y="0" width="340" height="300" rx="14" class="door-bg"/>`;
  s += `<rect x="40" y="${y(H)}" width="26" height="${H * sc}" rx="3" class="door-post"/>`;
  for (let cm = 10; cm <= H; cm += 10) s += `<path d="M40 ${y(cm)} h${cm % 50 ? 8 : 14}" class="door-tick"/><text x="34" y="${+y(cm) + 3}" class="door-num" text-anchor="end">${cm}</text>`;
  hs.forEach((m, i) => { const top = i === hs.length - 1; s += `<path d="M36 ${y(m.height)} h34" class="door-mark ${top ? 'top' : ''}"/>`;
    if (top || (hs.length - 1 - i) % 2 === 0) s += `<text x="74" y="${+y(m.height) + 3}" class="door-lab ${top ? 'top' : ''}">${m.height} · ${fmtDate(m.date).replace(/ \d{4}$/, '')}</text>`; });
  s += `<g class="door-ref"><path d="M215 ${y(45)} h40 M219 ${y(45)} v${45 * sc} M251 ${y(45)} v${45 * sc} M251 ${y(85)} v${40 * sc}"/><text x="235" y="${+y(85) - 4}" text-anchor="middle">chair</text>
    <path d="M270 ${y(75)} h62 M276 ${y(75)} v${75 * sc} M326 ${y(75)} v${75 * sc}"/><text x="301" y="${+y(75) - 4}" text-anchor="middle">table</text>
    <circle cx="322" cy="${y(100)}" r="4"/><text x="314" y="${+y(100) + 3}" text-anchor="end">door handle</text></g>`;
  if (kid) { const h = kid * sc, x = 160;
    s += `<g class="door-kid" transform="translate(${x} ${(base - h).toFixed(1)}) scale(${(h / 200).toFixed(3)})"><circle cx="0" cy="22" r="22"/><path d="M-26 50 Q0 38 26 50 L30 120 L18 122 L16 196 L3 198 L0 130 L-3 198 L-16 196 L-18 122 L-30 120Z"/></g>`;
    s += `<text x="${x}" y="${(base - h - 8).toFixed(1)}" text-anchor="middle" class="door-lab top">${esc(Child.first())} · ${kid} cm</text>`; }
  else s += `<text x="170" y="150" text-anchor="middle" class="door-num">Add his height to see him here</text>`;
  return `<div class="chart doorwrap"><div class="chart-h"><b>The door-frame</b> <span class="bn">দরজার দাগ</span><span class="muted"> · every height, pencilled in</span></div>${s}</svg></div>`;
}
// WHO percentile chart: bands P3–P97 and P15–P85, the median, and his own points
function whoChart(pts, key, unit) {
  const W = 340, Hh = 180, L = 34, Rr = 10, T = 10, B = 24, age = ageMonthsFloat(Child.birth, todayISO());
  let x1 = Math.min(60, Math.ceil(Math.max(age + 4, ...pts.map(p => p[0])))), x0 = Math.max(0, Math.floor(Math.min(age - 9, ...pts.map(p => p[0]))));
  if (x1 - x0 < 8) x0 = Math.max(0, x1 - 8);
  const xsArr = []; for (let m = x0; m <= x1 + 1e-9; m += 0.5) xsArr.push(m);
  const band = z => xsArr.map(m => [m, WHO.at(key, m, z)]);
  const p3 = band(-1.881), p97 = band(1.881), p15 = band(-1.036), p85 = band(1.036), p50 = band(0);
  const ys = [...p3, ...p97].map(p => p[1]).concat(pts.filter(p => p[0] >= x0).map(p => p[1]));
  const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  const sx = x => L + (x - x0) / (x1 - x0) * (W - L - Rr), sy = y => T + (1 - (y - y0) / (y1 - y0)) * (Hh - T - B);
  const pt = p => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`;
  const area = (lo, hi) => 'M' + lo.map(pt).join(' L') + ' L' + [...hi].reverse().map(pt).join(' L') + 'Z';
  const step = (y1 - y0) > 24 ? 10 : (y1 - y0) > 10 ? 2 : 1, xs = (x1 - x0) > 24 ? 6 : 3;
  let grid = '';
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) grid += `<line x1="${L}" x2="${W - Rr}" y1="${sy(y).toFixed(1)}" y2="${sy(y).toFixed(1)}" class="gl"/><text x="${L - 5}" y="${(sy(y) + 3).toFixed(1)}" class="ax" text-anchor="end">${y}</text>`;
  for (let x = Math.ceil(x0 / xs) * xs; x <= x1; x += xs) grid += `<text x="${sx(x).toFixed(1)}" y="${Hh - 6}" class="ax" text-anchor="middle">${x % 12 === 0 ? x / 12 + 'y' : x + 'm'}</text>`;
  const vis = pts.filter(p => p[0] >= x0 - 0.01);
  const line = vis.length > 1 ? `<polyline class="ln" points="${vis.map(pt).join(' ')}"/>` : '';
  const dots = vis.map(p => `<circle class="dt" cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="3.6"><title>${p[1]} ${unit} at ${p[0].toFixed(1)} months · ${WHO.ordinalPct(WHO.z(key, p[0], p[1]))} percentile</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${Hh}" class="lchart" role="img" aria-label="${key} chart with WHO percentiles">${grid}
    <path d="${area(p3, p97)}" class="wb1"/><path d="${area(p15, p85)}" class="wb2"/><polyline points="${p50.map(pt).join(' ')}" class="ref"/>
    <text x="${W - Rr - 2}" y="${(sy(p97[p97.length - 1][1]) - 3).toFixed(1)}" class="ax" text-anchor="end">97th</text><text x="${W - Rr - 2}" y="${(sy(p3[p3.length - 1][1]) + 10).toFixed(1)}" class="ax" text-anchor="end">3rd</text>
    <line x1="${sx(Math.min(age, x1)).toFixed(1)}" x2="${sx(Math.min(age, x1)).toFixed(1)}" y1="${T}" y2="${Hh - B}" class="now"/>${line}${dots}</svg>`;
}
/* WHO LMS maths: X = M(1+LSz)^(1/L);  z = ((X/M)^L − 1)/(LS);  percentile = Φ(z) */
const WHO = {
  lms(key, m) { const t = WHO_LMS[key]; m = Math.max(0, Math.min(60, m)); const i = Math.floor(m), f = m - i, a = t[i], b = t[Math.min(60, i + 1)]; return a.map((v, k) => v + (b[k] - v) * f); },
  at(key, m, z) { const [L, M, S] = WHO.lms(key, m); return L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L); },
  z(key, m, x) { if (m > 60 || !x) return null; const [L, M, S] = WHO.lms(key, m); return L === 0 ? Math.log(x / M) / S : (Math.pow(x / M, L) - 1) / (L * S); },
  pct(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2); let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; },
  ordinalPct(z) { if (z == null) return '—'; const p = Math.round(WHO.pct(z) * 100), v = Math.max(1, Math.min(99, p)), s = ['th', 'st', 'nd', 'rd'], r = v % 100; return v + (s[(r - 20) % 10] || s[r] || s[0]); }
};
ACT.growthQuick = async b => {
  const fd = new FormData(b.closest('form'));
  const rec = { date: val(fd, 'date') || todayISO(), weight: numv(fd, 'weight'), height: numv(fd, 'height'), head: numv(fd, 'head') };
  if (rec.weight == null && rec.height == null && rec.head == null) return toast('Enter at least one measurement', 'err');
  await DB.put('growth', rec); toast('Saved · সংরক্ষিত'); route();
};
ACT.addGrowth = (el, e, r = {}) => Sheet.open({
  title: 'Growth · <span class="bn">বৃদ্ধি</span>',
  body: `${F.date('date', 'Date', 'তারিখ', r.date)}${F.row(F.num('weight', 'Weight', 'ওজন', r.weight, 'kg'), F.num('height', 'Height', 'উচ্চতা', r.height, 'cm'), F.num('head', 'Head', 'মাথা', r.head, 'cm'))}${F.text('note', 'Note', 'নোট', r.note || '', 'placeholder="e.g. measured at clinic"')}`,
  save: async fd => { const rec = { date: val(fd, 'date') || todayISO(), weight: numv(fd, 'weight'), height: numv(fd, 'height'), head: numv(fd, 'head'), note: val(fd, 'note') };
    if (rec.weight == null && rec.height == null && rec.head == null) throw new Error('Enter at least one measurement'); await DB.put('growth', rec, r.id); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.growthEdit = async el => { const r = await DB.data(el.dataset.id); ACT.addGrowth(null, null, { ...r, id: el.dataset.id }); };

/* ---------- first words & skills ---------- */
let wordFilter = 'all';
async function wordsHTML() {
  const all = (await DB.list('word')).sort((a, b) => b.date.localeCompare(a.date) || b._u.localeCompare(a._u));
  const list = all.filter(w => wordFilter === 'all' || (wordFilter === 'skill' ? w.type === 'skill' : w.type !== 'skill' && (wordFilter === 'word' || w.lang === wordFilter)));
  const byMonth = {}; list.forEach(w => (byMonth[w.date.slice(0, 7)] = byMonth[w.date.slice(0, 7)] || []).push(w));
  const nW = all.filter(w => w.type !== 'skill').length;
  return `
  <form class="quickrow words" data-form="word">
    ${F.text('word', 'New word or skill', 'নতুন শব্দ', '', 'placeholder="e.g. “ball”, “আম”, climbs stairs" required')}
    ${F.select('kind', 'Type', 'ধরন', [['word:en', 'Word · English'], ['word:bn', 'Word · বাংলা'], ['word:other', 'Word · other'], ['skill:', 'Skill · দক্ষতা']])}
    ${F.date('date', 'Date', 'তারিখ')}
    <button type="button" class="btn primary" data-act="wordQuick">Add</button>
  </form>
  <div class="stats3"><div><b>${nW}</b><span>words · <span class="bn">শব্দ</span></span></div><div><b>${all.filter(w => w.type !== 'skill' && w.lang === 'bn').length}</b><span>বাংলা</span></div><div><b>${all.filter(w => w.type === 'skill').length}</b><span>skills · <span class="bn">দক্ষতা</span></span></div></div>
  <div class="chips filt">${[['all', 'All'], ['word', 'Words'], ['en', 'English'], ['bn', 'বাংলা'], ['skill', 'Skills']].map(([k, l]) => `<button class="chip ${wordFilter === k ? 'on' : ''}" data-act="wordFilt" data-v="${k}">${l}</button>`).join('')}</div>
  ${Object.keys(byMonth).length ? Object.entries(byMonth).map(([m, ws]) => `<h4 class="subh">${fmtMonth(m)} <span class="bn">${fmtMonthBn(m)}</span> <span class="muted">(${ws.length})</span></h4>
    <div class="wordcloud">${ws.map(w => `${Voice.has('WD:' + w.word) ? `<button class="wplay" data-act="vPlay" data-key="WD:${esc(w.word)}" aria-label="Play his word">🔊</button>` : ''}<button class="wchip ${w.type === 'skill' ? 'skill' : ''} ${w.lang === 'bn' ? 'bn' : ''}" data-act="wordEdit" data-id="${w.id}" title="${fmtDate(w.date)}">${esc(w.word)}</button>`).join('')}</div>`).join('')
    : empty('Log his first words and new skills here — they become a lovely timeline.', 'তার প্রথম শব্দগুলো এখানে লিখে রাখুন')}`;
}
ACT.wordFilt = el => { wordFilter = el.dataset.v; route(); };
ACT.wordQuick = async b => {
  const f = b.closest('form'), fd = new FormData(f), w = val(fd, 'word'); if (!w) return f.querySelector('[name=word]').focus();
  const [type, lang] = val(fd, 'kind').split(':');
  await DB.put('word', { word: w, type, lang: lang || '', date: val(fd, 'date') || todayISO(), note: '' }); toast(`“${w}” saved`); route();
};
ACT.addWord = (el, e, r = {}) => Sheet.open({
  title: 'Word or skill · <span class="bn">শব্দ / দক্ষতা</span>',
  body: `${F.text('word', 'Word / skill', 'শব্দ', r.word || '')}${F.row(F.select('kind', 'Type', 'ধরন', [['word:en', 'Word · English'], ['word:bn', 'Word · বাংলা'], ['word:other', 'Word · other'], ['skill:', 'Skill']], r.type ? `${r.type}:${r.lang || ''}` : 'word:en'), F.date('date', 'Date', 'তারিখ', r.date))}${F.text('note', 'Note', 'নোট', r.note || '', 'placeholder="How he says it, context…"')}`,
  save: async fd => { if (!val(fd, 'word')) throw new Error('Type the word'); const [type, lang] = val(fd, 'kind').split(':'); await DB.put('word', { word: val(fd, 'word'), type, lang: lang || '', date: val(fd, 'date') || todayISO(), note: val(fd, 'note') }, r.id); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.wordEdit = async el => ACT.addWord(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });

/* ---------- journal (v4 Health & Milestones journal) ---------- */
let journalFilter = 'all';
async function journalHTML() {
  const list = (await DB.list('journal')).filter(j => journalFilter === 'all' || j.type === journalFilter).sort((a, b) => b.date.localeCompare(a.date));
  return `<button class="ghostadd" data-act="addJournal">+ Add a note or moment · <span class="bn">নোট যোগ করুন</span></button>
  <div class="chips filt"><button class="chip ${journalFilter === 'all' ? 'on' : ''}" data-act="jFilt" data-v="all">All</button>${Object.entries(HEALTH_TAGS).map(([k, t]) => `<button class="chip ${journalFilter === k ? 'on' : ''}" data-act="jFilt" data-v="${esc(k)}" style="--c:${t.color}">${t.emoji} ${esc(k)}</button>`).join('')}</div>
  ${list.length ? list.map(j => { const t = HEALTH_TAGS[j.type] || { color: '#888', emoji: '•', labelBn: '' };
    return `<button class="entry" data-act="jEdit" data-id="${j.id}" style="--c:${t.color}"><span class="etop"><span class="etype">${t.emoji} ${esc(j.type)} <span class="bn">${t.labelBn}</span></span><span class="muted">${fmtDate(j.date)}</span></span>
      <b>${esc(j.title)}</b>${j.note ? `<span class="enote">${esc(j.note)}</span>` : ''}${(j.photoIds || []).length ? `<span class="ephotos">${j.photoIds.slice(0, 4).map(p => Media.img(p)).join('')}</span>` : ''}</button>`; }).join('')
    : empty('Record health notes, achievements and life moments — a keepsake timeline.', 'স্মরণীয় মুহূর্তগুলো লিখে রাখুন')}`;
}
ACT.jFilt = el => { journalFilter = el.dataset.v; route(); };
ACT.addJournal = (el, e, r = {}) => Sheet.open({
  title: 'Journal · <span class="bn">জার্নাল</span>',
  body: `${F.row(F.select('type', 'Type', 'ধরন', Object.keys(HEALTH_TAGS).map(k => [k, `${HEALTH_TAGS[k].emoji} ${k} · ${HEALTH_TAGS[k].labelBn}`]), r.type || 'Life moment'), F.date('date', 'Date', 'তারিখ', r.date))}
    ${F.text('title', 'Title', 'শিরোনাম', r.title || '', 'placeholder="e.g. First haircut"')}${F.area('note', 'Details', 'বিস্তারিত', r.note || '')}${F.photos(r.photoIds || [])}`,
  save: async (fd, f) => { if (!val(fd, 'title')) throw new Error('Add a title'); await DB.put('journal', { type: val(fd, 'type'), date: val(fd, 'date') || todayISO(), title: val(fd, 'title'), note: val(fd, 'note'), photoIds: await formPhotos(f) }, r.id); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.jEdit = async el => ACT.addJournal(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });
