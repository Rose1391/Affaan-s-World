/* ============ REPORTS: monthly summary · paediatrician summary (print/PDF) · learning ============ */
let repMonth = todayISO().slice(0, 7);
Views.reports = async ([tab = 'monthly']) => {
  const t = [['monthly', 'Monthly', 'মাসিক'], ['doctor', 'For the paediatrician', 'ডাক্তারের জন্য'], ['learning', 'Learning', 'শেখা']];
  const body = tab === 'doctor' ? await doctorPreview() : tab === 'learning' ? await learningHTML() : await monthlyHTML();
  return `${pageHead('Reports', 'রিপোর্ট', 'Monthly story · paediatrician summary · learning')}<div class="pad">${tabs(t, tab, 'repTab')}${body}</div>`;
};
ACT.repTab = el => go('reports/' + el.dataset.v);
ACT.repMonth = el => { repMonth = el.value; route(); };

async function monthData(ym) {
  const inM = d => (d || '').startsWith(ym);
  const end = isoDate(new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0));
  const ms = (await DB.list('milestone')).filter(m => inM(m.achieved)).map(m => ({ ...m, it: CDC_BY_ID[m.id.slice(3)] })).sort((a, b) => a.achieved.localeCompare(b.achieved));
  const growth = (await DB.list('growth')).sort((a, b) => a.date.localeCompare(b.date));
  const gIn = growth.filter(g => inM(g.date)), gBefore = growth.filter(g => g.date < ym + '-01');
  const words = (await DB.list('word')).filter(w => inM(w.date)).sort((a, b) => a.date.localeCompare(b.date));
  const vax = (await DB.list('vaccine')).filter(v => inM(v.given)).map(v => ({ ...v, e: EPI.find(x => x.id === v.id.slice(3)) }));
  const vaxC = (await DB.list('vaccine_custom')).filter(v => inM(v.given));
  const visits = (await DB.list('visit')).filter(v => inM(v.date));
  const ill = (await DB.list('illness')).filter(i => inM(i.start) || (i.start < ym && (!i.end || i.end >= ym + '-01')));
  const docs = (await DB.list('document')).filter(d => inM(d.date));
  const photos = (await galleryItems()).filter(p => inM(p.date));
  const play = (await DB.list('playsession')).filter(p => inM(p.date));
  const journal = (await DB.list('journal')).filter(j => inM(j.date));
  return { ym, end, ms, gIn, gBefore, words, vax, vaxC, visits, ill, docs, photos, play, journal };
}
const lastVal = (arr, k) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i][k] != null) return arr[i][k]; return null; };

