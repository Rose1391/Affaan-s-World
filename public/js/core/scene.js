/* ============ SCENE ENGINE — the living landscape shared by the opening and Home ============
 Painted, not drawn: atmospheric hill ranges, a forest line, Bangladeshi paddy fields in perspective,
 a winding river that mirrors the sky, meadow grass, a natural tree whose leaves bud and turn green,
 and the Doel (oriental magpie-robin) with a real flight model: flap/glide cycles, banking,
 slowing on approach, wings flared to land, then folding and settling.
 Everything static is painted once to offscreen canvases; each frame only composites and animates. */
const Scene = (() => {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const sm = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));
  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const noise = seed => { const R = rng(seed), v = Array.from({ length: 512 }, R); return x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return v[i & 511] + (v[(i + 1) & 511] - v[i & 511]) * u; }; };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

  /* ---------- palettes by light ---------- */
  const P = {
    emerald: { sky: ['#02110C', '#05231A', '#0A3427'], far: '#0D3123', mid: '#0A281C', near: '#06190F', river: '#0E3A2E', haze: '#134131', grass: '#0B2918', field: '#0C2E1C', sun: '#F2D088' },
    night: { sky: ['#040A12', '#0A1826', '#14293B'], far: '#1A2B39', mid: '#11211A', near: '#0B170F', river: '#1B3045', haze: '#1E3446', grass: '#13291A', field: '#11281A', sun: '#DCE8F6' },
    dawn: { sky: ['#2C3A6A', '#D4846B', '#F5C690'], far: '#9A88A3', mid: '#55704E', near: '#3D6532', river: '#9FB0CC', haze: '#E7B79F', grass: '#4A7838', field: '#6F8E45', sun: '#FFD9A0' },
    day: { sky: ['#3A84CC', '#84C0EA', '#D4EAF6'], far: '#8DAFC4', mid: '#5B9452', near: '#4A893B', river: '#9ACFEE', haze: '#CDE4F1', grass: '#5A9944', field: '#86B04E', sun: '#FFF4D6' },
    dusk: { sky: ['#241E4A', '#B65C77', '#F09E5C'], far: '#6C5A7C', mid: '#3D5739', near: '#2D4B29', river: '#9A8FB0', haze: '#D49886', grass: '#3B632F', field: '#7A7A3E', sun: '#FFBE78' },
  };
  const pal = k => { const p = P[k] || P.day, o = {}; for (const [n, v] of Object.entries(p)) o[n] = Array.isArray(v) ? v.map(hex) : hex(v); return o; };

  /* ---------- sky ---------- */
  function drawSky(ctx, W, H, hy, p) {
    const g = ctx.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, rgba(p.sky[0])); g.addColorStop(.55, rgba(p.sky[1])); g.addColorStop(1, rgba(p.sky[2]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
  }

  /* ---------- the land, painted once ---------- */
  function paintLand(W, H, hy, p, opt = {}) {
    const c = canvas(W, H), x = c.getContext('2d'), R = rng(opt.seed || 7), n1 = noise(11), n2 = noise(23), n3 = noise(37), n4 = noise(51);
    const dpr = opt.dpr || 1, season = opt.season || '';
    // far range — pale with distance
    const ridge = (fn, base, amp) => { x.beginPath(); x.moveTo(0, hy + 2); for (let px = 0; px <= W; px += 3) x.lineTo(px, hy - H * fn(px / W)); x.lineTo(W, hy + 2); x.closePath(); };
    ridge(u => .045 + .07 * n1(u * 2.4 + 1.3) + .02 * n2(u * 9), 0, 0);
    let g = x.createLinearGradient(0, hy - H * .13, 0, hy); g.addColorStop(0, rgba(mix(p.far, p.haze, .15))); g.addColorStop(1, rgba(mix(p.far, p.haze, .7))); x.fillStyle = g; x.fill();
    // second range
    ridge(u => .016 + .034 * n3(u * 3.1 + 4.2) + .008 * n2(u * 14 + 3), 0, 0);
    g = x.createLinearGradient(0, hy - H * .06, 0, hy); g.addColorStop(0, rgba(mix(p.mid, p.haze, .25))); g.addColorStop(1, rgba(mix(p.mid, p.haze, .55))); x.fillStyle = g; x.fill();
    // forest line along the near ridge
    for (let px = -6; px <= W + 6; px += 3.2 * dpr) { const top = hy - H * (.012 + .03 * n3(px / W * 3.1 + 4.2)), r = (2.2 + R() * 3.4) * dpr;
      x.fillStyle = rgba(mix(mix(p.mid, p.haze, .3), [0, 0, 0], R() * .18)); x.beginPath(); x.arc(px, top + r * .6 + R() * 3 * dpr, r, 0, 6.29); x.fill(); }
    // ground
    g = x.createLinearGradient(0, hy, 0, H); g.addColorStop(0, rgba(mix(p.near, p.haze, .5))); g.addColorStop(.35, rgba(mix(p.field, p.near, .3))); g.addColorStop(1, rgba(mix(p.near, [0, 0, 0], .25)));
    x.fillStyle = g; x.fillRect(0, hy, W, H - hy);
    // paddy fields in perspective (golden in Hemonto)
    const fieldC = season === 'hemonto' ? hex('#C8A848') : p.field;
    for (let row = 0; row < 26; row++) { const v0 = Math.pow(row / 26, 1.7), v1 = Math.pow((row + 1) / 26, 1.7), y0 = hy + (H - hy) * .62 * v0, y1 = hy + (H - hy) * .62 * v1;
      for (let col = -8; col < 12; col++) { const sk = (col - 2) * W * .14, l = W * .5 + sk * (0.25 + v0 * 2.2), r = W * .5 + (sk + W * .14) * (0.25 + v0 * 2.2), l1 = W * .5 + sk * (0.25 + v1 * 2.2), r1 = W * .5 + (sk + W * .14) * (0.25 + v1 * 2.2);
        const shade = (n4(row * 1.7 + col * 3.3) - .5) * .1, base = mix(fieldC, p.near, .25 + v0 * .3);
        x.fillStyle = rgba(mix(base, shade > 0 ? [255, 250, 210] : [0, 0, 0], Math.abs(shade)), .35 + v0 * .3);
        x.beginPath(); x.moveTo(l, y0); x.lineTo(r, y0); x.lineTo(r1, y1); x.lineTo(l1, y1); x.closePath(); x.fill(); } }
    // aisles (thin light lines between plots)
    x.strokeStyle = rgba(mix(p.haze, p.field, .4), .1); x.lineWidth = Math.max(.6, .7 * dpr);
    for (let col = -8; col < 12; col++) { const sk = (col - 2) * W * .14; x.beginPath(); x.moveTo(W * .5 + sk * .25, hy); x.lineTo(W * .5 + sk * (.25 + 2.2), hy + (H - hy) * .62); x.stroke(); }
    // river: from the horizon, winding toward us, widening with perspective
    const rv = v => W * ((opt.riverX ?? .62) + .14 * Math.sin(v * 3.1 + .4) * (.3 + v) + (opt.riverShift ?? .16) * v), rw = v => W * (.006 + .2 * Math.pow(v, 1.7)), ry = v => hy + (H - hy) * v;
    x.beginPath(); for (let i = 0; i <= 60; i++) { const v = i / 60; x.lineTo(rv(v) - rw(v), ry(v)); } for (let i = 60; i >= 0; i--) { const v = i / 60; x.lineTo(rv(v) + rw(v), ry(v)); } x.closePath();
    g = x.createLinearGradient(0, hy, 0, H); g.addColorStop(0, rgba(mix(p.river, p.haze, .5))); g.addColorStop(.45, rgba(mix(p.river, [30, 70, 100], .3))); g.addColorStop(1, rgba(mix(p.river, [10, 35, 55], .6)));
    x.fillStyle = g; x.fill();
    x.strokeStyle = rgba(mix(p.near, [0, 0, 0], .35), .7); x.lineWidth = 2 * dpr;
    for (const s of [-1, 1]) { x.beginPath(); for (let i = 0; i <= 60; i++) { const v = i / 60; x.lineTo(rv(v) + s * rw(v), ry(v)); } x.stroke(); }
    // meadow grass in the foreground
    for (let i = 0; i < 2400; i++) { const v = .55 + Math.pow(R(), .7) * .45, px = R() * W, py = hy + (H - hy) * v, len = (3 + R() * 9) * dpr * (.4 + v), lean = (R() - .5) * 4 * dpr;
      if (Math.abs(px - rv(v)) < rw(v) + 2 * dpr) continue;
      x.strokeStyle = rgba(mix(p.grass, R() < .5 ? [0, 0, 0] : p.haze, R() * .3), .7); x.lineWidth = Math.max(.7, .9 * dpr * v);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + lean * .3, py - len * .6, px + lean, py - len); x.stroke(); }
    // framing shrubs at the near corners
    for (const side of [0, 1]) for (let i = 0; i < 26; i++) { const px = side ? W - R() * W * .22 : R() * W * .22, py = H - R() * (H - hy) * .22, r = (8 + R() * 18) * dpr;
      x.fillStyle = rgba(mix(p.near, [0, 0, 0], .2 + R() * .3)); x.beginPath(); x.arc(px, py, r, 0, 6.29); x.fill(); }
    // mist on the horizon
    g = x.createLinearGradient(0, hy - H * .03, 0, hy + H * .06); g.addColorStop(0, rgba(p.haze, 0)); g.addColorStop(.45, rgba(p.haze, .35)); g.addColorStop(1, rgba(p.haze, 0)); x.fillStyle = g; x.fillRect(0, hy - H * .03, W, H * .09);
    c.river = { rv, rw, ry };
    return c;
  }

  /* ---------- the tree ---------- */
  function buildTree(seed = 20240930, o = {}) {
    const R = rng(seed), segs = [], leaves = [], T0 = o.t0 ?? 1.3, MAXD = o.maxd ?? 7, slow = o.slow ?? 1;
    (function grow(x, y, ang, len, d, t0) {
      const bend = (R() - .5) * (d === 0 ? .16 : .5), x1 = x + Math.sin(ang) * len, y1 = y - Math.cos(ang) * len;
      const cx = (x + x1) / 2 + Math.cos(ang) * len * bend, cy = (y + y1) / 2 + Math.sin(ang) * len * bend;
      const dur = (.22 + len * .9) * slow, t1 = t0 + dur;
      segs.push({ x, y, cx, cy, x1, y1, w: (d === 0 ? .075 : .06 * Math.pow(.66, d)), d, t0, t1, ang });
      if (d >= 4) { const n = d >= MAXD ? 4 : d >= 6 ? 3 : 2;
        for (let k = 0; k < n; k++) { const u = d >= MAXD && k === n - 1 ? 1 : (k + 1) / (n + .5), side = k % 2 ? 1 : -1, mx = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * x1, my = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * y1;
          leaves.push({ x: mx, y: my, a: ang - Math.PI / 2 + side * (.7 + R() * .6), s: .019 + R() * .013, t0: t1 - dur * (1 - u) + .15 + R() * .5, v: R() }); } }
      if (d >= MAXD) return;
      // natural branching: uneven forks (sometimes one, two or three), uneven lengths, a pull toward the light,
      // and small side shoots growing out along the way
      const r0 = R(), n = d < 2 ? 2 : r0 < .12 ? 1 : r0 < .74 ? 2 : 3, spread = d === 0 ? .52 : d === 1 ? .46 : .34 + R() * .18;
      for (let k = 0; k < n; k++) { const f = n === 1 ? 0 : k / (n - 1) - .5; let a2 = ang + f * spread * 2 + (R() - .5) * (n === 1 ? .5 : .32);
        if (d >= 2 && Math.abs(a2) > .95) a2 *= .88;
        grow(x1, y1, a2, len * (.62 + R() * .26), d + 1, t1 - dur * .3); }
      if (d >= 1 && d <= 4 && R() < .7) { const u = .4 + R() * .3, mx = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * x1, my = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * y1;
        grow(mx, my, ang + (R() < .5 ? -1 : 1) * (.7 + R() * .4), len * (.34 + R() * .14), Math.min(MAXD, d + 2), t0 + dur * u); }
    })(0, 0, (R() - .5) * .06, .3, 0, T0);
    const roots = Array.from({ length: 9 }, (_, i) => { const a = (i / 8 - .5) * 2.5 + (R() - .5) * .2; return { a, l: .14 + R() * .14, t0: T0 - .25 + i * .04 }; });
    let minX = 0, maxX = 0, minY = 0; leaves.forEach(l => { minX = Math.min(minX, l.x); maxX = Math.max(maxX, l.x); minY = Math.min(minY, l.y); });
    const box = { minX: minX - .05, maxX: maxX + .05, minY: minY - .05 };
    leaves.forEach(l => { const frac = (l.y - box.minY) / -box.minY; l.v = clamp(1 - frac * .85 + (l.v - .5) * .35); });
    const photo = { x: (box.minX + box.maxX) / 2, y: (box.minY - .32) / 2, r: .2 };
    const cand = segs.filter(s => s.d >= 3 && s.d <= 5 && s.y1 < -.42 && Math.abs(s.ang) < 1.25 && Math.hypot(s.x1 - photo.x, s.y1 - photo.y) > photo.r + .08).sort((p, q) => p.x1 - q.x1);
    const perches = [];
    for (let k = 0; k < 4; k++) { const want = box.minX + (box.maxX - box.minX) * [.14, .38, .64, .88][k];
      const best = cand.filter(c => perches.every(pp => Math.hypot(pp.x - c.x1, pp.y - c.y1) > .2)).sort((p, q) => Math.abs(p.x1 - want) - Math.abs(q.x1 - want))[0];
      if (best) perches.push({ x: (best.x1 * 2 + best.cx) / 3, y: (best.y1 * 2 + best.cy) / 3 }); }
    perches.sort((p, q) => p.x - q.x);
    const end = Math.max(...segs.map(s => s.t1)), leafEnd = Math.max(...leaves.map(l => l.t0));
    return { segs, leaves, roots, box, photo, perches, end, leafEnd };
  }
  const GOLD = [hex('#C4932F'), hex('#D9AA45'), hex('#EBC266'), hex('#F6D98C')];
  const BARK = hex('#5A3E26'), BARK_LT = hex('#7A5634');
  const LEAF_BUD = hex('#E6D66E'), LEAF_SPRING = hex('#8FD04E'), LEAF_DEEP = [hex('#2C8A3A'), hex('#3B9E44'), hex('#4FB650')];
  // draw the tree. st: { t (growth clock), bark 0..1 (gold → living bark), rim colour, leafT (leaf clock),
  //   wind: (x, y, h) → [dx, dy] displacement in tree units (the crown bends, the base stays put),
  //   dark 0..1 (night tone), roots: true to draw the flared base and buttress roots sinking into the soil }
  const NIGHT = hex('#0C1A30');
  function drawTree(ctx, T, X, Y, S, st) {
    const t = st.t ?? 99, bark = st.bark ?? 1, dpr = st.dpr || 1, rim = st.rim || hex('#F2D088'), dark = st.dark || 0, H0 = -T.box.minY;
    const tone = c => dark ? mix(c, NIGHT, dark) : c;
    const W8 = st.wind ? (x, y) => { const h = clamp(-y / H0); const d = st.wind(x, y, h); return [x + d[0], y + d[1]]; } : (x, y) => [x, y];
    const ease = x => 1 - Math.pow(1 - clamp(x), 3);
    const segPts = s => { const a = W8(s.x, s.y), c = W8(s.cx, s.cy), b = W8(s.x1, s.y1); return [a, c, b]; };
    const partQuad = (pts, p, off = 0) => { const [a, c, b] = pts, ax = a[0] + (c[0] - a[0]) * p, ay = a[1] + (c[1] - a[1]) * p, bx = c[0] + (b[0] - c[0]) * p, by = c[1] + (b[1] - c[1]) * p;
      ctx.moveTo(X + a[0] * S + off, Y + a[1] * S); ctx.quadraticCurveTo(X + ax * S + off, Y + ay * S, X + (ax + (bx - ax) * p) * S + off, Y + (ay + (by - ay) * p) * S); };
    ctx.lineCap = 'round';
    // the flared base and roots that sink into the ground
    if (st.roots) {
      const wb = T.segs[0].w * S, barkC = tone(BARK), barkD = tone(mix(BARK, [20, 12, 6], .35));
      const mound = ctx.createRadialGradient(X, Y + wb * .2, 0, X, Y + wb * .2, wb * 4.2); mound.addColorStop(0, rgba(tone(hex('#4A3522')), .9)); mound.addColorStop(.55, rgba(tone(hex('#5B4A2E')), .45)); mound.addColorStop(1, 'rgba(60,50,30,0)');
      ctx.save(); ctx.translate(X, Y + wb * .25); ctx.scale(1, .22); ctx.fillStyle = mound; ctx.beginPath(); ctx.arc(0, 0, wb * 4.2, 0, 6.29); ctx.fill(); ctx.restore();
      [[-1, 1.0, 3.2], [1, 1.0, 3.4], [-1, .45, 2.2], [1, .5, 2.4], [-1, .15, 1.6], [1, .2, 1.5]].forEach(([dir, lift, len]) => {
        const sx = X + dir * wb * .3, sy = Y - wb * (.25 + lift * .35), ex = X + dir * wb * len, ey = Y + wb * (.12 + .18 * (1 - lift));
        const g = ctx.createLinearGradient(sx, sy, ex, ey); g.addColorStop(0, rgba(barkC)); g.addColorStop(.7, rgba(barkD)); g.addColorStop(1, rgba(barkD, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, sy - wb * .25); ctx.quadraticCurveTo(X + dir * wb * len * .45, Y - wb * .05, ex, ey);
        ctx.quadraticCurveTo(X + dir * wb * len * .4, Y + wb * .3, sx, sy + wb * .55); ctx.closePath(); ctx.fill(); });
      // the trunk widens into the ground
      ctx.fillStyle = rgba(barkC); ctx.beginPath(); ctx.moveTo(X - wb * 1.25, Y + wb * .15); ctx.quadraticCurveTo(X - wb * .5, Y - wb * .1, X - wb * .5, Y - wb * 1.6);
      ctx.lineTo(X + wb * .5, Y - wb * 1.6); ctx.quadraticCurveTo(X + wb * .5, Y - wb * .1, X + wb * 1.3, Y + wb * .15); ctx.closePath(); ctx.fill();
      // grass growing over the root ends
      ctx.strokeStyle = rgba(tone(hex('#4A8A3A')), .8);
      ctx.lineWidth = Math.max(.6, dpr * .7);
      for (let i = 0; i < 90; i++) { const gx = X + (i / 89 - .5) * wb * 7.5 + ((i * 53) % 9 - 4) * dpr, gy = Y + wb * (.2 + ((i * 37) % 7) / 40), l = wb * (.12 + ((i * 13) % 5) / 30);
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + l * .15, gy - l * .6, gx + l * .3 * (i % 2 ? 1 : -1), gy - l); ctx.stroke(); }
    }
    if (bark < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(hex('#F2C35A'), .07 * (1 - bark));
      for (const s of T.segs) { if (t <= s.t0) continue; ctx.lineWidth = s.w * S * 1.7 + 3 * dpr; ctx.beginPath(); partQuad(segPts(s), ease((t - s.t0) / (s.t1 - s.t0))); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over'; }
    for (const s of T.segs) { if (t <= s.t0) continue; const p = ease((t - s.t0) / (s.t1 - s.t0)), pts = segPts(s);
      const gold = GOLD[Math.min(3, s.d >> 1)], col = tone(mix(gold, s.d < 3 ? BARK : BARK_LT, bark));
      ctx.strokeStyle = rgba(col); ctx.lineWidth = Math.max(.8 * dpr, s.w * S); ctx.beginPath(); partQuad(pts, p); ctx.stroke();
      if (bark > 0 && s.d < 5) { ctx.strokeStyle = rgba(dark ? mix(rim, NIGHT, dark * .6) : rim, .35 * bark * (1 - dark * .5)); ctx.lineWidth = Math.max(.6 * dpr, s.w * S * .28); ctx.beginPath(); partQuad(pts, p, s.w * S * .3); ctx.stroke(); } }
    // leaves, batched by colour bucket; in wind each leaf also flutters
    const lt = st.leafT ?? t, buckets = new Map(), flut = st.wind ? st.flutter || 0 : 0, tt = st.time || 0;
    for (const l of T.leaves) { const age = lt - l.t0; if (age <= 0) continue;
      const sc = clamp(age / .45), g = clamp((age - .2) / 2.6), vb = l.v < .33 ? 0 : l.v < .7 ? 1 : 2;
      const key = Math.round(g * 14) + '|' + vb; let b = buckets.get(key); if (!b) { b = { g: Math.round(g * 14) / 14, vb, list: [] }; buckets.set(key, b); } b.list.push([l, sc]); }
    for (const b of buckets.values()) {
      const c = tone(b.g < .45 ? mix(LEAF_BUD, LEAF_SPRING, b.g / .45) : mix(LEAF_SPRING, LEAF_DEEP[b.vb], (b.g - .45) / .55));
      ctx.fillStyle = rgba(c); ctx.beginPath();
      for (const [l, sc] of b.list) { const r = l.s * S * sc, q = W8(l.x, l.y), a = l.a + (flut ? Math.sin(tt * 7 + l.x * 40 + l.y * 23) * flut : 0), px = X + q[0] * S, py = Y + q[1] * S;
        ctx.moveTo(px + Math.cos(a) * r, py + Math.sin(a) * r); ctx.ellipse(px, py, r, r * .42, a, 0, 6.29); }
      ctx.fill(); }
    if (st.glow) { const g = ctx.createRadialGradient(X + (T.box.minX + T.box.maxX) * .35 * S, Y + T.box.minY * .75 * S, 0, X, Y + T.box.minY * .6 * S, S * .9);
      g.addColorStop(0, rgba(st.glow, .22)); g.addColorStop(1, rgba(st.glow, 0)); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(X + T.box.minX * S, Y + T.box.minY * S, (T.box.maxX - T.box.minX) * S, -T.box.minY * S); ctx.globalCompositeOperation = 'source-over'; }
  }

  /* ---------- the Doel ---------- */
  // origin at the feet, facing right. wing: 1 = raised, -1 = lowered. pose: 'fly' | 'land' | 'perch'
  function doel(ctx, x, y, z, face, wing, pose, tilt, t, rim) {
    ctx.save(); ctx.translate(x, y); ctx.scale(face, 1); ctx.rotate(tilt || 0);
    const BLK = '#0A0E0C', WHT = '#F6F3EA', rimC = rim || 'rgba(255,214,150,.5)';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(.8, z * .07);
    const wingShape = (sx, sy, w, dark) => { // a feathered wing from the shoulder
      const tipX = sx - z * 1.55, tipY = sy - z * 1.75 * w, midX = sx - z * .7, midY = sy - z * .95 * w;
      ctx.fillStyle = dark ? '#141A17' : BLK; ctx.beginPath(); ctx.moveTo(sx + z * .15, sy);
      ctx.quadraticCurveTo(midX + z * .3, midY - z * .35, tipX, tipY);
      for (let k = 1; k <= 4; k++) { const u = k / 4; ctx.lineTo(lerp(tipX, sx - z * .55, u) + z * .12 * (k % 2), lerp(tipY, sy + z * .1, u) + z * .14); }
      ctx.closePath(); ctx.fill(); if (!dark) { ctx.strokeStyle = rimC; ctx.stroke();
        ctx.strokeStyle = WHT; ctx.lineWidth = z * .13; ctx.beginPath(); ctx.moveTo(sx - z * .12, sy - z * .1 * w); ctx.lineTo(lerp(sx, tipX, .55), lerp(sy, tipY, .55) + z * .08); ctx.stroke(); ctx.lineWidth = Math.max(.8, z * .07); } };
    const flying = pose !== 'perch';
    if (flying) wingShape(z * .1, -z * 1.12, wing * .9 + .1, true);
    // tail: long, cocked up when perched, streamlined in flight
    const tailA = pose === 'perch' ? -.55 + Math.sin(t * 2.6) * .09 : pose === 'land' ? -.35 : .12;
    ctx.save(); ctx.translate(-z * .78, -z * .98); ctx.rotate(tailA);
    ctx.fillStyle = BLK; ctx.beginPath(); ctx.moveTo(0, -z * .14); ctx.lineTo(-z * 1.45, -z * .3); ctx.lineTo(-z * 1.5, z * .02); ctx.lineTo(0, z * .2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rimC; ctx.stroke();
    ctx.strokeStyle = WHT; ctx.lineWidth = z * .09; ctx.beginPath(); ctx.moveTo(-z * .2, z * .12); ctx.lineTo(-z * 1.45, -z * .02); ctx.stroke(); ctx.restore();
    // body with white belly
    ctx.fillStyle = BLK; ctx.beginPath(); ctx.ellipse(0, -z * .95, z * 1.02, z * .56, -.16, 0, 6.29); ctx.fill(); ctx.strokeStyle = rimC; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -z * .95, z * 1.02, z * .56, -.16, 0, 6.29); ctx.clip();
    ctx.fillStyle = WHT; ctx.beginPath(); ctx.ellipse(z * .28, -z * .55, z * .85, z * .42, -.1, 0, 6.29); ctx.fill(); ctx.restore();
    // head
    const hb = pose === 'perch' ? Math.sin(t * 1.7) * .1 : 0;
    ctx.save(); ctx.translate(z * .92, -z * 1.36); ctx.rotate(hb);
    ctx.fillStyle = BLK; ctx.beginPath(); ctx.arc(0, 0, z * .4, 0, 6.29); ctx.fill(); ctx.strokeStyle = rimC; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(z * .32, -z * .1); ctx.quadraticCurveTo(z * .62, -z * .08, z * .82, z * .02); ctx.lineTo(z * .34, z * .08); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2A1F14'; ctx.beginPath(); ctx.arc(z * .13, -z * .08, z * .085, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,.9)'; ctx.beginPath(); ctx.arc(z * .16, -z * .11, z * .03, 0, 6.29); ctx.fill(); ctx.restore();
    if (flying) wingShape(z * .25, -z * 1.1, wing, false);
    else { // folded wing with the white bar
      ctx.fillStyle = '#121815'; ctx.beginPath(); ctx.ellipse(-z * .12, -z * 1.04, z * .8, z * .3, -.18, 0, 6.29); ctx.fill();
      ctx.strokeStyle = WHT; ctx.lineWidth = z * .12; ctx.beginPath(); ctx.moveTo(z * .38, -z * 1.1); ctx.lineTo(-z * .58, -z * .92); ctx.stroke(); }
    // legs: tucked in flight, reaching when landing, gripping when perched
    if (pose !== 'fly') { ctx.strokeStyle = '#3A2A1A'; ctx.lineWidth = Math.max(1, z * .09); ctx.beginPath();
      const reach = pose === 'land' ? z * .2 : 0; ctx.moveTo(z * .02, -z * .48); ctx.lineTo(-z * .06, reach); ctx.moveTo(z * .3, -z * .48); ctx.lineTo(z * .24, reach); ctx.stroke(); }
    ctx.restore();
  }
  // a flight from a start point to a perch along a cubic curve; returns the draw call for a given time
  function flight(from, to, t0, dur, opt = {}) {
    const face = to.x >= from.x ? 1 : -1;
    const c1 = { x: from.x + (to.x - from.x) * .35, y: Math.min(from.y, to.y) - (opt.arc ?? .1) * (opt.H || 1) };
    const c2 = { x: to.x - face * (opt.W || 1) * .14, y: to.y - (opt.H || 1) * .09 };
    const at = u => { const a = 1 - u; return { x: a * a * a * from.x + 3 * a * a * u * c1.x + 3 * a * u * u * c2.x + u * u * u * to.x, y: a * a * a * from.y + 3 * a * a * u * c1.y + 3 * a * u * u * c2.y + u * u * u * to.y }; };
    const st = { face };
    return (ctx, t, z, rim) => {
      const p = (t - t0) / dur; if (p <= 0) return;
      if (p < 1) {
        const u = p < .7 ? p / .7 * .82 : .82 + (1 - Math.pow(1 - (p - .7) / .3, 2)) * .18;     // cruise, then slow to land
        const q = at(u), q2 = at(Math.min(1, u + .01)), vx = q2.x - q.x, vy = q2.y - q.y;
        if (Math.abs(vx) > .01) st.face = vx >= 0 ? 1 : -1;
        const tt = t - t0, landing = p > .78;
        const cycle = tt % 1.35, flapping = cycle < .8 || landing;                                   // flap for a while, then glide
        const wing = landing ? -.15 + Math.sin(tt * 24) * .75 : flapping ? Math.sin(tt * 15) : .38 + Math.sin(tt * 3) * .05;
        const tilt = landing ? -.42 * sm(.78, .9, p) : clamp(Math.atan2(vy, Math.abs(vx)) * .55, -.32, .32);
        doel(ctx, q.x, q.y, z * (.78 + .22 * p), st.face, wing, landing ? 'land' : 'fly', tilt, t, rim);
      } else {
        const s = (t - t0 - dur), hop = Math.sin(clamp(s / .35) * Math.PI) * z * .25, fold = clamp(s / .3);
        const look = (s % 3.4) > 2.6 ? -st.face : st.face;                                          // an occasional look back
        if (fold < 1) doel(ctx, to.x, to.y - hop, z, st.face, .6 * (1 - fold), 'land', -.25 * (1 - fold), t, rim);
        else doel(ctx, to.x, to.y, z, look, 0, 'perch', 0, t, rim);
      }
    };
  }

  /* ---------- soft clouds (sprites) ---------- */
  function cloudSprite(w, h, col, seed) {
    const c = canvas(w, h), x = c.getContext('2d'), R = rng(seed);
    for (let i = 0; i < 16; i++) { const cx = w * (.18 + R() * .64), cy = h * (.45 + (R() - .5) * .3), r = h * (.22 + R() * .3);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, .5)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.29); x.fill(); }
    return c;
  }

  // sparkles drifting downstream on the river
  function glints(ctx, rv, t, a, dpr, col = '255,226,180') {
    const fr = x => x - Math.floor(x);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) { const v = .04 + fr(i * .61803 + t * .02) * .94, px = rv.rv(v) + (fr(i * .377) - .5) * rv.rw(v) * 1.3, py = rv.ry(v) + (fr(i * .91) - .5) * 4 * dpr, w = rv.rw(v) * (.02 + .07 * fr(i * .731)) * (.6 + .4 * Math.sin(t * 1.7 + i));
      ctx.strokeStyle = `rgba(${col},${a * (.06 + .26 * Math.pow(Math.abs(Math.sin(t * 1.6 + i * 1.7)), 3))})`; ctx.lineWidth = Math.max(.6, dpr * (.3 + v * .6)); ctx.beginPath(); ctx.moveTo(px - w, py); ctx.quadraticCurveTo(px, py - dpr * .6, px + w, py); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
  }
  return { glints, clamp, sm, lerp, rng, hex, mix, rgba, pal, drawSky, paintLand, buildTree, drawTree, doel, flight, cloudSprite, canvas };
})();
