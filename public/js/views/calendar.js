/* ============ CALENDAR — month grid (English + বাংলা) · day agenda · upcoming · events · export to phone calendar ============ */
const CalView = { ym: null, sel: null };
const EVENT_TYPES = { appointment: ['Appointment', 'ডাক্তার', '🩺', '#F58B7A'], vaccine: ['Vaccine', 'টিকা', '💉', '#F58B7A'], family: ['Family', 'পরিবার', '👨‍👩‍👦', '#E3BF6C'],
  outing: ['Outing', 'বেড়ানো', '🌳', '#6FD48F'], reminder: ['Reminder', 'মনে রাখা', '🔔', '#7AB4F5'], other: ['Other', 'অন্যান্য', '📌', '#C9A2FF'] };

// every dated thing in the family record, past and scheduled
async function calendarItems() {
  const out = [], add = (date, o) => { if (date) out.push({ date: String(date).slice(0, 10), ...o }); };
  const t = todayISO();
  for (const e of await DB.list('event')) { const ty = EVENT_TYPES[e.type] || EVENT_TYPES.other; add(e.date, { kind: 'event', icon: ty[2], color: ty[3], title: e.title, sub: [e.time && fmtTime(e.time), e.place].filter(Boolean).join(' · '), time: e.time || '', id: e.id, act: 'evEdit', sched: true }); }
  const vx = await vaccineMap();
  for (const v of EPI) {
    const r = vx[v.id];
    if (r?.given) add(r.given, { kind: 'vaccine', icon: '💉', color: '#6FD48F', title: v.en + ' given', go: 'health/vaccines' });
    else if (v.group !== 'optional' && vaccineDue(v) >= t) add(vaccineDue(v), { kind: 'due', icon: '💉', color: '#F58B7A', title: v.en + ' due', sub: v.at, go: 'health/vaccines', sched: true });
  }
  for (const v of await DB.list('visit')) { add(v.date, { kind: 'visit', icon: '🩺', color: '#F58B7A', title: 'Doctor: ' + (v.reason || 'visit'), sub: v.doctor || '', go: 'health/visits' }); if (v.followUp) add(v.followUp, { kind: 'follow', icon: '🔁', color: '#F0B64A', title: 'Follow-up' + (v.doctor ? ' · ' + v.doctor : ''), sub: v.reason || '', go: 'health/visits', sched: true }); }
  for (const d of await DB.list('document')) if (d.until) add(d.until, { kind: 'med', icon: '💊', color: '#F0B64A', title: 'Medicine course ends', sub: d.medicines || d.title || '', go: 'health/docs', sched: true });
  for (const i of await DB.list('illness')) add(i.start, { kind: 'ill', icon: '🤒', color: '#F58B7A', title: i.name, go: 'health/illness' });
  for (const m of await DB.list('milestone')) if (m.achieved) add(m.achieved, { kind: 'ms', icon: '⭐', color: '#6FD48F', title: CDC_BY_ID[m.id.slice(3)]?.en || 'Milestone', go: 'dev/milestones/' + m.band });
  for (const w of await DB.list('word')) add(w.date, { kind: 'word', icon: '💬', color: '#7AB4F5', title: `${w.type === 'skill' ? 'Skill' : 'Word'}: “${w.word}”`, go: 'dev/words' });
  for (const g of await DB.list('growth')) add(g.date, { kind: 'growth', icon: '📏', color: '#7AB4F5', title: [g.weight && g.weight + ' kg', g.height && g.height + ' cm'].filter(Boolean).join(' · ') || 'Measurement', go: 'dev/growth' });
  for (const j of await DB.list('journal')) add(j.date, { kind: 'journal', icon: '📝', color: '#E3BF6C', title: j.title, go: 'dev/journal' });
  const perDay = {}; for (const p of await galleryItems()) if (p.date) perDay[p.date] = (perDay[p.date] || 0) + 1;
  Object.entries(perDay).forEach(([d, n]) => add(d, { kind: 'photo', icon: '📸', color: '#5EEAD4', title: `${n} ${n === 1 ? 'photo' : 'photos'}`, go: 'gallery' }));
  for (const s of await DB.list('playsession')) add(s.date, { kind: 'play', icon: '🎈', color: '#C9A2FF', title: `Played together ${s.minutes} min${s.stars ? ' · ⭐ ' + s.stars : ''}`, go: 'reports/learning' });
  // birthdays and CDC check-points, a few years ahead
  const b = parseDate(Child.birth);
  for (let k = 1; k <= 6; k++) add(isoDate(new Date(b.getFullYear() + k, b.getMonth(), b.getDate())), { kind: 'bday', icon: '🎂', color: '#E3BF6C', title: `${Child.first()}'s ${ordinal(k)}`, sched: true });
  for (const band of CDC_BANDS) add(isoDate(addMonths(b, band.months)), { kind: 'band', icon: '🌱', color: '#6FD48F', title: `${band.en} milestones check`, sub: 'CDC checklist', go: 'dev/milestones/' + band.id, sched: true });
  // national days
  const y = new Date().getFullYear();
  for (const yy of [y, y + 1]) [['02-21', 'Ekushe February', '🕯️'], ['03-26', 'Independence Day', '🇧🇩'], ['04-14', 'Pohela Boishakh', '🎉'], ['12-16', 'Victory Day', '🇧🇩']].forEach(([md, n, ic]) => add(`${yy}-${md}`, { kind: 'nat', icon: ic, color: '#8FA89D', title: n, sched: true, quiet: true }));
  return out.sort((a, c) => a.date.localeCompare(c.date) || (a.time || '').localeCompare(c.time || ''));
}
const fmtTime = hm => { if (!hm) return ''; const [h, m] = hm.split(':').map(Number); return `${(h % 12) || 12}:${pad2(m)} ${h < 12 ? 'AM' : 'PM'}`; };

