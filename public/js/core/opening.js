/* ============ THE OPENING — "The Valley Wakes" (≈20 s, any tap skips) ============
 The same valley as Home, told slowly from the beginning:
   0.0  an emerald night: stars over a sleeping valley — mountains, the far village, empty fields
   1.2  a seed of light falls and lands; golden roots spread
   3.0  the tree draws itself in gold, branch by branch; dawn begins
   4.0  high on the mountain the waterfall starts, falls, and fills its pool
   6.5  the river carves its way across the ground toward us
   7.0  buds open and turn from gold to spring green to deep green; the gold sketch becomes living bark
  10.0  water lilies float down the new river
  10.5  four Doels fly in from four directions and settle on the branches
  11.5  cows and goats walk in and begin to graze
  13.0  the wind rises; clouds gather; a gentle shower passes with ripples on the river
  17.0  the sun breaks through; his photo appears as the gold locket in the crown
  17.6  AFFAAN'S WORLD rises in engraved gold, then আফফানের পৃথিবী and the day of his life
  20.5  fades into the app
 Reduced motion → skipped. */
const Opening = (() => {
  const DUR = 20.5, { clamp, sm, hex, mix, rgba } = Scene;
  let TREE = null;
  function chime(ac, out, t, f, v = .07) {
    const o = ac.createOscillator(), g = ac.createGain(), o2 = ac.createOscillator(), g2 = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 3.01;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(v * .25, t + .01); g2.gain.exponentialRampToValueAtTime(.0001, t + .8);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out); o.start(t); o2.start(t); o.stop(t + 2.7); o2.stop(t + .9);
  }
  function music() {
    let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const out = ac.createGain(); out.gain.value = .9; out.connect(ac.destination); const t = ac.currentTime + .05;
    [[2.2, 784], [3.4, 587], [4.6, 659], [5.8, 784], [7.0, 988], [8.2, 880], [9.4, 784], [10.6, 659], [11.8, 784], [17.2, 784], [17.8, 988], [18.4, 1175], [19.2, 1568, .05]].forEach(([d, f, v]) => chime(ac, out, t + d, f, v));
    // water and rain: filtered noise that swells with the waterfall and the shower
    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), dd = buf.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
    const noise = (type, f, peaks) => { const n = ac.createBufferSource(); n.buffer = buf; n.loop = true; const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; const g = ac.createGain(); g.gain.value = 0; n.connect(bq); bq.connect(g); g.connect(out); peaks.forEach(([d, v]) => g.gain.linearRampToValueAtTime(v, t + d)); n.start(t); n.stop(t + DUR + 1); };
    noise('lowpass', 900, [[4, 0], [6, .05], [17, .05], [20, 0]]);
    noise('bandpass', 2600, [[13.5, 0], [14.6, .14], [16.6, .14], [17.6, 0]]);
    const chirp = (d, f) => { const o = ac.createOscillator(), g = ac.createGain(), tt = t + d; o.type = 'sine'; o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 1.35, tt + .08);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.035, tt + .015); g.gain.exponentialRampToValueAtTime(.0001, tt + .12); o.connect(g); g.connect(out); o.start(tt); o.stop(tt + .15); };
    [13.6, 13.72, 14.2, 14.5, 14.62, 18.0, 18.12, 18.6].forEach((d, i) => chirp(d, 2800 + (i % 4) * 260));
    return { ac, out, stop: () => { try { out.gain.linearRampToValueAtTime(0, ac.currentTime + .4); setTimeout(() => ac.close(), 600); } catch (e) { } } };
  }

  async function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    TREE = TREE || Scene.buildTree(20240930, { t0: 3.0, slow: 1.5 });
    const a = ageOn(Child.birth), g = Cal.greeting(), td = Cal.today();
    let photo = './img/bg-affaan.jpg';
    try { const it = (await galleryItems()).find(i => i.type === 'photo'); if (it) photo = (await Media.url(it.photoId, 'full')) || photo; } catch (e) { }
    const name = "AFFAAN'S WORLD".split('').map((ch, i) => ch === ' ' ? '<span class="op-sp"></span>' : `<span style="animation-delay:${(17.6 + i * .07).toFixed(2)}s">${esc(ch)}</span>`).join('');
    const el = document.createElement('div'); el.id = 'opening'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<canvas></canvas><div class="op-photo">${locket(photo)}</div>
      <div class="op-text"><div class="op-title">${name}</div><div class="op-rule"></div><div class="op-bn">আফফানের পৃথিবী</div>
      <div class="op-greet">${esc(g[0])} · day ${a.days.toLocaleString()} of his life · ${bnNum(td.bd.d)} ${esc(td.bd.month)}</div></div>
      <div class="op-skip">tap to skip</div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-on');
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), ph = el.querySelector('.op-photo');
    const pN = Scene.pal('emerald'), pD = Scene.pal('dawn'), pY = Scene.pal('day'), season = td.bd.season.k;
    const R = Scene.rng(7);
    const stars = Array.from({ length: 70 }, () => ({ x: R(), y: R() * .5, r: .4 + R() * 1.1, p: R() * 6.3 }));
    const cloudsDef = Array.from({ length: 6 }, (_, i) => ({ x: R() * 1.4, y: .04 + R() * .22, w: .4 + R() * .3, sp: .01 + R() * .008, seed: 300 + i }));
    const lil = Valley.lilies(12, 5);
    let W, H, dpr, X, Y, S, hy, lands, flights = [], herd = [], clouds = [], rainClouds = [], ripples = [], lastT = 0;
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      const wide = innerWidth > innerHeight; hy = H * (wide ? .66 : .62); Y = hy + H * .035;
      const bx = TREE.box; S = Math.min(W * (wide ? .42 : .9) / (bx.maxX - bx.minX), (Y - H * .07) / -bx.minY); X = (wide ? W * .5 : W * .45) - S * (bx.minX + bx.maxX) / 2;
      lands = [pN, pD, pY].map(p => Valley.paint(W, H, hy, p, { dpr, season, split: true }));
      const pd = TREE.photo.r * 2 * S / dpr; ph.style.width = ph.style.height = pd + 'px';
      ph.style.left = ((X + TREE.photo.x * S) / dpr - pd / 2) + 'px'; ph.style.top = ((Y + TREE.photo.y * S) / dpr - pd / 2) + 'px';
      el.style.setProperty('--ground', (Y / dpr) + 'px');
      const from = [{ x: -.12 * W, y: .3 * H }, { x: .18 * W, y: -.1 * H }, { x: .86 * W, y: -.1 * H }, { x: 1.12 * W, y: .26 * H }];
      flights = TREE.perches.slice(0, 4).map((pc, i) => Scene.flight(from[i], { x: X + pc.x * S, y: Y + pc.y * S }, 10.5 + [0, .7, 1.2, .4][i], 3.6 + [.2, 0, .3, .1][i], { W, H, arc: .08 + i * .02 }));
      herd = Valley.herd(W, H, hy, dpr, false).map((h, i) => ({ ...h, startX: -W * (.08 + i * .05), t0: 11.5 + i * .6, dur: 4 + i * .4 }));
      clouds = cloudsDef.map(c => ({ ...c, img: Scene.cloudSprite(W * c.w, W * c.w * .32, [255, 244, 230], c.seed) }));
      rainClouds = cloudsDef.slice(0, 5).map((c, i) => ({ ...c, y: .02 + i * .05, img: Scene.cloudSprite(W * .5, W * .17, [96, 104, 116], c.seed + 40) }));
    };
    size(); addEventListener('resize', size);
    let snd = null; try { snd = music(); } catch (e) { }
    // the wind rises through the shower and settles after
    const windAmp = t => .25 + .75 * sm(12.5, 14, t) * (1 - sm(17, 19, t) * .6);
    let windT = 0; const gust = t => Math.pow(Math.max(0, Math.sin(t * .6 + .6)), 3);
    const wind = (x, y, h) => { const t = windT, k = Math.pow(h, 1.7) * windAmp(t), dx = (.014 * Math.sin(t * .9) + .005 * Math.sin(t * 2.2 + x * 4 + y * 2) + gust(t) * .028 * windAmp(t) * Math.sin(t * 3.4 + x * 7)) * k; return [dx, -Math.abs(dx) * .18 * h]; };
    const t0 = performance.now(); let raf = 0, done = false;
    const frame = now => {
      const t = (now - t0) / 1000, dt = Math.min(.1, t - lastT); lastT = t; windT = t;
      const dawn = sm(2.5, 8, t), day = sm(8.5, 12, t), rain = sm(13.6, 14.6, t) * (1 - sm(16.6, 17.6, t)), clear = sm(17, 18.5, t);
      // light: emerald night → dawn → morning; dimmed while the shower passes
      const sky = i => { let c = mix(pN.sky[i], pD.sky[i], dawn * (i === 0 ? .6 : .92)); c = mix(c, pY.sky[i], day * .85); return mix(c, [70, 78, 92], rain * .55); };
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const gs = ctx.createLinearGradient(0, 0, 0, hy); gs.addColorStop(0, rgba(sky(0))); gs.addColorStop(.6, rgba(sky(1))); gs.addColorStop(1, rgba(sky(2))); ctx.fillStyle = gs; ctx.fillRect(0, 0, W, hy + 2);
      const sunA = dawn * (1 - rain * .8) * (1 + clear * .2), sx = W * .78, sy = hy - H * .02 - (dawn * .1 + day * .12) * H;
      if (sunA > 0) { const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .45); sg.addColorStop(0, rgba(hex('#FFE8B8'), .85 * Math.min(1, sunA))); sg.addColorStop(.06, rgba(hex('#FFD9A0'), .5 * Math.min(1, sunA))); sg.addColorStop(.4, rgba(hex('#F2B070'), .12 * sunA)); sg.addColorStop(1, 'rgba(242,176,112,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hy + 2); }
      ctx.fillStyle = '#FFF4D6'; stars.forEach(s => { ctx.globalAlpha = (1 - dawn) * (.3 + .45 * Math.abs(Math.sin(t * 1.4 + s.p))) * sm(0, .8, t); ctx.beginPath(); ctx.arc(s.x * W, s.y * hy, s.r * dpr, 0, 6.29); ctx.fill(); });
      ctx.globalAlpha = 1;
      // clouds gather with the wind and the shower
      const cl = sm(6, 10, t); if (cl > 0) clouds.forEach(c => { const x = ((c.x + t * c.sp * (1 + gust(t))) % 1.6) - .3; ctx.globalAlpha = .5 * cl * (1 - rain * .5); ctx.drawImage(c.img, x * W, c.y * hy, c.img.width * 1.3, c.img.height * 1.3); });
      if (rain > 0) rainClouds.forEach(c => { const x = ((c.x + t * .015) % 1.6) - .4; ctx.globalAlpha = rain * .95; ctx.drawImage(c.img, x * W, c.y * hy); });
      ctx.globalAlpha = 1;
      // the valley, lit by the hour
      ctx.globalAlpha = .6 * sm(0, 1.2, t); ctx.drawImage(lands[0], 0, 0);
      ctx.globalAlpha = dawn * (1 - day); ctx.drawImage(lands[1], 0, 0);
      ctx.globalAlpha = day; ctx.drawImage(lands[2], 0, 0); ctx.globalAlpha = 1;
      const L = lands[2], f = L.fall, rv = L.river;
      // the waterfall begins, falls, fills its pool
      const fk = sm(4, 6.2, t); Valley.fallRibbon(ctx, f, fk, dpr); if (fk >= 1) Valley.waterfall(ctx, f, t, dpr, .9 * (1 - rain * .3));
      const pool = sm(5.8, 6.8, t); if (pool > 0) { ctx.fillStyle = rgba(mix(pY.river, pY.haze, .35), .9); ctx.beginPath(); ctx.ellipse(f.x, f.bot + H * .004, W * .05 * pool, H * .008 * pool, 0, 0, 6.29); ctx.fill(); }
      // the river carves its way toward us (revealed down the screen, with a bright leading edge)
      const rk = sm(6.5, 10, t); if (rk > 0) { const yEdge = rv.ry(rk); const k2 = dawn * (1 - day);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yEdge); ctx.clip();
        ctx.globalAlpha = 1 - day; ctx.drawImage(lands[k2 > .01 ? 1 : 0].riverLayer, 0, 0); ctx.globalAlpha = day; ctx.drawImage(L.riverLayer, 0, 0); ctx.globalAlpha = 1; ctx.restore();
        if (rk < 1) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(rv.rv(rk), yEdge, rv.rw(rk) * 1.02, 3 * dpr, 0, 0, 6.29); ctx.fill(); }
        if (rk >= 1) Scene.glints(ctx, rv, t, .8 * (1 - rain * .6), dpr, '255,240,210'); }
      const lk = sm(10, 12, t); if (lk > 0) { ctx.globalAlpha = lk; Valley.drawLilies(ctx, lil, rv, t, dt, dpr, false); ctx.globalAlpha = 1; }
      // rain ripples
      if (rain > .2) { if (Math.random() < rain) { const v = .1 + Math.random() * .88; ripples.push({ x: rv.rv(v) + (Math.random() - .5) * rv.rw(v) * 1.6, y: rv.ry(v), r: (2 + v * 8) * dpr, a: 0 }); }
        ripples = ripples.filter(r => (r.a += dt * 1.6) < 1); ctx.strokeStyle = 'rgba(230,240,250,.5)'; ctx.lineWidth = dpr * .8; ripples.forEach(r => { ctx.globalAlpha = 1 - r.a; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (1 + r.a * 2), r.r * .35 * (1 + r.a * 2), 0, 0, 6.29); ctx.stroke(); }); ctx.globalAlpha = 1; }
      // the seed of light falls and lands
      if (t < 2.8) { const fp = 1 - Math.pow(1 - clamp((t - 1.2) / 1.1), 3); if (t > 1.2) { const syy = Y - (1 - fp) * H * .5, al = 1 - sm(2.4, 2.8, t);
        const sg = ctx.createRadialGradient(X, syy, 0, X, syy, 16 * dpr); sg.addColorStop(0, `rgba(255,240,190,${al})`); sg.addColorStop(.3, `rgba(245,200,100,${.8 * al})`); sg.addColorStop(1, 'rgba(245,200,100,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X, syy, 16 * dpr, 0, 6.29); ctx.fill(); } }
      const rp = sm(2.2, 3.4, t); if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(245,210,130,${.6 * (1 - rp)})`; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.ellipse(X, Y, S * .5 * rp, S * .05 * rp, 0, 0, 6.29); ctx.stroke(); }
      // animals walk in and begin to graze
      herd.forEach(h => { const p = clamp((t - h.t0) / h.dur); if (t < h.t0) return; const e = p < 1 ? p * p * (3 - 2 * p) : 1;
        h.x = h.startX + (h.home - h.startX) * e; h.walking = p < 1; const face0 = h.face; if (p < 1) h.face = 1; Valley.animal(ctx, h, t, dpr, false); if (p >= 1) h.face = face0; });
      // the tree: gold sketch → bark, buds → green; it bends in the wind
      const shg = ctx.createRadialGradient(X, Y, 0, X, Y, S * .6); shg.addColorStop(0, `rgba(8,18,6,${.32 * dawn})`); shg.addColorStop(1, 'rgba(8,18,6,0)');
      ctx.save(); ctx.translate(X, Y); ctx.scale(1, .12); ctx.translate(-X, -Y); ctx.fillStyle = shg; ctx.beginPath(); ctx.arc(X, Y, S * .6, 0, 6.29); ctx.fill(); ctx.restore();
      Scene.drawTree(ctx, TREE, X, Y, S, { t, bark: sm(6, 10, t), leafT: t - 1.2, dpr, rim: hex('#F2D088'), glow: dawn > .3 && rain < .5 ? hex('#FFD8A0') : null, roots: t > 3, wind, flutter: .1 + gust(t) * .25 * windAmp(t), time: t, dark: (1 - dawn) * .3 + rain * .2 });
      const z = S * .04; flights.forEach(fl => fl(ctx, t, z, 'rgba(255,214,150,.5)'));
      // the shower, slanting with the wind
      if (rain > 0) { const n = Math.round(170 * rain), slant = 4 + gust(t) * 6; ctx.strokeStyle = 'rgba(215,228,240,.4)'; ctx.lineWidth = dpr; ctx.beginPath();
        for (let i = 0; i < n; i++) { const rx = ((i * 97.3 + t * 60) % W + W) % W, ry = ((i * 53.1 + t * 1100) % H); ctx.moveTo(rx, ry); ctx.lineTo(rx - slant * dpr, ry + 16 * dpr); } ctx.stroke(); }
      // the sun returns: a warm wash
      if (clear > 0) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,200,120,${.25 * clear * (1 - sm(19, 20.5, t))})`; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
      const vg = ctx.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .32, W / 2, H * .5, Math.max(W, H) * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,5,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (t >= DUR) return finish(false);
      raf = requestAnimationFrame(frame);
    };
    let resolve; const out = new Promise(r => resolve = r);
    const finish = fast => { if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener('resize', size); snd && snd.stop(); el.classList.add('out');
      setTimeout(() => { el.remove(); document.documentElement.classList.remove('intro-on'); resolve(); }, fast ? 280 : 800); };
    el.addEventListener('pointerdown', () => { if (snd && snd.ac.state === 'suspended') snd.ac.resume(); finish(true); }); document.addEventListener('keydown', () => finish(true), { once: true });
    raf = requestAnimationFrame(frame);
    return out;
  }
  // the gold leaf-wreath locket used for his photo (opening and Home)
  function locket(photo) {
    let w = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * 360, side = i % 2 ? 1 : -1; w += `<g transform="rotate(${a.toFixed(1)})"><path d="M0 -55 q${side * 5} -5 ${side * 9} -1 q${-side * 5} 4 ${-side * 9} 1z" fill="${i % 3 ? '#E9C46A' : '#F7DE9C'}"/></g>`; }
    return `<div class="op-halo"></div><svg class="op-wreath" viewBox="-64 -64 128 128" aria-hidden="true"><circle r="55" fill="none" stroke="#D8A945" stroke-width="1.2"/>${w}<circle r="49" fill="none" stroke="#F2D088" stroke-width="2"/><circle r="46.5" fill="none" stroke="#7A5418" stroke-width=".8"/>${[0, 90, 180, 270].map(a => `<g transform="rotate(${a})"><circle cy="-55" r="3.2" fill="#FFF1C6" stroke="#C9963A" stroke-width=".8"/></g>`).join('')}</svg><div class="op-img" style="background-image:url('${photo}')"></div>`;
  }
  return { play, locket };
})();
