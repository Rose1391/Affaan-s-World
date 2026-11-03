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
  const view = Views[name] || Views.home;
  if (curRoute.split('/')[0] !== name) window.scrollTo(0, 0);
  curRoute = h; Speech.stop();
  $$('#nav [data-to]').forEach(b => b.classList.toggle('on', b.dataset.to === name || (name === 'settings' && false)));
  const root = $('#view');
  try { root.innerHTML = await view(params); } catch (e) { console.error(e); root.innerHTML = `<div class="pad"><div class="empty">Something went wrong: ${esc(e.message)}</div></div>`; }
  Media.hydrate(root);
  if (view.after) view.after(params);
}
window.addEventListener('hashchange', route);
const rerender = debounce(() => { if (!$('#sheet.on') && !Lock.isLocked()) route(); }, 150);
Bus.on('remote', rerender);

/* ---------- page header helper ---------- */
function pageHead(en, bn, sub = '', actions = '') {
  return `<header class="phead"><div><h1>${esc(en)} <span class="bn">${esc(bn)}</span></h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions}</header>`;
}
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
  el.className = 'syncdot ' + cls; el.title = t; el.setAttribute('aria-label', t);
  el.innerHTML = icon(cls === 'off' ? 'cloudOff' : 'cloud') + `<span>${cls === 'ok' ? 'Synced' : cls === 'busy' ? 'Syncing' : cls === 'err' ? 'Error' : cls === 'off' ? 'Offline' : 'Local'}</span>`;
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
  const g = growth[0], photos = (await galleryItems()).slice(0, 8);
  const words = await DB.list('word');
  const month = todayISO().slice(0, 7);
  const thisMonth = (await DB.allRecords()).filter(r => !r.deleted && r.updatedAt.slice(0, 7) === month && !['photo', 'kv', 'settings', 'playsession'].includes(r.kind)).length;
  const h = new Date().getHours(), greet = h < 12 ? ['Good morning', 'সুপ্রভাত'] : h < 17 ? ['Good afternoon', 'শুভ অপরাহ্ন'] : ['Good evening', 'শুভ সন্ধ্যা'];
  return `
  <section class="hero">
    <div class="hero-txt">
      <p class="eyebrow">${greet[0]} · <span class="bn">${greet[1]}</span></p>
      <h1>${esc(Child.name)}</h1>
      <p class="age">${ageText(a)}</p>
      <p class="age bn">${ageTextBn(a)}</p>
      <p class="dayn">Day ${a.days.toLocaleString()} · <span class="bn">${bnNum(a.days)} তম দিন</span></p>
    </div>
    <img class="hero-img" src="./img/hero-affaan.jpg" alt="">
  </section>
  <div class="pad stack">
    <button class="playcta" data-act="go" data-to="play">
      <span class="pc-ic">${icon('play')}</span>
      <span><b>Play together</b><span class="bn">একসাথে খেলি</span><small>Letters, numbers, stories · 10–15 min</small></span>
    </button>
    <div class="cards2">
      <button class="card watch" data-act="go" data-to="dev/milestones/${nm ? nm.band.id : ''}">
        <span class="k">${icon('star')} ${nm && nm.overdue ? 'Check this milestone' : 'Next milestone to watch'}</span>
        ${nm ? `<b>${esc(nm.item.en)}</b><span class="bn sm">${esc(nm.item.bn)}</span>
          <span class="meta"><i class="tagdot" style="background:${DEV_TAGS[nm.item.tag].color}"></i>${DEV_TAGS[nm.item.tag].en} · by ${nm.band.en} · ${nm.left} left in band</span>` : '<b>All CDC milestones to 5 years recorded 🎉</b>'}
      </button>
      <button class="card" data-act="go" data-to="health/vaccines">
        <span class="k">${icon('syringe')} Vaccines · <span class="bn">টিকা</span></span>
        ${nv.overdue.length ? `<b class="warn">${nv.overdue.length} not yet recorded</b><span class="sm">Oldest: ${esc(nv.overdue[0].v.en)} (due ${fmtDate(nv.overdue[0].due)})</span>`
      : nv.next ? `<b>${esc(nv.next.v.en)}</b><span class="sm">Due ${fmtDate(nv.next.due)}</span>` : '<b>All recorded ✓</b>'}
      </button>
      <button class="card" data-act="go" data-to="dev/growth">
        <span class="k">${icon('ruler')} Growth · <span class="bn">বৃদ্ধি</span></span>
        ${g ? `<b>${g.weight ? g.weight + ' kg' : ''}${g.weight && g.height ? ' · ' : ''}${g.height ? g.height + ' cm' : ''}${!g.weight && !g.height && g.head ? 'Head ' + g.head + ' cm' : ''}</b><span class="sm">${fmtDate(g.date)}</span>` : '<b>No measurements yet</b><span class="sm">Add weight & height</span>'}
      </button>
      <button class="card" data-act="go" data-to="dev/words">
        <span class="k">${icon('chat')} Words & skills · <span class="bn">শব্দ</span></span>
        <b>${words.filter(w => w.type !== 'skill').length} words · ${words.filter(w => w.type === 'skill').length} skills</b><span class="sm">${thisMonth} records this month</span>
      </button>
    </div>
    <div class="sec-h"><h2>Latest photos <span class="bn">সাম্প্রতিক ছবি</span></h2><button class="linkbtn" data-act="go" data-to="gallery">See all</button></div>
    ${photos.length ? `<div class="strip">${photos.map(p => `<button class="sthumb" data-act="viewPhoto" data-id="${esc(p.photoId)}">${Media.img(p.photoId)}${p.type === 'video' ? `<i class="vbadge">${icon('video')}</i>` : ''}</button>`).join('')}</div>`
      : `<button class="dropzone" data-act="quickPhoto">${icon('camera')} Add his first photo · <span class="bn">প্রথম ছবি যোগ করুন</span></button>`}
  </div>`;
};

