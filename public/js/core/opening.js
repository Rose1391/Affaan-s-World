/* ============ THE OPENING — "The Tree of Life" (≈10.5 s, any tap skips) ============
 EYE 3 language (deep emerald, engraved gold, slow confident motion) told as a baby's story:
   0.0  an emerald night; stars and drifting gold dust over a sleeping landscape
   0.6  a seed of light falls and lands with a soft ripple (music-box note)
   1.5  golden roots spread; 1.7 the tree draws itself in gold, branch by branch
   3.3  buds open along every twig and slowly turn from gold to spring green to deep green;
        dawn rises and lights the land: hills, paddy fields, the river, the meadow;
        the golden sketch becomes living bark with a gold rim
   5.2  four Doels fly in slowly from four directions — flapping, gliding, banking —
        slow down, flare their wings, land on the branches and settle
   6.6  his photo appears as a gold locket in the heart of the crown
   7.6  AFFAAN'S WORLD rises in engraved gold, then আফফানের পৃথিবী and the day of his life
  10.5  fades into the app
 Reduced motion → skipped. */
const Opening = (() => {
  const DUR = 10.5, { clamp, sm, hex, mix, rgba } = Scene;
  let TREE = null;

  function chime(ac, out, t, f, v = .08) {
    const o = ac.createOscillator(), g = ac.createGain(), o2 = ac.createOscillator(), g2 = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 3.01;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(v * .25, t + .01); g2.gain.exponentialRampToValueAtTime(.0001, t + .8);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out); o.start(t); o2.start(t); o.stop(t + 2.5); o2.stop(t + .9);
  }
  function music() {
    let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const out = ac.createGain(); out.gain.value = .9; out.connect(ac.destination); const t = ac.currentTime + .05;
    [[1.55, 784], [2.4, 587], [3.1, 659], [3.8, 784], [4.6, 988], [5.4, 880], [6.4, 784], [7.6, 988], [8.1, 1175], [8.9, 1568, .05]].forEach(([d, f, v]) => chime(ac, out, t + d, f, v));
    const chirp = (d, f) => { const o = ac.createOscillator(), g = ac.createGain(), tt = t + d; o.type = 'sine'; o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 1.35, tt + .08);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.035, tt + .015); g.gain.exponentialRampToValueAtTime(.0001, tt + .12); o.connect(g); g.connect(out); o.start(tt); o.stop(tt + .15); };
    [8.5, 8.62, 8.9, 9.2, 9.32].forEach((d, i) => chirp(d, 2800 + i * 260));
    return { ac, out, stop: () => { try { out.gain.linearRampToValueAtTime(0, ac.currentTime + .4); setTimeout(() => ac.close(), 600); } catch (e) { } } };
  }

  async function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    TREE = TREE || Scene.buildTree(20240930, { t0: 1.7, slow: 1.25 });
    const a = ageOn(Child.birth), g = Cal.greeting(), td = Cal.today();
    let photo = './img/bg-affaan.jpg';
    try { const it = (await galleryItems()).find(i => i.type === 'photo'); if (it) photo = (await Media.url(it.photoId, 'full')) || photo; } catch (e) { }
    const name = "AFFAAN'S WORLD".split('').map((ch, i) => ch === ' ' ? '<span class="op-sp"></span>' : `<span style="animation-delay:${(7.6 + i * .07).toFixed(2)}s">${esc(ch)}</span>`).join('');
    const el = document.createElement('div'); el.id = 'opening'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<canvas></canvas><div class="op-photo">${locket(photo)}</div>
      <div class="op-text"><div class="op-title">${name}</div><div class="op-rule"></div><div class="op-bn">আফফানের পৃথিবী</div>
      <div class="op-greet">${esc(g[0])} · day ${a.days.toLocaleString()} of his life · ${bnNum(td.bd.d)} ${esc(td.bd.month)}</div></div>
      <div class="op-skip">tap to skip</div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-on');
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), ph = el.querySelector('.op-photo');
    let W, H, dpr, X, Y, S, hy, landNight, landDawn, flights = [];
    const pN = Scene.pal('emerald'), pD = Scene.pal('dawn');
    const R = Scene.rng(7);
    const dust = Array.from({ length: 60 }, () => ({ x: R(), y: R(), r: .5 + R() * 1.5, s: .01 + R() * .025, p: R() * 6.3 }));
    const stars = Array.from({ length: 60 }, () => ({ x: R(), y: R() * .5, r: .4 + R() * 1.1, p: R() * 6.3 }));
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      const land = innerWidth > innerHeight; hy = H * (land ? .7 : .63); Y = hy + H * .035;
      const bx = TREE.box; S = Math.min(W * (land ? .62 : .96) / (bx.maxX - bx.minX), (Y - H * .05) / -bx.minY); X = W / 2 - S * (bx.minX + bx.maxX) / 2;
      landNight = Scene.paintLand(W, H, hy, pN, { dpr, seed: 3 }); landDawn = Scene.paintLand(W, H, hy, pD, { dpr, seed: 3, season: td.bd.season.k });
      const pd = TREE.photo.r * 2 * S / dpr; ph.style.width = ph.style.height = pd + 'px';
      ph.style.left = ((X + TREE.photo.x * S) / dpr - pd / 2) + 'px'; ph.style.top = ((Y + TREE.photo.y * S) / dpr - pd / 2) + 'px';
      el.style.setProperty('--ground', (Y / dpr) + 'px');
      const from = [{ x: -.12 * W, y: .3 * H }, { x: .18 * W, y: -.1 * H }, { x: .86 * W, y: -.1 * H }, { x: 1.12 * W, y: .26 * H }];
      flights = TREE.perches.slice(0, 4).map((pc, i) => Scene.flight(from[i], { x: X + pc.x * S, y: Y + pc.y * S }, 5.2 + [0, .55, .95, .3][i], 3.3 + [.2, 0, .3, .1][i], { W, H, arc: .08 + i * .02 }));
    };
    size(); addEventListener('resize', size);
    let snd = null; try { snd = music(); } catch (e) { }
    const t0 = performance.now(); let raf = 0, done = false;
    const frame = now => {
      const t = (now - t0) / 1000, dawn = sm(3.3, 6.8, t);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const skyCol = i => mix(pN.sky[i], pD.sky[i], dawn * (i === 0 ? .55 : .9));
      const gs = ctx.createLinearGradient(0, 0, 0, hy); gs.addColorStop(0, rgba(skyCol(0))); gs.addColorStop(.6, rgba(skyCol(1))); gs.addColorStop(1, rgba(skyCol(2)));
      ctx.fillStyle = gs; ctx.fillRect(0, 0, W, hy + 2);
      if (dawn > 0) { const sx = W * .78, sy = hy - H * .02 - dawn * H * .08, sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .45);
        sg.addColorStop(0, rgba(hex('#FFE3A8'), .85 * dawn)); sg.addColorStop(.06, rgba(hex('#FFD08A'), .5 * dawn)); sg.addColorStop(.4, rgba(hex('#F2A86A'), .14 * dawn)); sg.addColorStop(1, 'rgba(242,168,106,0)');
        ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hy + 2); }
      ctx.fillStyle = '#FFF4D6';
      stars.forEach(s => { ctx.globalAlpha = (1 - dawn) * (.3 + .45 * Math.abs(Math.sin(t * 1.4 + s.p))) * sm(0, .8, t); ctx.beginPath(); ctx.arc(s.x * W, s.y * hy, s.r * dpr, 0, 6.29); ctx.fill(); });
      ctx.globalAlpha = .55 * sm(0, 1.2, t); ctx.drawImage(landNight, 0, 0);
      ctx.globalAlpha = dawn; ctx.drawImage(landDawn, 0, 0); ctx.globalAlpha = 1;
      if (dawn > 0 && landDawn.river) { const rv = landDawn.river; ctx.globalCompositeOperation = 'lighter';
        Scene.glints(ctx, rv, t, dawn, dpr);
        ctx.globalCompositeOperation = 'source-over'; }
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#F3D27A';
      dust.forEach(d => { const y = ((d.y - t * d.s) % 1 + 1) % 1; ctx.globalAlpha = (.15 + .3 * Math.abs(Math.sin(t * 1.1 + d.p))) * sm(0, 1, t) * (1 - dawn * .6); ctx.beginPath(); ctx.arc((d.x + Math.sin(t * .4 + d.p) * .01) * W, y * H, d.r * dpr, 0, 6.29); ctx.fill(); });
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      if (t < 2.2) { const fp = 1 - Math.pow(1 - clamp((t - .6) / .95), 3); if (t > .6) { const sy = Y - (1 - fp) * H * .5, al = 1 - sm(1.8, 2.2, t);
        const sg = ctx.createRadialGradient(X, sy, 0, X, sy, 16 * dpr); sg.addColorStop(0, `rgba(255,240,190,${al})`); sg.addColorStop(.3, `rgba(245,200,100,${.8 * al})`); sg.addColorStop(1, 'rgba(245,200,100,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X, sy, 16 * dpr, 0, 6.29); ctx.fill(); } }
      const rp = sm(1.5, 2.6, t); if (rp > 0 && rp < 1) { ctx.strokeStyle = `rgba(245,210,130,${.6 * (1 - rp)})`; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.ellipse(X, Y, S * .5 * rp, S * .05 * rp, 0, 0, 6.29); ctx.stroke(); }
      TREE.roots.forEach(r => { const p = 1 - Math.pow(1 - clamp((t - r.t0) / 1.1), 3); if (p <= 0) return; ctx.strokeStyle = rgba(mix(hex('#D6AA50'), hex('#5A3E26'), dawn), .5 * (1 - dawn * .6)); ctx.lineWidth = 1.6 * dpr; ctx.beginPath(); ctx.moveTo(X, Y);
        ctx.quadraticCurveTo(X + Math.sin(r.a) * S * r.l * .5 * p, Y + S * r.l * .3 * p, X + Math.sin(r.a) * S * r.l * p, Y + Math.cos(r.a) * S * r.l * .45 * p); ctx.stroke(); });
      if (dawn > 0) { const shg = ctx.createRadialGradient(X, Y, 0, X, Y, S * .55); shg.addColorStop(0, `rgba(10,20,8,${.35 * dawn})`); shg.addColorStop(1, 'rgba(10,20,8,0)'); ctx.save(); ctx.translate(X, Y); ctx.scale(1, .12); ctx.translate(-X, -Y); ctx.fillStyle = shg; ctx.beginPath(); ctx.arc(X, Y, S * .55, 0, 6.29); ctx.fill(); ctx.restore(); }
      Scene.drawTree(ctx, TREE, X, Y, S, { t, bark: sm(4.4, 7.2, t), leafT: t, dpr, rim: hex('#F2D088'), glow: dawn > .3 ? hex('#FFD8A0') : null });
      const z = S * .042; flights.forEach(f => f(ctx, t, z, 'rgba(255,214,150,.55)'));
      const vg = ctx.createRadialGradient(W / 2, H * .5, Math.min(W, H) * .32, W / 2, H * .5, Math.max(W, H) * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,5,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (t >= DUR) return finish(false);
      raf = requestAnimationFrame(frame);
    };
    let resolve; const out = new Promise(r => resolve = r);
    const finish = fast => { if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener('resize', size); snd && snd.stop(); el.classList.add('out');
      setTimeout(() => { el.remove(); document.documentElement.classList.remove('intro-on'); resolve(); }, fast ? 280 : 700); };
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
