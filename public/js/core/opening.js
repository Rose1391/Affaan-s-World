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
  const DUR = 6.6;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const sm = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
  const back = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  // one seeded tree, laid out in unit space (base at 0,0, height ≈ 1), each segment with its own grow window
  function buildTree() {
    const R = rng(20240930), segs = [], tips = [];
    const T0 = 1.4, MAXD = 7;
    (function grow(x, y, ang, len, d, t0) {
      const bend = (R() - .5) * .35, x1 = x + Math.sin(ang) * len, y1 = y - Math.cos(ang) * len;
      const cx = (x + x1) / 2 + Math.cos(ang) * len * bend, cy = (y + y1) / 2 + Math.sin(ang) * len * bend;
      const dur = .26 + len * .9, t1 = t0 + dur;
      segs.push({ x, y, cx, cy, x1, y1, w: .042 * Math.pow(.66, d), d, t0, t1 });
      if (d >= MAXD) { tips.push({ x: x1, y: y1, t: t1, r: .6 + R() * .8, c: R() }); return; }
      if (d >= 4) for (let k = 0; k < 2; k++) tips.push({ x: cx + (R() - .5) * len * .6, y: cy + (R() - .5) * len * .6, t: t1 + R() * .3, r: .45 + R() * .5, c: R() });
      const n = d < 2 ? 2 : (R() < .28 ? 3 : 2), spread = d === 0 ? .62 : .42 + R() * .14;
      for (let k = 0; k < n; k++) { const f = n === 1 ? 0 : k / (n - 1) - .5; grow(x1, y1, ang + f * spread * 2 + (R() - .5) * .18, len * (.72 + R() * .08), d + 1, t1 - dur * .25); }
    })(0, 0, 0, .3, 0, T0);
    const roots = Array.from({ length: 7 }, (_, i) => { const a = (i / 6 - .5) * 2.4 + (R() - .5) * .2; return { a, l: .16 + R() * .14, t0: 1.15 + i * .05 }; });
    return { segs, tips, roots };
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

  async function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    TREE = TREE || buildTree();
    const a = ageOn(Child.birth), g = Cal.greeting(), td = Cal.today();
    let photo = './img/bg-affaan.jpg';
    try { const it = (await galleryItems()).find(i => i.type === 'photo'); if (it) photo = (await Media.url(it.photoId, 'full')) || photo; } catch (e) { }
    const name = "AFFAAN'S WORLD".split('').map((ch, i) => ch === ' ' ? '<span class="op-sp"></span>' : `<span style="animation-delay:${(4.5 + i * .07).toFixed(2)}s">${esc(ch)}</span>`).join('');
    const el = document.createElement('div'); el.id = 'opening'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<canvas></canvas><div class="op-photo"><div class="op-ring"></div><div class="op-img" style="background-image:url('${photo}')"></div></div>
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
      S = Math.min(H * .46, W * .6); X = W / 2; Y = H * (innerWidth > innerHeight ? .66 : .6);
      // the photo sits in the heart of the canopy
      const pd = S * .3 / dpr; ph.style.width = ph.style.height = pd + 'px';
      ph.style.left = (X / dpr - pd / 2) + 'px'; ph.style.top = ((Y - S * .78) / dpr - pd / 2) + 'px';
      el.style.setProperty('--ground', (Y / dpr) + 'px');
    };
    size(); addEventListener('resize', size);
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
        const r = b.r * dpr * 2.5 * p, x = X + b.x * S, y = Y + b.y * S;
        const c = b.c < .55 ? [246, 214, 130] : b.c < .85 ? [160, 226, 150] : [255, 182, 196];
        const bg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4); bg.addColorStop(0, `rgba(${c},${.9 * tw})`); bg.addColorStop(.35, `rgba(${c},${.45 * tw})`); bg.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 6.29); ctx.fill(); }
      // floating letters and stars, like little lanterns
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      glyphs.forEach(gq => { const p = (t - gq.t0); if (p <= 0) return; const a = sm(0, .5, p) * (1 - sm(2.4, 3.0, p));
        ctx.globalAlpha = a * .8; ctx.fillStyle = '#F6DE9A'; ctx.font = `600 ${Math.round(16 * gq.sz * dpr)}px "Baloo 2","Baloo Da 2",sans-serif`;
        ctx.fillText(gq.ch, (gq.x + Math.sin(t * 1.3 + gq.p) * .012) * W, Y - S * .15 - p * gq.sp * H); });
      // a Doel flies through
      const bp = (t - 3.9) / 2.2; if (bp > 0 && bp < 1) { const bx = (-.1 + bp * 1.2) * W, by = (Y - S * 1.05) + Math.sin(bp * 6) * 14 * dpr, f = Math.sin(t * 18), z = 9 * dpr;
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .95 * sm(0, .1, bp) * (1 - sm(.9, 1, bp)); ctx.fillStyle = '#10261C';
        ctx.beginPath(); ctx.ellipse(bx, by, z * 1.1, z * .5, -.1, 0, 6.29); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx - z * .2, by - z * .2); ctx.quadraticCurveTo(bx - z * .9, by - z * (1.1 + f), bx - z * 1.8, by - z * (.6 + f * 1.2)); ctx.quadraticCurveTo(bx - z * .8, by - z * .1, bx + z * .2, by); ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx - z, by); ctx.lineTo(bx - z * 2.1, by + z * .35); ctx.lineTo(bx - z * 1.9, by - z * .1); ctx.fill();
        ctx.fillStyle = '#F6F1E6'; ctx.beginPath(); ctx.ellipse(bx + z * .1, by + z * .18, z * .6, z * .22, -.1, 0, 6.29); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
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
