/* ============ HOME HERO — the Tree of Life in its valley, living in real Dhaka time ============
 Far away: a village line (tin roofs, a little mosque, coconut palms) and a mountain range whose waterfall feeds
 a wide river; water lilies drift down it; cows and Black Bengal goats graze the meadow; paddy fields in between.
 The tree stands on flared roots sunk into the soil and moves in real wind: the crown bends more than the trunk,
 gusts come and go, every leaf flutters, and the Doels on its branches ride the motion. The light follows the hour
 (dawn / day / dusk / night), clouds drift in two layers, and when Dhaka's forecast says rain, showers pass over
 with ripples on the river. His photo hangs in the crown as the gold locket. Static layers are painted once;
 frames run at 30 fps and pause off-screen or in the background. */
const HomeScene = (() => {
  const { clamp, hex, mix, rgba } = Scene;
  let TREE = null;
  function start(host, o = {}) {
    if (!host) return { stop() { } };
    TREE = TREE || Scene.buildTree(20240930, { t0: 0 });
    const cv = document.createElement('canvas'); cv.className = 'gh-canvas'; cv.setAttribute('aria-hidden', 'true'); host.prepend(cv);
    const lk = document.createElement('div'); lk.className = 'gh-locket'; lk.innerHTML = Opening.locket(o.photo || './img/bg-affaan.jpg'); host.appendChild(lk);
    const stk = document.createElement('div'); stk.className = 'gh-stickers'; host.appendChild(stk);
    (o.stickers || []).slice(-24).forEach((st, i) => { const e = document.createElement('span'); e.className = 'g-sticker'; e.textContent = st.emoji; e.dataset.x = st.x; e.dataset.y = st.y; e.style.animationDelay = (-i * .7) + 's'; stk.appendChild(e); });
    const ctx = cv.getContext('2d'), still = Motion.still(), phase = o.phase || 'day', p = Scene.pal(phase), night = phase === 'night', dim = night || phase === 'dusk';
    const R = Scene.rng(42);
    const stars = Array.from({ length: 90 }, () => ({ x: R(), y: R() * .62, r: .35 + R() * 1.1, p: R() * 6.3 }));
    const flies = Array.from({ length: 26 }, () => ({ x: R(), y: .8 + R() * .18, p: R() * 6.3, s: .3 + R() * .5 }));
    const cloudsDef = Array.from({ length: 8 }, (_, i) => ({ x: R() * 1.4, y: .04 + R() * .3, w: .25 + R() * .3, sp: (i % 2 ? .006 : .011) + R() * .004, far: i % 2 === 1, seed: 100 + i }));
    const lil = Valley.lilies(14);
    let W, H, dpr, X, Y, S, hy, land, clouds, rainClouds, perchedDef = [], flock = null, wide = false, herd = [], drops = [], ripples = [];
    const size = () => {
      const r = host.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      wide = r.width > r.height * 1.15; hy = H * (wide ? .68 : .74); Y = hy + H * .035;
      const bx = TREE.box, maxW = W * (wide ? .42 : .9), top = H * (wide ? .1 : .42);
      S = Math.min(maxW / (bx.maxX - bx.minX), (Y - top) / -bx.minY); X = (wide ? W * .6 : W * .45) - S * (bx.minX + bx.maxX) / 2;
      land = Valley.paint(W, H, hy, p, { dpr, season: o.season });
      clouds = cloudsDef.map(c => ({ ...c, img: Scene.cloudSprite(W * c.w, W * c.w * .32, night ? [70, 86, 110] : phase === 'day' ? [255, 255, 255] : [255, 214, 190], c.seed) }));
      rainClouds = cloudsDef.slice(0, 5).map((c, i) => ({ ...c, y: .02 + i * .05, w: .5, img: Scene.cloudSprite(W * .5, W * .17, [96, 104, 116], c.seed + 40) }));
      perchedDef = [0, 2, 3].map(i => TREE.perches[i]).filter(Boolean).map((pc, k) => ({ x: pc.x, y: pc.y, face: k % 2 ? -1 : 1, ph: k * 2.1 }));
      herd = Valley.herd(W, H, hy, dpr, false);
      stk.querySelectorAll('.g-sticker').forEach(e => { const v = .4 + +e.dataset.y * .45, py = (hy + (H - hy) * v) / dpr; e.style.left = ((.05 + +e.dataset.x * .5) * W / dpr) + 'px'; e.style.top = py + 'px'; e.style.fontSize = (14 + v * 18) + 'px'; });
      const pd = TREE.photo.r * 2 * S / dpr; lk.style.width = lk.style.height = pd + 'px';
      lk.style.left = ((X + TREE.photo.x * S) / dpr - pd / 2) + 'px'; lk.style.top = ((Y + TREE.photo.y * S) / dpr - pd / 2) + 'px';
    };
    // wind: a steady sway, a second faster rhythm, and gusts that come and go; the crown moves, the base stays
    let windT = 0;
    const gust = t => Math.pow(Math.max(0, Math.sin(t * .19 + .6)), 4) + .4 * Math.pow(Math.max(0, Math.sin(t * .47 + 2)), 6);
    const wind = (x, y, h) => { const t = windT, g = gust(t), k = Math.pow(h, 1.7);
      const dx = (.014 * Math.sin(t * .8) + .005 * Math.sin(t * 2.1 + x * 4 + y * 2) + g * (.03 + .012 * Math.sin(t * 3.4 + x * 7 + y * 5))) * k;
      return [dx, -Math.abs(dx) * .18 * h]; };
    // sun or moon from the Dhaka clock
    const body = () => { const d = Cal.dhakaParts(), m = d.h * 60 + d.mi, dayP = (m - 330) / 750, nightP = ((m - 1080 + 1440) % 1440) / 720;
      return m >= 330 && m < 1080 ? { sun: true, x: .08 + .84 * dayP, y: 1 - Math.sin(Math.PI * clamp(dayP)) } : { sun: false, x: .08 + .84 * nightP, y: 1 - Math.sin(Math.PI * clamp(nightP)) }; };
    // showers only when the forecast says rain: they build, fall and clear in cycles
    const rainAmt = t => o.rain && !still ? clamp((Math.sin(t / 22 + .6) + .25) * 1.5) : 0;
    let lastT = 0;
    const draw = t => {
      const dt = Math.min(.1, t - lastT); lastT = t; windT = t; const rain = rainAmt(t);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      Scene.drawSky(ctx, W, H, hy, p);
      const b = body(), bx = b.x * W, by = hy - (1 - b.y) * hy * .82 - H * .02;
      if (night) { ctx.fillStyle = '#FFF4DE'; stars.forEach(s => { ctx.globalAlpha = (.25 + .55 * Math.abs(Math.sin(t * .9 + s.p))) * (1 - rain); ctx.beginPath(); ctx.arc(s.x * W, s.y * hy, s.r * dpr, 0, 6.29); ctx.fill(); }); ctx.globalAlpha = 1; }
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, H * (b.sun ? .5 : .3)), gc = b.sun ? p.sun : hex('#DCE8F6');
      glow.addColorStop(0, rgba(gc, (b.sun ? .9 : .7) * (1 - rain * .7))); glow.addColorStop(.05, rgba(gc, (b.sun ? .55 : .35) * (1 - rain * .7))); glow.addColorStop(.3, rgba(gc, b.sun ? .12 : .06)); glow.addColorStop(1, rgba(gc, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, hy);
      if (!b.sun) { const mg = ctx.createRadialGradient(bx - 3 * dpr, by - 3 * dpr, 0, bx, by, 10 * dpr); mg.addColorStop(0, '#FFFDF4'); mg.addColorStop(1, '#D9D6C8'); ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(bx, by, 10 * dpr, 0, 6.29); ctx.fill(); }
      else { ctx.fillStyle = rgba(mix(p.sun, [255, 255, 255], .5), 1 - rain * .8); ctx.beginPath(); ctx.arc(bx, by, 11 * dpr, 0, 6.29); ctx.fill(); }
      // clouds in two layers (the far layer slower and paler), drifting with the wind
      const drift = 1 + gust(t) * .6;
      clouds.forEach(c => { const x = ((c.x + t * c.sp * drift) % 1.6) - .3; ctx.globalAlpha = (night ? .45 : .85) * (c.far ? .6 : 1); ctx.drawImage(c.img, x * W, c.y * hy); }); ctx.globalAlpha = 1;
      if (rain > 0) { ctx.fillStyle = `rgba(40,48,60,${.35 * rain})`; ctx.fillRect(0, 0, W, hy);
        rainClouds.forEach((c, i) => { const x = ((c.x + t * .012) % 1.6) - .4; ctx.globalAlpha = rain * .95; ctx.drawImage(c.img, x * W, c.y * hy); }); ctx.globalAlpha = 1; }
      ctx.drawImage(land, 0, 0);
      if (rain > 0) { ctx.fillStyle = `rgba(30,40,50,${.18 * rain})`; ctx.fillRect(0, hy - H * .3, W, H); }
      Valley.waterfall(ctx, land.fall, t, dpr, night ? .6 : 1);
      Scene.glints(ctx, land.river, t, (night ? .45 : .8) * (1 - rain * .6), dpr, night ? '200,215,240' : '255,240,210');
      Valley.drawLilies(ctx, lil, land.river, t, still ? 0 : dt, dpr, night);
      // rain ripples on the river
      if (rain > .2 && !still) { if (Math.random() < rain * .9) { const v = .1 + Math.random() * .88, rv = land.river; ripples.push({ x: rv.rv(v) + (Math.random() - .5) * rv.rw(v) * 1.6, y: rv.ry(v), r: (2 + v * 8) * dpr, a: 0 }); }
        ripples = ripples.filter(rp => (rp.a += dt * 1.6) < 1); ctx.strokeStyle = 'rgba(230,240,250,.5)'; ctx.lineWidth = dpr * .8;
        ripples.forEach(rp => { ctx.globalAlpha = 1 - rp.a; ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rp.r * (1 + rp.a * 2), rp.r * .35 * (1 + rp.a * 2), 0, 0, 6.29); ctx.stroke(); }); ctx.globalAlpha = 1; }
      // grazing animals
      if (!still) Valley.moveHerd(herd, t, dt, W);
      herd.slice().sort((a, c) => a.y - c.y).forEach(a => Valley.animal(ctx, a, still ? 0 : t, dpr, night));
      // the tree's shadow, then the tree in the wind with its Doels
      const shg = ctx.createRadialGradient(X, Y, 0, X, Y, S * .6); shg.addColorStop(0, `rgba(8,18,6,${night ? .45 : .32 * (1 - rain * .5)})`); shg.addColorStop(1, 'rgba(8,18,6,0)');
      ctx.save(); ctx.translate(X, Y); ctx.scale(1, .12); ctx.translate(-X, -Y); ctx.fillStyle = shg; ctx.beginPath(); ctx.arc(X, Y, S * .6, 0, 6.29); ctx.fill(); ctx.restore();
      Scene.drawTree(ctx, TREE, X, Y, S, { t: 99, bark: 1, leafT: 99, dpr, rim: night ? hex('#9FB6D8') : p.sun, glow: night || rain > .5 ? null : p.sun, dark: night ? .55 : rain * .25, roots: true, wind: still ? null : wind, flutter: .12 + gust(t) * .25, time: t });
      Valley.people(ctx, X, Y, S, still ? 0 : t, night, TREE.segs[0].w * S);
      const z = S * .04;
      perchedDef.forEach(d => { const h = clamp(-d.y / -TREE.box.minY), w8 = still ? [0, 0] : wind(d.x, d.y, h), look = (t + d.ph) % 5 > 4.2 ? -d.face : d.face;
        Scene.doel(ctx, X + (d.x + w8[0]) * S, Y + (d.y + w8[1]) * S, z, look, 0, 'perch', 0, t + d.ph, night ? 'rgba(160,190,230,.35)' : 'rgba(255,220,160,.45)'); });
      // a small flock crosses now and then (not in the rain)
      if (!still && rain < .3) { if (!flock || t > flock.t0 + flock.dur) flock = { t0: t + 6 + R() * 10, dur: 14, y: .1 + R() * .25, dir: R() < .5 ? 1 : -1, n: 3 + Math.floor(R() * 3) };
        const fp = (t - flock.t0) / flock.dur; if (fp > 0 && fp < 1) { ctx.strokeStyle = night ? 'rgba(200,215,240,.55)' : 'rgba(30,30,30,.65)'; ctx.lineWidth = 1.3 * dpr; ctx.lineCap = 'round';
          for (let k = 0; k < flock.n; k++) { const fx = flock.dir > 0 ? (-.1 + fp * 1.2 - k * .03) * W : (1.1 - fp * 1.2 + k * .03) * W, fy = (flock.y + k * .018 * (k % 2 ? 1 : -1)) * hy + Math.sin(t * 2 + k) * 2 * dpr, f = Math.sin(t * 9 + k * 1.3) * 3.5 * dpr, w = 6 * dpr;
            ctx.beginPath(); ctx.moveTo(fx - w, fy - f); ctx.quadraticCurveTo(fx - w * .4, fy - 2 * dpr, fx, fy); ctx.quadraticCurveTo(fx + w * .4, fy - 2 * dpr, fx + w, fy - f); ctx.stroke(); } } }
      if (dim && rain < .5) { ctx.globalCompositeOperation = 'lighter'; flies.forEach(f => { const a = Math.max(0, Math.sin(t * f.s * 2 + f.p)); if (a < .05) return; const fx = (f.x + Math.sin(t * .2 + f.p) * .03) * W, fy = (f.y + Math.sin(t * .3 + f.p * 2) * .02) * H;
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6 * dpr); g.addColorStop(0, `rgba(230,255,150,${.9 * a})`); g.addColorStop(1, 'rgba(230,255,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 6 * dpr, 0, 6.29); ctx.fill(); }); ctx.globalCompositeOperation = 'source-over'; }
      // the rain itself, slanting with the wind
      if (rain > 0) { const n = Math.round(160 * rain), slant = 4 + gust(t) * 6; ctx.strokeStyle = 'rgba(215,228,240,.38)'; ctx.lineWidth = dpr; ctx.beginPath();
        for (let i = 0; i < n; i++) { const rx = ((i * 97.3 + t * 60) % W + W) % W, ry = ((i * 53.1 + t * 1100) % H); ctx.moveTo(rx, ry); ctx.lineTo(rx - slant * dpr, ry + 16 * dpr); } ctx.stroke(); }
      // readability scrims
      const sc = ctx.createLinearGradient(0, 0, 0, H * .5); sc.addColorStop(0, `rgba(4,12,10,${night ? .55 : .42})`); sc.addColorStop(1, 'rgba(4,12,10,0)'); ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H * .5);
      if (wide) { const ls = ctx.createLinearGradient(0, 0, W * .5, 0); ls.addColorStop(0, `rgba(4,12,10,${night ? .4 : .42})`); ls.addColorStop(1, 'rgba(4,12,10,0)'); ctx.fillStyle = ls; ctx.fillRect(0, 0, W * .5, hy); }
      const bt = ctx.createLinearGradient(0, H * .88, 0, H); bt.addColorStop(0, 'rgba(0,0,0,0)'); bt.addColorStop(1, 'rgba(0,0,0,.25)'); ctx.fillStyle = bt; ctx.fillRect(0, H * .88, W, H * .12);
    };
    size();
    let raf = 0, last = 0, visible = true, stopped = false; const t0 = performance.now();
    const loop = now => { if (stopped) return; raf = requestAnimationFrame(loop); if (!visible || document.hidden || now - last < 33) return; last = now; draw((now - t0) / 1000); };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }) : null; io && io.observe(host);
    let rt = 0; const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw((performance.now() - t0) / 1000); }, 150); };
    addEventListener('resize', onResize);
    if (still) draw(0); else raf = requestAnimationFrame(loop);
    return { stop() { stopped = true; cancelAnimationFrame(raf); io && io.disconnect(); removeEventListener('resize', onResize); } };
  }
  return { start };
})();
