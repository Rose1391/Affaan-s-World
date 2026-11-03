/* ============ HEALTH RECORDS: vaccines · visits · prescriptions & reports · illnesses · meals & diet ============ */
let showOptional = false;
Views.health = async ([tab = 'vaccines']) => {
  const t = [['vaccines', 'Vaccines', 'টিকা'], ['visits', 'Doctor visits', 'ডাক্তার'], ['docs', 'Prescriptions & reports', 'প্রেসক্রিপশন'], ['illness', 'Illnesses', 'অসুখ'], ['diet', 'Meals & diet', 'খাদ্য']];
  const body = tab === 'visits' ? await visitsHTML() : tab === 'docs' ? await docsHTML() : tab === 'illness' ? await illnessHTML() : tab === 'diet' ? dietHTML() : await vaccinesHTML();
  return `${pageHead('Health records', 'স্বাস্থ্য রেকর্ড', 'Vaccines · visits · medicines · illnesses · diet')}<div class="pad">${tabs(t, tab, 'healthTab')}${body}</div>`;
};
ACT.healthTab = el => go('health/' + el.dataset.v);

/* ---------- vaccines ---------- */
async function vaccineMap() { const m = {}; for (const r of await DB.list('vaccine')) m[r.id.slice(3)] = r; return m; }
async function vaccinesHTML() {
  const done = await vaccineMap(), t = todayISO(), soon = isoDate(addDays(new Date(), 30));
  const custom = (await DB.list('vaccine_custom')).sort((a, b) => (a.given || a.due || '').localeCompare(b.given || b.due || ''));
  const epi = EPI.filter(v => v.group === 'epi'), epiDone = epi.filter(v => done[v.id]?.given).length;
  const row = v => {
    const r = done[v.id], due = vaccineDue(v);
    const st = r?.given ? 'done' : v.group === 'optional' ? 'opt' : due < t ? (v.group === 'epi' ? 'over' : 'past') : due <= soon ? 'soon' : 'up';
    const lab = { done: `Given ${fmtDate(r?.given)}`, opt: 'Optional', past: 'Not recorded', over: 'Not recorded', soon: 'Due soon', up: 'Upcoming' }[st];
    return `<button class="vrow ${st}" data-act="vaccine" data-id="${v.id}"><span class="vdot">${st === 'done' ? icon('check') : ''}</span>
      <span class="grow"><b>${esc(v.en)}</b> <span class="bn muted">${esc(v.bn)}</span><span class="sm muted">${esc(v.at)} · due ${fmtDate(due)} · ${esc(v.prevents)}</span></span><span class="vst">${lab}</span></button>`;
  };
  const groups = ['epi', 'campaign'].concat(showOptional ? ['optional'] : []);
  const toggle = `<div class="vtoggle" style="margin:8px 0"><button class="${vxView === 'passport' ? 'on' : ''}" data-act="vxView" data-v="passport">🛂 Passport</button><button class="${vxView === 'list' ? 'on' : ''}" data-act="vxView" data-v="list">☰ List</button></div>`;
  if (vxView === 'passport') return toggle + passportHTML(done, custom);
  return toggle + `
  <div class="stats3"><div><b>${epiDone}/${epi.length}</b><span>EPI doses recorded</span></div><div><b>${EPI.filter(v => v.group === 'epi' && !done[v.id]?.given && vaccineDue(v) < t).length}</b><span>EPI not recorded (past due)</span></div><div><b>${(() => { const n = EPI.filter(v => v.group !== 'optional' && !done[v.id]?.given && vaccineDue(v) >= t).sort((a, b) => vaccineDue(a).localeCompare(vaccineDue(b)))[0]; return n ? fmtDate(vaccineDue(n)) : '—'; })()}</b><span>next due</span></div></div>
  <p class="muted sm">Copy the dates from his EPI card. Tap a dose to record it — the date defaults to the due date. <button class="linkbtn" data-act="vaxBulk">Mark all past EPI doses as given…</button></p>
  ${groups.map(g => `<h4 class="subh">${EPI_GROUPS[g].en} <span class="bn">${EPI_GROUPS[g].bn}</span></h4><div class="list">${EPI.filter(v => v.group === g).map(row).join('')}</div>`).join('')}
  <label class="switch sm"><input type="checkbox" data-change="toggleOptional" ${showOptional ? 'checked' : ''}><span></span> Show optional / private vaccines</label>
  <h4 class="subh">Other vaccines <span class="bn">অন্যান্য টিকা</span></h4>
  <div class="list">${custom.map(c => `<button class="vrow ${c.given ? 'done' : 'up'}" data-act="vaxCustom" data-id="${c.id}"><span class="vdot">${c.given ? icon('check') : ''}</span><span class="grow"><b>${esc(c.name)}</b><span class="sm muted">${c.given ? 'Given ' + fmtDate(c.given) : 'Due ' + fmtDate(c.due)}${c.place ? ' · ' + esc(c.place) : ''}</span></span></button>`).join('')}</div>
  <button class="ghostadd" data-act="vaxCustom">+ Add another vaccine · <span class="bn">অন্য টিকা যোগ করুন</span></button>
  <p class="muted sm">Schedule: Bangladesh EPI (DGHS). Campaign dates are approximate. Not medical advice — follow the EPI card and your paediatrician.</p>`;
}
let vxView = 'passport';
ACT.vxView = el => { vxView = el.dataset.v; route(); };
const shortVx = v => v.en.split(' (')[0].replace('Pentavalent', 'Penta').replace('Vitamin A capsule', 'Vit A').replace('Deworming', 'Deworm').replace(' (polio drops)', '');
// the EPI card as a passport: given doses are inked stamps, upcoming ones faint outlines
function passportHTML(done, custom) {
  const t = todayISO(), R = (() => { let h = 11; return () => (h = (h * 9301 + 49297) % 233280) / 233280; })();
  const INK = { epi: '#C0392B', campaign: '#2F7FB8', optional: '#6B3FB0' };
  const stamp = v => { const r = done[v.id], due = vaccineDue(v), rot = ((R() - .5) * 22).toFixed(1);
    const st = r?.given ? 'given' : due < t ? (v.group === 'epi' ? 'missing' : 'past') : 'due';
    return `<button class="stamp ${st}" style="--sink:${INK[v.group]};--rot:${rot}deg" data-act="vaccine" data-id="${v.id}" aria-label="${esc(v.en)}">
      <span class="st-ring"><b>${esc(shortVx(v))}</b><small>${st === 'given' ? fmtDate(r.given).replace(/(\d+) (\w+) 20(\d\d)/, '$1 $2 ’$3') : st === 'missing' ? 'copy from card' : 'due ' + fmtDate(due).replace(/ \d{4}$/, '')}</small>${st === 'given' ? '<i>✓</i>' : ''}</span></button>`; };
  const given = Object.values(done).filter(v => v.given).length;
  return `<div class="passport">
    <div class="pp-head"><div class="pp-emb">🇧🇩</div><div class="grow"><span class="eyebrow">Vaccination passport · টিকা কার্ড</span><b>${esc(Child.name)}</b><span class="sm">${esc(Child.nameBn || '')} · born ${fmtDate(Child.birth)}</span></div><div class="pp-count"><b>${given}</b><small>stamps</small></div></div>
    ${['epi', 'campaign', 'optional'].map(g => { const list = EPI.filter(v => v.group === g && (g !== 'optional' || done[v.id]?.given || showOptional)); if (!list.length) return '';
      return `<div class="pp-page"><h5>${EPI_GROUPS[g].en} <span class="bn">${EPI_GROUPS[g].bn}</span></h5><div class="stamps">${list.map(stamp).join('')}</div></div>`; }).join('')}
    ${custom.length ? `<div class="pp-page"><h5>Other vaccines <span class="bn">অন্যান্য</span></h5><div class="stamps">${custom.map(c => `<button class="stamp ${c.given ? 'given' : 'due'}" style="--sink:#1E8C86;--rot:${((R() - .5) * 22).toFixed(1)}deg" data-act="vaxCustom" data-id="${c.id}"><span class="st-ring"><b>${esc(c.name.slice(0, 16))}</b><small>${c.given ? fmtDate(c.given) : 'due ' + fmtDate(c.due)}</small>${c.given ? '<i>✓</i>' : ''}</span></button>`).join('')}</div></div>` : ''}
    <div class="pp-foot"><label class="switch sm"><input type="checkbox" data-change="toggleOptional" ${showOptional ? 'checked' : ''}><span></span> Show optional vaccines</label>
      <button class="linkbtn" data-act="vaxCustom">+ Other vaccine</button><button class="linkbtn" data-act="vaxBulk">Mark past EPI doses as given…</button></div>
  </div><p class="muted sm">Schedule: Bangladesh EPI (DGHS). Campaign dates are approximate. Follow the EPI card and your paediatrician.</p>`;
}
ACT.toggleOptional = el => { showOptional = el.checked; route(); };
ACT.vaccine = async el => {
  const v = EPI.find(x => x.id === el.dataset.id), r = await DB.data('vx:' + v.id) || {};
  Sheet.open({
    title: `${esc(v.en)} · <span class="bn">${esc(v.bn)}</span>`,
    body: `<p class="muted sm">${esc(v.at)} · due ${fmtDate(vaccineDue(v))} · ${esc(v.prevents)}</p>
      <label class="switch"><input type="checkbox" name="isGiven" ${r.given || !Object.keys(r).length ? 'checked' : ''}><span></span> Given · <span class="bn">দেওয়া হয়েছে</span></label>
      ${F.row(F.date('given', 'Date given', 'তারিখ', r.given || (vaccineDue(v) <= todayISO() ? vaccineDue(v) : todayISO())), F.text('place', 'Where', 'কোথায়', r.place || '', 'placeholder="EPI centre / clinic"'))}
      ${F.text('batch', 'Batch / notes', 'ব্যাচ / নোট', r.batch || '')}${F.photos(r.photoIds || [], 'Card photo', 'কার্ডের ছবি')}`,
    save: async (fd, f) => {
      const photoIds = await formPhotos(f);
      if (!fd.get('isGiven') && !photoIds.length && !val(fd, 'batch')) { if (Object.keys(r).length) await DB.del('vx:' + v.id); return; }
      await DB.put('vaccine', { given: fd.get('isGiven') ? val(fd, 'given') || todayISO() : '', place: val(fd, 'place'), batch: val(fd, 'batch'), photoIds }, 'vx:' + v.id);
    },
    del: Object.keys(r).length ? () => DB.del('vx:' + v.id) : null
  });
};
ACT.pickVaccine = async () => {
  const done = await vaccineMap();
  Sheet.open({ title: 'Which vaccine? · <span class="bn">কোন টিকা?</span>',
    body: EPI.filter(v => !done[v.id]?.given).map(v => `<button type="button" class="pickrow" data-act="pickVx" data-id="${v.id}"><b>${esc(v.en)}</b> <span class="muted sm">${esc(v.at)}</span></button>`).join('') + `<button type="button" class="pickrow" data-act="pickVx" data-id="">+ Other vaccine…</button>` });
};
ACT.pickVx = el => { Sheet.close(); el.dataset.id ? ACT.vaccine(el) : ACT.vaxCustom({ dataset: {} }); };
ACT.vaxBulk = async () => {
  const done = await vaccineMap(), t = todayISO();
  const todo = EPI.filter(v => v.group === 'epi' && !done[v.id]?.given && vaccineDue(v) <= t);
  if (!todo.length) return toast('Nothing to mark');
  if (!confirm(`Mark ${todo.length} past EPI doses as given on their due dates?\nYou can correct individual dates afterwards from the EPI card.`)) return;
  for (const v of todo) await DB.put('vaccine', { given: vaccineDue(v), place: '', batch: 'date = scheduled due date', photoIds: [] }, 'vx:' + v.id);
  route();
};
ACT.vaxCustom = async el => {
  const id = el.dataset?.id, r = id ? await DB.data(id) : {};
  Sheet.open({ title: 'Other vaccine · <span class="bn">অন্য টিকা</span>',
    body: `${F.text('name', 'Vaccine', 'টিকার নাম', r.name || '', 'placeholder="e.g. Typhoid booster"')}${F.row(F.date('given', 'Date given', 'দেওয়ার তারিখ', r.given || ''), F.date('due', 'or due date', 'নির্ধারিত তারিখ', r.due || ''))}
      ${F.text('place', 'Where', 'কোথায়', r.place || '')}${F.area('note', 'Notes', 'নোট', r.note || '', 'rows="2"')}${F.photos(r.photoIds || [])}`,
    save: async (fd, f) => { if (!val(fd, 'name')) throw new Error('Name needed'); await DB.put('vaccine_custom', { name: val(fd, 'name'), given: val(fd, 'given'), due: val(fd, 'due'), place: val(fd, 'place'), note: val(fd, 'note'), photoIds: await formPhotos(f) }, id); },
    del: id ? () => DB.del(id) : null });
};