Views.calendar = async () => {
  const T = Cal.today();
  if (!CalView.ym) CalView.ym = T.iso.slice(0, 7);
  if (!CalView.sel) CalView.sel = T.iso;
  const [Y, M] = CalView.ym.split('-').map(Number);
  const items = await calendarItems(), byDay = {};
  items.forEach(i => (byDay[i.date] = byDay[i.date] || []).push(i));
  const first = new Date(Y, M - 1, 1), days = new Date(Y, M, 0).getDate(), lead = first.getDay();
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="cd blank"></span>';
  for (let d = 1; d <= days; d++) {
    const iso = `${Y}-${pad2(M)}-${pad2(d)}`, bd = Cal.bangla(Y, M - 1, d), list = (byDay[iso] || []).filter(x => !x.quiet);
    const cls = [iso === T.iso ? 'today' : '', iso === CalView.sel ? 'sel' : '', iso < T.iso ? 'past' : '', list.some(x => x.kind === 'bday') ? 'bday' : ''].join(' ');
    cells += `<button class="cd ${cls}" data-act="calPick" data-d="${iso}"><b>${d}</b><small class="bn">${bd.d === 1 ? bd.month : bnNum(bd.d)}</small>
      <span class="dots">${[...new Set(list.map(x => x.color))].slice(0, 4).map(c => `<i style="background:${c}"></i>`).join('')}</span></button>`;
  }
  const sel = byDay[CalView.sel] || [], sd = parseDate(CalView.sel), sbd = Cal.bangla(sd.getFullYear(), sd.getMonth(), sd.getDate()), sh = Cal.hijri(sd.getFullYear(), sd.getMonth(), sd.getDate());
  const upcoming = items.filter(i => i.sched && i.date >= T.iso && !i.quiet).slice(0, 8);
  const bdM = Cal.bangla(Y, M - 1, 1), bdM2 = Cal.bangla(Y, M - 1, days);
  return `${pageHead('Calendar', 'ক্যালেন্ডার', `<span data-live="clock">${Cal.clock()}</span> · Dhaka · ${T.bd.d} ${T.bd.month} ${bnNum(T.bd.y)}`)}
  <div class="pad">
    <div class="calhead">
      <button class="iconbtn" data-act="calMonth" data-d="-1" aria-label="Previous month">${icon('back')}</button>
      <div class="grow center"><b>${EN_MONTHS_LONG[M - 1]} ${Y}</b><span class="bn">${bdM.month}${bdM2.month !== bdM.month ? '–' + bdM2.month : ''} ${bnNum(bdM.y)}</span></div>
      <button class="iconbtn flip" data-act="calMonth" data-d="1" aria-label="Next month">${icon('back')}</button>
      ${CalView.ym !== T.iso.slice(0, 7) ? '<button class="chip" data-act="calToday">Today</button>' : ''}
    </div>
    <div class="calgrid card">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => `<span class="cw ${i === 5 ? 'fri' : ''}">${w}</span>`).join('')}${cells}</div>
    <div class="dayhead"><div><b>${fmtDate(CalView.sel)}</b><span class="muted sm"> · ${Cal.EN_DAYS[sd.getDay()]}</span></div>
      <div class="sm bn muted">${bnNum(sbd.d)} ${sbd.month} ${bnNum(sbd.y)} · ${sbd.season.bn}${sh ? ` · <span class="mono">${sh.d} ${esc(sh.month)} ${sh.y}</span>` : ''}</div></div>
    <div class="agenda">${sel.length ? sel.map(i => agendaRow(i)).join('') : `<div class="empty sm">Nothing on this day.</div>`}</div>
    <button class="ghostadd" data-act="evAdd" data-d="${CalView.sel}">+ Add event on ${fmtDate(CalView.sel)} · <span class="bn">ইভেন্ট যোগ</span></button>
    ${shead('⏳', 'Coming up', 'আসছে', `<button class="linkbtn" data-act="icsAll">${icon('download')} .ics</button>`)}
    <div class="agenda">${upcoming.length ? upcoming.map(i => agendaRow(i, true)).join('') : '<div class="empty sm">Nothing scheduled.</div>'}</div>
    <p class="muted sm">Tip: “.ics” adds these to your phone’s own calendar with reminders — Google Calendar or Apple Calendar will open it.</p>
  </div>`;
};
function agendaRow(i, countdown = false) {
  const n = daysBetween(new Date(), parseDate(i.date)), when = n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 0 ? `in ${n} days` : '';
  const a = i.act ? `data-act="${i.act}" data-id="${esc(i.id)}"` : i.go ? `data-act="go" data-to="${i.go}"` : '';
  return `<button class="ag" ${a} style="--c:${i.color}"><span class="ag-ic">${i.icon}</span><span class="grow"><b>${esc(i.title)}</b>${i.sub ? `<span class="sm muted">${esc(i.sub)}</span>` : ''}</span>
    <span class="ag-when">${countdown ? `<b>${when}</b><small>${fmtDate(i.date).replace(/ \d{4}$/, '')}</small>` : i.time ? `<b>${fmtTime(i.time)}</b>` : ''}</span></button>`;
}
ACT.calPick = el => { CalView.sel = el.dataset.d; route(); };
ACT.calMonth = el => { const [y, m] = CalView.ym.split('-').map(Number), d = new Date(y, m - 1 + Number(el.dataset.d), 1); CalView.ym = isoDate(d).slice(0, 7); CalView.sel = isoDate(d); route(); };
ACT.calToday = () => { CalView.ym = todayISO().slice(0, 7); CalView.sel = todayISO(); route(); };
ACT.evAdd = (el, e, r = {}) => Sheet.open({
  title: (r.id ? 'Edit event' : 'New event') + ' · <span class="bn">ইভেন্ট</span>',
  body: `${F.text('title', 'What', 'কী', r.title || '', 'placeholder="e.g. Paediatrician check-up"')}
    ${F.row(F.date('date', 'Date', 'তারিখ', r.date || el?.dataset?.d || todayISO()), `<label class="fld"><span class="lbl">Time <span class="bn">· সময়</span></span><input type="time" name="time" value="${esc(r.time || '')}"></label>`)}
    ${F.row(F.select('type', 'Type', 'ধরন', Object.entries(EVENT_TYPES).map(([k, v]) => [k, `${v[2]} ${v[0]} · ${v[1]}`]), r.type || 'appointment'), F.text('place', 'Where', 'কোথায়', r.place || ''))}
    ${F.area('note', 'Note', 'নোট', r.note || '', 'rows="2"')}
    ${r.id ? `<button type="button" class="linkbtn" data-act="icsOne" data-id="${esc(r.id)}">${icon('download')} Add to phone calendar (.ics)</button>` : ''}`,
  save: async fd => { if (!val(fd, 'title')) throw new Error('What is it?'); const rec = { title: val(fd, 'title'), date: val(fd, 'date') || todayISO(), time: val(fd, 'time'), type: val(fd, 'type'), place: val(fd, 'place'), note: val(fd, 'note') };
    await DB.put('event', rec, r.id); CalView.sel = rec.date; CalView.ym = rec.date.slice(0, 7); },
  del: r.id ? () => DB.del(r.id) : null
});
ACT.evEdit = async el => ACT.evAdd(null, null, { ...(await DB.data(el.dataset.id)), id: el.dataset.id });

