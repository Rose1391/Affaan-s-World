/* Affaan's World service worker — offline-first.
   App shell is precached; same-origin GETs are served cache-first and refreshed in
   the background. Supabase (cross-origin) is never cached. Bump VERSION on deploys. */
const VERSION = 'affaan-v7.9.0';
const SHELL = [
    './',
    './config.js',
    './css/app.css',
    './fonts/baloo-2-latin-600-normal.woff2',
    './fonts/baloo-2-latin-800-normal.woff2',
    './fonts/baloo-da-2-bengali-600-normal.woff2',
    './fonts/baloo-da-2-bengali-800-normal.woff2',
    './fonts/cinzel-latin-600-normal.woff2',
    './fonts/cinzel-latin-700-normal.woff2',
    './fonts/fraunces-latin-wght-italic.woff2',
    './fonts/fraunces-latin-wght-normal.woff2',
    './fonts/hind-siliguri-bengali-400-normal.woff2',
    './fonts/hind-siliguri-bengali-600-normal.woff2',
    './fonts/outfit-latin-400-normal.woff2',
    './fonts/outfit-latin-500-normal.woff2',
    './fonts/outfit-latin-600-normal.woff2',
    './fonts/outfit-latin-700-normal.woff2',
    './fonts/spline-sans-mono-latin-500-normal.woff2',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './img/bg-affaan.jpg',
    './img/diet-guide.jpg',
    './img/diet-plan.jpg',
    './img/hero-affaan.jpg',
    './index.html',
    './js/app.js',
    './js/content/activities.js',
    './js/content/data-diet.js',
    './js/content/health-data.js',
    './js/content/learn.js',
    './js/content/personalities.js',
    './js/content/countries.js',
    './js/content/bangladesh.js',
    './js/content/who-growth.js',
    './js/core/backup.js',
    './js/core/calendars.js',
    './js/core/cryptobox.js',
    './js/core/db.js',
    './js/core/film.js',
    './js/core/opening.js',
    './js/core/scene.js',
    './js/core/valley.js',
    './js/core/lock.js',
    './js/core/media.js',
    './js/core/motion.js',
    './js/core/sfx.js',
    './js/core/speech.js',
    './js/core/sync.js',
    './js/core/util.js',
    './js/core/voice.js',
    './js/core/weather.js',
    './js/core/zip.js',
    './js/share.js',
    './js/views/book.js',
    './js/views/calendar.js',
    './js/views/dev.js',
    './js/views/gallery.js',
    './js/views/garden.js',
    './js/views/homescene.js',
    './js/views/world.js',
    './js/views/bdexplorer.js',
    './js/views/health.js',
    './js/views/island.js',
    './js/views/play.js',
    './js/views/reports.js',
    './js/views/search.js',
    './manifest.webmanifest',
    './share.html',
    './vendor/supabase.js',
    './vendor/d3-array.min.js',
    './vendor/d3-geo.min.js',
    './vendor/topojson-client.min.js',
    './data/world-110m.json',
    './data/bd.json',
];
const FLAGS = ["./flags/af.svg", "./flags/al.svg", "./flags/dz.svg", "./flags/ad.svg", "./flags/ao.svg", "./flags/ag.svg", "./flags/ar.svg", "./flags/am.svg", "./flags/au.svg", "./flags/at.svg", "./flags/az.svg", "./flags/bs.svg", "./flags/bh.svg", "./flags/bd.svg", "./flags/bb.svg", "./flags/by.svg", "./flags/be.svg", "./flags/bz.svg", "./flags/bj.svg", "./flags/bt.svg", "./flags/bo.svg", "./flags/ba.svg", "./flags/bw.svg", "./flags/br.svg", "./flags/bn.svg", "./flags/bg.svg", "./flags/bf.svg", "./flags/bi.svg", "./flags/cv.svg", "./flags/kh.svg", "./flags/cm.svg", "./flags/ca.svg", "./flags/cf.svg", "./flags/td.svg", "./flags/cl.svg", "./flags/cn.svg", "./flags/co.svg", "./flags/km.svg", "./flags/cg.svg", "./flags/cd.svg", "./flags/cr.svg", "./flags/ci.svg", "./flags/hr.svg", "./flags/cu.svg", "./flags/cy.svg", "./flags/cz.svg", "./flags/dk.svg", "./flags/dj.svg", "./flags/dm.svg", "./flags/do.svg", "./flags/ec.svg", "./flags/eg.svg", "./flags/sv.svg", "./flags/gq.svg", "./flags/er.svg", "./flags/ee.svg", "./flags/sz.svg", "./flags/et.svg", "./flags/fj.svg", "./flags/fi.svg", "./flags/fr.svg", "./flags/ga.svg", "./flags/gm.svg", "./flags/ge.svg", "./flags/de.svg", "./flags/gh.svg", "./flags/gr.svg", "./flags/gd.svg", "./flags/gt.svg", "./flags/gn.svg", "./flags/gw.svg", "./flags/gy.svg", "./flags/ht.svg", "./flags/hn.svg", "./flags/hu.svg", "./flags/is.svg", "./flags/in.svg", "./flags/id.svg", "./flags/ir.svg", "./flags/iq.svg", "./flags/ie.svg", "./flags/il.svg", "./flags/it.svg", "./flags/jm.svg", "./flags/jp.svg", "./flags/jo.svg", "./flags/kz.svg", "./flags/ke.svg", "./flags/ki.svg", "./flags/kp.svg", "./flags/kr.svg", "./flags/kw.svg", "./flags/kg.svg", "./flags/la.svg", "./flags/lv.svg", "./flags/lb.svg", "./flags/ls.svg", "./flags/lr.svg", "./flags/ly.svg", "./flags/li.svg", "./flags/lt.svg", "./flags/lu.svg", "./flags/mg.svg", "./flags/mw.svg", "./flags/my.svg", "./flags/mv.svg", "./flags/ml.svg", "./flags/mt.svg", "./flags/mh.svg", "./flags/mr.svg", "./flags/mu.svg", "./flags/mx.svg", "./flags/fm.svg", "./flags/md.svg", "./flags/mc.svg", "./flags/mn.svg", "./flags/me.svg", "./flags/ma.svg", "./flags/mz.svg", "./flags/mm.svg", "./flags/na.svg", "./flags/nr.svg", "./flags/np.svg", "./flags/nl.svg", "./flags/nz.svg", "./flags/ni.svg", "./flags/ne.svg", "./flags/ng.svg", "./flags/mk.svg", "./flags/no.svg", "./flags/om.svg", "./flags/pk.svg", "./flags/pw.svg", "./flags/ps.svg", "./flags/pa.svg", "./flags/pg.svg", "./flags/py.svg", "./flags/pe.svg", "./flags/ph.svg", "./flags/pl.svg", "./flags/pt.svg", "./flags/qa.svg", "./flags/ro.svg", "./flags/ru.svg", "./flags/rw.svg", "./flags/kn.svg", "./flags/lc.svg", "./flags/vc.svg", "./flags/ws.svg", "./flags/sm.svg", "./flags/st.svg", "./flags/sa.svg", "./flags/sn.svg", "./flags/rs.svg", "./flags/sc.svg", "./flags/sl.svg", "./flags/sg.svg", "./flags/sk.svg", "./flags/si.svg", "./flags/sb.svg", "./flags/so.svg", "./flags/za.svg", "./flags/ss.svg", "./flags/es.svg", "./flags/lk.svg", "./flags/sd.svg", "./flags/sr.svg", "./flags/se.svg", "./flags/ch.svg", "./flags/sy.svg", "./flags/tj.svg", "./flags/tz.svg", "./flags/th.svg", "./flags/tl.svg", "./flags/tg.svg", "./flags/to.svg", "./flags/tt.svg", "./flags/tn.svg", "./flags/tr.svg", "./flags/tm.svg", "./flags/tv.svg", "./flags/ug.svg", "./flags/ua.svg", "./flags/ae.svg", "./flags/gb.svg", "./flags/us.svg", "./flags/uy.svg", "./flags/uz.svg", "./flags/vu.svg", "./flags/va.svg", "./flags/ve.svg", "./flags/vn.svg", "./flags/ye.svg", "./flags/zm.svg", "./flags/zw.svg"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
// flags are fetched quietly after activation so the World Explorer works offline too
const warmFlags = () => caches.open(VERSION).then(async c => { for (const f of FLAGS) { if (!(await c.match(f))) { try { const r = await fetch(f); if (r.ok) await c.put(f, r); } catch (e) { return; } } } });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(() => { warmFlags(); }));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // Supabase etc. go straight to network
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./', cp)); return r; })
      .catch(() => caches.match('./', { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(cached => {
    const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => cached);
    return cached || net;
  }));
});
