/* ============ AFFAAN'S WORLD v5 — shell, router, forms, Home, Settings ============ */
const ACT = {};      // data-act="name" → ACT.name(el, event)
const Views = {};    // route name → async (params) => html
let curRoute = '';

/* ---------- event delegation (no inline handlers → strict CSP) ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || Lock.isLocked()) return;
  const f = ACT[el.dataset.act]; if (f) { if (el.tagName === 'A') e.preventDefault(); f(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el && ACT[el.dataset.change]) ACT[el.dataset.change](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el && ACT[el.dataset.input]) ACT[el.dataset.input](el, e); });

/* ---------- router ---------- */
const go = h => { if (location.hash === '#/' + h) route(); else location.hash = '#/' + h; };
ACT.go = el => go(el.dataset.to);
async function route() {
  if (Lock.isLocked()) return;
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'home';
  const [name, ...params] = h.split('/');
  // a running Play Together session owns the screen until a parent exits
  const kid = await Kid.activeSession();
  if (kid && name !== 'kid') { location.replace('#/kid'); return; }
  if (!kid && name === 'kid') { location.replace('#/play'); return; }
  document.body.classList.toggle('kidmode', name === 'kid');
  document.body.classList.toggle('nofab', name === 'settings');
  document.body.dataset.sec = THEMES[name] ? name : (name === 'kid' ? 'play' : 'home');
  if (name === 'gallery' || name === 'home' || (name === 'kid' && !params.length)) heroPhoto = (await galleryItems()).find(i => i.type === 'photo')?.photoId || null;
  const view = Views[name] || Views.home;
  const prevSec = curRoute.split('/')[0];
  if (prevSec !== name) { window.scrollTo(0, 0); if (prevSec && name !== 'kid' && prevSec !== 'kid') Motion.wipe(); }
  clearInterval(window._homeTimer); if (window._homeScene) { window._homeScene.stop(); window._homeScene = null; }
  curRoute = h; Speech.stop();
  $$('#nav [data-to]').forEach(b => b.classList.toggle('on', b.dataset.to === name || (name === 'settings' && false)));
  const root = $('#view');
  try { root.innerHTML = name === 'kid' ? await view(params) : `<div class="page ${esc(name)}">${await view(params)}</div>`; } catch (e) { console.error(e); root.innerHTML = `<div class="pad"><div class="empty">Something went wrong: ${esc(e.message)}</div></div>`; }
  Media.hydrate(root); renderSyncDot(); Motion.countUp(root); Motion.tilt(root); Motion.tickClocks();
  if (view.after) view.after(params);
}
window.addEventListener('hashchange', route);
const rerender = debounce(() => { if (!$('#sheet.on') && !Lock.isLocked()) route(); }, 150);
Bus.on('remote', rerender);

/* ---------- section themes + hero header (Eye 3 style) ---------- */
const THEMES = {
  home:     { eyebrow: "Affaan's World", img: './img/bg-affaan.jpg', art: 'home', nc: '#0F6B4E' },
  play:     { eyebrow: 'Play together', img: './img/hero-affaan.jpg', art: 'play', nc: '#6B3FB0' },
  dev:      { eyebrow: 'Growing up', art: 'dev', nc: '#1B3A8F' },
  health:   { eyebrow: 'Health records', art: 'health', nc: '#8B1E2D' },
  gallery:  { eyebrow: 'Memories', art: 'gallery', nc: '#0E6B6B', photo: true },
  calendar: { eyebrow: 'Calendar', art: 'calendar', nc: '#0A7C7C' },
  reports:  { eyebrow: 'Reports', art: 'reports', nc: '#2E3A63' },
  settings: { eyebrow: 'Settings', art: 'settings', nc: '#4A433C' }
};
let heroPhoto = null;
const topActions = () => `<button id="syncDot" class="glass syncdot" data-act="go" data-to="settings"></button><button class="glass round" data-act="search" aria-label="Search (Ctrl+K)">${icon('search')}</button><button class="glass round" data-act="go" data-to="settings" aria-label="Settings">${icon('settings')}</button>`;
// title: last word in gold italics, like “Tour in <em>Eye 3</em>”
const emTitle = en => { const w = esc(en).split(' '); return w.length > 1 ? `${w.slice(0, -1).join(' ')} <em>${w[w.length - 1]}</em>` : `<em>${w[0]}</em>`; };
function pageHead(en, bn, sub = '', actions = '', opt = {}) {
  const sec = (curRoute.split('/')[0]) || 'home', t = THEMES[sec] || THEMES.home;
  const a = ageOn(Child.birth);
  const img = t.photo && heroPhoto ? `<img class="h-img" data-photo="${esc(heroPhoto)}" data-size="full" alt="">` : t.img ? `<div class="h-img" style="background-image:url('${t.img}')"></div>` : '';
  return `<header class="hero2">${img}<div class="h-ov"></div><div class="h-pat"></div><div class="h-obj">${Motion.obj(t.art)}</div><i class="h-vine"></i>
    <div class="h-top">${sec !== 'home' ? `<button class="h-back" data-act="go" data-to="home">${icon('back')} Home</button>` : ''}<span class="grow"></span>${topActions()}</div>
    <div class="h-txt"><div class="eyebrow">${opt.eyebrow || `${esc(t.eyebrow)} · ${a.y}y ${a.m}m`}</div><h1>${opt.title || emTitle(en)}</h1>${bn ? `<div class="h-bn">${esc(bn)}</div>` : ''}${sub ? `<div class="h-sub">${sub}</div>` : ''}</div>
    ${actions ? `<div class="h-act">${actions}</div>` : ''}</header>`;
}
const shead = (emoji, en, bn = '', right = '') => `<div class="shead"><span class="si">${emoji}</span><h2>${en}${bn ? ` <span class="bn">${bn}</span>` : ''}</h2><span class="line"></span>${right}</div>`;
function tabs(items, cur, act, extra = '') {
  return `<div class="seg" role="tablist">${items.map(([id, en, bn]) => `<button role="tab" class="${id === cur ? 'on' : ''}" data-act="${act}" data-v="${id}" ${extra}>${esc(en)}${bn ? ` <span class="bn">${esc(bn)}</span>` : ''}</button>`).join('')}</div>`;
}
const empty = (en, bn) => `<div class="empty">${en}${bn ? `<br><span class="bn">${bn}</span>` : ''}</div>`;