async function monthlyHTML() {
  const months = []; for (let d = parseDate(Child.birth); isoDate(d).slice(0, 7) <= todayISO().slice(0, 7); d = addMonths(new Date(d.getFullYear(), d.getMonth(), 1), 1)) months.push(isoDate(d).slice(0, 7));
  const D = await monthData(repMonth);
  const a = ageOn(Child.birth, parseDate(D.end < todayISO() ? D.end : todayISO()));
  const delta = k => { const now = lastVal(D.gIn, k), before = lastVal(D.gBefore, k); if (now == null) return before == null ? '—' : `<span class="muted">${before}</span> <small class="muted">(earlier)</small>`; return `${now}${before != null ? ` <small class="${now - before >= 0 ? 'ok' : 'warn'}">(${now - before >= 0 ? '+' : ''}${(now - before).toFixed(1)})</small>` : ''}`; };
  const playMin = D.play.reduce((s, p) => s + p.minutes, 0);
  return `
  <div class="toolbar"><select data-change="repMonth" aria-label="Month">${months.reverse().map(m => `<option value="${m}" ${m === repMonth ? 'selected' : ''}>${fmtMonth(m)}</option>`).join('')}</select>
    <button class="btn" data-act="printMonthly">${icon('print')} Print / PDF</button></div>
  <div class="panel rep">
    <h3>${fmtMonth(repMonth)} · <span class="bn">${fmtMonthBn(repMonth)}</span></h3><p class="muted">${esc(Child.name)} · ${a.y}y ${a.m}m at month end</p>
    <div class="stats4">
      <div><b>${D.ms.length}</b><span>milestones</span></div><div><b>${D.words.filter(w => w.type !== 'skill').length}</b><span>new words</span></div>
      <div><b>${D.photos.length}</b><span>photos</span></div><div><b>${playMin}</b><span>play min</span></div></div>
    <div class="stats3"><div><b>${delta('weight')}</b><span>kg</span></div><div><b>${delta('height')}</b><span>cm</span></div><div><b>${delta('head')}</b><span>head cm</span></div></div>
    ${D.ms.length ? `<h4>Milestones · <span class="bn">মাইলফলক</span></h4><ul class="ticks">${D.ms.map(m => `<li>${esc(m.it?.en)} <span class="muted sm">${fmtDate(m.achieved)}</span><span class="bn">${esc(m.it?.bn)}</span></li>`).join('')}</ul>` : ''}
    ${D.words.length ? `<h4>Words & skills · <span class="bn">শব্দ ও দক্ষতা</span></h4><div class="wordcloud">${D.words.map(w => `<span class="wchip ${w.type === 'skill' ? 'skill' : ''}">${esc(w.word)}</span>`).join('')}</div>` : ''}
    ${D.vax.length + D.vaxC.length ? `<h4>Vaccines · <span class="bn">টিকা</span></h4><ul class="ticks">${D.vax.map(v => `<li>${esc(v.e?.en || v.id)} <span class="muted sm">${fmtDate(v.given)}</span></li>`).join('')}${D.vaxC.map(v => `<li>${esc(v.name)} <span class="muted sm">${fmtDate(v.given)}</span></li>`).join('')}</ul>` : ''}
    ${D.visits.length + D.ill.length ? `<h4>Health · <span class="bn">স্বাস্থ্য</span></h4><ul class="plain">${D.visits.map(v => `<li>🩺 ${fmtDate(v.date)} — ${esc(v.reason || 'Visit')}${v.diagnosis ? ': ' + esc(v.diagnosis) : ''}</li>`).join('')}${D.ill.map(i => `<li>🤒 ${esc(i.name)} — ${fmtDate(i.start)}${i.end ? ' to ' + fmtDate(i.end) : ' (ongoing)'}</li>`).join('')}</ul>` : ''}
    ${D.journal.length ? `<h4>Moments · <span class="bn">মুহূর্ত</span></h4><ul class="plain">${D.journal.map(j => `<li>${fmtDate(j.date)} — ${esc(j.title)}</li>`).join('')}</ul>` : ''}
    ${D.photos.length ? `<div class="strip">${D.photos.slice(0, 12).map(p => `<button class="sthumb" data-act="viewPhoto" data-id="${esc(p.photoId)}">${Media.img(p.photoId)}</button>`).join('')}</div>` : ''}
    ${!D.ms.length && !D.words.length && !D.gIn.length && !D.photos.length && !D.visits.length ? empty('Nothing recorded this month yet.', 'এই মাসে এখনও কিছু নেই') : ''}
  </div>`;
}

