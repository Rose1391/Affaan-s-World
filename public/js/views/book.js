/* ============ STORYBOOK — every month becomes a picture-book page; every year a printable book ============ */
const Book = (() => {
  const chapterOf = ym => { const b = parseDate(Child.birth); const [y, m] = ym.split('-').map(Number); return (y - b.getFullYear()) * 12 + (m - 1 - b.getMonth()) + 1; };
  async function month(ym) {
    const inM = d => (d || '').startsWith(ym);
    const ms = (await DB.list('milestone')).filter(m => inM(m.achieved)).map(m => ({ ...m, it: CDC_BY_ID[m.id.slice(3)] })).filter(m => m.it).sort((a, b) => a.achieved.localeCompare(b.achieved));
    const words = (await DB.list('word')).filter(w => inM(w.date)).sort((a, b) => a.date.localeCompare(b.date));
    const photos = (await galleryItems()).filter(p => inM(p.date) && p.type === 'photo');
    const media = await DB.list('media'), favs = new Set(media.filter(m => m.fav).map(m => m.photoId));
    photos.sort((a, b) => (favs.has(b.photoId) - favs.has(a.photoId)) || b.date.localeCompare(a.date));
    const growth = (await DB.list('growth')).filter(g => g.date <= ym + '-31').sort((a, b) => a.date.localeCompare(b.date));
    const gw = [...growth].reverse().find(g => g.weight != null), gh = [...growth].reverse().find(g => g.height != null);
    const journal = (await DB.list('journal')).filter(j => inM(j.date));
    const note = (await DB.data('mn:' + ym))?.text || '';
    const end = isoDate(new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0)), a = ageOn(Child.birth, parseDate(end < todayISO() ? end : todayISO()));
    const [y, m] = ym.split('-').map(Number), b1 = Cal.bangla(y, m - 1, 1), b2 = Cal.bangla(y, m - 1, new Date(y, m, 0).getDate());
    // the title writes itself from the month's biggest moment
    const lead = ms[0]?.it.en.split(/,| like | when /)[0].replace(/^(\w)/, c => c.toLowerCase());
    const title = ms.length ? `The month he ${lead.replace(/^(says|points|kicks|runs|walks|eats|uses|plays|notices|looks|holds|tries|shows|follows|names|takes|jumps|turns|talks|asks|draws|avoids|strings|puts|calms|catches|serves|unbuttons|buttons|hops|counts|writes|sings|does|tells|answers|keeps|comforts|likes|changes|pretends)\b/, w => ({ says: 'said', points: 'pointed', kicks: 'kicked', runs: 'ran', walks: 'walked', eats: 'ate', uses: 'used', plays: 'played', notices: 'noticed', looks: 'looked', holds: 'held', tries: 'tried', shows: 'showed', follows: 'followed', names: 'named', takes: 'took', jumps: 'jumped', turns: 'turned', talks: 'talked', asks: 'asked', draws: 'drew', avoids: 'avoided', strings: 'strung', puts: 'put', calms: 'calmed', catches: 'caught', serves: 'served', unbuttons: 'unbuttoned', buttons: 'buttoned', hops: 'hopped', counts: 'counted', writes: 'wrote', sings: 'sang', does: 'did', tells: 'told', answers: 'answered', keeps: 'kept', comforts: 'comforted', likes: 'liked', changes: 'changed', pretends: 'pretended' }[w] || w))}`
      : words.length ? `The month of “${words[0].word}”` : photos.length ? 'A month of little moments' : journal.length ? journal[0].title : 'A quiet month';
    return { ym, ch: chapterOf(ym), title, ms, words, photos, gw, gh, journal, note, a, bnMonths: b1.month === b2.month ? b1.month : `${b1.month}–${b2.month}`, bnYear: b2.y };
  }
  // one page; imgFn decides how photos are embedded (live ids on screen, data URIs in print)
  function page(D, img) {
    const ph = D.photos.slice(0, 4);
    return `<article class="sbook">
      <div class="sb-top"><span class="sb-ch">Chapter ${D.ch}</span><span class="sb-mon">${fmtMonth(D.ym)} · <span class="bn">${D.bnMonths} ${bnNum(D.bnYear)}</span></span></div>
      <h2 class="sb-title">${esc(D.title)}</h2>
      ${ph.length ? `<div class="sb-photos n${ph.length}">${ph.map((p, i) => `<figure class="${i === 0 ? 'hero' : ''}">${img(p.photoId, i === 0)}</figure>`).join('')}</div>` : `<div class="sb-empty">🌱 No photos this month</div>`}
      <div class="sb-cols">
        <div><h4>🌸 Milestones</h4>${D.ms.length ? `<ul>${D.ms.map(m => `<li>${esc(m.it.en.split(/,| like /)[0])} <small>${fmtDate(m.achieved).replace(/ \d{4}$/, '')}</small></li>`).join('')}</ul>` : '<p class="sb-dim">Growing quietly</p>'}</div>
        <div><h4>🍃 New words</h4>${D.words.length ? `<p class="sb-words">${D.words.map(w => `<span class="${w.lang === 'bn' ? 'bn' : ''}">${esc(w.word)}</span>`).join(' ')}</p>` : '<p class="sb-dim">Listening and learning</p>'}</div>
      </div>
      <div class="sb-grow">📏 ${D.gh ? D.gh.height + ' cm' : '—'} · ⚖️ ${D.gw ? D.gw.weight + ' kg' : '—'} · ${D.a.y}y ${D.a.m}m${D.journal.length ? ` · 📝 ${esc(D.journal.map(j => j.title).slice(0, 2).join(', '))}` : ''}</div>
      <blockquote class="sb-note" ${img === liveImg ? `data-act="noteEdit" data-ym="${D.ym}"` : ''}>${D.note ? esc(D.note) : (img === liveImg ? 'Tap to write a few words from Ammu & Abbu… · আম্মু-আব্বুর কথা' : '')}</blockquote>
      <div class="sb-foot">${esc(Child.name)} · ${esc(Child.nameBn || '')}</div></article>`;
  }
  const liveImg = (id, big) => Media.img(id, big ? 'full' : 'thumb');
  async function dataImg(id, big) { const u = await Media.url(id, big ? 'full' : 'thumb'); if (!u) return ''; const b = await (await fetch(u)).blob(); return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); }
  async function printablePage(D) { const srcs = {}; for (const [i, p] of D.photos.slice(0, 4).entries()) srcs[p.photoId] = await dataImg(p.photoId, i === 0); return page(D, (id) => `<img src="${srcs[id] || ''}">`); }
  const CSS = `@page{size:A4;margin:12mm}body{margin:0;background:#fff;font-family:Georgia,"Noto Serif Bengali","Hind Siliguri",serif;color:#2B2620}
    .sbook{page-break-after:always;break-after:page;max-width:180mm;margin:0 auto;padding:10mm 4mm;min-height:250mm;box-sizing:border-box;position:relative}
    .sb-top{display:flex;justify-content:space-between;font:600 11px/1 sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#9A6A0B}
    .sb-title{font:italic 600 30px/1.15 Georgia,serif;margin:14px 0 14px;color:#2E5A2E}
    .sb-photos{display:grid;gap:6px;grid-template-columns:2fr 1fr;grid-auto-rows:62mm}.sb-photos.n1{grid-template-columns:1fr;grid-auto-rows:110mm}.sb-photos.n2{grid-template-columns:1fr 1fr;grid-auto-rows:80mm}
    .sb-photos figure{margin:0;overflow:hidden;border-radius:8px;border:4px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2)}.sb-photos figure.hero{grid-row:span 3}.sb-photos.n2 figure.hero,.sb-photos.n1 figure.hero{grid-row:auto}.sb-photos.n3 figure.hero{grid-row:span 2}.sb-photos.n4 figure.hero{grid-row:span 3}
    .sb-photos img{width:100%;height:100%;object-fit:cover;display:block}
    .sb-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px}.sb-cols h4{font:700 12px sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4F7A3A;margin:0 0 6px}
    .sb-cols ul{margin:0;padding-left:18px;font-size:14px;line-height:1.5}.sb-cols small{color:#958A7C;font-size:11px}.sb-words{font-size:16px;line-height:1.8}.sb-words span{display:inline-block;padding:0 8px;margin:2px;border-radius:12px;background:#EEF6E6}
    .sb-dim{color:#958A7C;font-style:italic}.sb-grow{margin-top:12px;font:13px sans-serif;color:#5A5148}
    .sb-note{margin:16px 0 0;padding:12px 16px;border-left:3px solid #E0A526;background:#FFF8EC;font-style:italic;font-size:15px;min-height:20px}
    .sb-foot{position:absolute;bottom:4mm;left:0;right:0;text-align:center;font:11px sans-serif;color:#B0A494;letter-spacing:.1em}
    .cover{page-break-after:always;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260mm;text-align:center}
    .cover img{width:120mm;height:120mm;object-fit:cover;border-radius:50%;border:6px solid #F2C14E}.cover h1{font:italic 600 44px Georgia,serif;color:#2E5A2E;margin:18mm 0 4mm}.cover p{font:16px sans-serif;color:#9A6A0B;letter-spacing:.2em;text-transform:uppercase}
    .noprint{font:13px sans-serif;color:#958A7C;text-align:center;margin:8px}@media print{.noprint{display:none}}`;
  return { month, page, liveImg, printablePage, CSS, dataImg, chapterOf };
})();