/* ---------- bottom sheet with a form ---------- */
const Sheet = (() => {
  let cfg = null;
  function open(c) {
    cfg = c; const s = $('#sheet');
    s.innerHTML = `<div class="sheet-bg" data-act="sheetClose"></div>
      <form class="sheet-card" novalidate>
        <div class="sheet-head"><h2>${c.title}</h2><button type="button" class="iconbtn" data-act="sheetClose" aria-label="Close">${icon('close')}</button></div>
        <div class="sheet-body">${c.body}</div>
        ${c.save || c.del ? `<div class="sheet-foot">${c.del ? `<button type="button" class="btn ghost danger" data-act="sheetDelete">${icon('trash')} Delete</button>` : ''}<span class="grow"></span>
          ${c.save ? `<button type="submit" class="btn primary">${c.saveLabel || 'Save · সংরক্ষণ'}</button>` : ''}</div>` : ''}
      </form>`;
    s.classList.add('on'); document.body.classList.add('noscroll');
    const f = s.querySelector('form'); f._files = [];
    f.addEventListener('submit', async e => {
      e.preventDefault(); if (!cfg.save) return;
      const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Saving…';
      try { const r = await cfg.save(new FormData(f), f); if (r !== false) { close(); toast(c.saved || 'Saved · সংরক্ষিত'); route(); } }
      catch (err) { console.error(err); toast(err.message || 'Could not save', 'err'); }
      finally { btn.disabled = false; btn.textContent = cfg?.saveLabel || 'Save · সংরক্ষণ'; }
    });
    Media.hydrate(s);
    const first = f.querySelector('input:not([type=hidden]):not([type=file]),textarea,select'); if (first && c.focus !== false && matchMedia('(pointer:fine)').matches) first.focus();
    if (c.after) c.after(f);
  }
  function close() { $('#sheet').classList.remove('on'); $('#sheet').innerHTML = ''; document.body.classList.remove('noscroll'); cfg = null; }
  ACT.sheetClose = close;
  ACT.sheetDelete = async () => {
    if (!cfg?.del || !confirm('Delete this entry? · মুছে ফেলবেন?')) return;
    const before = new Map((await DB.allRecords()).filter(r => !r.deleted).map(r => [r.id, r]));
    await cfg.del(); close(); route();
    const gone = (await DB.allRecords()).filter(r => r.deleted && before.has(r.id)).map(r => before.get(r.id));
    toastUndo(`Deleted${gone.length > 1 ? ' ' + gone.length + ' items' : ''}`, async () => { for (const r of gone) await DB.put(r.kind, r.data, r.id); toast('Restored · ফিরিয়ে আনা হয়েছে'); route(); });
  };
  return { open, close, form: () => $('#sheet form') };
})();

/* ---------- compact form fields ---------- */
const F = {
  lbl: (en, bn) => `<span class="lbl">${en}${bn ? ` <span class="bn">· ${bn}</span>` : ''}</span>`,
  text: (n, en, bn, v = '', a = '') => `<label class="fld">${F.lbl(en, bn)}<input name="${n}" value="${esc(v)}" ${a}></label>`,
  date: (n, en, bn, v = todayISO(), a = '') => `<label class="fld">${F.lbl(en, bn)}<input type="date" name="${n}" value="${esc(v || '')}" max="2100-12-31" ${a}></label>`,
  num: (n, en, bn, v = '', unit = '', a = '') => `<label class="fld">${F.lbl(en, bn)}<span class="unit"><input type="number" inputmode="decimal" step="any" name="${n}" value="${v ?? ''}" ${a}><i>${unit}</i></span></label>`,
  area: (n, en, bn, v = '', a = '') => `<label class="fld">${F.lbl(en, bn)}<textarea name="${n}" rows="3" ${a}>${esc(v)}</textarea></label>`,
  select: (n, en, bn, opts, v = '') => `<label class="fld">${F.lbl(en, bn)}<select name="${n}">${opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select></label>`,
  row: (...f) => `<div class="frow">${f.join('')}</div>`,
  photos: (ids = [], en = 'Photos', bn = 'ছবি', accept = 'image/*') => `<div class="fld"><span class="lbl">${en} <span class="bn">· ${bn}</span></span>
    <div class="pfield" data-ids='${esc(JSON.stringify(ids))}'>${ids.map(id => `<span class="pth" data-id="${esc(id)}">${Media.img(id)}<button type="button" data-act="pfRemove" aria-label="Remove">×</button></span>`).join('')}
    <label class="padd">${icon('camera')}<span>Add</span><input type="file" accept="${accept}" multiple data-change="pfAdd" hidden></label></div></div>`
};
ACT.pfAdd = (input) => {
  const form = input.closest('form'), box = input.closest('.pfield');
  for (const f of input.files) {
    form._files.push(f); const u = URL.createObjectURL(f);
    const s = document.createElement('span'); s.className = 'pth new'; s.dataset.file = String(form._files.length - 1);
    s.innerHTML = f.type.startsWith('video/') ? `<span class="vid">${icon('video')}</span><button type="button" data-act="pfRemove">×</button>` : `<img src="${u}" alt=""><button type="button" data-act="pfRemove">×</button>`;
    box.insertBefore(s, box.querySelector('.padd'));
  }
  input.value = '';
};
ACT.pfRemove = (b) => {
  const t = b.closest('.pth'), box = b.closest('.pfield'), form = b.closest('form');
  if (t.dataset.id) { const ids = JSON.parse(box.dataset.ids).filter(x => x !== t.dataset.id); box.dataset.ids = JSON.stringify(ids); }
  if (t.dataset.file) form._files[+t.dataset.file] = null;
  t.remove();
};
// resolve the photo field → array of photo ids (saves new files)
async function formPhotos(form) {
  const box = form.querySelector('.pfield'); if (!box) return [];
  const ids = JSON.parse(box.dataset.ids || '[]');
  for (const f of form._files) if (f) ids.push((await Media.save(f)).id);
  return ids;
}
const val = (fd, k) => (fd.get(k) ?? '').toString().trim();
const numv = (fd, k) => { const v = val(fd, k).replace(',', '.'); return v === '' ? null : Number(v); };

/* ---------- sync indicator ---------- */
function renderSyncDot(st = Sync.state()) {
  const el = $('#syncDot'); if (!el) return;
  let cls = 'off', t = 'Offline · device only';
  if (!st.configured) { cls = 'local'; t = 'Saved on this device'; }
  else if (!st.online) { cls = 'off'; t = 'Offline — will sync later'; }
  else if (!st.signedIn) { cls = 'local'; t = 'Not signed in — device only'; }
  else if (st.running) { cls = 'busy'; t = 'Syncing…'; }
  else if (st.lastError) { cls = 'err'; t = 'Sync problem — tap for details'; }
  else { cls = 'ok'; t = 'Synced'; }
  el.className = 'glass syncdot ' + cls; el.title = t; el.setAttribute('aria-label', t);
  el.innerHTML = `<i class="sdot"></i><span>${cls === 'ok' ? (st.live ? 'Live' : 'Synced') : cls === 'busy' ? 'Syncing' : cls === 'err' ? 'Sync error' : cls === 'off' ? 'Offline' : 'On device'}</span>`;
}
Bus.on('sync', st => { renderSyncDot(st); if (curRoute === 'settings') rerender(); });

