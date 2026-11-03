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
  if (curRoute.split('/')[0] !== name) window.scrollTo(0, 0);
  curRoute = h; Speech.stop();
  $$('#nav [data-to]').forEach(b => b.classList.toggle('on', b.dataset.to === name || (name === 'settings' && false)));
  const root = $('#view');
  try { root.innerHTML = name === 'kid' ? await view(params) : `<div class="page ${esc(name)}">${await view(params)}</div>`; } catch (e) { console.error(e); root.innerHTML = `<div class="pad"><div class="empty">Something went wrong: ${esc(e.message)}</div></div>`; }
  Media.hydrate(root); renderSyncDot();
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
  reports:  { eyebrow: 'Reports', art: 'reports', nc: '#2E3A63' },
  settings: { eyebrow: 'Settings', art: 'settings', nc: '#4A433C' }
};
let heroPhoto = null;
const topActions = () => `<button id="syncDot" class="glass syncdot" data-act="go" data-to="settings"></button><button class="glass round" data-act="go" data-to="settings" aria-label="Settings">${icon('settings')}</button>`;
// title: last word in gold italics, like “Tour in <em>Eye 3</em>”
const emTitle = en => { const w = esc(en).split(' '); return w.length > 1 ? `${w.slice(0, -1).join(' ')} <em>${w[w.length - 1]}</em>` : `<em>${w[0]}</em>`; };
function pageHead(en, bn, sub = '', actions = '', opt = {}) {
  const sec = (curRoute.split('/')[0]) || 'home', t = THEMES[sec] || THEMES.home;
  const a = ageOn(Child.birth);
  const img = t.photo && heroPhoto ? `<img class="h-img" data-photo="${esc(heroPhoto)}" data-size="full" alt="">` : t.img ? `<div class="h-img" style="background-image:url('${t.img}')"></div>` : '';
  return `<header class="hero2">${img}<div class="h-ov"></div><div class="h-pat"></div>${img ? '' : `<div class="h-art">${icon(t.art)}</div>`}
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
  ACT.sheetDelete = async () => { if (cfg?.del && confirm('Delete this entry? · মুছে ফেলবেন?')) { await cfg.del(); close(); toast('Deleted'); route(); } };
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
  el.innerHTML = `<i class="sdot"></i><span>${cls === 'ok' ? 'Synced' : cls === 'busy' ? 'Syncing' : cls === 'err' ? 'Sync error' : cls === 'off' ? 'Offline' : 'On device'}</span>`;
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
  const a = ageOn(Child.birth), nm = await nextMilestone(), nv = await nextVaccine();
  const growth = (await DB.list('growth')).sort((x, y) => y.date.localeCompare(x.date));
  const gw = growth.find(x => x.weight != null), gh = growth.find(x => x.height != null);
  const items = await galleryItems(), photos = items.slice(0, 10);
  const words = await DB.list('word'), msAll = (await DB.list('milestone')).filter(m => m.achieved);
  const ev = (await timelineEvents()).slice(0, 4);
  const h = new Date().getHours(), greet = h < 12 ? ['Good morning', 'সুপ্রভাত'] : h < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা'];
  // next birthday countdown
  const b = parseDate(Child.birth); let nb = new Date(new Date().getFullYear(), b.getMonth(), b.getDate()); if (nb < parseDate(todayISO())) nb = new Date(nb.getFullYear() + 1, b.getMonth(), b.getDate());
  const toBday = daysBetween(new Date(), nb), turning = nb.getFullYear() - b.getFullYear(), bdayPct = Math.max(3, Math.min(100, (365 - toBday) / 365 * 100));
  const band = nm ? nm.band : null, bandDone = band ? band.items.length - nm.left : 0;
  const epi = EPI.filter(v => v.group === 'epi'), vxm = await vaccineMap(), epiDone = epi.filter(v => vxm[v.id]?.given).length;
  const [first, ...rest] = esc(Child.name).split(' ');
  const nW = words.filter(w => w.type !== 'skill').length, nBn = words.filter(w => w.type !== 'skill' && w.lang === 'bn').length;
  const lastWord = words.filter(w => w.type !== 'skill').sort((x, y) => y.date.localeCompare(x.date))[0];
  return `${pageHead(Child.name, Child.nameBn, '', '', { eyebrow: `${greet[0]} · <span class="bn">${greet[1]}</span>`, title: `${first} <em>${rest.join(' ')}</em>` })}
  <div class="agecard" role="group" aria-label="Age today">
    <div class="agerow">
      <div><div class="n">${a.y}</div><div class="u">${a.y === 1 ? 'year' : 'years'}</div><div class="u bn">${bnNum(a.y)} বছর</div></div><span class="sep"></span>
      <div><div class="n">${a.m}</div><div class="u">${a.m === 1 ? 'month' : 'months'}</div><div class="u bn">${bnNum(a.m)} মাস</div></div><span class="sep"></span>
      <div><div class="n">${a.d}</div><div class="u">${a.d === 1 ? 'day' : 'days'}</div><div class="u bn">${bnNum(a.d)} দিন</div></div>
      <div class="dayn"><div class="eyebrow">Day</div><div class="mono">${a.days.toLocaleString()}</div><div class="u bn">${bnNum(a.days)} তম দিন</div></div>
    </div>
    <div class="agebar"><span>🎂</span><div class="meter"><i style="width:${bdayPct}%"></i></div><span>${toBday === 0 ? `<b>Happy birthday!</b>` : `<b class="mono">${toBday}</b> days to his ${ordinal(turning)}`}</span></div>
  </div>
  <div class="pad">
    <div class="jgrid" style="margin-top:6px">
      <button class="jtile" data-act="go" data-to="play">
        <div class="j-img" style="background-image:url('./img/hero-affaan.jpg')"></div><div class="j-ov" style="background:linear-gradient(165deg,rgba(42,27,107,.55),rgba(107,63,176,.9))"></div>
        <div class="j-in"><div><div class="eyebrow">Together · 10–15 min</div><b>Play</b><div class="jbn">একসাথে খেলি</div></div>
          <div><div class="jmeta">Letters · numbers · stories · bubbles</div><span class="jopen">Start ${icon('arrow')}</span></div></div>
      </button>
      <button class="jtile" data-act="go" data-to="gallery">
        ${photos[0] && photos[0].type === 'photo' ? `<img class="j-img" data-photo="${esc(photos[0].photoId)}" alt="">` : `<div class="j-img" style="background-image:url('./img/bg-affaan.jpg')"></div>`}<div class="j-ov" style="background:linear-gradient(165deg,rgba(11,70,82,.35),rgba(14,107,107,.9))"></div>
        <div class="j-in"><div><div class="eyebrow">Memories</div><b>Gallery</b><div class="jbn">গ্যালারি</div></div>
          <div><div class="jmeta">${items.length} photos & videos</div><span class="jopen">Open ${icon('arrow')}</span></div></div>
      </button>
    </div>

    ${shead('🌱', 'Watch next', 'পরবর্তী')}
    <div class="wgrid2">
      <button class="card wcard2 full" data-act="go" data-to="dev/milestones/${band ? band.id : ''}" style="--wc:${nm ? DEV_TAGS[nm.item.tag].color : 'var(--ok)'}">
        <span class="wk">${nm && nm.overdue ? 'Check this milestone' : 'Next milestone'} · ${nm ? DEV_TAGS[nm.item.tag].en : ''}${icon('star')}</span>
        ${nm ? `<b>${esc(nm.item.en)}</b><span class="bn sm" style="color:var(--slate)">${esc(nm.item.bn)}</span>
          <span class="sm">by ${band.en} · ${bandDone}/${band.items.length} recorded</span><div class="meter"><i style="width:${bandDone / band.items.length * 100}%"></i></div>` : '<b>All CDC milestones to 5 years recorded 🎉</b>'}
      </button>
      <button class="card wcard2" data-act="go" data-to="health/vaccines" style="--wc:${nv.overdue.length ? 'var(--red)' : 'var(--ok)'}">
        <span class="wk">Vaccines ${icon('syringe')}</span>
        ${nv.overdue.length ? `<b>${nv.overdue.length} EPI ${nv.overdue.length === 1 ? 'dose' : 'doses'} to record</b><span class="sm">from his EPI card</span>`
      : nv.next ? `<b>${esc(nv.next.v.en)}</b><span class="sm mono">due ${fmtDate(nv.next.due)}</span>` : '<b>EPI complete ✓</b><span class="sm">all routine doses</span>'}
        <div class="meter"><i style="width:${epiDone / epi.length * 100}%"></i></div>
      </button>
      <button class="card wcard2" data-act="go" data-to="dev/growth" style="--wc:var(--blue)">
        <span class="wk">Growth ${icon('ruler')}</span>
        ${gw || gh ? `<b><span class="mono">${gw ? gw.weight + ' kg' : ''}${gw && gh ? ' · ' : ''}${gh ? gh.height + ' cm' : ''}</span></b><span class="sm">${fmtDate((gw || gh).date)}</span>` : '<b>Add weight & height</b><span class="sm">charts build as you go</span>'}
      </button>
    </div>

    ${ev.length ? `${shead('🕰️', 'Recently', 'সাম্প্রতিক', '<button class="linkbtn" data-act="homeTimeline">All</button>')}
    <div class="card tlstrip">${ev.map(e => `<button class="tlrow" ${e.go ? `data-act="go" data-to="${e.go}"` : e.photo ? `data-act="viewPhoto" data-id="${esc(e.photo)}"` : ''}><span class="tagdot" style="background:${e.color}"></span><span class="d">${fmtDate(e.date).replace(/ \d{4}$/, '')}</span><span class="grow"><b>${esc(e.en)}</b><span class="s">${ageShort(Child.birth, e.date)}</span></span></button>`).join('')}</div>` : ''}

    ${shead('📸', 'Latest photos', 'ছবি', '<button class="linkbtn" data-act="go" data-to="gallery">See all</button>')}
    ${photos.length ? `<div class="strip">${photos.map(p => `<button class="sthumb" data-act="viewPhoto" data-id="${esc(p.photoId)}">${Media.img(p.photoId)}${p.type === 'video' ? `<i class="vbadge">${icon('video')}</i>` : ''}</button>`).join('')}</div>`
      : `<button class="dropzone" data-act="quickPhoto">${icon('camera')} Add his first photo · <span class="bn">প্রথম ছবি</span></button>`}

    <div class="card story" style="margin-top:16px">
      <div class="eyebrow">The story so far</div>
      <p>${esc(Child.first())} is ${ageText(a)} old — day ${a.days.toLocaleString()} of his life.
        ${msAll.length || nW || items.length ? `You've recorded <strong>${msAll.length} ${msAll.length === 1 ? 'milestone' : 'milestones'}</strong>, <strong>${nW} ${nW === 1 ? 'word' : 'words'}</strong>${nBn ? ` (${nBn} in Bangla)` : ''} and <strong>${items.length} photos</strong>.` : 'Every photo, first word and milestone you add here becomes his story.'}
        ${lastWord ? ` His newest word: <strong>“${esc(lastWord.word)}”</strong>.` : ''}</p>
      <p class="bn" style="margin-top:6px;font-size:12.5px">${esc(Child.nameBn || '')} — ${ageTextBn(a)}।</p>
    </div>
  </div>`;
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
        <label class="btn">Restore… <input type="file" accept=".zip,application/zip" data-change="restoreZip" hidden></label></div>
      <p class="muted sm" id="backupMsg"></p>
      ${!persisted && navigator.storage?.persist ? '<button class="linkbtn" data-act="persist">Ask the browser to never evict this data</button>' : persisted ? '<p class="muted sm">✓ Browser storage is marked persistent.</p>' : ''}
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
ACT.backupNow = async () => { const m = $('#backupMsg'); try { await Backup.exportZip(t => m.textContent = t); } catch (e) { m.textContent = 'Backup failed: ' + e.message; } };
ACT.restoreZip = async el => {
  const f = el.files[0]; el.value = ''; if (!f) return; const m = $('#backupMsg');
  if (!confirm(`Restore from ${f.name}? Records are merged — for each item, the most recently edited version wins.`)) return;
  try { const r = await Backup.restoreZip(f, t => m.textContent = t); toast(`Restored ${r.records} records, ${r.photos} photos`); await Child.load(); route(); } catch (e) { m.textContent = 'Restore failed: ' + e.message; }
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
  $('#nav').innerHTML = [['home', 'home', 'Home', 'হোম'], ['play', 'play', 'Play', 'খেলা'], ['dev', 'dev', 'Growth', 'বিকাশ'], ['health', 'health', 'Health', 'স্বাস্থ্য'], ['gallery', 'gallery', 'Gallery', 'গ্যালারি'], ['reports', 'reports', 'Reports', 'রিপোর্ট']]
    .map(([to, ic, en, bn]) => `<button data-act="go" data-to="${to}" style="--nc:${THEMES[to].nc};--ns:${THEMES[to].nc}1C"><span class="nwrap">${icon(ic)}</span><span>${en}</span><span class="bn">${bn}</span></button>`).join('');
  $('#fab').innerHTML = icon('plus');
  Lock.start(async () => { await migrateV4(); route(); });
  Bus.on('unlocked', () => route());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });
  window.addEventListener('online', () => document.body.classList.remove('is-offline'));
  window.addEventListener('offline', () => document.body.classList.add('is-offline'));
  if (!navigator.onLine) document.body.classList.add('is-offline');
}
document.addEventListener('DOMContentLoaded', boot);
