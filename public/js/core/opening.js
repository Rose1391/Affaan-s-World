/* ============ THE OPENING — "The Golden Tree of Life" (≈7 s, any tap skips) ============
 EYE 3 language (deep emerald, engraved gold, slow confident motion) told as a baby's story:
   0.0  night garden: emerald sky, a few stars, drifting gold dust
   0.5  a seed of light falls and lands with a soft ripple (music-box note)
   1.2  golden roots spread under the ground
   1.4  the tree grows branch by branch (one fixed, seeded tree, the same every time)
   2.9  blossoms open along every twig; dawn warms the horizon
   3.6  his photo appears in a gold ring at the heart of the canopy
   4.0  a Doel flies through; little letters and stars float up like lanterns (অ A ১ 1 ★ ♥)
   4.5  AFFAAN'S WORLD rises letter by letter in engraved gold, then আফফানের পৃথিবী
   5.6  greeting · day N of his life · Bangla date
   7.0  fades into the app
 Canvas for the living parts, DOM for crisp type and the photo. Reduced motion → skipped. */
const Opening = (() => {
  const DUR = 7.2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const sm = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
  const back = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  // one seeded tree, laid out in unit space (base at 0,0), each segment with its own grow window.
  // Its bounding box is measured so the tree can be drawn as large as the screen allows.
  function buildTree() {
    const R = rng(20240930), segs = [], tips = [];
    const T0 = 1.3, MAXD = 8;
    (function grow(x, y, ang, len, d, t0) {
      const bend = (R() - .5) * .3, x1 = x + Math.sin(ang) * len, y1 = y - Math.cos(ang) * len;
      const cx = (x + x1) / 2 + Math.cos(ang) * len * bend, cy = (y + y1) / 2 + Math.sin(ang) * len * bend;
      const dur = .2 + len * .85, t1 = t0 + dur;
      segs.push({ x, y, cx, cy, x1, y1, w: .05 * Math.pow(.67, d), d, t0, t1 });
      if (d >= MAXD) { tips.push({ x: x1, y: y1, t: t1, r: .6 + R() * .8, c: R() }); return; }
      if (d >= 5 && R() < .7) for (let k = 0; k < 1; k++) tips.push({ x: cx + (R() - .5) * len * .6, y: cy + (R() - .5) * len * .6, t: t1 + R() * .3, r: .45 + R() * .5, c: R() });
      const n = d < 2 ? 2 : (R() < .3 ? 3 : 2), spread = d === 0 ? .5 : d === 1 ? .44 : .36 + R() * .14;
      for (let k = 0; k < n; k++) { const f = n === 1 ? 0 : k / (n - 1) - .5; grow(x1, y1, ang + f * spread * 2 + (R() - .5) * .16, len * (.74 + R() * .08), d + 1, t1 - dur * .3); }
    })(0, 0, 0, .3, 0, T0);
    const roots = Array.from({ length: 9 }, (_, i) => { const a = (i / 8 - .5) * 2.5 + (R() - .5) * .2; return { a, l: .14 + R() * .14, t0: 1.1 + i * .04 }; });
    let minX = 0, maxX = 0, minY = 0; tips.forEach(t => { minX = Math.min(minX, t.x); maxX = Math.max(maxX, t.x); minY = Math.min(minY, t.y); });
    const box = { minX: minX - .04, maxX: maxX + .04, minY: minY - .05 };
    const photo = { x: (box.minX + box.maxX) / 2, y: (box.minY + -.32) / 2, r: .21 };
    // perches: sturdy branch tips spread across the canopy, clear of the photo
    const cand = segs.filter(sg => sg.d >= 3 && sg.d <= 5 && sg.y1 < -.4 && Math.hypot(sg.x1 - photo.x, sg.y1 - photo.y) > photo.r + .07).sort((p, q) => p.x1 - q.x1);
    const perches = [];
    for (let k = 0; k < 6; k++) { const want = box.minX + (box.maxX - box.minX) * (.1 + k * .16);
      const best = cand.filter(c => perches.every(pp => Math.hypot(pp.x - c.x1, pp.y - c.y1) > .14)).sort((p, q) => Math.abs(p.x1 - want) - Math.abs(q.x1 - want))[0];
      if (best) perches.push({ x: best.x1, y: best.y1, ang: Math.atan2(best.y1 - best.y, best.x1 - best.x) }); }
    perches.sort((p, q) => p.x - q.x);
    return { segs, tips, roots, box, photo, perches };
  }
  let TREE = null;

  // partial quadratic Bézier (de Casteljau) for growing strokes
  function partQuad(ctx, s, p, X, Y, S) {
    const ax = s.x + (s.cx - s.x) * p, ay = s.y + (s.cy - s.y) * p, bx = s.cx + (s.x1 - s.cx) * p, by = s.cy + (s.y1 - s.cy) * p;
    const ex = ax + (bx - ax) * p, ey = ay + (by - ay) * p;
    ctx.moveTo(X + s.x * S, Y + s.y * S); ctx.quadraticCurveTo(X + ax * S, Y + ay * S, X + ex * S, Y + ey * S);
  }

  function chime(ac, out, t, f, v = .08) {
    const o = ac.createOscillator(), g = ac.createGain(), o2 = ac.createOscillator(), g2 = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 3.01;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(v * .25, t + .01); g2.gain.exponentialRampToValueAtTime(.0001, t + .7);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out); o.start(t); o2.start(t); o.stop(t + 2.3); o2.stop(t + .8);
  }
  function music() {
    let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const out = ac.createGain(); out.gain.value = .9; out.connect(ac.destination); const t = ac.currentTime + .05;
    // a soft music-box line (G major pentatonic) timed to the story
    [[.95, 784], [1.6, 587], [2.1, 659], [2.6, 784], [3.1, 988], [3.7, 880], [4.5, 784], [4.9, 988], [5.3, 1175], [5.9, 1568, .05]].forEach(([d, f, v]) => chime(ac, out, t + d, f, v));
    return { ac, out, stop: () => { try { out.gain.linearRampToValueAtTime(0, ac.currentTime + .4); setTimeout(() => ac.close(), 600); } catch (e) { } } };
  }

  // the Doel (oriental magpie-robin), Bangladesh's national bird: black above, white belly and wing bar, cocked tail
  function doel(ctx, x, y, z, face, flap, perched, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
    const rim = 'rgba(255,214,140,.55)', bob = perched ? Math.sin(t * 2.2) * .06 : 0;
    ctx.lineWidth = Math.max(1, z * .08); ctx.strokeStyle = rim; ctx.fillStyle = '#0B0F0D';
    // tail
    const tl = perched ? -.35 + Math.sin(t * 3.1) * .12 : .1;
    ctx.save(); ctx.translate(-z * .8, -z * 1.0); ctx.rotate(tl);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-z * 1.25, -z * .55); ctx.lineTo(-z * 1.3, -z * .2); ctx.lineTo(0, z * .25); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#F4F1EA'; ctx.beginPath(); ctx.moveTo(-z * .1, z * .15); ctx.lineTo(-z * 1.25, -z * .25); ctx.stroke(); ctx.restore();
    // far wing (flying)
    if (!perched) { ctx.fillStyle = '#141A17'; ctx.beginPath(); ctx.moveTo(z * .1, -z * 1.15); ctx.quadraticCurveTo(-z * .2, -z * (1.6 + flap * 1.1), -z * .9, -z * (1.3 + flap * 1.6)); ctx.quadraticCurveTo(-z * .3, -z * 1.0, z * .2, -z * .95); ctx.fill(); }
    // body
    ctx.fillStyle = '#0B0F0D'; ctx.strokeStyle = rim;
    ctx.beginPath(); ctx.ellipse(0, -z * .95, z * 1.05, z * .6, -.18, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F7F4EC'; ctx.beginPath(); ctx.ellipse(z * .2, -z * .72, z * .72, z * .36, -.12, 0, 3.3); ctx.fill();
    // head + beak + eye
    ctx.save(); ctx.translate(z * .92, -z * 1.42); ctx.rotate(bob);
    ctx.fillStyle = '#0B0F0D'; ctx.beginPath(); ctx.arc(0, 0, z * .44, 0, 6.29); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(z * .36, -z * .08); ctx.lineTo(z * .82, z * .02); ctx.lineTo(z * .36, z * .1); ctx.fill();
    ctx.fillStyle = '#FFE9B0'; ctx.beginPath(); ctx.arc(z * .14, -z * .1, z * .07, 0, 6.29); ctx.fill(); ctx.restore();
    // near wing with the white bar
    ctx.fillStyle = '#121815';
    if (perched) { ctx.beginPath(); ctx.ellipse(-z * .15, -z * 1.02, z * .78, z * .3, -.2, 0, 6.29); ctx.fill(); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = z * .12; ctx.beginPath(); ctx.moveTo(z * .35, -z * 1.08); ctx.lineTo(-z * .6, -z * .9); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(z * .25, -z * 1.1); ctx.quadraticCurveTo(-z * .1, -z * (1.7 + flap * 1.3), -z * 1.1, -z * (1.25 + flap * 1.9)); ctx.quadraticCurveTo(-z * .4, -z * .9, z * .3, -z * .85); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = z * .12; ctx.beginPath(); ctx.moveTo(z * .1, -z * 1.15); ctx.lineTo(-z * .55, -z * (1.25 + flap * 1.2)); ctx.stroke(); }
    // legs when perched
    if (perched) { ctx.strokeStyle = '#3A2A1A'; ctx.lineWidth = Math.max(1, z * .1); ctx.beginPath(); ctx.moveTo(z * .05, -z * .45); ctx.lineTo(-z * .05, 0); ctx.moveTo(z * .3, -z * .45); ctx.lineTo(z * .25, 0); ctx.stroke(); }
    ctx.restore();
  }
  async function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    TREE = TREE || buildTree();
    const a = ageOn(Child.birth), g = Cal.greeting(), td = Cal.today();
    let photo = './img/bg-affaan.jpg';
    try { const it = (await galleryItems()).find(i => i.type === 'photo'); if (it) photo = (await Media.url(it.photoId, 'full')) || photo; } catch (e) { }
    const name = "AFFAAN'S WORLD".split('').map((ch, i) => ch === ' ' ? '<span class="op-sp"></span>' : `<span style="animation-delay:${(4.5 + i * .07).toFixed(2)}s">${esc(ch)}</span>`).join('');
    const el = document.createElement('div'); el.id = 'opening'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<canvas></canvas><div class="op-photo"><div class="op-halo"></div>${(() => { let w = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * 360, side = i % 2 ? 1 : -1; w += `<g transform="rotate(${a.toFixed(1)})"><path d="M0 -55 q${side * 5} -5 ${side * 9} -1 q${-side * 5} 4 ${-side * 9} 1z" fill="${i % 3 ? '#E9C46A' : '#F7DE9C'}"/></g>`; } return `<svg class="op-wreath" viewBox="-64 -64 128 128" aria-hidden="true"><circle r="55" fill="none" stroke="#D8A945" stroke-width="1.2"/>${w}<circle r="49" fill="none" stroke="#F2D088" stroke-width="2"/><circle r="46.5" fill="none" stroke="#7A5418" stroke-width=".8"/>${[0, 90, 180, 270].map(a => `<g transform="rotate(${a})"><circle cy="-55" r="3.2" fill="#FFF1C6" stroke="#C9963A" stroke-width=".8"/></g>`).join('')}</svg>`; })()}<div class="op-img" style="background-image:url('${photo}')"></div></div>
      <div class="op-text"><div class="op-title">${name}</div><div class="op-rule"></div><div class="op-bn">আফফানের পৃথিবী</div>
      <div class="op-greet">${esc(g[0])} · day ${a.days.toLocaleString()} of his life · ${bnNum(td.bd.d)} ${esc(td.bd.month)}</div></div>
      <div class="op-skip">tap to skip</div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-on');
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), ph = el.querySelector('.op-photo');
    let W, H, dpr, X, Y, S;
    const R = rng(7);
    const dust = Array.from({ length: 70 }, () => ({ x: R(), y: R(), r: .5 + R() * 1.6, s: .01 + R() * .03, p: R() * 6.3 }));
    const stars = Array.from({ length: 46 }, () => ({ x: R(), y: R() * .55, r: .4 + R() * 1.1, p: R() * 6.3 }));
    const glyphs = ['অ', 'A', '১', '★', '♥', 'B', '২', '☾'].map((ch, i) => ({ ch, x: i < 4 ? .08 + i * .075 : .695 + (i - 4) * .075, t0: 4.0 + R() * 1.2, sp: .05 + R() * .04, sz: .8 + R() * .6, p: R() * 6.3 }));
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      const bx = TREE.box; Y = H * (innerWidth > innerHeight ? .7 : .62);
      S = Math.min(W * .96 / (bx.maxX - bx.minX), (Y - H * .045) / -bx.minY); X = W / 2 - S * (bx.minX + bx.maxX) / 2;
      // the photo sits in the heart of the canopy, as a gold locket
      const pd = TREE.photo.r * 2 * S / dpr; ph.style.width = ph.style.height = pd + 'px';
      ph.style.left = ((X + TREE.photo.x * S) / dpr - pd / 2) + 'px'; ph.style.top = ((Y + TREE.photo.y * S) / dpr - pd / 2) + 'px';
      el.style.setProperty('--ground', (Y / dpr) + 'px');
    };
    size(); addEventListener('resize', size);
    // six birds, each arriving from a different direction, ordered left → right like their perches
    const FROM = [[-.12, .18, -.05], [.1, -.08, .04], [.42, -.1, -.06], [.62, -.1, .06], [.94, -.06, -.04], [1.12, .3, .05]];
    const BIRDS = TREE.perches.map((pc, i) => ({ perch: pc, sx: FROM[i % 6][0], sy: FROM[i % 6][1], bend: FROM[i % 6][2], t0: 2.9 + [0, .55, .25, .8, .4, 1.0][i % 6], dur: 1.25 + (i % 3) * .15, ph: i * 1.7, face: 1 }));
    let snd = null; try { snd = music(); } catch (e) { }
    const t0 = performance.now(); let raf = 0, done = false;
    const frame = now => {
      const t = (now - t0) / 1000, dawn = sm(2.4, 5.2, t);
      // sky: deep emerald night → warm dawn glow on the horizon
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#02110C'); sky.addColorStop(.55, `rgb(${6 + dawn * 10},${36 + dawn * 14},${27 + dawn * 4})`); sky.addColorStop(1, `rgb(${4 + dawn * 30},${22 + dawn * 22},${16 + dawn * 6})`);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      if (dawn > 0) { const hg = ctx.createRadialGradient(X, Y, 0, X, Y, Math.max(W, H) * .75); hg.addColorStop(0, `rgba(255,196,110,${.42 * dawn})`); hg.addColorStop(.35, `rgba(240,160,70,${.16 * dawn})`); hg.addColorStop(1, 'rgba(240,160,70,0)'); ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H); }
      // stars fade as dawn comes; gold dust drifts up
      ctx.fillStyle = '#FFF4D6';
      stars.forEach(s => { ctx.globalAlpha = (1 - dawn) * (.35 + .45 * Math.abs(Math.sin(t * 1.4 + s.p))) * sm(0, .8, t); ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r * dpr, 0, 6.29); ctx.fill(); });
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#F3D27A';
      dust.forEach(d => { const y = ((d.y - t * d.s) % 1 + 1) % 1; ctx.globalAlpha = (.18 + .3 * Math.abs(Math.sin(t * 1.1 + d.p))) * sm(0, 1, t); ctx.beginPath(); ctx.arc((d.x + Math.sin(t * .4 + d.p) * .01) * W, y * H, d.r * dpr, 0, 6.29); ctx.fill(); });
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // horizon: a fine gold line with soft mist
      const gl = sm(.3, 1.4, t); if (gl > 0) {
        const lg = ctx.createLinearGradient(X - W * .45, 0, X + W * .45, 0); lg.addColorStop(0, 'rgba(232,192,104,0)'); lg.addColorStop(.5, `rgba(242,205,120,${.75 * gl})`); lg.addColorStop(1, 'rgba(232,192,104,0)');
        ctx.strokeStyle = lg; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.moveTo(X - W * .45 * gl, Y); ctx.quadraticCurveTo(X, Y - 6 * dpr, X + W * .45 * gl, Y); ctx.stroke();
        const mg = ctx.createLinearGradient(0, Y - 30 * dpr, 0, Y + 60 * dpr); mg.addColorStop(0, 'rgba(10,50,36,0)'); mg.addColorStop(.5, `rgba(24,80,56,${.35 * gl})`); mg.addColorStop(1, 'rgba(10,50,36,0)'); ctx.fillStyle = mg; ctx.fillRect(0, Y - 30 * dpr, W, 90 * dpr);
      }
      // the seed of light falls and lands
      if (t < 1.6) { const fp = easeOut((t - .45) / .55); if (t > .45) { const sy = Y - (1 - fp) * H * .5, a = 1 - sm(1.25, 1.6, t);
        const sg = ctx.createRadialGradient(X, sy, 0, X, sy, 16 * dpr); sg.addColorStop(0, `rgba(255,240,190,${a})`); sg.addColorStop(.3, `rgba(245,200,100,${.8 * a})`); sg.addColorStop(1, 'rgba(245,200,100,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X, sy, 16 * dpr, 0, 6.29); ctx.fill();
        if (fp < 1) { ctx.strokeStyle = `rgba(245,210,130,${.35 * a})`; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(X, sy - 50 * dpr); ctx.lineTo(X, sy); ctx.stroke(); } } }
      const rp = sm(1.0, 1.9, t); if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(245,210,130,${.6 * (1 - rp)})`; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.ellipse(X, Y, S * .5 * rp, S * .06 * rp, 0, 0, 6.29); ctx.stroke(); }
      // roots
      TREE.roots.forEach(r => { const p = easeOut((t - r.t0) / .9); if (p <= 0) return; ctx.strokeStyle = `rgba(214,170,80,${.45})`; ctx.lineWidth = 1.6 * dpr; ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.quadraticCurveTo(X + Math.sin(r.a) * S * r.l * .5 * p, Y + S * r.l * .35 * p, X + Math.sin(r.a) * S * r.l * p, Y + Math.cos(r.a) * S * r.l * .5 * p); ctx.stroke(); });
      // the tree: soft glow pass + gold pass
      for (const pass of [0, 1]) {
        ctx.globalCompositeOperation = pass ? 'source-over' : 'lighter'; ctx.lineCap = 'round';
        for (const s of TREE.segs) { if (t <= s.t0) continue; const p = clamp((t - s.t0) / (s.t1 - s.t0));
          ctx.beginPath(); partQuad(ctx, s, easeOut(p), X, Y, S);
          if (pass) { ctx.strokeStyle = s.d < 2 ? '#C4932F' : s.d < 4 ? '#D9AA45' : s.d < 6 ? '#EBC266' : '#F6D98C'; ctx.globalAlpha = 1; ctx.lineWidth = Math.max(.8 * dpr, s.w * S); }
          else { ctx.strokeStyle = '#F2C35A'; ctx.globalAlpha = .07; ctx.lineWidth = s.w * S * 1.7 + 3 * dpr; }
          ctx.stroke(); }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter';
      // blossoms: gold and soft emerald light along the twigs
      for (const b of TREE.tips) { const p = back((t - b.t - .1) / .5); if (p <= 0) continue; const tw = .75 + .25 * Math.sin(t * 2.4 + b.c * 9);
        const r = b.r * dpr * 1.7 * p, x = X + b.x * S, y = Y + b.y * S;
        const c = b.c < .5 ? [240, 200, 110] : b.c < .86 ? [140, 214, 130] : [255, 170, 186];
        const bg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); bg.addColorStop(0, `rgba(${c},${.8 * tw})`); bg.addColorStop(.3, `rgba(${c},${.28 * tw})`); bg.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 6.29); ctx.fill(); }
      // floating letters and stars, like little lanterns
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      glyphs.forEach(gq => { const p = (t - gq.t0); if (p <= 0) return; const a = sm(0, .5, p) * (1 - sm(2.4, 3.0, p));
        ctx.globalAlpha = a * .8; ctx.fillStyle = '#F6DE9A'; ctx.font = `600 ${Math.round(16 * gq.sz * dpr)}px "Baloo 2","Baloo Da 2",sans-serif`;
        ctx.fillText(gq.ch, (gq.x + Math.sin(t * 1.3 + gq.p) * .012) * W, Y - S * .15 - p * gq.sp * H); });
      // Doels fly in from every side and settle on the branches
      ctx.globalCompositeOperation = 'source-over';
      BIRDS.forEach(bd => {
        const p = (t - bd.t0) / bd.dur; if (p <= 0) return;
        const px = X + bd.perch.x * S, py = Y + bd.perch.y * S, z = S * .042;
        if (p < 1) { // flying along an arc, slowing as it lands
          const u = 1 - Math.pow(1 - p, 2.2), sx = bd.sx * W, sy = bd.sy * H, cx = (sx + px) / 2 + bd.bend * W, cy = Math.min(sy, py) - H * .12;
          const x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * px, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * py;
          const dx = 2 * (1 - u) * (cx - sx) + 2 * u * (px - cx);
          doel(ctx, x, y, z, dx >= 0 ? 1 : -1, Math.sin(t * (p > .85 ? 30 : 20) + bd.ph), false, t);
          bd.face = dx >= 0 ? 1 : -1;
        } else { // perched: settle, tail flicks, little head turns
          const land = clamp((p - 1) * bd.dur / .25), hop = Math.sin(land * Math.PI) * z * .4;
          doel(ctx, px, py - hop, z, (t - bd.t0 - bd.dur) % 2.6 > 2.2 ? -bd.face : bd.face, 0, true, t + bd.ph);
        }
      });
      // vignette and the closing fade
      const vg = ctx.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .3, W / 2, H * .5, Math.max(W, H) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,5,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (t >= DUR) return finish(false);
      raf = requestAnimationFrame(frame);
    };
    let resolve; const out = new Promise(r => resolve = r);
    const finish = fast => { if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener('resize', size); snd && snd.stop(); el.classList.add('out');
      setTimeout(() => { el.remove(); document.documentElement.classList.remove('intro-on'); resolve(); }, fast ? 280 : 600); };
    el.addEventListener('pointerdown', () => { if (snd && snd.ac.state === 'suspended') snd.ac.resume(); finish(true); }); document.addEventListener('keydown', () => finish(true), { once: true });
    raf = requestAnimationFrame(frame);
    return out;
  }
  return { play };
})();
