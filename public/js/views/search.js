/* ============ SEARCH — one box for every record + quick actions (Ctrl/⌘+K or “/”) ============ */
const Search = (() => {
  let index = null;
  const ACTIONS = [
    ['Start a 10-minute play session', 'খেলা শুরু', '🎈', () => Kid.start(10)], ['Add a photo or video', 'ছবি যোগ', '📸', () => ACT.quickPhoto()],
    ['Add weight & height', 'ওজন ও উচ্চতা', '📏', () => ACT.addGrowth()], ['Log a new word', 'নতুন শব্দ', '💬', () => ACT.addWord()],
    ['Record a doctor visit', 'ডাক্তার', '🩺', () => ACT.addVisit()], ['Add a calendar event', 'ইভেন্ট', '📅', () => ACT.evAdd({ dataset: {} })],
    ['Paediatrician summary (print)', 'ডাক্তারের জন্য', '🖨️', () => go('reports/doctor')], ['Backup now', 'ব্যাকআপ', '💾', () => go('settings')],
    ['Vaccines', 'টিকা', '💉', () => go('health/vaccines')], ['Milestones', 'মাইলফলক', '⭐', () => go('dev/milestones')], ['Calendar', 'ক্যালেন্ডার', '📅', () => go('calendar')]
  ];
  async function build() {
    const L = [], push = (icon, title, sub, date, fn, text = '') => L.push({ icon, title, sub, date, fn, hay: (title + ' ' + sub + ' ' + text).toLowerCase() });
    const ms = await milestoneState();
    CDC_BANDS.forEach(b => b.items.forEach(i => push(ms[i.id]?.achieved ? '⭐' : '☆', i.en, `${b.en} · ${DEV_TAGS[i.tag].en}${ms[i.id]?.achieved ? ' · ✓ ' + fmtDate(ms[i.id].achieved) : ''}`, ms[i.id]?.achieved || '', () => go('dev/milestones/' + b.id), i.bn)));
    for (const w of await DB.list('word')) push('💬', w.word, `${w.type === 'skill' ? 'Skill' : 'Word'} · ${fmtDate(w.date)}`, w.date, () => go('dev/words'), w.note || '');
    for (const v of await DB.list('visit')) push('🩺', v.reason || 'Doctor visit', `${v.doctor || ''} · ${fmtDate(v.date)}`, v.date, () => go('health/visits'), [v.diagnosis, v.notes].join(' '));
    for (const d of await DB.list('document')) push('💊', d.title || 'Prescription', `${fmtDate(d.date)}${d.medicines ? ' · ' + d.medicines : ''}`, d.date, () => go('health/docs'), d.notes || '');
    for (const i of await DB.list('illness')) push('🤒', i.name, fmtDate(i.start), i.start, () => go('health/illness'), [i.symptoms, i.treatment].join(' '));
    for (const j of await DB.list('journal')) push('📝', j.title, `${j.type} · ${fmtDate(j.date)}`, j.date, () => go('dev/journal'), j.note || '');
    for (const e of await DB.list('event')) push('📅', e.title, `${fmtDate(e.date)}${e.place ? ' · ' + e.place : ''}`, e.date, () => { CalView.ym = e.date.slice(0, 7); CalView.sel = e.date; go('calendar'); }, e.note || '');
    for (const g of await galleryItems()) if (g.caption || (g.tags || []).length) push('📸', g.caption || 'Photo', `${fmtDate(g.date)} ${(g.tags || []).map(t => '#' + t).join(' ')}`, g.date, () => ACT.viewPhoto({ dataset: { id: g.photoId } }));
    for (const v of EPI) push('💉', v.en, v.at, '', () => go('health/vaccines'), v.bn + ' ' + v.prevents);
    return L;
  }
  async function open() {
    index = await build();
    let p = $('#palette'); if (!p) { p = document.createElement('div'); p.id = 'palette'; document.body.appendChild(p); }
    p.innerHTML = `<div class="pal-bg" data-act="palClose"></div><div class="pal" role="dialog" aria-label="Search">
      <label class="pal-in">${icon('search')}<input type="search" placeholder="Search words, milestones, visits, photos… · খুঁজুন" autocomplete="off" data-input="palQuery"><kbd>Esc</kbd></label>
      <div class="pal-res" id="palRes"></div></div>`;
    p.classList.add('on'); render(''); setTimeout(() => p.querySelector('input').focus(), 30);
  }
  function render(q) {
    q = q.trim().toLowerCase();
    const acts = ACTIONS.filter(a => !q || (a[0] + ' ' + a[1]).toLowerCase().includes(q)).slice(0, q ? 4 : 6);
    const hits = q ? index.filter(i => q.split(/\s+/).every(w => i.hay.includes(w))).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 30) : [];
    window._pal = [...acts.map(a => a[3]), ...hits.map(h => h.fn)];
    $('#palRes').innerHTML = (acts.length ? `<h5>Actions</h5>${acts.map((a, i) => `<button class="pr" data-act="palGo" data-i="${i}"><span class="pr-ic">${a[2]}</span><span class="grow"><b>${a[0]}</b><span class="bn sm muted">${a[1]}</span></span>${icon('arrow')}</button>`).join('')}` : '')
      + (q ? (hits.length ? `<h5>Records · ${hits.length}</h5>${hits.map((h, i) => `<button class="pr" data-act="palGo" data-i="${acts.length + i}"><span class="pr-ic">${h.icon}</span><span class="grow"><b>${esc(h.title)}</b><span class="sm muted">${esc(h.sub)}</span></span></button>`).join('')}` : `<div class="empty sm">No matches for “${esc(q)}”.</div>`) : '<p class="pal-hint">Try “ball”, “fever”, “MR”, “park”, or a doctor’s name.</p>');
  }
  const close = () => { const p = $('#palette'); if (p) { p.classList.remove('on'); p.innerHTML = ''; } };
  ACT.palQuery = el => render(el.value);
  ACT.palClose = close;
  ACT.palGo = el => { const f = window._pal[+el.dataset.i]; close(); if (f) f(); };
  ACT.search = open;
  document.addEventListener('keydown', e => {
    if (Lock.isLocked() || document.body.classList.contains('kidmode')) return;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && $('#palette.on')) close();
    else if (e.key === 'Enter' && $('#palette.on') && document.activeElement?.dataset.input === 'palQuery') { const b = $('#palRes .pr'); if (b) b.click(); }
  });
  return { open, close };
})();