/* ---------- generic dated record list ---------- */
function recCard(r, act, title, sub, extra = '') {
  return `<button class="entry" data-act="${act}" data-id="${r.id}"><span class="etop"><b>${title}</b><span class="muted">${fmtDate(r.date || r.start)}</span></span>
    ${sub ? `<span class="enote">${sub}</span>` : ''}${extra}${(r.photoIds || []).length ? `<span class="ephotos">${r.photoIds.slice(0, 4).map(p => Media.img(p)).join('')}${r.photoIds.length > 4 ? `<i>+${r.photoIds.length - 4}</i>` : ''}</span>` : ''}</button>`;
}

/* ---------- doctor visits ---------- */
async function visitsHTML() {
  const list = (await DB.list('visit')).sort((a, b) => b.date.localeCompare(a.date));
  return `<button class="ghostadd" data-act="addVisit">+ Add doctor visit · <span class="bn">ডাক্তার দেখানো</span></button>
   ${list.length ? list.map(v => recCard(v, 'visitEdit', esc(v.reason || 'Visit'), [v.doctor && esc(v.doctor), v.diagnosis && '<b>Dx:</b> ' + esc(v.diagnosis), v.notes && esc(v.notes)].filter(Boolean).join(' · '),
     v.followUp ? `<span class="pill ${v.followUp >= todayISO() ? 'blue' : ''}">Follow-up ${fmtDate(v.followUp)}</span>` : '')).join('') : empty('No visits recorded yet.', 'এখনও কোনো ভিজিট নেই')}`;
}
ACT.addVisit = (el, e, r = {}) => Sheet.open({
  title: 'Doctor visit · <span class="bn">ডাক্তার দেখানো</span>',
  body: `${F.row(F.date('date', 'Date', 'তারিখ', r.date), F.text('doctor', 'Doctor / clinic', 'ডাক্তার', r.doctor || ''))}
    ${F.text('reason', 'Reason', 'কারণ', r.reason || '', 'placeholder="Check-up, fever, cough…"')}${F.text('diagnosis', 'Diagnosis', 'রোগনির্ণয়', r.diagnosis || '')}
    ${F.area('notes', 'Advice & notes', 'পরামর্শ', r.notes || '')}${F.row(F.num('weight', 'Weight at visit', 'ওজন', r.weight, 'kg'), F.date('followUp', 'Follow-up', 'পরবর্তী', r.followUp || ''))}
    ${F.photos(r.photoIds || [], 'Prescription / report photos', 'ছবি')}`,
  save: async (fd, f) => {
    const rec = { date: val(fd, 'date') || todayISO(), doctor: val(fd, 'doctor'), reason: val(fd, 'reason'), diagnosis: val(fd, 'diagnosis'), notes: val(fd, 'notes'), weight: numv(fd, 'weight'), followUp: val(fd, 'followUp'), photoIds: await formPhotos(f) };
    const saved = await DB.put('visit', rec, r.id);
    if (rec.weight != null && !r.id) await DB.put('growth', { date: rec.date, weight: rec.weight, height: null, head: null, note: 'at doctor visit' }, 'gv:' + saved.id);
  },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.visitEdit = async el => ACT.addVisit(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });

/* ---------- prescriptions & reports ---------- */
const DOC_TYPES = [['prescription', 'Prescription · প্রেসক্রিপশন'], ['lab', 'Lab / test report · পরীক্ষার রিপোর্ট'], ['xray', 'X-ray / scan · এক্স-রে'], ['other', 'Other document · অন্যান্য']];
async function docsHTML() {
  const list = (await DB.list('document')).sort((a, b) => b.date.localeCompare(a.date));
  const label = Object.fromEntries(DOC_TYPES);
  const active = list.filter(d => d.docType === 'prescription' && d.until && d.until >= todayISO());
  return `<button class="ghostadd" data-act="addDoc">+ Add prescription or report · <span class="bn">যোগ করুন</span></button>
   ${active.length ? `<div class="callout blue"><b>Current medicines · <span class="bn">চলমান ওষুধ</span></b>${active.map(d => `<p>${esc(d.medicines || d.title)} <span class="muted">until ${fmtDate(d.until)}</span></p>`).join('')}</div>` : ''}
   ${list.length ? list.map(d => recCard(d, 'docEdit', esc(d.title || label[d.docType]), [label[d.docType]?.split(' · ')[0], d.medicines && esc(d.medicines), d.notes && esc(d.notes)].filter(Boolean).join(' · '))).join('') : empty('Snap prescriptions and test reports so they are always with you.', 'প্রেসক্রিপশন ও রিপোর্টের ছবি রাখুন')}`;
}
ACT.addDoc = (el, e, r = {}) => Sheet.open({
  title: 'Prescription / report · <span class="bn">প্রেসক্রিপশন / রিপোর্ট</span>',
  body: `${F.row(F.select('docType', 'Type', 'ধরন', DOC_TYPES, r.docType || 'prescription'), F.date('date', 'Date', 'তারিখ', r.date))}
    ${F.text('title', 'Title', 'শিরোনাম', r.title || '', 'placeholder="e.g. Dr. Rahman — cough"')}
    ${F.area('medicines', 'Medicines & dose', 'ওষুধ ও মাত্রা', r.medicines || '', 'rows="2" placeholder="Paracetamol syrup 5 ml 3×/day for 3 days"')}
    ${F.row(F.date('until', 'Course ends', 'শেষ তারিখ', r.until || ''), F.text('notes', 'Notes', 'নোট', r.notes || ''))}${F.photos(r.photoIds || [], 'Photos', 'ছবি')}`,
  save: async (fd, f) => { const photoIds = await formPhotos(f); if (!val(fd, 'title') && !val(fd, 'medicines') && !photoIds.length) throw new Error('Add a title, medicines or a photo');
    await DB.put('document', { docType: val(fd, 'docType'), date: val(fd, 'date') || todayISO(), title: val(fd, 'title'), medicines: val(fd, 'medicines'), until: val(fd, 'until'), notes: val(fd, 'notes'), photoIds }, r.id); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.docEdit = async el => ACT.addDoc(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });

/* ---------- illnesses ---------- */
async function illnessHTML() {
  const list = (await DB.list('illness')).sort((a, b) => b.start.localeCompare(a.start));
  return `<button class="ghostadd" data-act="addIllness">+ Record an illness · <span class="bn">অসুখ লিখুন</span></button>
   ${list.length ? list.map(i => recCard({ ...i, date: i.start }, 'illEdit', esc(i.name), [i.end ? `${daysBetween(parseDate(i.start), parseDate(i.end)) + 1} days` : '<span class="warn">ongoing</span>', i.maxTemp && `max ${esc(i.maxTemp)}°`, i.symptoms && esc(i.symptoms), i.treatment && esc(i.treatment)].filter(Boolean).join(' · '))).join('') : empty('No illnesses recorded — may it stay that way!', 'কোনো অসুখের রেকর্ড নেই')}`;
}
ACT.addIllness = (el, e, r = {}) => Sheet.open({
  title: 'Illness · <span class="bn">অসুখ</span>',
  body: `${F.text('name', 'What', 'কী হয়েছে', r.name || '', 'placeholder="Fever, cold, diarrhoea…"')}${F.row(F.date('start', 'Started', 'শুরু', r.start), F.date('end', 'Recovered', 'সেরে উঠেছে', r.end || ''))}
    ${F.row(F.text('maxTemp', 'Highest temp', 'সর্বোচ্চ জ্বর', r.maxTemp || '', 'inputmode="decimal" placeholder="°F / °C"'), F.text('symptoms', 'Symptoms', 'লক্ষণ', r.symptoms || ''))}
    ${F.area('treatment', 'Treatment & notes', 'চিকিৎসা', r.treatment || '', 'rows="2"')}${F.photos(r.photoIds || [])}`,
  save: async (fd, f) => { if (!val(fd, 'name')) throw new Error('What was it?'); await DB.put('illness', { name: val(fd, 'name'), start: val(fd, 'start') || todayISO(), end: val(fd, 'end'), maxTemp: val(fd, 'maxTemp'), symptoms: val(fd, 'symptoms'), treatment: val(fd, 'treatment'), photoIds: await formPhotos(f) }, r.id); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.illEdit = async el => ACT.addIllness(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });

/* ---------- meals & diet (v4 content, unchanged) ---------- */
let dietGroup = DIET.groups[0].id, dietMode = 'plan';
ACT.dietSet = el => { if (el.dataset.g) dietGroup = el.dataset.g; dietMode = el.dataset.m; route(); };
function dietHTML() {
  const grp = DIET.groups.find(g => g.id === dietGroup);
  const tabsH = `<div class="chips filt">${DIET.groups.map(g => `<button class="chip ${g.id === dietGroup && dietMode === 'plan' ? 'on' : ''}" data-act="dietSet" data-g="${g.id}" data-m="plan" style="--c:${g.color}">${esc((g.titleEn.split('·')[1] || g.titleEn).trim())}</button>`).join('')}
    <button class="chip ${dietMode === 'tips' ? 'on' : ''}" data-act="dietSet" data-m="tips">💡 Food tips</button><button class="chip ${dietMode === 'charts' ? 'on' : ''}" data-act="dietSet" data-m="charts">📄 Charts</button></div>`;
  const measure = `<div class="callout blue sm">${esc(DIET.measures.en)}<br><span class="bn">${esc(DIET.measures.bn)}</span></div>`;
  if (dietMode === 'charts') return tabsH + `<p class="muted sm">Original charts from the dietician (pinch to zoom)</p>` + DIET.charts.map(c => `<div class="panel"><b>${esc(c.captionEn)}</b><div class="bn muted sm">${esc(c.captionBn)}</div><img class="chartimg" src="${c.src}" alt="" loading="lazy"></div>`).join('');
  if (dietMode === 'tips') return tabsH + measure + `<div class="panel"><h3>What to feed · <span class="bn">কী খাওয়াবেন</span></h3><ul class="ticks">${grp.tips.map(t => `<li>${esc(t.en)}<span class="bn">${esc(t.bn)}</span></li>`).join('')}</ul></div>
    <div class="panel"><h3>Care & sickness · <span class="bn">যত্ন ও অসুস্থতা</span></h3><ul class="ticks">${grp.care.map(t => `<li>${esc(t.en)}<span class="bn">${esc(t.bn)}</span></li>`).join('')}</ul></div>`;
  return tabsH + `<p class="muted sm">${esc(grp.titleEn)} · <span class="bn">${esc(grp.titleBn)}</span> — from the CMH dietician</p>` + measure + grp.schedule.map(m => `<div class="meal"><span class="mi">${m.emoji}</span><div><span class="mt">${esc(m.timeEn)}</span> <span class="bn muted sm">${esc(m.timeBn)}</span><p>${esc(m.en)}</p><p class="bn">${esc(m.bn)}</p></div></div>`).join('');
}