/* ---------- printable documents ---------- */
const PRINT_CSS = `body{font:12.5px/1.45 -apple-system,"Segoe UI",Roboto,"Noto Sans Bengali",sans-serif;color:#1d2533;margin:24px;max-width:820px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:18px 0 6px;padding-bottom:3px;border-bottom:1.5px solid #2E4A8F;color:#1E3468}
.sub{color:#5a6475;margin:2px 0 10px}table{border-collapse:collapse;width:100%;margin:4px 0}th,td{border:1px solid #d9dce3;padding:4px 6px;text-align:left;vertical-align:top}
th{background:#f1f3f8;font-weight:600}.ok{color:#2f855a}.warn{color:#c05621;font-weight:600}.muted{color:#6a7282}.bn{font-family:"Noto Sans Bengali",sans-serif}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.box{border:1px solid #d9dce3;border-radius:6px;padding:6px 8px}.box b{display:block;font-size:15px}
img.ph{width:110px;height:110px;object-fit:cover;border-radius:6px;margin:2px}.noprint{margin-bottom:14px}.noprint button{font-size:14px;padding:8px 14px;margin-right:6px}
@media print{.noprint{display:none}body{margin:10mm}h2{break-after:avoid}tr{break-inside:avoid}}`;
async function printDoc(title, html) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`;
  const blob = new Blob([doc], { type: 'text/html' });
  const w = window.open(URL.createObjectURL(blob), '_blank');
  if (!w) { downloadBlob(blob, title.replace(/[^\w-]+/g, '-') + '.html'); toast('Saved as HTML — open it and print'); return; }
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { } }, 700);
}
const imgData = async id => { const u = await Media.url(id, 'thumb'); if (!u) return ''; const b = await (await fetch(u)).blob(); return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); };
ACT.printMonthly = async () => {
  const D = await monthData(repMonth);
  const photos = await Promise.all(D.photos.slice(0, 12).map(p => imgData(p.photoId)));
  printDoc(`Affaan ${repMonth} summary`, `<p class="noprint muted">Use your browser's <b>Print → Save as PDF</b> to keep a copy.</p>
   <h1>${esc(Child.name)} — ${fmtMonth(repMonth)}</h1><p class="sub">Monthly summary · <span class="bn">মাসিক সারাংশ</span> · age ${ageText(ageOn(Child.birth, parseDate(D.end < todayISO() ? D.end : todayISO())))}</p>
   <div class="grid"><div class="box"><b>${D.ms.length}</b>milestones</div><div class="box"><b>${D.words.length}</b>words & skills</div><div class="box"><b>${D.gIn.length}</b>measurements</div><div class="box"><b>${D.photos.length}</b>photos</div></div>
   ${D.ms.length ? `<h2>Milestones achieved</h2><table>${D.ms.map(m => `<tr><td>${fmtDate(m.achieved)}</td><td>${esc(m.it?.en)}<br><span class="bn muted">${esc(m.it?.bn)}</span></td><td>${DEV_TAGS[m.it?.tag]?.en || ''}</td></tr>`).join('')}</table>` : ''}
   ${D.gIn.length ? `<h2>Growth</h2><table><tr><th>Date</th><th>Weight (kg)</th><th>Height (cm)</th><th>Head (cm)</th></tr>${D.gIn.map(g => `<tr><td>${fmtDate(g.date)}</td><td>${g.weight ?? ''}</td><td>${g.height ?? ''}</td><td>${g.head ?? ''}</td></tr>`).join('')}</table>` : ''}
   ${D.words.length ? `<h2>Words & skills</h2><p>${D.words.map(w => esc(w.word)).join(', ')}</p>` : ''}
   ${D.vax.length + D.visits.length + D.ill.length ? `<h2>Health</h2><ul>${D.vax.map(v => `<li>Vaccine: ${esc(v.e?.en || v.id)} — ${fmtDate(v.given)}</li>`).join('')}${D.visits.map(v => `<li>Visit ${fmtDate(v.date)}: ${esc(v.reason)} ${esc(v.diagnosis || '')}</li>`).join('')}${D.ill.map(i => `<li>Illness: ${esc(i.name)} ${fmtDate(i.start)}${i.end ? '–' + fmtDate(i.end) : ''}</li>`).join('')}</ul>` : ''}
   ${photos.filter(Boolean).length ? `<h2>Photos</h2>${photos.filter(Boolean).map(s => `<img class="ph" src="${s}">`).join('')}` : ''}`);
};

async function doctorData() {
  const a = ageOn(Child.birth), t = todayISO();
  const growth = (await DB.list('growth')).sort((x, y) => y.date.localeCompare(x.date));
  const done = await vaccineMap();
  const vrows = EPI.filter(v => v.group !== 'optional' || done[v.id]?.given).map(v => ({ v, due: vaccineDue(v), r: done[v.id] }));
  const custom = await DB.list('vaccine_custom');
  const ms = await milestoneState();
  const bands = CDC_BANDS.filter(b => b.months <= a.months + 6).map(b => ({ b, done: b.items.filter(i => ms[i.id]?.achieved), open: b.items.filter(i => !ms[i.id]?.achieved), past: b.months <= a.months }));
  const words = await DB.list('word');
  const visits = (await DB.list('visit')).sort((x, y) => y.date.localeCompare(x.date));
  const ill = (await DB.list('illness')).sort((x, y) => y.start.localeCompare(x.start));
  const meds = (await DB.list('document')).filter(d => d.docType === 'prescription').sort((x, y) => y.date.localeCompare(x.date));
  return { a, t, growth, vrows, custom, bands, words, visits, ill, meds };
}
async function doctorPreview() {
  const D = await doctorData();
  const concerns = D.bands.filter(x => x.past && x.open.length);
  return `<div class="toolbar"><span class="muted sm">A one-page summary to show or hand to the doctor.</span><button class="btn primary" data-act="printDoctor">${icon('print')} Print / Save PDF</button></div>
  <div class="panel rep">
    <h3>${esc(Child.name)}</h3><p class="muted">Born ${fmtDate(Child.birth)} · ${ageText(D.a)}</p>
    <div class="stats3"><div><b>${D.growth.find(g => g.weight != null)?.weight ?? '—'}</b><span>kg</span></div><div><b>${D.growth.find(g => g.height != null)?.height ?? '—'}</b><span>cm</span></div><div><b>${D.growth.find(g => g.head != null)?.head ?? '—'}</b><span>head cm</span></div></div>
    <h4>Vaccines</h4><p>${D.vrows.filter(x => x.v.group === 'epi' && x.r?.given).length}/${D.vrows.filter(x => x.v.group === 'epi').length} EPI doses recorded${D.vrows.filter(x => !x.r?.given && x.due < D.t && x.v.group === 'epi').length ? ` · <span class="warn">${D.vrows.filter(x => !x.r?.given && x.due < D.t && x.v.group === 'epi').length} past-due not recorded</span>` : ''}</p>
    <h4>Development</h4>${D.bands.map(x => `<p>${x.b.en}: <b>${x.done.length}/${x.b.items.length}</b>${x.past && x.open.length ? ` <span class="warn">— ${x.open.length} not yet seen</span>` : ''}</p>`).join('')}
    ${concerns.length ? `<div class="callout"><b>Discuss with the doctor</b>${concerns.flatMap(x => x.open.map(i => `<p class="sm">• ${esc(i.en)} <span class="muted">(${x.b.en})</span></p>`)).join('')}</div>` : ''}
    <h4>Recent health</h4><p>${D.visits.length} visits · ${D.ill.length} illnesses · ${D.meds.length} prescriptions on file · ${D.words.filter(w => w.type !== 'skill').length} words</p>
  </div>`;
}
ACT.printDoctor = async () => {
  const D = await doctorData();
  const vs = x => x.r?.given ? `<span class="ok">✓ ${fmtDate(x.r.given)}</span>${x.r.place ? ' · ' + esc(x.r.place) : ''}` : x.due < D.t ? '<span class="warn">not recorded</span>' : 'due ' + fmtDate(x.due);
  printDoc(`${Child.first()} - paediatrician summary ${D.t}`, `<p class="noprint muted">Use your browser's <b>Print → Save as PDF</b> to keep a copy.</p>
  <h1>${esc(Child.name)} <span class="bn" style="font-weight:400">${esc(Child.nameBn || '')}</span></h1>
  <p class="sub">Paediatrician summary · prepared ${fmtDate(D.t)} · born ${fmtDate(Child.birth)} · age <b>${ageText(D.a)}</b> (${D.a.months} months)</p>
  <h2>Growth</h2>${D.growth.length ? `<table><tr><th>Date</th><th>Age</th><th>Weight (kg)</th><th>Height/length (cm)</th><th>Head circ. (cm)</th></tr>${D.growth.slice(0, 12).map(g => `<tr><td>${fmtDate(g.date)}</td><td>${ageShort(Child.birth, g.date)}</td><td>${g.weight ?? ''}</td><td>${g.height ?? ''}</td><td>${g.head ?? ''}</td></tr>`).join('')}</table>` : '<p class="muted">No measurements recorded.</p>'}
  <h2>Immunisations (Bangladesh EPI + others)</h2><table><tr><th>Vaccine</th><th>Schedule</th><th>Status</th></tr>${D.vrows.map(x => `<tr><td>${esc(x.v.en)}</td><td>${esc(x.v.at)}</td><td>${vs(x)}</td></tr>`).join('')}${D.custom.map(c => `<tr><td>${esc(c.name)}</td><td>—</td><td>${c.given ? '<span class="ok">✓ ' + fmtDate(c.given) + '</span>' : 'due ' + fmtDate(c.due)}</td></tr>`).join('')}</table>
  <h2>Development (CDC milestone checklists)</h2><table><tr><th>Age band</th><th>Recorded</th><th>Not yet seen</th></tr>${D.bands.map(x => `<tr><td>${x.b.en}</td><td>${x.done.length}/${x.b.items.length}</td><td>${x.open.length ? (x.past ? '<span class="warn">' : '') + x.open.map(i => `[${DEV_TAGS[i.tag].en}] ${esc(i.en)}`).join('<br>') + (x.past ? '</span>' : '') : '<span class="ok">—</span>'}</td></tr>`).join('')}</table>
  <p class="muted">Language: ${D.words.filter(w => w.type !== 'skill').length} words logged (${D.words.filter(w => w.lang === 'bn').length} Bangla, ${D.words.filter(w => w.lang === 'en').length} English).${D.words.length ? ' Recent: ' + D.words.sort((x, y) => y.date.localeCompare(x.date)).slice(0, 15).map(w => esc(w.word)).join(', ') : ''}</p>
  <h2>Illnesses</h2>${D.ill.length ? `<table><tr><th>Dates</th><th>Illness</th><th>Details</th></tr>${D.ill.slice(0, 15).map(i => `<tr><td>${fmtDate(i.start)}${i.end ? ' – ' + fmtDate(i.end) : ' (ongoing)'}</td><td>${esc(i.name)}</td><td>${[i.maxTemp && 'max ' + esc(i.maxTemp) + '°', esc(i.symptoms || ''), esc(i.treatment || '')].filter(Boolean).join('; ')}</td></tr>`).join('')}</table>` : '<p class="muted">None recorded.</p>'}
  <h2>Doctor visits</h2>${D.visits.length ? `<table><tr><th>Date</th><th>Doctor</th><th>Reason / diagnosis</th><th>Advice</th></tr>${D.visits.slice(0, 12).map(v => `<tr><td>${fmtDate(v.date)}</td><td>${esc(v.doctor || '')}</td><td>${esc(v.reason || '')}${v.diagnosis ? '<br><b>' + esc(v.diagnosis) + '</b>' : ''}</td><td>${esc(v.notes || '')}</td></tr>`).join('')}</table>` : '<p class="muted">None recorded.</p>'}
  <h2>Prescriptions</h2>${D.meds.length ? `<table><tr><th>Date</th><th>Medicines</th><th>Until</th></tr>${D.meds.slice(0, 12).map(m => `<tr><td>${fmtDate(m.date)}</td><td>${esc(m.title || '')}${m.medicines ? '<br>' + esc(m.medicines) : ''}</td><td>${m.until ? fmtDate(m.until) : ''}</td></tr>`).join('')}</table>` : '<p class="muted">None recorded.</p>'}
  <p class="muted" style="margin-top:18px">Generated by the family's Affaan's World app from parent-entered records. Milestones: CDC “Learn the Signs. Act Early.”; schedule: Bangladesh EPI.</p>`);
};

/* ---------- learning (v4 progress report, from Play Together sessions) ---------- */
async function learningHTML() {
  const ss = await DB.list('playsession');
  const total = ss.reduce((a, s) => a + s.minutes, 0), days = new Set(ss.map(s => s.date)).size;
  const per = []; for (let i = 6; i >= 0; i--) { const k = isoDate(addDays(new Date(), -i)); per.push({ k, min: ss.filter(s => s.date === k).reduce((a, s) => a + s.minutes, 0) }); }
  const taps = {}; ss.forEach(s => Object.entries(s.taps || {}).forEach(([k, n]) => taps[k] = (taps[k] || 0) + n));
  const area = { letters_en: 'English letters', letters_bn_v: 'Bangla vowels', letters_bn_c: 'Bangla consonants', numbers: 'Numbers', colors: 'Colours', shapes: 'Shapes', world: 'Our World', people: 'Great People', stories: 'Stories', play: 'Games', bubbles: 'Bubble Pop', peekaboo: 'Peekaboo' };
  const rows = Object.keys(area).map(k => ({ l: area[k], n: taps[k] || 0 })).filter(r => r.n).sort((a, b) => b.n - a.n);
  const maxW = Math.max(1, ...per.map(p => p.min)), maxT = Math.max(1, ...rows.map(r => r.n));
  const spark = Object.values(await KV.get('sparkDone', {})).filter(a => a.length).length, read = Object.keys(await KV.get('readDays', {})).length;
  const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `<div class="stats4"><div><b>${total}</b><span>total min</span></div><div><b>${ss.length}</b><span>sessions</span></div><div><b>${days}</b><span>active days</span></div><div><b>${Object.values(taps).reduce((a, b) => a + b, 0)}</b><span>taps</span></div></div>
  <div class="panel"><h3>This week — minutes per day</h3>${per.map(p => `<div class="bar"><span>${dn[parseDate(p.k).getDay()]}</span><i><i style="width:${p.min / maxW * 100}%"></i></i><b>${p.min}m</b></div>`).join('')}</div>
  <div class="panel"><h3>What ${esc(Child.first())} explores most</h3>${rows.length ? rows.map((r, i) => `<div class="bar"><span>${r.l}</span><i><i style="width:${r.n / maxT * 100}%;background:hsl(${(i * 47) % 360} 55% 48%)"></i></i><b>${r.n}</b></div>`).join('') : '<p class="muted">Play a session together and his favourite areas will appear here.</p>'}</div>
  <div class="panel"><h3>Off-screen</h3><div class="bar"><span>Spark days</span><i><i style="width:${Math.min(100, spark * 5)}%;background:#D9922E"></i></i><b>${spark}</b></div><div class="bar"><span>Reading days</span><i><i style="width:${Math.min(100, read * 5)}%;background:#1B7F8E"></i></i><b>${read}</b></div></div>`;
}
