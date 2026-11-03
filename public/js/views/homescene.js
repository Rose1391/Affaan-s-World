/* ============ HOME HERO — the same Tree of Life, living in real Dhaka time ============
 The landscape is lit for the hour (dawn / day / dusk / night) and the Bengali season; the sun or moon
 sits on its true arc; clouds drift; the river glints; three Doels rest on the branches and now and then
 a small flock crosses the sky; fireflies come out at dusk and night; rain falls when Dhaka has rain.
 His photo hangs in the crown as the gold locket from the opening. Static layers are painted once;
 frames run at 30 fps and pause when the hero is off-screen or the app is in the background. */
const HomeScene = (() => {
  const { clamp, sm, hex, mix, rgba } = Scene;
  let TREE = null;
  function start(host, o = {}) {
    if (!host) return { stop() { } };
    TREE = TREE || Scene.buildTree(20240930, { t0: 0 });
    const cv = document.createElement('canvas'); cv.className = 'gh-canvas'; cv.setAttribute('aria-hidden', 'true'); host.prepend(cv);
    const lk = document.createElement('div'); lk.className = 'gh-locket'; lk.innerHTML = Opening.locket(o.photo || './img/bg-affaan.jpg'); host.appendChild(lk);
    // the stickers he chose after play stand in the meadow
    const stk = document.createElement('div'); stk.className = 'gh-stickers'; host.appendChild(stk);
    (o.stickers || []).slice(-24).forEach((st, i) => { const e = document.createElement('span'); e.className = 'g-sticker'; e.textContent = st.emoji; e.dataset.x = st.x; e.dataset.y = st.y; e.style.animationDelay = (-i * .7) + 's'; stk.appendChild(e); });
    const ctx = cv.getContext('2d'), still = Motion.still(), phase = o.phase || 'day', p = Scene.pal(phase), night = phase === 'night', dim = night || phase === 'dusk';
    const R = Scene.rng(42);
    const stars = Array.from({ length: 90 }, () => ({ x: R(), y: R() * .62, r: .35 + R() * 1.1, p: R() * 6.3 }));
    const flies = Array.from({ length: 26 }, () => ({ x: R(), y: .78 + R() * .2, p: R() * 6.3, s: .3 + R() * .5 }));
    const cloudsDef = Array.from({ length: 5 }, (_, i) => ({ x: R(), y: .06 + R() * .32, w: .35 + R() * .3, sp: .004 + R() * .006, seed: 100 + i }));
    let W, H, dpr, X, Y, S, hy, land, treeC, clouds, perched = [], flock = null, wide = false;
    const size = () => {
      const r = host.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      wide = r.width > r.height * 1.15; hy = H * (wide ? .7 : .75); Y = hy + H * .028;
      const bx = TREE.box, maxW = W * (wide ? .46 : .94), top = H * (wide ? .1 : .42);
      S = Math.min(maxW / (bx.maxX - bx.minX), (Y - top) / -bx.minY); X = (wide ? W * .7 : W / 2) - S * (bx.minX + bx.maxX) / 2;
      land = Scene.paintLand(W, H, hy, p, { dpr, seed: 3, season: o.season, riverX: wide ? .3 : .64, riverShift: wide ? -.1 : .16 });
      // the tree, painted once with its shadow
      treeC = Scene.canvas(W, H); const tc = treeC.getContext('2d');
      const shg = tc.createRadialGradient(X, Y, 0, X, Y, S * .6); shg.addColorStop(0, `rgba(8,18,6,${night ? .45 : .32})`); shg.addColorStop(1, 'rgba(8,18,6,0)');
      tc.save(); tc.translate(X, Y); tc.scale(1, .12); tc.translate(-X, -Y); tc.fillStyle = shg; tc.beginPath(); tc.arc(X, Y, S * .6, 0, 6.29); tc.fill(); tc.restore();
      Scene.drawTree(tc, TREE, X, Y, S, { t: 99, bark: 1, leafT: 99, dpr, rim: night ? hex('#9FB6D8') : p.sun, glow: night ? null : p.sun });
      if (night) { tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = 'rgba(6,14,34,.58)'; tc.fillRect(0, 0, W, H); tc.globalCompositeOperation = 'source-over'; }
      clouds = cloudsDef.map(c => ({ ...c, img: Scene.cloudSprite(W * c.w, W * c.w * .32, night ? [70, 86, 110] : phase === 'day' ? [255, 255, 255] : [255, 214, 190], c.seed) }));
      perched = [0, 2, 3].map(i => TREE.perches[i]).filter(Boolean).map((pc, k) => ({ x: X + pc.x * S, y: Y + pc.y * S, face: k % 2 ? -1 : 1, ph: k * 2.1 }));
      stk.querySelectorAll('.g-sticker').forEach(e => { const v = .35 + +e.dataset.y * .5, py = (hy + (H - hy) * v) / dpr; e.style.left = (+e.dataset.x * W / dpr) + 'px'; e.style.top = py + 'px'; e.style.fontSize = (14 + v * 18) + 'px'; });
      const pd = TREE.photo.r * 2 * S / dpr; lk.style.width = lk.style.height = pd + 'px';
      lk.style.left = ((X + TREE.photo.x * S) / dpr - pd / 2) + 'px'; lk.style.top = ((Y + TREE.photo.y * S) / dpr - pd / 2) + 'px';
    };
    // where the sun or moon is, from the Dhaka clock
    const body = () => { const d = Cal.dhakaParts(), m = d.h * 60 + d.mi, dayP = (m - 330) / 750, nightP = ((m - 1080 + 1440) % 1440) / 720;
      return m >= 330 && m < 1080 ? { sun: true, x: .08 + .84 * dayP, y: 1 - Math.sin(Math.PI * clamp(dayP)) } : { sun: false, x: .08 + .84 * nightP, y: 1 - Math.sin(Math.PI * clamp(nightP)) }; };
    const draw = t => {
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      Scene.drawSky(ctx, W, H, hy, p);
      const b = body(), bx = b.x * W, by = hy - (1 - b.y) * hy * .82 - H * .02;
      if (night) { ctx.fillStyle = '#FFF4DE'; stars.forEach(s => { ctx.globalAlpha = .25 + .55 * Math.abs(Math.sin(t * .9 + s.p)); ctx.beginPath(); ctx.arc(s.x * W, s.y * hy, s.r * dpr, 0, 6.29); ctx.fill(); }); ctx.globalAlpha = 1; }
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, H * (b.sun ? .5 : .3)); const gc = b.sun ? p.sun : hex('#DCE8F6');
      glow.addColorStop(0, rgba(gc, b.sun ? .9 : .7)); glow.addColorStop(.05, rgba(gc, b.sun ? .55 : .35)); glow.addColorStop(.3, rgba(gc, b.sun ? .12 : .06)); glow.addColorStop(1, rgba(gc, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, hy);
      if (!b.sun) { const mg = ctx.createRadialGradient(bx - 3 * dpr, by - 3 * dpr, 0, bx, by, 10 * dpr); mg.addColorStop(0, '#FFFDF4'); mg.addColorStop(1, '#D9D6C8'); ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(bx, by, 10 * dpr, 0, 6.29); ctx.fill();
        ctx.fillStyle = 'rgba(150,150,140,.25)'; [[-3, -2, 2.4], [3, 2, 1.8], [1, -4, 1.2]].forEach(([a, b2, r]) => { ctx.beginPath(); ctx.arc(bx + a * dpr, by + b2 * dpr, r * dpr, 0, 6.29); ctx.fill(); }); }
      else { ctx.fillStyle = rgba(mix(p.sun, [255, 255, 255], .5)); ctx.beginPath(); ctx.arc(bx, by, 11 * dpr, 0, 6.29); ctx.fill(); }
      clouds.forEach(c => { const x = ((c.x + t * c.sp) % 1.4) - .2; ctx.globalAlpha = night ? .5 : .85; ctx.drawImage(c.img, x * W, c.y * hy); }); ctx.globalAlpha = 1;
      ctx.drawImage(land, 0, 0);
      if (land.river) Scene.glints(ctx, land.river, t, night ? .45 : .8, dpr, night ? '200,215,240' : '255,240,210');
      // gentle sway of the whole tree
      const sw = still ? 0 : Math.sin(t * .55) * .0045 + Math.sin(t * 1.3) * .0015;
      ctx.save(); ctx.translate(X, Y); ctx.rotate(sw); ctx.translate(-X, -Y); ctx.drawImage(treeC, 0, 0);
      const z = S * .04; perched.forEach(d => { const look = (t + d.ph) % 5 > 4.2 ? -d.face : d.face; Scene.doel(ctx, d.x, d.y, z, look, 0, 'perch', 0, t + d.ph, night ? 'rgba(160,190,230,.35)' : 'rgba(255,220,160,.45)'); });
      ctx.restore();
      // a small flock crosses now and then
      if (!still) { if (!flock || t > flock.t0 + flock.dur) flock = { t0: t + 6 + R() * 10, dur: 14, y: .1 + R() * .25, dir: R() < .5 ? 1 : -1, n: 3 + Math.floor(R() * 3) };
        const fp = (t - flock.t0) / flock.dur; if (fp > 0 && fp < 1) { ctx.strokeStyle = night ? 'rgba(200,215,240,.55)' : 'rgba(30,30,30,.65)'; ctx.lineWidth = 1.3 * dpr; ctx.lineCap = 'round';
          for (let k = 0; k < flock.n; k++) { const fx = flock.dir > 0 ? (-.1 + fp * 1.2 - k * .03) * W : (1.1 - fp * 1.2 + k * .03) * W, fy = (flock.y + k * .018 * (k % 2 ? 1 : -1)) * hy + Math.sin(t * 2 + k) * 2 * dpr, f = Math.sin(t * 9 + k * 1.3) * 3.5 * dpr, w = 6 * dpr;
            ctx.beginPath(); ctx.moveTo(fx - w, fy - f); ctx.quadraticCurveTo(fx - w * .4, fy - 2 * dpr, fx, fy); ctx.quadraticCurveTo(fx + w * .4, fy - 2 * dpr, fx + w, fy - f); ctx.stroke(); } } }
      if (dim) { ctx.globalCompositeOperation = 'lighter'; flies.forEach(f => { const a = Math.max(0, Math.sin(t * f.s * 2 + f.p)); if (a < .05) return; const fx = (f.x + Math.sin(t * .2 + f.p) * .03) * W, fy = (f.y + Math.sin(t * .3 + f.p * 2) * .02) * H;
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6 * dpr); g.addColorStop(0, `rgba(230,255,150,${.9 * a})`); g.addColorStop(1, 'rgba(230,255,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 6 * dpr, 0, 6.29); ctx.fill(); }); ctx.globalCompositeOperation = 'source-over'; }
      if (o.rain && !still) { ctx.strokeStyle = 'rgba(210,225,240,.35)'; ctx.lineWidth = dpr; ctx.beginPath(); for (let i = 0; i < 90; i++) { const rx = ((i * 97.3 + t * 40) % W + W) % W, ry = ((i * 53.1 + t * 900) % H); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3 * dpr, ry + 14 * dpr); } ctx.stroke(); }
      // readability scrim for the text at the top
      const sc = ctx.createLinearGradient(0, 0, 0, H * .5); sc.addColorStop(0, `rgba(4,12,10,${night ? .55 : .42})`); sc.addColorStop(1, 'rgba(4,12,10,0)'); ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H * .5);
      if (wide) { const ls = ctx.createLinearGradient(0, 0, W * .55, 0); ls.addColorStop(0, `rgba(4,12,10,${night ? .4 : .42})`); ls.addColorStop(1, 'rgba(4,12,10,0)'); ctx.fillStyle = ls; ctx.fillRect(0, 0, W * .55, hy); }
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