let bookYm = todayISO().slice(0, 7);
async function storybookHTML() {
  const months = []; for (let d = parseDate(Child.birth); isoDate(d).slice(0, 7) <= todayISO().slice(0, 7); d = addMonths(new Date(d.getFullYear(), d.getMonth(), 1), 1)) months.push(isoDate(d).slice(0, 7));
  const D = await Book.month(bookYm), age = ageOn(Child.birth).y;
  return `<div class="toolbar"><select data-change="bookMonth" aria-label="Chapter">${months.reverse().map(m => `<option value="${m}" ${m === bookYm ? 'selected' : ''}>Ch. ${Book.chapterOf(m)} · ${fmtMonth(m)}</option>`).join('')}</select>
      <button class="btn" data-act="printChapter">${icon('print')} Print page</button></div>
    <div class="bookwrap">${Book.page(D, Book.liveImg)}</div>
    <p class="muted sm">Photos marked ⭐ Favourite in the gallery go first. The title writes itself from the month's biggest moment.</p>
    ${shead('📚', 'Year book', 'বার্ষিক বই')}
    <div class="btnrow">${Array.from({ length: age + 1 }, (_, k) => `<button class="btn ${k === age ? 'primary' : ''}" data-act="printYear" data-k="${k}">Year ${k + 1} · ${k}–${k + 1} yrs</button>`).join('')}</div>
    <p class="muted sm">A cover with his photo and one page for every month of that year — print it, or “Save as PDF” to keep forever.</p>`;
}
ACT.bookMonth = el => { bookYm = el.value; route(); };
ACT.noteEdit = async el => {
  const ym = el.dataset.ym, cur = (await DB.data('mn:' + ym))?.text || '';
  Sheet.open({ title: `A note for ${fmtMonth(ym)} · <span class="bn">মাসের কথা</span>`, body: F.area('text', 'In your words', 'আপনার কথায়', cur, 'rows="4" placeholder="What made this month special?"'),
    save: async fd => { await DB.put('monthnote', { text: val(fd, 'text') }, 'mn:' + ym); } });
};
ACT.printChapter = async () => { const D = await Book.month(bookYm); printBook(`${Child.first()} — Chapter ${D.ch}`, await Book.printablePage(D)); };
ACT.printYear = async el => {
  const k = +el.dataset.k, b = parseDate(Child.birth); toast('Building the year book…');
  let html = '', cover = '';
  const all = (await galleryItems()).filter(p => p.type === 'photo');
  const yEnd = isoDate(addMonths(b, 12 * (k + 1))), coverPhoto = all.find(p => p.date < yEnd) || all[0];
  if (coverPhoto) cover = await Book.dataImg(coverPhoto.photoId, true);
  html += `<section class="cover">${cover ? `<img src="${cover}">` : ''}<h1>${esc(Child.name)}</h1><p>Year ${k + 1} · ${k === 0 ? 'the first year' : `age ${k} to ${k + 1}`}</p><p class="bn" style="letter-spacing:0">${esc(Child.nameBn || '')}</p></section>`;
  for (let i = 0; i < 12; i++) { const d = addMonths(new Date(b.getFullYear(), b.getMonth(), 1), 12 * k + i), ym = isoDate(d).slice(0, 7); if (ym > todayISO().slice(0, 7)) break; html += await Book.printablePage(await Book.month(ym)); }
  printBook(`${Child.first()} — Year ${k + 1} book`, html);
};
function printBook(title, body) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${Book.CSS}</style></head><body><p class="noprint">Print → “Save as PDF” to keep a copy.</p>${body}</body></html>`;
  const blob = new Blob([doc], { type: 'text/html' }); const w = window.open(URL.createObjectURL(blob), '_blank');
  if (!w) { downloadBlob(blob, title.replace(/[^\w-]+/g, '-') + '.html'); return; }
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { } }, 900);
}