/* ---------- quick add ---------- */
ACT.quickAdd = () => Sheet.open({
  title: 'Quick add · <span class="bn">দ্রুত যোগ</span>',
  body: `<div class="qgrid">${[
    ['quickPhoto', 'camera', 'Photo / video', 'ছবি / ভিডিও'], ['addGrowth', 'ruler', 'Growth', 'ওজন ও উচ্চতা'], ['addWord', 'chat', 'First word / skill', 'নতুন শব্দ'],
    ['pickMilestone', 'star', 'Milestone', 'মাইলফলক'], ['addVisit', 'steth', 'Doctor visit', 'ডাক্তার'], ['addIllness', 'thermo', 'Illness', 'অসুখ'],
    ['addDoc', 'pill', 'Prescription / report', 'প্রেসক্রিপশন'], ['pickVaccine', 'syringe', 'Vaccine given', 'টিকা'], ['addJournal', 'note', 'Journal note', 'নোট']
  ].map(([a, i, en, bn]) => `<button type="button" class="qbtn" data-act="${a}">${icon(i)}<b>${en}</b><span class="bn">${bn}</span></button>`).join('')}</div>`
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
  return `${pageHead('Settings', 'সেটিংস')}
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
    .map(([to, ic, en, bn]) => `<button data-act="go" data-to="${to}">${icon(ic)}<span>${en}</span><span class="bn">${bn}</span></button>`).join('');
  $('#topActions').innerHTML = `<button id="syncDot" class="syncdot" data-act="go" data-to="settings"></button><button class="iconbtn" data-act="go" data-to="settings" aria-label="Settings">${icon('settings')}</button>`;
  $('#fab').innerHTML = icon('plus'); renderSyncDot();
  Lock.start(async () => { await migrateV4(); route(); });
  Bus.on('unlocked', () => route());
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });
  window.addEventListener('online', () => document.body.classList.remove('is-offline'));
  window.addEventListener('offline', () => document.body.classList.add('is-offline'));
  if (!navigator.onLine) document.body.classList.add('is-offline');
}
document.addEventListener('DOMContentLoaded', boot);
