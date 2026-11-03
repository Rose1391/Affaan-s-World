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
  <p class="muted sm">Most children do these <b>by ${band.en}</b>. ${done} of ${band.items.length} recorded.${past && done < band.items.length ? ' <span class="warn">Some not yet recorded for an age he has passed.</span>' : ''}</p>
  <div class="mlist">${items.map(i => { const r = ms[i.id]; const photos = [...(r?.photoIds || []), ...media.filter(m => m.milestoneId === i.id).map(m => m.photoId)];
    return `<button class="mitem ${r?.achieved ? 'done' : ''}" data-act="milestone" data-id="${i.id}">
      <span class="mcheck">${icon('check')}</span>
      <span class="mtxt"><span class="en">${esc(i.en)}</span><span class="bn">${esc(i.bn)}</span>
        <span class="meta"><i class="tagdot" style="background:${DEV_TAGS[i.tag].color}"></i>${DEV_TAGS[i.tag].en}${r?.achieved ? ` · <b>${fmtDate(r.achieved)}</b> (${ageShort(Child.birth, r.achieved)})` : ''}${r?.note ? ' · ' + esc(r.note.slice(0, 50)) : ''}</span></span>
      ${photos.length ? `<span class="mph">${Media.img(photos[0])}</span>` : ''}</button>`; }).join('')}</div>
  <div class="callout"><b>Act early · <span class="bn">দেরি করবেন না</span></b><p>If ${esc(Child.first())} isn't meeting milestones, loses skills he once had, or you're worried, talk with the paediatrician. Don't wait. These checklists are not a substitute for a developmental screening.</p>
  <p class="bn sm">মাইলফলক দেরিতে হলে, আগের দক্ষতা হারালে বা চিন্তা হলে শিশু বিশেষজ্ঞের সাথে কথা বলুন। অপেক্ষা করবেন না।</p><p class="muted sm">Source: CDC “Learn the Signs. Act Early.”</p></div>`;
}
ACT.devTagSet = el => { devTag = el.dataset.v; route(); };
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
    body: bands.map(b => `<h4 class="subh">${b.en} · <span class="bn">${b.bn}</span></h4>${b.items.filter(i => !ms[i.id]?.achieved).map(i => `<button type="button" class="pickrow" data-act="pickMs" data-id="${i.id}"><i class="tagdot" style="background:${DEV_TAGS[i.tag].color}"></i>${esc(i.en)}</button>`).join('') || '<p class="muted sm">All recorded ✓</p>'}`).join('')
  });
};
ACT.pickMs = el => { Sheet.close(); milestoneSheet(el.dataset.id); };

/* ---------- growth log + charts ---------- */
async function growthHTML() {
  const g = (await DB.list('growth')).sort((a, b) => a.date.localeCompare(b.date));
  const chart = (key, label, bn, unit, who) => {
    const pts = g.filter(x => x[key] != null && x[key] !== '').map(x => [ageMonthsFloat(Child.birth, x.date), Number(x[key])]);
    return `<div class="chart"><div class="chart-h"><b>${label}</b> <span class="bn">${bn}</span>${pts.length ? `<span class="muted"> · latest ${pts[pts.length - 1][1]} ${unit}</span>` : ''}</div>${lineChart(pts, who, unit)}</div>`;
  };
  return `
  <form class="quickrow" data-form="growth">
    ${F.date('date', 'Date', 'তারিখ')}${F.num('weight', 'Weight', 'ওজন', '', 'kg', 'min="1" max="60"')}${F.num('height', 'Height', 'উচ্চতা', '', 'cm', 'min="30" max="160"')}${F.num('head', 'Head', 'মাথা', '', 'cm', 'min="25" max="65"')}
    <button type="button" class="btn primary" data-act="growthQuick">Add</button>
  </form>
  ${chart('weight', 'Weight', 'ওজন', 'kg', WHO_BOYS.weight)}
  ${chart('height', 'Height / length', 'উচ্চতা', 'cm', WHO_BOYS.height)}
  ${chart('head', 'Head circumference', 'মাথার পরিধি', 'cm', null)}
  <p class="muted sm">Dashed line: WHO median for boys (orientation only). Your paediatrician uses full percentile charts.</p>
  ${g.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Age</th><th>Weight</th><th>Height</th><th>Head</th></tr></thead><tbody>
    ${g.slice().reverse().map(x => `<tr data-act="growthEdit" data-id="${x.id}"><td>${fmtDate(x.date)}</td><td>${ageShort(Child.birth, x.date)}</td><td>${x.weight ?? '—'}</td><td>${x.height ?? '—'}</td><td>${x.head ?? '—'}</td></tr>`).join('')}</tbody></table>` : empty('No measurements yet — add the first one above.', 'প্রথম মাপ যোগ করুন')}`;
}
function lineChart(pts, who, unit) {
  const W = 340, H = 170, L = 34, R = 10, T = 10, B = 24;
  const age = ageMonthsFloat(Child.birth, todayISO());
  let x0 = Math.max(0, Math.floor(Math.min(age - 6, ...pts.map(p => p[0])))), x1 = Math.ceil(Math.max(age + 3, ...pts.map(p => p[0])));
  if (x1 - x0 < 6) x1 = x0 + 6;
  const ref = who ? who.filter(p => p[0] >= x0 - 3 && p[0] <= x1 + 3) : [];
  const ys = pts.map(p => p[1]).concat(ref.map(p => p[1]));
  if (!ys.length) return `<div class="chart-empty">No data yet</div>`;
  let y0 = Math.min(...ys), y1 = Math.max(...ys); const padY = Math.max(0.5, (y1 - y0) * 0.15); y0 = Math.floor(y0 - padY); y1 = Math.ceil(y1 + padY);
  const sx = x => L + (x - x0) / (x1 - x0) * (W - L - R), sy = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const step = (y1 - y0) > 20 ? 10 : (y1 - y0) > 8 ? 2 : 1, xs = (x1 - x0) > 24 ? 12 : (x1 - x0) > 10 ? 3 : 1;
  let grid = '';
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) grid += `<line x1="${L}" x2="${W - R}" y1="${sy(y)}" y2="${sy(y)}" class="gl"/><text x="${L - 5}" y="${sy(y) + 3}" class="ax" text-anchor="end">${y}</text>`;
  for (let x = Math.ceil(x0 / xs) * xs; x <= x1; x += xs) grid += `<text x="${sx(x)}" y="${H - 6}" class="ax" text-anchor="middle">${x % 12 === 0 ? x / 12 + 'y' : x + 'm'}</text>`;
  const clip = ref.filter(p => p[0] >= x0 && p[0] <= x1);
  const refPath = clip.length > 1 ? `<polyline class="ref" points="${clip.map(p => sx(p[0]) + ',' + sy(p[1])).join(' ')}"/>` : '';
  const line = pts.length > 1 ? `<polyline class="ln" points="${pts.map(p => sx(p[0]) + ',' + sy(p[1])).join(' ')}"/>` : '';
  const dots = pts.map(p => `<circle class="dt" cx="${sx(p[0])}" cy="${sy(p[1])}" r="3.5"><title>${p[1]} ${unit} at ${p[0].toFixed(1)} months</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="lchart" role="img" aria-label="growth chart">${grid}<line x1="${sx(age)}" x2="${sx(age)}" y1="${T}" y2="${H - B}" class="now"/>${refPath}${line}${dots}</svg>`;
}
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
  ${Object.keys(byMonth).length ? Object.entries(byMonth).map(([m, ws]) => `<h4 class="subh">${fmtMonth(m)} · <span class="bn">${fmtMonthBn(m)}</span> <span class="muted">(${ws.length})</span></h4>
    <div class="wordcloud">${ws.map(w => `<button class="wchip ${w.type === 'skill' ? 'skill' : ''} ${w.lang === 'bn' ? 'bn' : ''}" data-act="wordEdit" data-id="${w.id}" title="${fmtDate(w.date)}">${esc(w.word)}</button>`).join('')}</div>`).join('')
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