/* ================= HOME ================= */
async function milestoneState() { const m = {}; for (const r of await DB.list('milestone')) m[r.id.slice(3)] = r; return m; }
async function nextMilestone() {
  const ms = await milestoneState(), age = ageOn(Child.birth).months;
  for (const b of CDC_BANDS) {
    const open = b.items.filter(i => !ms[i.id]?.achieved);
    if (!open.length) continue;
    return { item: open[0], band: b, overdue: b.months <= age, left: open.length };
  }
  return null;
}
function vaccineDue(v) { const b = parseDate(Child.birth); return isoDate(v.due.d != null ? addDays(b, v.due.d) : addMonths(b, v.due.m)); }
async function nextVaccine() {
  const done = {}; for (const r of await DB.list('vaccine')) done[r.id.slice(3)] = r;
  const t = todayISO();
  const list = EPI.filter(v => v.group === 'epi' && !done[v.id]?.given).map(v => ({ v, due: vaccineDue(v) })).sort((a, b) => a.due.localeCompare(b.due));
  const overdue = list.filter(x => x.due < t), upcoming = list.filter(x => x.due >= t);
  return { overdue, next: upcoming[0] || null };
}
async function galleryItems() {
  const items = [];
  for (const m of await DB.list('media')) if (m.photoId) items.push({ photoId: m.photoId, date: m.date, caption: m.caption || '', tags: m.tags || [], milestoneId: m.milestoneId || '', src: 'media', recId: m.id, type: m.type || 'photo' });
  for (const m of await DB.list('milestone')) for (const p of (m.photoIds || [])) items.push({ photoId: p, date: m.achieved || m.date || '', caption: CDC_BY_ID[m.id.slice(3)]?.en || 'Milestone', tags: ['milestone'], milestoneId: m.id.slice(3), src: 'milestone', recId: m.id, type: 'photo' });
  for (const j of await DB.list('journal')) for (const p of (j.photoIds || [])) items.push({ photoId: p, date: j.date, caption: j.title, tags: [(j.type || 'journal').toLowerCase()], src: 'journal', recId: j.id, type: 'photo' });
  const seen = new Set(), types = {};
  for (const p of await DB.list('photo')) types[p.id] = p.type;
  return items.filter(i => !seen.has(i.photoId) && seen.add(i.photoId) && types[i.photoId]).map(i => ({ ...i, type: types[i.photoId] })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

Views.home = async () => {
  await Child.load();
  const T = Cal.today(), a = ageOn(Child.birth), gr = Cal.greeting(T.h);
  const nm = await nextMilestone(), nv = await nextVaccine(), vxm = await vaccineMap();
  const items = await galleryItems(), words = await DB.list('word'), msAll = (await DB.list('milestone')).filter(m => m.achieved);
  const growth = (await DB.list('growth')).sort((x, y) => y.date.localeCompare(x.date));
  const gw = growth.find(x => x.weight != null), gh = growth.find(x => x.height != null);
  const ev = (await timelineEvents()).slice(0, 4), cal = await calendarItems();
  const tmr = isoDate(addDays(parseDate(T.iso), 1));
  const todayItems = cal.filter(i => i.date === T.iso && !i.quiet), tmrItems = cal.filter(i => i.date === tmr && !i.quiet);
  const upcoming = cal.filter(i => i.sched && i.date >= T.iso && !i.quiet).slice(0, 6);
  const nextEv = cal.find(i => i.sched && i.date >= T.iso && !['bday', 'band', 'nat'].includes(i.kind));
  const w = await DB.meta.get('weather', null), wd = w?.days?.find(d => d.date === T.iso);
  const sessions = await DB.list('playsession'), wk = isoDate(addDays(new Date(), -6));
  const weekMin = sessions.filter(x => x.date >= wk).reduce((t, x) => t + x.minutes, 0), weekStars = sessions.filter(x => x.date >= wk).reduce((t, x) => t + (x.stars || 0), 0);
  const b = parseDate(Child.birth); let nb = new Date(new Date().getFullYear(), b.getMonth(), b.getDate()); if (nb < parseDate(todayISO())) nb = new Date(nb.getFullYear() + 1, b.getMonth(), b.getDate());
  const toBday = daysBetween(new Date(), nb), turning = nb.getFullYear() - b.getFullYear();
  const band = nm ? nm.band : null, bandDone = band ? band.items.length - nm.left : 0;
  const epi = EPI.filter(v => v.group === 'epi'), epiDone = epi.filter(v => vxm[v.id]?.given).length;
  const nW = words.filter(x => x.type !== 'skill').length, nBn = words.filter(x => x.type !== 'skill' && x.lang === 'bn').length;
  const lastWord = words.filter(x => x.type !== 'skill').sort((x, y) => y.date.localeCompare(x.date))[0];
  const msMonth = msAll.filter(m => m.achieved.startsWith(T.iso.slice(0, 7))).length, photosWeek = items.filter(i => i.date >= wk).length;
  const [first, ...rest] = esc(Child.name).split(' ');
  const gd = await Garden.data(); window._homeStickers = gd.stickers;
  const otd = onThisDay(items, T.iso);
  const lastBackup = await DB.meta.get('lastBackup', null), recN = (await DB.allRecords()).filter(r => !r.deleted && !['kv', 'settings'].includes(r.kind)).length;
  const backupDays = lastBackup ? daysBetween(new Date(lastBackup), new Date()) : null;
  const needBackup = recN >= 10 && (backupDays === null || backupDays > 30);
  const SYMS = [['play', 'play', 'Play'], ['dev', 'dev', 'Growth'], ['health', 'health', 'Health'], ['calendar', 'calendar', 'Calendar'], ['gallery', 'gallery', 'Gallery'], ['reports', 'reports', 'Reports']];
  const season = T.bd.season, sp = T.special;
  let parts = ''; for (let i = 0; i < 22; i++) parts += `<i style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(-Math.random() * 12).toFixed(1)}s;animation-duration:${(9 + Math.random() * 7).toFixed(1)}s"></i>`;
  let stars = ''; for (let i = 0; i < 30; i++) stars += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 55).toFixed(1)}%;animation-delay:${(-Math.random() * 4).toFixed(1)}s"></i>`;
  const wx = wd ? Weather.desc(wd.code) : null, wtip = Weather.tip(w);
  const wxClass = wd ? (wd.rain >= 50 ? 'wx-rain' : wd.hi >= 34 ? 'wx-heat' : '') : '';
  const eye = heroPhoto ? `<img data-photo="${esc(heroPhoto)}" data-size="full" alt="${esc(Child.first())}">` : `<img src="./img/bg-affaan.jpg" alt="${esc(Child.first())}" style="object-position:40% 30%">`;
  const tile = (to, obj, title, bn, stat, bg = '') => `<button class="ha-tile" data-tilt data-act="go" data-to="${to}" style="--nc:${THEMES[to].nc}">${bg}<span class="ha-ov"></span><span class="ha-sheen"></span>
     <span class="ha-head"><span><b>${title}</b><span class="bn">${bn}</span></span>${Motion.obj(obj)}</span><span class="ha-stat">${stat}</span></button>`;
  const brief = [
    ['🌱', msAll.length ? `${msMonth} ${msMonth === 1 ? 'milestone' : 'milestones'} this month · next: <b>${esc(nm ? nm.item.en.split(',')[0].slice(0, 60) : 'all recorded')}</b>` : `Start the <b>${band ? band.en : ''}</b> milestone checklist`, band ? 'dev/milestones/' + band.id : 'dev'],
    ['💉', nv.overdue.length ? `<b>${nv.overdue.length} EPI ${nv.overdue.length === 1 ? 'dose' : 'doses'}</b> to copy from his card` : nextEv ? `Next: <b>${esc(nextEv.title)}</b> · ${fmtDate(nextEv.date)}` : nv.next ? `Next vaccine <b>${esc(nv.next.v.en)}</b> · ${fmtDate(nv.next.due)}` : 'Health records up to date', nv.overdue.length ? 'health/vaccines' : 'calendar'],
    ['📸', `${photosWeek} ${photosWeek === 1 ? 'photo' : 'photos'} this week${lastWord ? ` · newest word <b>“${esc(lastWord.word)}”</b>` : ''}${weekMin ? ` · played ${weekMin} min` : ''}`, 'gallery']];
  if (needBackup) brief.unshift(['💾', backupDays === null ? '<b>No backup yet</b> — keep a copy of his records safe' : `<b>Last backup ${backupDays} days ago</b> — time for a fresh one`, 'settings']);
  return `
  <header class="gh sky-${T.phase} season-${season.k}${sp ? ' sp-' + sp.k : ''} ${wxClass}" id="lh">
    <div class="gh-sky"></div><div class="lh-wx"></div>
    <div class="h-top lh-top"><span class="lh-live"><i class="sdot live"></i><span data-live="clock">${Cal.clock()}</span></span><span class="grow"></span>${topActions()}</div>
    <div class="gh-txt">
      ${sp ? `<div class="lh-special">${sp.k === 'birthday' ? '🎂' : '✨'} ${esc(sp.en)} · <span class="bn">${sp.bn}</span></div>` : ''}
      <h1 class="gh-name">${first} <em>${rest.join(' ')}</em></h1>
      <div class="lh-bn bn">${esc(Child.nameBn || '')}</div>
      <div class="lh-greet" data-type="${esc(gr[0])} — ${esc(T.en)}"><span class="tw"></span><i class="caret"></i></div>
      <div class="lh-dates"><span class="bn">${bnNum(T.bd.d)} ${T.bd.month} ${bnNum(T.bd.y)} · ${season.bn}</span>${T.hj ? `<span class="mono">${T.hj.d} ${esc(T.hj.month)} ${T.hj.y} AH</span>` : ''}</div>
      <div class="lh-chips"><span class="lh-chip" id="wxChip">${wd ? `${wx[1]} ${wd.hi}°/${wd.lo}° · ${wx[0]}` : '☁️ Dhaka weather'}</span><span class="lh-chip age"><span data-live="age">${ageText(a)}</span></span></div>
    </div>
  </header>
  <div class="gh-stats">
    <button data-act="go" data-to="dev/milestones"><b data-count="${msAll.length}">${msAll.length}</b><span>Milestones<i class="bn">মাইলফলক</i></span></button>
    <button data-act="go" data-to="dev/words"><b data-count="${nW}">${nW}</b><span>Words<i class="bn">শব্দ</i></span></button>
    <button data-act="go" data-to="gallery"><b data-count="${items.length}">${items.length}</b><span>Photos<i class="bn">ছবি</i></span></button>
    <button data-act="go" data-to="health/vaccines"><b>${epiDone}<small>/14</small></b><span>EPI doses<i class="bn">টিকা</i></span></button>
    <button data-act="go" data-to="dev/growth"><b>${gh ? gh.height : '—'}<small>${gh ? 'cm' : ''}</small></b><span>Height<i class="bn">উচ্চতা</i></span></button>
  </div>

  <div class="pad home-body">
    <div class="brief card">${brief.map(([i, h, to]) => `<button class="br" data-act="go" data-to="${to}"><span>${i}</span><span class="grow">${h}</span>${icon('arrow')}</button>`).join('')}</div>

    <div class="today-strip">
      <div class="ts date"><span class="eyebrow">Today</span><b class="big">${T.d}</b><span>${EN_MONTHS[T.m]} · ${Cal.EN_DAYS[T.wd].slice(0, 3)}</span><span class="bn sm">${T.bnDay}</span></div>
      <div class="ts wx" id="wxCard">${wd ? `<span class="eyebrow">Dhaka</span><b class="big">${w.now ? w.now.t : wd.hi}°</b><span>${wx[1]} ${wx[0]} · ${wd.hi}°/${wd.lo}°</span><span class="sm">${wtip ? esc(wtip[0]) : ''}</span>` : `<span class="eyebrow">Dhaka</span><b class="big">—</b><span class="sm">Weather appears when online</span>`}</div>
      <div class="ts evs"><span class="eyebrow">Today & tomorrow</span>${[...todayItems.map(i => ['Today', i]), ...tmrItems.map(i => ['Tmrw', i])].slice(0, 3).map(([d, i]) => `<span class="tsr"><i style="background:${i.color}"></i><em>${d}</em> ${esc(i.title)}</span>`).join('') || '<span class="sm">A free day — go outside! 🌳</span>'}</div>
      <div class="ts next"><span class="eyebrow">Next</span>${nextEv ? `<b class="big">${Math.max(0, daysBetween(new Date(), parseDate(nextEv.date)))}<small>d</small></b><span>${esc(nextEv.title)}</span>` : `<b class="big">${toBday}<small>d</small></b><span>to his ${ordinal(turning)}</span>`}</div>
    </div>

    <div class="kpis">
      ${[['Days old', a.days, 'দিন', '#E3BF6C'], ['Words', nW, 'শব্দ', '#7AB4F5'], ['Milestones', msAll.length, 'মাইলফলক', '#6FD48F'], ['Photos', items.length, 'ছবি', '#5EEAD4']].map(([l, n, bn, c]) => `<div class="kpi" style="--kc:${c}"><i class="kpi-m"></i><b data-count="${n}">0</b><span>${l}</span><span class="bn">${bn}</span></div>`).join('')}
    </div>

    ${shead('🪷', 'His world', 'তার পৃথিবী')}
    <div class="ha-grid">
      ${tile('play', 'play', 'Play together', 'একসাথে খেলি', weekMin ? `${weekMin} min this week · ⭐ ${weekStars}` : 'Start a 10-minute session', `<span class="ha-img" style="background-image:url('./img/hero-affaan.jpg')"></span>`)}
      ${tile('dev', 'dev', 'Growth', 'বিকাশ', gw || gh ? `${gw ? gw.weight + ' kg' : ''}${gw && gh ? ' · ' : ''}${gh ? gh.height + ' cm' : ''} · ${msAll.length} milestones` : `${msAll.length} milestones · add a measurement`)}
      ${tile('health', 'health', 'Health', 'স্বাস্থ্য', `EPI ${epiDone}/${epi.length}${nv.next ? ' · next ' + esc(nv.next.v.en.split(' (')[0]) : ''}`)}
      ${tile('calendar', 'calendar', 'Calendar', 'ক্যালেন্ডার', nextEv ? `${esc(nextEv.title)} · ${daysBetween(new Date(), parseDate(nextEv.date)) <= 0 ? 'today' : 'in ' + daysBetween(new Date(), parseDate(nextEv.date)) + 'd'}` : `<span data-live="clock">${Cal.clock()}</span>`)}
      ${tile('gallery', 'gallery', 'Gallery', 'গ্যালারি', `${items.length} photos & videos${photosWeek ? ' · ' + photosWeek + ' this week' : ''}`, items[0] && items[0].type === 'photo' ? `<img class="ha-img" data-photo="${esc(items[0].photoId)}" alt="">` : '')}
      ${tile('reports', 'reports', 'Reports', 'রিপোর্ট', `${fmtMonth(T.iso.slice(0, 7))} summary ready`)}
    </div>

    ${shead('⏳', 'On the horizon', 'সামনে')}
    <div class="rings card">
      ${Motion.ring((365 - toBday) / 365, `${toBday}<small>d</small>`, `to his ${ordinal(turning)}`, '#E3BF6C')}
      ${Motion.ring(epiDone / epi.length, `${epiDone}/${epi.length}`, 'EPI doses', '#F58B7A')}
      ${band ? Motion.ring(bandDone / band.items.length, `${Math.round(bandDone / band.items.length * 100)}%`, `${band.en} milestones`, '#6FD48F') : ''}
      ${nextEv ? Motion.ring(1 - Math.min(30, Math.max(0, daysBetween(new Date(), parseDate(nextEv.date)))) / 30, `${Math.max(0, daysBetween(new Date(), parseDate(nextEv.date)))}<small>d</small>`, esc(nextEv.title.slice(0, 22)), '#7AB4F5') : ''}
    </div>
    ${upcoming.length ? `<div class="hz card">${upcoming.map(i => { const n = daysBetween(new Date(), parseDate(i.date)); return `<button class="hz-row" ${i.act ? `data-act="${i.act}" data-id="${esc(i.id)}"` : i.go ? `data-act="go" data-to="${i.go}"` : 'data-act="go" data-to="calendar"'}><i style="background:${i.color}"></i><span class="d mono">${fmtDate(i.date).replace(/ \d{4}$/, '')}</span><span class="grow"><b>${esc(i.title)}</b></span><span class="when">${n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + 'd'}</span></button>`; }).join('')}</div>` : ''}

    ${otd.length ? `${shead('🌼', 'On this day', 'এই দিনে')}
    <div class="otd">${otd.map(o => `<button class="otd-card" data-act="viewPhoto" data-id="${esc(o.photoId)}">${Media.img(o.photoId, 'full')}<span><b>${o.label}</b><small>${fmtDate(o.date)} · ${ageShort(Child.birth, o.date)}</small></span></button>`).join('')}</div>` : ''}

    ${ev.length ? `${shead('🕰️', 'Recently', 'সাম্প্রতিক', '<button class="linkbtn" data-act="homeTimeline">All</button>')}
    <div class="card tlstrip">${ev.map(e => `<button class="tlrow" ${e.go ? `data-act="go" data-to="${e.go}"` : e.photo ? `data-act="viewPhoto" data-id="${esc(e.photo)}"` : ''}><span class="tagdot" style="background:${e.color}"></span><span class="d">${fmtDate(e.date).replace(/ \d{4}$/, '')}</span><span class="grow"><b>${esc(e.en)}</b><span class="s">${ageShort(Child.birth, e.date)}</span></span></button>`).join('')}</div>` : ''}

    ${shead('📸', 'Latest photos', 'ছবি', '<button class="linkbtn" data-act="go" data-to="gallery">See all</button>')}
    ${items.length ? `<div class="strip">${items.slice(0, 10).map(p => `<button class="sthumb" data-act="viewPhoto" data-id="${esc(p.photoId)}">${Media.img(p.photoId)}${p.type === 'video' ? `<i class="vbadge">${icon('video')}</i>` : ''}</button>`).join('')}</div>`
      : `<button class="dropzone" data-act="quickPhoto">${icon('camera')} Add his first photo · <span class="bn">প্রথম ছবি</span></button>`}

    <div class="card story" style="margin-top:16px">
      <div class="eyebrow">The story so far</div>
      <p>${esc(Child.first())} is ${ageText(a)} old — day ${a.days.toLocaleString()} of his life.
        ${msAll.length || nW || items.length ? `You've recorded <strong>${msAll.length} ${msAll.length === 1 ? 'milestone' : 'milestones'}</strong>, <strong>${nW} ${nW === 1 ? 'word' : 'words'}</strong>${nBn ? ` (${nBn} in Bangla)` : ''} and <strong>${items.length} photos</strong>.` : 'Every photo, first word and milestone you add here becomes his story.'}
        ${lastWord ? ` His newest word: <strong>“${esc(lastWord.word)}”</strong>.` : ''}</p>
      <p class="bn" style="margin-top:6px;font-size:12.5px">${esc(Child.nameBn || '')} — ${ageTextBn(a)}। ${season.bn} ঋতু।</p>
    </div>

    <footer class="medallion"><i class="med-m seal"></i><b>Affaan's <em>World</em></b><span class="bn">আফফানের পৃথিবী</span>
      <span class="legend"><i style="background:#6FD48F"></i>done <i style="background:#F0B64A"></i>soon <i style="background:#F58B7A"></i>health <i style="background:#7AB4F5"></i>growth</span>
      <small class="mono">v7 · ${(await DB.meta.get('lastSync')) ? 'synced ' + new Date(await DB.meta.get('lastSync')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'on this device'}</small></footer>
  </div>`;
};
// memories from the same day 1 month, 6 months and each year ago (± a few days), plus then-and-now
function onThisDay(items, todayIso) {
  const out = [], used = new Set(), t = parseDate(todayIso), photos = items.filter(i => i.type === 'photo' && i.date);
  const near = (target, win) => { let best = null, bd = 1e9; for (const p of photos) { if (used.has(p.photoId)) continue; const d = Math.abs(daysBetween(parseDate(p.date), target)); if (d <= win && d < bd) { best = p; bd = d; } } return best; };
  const age = ageOn(Child.birth).y;
  for (let y = age; y >= 1; y--) { const p = near(addMonths(t, -12 * y), 4); if (p) { used.add(p.photoId); out.push({ ...p, label: `${y} ${y === 1 ? 'year' : 'years'} ago` }); } }
  for (const [m, l] of [[6, '6 months ago'], [1, '1 month ago']]) { const p = near(addMonths(t, -m), 3); if (p) { used.add(p.photoId); out.push({ ...p, label: l }); } }
  if (out.length && photos[0] && !used.has(photos[0].photoId)) out.unshift({ ...photos[0], label: 'Now · এখন' });
  return out.slice(0, 4);
}
Views.home.after = () => {
  const lhEl = $('#lh'), Tn = Cal.today();
  window._homeScene && window._homeScene.stop();
  window._homeScene = HomeScene.start(lhEl, { stickers: window._homeStickers || [], phase: Tn.phase, season: Tn.bd.season.k, rain: lhEl && lhEl.classList.contains('wx-rain') });
  // the rest of Home eases in as it scrolls into view
  if (!Motion.still() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.home-body > *, .home-body .ha-tile, .home-body .kpi').forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--rv', (i % 4) * 70 + 'ms'); io.observe(el); });
  }
  if (heroPhoto) Media.url(heroPhoto, 'full').then(u => { const im = lhEl && lhEl.querySelector('.gh-locket .op-img'); if (u && im) im.style.backgroundImage = `url('${u}')`; }).catch(() => { });
  // typed greeting
  const g = $('.lh-greet'); if (g) { const full = g.dataset.type, tw = g.querySelector('.tw'); let i = 0; if (Motion.still()) tw.textContent = full; else { const iv = setInterval(() => { tw.textContent = full.slice(0, ++i); if (i >= full.length) clearInterval(iv); }, 38); } }
  // live age to the second (time since midnight on his birth date, Dhaka)
  const ageEl = $('[data-live=age]');
  const tickAge = () => { const p = Cal.dhakaParts(), a = ageOn(Child.birth); if (ageEl) ageEl.textContent = `${a.y}y ${a.m}m ${a.d}d · ${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}`; };
  tickAge(); window._homeTimer = setInterval(tickAge, 1000);
  // depth: layers drift with the pointer and sway when idle
  const lh = $('#lh');
  if (lh && !Motion.still()) {
    const layers = $$('[data-depth]', lh);
    const move = (x, y) => layers.forEach(l => l.style.transform = `translate3d(${(x * +l.dataset.depth).toFixed(1)}px,${(y * +l.dataset.depth * 0.6).toFixed(1)}px,0)`);
    lh.addEventListener('pointermove', e => { const r = lh.getBoundingClientRect(); move((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5);
    });
    lh.addEventListener('pointerleave', () => move(0, 0));
  }
  // fresh weather (cached copy already shown)
  Weather.get().then(w => {
    const T = Cal.today(), wd = w?.days?.find(d => d.date === T.iso); if (!wd) return;
    const d = Weather.desc(wd.code), tip = Weather.tip(w);
    const chip = $('#wxChip'); if (chip) chip.textContent = `${d[1]} ${wd.hi}°/${wd.lo}° · ${d[0]}`;
    const card = $('#wxCard'); if (card) card.innerHTML = `<span class="eyebrow">Dhaka</span><b class="big">${w.now ? w.now.t : wd.hi}°</b><span>${d[1]} ${d[0]} · ${wd.hi}°/${wd.lo}°</span><span class="sm">${tip ? esc(tip[0]) : ''}</span>`;
    if (lh) { lh.classList.toggle('wx-rain', wd.rain >= 50); lh.classList.toggle('wx-heat', wd.rain < 50 && wd.hi >= 34); }
  });
};
ACT.homeTimeline = () => { GQ.mode = 'timeline'; go('gallery'); };
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th') + ' birthday';

/* ---------- quick add ---------- */
ACT.quickAdd = () => Sheet.open({
  title: 'Quick add · <span class="bn">দ্রুত যোগ</span>',
  body: `<div class="qgrid">${[
    ['quickPhoto', 'camera', 'Photo / video', 'ছবি / ভিডিও'], ['addGrowth', 'ruler', 'Growth', 'ওজন ও উচ্চতা'], ['addWord', 'chat', 'First word / skill', 'নতুন শব্দ'],
    ['pickMilestone', 'star', 'Milestone', 'মাইলফলক'], ['addVisit', 'steth', 'Doctor visit', 'ডাক্তার'], ['addIllness', 'thermo', 'Illness', 'অসুখ'],
    ['addDoc', 'pill', 'Prescription / report', 'প্রেসক্রিপশন'], ['pickVaccine', 'syringe', 'Vaccine given', 'টিকা'], ['addJournal', 'note', 'Journal note', 'নোট']
  ].map(([a, i, en, bn], k) => { const c = ['#0E6B6B', '#1B3A8F', '#1B3A8F', '#1B3A8F', '#8B1E2D', '#8B1E2D', '#8B1E2D', '#8B1E2D', '#8A6A1F'][k];
    return `<button type="button" class="qbtn" data-act="${a}" style="--qc:${c};--qc-soft:${c}17"><span class="qi">${icon(i)}</span><b>${en}</b><span class="bn">${bn}</span></button>`; }).join('')}</div>`
});

/* ================= SETTINGS ================= */
Views.settings = async () => {
  await Child.load();
  const st = Sync.state(), cfg = await Sync.getConfig();
  const lastSync = await DB.meta.get('lastSync', null), lockAfter = await DB.meta.get('lockAfter', 60);
  const recs = (await DB.allRecords()).filter(r => !r.deleted), photos = recs.filter(r => r.kind === 'photo');
  const est = navigator.storage?.estimate ? await navigator.storage.estimate() : null;
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;
  let used = null, fam = { members: [], invites: [] };
  if (st.signedIn) { try { used = await Sync.storageUsed(); fam = await Sync.members(); } catch (e) { } }
  const pct = used ? Math.min(100, used.bytes / 1073741824 * 100) : 0;
  const vi = Speech.voiceInfo();
  const me = fam.members.find(m => m.email === st.email);
  return `${pageHead('Settings', 'সেটিংস', 'Sync · backup · security · sound')}
  <div class="pad stack">
    <section class="panel"><h3>Child · <span class="bn">শিশু</span></h3>
      <form class="inline-form" data-form="child">
        ${F.row(F.text('name', 'Name', 'নাম', Child.name), F.text('nameBn', 'Name in Bangla', 'বাংলায় নাম', Child.nameBn))}
        ${F.row(F.date('birth', 'Date of birth', 'জন্ম তারিখ', Child.birth), '<div class="fld end"><button class="btn primary" data-act="saveChild" type="button">Save</button></div>')}
      </form>
    </section>

    <section class="panel"><h3>Sync & account · <span class="bn">সিঙ্ক ও অ্যাকাউন্ট</span></h3>
      ${!st.configured ? `
        <p class="muted">Everything already works offline on this phone. To sync between both parents' phones and back up photos, connect your free Supabase project (see README). Paste the <b>Project URL</b> and the <b>anon / publishable</b> key — never the service_role key.</p>
        ${st.lastError ? `<p class="errline">${esc(st.lastError)}</p>` : ''}
        <form class="inline-form">${F.text('url', 'Supabase URL', '', cfg.url, 'placeholder="https://xxxx.supabase.co" autocomplete="off"')}${F.text('key', 'Anon / publishable key', '', '', 'placeholder="eyJhbGci… or sb_publishable_…" autocomplete="off"')}
        <button type="button" class="btn primary" data-act="saveSupa">Connect</button></form>`
      : !st.signedIn ? `
        <p class="muted">Connected to <code>${esc(cfg.url.replace('https://', ''))}</code>. Sign in with your email. The first account creates the family; the invited second parent joins it.</p>
        <form class="inline-form" id="authForm">${F.row(F.text('email', 'Email', 'ইমেইল', '', 'type="email" autocomplete="username"'), F.text('password', 'Password', 'পাসওয়ার্ড', '', 'type="password" autocomplete="current-password" minlength="8"'))}
          <div class="btnrow"><button type="button" class="btn primary" data-act="authIn">Sign in</button><button type="button" class="btn" data-act="authUp">Create account</button><button type="button" class="btn ghost" data-act="authLink">Email me a link</button></div></form>
        ${!cfg.fromFile ? '<button class="linkbtn" data-act="clearSupa">Disconnect this Supabase project</button>' : ''}`
      : `
        <div class="kv"><span>Signed in</span><b>${esc(st.email)}${me ? ` · ${me.role}` : ''}</b></div>
        <div class="kv"><span>Status</span><b>${!st.online ? 'Offline — changes are queued' : st.running ? 'Syncing…' : st.lastError ? '<span class="warn">' + esc(st.lastError) + '</span>' : 'Up to date'}</b></div>
        <div class="kv"><span>Last sync</span><b>${lastSync ? new Date(lastSync).toLocaleString() : 'never'}</b></div>
        <div class="kv"><span>Photo storage</span><b>${used ? fmtBytes(used.bytes) : '—'} of 1 GB <small class="muted">(${used ? used.source : ''})</small></b></div>
        <div class="meter"><i style="width:${pct.toFixed(1)}%"></i></div>
        <p class="muted sm">Cloud keeps compressed copies (≈150 KB each). Originals and videos stay on this phone and in your backup ZIPs.</p>
        <div class="btnrow"><button class="btn primary" data-act="syncNow">Sync now</button><button class="btn ghost" data-act="signOut">Sign out</button></div>
        <h4>Second parent · <span class="bn">দ্বিতীয় অভিভাবক</span></h4>
        ${fam.members.length > 1 ? `<p class="muted">${fam.members.map(m => esc(m.email) + ' (' + m.role + ')').join(' · ')}</p>`
        : fam.invites.length ? `<p class="muted">Invited: <b>${esc(fam.invites[0].email)}</b>. They install the app, open Settings, and create an account with that email. <button class="linkbtn" data-act="cancelInvite">Cancel invite</button></p>`
          : me?.role === 'owner' ? `<form class="inline-form">${F.text('invite', 'Their email', 'ইমেইল', '', 'type="email"')}<button type="button" class="btn" data-act="invite">Invite</button></form>` : ''}`}
    </section>

    <section class="panel"><h3>Backup · <span class="bn">ব্যাকআপ</span></h3>
      <p class="muted">One ZIP with every record and every photo/video original. Keep a copy on your computer or Google Drive.</p>
      <div class="kv"><span>On this device</span><b>${recs.length - photos.length} records · ${photos.length} photos/videos${est ? ` · ${fmtBytes(est.usage || 0)} used` : ''}</b></div>
      <div class="kv"><span>Last backup</span><b>${(await DB.meta.get('lastBackup')) ? fmtDate((await DB.meta.get('lastBackup')).slice(0, 10)) : 'never'}</b></div>
      <div class="btnrow"><button class="btn primary" data-act="backupNow">${icon('download')} Backup now</button>
        <label class="btn">Restore… <input type="file" accept=".zip,.affaan,application/zip,application/octet-stream" data-change="restoreZip" hidden></label></div>
      <p class="muted sm" id="backupMsg"></p>
      ${!persisted && navigator.storage?.persist ? '<button class="linkbtn" data-act="persist">Ask the browser to never evict this data</button>' : persisted ? '<p class="muted sm">✓ Browser storage is marked persistent.</p>' : ''}
    </section>

    <section class="panel"><h3>Appearance · <span class="bn">চেহারা</span></h3>
      ${F.row(F.select('theme', 'Theme', 'থিম', [['garden', 'Garden · day'], ['emerald', 'Night garden'], ['auto', 'Follow phone setting']], await DB.meta.get('theme', 'garden')).replace('<select', '<select data-change="setTheme"'),
        F.select('textsize', 'Text size', 'লেখার আকার', [['1', 'Normal'], ['1.12', 'Large'], ['1.25', 'Extra large']], await DB.meta.get('textsize', '1')).replace('<select', '<select data-change="setTextSize"'))}
      ${F.select('introMode', 'Opening animation', 'শুরুর অ্যানিমেশন', [['tree', 'The Golden Tree (7 s)'], ['film', 'Photo film (15 s, when the frames are added)'], ['off', 'Off']], await introMode()).replace('<select', '<select data-change="setIntroMode"')}
      <div class="btnrow"><button class="btn" data-act="watchOpening">▶ Play the opening · <span class="bn">আবার দেখুন</span></button><button class="btn" data-act="watchFilm">▶ Watch the film · <span class="bn">ছবিটি দেখুন</span></button></div>
    </section>

    <section class="panel"><h3>Security · <span class="bn">নিরাপত্তা</span></h3>
      ${F.select('lockAfter', 'Lock again after leaving the app', 'স্বয়ংক্রিয় লক', [[0, 'Immediately'], [60, '1 minute'], [300, '5 minutes'], [900, '15 minutes']], lockAfter).replace('<select', '<select data-change="setLockAfter"')}
      <div class="btnrow"><button class="btn" data-act="changePin">Change PIN</button><button class="btn ghost" data-act="lockNow">${icon('lock')} Lock now</button></div>
      <p class="muted sm">The PIN guards the screen; data lives in this browser's private storage. Sign-out and the PIN do not encrypt files on a rooted/jailbroken phone.</p>
    </section>

    <section class="panel"><h3>Sound · <span class="bn">শব্দ</span></h3>
      <div class="kv"><span>Read-aloud</span><b>${Speech.isEnabled() ? 'On' : 'Muted'} <button class="linkbtn" data-act="toggleSound">${Speech.isEnabled() ? 'Mute' : 'Turn on'}</button></b></div>
      <div class="kv"><span>English voice</span><b>${esc(vi.en || (vi.count ? 'default' : 'loading…'))}</b></div>
      <div class="kv"><span>Bangla voice</span><b>${vi.bn ? esc(vi.bn) : '<span class="warn">not installed</span>'}</b></div>
      ${!vi.bn ? '<p class="muted sm">Android: Settings → Accessibility → Text-to-speech → Google → install Bangla. iPhone: Settings → Accessibility → Spoken Content → Voices → Bangla.</p>' : ''}
      <div class="btnrow"><button class="btn" data-act="testVoice" data-lang="en">Test English</button><button class="btn" data-act="testVoice" data-lang="bn">বাংলা পরীক্ষা</button></div>
    </section>

    <section class="panel"><h3>About</h3>
      <p class="muted sm">Affaan's World v5 · private parent app. Milestones: CDC “Learn the Signs. Act Early.” Vaccines: Bangladesh EPI. Not medical advice — always follow your paediatrician.</p>
      <button class="linkbtn danger" data-act="eraseDevice">Erase all data on this device</button>
    </section>
  </div>`;
};
ACT.saveChild = async (b) => {
  const f = b.closest('form'), fd = new FormData(f);
  if (!val(fd, 'birth')) return toast('Birth date needed', 'err');
  await Child.save({ name: val(fd, 'name') || 'Affaan', nameBn: val(fd, 'nameBn'), birth: val(fd, 'birth') }); toast('Saved'); route();
};
ACT.saveSupa = async b => { const fd = new FormData(b.closest('form')); try { await Sync.saveConfig(val(fd, 'url'), val(fd, 'key')); } catch (e) { toast(e.message, 'err'); } };
ACT.clearSupa = () => { if (confirm('Disconnect? Local data stays.')) Sync.clearConfig(); };
const authFd = () => new FormData($('#authForm'));
ACT.authIn = async () => { const fd = authFd(); try { await Sync.signIn(val(fd, 'email'), val(fd, 'password')); toast('Signed in'); route(); } catch (e) { toast(e.message, 'err'); } };
ACT.authUp = async () => {
  const fd = authFd(); if (val(fd, 'password').length < 8) return toast('Password: 8+ characters', 'err');
  try { const r = await Sync.signUp(val(fd, 'email'), val(fd, 'password')); toast(r === 'confirm' ? 'Check your email to confirm, then sign in' : 'Account created'); route(); } catch (e) { toast(e.message, 'err'); }
};
ACT.authLink = async () => { const fd = authFd(); try { await Sync.magicLink(val(fd, 'email')); toast('Link sent — open it on this phone'); } catch (e) { toast(e.message, 'err'); } };
ACT.syncNow = async () => { const s = await Sync.run(); toast(s.lastError ? 'Sync error: ' + s.lastError : 'Synced ✓', s.lastError ? 'err' : ''); route(); };
ACT.signOut = async () => { if (confirm('Sign out? Data stays on this device.')) { await Sync.signOut(); route(); } };
ACT.invite = async b => { const e = val(new FormData(b.closest('form')), 'invite'); if (!e) return; try { await Sync.invite(e); toast('Invited'); route(); } catch (x) { toast(x.message, 'err'); } };
ACT.cancelInvite = async () => { try { await Sync.cancelInvite(); route(); } catch (x) { toast(x.message, 'err'); } };
function applyTheme(t) {
  const dark = t === 'emerald' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'emerald' : 'garden';
  $('meta[name=theme-color]')?.setAttribute('content', dark ? '#071A14' : '#FFF8EC');
}
const applyTextSize = z => document.documentElement.style.setProperty('--zoom', z || 1);
ACT.setTextSize = async el => { await DB.meta.set('textsize', el.value); applyTextSize(el.value); };
ACT.setTheme = async el => { await DB.meta.set('theme', el.value); applyTheme(el.value); };
async function introMode() { const m = await DB.meta.get('introMode'); if (m === 'short' || m === 'full') return 'tree'; if (m) return m; return (await DB.meta.get('intro', true)) ? 'tree' : 'off'; }
ACT.setIntroMode = async el => { await DB.meta.set('introMode', el.value); toast(el.value === 'off' ? 'Opening off' : el.value === 'film' ? 'Photo film on open' : 'Golden Tree on open'); };
ACT.watchOpening = () => Opening.play();
ACT.watchFilm = async () => { if (!(await Film.play('full'))) toast('The photo film frames haven’t been added yet'); };
async function openingFilm() {
  const m = await introMode(); if (m === 'off') return;
  if (m === 'film' && await Film.play('full')) return;
  await Opening.play();
}
ACT.setLockAfter = async el => { await DB.meta.set('lockAfter', Number(el.value)); toast('Saved'); };
ACT.changePin = () => Lock.change();
ACT.lockNow = () => Lock.lockNow();
ACT.toggleSound = () => { Speech.setEnabled(!Speech.isEnabled()); route(); };
ACT.testVoice = el => el.dataset.lang === 'bn' ? Speech.seq([['আসসালামু আলাইকুম, আফফান! চলো খেলি।', 'bn-BD', 0.85]]) : Speech.seq([['Hello Affaan! Let us play together.', 'en-US', 0.85]]);
ACT.persist = async () => { const ok = await navigator.storage.persist(); toast(ok ? 'Storage is now persistent' : 'Browser declined — install the app to home screen and try again'); route(); };
ACT.eraseDevice = async () => {
  if (!confirm('Erase EVERYTHING on this device (records, photos, PIN)? Make a backup first.')) return;
  if (prompt('Type ERASE to confirm') !== 'ERASE') return;
  await DB.wipe(); localStorage.clear(); location.replace('./');
};
ACT.backupNow = () => Sheet.open({
  title: 'Backup now · <span class="bn">ব্যাকআপ</span>',
  body: `<p class="muted sm">One file with every record, photo, video and family voice. Add a password so his medical records stay private if the file is ever shared or lost.</p>
    ${F.row(F.text('pw', 'Password (recommended)', 'পাসওয়ার্ড', '', 'type="password" autocomplete="new-password"'), F.text('pw2', 'Repeat password', 'আবার', '', 'type="password" autocomplete="new-password"'))}
    <p class="muted sm">⚠️ Without the password the file cannot be opened — not even by us. Write it down somewhere safe.</p>`,
  saveLabel: 'Create backup', saved: 'Backup ready',
  save: async fd => {
    const pw = val(fd, 'pw'); if (pw !== val(fd, 'pw2')) throw new Error('The passwords do not match'); if (pw && pw.length < 6) throw new Error('Use at least 6 characters');
    const btn = $('#sheet [type=submit]'); await Backup.exportZip(t => { btn.textContent = t.slice(0, 28); const m = $('#backupMsg'); if (m) m.textContent = t; }, pw);
  }
});
ACT.restoreZip = async el => {
  const f = el.files[0]; el.value = ''; if (!f) return; const m = $('#backupMsg');
  if (!confirm(`Restore from ${f.name}? Records are merged — for each item, the most recently edited version wins.`)) return;
  const run = async pw => { const r = await Backup.restoreZip(f, t => m.textContent = t, pw); toast(`Restored ${r.records} records, ${r.photos} photos`); await Child.load(); route(); };
  try { await run(''); } catch (e) {
    if (!e.needsPassword) { m.textContent = 'Restore failed: ' + e.message; return; }
    Sheet.open({ title: '🔒 Password-protected backup', body: F.text('pw', 'Backup password', 'পাসওয়ার্ড', '', 'type="password" autocomplete="current-password"'), saveLabel: 'Unlock & restore', saved: 'Restored',
      save: async fd => { await run(val(fd, 'pw')); } });
  }
};

/* ---------- one-time migration of v4 data (same domain only) ---------- */
async function migrateV4() {
  if (await DB.meta.get('migratedV4')) return;
  const get = k => { try { return JSON.parse(localStorage.getItem('rehbar_' + k)); } catch (e) { return null; } };
  const dataUrlToFile = async (d, n) => { const b = await (await fetch(d)).blob(); return new File([b], n, { type: b.type, lastModified: Date.now() }); };
  try {
    for (const h of get('health') || []) {
      const photoIds = h.photo ? [(await Media.save(await dataUrlToFile(h.photo, 'health.jpg'))).id] : [];
      await DB.put('journal', { type: h.type || 'Health', title: h.title, note: h.note || '', date: h.date || todayISO(), photoIds });
    }
    for (const j of get('journal') || []) await DB.put('journal', { type: 'Milestone', title: j.title, note: [j.tag, j.note].filter(Boolean).join(' — '), date: j.date || todayISO(), photoIds: j.photo ? [(await Media.save(await dataUrlToFile(j.photo, 'journal.jpg'))).id] : [] });
    for (const m of get('memories') || []) {
      if (m.photo) { const p = await Media.save(await dataUrlToFile(m.photo, 'memory.jpg')); await DB.put('media', { photoId: p.id, date: m.date || todayISO(), caption: [m.title, m.note].filter(Boolean).join(' — '), tags: [String(m.tag || 'memory').toLowerCase()], type: 'photo' }); }
      else await DB.put('journal', { type: 'Life moment', title: m.title, note: m.note || '', date: m.date || todayISO(), photoIds: [] });
    }
    for (const k of ['sparkDone', 'readDays', 'booksRead']) { const v = get(k); if (v) await KV.set(k, v); }
  } catch (e) { console.warn('v4 migration', e); }
  await DB.meta.set('migratedV4', true);
}

/* ---------- boot ---------- */
async function boot() {
  await DB.open();
  await DB.loadAll();
  await Child.load();
  Sync.init().catch(e => console.warn(e));
  $('#nav').innerHTML = [['home', 'home', 'Home', 'হোম'], ['play', 'play', 'Play', 'খেলা'], ['dev', 'dev', 'Growth', 'বিকাশ'], ['health', 'health', 'Health', 'স্বাস্থ্য'], ['calendar', 'calendar', 'Calendar', 'ক্যালেন্ডার'], ['gallery', 'gallery', 'Gallery', 'গ্যালারি'], ['reports', 'reports', 'Reports', 'রিপোর্ট']]
    .map(([to, ic, en, bn]) => `<button data-act="go" data-to="${to}" style="--nc:${THEMES[to].nc};--ns:${THEMES[to].nc}1C"><span class="nwrap">${icon(ic)}</span><span>${en}</span><span class="bn">${bn}</span></button>`).join('');
  $('#fab').innerHTML = icon('plus');
  Motion.installArt();
  const th = await DB.meta.get('theme', 'garden'); applyTheme(th === 'ivory' ? 'garden' : th); applyTextSize(await DB.meta.get('textsize', '1'));
  await Voice.load();
  await openingFilm();
  Lock.start(async () => { await migrateV4(); route(); });
  Weather.get().catch(() => { });
  Bus.on('unlocked', () => route());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });
  window.addEventListener('online', () => document.body.classList.remove('is-offline'));
  window.addEventListener('offline', () => document.body.classList.add('is-offline'));
  if (!navigator.onLine) document.body.classList.add('is-offline');
}
document.addEventListener('DOMContentLoaded', boot);