/* ---- iCalendar export (works offline; the phone's calendar app does the reminding) ---- */
function icsText(list) {
  const esc_ = s => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', "PRODID:-//Affaan's World//EN", 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const i of list) {
    lines.push('BEGIN:VEVENT', `UID:${(i.id || i.kind + i.date + i.title).replace(/[^\w-]/g, '')}@affaans-world`, `DTSTAMP:${stamp}`);
    if (i.time) { const [h, m] = i.time.split(':').map(Number), [y, mo, d] = i.date.split('-').map(Number); const u = new Date(Date.UTC(y, mo - 1, d, h - 6, m)); const f = u.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); lines.push(`DTSTART:${f}`, `DURATION:PT1H`); }
    else { const d = i.date.replace(/-/g, ''); const nx = isoDate(addDays(parseDate(i.date), 1)).replace(/-/g, ''); lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${nx}`); }
    lines.push(`SUMMARY:${esc_((i.icon ? i.icon + ' ' : '') + i.title + ' — ' + Child.first())}`);
    if (i.sub || i.note) lines.push(`DESCRIPTION:${esc_([i.sub, i.note].filter(Boolean).join('\n'))}`);
    if (i.place) lines.push(`LOCATION:${esc_(i.place)}`);
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc_(i.title)}`, `TRIGGER:${i.time ? '-PT2H' : '-PT15H'}`, 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
ACT.icsAll = async () => { const t = todayISO(); const list = (await calendarItems()).filter(i => i.sched && i.date >= t && !i.quiet && i.kind !== 'band'); downloadBlob(new Blob([icsText(list)], { type: 'text/calendar' }), `affaan-upcoming-${t}.ics`); toast(`${list.length} items exported`); };
ACT.icsOne = async el => { const e = await DB.data(el.dataset.id); const ty = EVENT_TYPES[e.type] || EVENT_TYPES.other; downloadBlob(new Blob([icsText([{ ...e, id: el.dataset.id, icon: ty[2], sub: e.note }])], { type: 'text/calendar' }), `affaan-${e.date}.ics`); };
