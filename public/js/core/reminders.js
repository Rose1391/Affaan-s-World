/* ============ REMINDERS — vaccines · follow-ups · calendar events · medicine doses ============
 The schedule is built on this phone from the records (next 45 days) and delivered three ways:
  1. while the app is open: a timer shows each notification on time;
  2. Chrome / Edge installed app: periodic background sync wakes the service worker, which shows what is due;
  3. signed in to sync: the schedule goes to Supabase and a server job sends a Web Push at the right
     minute, even when the app and the phone's browser are closed (iPhone: installed app, iOS 16.4+).
 Each notification has a stable id, so the same reminder is never shown twice on one device. */
const Reminders = (() => {
  const DEF = { on: false, vaccines: true, visits: true, events: true, meds: true, morning: '09:00', evening: '19:00' };
  const CACHE = 'affaan-reminders', SCHED = './__reminders/schedule.json', SHOWN = './__reminders/shown.json';
  let timers = [], cfg = null;
  const settings = async () => (cfg = { ...DEF, ...(await DB.meta.get('reminders', {})) });
  const supported = () => 'Notification' in window && 'serviceWorker' in navigator;
  const pushSupported = () => supported() && 'PushManager' in window;
  const at = (iso, hhmm, dayOffset = 0) => { const d = parseDate(iso); d.setDate(d.getDate() + dayOffset); const [h, m] = (hhmm || '09:00').split(':').map(Number); d.setHours(h || 0, m || 0, 0, 0); return d.getTime(); };
  const parseTimes = s => (s || '').split(/[,;\s]+/).map(x => x.trim()).filter(x => /^\d{1,2}(:\d{2})?$/.test(x)).map(x => { const [h, m = '00'] = x.split(':'); return pad2(Math.min(23, +h)) + ':' + pad2(Math.min(59, +m)); });

  // every reminder from the records: { id, at, title, body, url }
  async function build() {
    const c = cfg || await settings(), now = Date.now(), until = now + 45 * 864e5, out = [];
    const add = (id, t, title, body, url) => { if (t > now - 12 * 36e5 && t < until) out.push({ id, at: t, title, body: body || '', url: url || './' }); };
    const name = Child.first ? Child.first() : 'Affaan';
    if (c.vaccines) {
      const done = {}; for (const r of await DB.list('vaccine')) done[r.id.slice(3)] = r;
      for (const v of EPI) { if (v.group === 'optional' || done[v.id]?.given) continue; const due = vaccineDue(v); if (due < todayISO()) continue;
        const n = v.en.split(' (')[0];
        add(`vx:${v.id}:3`, at(due, c.morning, -3), `💉 ${n} in 3 days`, `${name}'s ${n} is due ${fmtDate(due)} · টিকার তারিখ ৩ দিন পর`, './#health/vaccines');
        add(`vx:${v.id}:0`, at(due, c.morning), `💉 ${n} is due today`, `Take ${name}'s EPI card · আজ টিকার দিন`, './#health/vaccines'); }
      for (const x of await DB.list('vaccine_custom')) { if (x.given || !x.due) continue;
        add(`vc:${x.id}:1`, at(x.due, c.evening, -1), `💉 ${x.name} tomorrow`, 'আগামীকাল টিকা', './#health/vaccines');
        add(`vc:${x.id}:0`, at(x.due, c.morning), `💉 ${x.name} is due today`, 'আজ টিকার দিন', './#health/vaccines'); }
    }
    if (c.visits) for (const v of await DB.list('visit')) { if (!v.followUp) continue; const who = v.doctor ? ' · ' + v.doctor : '';
      add(`fu:${v.id}:1`, at(v.followUp, c.evening, -1), `🩺 Follow-up tomorrow${who}`, (v.reason || 'Doctor follow-up') + ' · আগামীকাল ডাক্তার', './#health/visits');
      add(`fu:${v.id}:0`, at(v.followUp, c.morning), `🩺 Follow-up today${who}`, (v.reason || 'Doctor follow-up') + ' · আজ ডাক্তার', './#health/visits'); }
    if (c.events) for (const e of await DB.list('event')) { if (!e.date) continue; const where = e.place ? ' · ' + e.place : '';
      if (e.time) { add(`ev:${e.id}:h`, at(e.date, e.time) - 36e5, `📅 ${e.title} in 1 hour`, fmtTime(e.time) + where, './#calendar');
        add(`ev:${e.id}:1`, at(e.date, c.evening, -1), `📅 Tomorrow: ${e.title}`, fmtTime(e.time) + where, './#calendar'); }
      else add(`ev:${e.id}:0`, at(e.date, c.morning), `📅 Today: ${e.title}`, where.slice(3), './#calendar'); }
    if (c.meds) for (const d of await DB.list('document')) {
      if (d.docType !== 'prescription') continue; const times = parseTimes(d.doseTimes), med = d.medicines || d.title || 'Medicine';
      if (times.length) { const last = d.until || isoDate(addDays(parseDate(d.date || todayISO()), 7));
        for (let day = parseDate(todayISO()), k = 0; isoDate(day) <= last && k < 31; day = addDays(day, 1), k++)
          for (const t of times) add(`md:${d.id}:${isoDate(day)}:${t}`, at(isoDate(day), t), `💊 Medicine time · ওষুধের সময়`, med, './#health/docs'); }
      if (d.until && d.until >= todayISO()) add(`me:${d.id}`, at(d.until, c.morning), '💊 Last day of the medicine course', med + ' · আজ ওষুধের শেষ দিন', './#health/docs');
    }
    return out.sort((a, b) => a.at - b.at).slice(0, 400);
  }

  // the service worker reads the schedule from the cache (it cannot reach the app's IndexedDB safely)
  async function shown() { try { const r = await (await caches.open(CACHE)).match(SHOWN); return r ? await r.json() : {}; } catch (e) { return {}; } }
  async function markShown(id) { const s = await shown(); s[id] = Date.now(); for (const k in s) if (Date.now() - s[k] > 60 * 864e5) delete s[k];
    try { await (await caches.open(CACHE)).put(SHOWN, new Response(JSON.stringify(s), { headers: { 'content-type': 'application/json' } })); } catch (e) { } }

  async function notify(it) {
    if (Notification.permission !== 'granted') return;
    const s = await shown(); if (s[it.id]) return; await markShown(it.id);
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(it.title, { body: it.body, tag: it.id, icon: './icons/icon-192.png', badge: './icons/icon-192.png', data: { url: it.url } });
  }

  async function refresh() {
    timers.forEach(clearTimeout); timers = [];
    const c = await settings();
    if (!supported()) return [];
    const list = c.on ? await build() : [];
    try { await (await caches.open(CACHE)).put(SCHED, new Response(JSON.stringify({ on: c.on, list }), { headers: { 'content-type': 'application/json' } })); } catch (e) { }
    if (!c.on || Notification.permission !== 'granted') return list;
    const now = Date.now();
    for (const it of list) {
      if (it.at <= now && now - it.at < 12 * 36e5) notify(it);                 // missed while the phone was off
      else if (it.at > now && it.at - now < 6 * 36e5) timers.push(setTimeout(() => notify(it), it.at - now));
    }
    pushUpload(list).catch(e => console.warn('reminder push', e));
    return list;
  }

  /* ---- Web Push (needs sync sign-in) ---- */
  const b64u = s => { const p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  async function subscription(create) {
    const key = (window.AFFAAN_CONFIG || {}).VAPID_PUBLIC_KEY; if (!pushSupported() || !key) return null;
    const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription();
    if (!sub && create) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(key) });
    return sub;
  }
  let lastUpload = '';
  async function pushUpload(list) {
    const st = Sync.state(); if (!st.signedIn || !navigator.onLine) return;
    const sub = await subscription(true); if (!sub) return;
    const sched = list.filter(x => x.at > Date.now()).slice(0, 300).map(x => ({ id: x.id, at: new Date(x.at).toISOString(), title: x.title, body: x.body, url: x.url }));
    const sig = JSON.stringify([sub.endpoint, sched]); if (sig === lastUpload) return;
    await Sync.savePushDevice(sub.toJSON(), sched); lastUpload = sig;
  }

  async function enable() {
    if (!supported()) throw new Error('This browser cannot show notifications. On iPhone, add the app to the Home Screen first (iOS 16.4 or newer).');
    const p = await Notification.requestPermission();
    if (p !== 'granted') throw new Error('Notifications are blocked. Allow them for this site in the browser settings, then try again.');
    await DB.meta.set('reminders', { ...(await settings()), on: true });
    try { const reg = await navigator.serviceWorker.ready; if (reg.periodicSync) await reg.periodicSync.register('affaan-reminders', { minInterval: 3 * 36e5 }); } catch (e) { }
    return refresh();
  }
  async function disable() {
    await DB.meta.set('reminders', { ...(await settings()), on: false });
    try { const sub = await subscription(false); if (sub) { await Sync.removePushDevice(sub.endpoint).catch(() => { }); await sub.unsubscribe(); } } catch (e) { }
    lastUpload = ''; return refresh();
  }
  async function set(k, v) { await DB.meta.set('reminders', { ...(await settings()), [k]: v }); return refresh(); }
  async function test() { await notify({ id: 'test:' + Date.now(), title: '🔔 Reminders are on', body: "This is how Affaan's World will remind you · এভাবে মনে করিয়ে দেবে", url: './#settings' }); }

  let soonT = 0; const soon = () => { clearTimeout(soonT); soonT = setTimeout(refresh, 1500); };
  Bus.on('change', soon); Bus.on('remote', soon);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) soon(); });
  return { settings, build, refresh, enable, disable, set, test, supported, pushSupported, parseTimes };
})();
