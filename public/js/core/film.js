/* ============ THE OPENING FILM — "From One Seed to a Greener World" (15 s) ============
 Photoreal frames (public/film/NN.jpg, 720×1280) played as one continuous camera move:
 slow push-ins / pull-backs, long cross-dissolves, and live layers drawn on top
 (rain, sun rays, floating pollen, butterflies, birds, river mist, golden sunrise bloom,
 film grain, vignette) plus a quiet synthesised soundscape (rain → birds → river → warm pad).
   full  : the whole 15 s film (first launch, and Settings → Watch the film)
   short : the final sunrise shot + title, ~4 s (every other open)
 Any tap or key skips. Reduced-motion or missing frames → no film, straight to the app. */
const Film = (() => {
  const XF = 0.75;                                   // cross-dissolve length (s)
  // a/b = camera at shot start/end: s = zoom, x/y = pan (fraction of frame)
  const SHOTS = [
    { src: 'film/01.jpg', t0: 0.0, t1: 1.9, a: { s: 1.10, x: 0, y: .03 }, b: { s: 1.26, x: 0, y: .06 } },     // seed in the rain
    { src: 'film/02.jpg', t0: 1.5, t1: 3.4, a: { s: 1.06, x: 0, y: .02 }, b: { s: 1.20, x: 0, y: .05 } },     // the shoot emerges
    { src: 'film/03.jpg', t0: 3.0, t1: 4.8, a: { s: 1.22, x: 0, y: .05 }, b: { s: 1.10, x: 0, y: .02 } },     // sapling — growth time-lapse
    { src: 'film/04.jpg', t0: 4.4, t1: 6.4, a: { s: 1.20, x: 0, y: .04 }, b: { s: 1.06, x: 0, y: 0 } },       // young tree, branches spreading
    { src: 'film/05.jpg', t0: 6.0, t1: 8.6, a: { s: 1.16, x: .02, y: 0 }, b: { s: 1.04, x: -.02, y: 0 } },    // life gathers around the tree
    { src: 'film/06.jpg', t0: 8.2, t1: 10.4, a: { s: 1.12, x: -.03, y: 0 }, b: { s: 1.18, x: .03, y: 0 } },   // the river through lush green
    { src: 'film/07.jpg', t0: 10.0, t1: 13.2, a: { s: 1.20, x: 0, y: 0 }, b: { s: 1.05, x: 0, y: 0 } },       // more trees, waterfalls
    { src: 'film/08.jpg', t0: 12.8, t1: 15.6, a: { s: 1.28, x: 0, y: .03 }, b: { s: 1.0, x: 0, y: 0 } },      // aerial pull-back, golden sunrise
  ];
  const END = 15.6, SHORT_FROM = 12.0;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = (e0, e1, t) => { const x = clamp((t - e0) / (e1 - e0)); return x * x * (3 - 2 * x); };
  const band = (t, a, b, c, d) => smooth(a, b, t) * (1 - smooth(c, d, t));     // 0→1 over a..b, 1→0 over c..d
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load(src) {
    return new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = () => (im.decode ? im.decode().catch(() => { }) : Promise.resolve()).then(() => res(im)); im.onerror = () => res(null); im.src = src; });
  }
  const timeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);

  /* ---------- live layers ---------- */
  function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function makeLayers(W, H) {
    const R = rnd(20241001);
    const rain = Array.from({ length: 170 }, () => ({ x: R() * W * 1.3, y: R() * H, l: (14 + R() * 26) * (H / 900), v: (900 + R() * 700) * (H / 900), a: .18 + R() * .3 }));
    const motes = Array.from({ length: 46 }, () => ({ x: R() * W, y: R() * H, r: (.8 + R() * 2.2) * (H / 900), p: R() * 6.28, s: .2 + R() * .6 }));
    const flies = Array.from({ length: 6 }, (_, i) => ({ cx: W * (.15 + R() * .7), cy: H * (.42 + R() * .4), rx: W * (.08 + R() * .12), ry: H * (.03 + R() * .05), p: R() * 6.28, sp: .5 + R() * .6, z: (10 + R() * 8) * (H / 900), c: ['#E8832A', '#F2B33D', '#3E7FD8', '#F6F1E6', '#D9542C', '#6FB3E8'][i] }));
    const birds = Array.from({ length: 5 }, (_, i) => ({ x0: -.15 - R() * .3, y: .12 + R() * .2, sp: .16 + R() * .1, z: (7 + R() * 5) * (H / 900), p: R() * 6.28, t0: 6.2 + i * .5 }));
    const flock = Array.from({ length: 13 }, (_, i) => { const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1; return { dx: -row * .028, dy: side * row * .018 + (R() - .5) * .006, z: (4 + R() * 2.5) * (H / 900), p: R() * 6.28 }; });
    const grain = document.createElement('canvas'); grain.width = grain.height = 192;
    const gx = grain.getContext('2d'), id = gx.createImageData(192, 192);
    for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    gx.putImageData(id, 0, 0);
    return { rain, motes, flies, birds, flock, grain };
  }
  // a bird silhouette with flapping wings
  function bird(ctx, x, y, z, ph, alpha) {
    const f = Math.sin(ph), w = z * 1.9;
    ctx.globalAlpha = alpha; ctx.beginPath();
    ctx.moveTo(x - w, y - f * z * .9); ctx.quadraticCurveTo(x - w * .45, y - z * .35 - f * z * .4, x, y);
    ctx.quadraticCurveTo(x + w * .45, y - z * .35 - f * z * .4, x + w, y - f * z * .9);
    ctx.quadraticCurveTo(x + w * .4, y - z * .05, x, y + z * .28); ctx.quadraticCurveTo(x - w * .4, y - z * .05, x - w, y - f * z * .9);
    ctx.fill();
  }
  function butterfly(ctx, x, y, z, ph, c, alpha) {
    const o = .25 + .75 * Math.abs(Math.sin(ph));       // wing opening
    ctx.globalAlpha = alpha; ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x - z * .55 * o, y - z * .2, z * .62 * o, z * .5, -.5, 0, 6.29); ctx.ellipse(x + z * .55 * o, y - z * .2, z * .62 * o, z * .5, .5, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - z * .38 * o, y + z * .38, z * .4 * o, z * .3, -.3, 0, 6.29); ctx.ellipse(x + z * .38 * o, y + z * .38, z * .4 * o, z * .3, .3, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - z * .06, y - z * .45, z * .12, z * .95);
  }

  /* ---------- quiet soundscape (Web Audio, no files) ---------- */
  function soundscape(full) {
    let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const now = ac.currentTime + .05, off = full ? 0 : SHORT_FROM;
    const at = s => now + Math.max(0, s - off);
    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = (type, f, q, peaks) => { const n = ac.createBufferSource(); n.buffer = buf; n.loop = true; const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q; const g = ac.createGain(); g.gain.value = 0; n.connect(bq); bq.connect(g); g.connect(master); peaks.forEach(([t, v]) => g.gain.linearRampToValueAtTime(v, at(t))); n.start(now); n.stop(now + END + 1); };
    if (full) noise('bandpass', 2600, .6, [[0, 0], [.4, .22], [2.4, .2], [3.6, 0]]);          // rain
    noise('lowpass', 700, .4, [[full ? 6 : SHORT_FROM, 0], [full ? 8.5 : SHORT_FROM + .8, .12], [14.5, .1], [END, 0]]); // river
    const chirp = (t, f0, f1, dur, v) => { if (t < off) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, at(t)); o.frequency.exponentialRampToValueAtTime(f1, at(t) + dur); g.gain.setValueAtTime(0, at(t)); g.gain.linearRampToValueAtTime(v, at(t) + .02); g.gain.exponentialRampToValueAtTime(.0001, at(t) + dur); o.connect(g); g.connect(master); o.start(at(t)); o.stop(at(t) + dur + .05); };
    const R = rnd(7);
    for (let t = 6.2; t < 14.8; t += .35 + R() * .7) { const f = 2600 + R() * 1800, n = 2 + Math.floor(R() * 3); for (let k = 0; k < n; k++) chirp(t + k * .09, f, f * (1.25 + R() * .3), .07, .05); }
    // warm pad for the sunrise
    [196, 246.94, 293.66, 392].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = 0; g.gain.setValueAtTime(0, at(Math.max(off, 11.5))); g.gain.linearRampToValueAtTime(.05 - i * .007, at(13.6)); g.gain.linearRampToValueAtTime(0, at(END + .4)); o.connect(g); g.connect(master); o.start(now); o.stop(now + END + 1); });
    master.gain.linearRampToValueAtTime(.9, now + .5);
    return { ac, master, resume: () => ac.resume(), stop: () => { try { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .3); setTimeout(() => ac.close(), 500); } catch (e) { } } };
  }

  /* ---------- play ---------- */
  async function play(mode = 'short') {
    if (still()) return;
    const full = mode === 'full', from = full ? 0 : SHORT_FROM;
    const shots = SHOTS.filter(s => s.t1 > from);
    const el = document.createElement('div'); el.id = 'film'; el.setAttribute('role', 'presentation');
    el.innerHTML = `<div class="fm-bg"></div><canvas></canvas>
      <div class="fm-title"><div class="fm-t1">Affaan's World</div><div class="fm-t2">From one seed, a greener world</div><div class="fm-t3">একটি বীজ থেকে সবুজ পৃথিবী</div></div>
      <button class="fm-snd" type="button" aria-label="Sound">🔈</button><div class="fm-skip">tap to skip</div><div class="fm-bar"><i></i></div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-on');
    const imgs = await timeout(Promise.all(shots.map(s => load(s.src))), full ? 9000 : 5000);
    if (!imgs || imgs.some(i => !i)) { el.remove(); document.documentElement.classList.remove('intro-on'); return false; }
    const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), bg = el.querySelector('.fm-bg'), bar = el.querySelector('.fm-bar i'), title = el.querySelector('.fm-title');
    let W, H, L;
    const size = () => { const dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr); L = makeLayers(W, H); };
    size(); addEventListener('resize', size);
    let snd = null; const sbtn = el.querySelector('.fm-snd');
    try { snd = soundscape(full); if (snd && snd.ac.state === 'running') sbtn.textContent = '🔊'; } catch (e) { }
    sbtn.addEventListener('pointerdown', e => { e.stopPropagation(); if (snd) snd.resume().then(() => sbtn.textContent = '🔊'); });
    let bgShot = -1;
    const draw = (im, cam) => {
      const k = Math.max(W / im.width, H / im.height) * cam.s, w = im.width * k, h = im.height * k;
      ctx.drawImage(im, (W - w) / 2 + cam.x * W, (H - h) / 2 + cam.y * H, w, h);
    };
    const lerpCam = (s, t) => { const u = ease(clamp((t - s.t0) / (s.t1 - s.t0))); return { s: s.a.s + (s.b.s - s.a.s) * u, x: s.a.x + (s.b.x - s.a.x) * u, y: s.a.y + (s.b.y - s.a.y) * u }; };
    const t0 = performance.now(); let raf = 0, done = false;
    const frame = now => {
      const t = from + (now - t0) / 1000;
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#06100a'; ctx.fillRect(0, 0, W, H);
      // photographic plates with cross-dissolves
      shots.forEach((s, i) => {
        if (t < s.t0 - .01 || t > s.t1 + .01) return;
        const a = i === 0 && !full ? 1 : clamp((t - s.t0) / XF);
        if (a <= 0) return; ctx.globalAlpha = ease(a); draw(imgs[i], lerpCam(s, t));
        if (a >= 1 && bgShot !== i) { bgShot = i; bg.style.backgroundImage = `url('${s.src}')`; }
      });
      ctx.globalAlpha = 1;
      const dt = 1 / 60;
      // rain + cool overcast
      const rain = full ? band(t, -1, .3, 2.3, 3.4) : 0;
      if (rain > 0) {
        ctx.fillStyle = `rgba(30,45,60,${.22 * rain})`; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#DCE8F2'; ctx.lineWidth = Math.max(1, H / 900); ctx.beginPath();
        L.rain.forEach(d => { d.y += d.v * dt; d.x -= d.v * dt * .12; if (d.y > H) { d.y = -d.l; d.x = Math.random() * W * 1.3; } ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .12, d.y - d.l); });
        ctx.globalAlpha = .38 * rain; ctx.stroke(); ctx.globalAlpha = 1;
      }
      // sun breaking through: god rays from upper right
      const rays = band(t, 2.0, 3.4, 9.5, 11.5);
      if (rays > 0) {
        ctx.globalCompositeOperation = 'lighter';
        const ox = W * .82, oy = -H * .06;
        for (let i = 0; i < 6; i++) { const ang = 1.95 + i * .13 + Math.sin(t * .25 + i) * .03, len = H * 1.3, wd = .035 + (i % 3) * .015;
          const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len); g.addColorStop(0, `rgba(255,236,190,${.16 * rays})`); g.addColorStop(1, 'rgba(255,236,190,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(ang - wd) * len, oy + Math.sin(ang - wd) * len); ctx.lineTo(ox + Math.cos(ang + wd) * len, oy + Math.sin(ang + wd) * len); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over';
      }
      // pollen / dust motes drifting in the light
      const mo = band(t, 3.2, 4.4, 12.6, 13.6);
      if (mo > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFF2C8';
        L.motes.forEach(m => { m.y -= m.s * dt * H * .03; m.x += Math.sin(t * .8 + m.p) * .4; if (m.y < 0) m.y = H; ctx.globalAlpha = mo * (.25 + .35 * Math.abs(Math.sin(t * 1.3 + m.p))); ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.29); ctx.fill(); });
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      // butterflies around the tree
      const bf = band(t, 6.3, 7.2, 10.2, 11.0);
      if (bf > 0) L.flies.forEach(f => { const a = t * f.sp + f.p; butterfly(ctx, f.cx + Math.cos(a) * f.rx + Math.sin(a * 2.3) * f.rx * .3, f.cy + Math.sin(a * 1.4) * f.ry - (t - 6) * H * .004, f.z, t * 22 + f.p, f.c, .92 * bf); });
      // birds arriving
      ctx.fillStyle = '#1b1712';
      const bd = band(t, 6.0, 6.6, 12.4, 13.2);
      if (bd > 0) L.birds.forEach(b => { if (t < b.t0) return; const u = (t - b.t0) * b.sp; bird(ctx, (b.x0 + u) * W, (b.y + Math.sin(u * 4 + b.p) * .015) * H, b.z, t * 13 + b.p, .85 * bd); });
      // river mist low in frame as the world expands
      const mist = band(t, 9.6, 11.0, 13.6, 15.0);
      if (mist > 0) { const g = ctx.createLinearGradient(0, H * .62, 0, H); g.addColorStop(0, 'rgba(240,246,240,0)'); g.addColorStop(.6, `rgba(240,246,240,${.22 * mist})`); g.addColorStop(1, 'rgba(240,246,240,0)'); ctx.fillStyle = g; ctx.fillRect(0, H * .62, W, H * .38); }
      // golden sunrise bloom + a flock crossing the sky
      const gold = smooth(12.6, 14.6, t);
      if (gold > 0) {
        ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,190,90,${.55 * gold})`; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(W * .5, H * .16, 0, W * .5, H * .16, H * .55);
        g.addColorStop(0, `rgba(255,214,140,${.42 * gold})`); g.addColorStop(.35, `rgba(255,170,80,${.14 * gold})`); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        const u = (t - 12.9) * .2; if (u > 0) L.flock.forEach(b => bird(ctx, (-.1 + u + b.dx) * W, (.3 - u * .35 + b.dy) * H, b.z, t * 11 + b.p, .8 * clamp(u * 4)));
      }
      // vignette, grain, fade in/out
      const vg = ctx.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .5, H * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = .045; ctx.globalCompositeOperation = 'overlay'; const ox = Math.random() * 192, oy = Math.random() * 192;
      ctx.fillStyle = ctx.createPattern(L.grain, 'repeat'); ctx.translate(-ox, -oy); ctx.fillRect(ox, oy, W, H); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      const fade = Math.max(1 - smooth(from, from + .6, t), smooth(END - .5, END, t));
      if (fade > 0) { ctx.fillStyle = `rgba(4,10,6,${fade})`; ctx.fillRect(0, 0, W, H); }
      title.style.opacity = band(t, 13.3, 14.1, END - .45, END).toFixed(3);
      title.style.transform = `translateY(${(1 - smooth(13.3, 14.4, t)) * 14}px)`;
      bar.style.transform = `scaleX(${clamp((t - from) / (END - from)).toFixed(4)})`;
      if (t >= END) return finish(false);
      raf = requestAnimationFrame(frame);
    };
    let resolve; const out = new Promise(r => resolve = r);
    const finish = fast => { if (done) return; done = true; cancelAnimationFrame(raf); removeEventListener('resize', size); snd && snd.stop(); el.classList.add('out');
      setTimeout(() => { el.remove(); document.documentElement.classList.remove('intro-on'); resolve(true); }, fast ? 280 : 450); };
    el.addEventListener('pointerdown', () => finish(true)); document.addEventListener('keydown', () => finish(true), { once: true });
    raf = requestAnimationFrame(frame);
    return out;
  }
  return { play, SHOTS };
})();
