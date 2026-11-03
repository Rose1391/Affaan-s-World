/* ============ GALLERY & TIMELINE ============ */
const GQ = { q: '', month: '', tag: '', mode: 'photos' };
const SUGGESTED_TAGS = ['family', 'outing', 'play', 'food', 'firsts', 'eid', 'birthday', 'nana-nani', 'dada-dadi', 'school', 'everyday'];
Views.gallery = async () => {
  const all = await galleryItems();
  const months = [...new Set(all.map(i => (i.date || '').slice(0, 7)).filter(Boolean))].sort().reverse();
  const tagsAll = [...new Set(all.flatMap(i => i.tags || []))].sort();
  const q = GQ.q.toLowerCase();
  const items = all.filter(i => (!GQ.month || (i.date || '').startsWith(GQ.month)) && (!GQ.tag || (i.tags || []).includes(GQ.tag))
    && (!q || (i.caption || '').toLowerCase().includes(q) || (i.tags || []).some(t => t.includes(q)) || (i.milestoneId && (CDC_BY_ID[i.milestoneId]?.en || '').toLowerCase().includes(q))));
  const filters = `<div class="gfilters">
      <label class="search">${icon('search')}<input type="search" placeholder="Search caption or tag · খুঁজুন" value="${esc(GQ.q)}" data-input="gSearch" aria-label="Search"></label>
      <select data-change="gMonth" aria-label="Month"><option value="">All months</option>${months.map(m => `<option value="${m}" ${GQ.month === m ? 'selected' : ''}>${fmtMonth(m)}</option>`).join('')}</select></div>
    ${tagsAll.length ? `<div class="chips filt"><button class="chip ${!GQ.tag ? 'on' : ''}" data-act="gTag" data-v="">All tags</button>${tagsAll.map(t => `<button class="chip ${GQ.tag === t ? 'on' : ''}" data-act="gTag" data-v="${esc(t)}">#${esc(t)}</button>`).join('')}</div>` : ''}`;
  let body;
  if (GQ.mode === 'timeline') body = await timelineHTML();
  else if (!items.length) body = all.length ? empty('No photos match.', 'মিলছে না') : `<label class="dropzone big">${icon('camera')}<b>Add photos & videos</b><span class="bn">ছবি ও ভিডিও যোগ করুন</span><input type="file" accept="image/*,video/*" multiple data-change="gPick" hidden></label>`;
  else {
    const by = {}; items.forEach(i => (by[(i.date || '????-??').slice(0, 7)] = by[(i.date || '????-??').slice(0, 7)] || []).push(i));
    body = Object.entries(by).map(([m, list]) => `<h4 class="subh">${m.includes('?') ? 'Undated' : fmtMonth(m) + ' <span class="bn">' + fmtMonthBn(m) + '</span>'} <span class="muted">${list.length}</span></h4>
      <div class="ggrid">${list.map(i => `<button class="gt" data-act="viewPhoto" data-id="${esc(i.photoId)}">${Media.img(i.photoId)}${i.type === 'video' ? `<i class="vbadge">${icon('video')}</i>` : ''}${i.milestoneId ? `<i class="mbadge">${icon('star')}</i>` : ''}</button>`).join('')}</div>`).join('');
  }
  return `${pageHead('Gallery & timeline', 'গ্যালারি ও সময়রেখা', `${all.length} photos & videos · ${months.length} months`, `<label class="btn sm">${icon('camera')} Add<input type="file" accept="image/*,video/*" multiple data-change="gPick" hidden></label>`)}
  <div class="pad">${tabs([['photos', 'Photos', 'ছবি'], ['timeline', 'Timeline', 'সময়রেখা']], GQ.mode, 'gMode')}${GQ.mode === 'photos' ? filters : ''}${body}</div>`;
};
ACT.gMode = el => { GQ.mode = el.dataset.v; route(); };
ACT.gSearch = debounce(el => { GQ.q = el.value; route().then(() => { const i = $('.search input'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 350);
ACT.gMonth = el => { GQ.month = el.value; route(); };
ACT.gTag = el => { GQ.tag = el.dataset.v; route(); };
ACT.quickPhoto = () => { Sheet.close(); const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,video/*'; i.multiple = true; i.onchange = () => addMediaSheet([...i.files]); i.click(); };
ACT.gPick = el => { const files = [...el.files]; el.value = ''; if (files.length) addMediaSheet(files); };

async function milestoneOptions(sel = '') {
  const ms = await milestoneState(); const age = ageOn(Child.birth).months;
  const opts = [['', '— none —']];
  CDC_BANDS.filter(b => b.months <= age + 18).forEach(b => b.items.forEach(i => opts.push([i.id, `${ms[i.id]?.achieved ? '✓ ' : ''}${b.en}: ${i.en.slice(0, 60)}`])));
  return opts;
}
async function addMediaSheet(files) {
  const date = files[0]?.lastModified ? isoDate(new Date(files[0].lastModified)) : todayISO();
  Sheet.open({
    title: `${files.length} ${files.length === 1 ? 'item' : 'items'} · <span class="bn">নতুন ছবি</span>`,
    body: `<div class="previews">${files.slice(0, 12).map(f => f.type.startsWith('video/') ? `<span class="pth"><span class="vid">${icon('video')}</span></span>` : `<span class="pth"><img src="${URL.createObjectURL(f)}" alt=""></span>`).join('')}${files.length > 12 ? `<span class="muted">+${files.length - 12}</span>` : ''}</div>
      ${F.row(F.date('date', 'Date', 'তারিখ', date), '<label class="fld"><span class="lbl">Use each file\'s own date</span><input type="checkbox" name="ownDate" checked class="cbx"></label>')}
      ${F.text('caption', 'Caption', 'ক্যাপশন', '', 'placeholder="What was happening?"')}
      ${F.text('tags', 'Tags', 'ট্যাগ', '', 'placeholder="family, outing" list="tagSugg"')}<datalist id="tagSugg">${SUGGESTED_TAGS.map(t => `<option value="${t}">`).join('')}</datalist>
      ${F.select('milestoneId', 'Link to a milestone', 'মাইলফলকের সাথে যুক্ত', await milestoneOptions())}
      <p class="muted sm">Originals stay on this phone. Photos sync as ~150 KB copies; videos stay on device (included in Backup).</p>`,
    saveLabel: 'Add to gallery',
    save: async fd => {
      const tags = val(fd, 'tags').split(',').map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean);
      const btn = $('#sheet [type=submit]'); let n = 0;
      for (const f of files) {
        btn.textContent = `Saving ${++n}/${files.length}…`;
        const p = await Media.save(f);
        await DB.put('media', { photoId: p.id, date: fd.get('ownDate') ? p.takenAt : val(fd, 'date'), caption: val(fd, 'caption'), tags, milestoneId: val(fd, 'milestoneId'), type: f.type.startsWith('video/') ? 'video' : 'photo' });
      }
      const ms = val(fd, 'milestoneId');
      if (ms) { const r = await DB.data('ms:' + ms); if (!r?.achieved) await DB.put('milestone', { ...(r || {}), band: CDC_BY_ID[ms].band, achieved: val(fd, 'date'), photoIds: r?.photoIds || [] }, 'ms:' + ms); }
    }
  });
}

/* ---------- viewer ---------- */
ACT.viewPhoto = async el => {
  const id = el.dataset.id, items = await galleryItems(), it = items.find(i => i.photoId === id), p = await DB.data(id);
  if (!it || !p) return;
  const b = await DB.blob.get(id), isMedia = it.src === 'media', m = isMedia ? await DB.data(it.recId) : null;
  const media = p.type === 'video' ? (b?.original ? `<video controls playsinline src="${await Media.url(id, 'full')}"></video>` : `<div class="empty">Video is on the other parent's phone (videos don't sync).</div>`) : Media.img(id, 'full', 'vimg');
  Sheet.open({
    title: `${fmtDate(it.date)} <span class="muted sm">${it.date ? ageShort(Child.birth, it.date) : ''}</span>`,
    body: `<div class="viewer">${media}</div>
      ${isMedia ? `${F.row(F.date('date', 'Date', 'তারিখ', m.date), F.text('tags', 'Tags', 'ট্যাগ', (m.tags || []).join(', ')))}${F.text('caption', 'Caption', 'ক্যাপশন', m.caption || '')}${F.select('milestoneId', 'Linked milestone', 'মাইলফলক', await milestoneOptions(), m.milestoneId || '')}`
      : `<p class="muted">${esc(it.caption)} <span class="pill">from ${it.src}</span></p>`}
      <div class="kv sm"><span>Original</span><b>${b?.original ? fmtBytes(b.original.size) + ' on this device' : 'not on this device'}${p.remote ? ' · ☁︎ synced copy ' + fmtBytes(p.size || 0) : p.type === 'photo' ? ' · not yet synced' : ' · device only'}</b></div>
      ${b?.original ? `<button type="button" class="linkbtn" data-act="dlOriginal" data-id="${id}">${icon('download')} Save original</button>` : ''}`,
    save: isMedia ? async fd => { await DB.put('media', { ...m, date: val(fd, 'date'), caption: val(fd, 'caption'), tags: val(fd, 'tags').split(',').map(t => t.trim().toLowerCase()).filter(Boolean), milestoneId: val(fd, 'milestoneId') }, it.recId); } : null,
    del: isMedia ? async () => { await DB.del(it.recId); await DB.del(id); Media.forget(id); } : null,
    focus: false
  });
};
ACT.dlOriginal = async el => { const b = await DB.blob.get(el.dataset.id); const ext = (b.mime || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg').replace('quicktime', 'mov'); downloadBlob(b.original, `affaan-${el.dataset.id.slice(0, 8)}.${ext}`); };

/* ---------- timeline: everything, by date ---------- */
const EV_COLORS = { camera: '#0E8C8C', star: '#1B8A5A', chat: '#1B3A8F', ruler: '#1B3A8F', syringe: '#8B1E2D', steth: '#8B1E2D', thermo: '#A82838', note: '#C9A14A' };
async function timelineEvents() {
  const ev = [];
  const push = (date, ic, en, sub = '', photo = '', go = '') => date && ev.push({ date, ic, en, sub, photo, go, color: EV_COLORS[ic] || '#8C857F' });
  for (const g of await galleryItems()) if (g.src === 'media') push(g.date, 'camera', g.caption || (g.type === 'video' ? 'Video' : 'Photo'), (g.tags || []).map(t => '#' + t).join(' '), g.photoId);
  for (const m of await DB.list('milestone')) if (m.achieved) { const it = CDC_BY_ID[m.id.slice(3)]; push(m.achieved, 'star', it?.en || 'Milestone', `<span class="bn">${esc(it?.bn || '')}</span>`, (m.photoIds || [])[0], 'dev/milestones/' + m.band); }
  for (const w of await DB.list('word')) push(w.date, 'chat', `${w.type === 'skill' ? 'New skill' : 'New word'}: “${w.word}”`, '', '', 'dev/words');
  for (const g of await DB.list('growth')) push(g.date, 'ruler', [g.weight && g.weight + ' kg', g.height && g.height + ' cm', g.head && 'head ' + g.head + ' cm'].filter(Boolean).join(' · '), '', '', 'dev/growth');
  for (const v of await DB.list('vaccine')) if (v.given) { const e = EPI.find(x => x.id === v.id.slice(3)); push(v.given, 'syringe', 'Vaccine: ' + (e?.en || v.id), '', '', 'health/vaccines'); }
  for (const v of await DB.list('vaccine_custom')) if (v.given) push(v.given, 'syringe', 'Vaccine: ' + v.name, '', '', 'health/vaccines');
  for (const v of await DB.list('visit')) push(v.date, 'steth', 'Doctor visit: ' + (v.reason || ''), esc(v.doctor || ''), '', 'health/visits');
  for (const i of await DB.list('illness')) push(i.start, 'thermo', 'Illness: ' + i.name, '', '', 'health/illness');
  for (const j of await DB.list('journal')) push(j.date, 'note', j.title, esc(j.type || ''), (j.photoIds || [])[0], 'dev/journal');
  return ev.sort((a, b) => b.date.localeCompare(a.date));
}
async function timelineHTML() {
  const ev = await timelineEvents();
  if (!ev.length) return empty('Your timeline fills up as you add photos, milestones, words and health records.', 'সবকিছু তারিখ অনুযায়ী এখানে দেখা যাবে');
  let lastM = '';
  return `<div class="timeline">${ev.slice(0, 400).map(e => { const m = e.date.slice(0, 7); const h = m !== lastM ? `<h4 class="subh">${fmtMonth(m)} <span class="bn">${fmtMonthBn(m)}</span></h4>` : ''; lastM = m;
    return `${h}<button class="tl" ${e.photo && !e.go ? `data-act="viewPhoto" data-id="${esc(e.photo)}"` : e.go ? `data-act="go" data-to="${e.go}"` : ''}><span class="tl-ic" style="background:${e.color}17;color:${e.color}">${icon(e.ic)}</span><span class="grow"><b>${esc(e.en)}</b><span class="sm muted">${fmtDate(e.date)} · ${ageShort(Child.birth, e.date)}${e.sub ? ' · ' + e.sub : ''}</span></span>${e.photo ? Media.img(e.photo, 'thumb', 'tl-ph') : ''}</button>`; }).join('')}</div>`;
}
