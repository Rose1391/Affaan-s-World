/* ============ THE VALLEY — the Home landscape around the Tree of Life ============
 Far away, a Bangladeshi village line (tin-roofed huts, a small mosque, coconut palms) on one side and a mountain
 range with a waterfall on the other; the waterfall feeds a wide river that winds toward us carrying water lilies;
 paddy fields, a meadow where cows and Black Bengal goats graze. Painted once; the living parts are drawn per frame. */
const Valley = (() => {
  const { clamp, rng, hex, mix, rgba, canvas } = Scene;
  const noise = seed => { const R = rng(seed), v = Array.from({ length: 512 }, R); return x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return v[i & 511] + (v[(i + 1) & 511] - v[i & 511]) * u; }; };

  function paint(W, H, hy, p, opt = {}) {
    const c = canvas(W, H), x = c.getContext('2d'), R = rng(opt.seed || 9), n1 = noise(5), n2 = noise(17), n3 = noise(29), dpr = opt.dpr || 1;
    const flip = opt.flip ? -1 : 1, fx = flip > 0 ? .82 : .18;              // mountains + waterfall side
    const sx = u => flip > 0 ? u * W : (1 - u) * W;
    const haze = (col, k) => rgba(mix(col, p.haze, k));
    // 1) far hills all along the horizon
    x.beginPath(); x.moveTo(0, hy + 2); for (let px = 0; px <= W; px += 3) x.lineTo(px, hy - H * (.03 + .035 * n1(px / W * 2.6 + .7))); x.lineTo(W, hy + 2); x.closePath();
    let g = x.createLinearGradient(0, hy - H * .07, 0, hy); g.addColorStop(0, haze(p.far, .25)); g.addColorStop(1, haze(p.far, .7)); x.fillStyle = g; x.fill();
    // 2) a mountain range on one side: a pale back range and a nearer forested range, both tall with real ridges
    const ridge = (n, x) => 1 - Math.abs(2 * n(x) - 1);
    const env = u => { const k = clamp((u - .42) / .58); return k > 0 ? Math.pow(Math.sin(k * Math.PI * .97), .75) * Math.min(1, k * 4) : 0; };
    const mtB = u => hy - H * env(u) * (.12 + .15 * ridge(n2, u * 2.3 + 4) + .03 * n1(u * 11));
    const mt = u => hy - H * env(u) * (.07 + .13 * ridge(n3, u * 3.4 + 1) + .025 * n1(u * 17 + 2));
    for (const [fn, k0, k1, tone] of [[mtB, .35, .62, .12], [mt, .1, .4, 0]]) {
      x.beginPath(); x.moveTo(sx(.38), hy + 2); for (let u = .38; u <= 1.001; u += .003) x.lineTo(sx(u), fn(u)); x.lineTo(sx(1), hy + 2); x.closePath();
      g = x.createLinearGradient(0, hy - H * .32, 0, hy); g.addColorStop(0, haze(mix(p.far, [125, 115, 105], .3), k0)); g.addColorStop(1, haze(mix(p.mid, p.far, tone ? .6 : 0), k1)); x.fillStyle = g; x.fill();
      x.save(); x.clip();
      { const lg = x.createLinearGradient(sx(.45), 0, sx(1), 0); lg.addColorStop(0, 'rgba(255,246,222,.08)'); lg.addColorStop(.55, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = lg; x.fillRect(0, hy - H * .45, W, H * .45); }
      if (!tone) for (let i = 0; i < 420; i++) { const u = .4 + R() * .6, top = fn(u), y = top + (hy - top) * (.3 + R() * .7), r = (1.8 + R() * 3.2) * dpr;
        x.fillStyle = rgba(mix(mix(p.mid, p.haze, .25), [0, 0, 0], R() * .3)); x.beginPath(); x.arc(sx(u), y, r, 0, 6.29); x.fill(); }
      x.restore(); }
    // the waterfall: narrow at the lip, widening as it falls, broken by a rock ledge
    const wfTop = mt(fx) + H * .015, wfBot = hy + H * .008, wfW = W * .022, wfLedge = wfTop + (wfBot - wfTop) * .55;
    const fallW = y => { const k = clamp((y - wfTop) / (wfBot - wfTop)); return wfW * (.35 + .65 * k + .45 * Math.pow(k, 5)); };
    const fallPath = () => { x.beginPath(); for (let y = wfTop; y <= wfBot; y += 2 * dpr) x.lineTo(sx(fx) - fallW(y) / 2 + Math.sin(y * .09) * dpr * 1.2, y); for (let y = wfBot; y >= wfTop; y -= 2 * dpr) x.lineTo(sx(fx) + fallW(y) / 2 + Math.sin(y * .07 + 2) * dpr * 1.2, y); x.closePath(); };
    g = x.createLinearGradient(0, wfTop, 0, wfBot); g.addColorStop(0, rgba(mix(p.river, [255, 255, 255], .35), .75)); g.addColorStop(1, rgba(mix(p.river, [255, 255, 255], .6), .9));
    if (!opt.split) {
      fallPath(); x.fillStyle = g; x.fill();
    }
    // 3) the village line: homesteads in clusters — each on its raised mound with do-chala houses (two-sloped tin or
    //    thatch roofs), mango and jackfruit trees, banana plants, tall betel-nut and coconut palms; a small mosque
    const vStart = flip > 0 ? 0 : .58, vEnd = flip > 0 ? .5 : 1, hu = H * .017, base = hy + 1;
    const far = k => haze(k, .3);
    const roundTree = (px, r, col) => { x.fillStyle = far(mix(col, [0, 0, 0], .08)); x.beginPath(); x.arc(px, base - r * 1.1, r, 0, 6.29); x.arc(px - r * .7, base - r * .75, r * .72, 0, 6.29); x.arc(px + r * .72, base - r * .8, r * .7, 0, 6.29); x.fill();
      x.fillStyle = far(mix(col, [255, 255, 230], .12)); x.beginPath(); x.arc(px - r * .25, base - r * 1.35, r * .5, 0, 6.29); x.fill(); };
    const palm = (px, ph, lean, coconut) => { x.strokeStyle = far(hex('#6B5A44')); x.lineWidth = Math.max(1, hu * (coconut ? .13 : .09)); x.beginPath(); x.moveTo(px, base); x.quadraticCurveTo(px + lean * .4, base - ph * .55, px + lean, base - ph); x.stroke();
      const n = coconut ? 9 : 6, L = hu * (coconut ? 1.5 : 1.05), tx = px + lean, ty = base - ph;
      for (let f = 0; f < n; f++) { const a = -Math.PI / 2 + (f / (n - 1) - .5) * 3.3, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .35 + L * (.15 + .5 * Math.abs(Math.cos(a))), mx = (tx + ex) / 2, my = (ty + ey) / 2 - L * .18;
        x.strokeStyle = far(hex('#4A6B34')); x.lineWidth = Math.max(.7, hu * .05); x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(mx, my, ex, ey); x.stroke();
        x.fillStyle = far(hex(f % 2 ? '#3F7A36' : '#4C8A3C')); for (let q = 1; q <= 4; q++) { const k = q / 5, lx = (1 - k) * (1 - k) * tx + 2 * (1 - k) * k * mx + k * k * ex, ly = (1 - k) * (1 - k) * ty + 2 * (1 - k) * k * my + k * k * ey;
          x.beginPath(); x.ellipse(lx, ly + hu * .08, hu * .26 * (1 - k * .4), hu * .06, a + .9, 0, 6.29); x.fill(); x.beginPath(); x.ellipse(lx, ly + hu * .08, hu * .26 * (1 - k * .4), hu * .06, a - .9 + Math.PI, 0, 6.29); x.fill(); } }
      if (coconut) { x.fillStyle = far(hex('#6B4A22')); for (let q = 0; q < 3; q++) { x.beginPath(); x.arc(tx + (q - 1) * hu * .1, ty + hu * .12, hu * .08, 0, 6.29); x.fill(); } } };
    const banana = px => { x.fillStyle = far(hex('#5E9A3E')); for (let f = 0; f < 5; f++) { const a = -Math.PI / 2 + (f / 4 - .5) * 2.2; x.beginPath(); x.ellipse(px + Math.cos(a) * hu * .45, base - hu * .9 + Math.sin(a) * hu * .35, hu * .5, hu * .14, a, 0, 6.29); x.fill(); } };
    const house = (px, w, tin) => { const h = w * .55, roof = w * .42;
      x.fillStyle = far(hex(tin ? '#A8895F' : '#9C7B55')); x.fillRect(px - w / 2, base - h, w, h);                                           // mud / bamboo wall
      x.fillStyle = far(hex('#3A2A1A')); x.fillRect(px - w * .1, base - h * .7, w * .2, h * .7); x.fillRect(px + w * .22, base - h * .72, w * .12, h * .22);   // door, window
      const rc = tin ? mix(hex('#B9C3CA'), p.sun, .25) : hex('#B79A5A');                                                                   // tin catches the light; thatch is straw
      x.fillStyle = far(rc); x.beginPath(); x.moveTo(px - w * .62, base - h + 1); x.quadraticCurveTo(px - w * .3, base - h - roof * .55, px, base - h - roof); x.quadraticCurveTo(px + w * .3, base - h - roof * .55, px + w * .62, base - h + 1); x.closePath(); x.fill();
      x.strokeStyle = far(mix(rc, [0, 0, 0], .25)); x.lineWidth = Math.max(.6, dpr * .6); x.beginPath(); x.moveTo(px, base - h - roof); x.lineTo(px, base - h - roof * .1); x.stroke(); };
    // the strip of homestead land the village stands on
    x.fillStyle = far(mix(p.near, p.mid, .4)); x.beginPath(); x.moveTo(sx(flip > 0 ? 0 : 1) , base + 2);
    for (let u = vStart; u <= vEnd + .001; u += .01) x.lineTo(u * W, base - hu * (.25 + .2 * n1(u * 20))); x.lineTo(vEnd * W, base + 2); x.closePath(); x.fill();
    // background tree line, then homestead clusters in front
    for (let u = vStart; u < vEnd; u += .022) roundTree(u * W + (R() - .5) * hu, hu * (.5 + R() * .35), mix(p.mid, [20, 60, 20], .25));
    const nCl = 5, mosqueAt = 2, cl = Array.from({ length: nCl }, (_, k) => ({ k, cx: (vStart + (vEnd - vStart) * ((k + .5) / nCl) + (R() - .5) * .03) * W, r: R(), r2: R(), r3: R(), r4: R() }));
    cl.forEach(c => roundTree(c.cx - hu * 2.4, hu * (.85 + c.r * .3), hex('#3E7A34')));                 // mango / jackfruit behind each homestead
    cl.forEach(c => { const cx = c.cx;
      if (c.k === mosqueAt) { // a small white mosque with a dome and a minaret
        const w = hu * 2.6; x.fillStyle = far(hex('#EFEBE1')); x.fillRect(cx - w / 2, base - hu * 1.3, w, hu * 1.3); x.beginPath(); x.arc(cx, base - hu * 1.3, w * .3, Math.PI, 0); x.fill();
        x.fillRect(cx + w * .6, base - hu * 2.9, hu * .32, hu * 2.9); x.beginPath(); x.arc(cx + w * .6 + hu * .16, base - hu * 2.9, hu * .24, Math.PI, 0); x.fill();
        x.fillStyle = far(hex('#3E7A50')); x.beginPath(); x.arc(cx, base - hu * 1.3 - w * .3, hu * .08, 0, 6.29); x.fill();
      } else { house(cx, hu * (1.8 + c.r2 * .5), c.r3 < .6); if (c.r4 < .75) house(cx + hu * 2.0, hu * (1.4 + c.r * .3), c.r2 < .5); } });
    cl.forEach(c => { const cx = c.cx; banana(cx - hu * 1.25); palm(cx + hu * 3.1, hu * (3.2 + c.r * 1.2), hu * (c.r2 - .5) * .8, c.r3 < .5); if (c.r4 < .6) palm(cx - hu * 3.2, hu * (2.6 + c.r2), hu * (c.r - .5) * .6, false);
      if (c.k === 1) { x.strokeStyle = 'rgba(235,235,235,.35)'; x.lineWidth = hu * .25; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, base - hu * 1.6); x.bezierCurveTo(cx + hu * .3, base - hu * 2.4, cx - hu * .4, base - hu * 3, cx + hu * .6, base - hu * 3.8); x.stroke(); } });  // kitchen smoke
    // 4) the ground and paddy fields
    g = x.createLinearGradient(0, hy, 0, H); g.addColorStop(0, rgba(mix(p.near, p.haze, .5))); g.addColorStop(.3, rgba(mix(p.field, p.near, .3))); g.addColorStop(1, rgba(mix(p.near, [0, 0, 0], .25)));
    x.fillStyle = g; x.fillRect(0, hy, W, H - hy);
    const fieldC = opt.season === 'hemonto' ? hex('#C8A848') : p.field;
    for (let row = 0; row < 22; row++) { const v0 = Math.pow(row / 22, 1.7), v1 = Math.pow((row + 1) / 22, 1.7), y0 = hy + (H - hy) * .55 * v0, y1 = hy + (H - hy) * .55 * v1;
      for (let col = -8; col < 12; col++) { const sk = (col - 2) * W * .14, l = W * .5 + sk * (.25 + v0 * 2.2), r = W * .5 + (sk + W * .14) * (.25 + v0 * 2.2), l1 = W * .5 + sk * (.25 + v1 * 2.2), r1 = W * .5 + (sk + W * .14) * (.25 + v1 * 2.2);
        const shade = (n3(row * 1.7 + col * 3.3) - .5) * .12; x.fillStyle = rgba(mix(mix(fieldC, p.near, .25 + v0 * .3), shade > 0 ? [255, 250, 210] : [0, 0, 0], Math.abs(shade)), .35 + v0 * .3);
        x.beginPath(); x.moveTo(l, y0); x.lineTo(r, y0); x.lineTo(r1, y1); x.lineTo(l1, y1); x.closePath(); x.fill(); } }
    // 5) the river: from the waterfall pool, wide and winding toward us
    const y0 = wfBot - H * .014, rv = v => W * (flip > 0 ? fx + (.6 - fx) * v + .14 * (Math.sin(v * 5.2 + .2) * (.25 + .75 * v) - Math.sin(.2) * .25) : fx + (.4 - fx) * v - .14 * (Math.sin(v * 5.2 + .2) * (.25 + .75 * v) - Math.sin(.2) * .25)), rw = v => fallW(wfBot) * .5 + W * .35 * Math.pow(v, 1.3), ry = v => y0 + (H - y0) * v;
    const rx = opt.split ? (c.riverLayer = canvas(W, H)).getContext('2d') : x;
    rx.beginPath(); for (let i = 0; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) - rw(v), ry(v)); } for (let i = 80; i >= 0; i--) { const v = i / 80; rx.lineTo(rv(v) + rw(v), ry(v)); } rx.closePath();
    g = rx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, rgba(mix(p.river, p.haze, .45))); g.addColorStop(.4, rgba(mix(p.river, [30, 70, 100], .3))); g.addColorStop(1, rgba(mix(p.river, [10, 35, 55], .6)));
    rx.fillStyle = g; rx.fill();
    // banks: soft dark edge with a sandy lip
    for (const side of [-1, 1]) { rx.strokeStyle = rgba(mix(p.near, [0, 0, 0], .4), .75); rx.lineWidth = 2.4 * dpr; rx.beginPath(); for (let i = 4; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) + side * rw(v), ry(v)); } rx.stroke();
      rx.strokeStyle = rgba(mix(hex('#D8C08A'), p.haze, .3), .35); rx.lineWidth = 1.4 * dpr; rx.beginPath(); for (let i = 5; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) + side * (rw(v) + 3 * dpr * (1 + v)), ry(v)); } rx.stroke(); }
    // white water where the fall meets the river (no round pool: the river grows straight out of the fall)
    { const fw = fallW(wfBot), fy = y0 - H * .012; g = rx.createLinearGradient(0, fy, 0, wfBot + H * .006); g.addColorStop(0, rgba(mix(p.river, [255, 255, 255], .6), .92)); g.addColorStop(1, rgba(mix(p.river, [255, 255, 255], .75), .0));
      rx.fillStyle = g; rx.beginPath(); rx.moveTo(sx(fx) - fallW(fy) / 2, fy); rx.lineTo(sx(fx) + fallW(fy) / 2, fy); rx.lineTo(sx(fx) + fw * .5, wfBot + H * .006); rx.lineTo(sx(fx) - fw * .5, wfBot + H * .006); rx.closePath(); rx.fill();
      for (let k = 0; k < 3; k++) { const v = .006 + k * .016, a = .32 * (1 - k / 3); rx.fillStyle = `rgba(255,255,255,${a})`; rx.beginPath(); rx.ellipse(rv(v) + (k - 1) * rw(v) * .12, ry(v), rw(v) * (.6 - k * .08), H * (.0028 - k * .0004), 0, 0, 6.29); rx.fill(); } }
    // 6) meadow grass, reeds along the banks, framing shrubs
    for (let i = 0; i < 2600; i++) { const v = .5 + Math.pow(R(), .7) * .5, px = R() * W, py = hy + (H - hy) * v, len = (3 + R() * 9) * dpr * (.4 + v), lean = (R() - .5) * 4 * dpr;
      const vv = clamp((py - y0) / (H - y0)); if (Math.abs(px - rv(vv)) < rw(vv) + 2 * dpr) continue;
      x.strokeStyle = rgba(mix(p.grass, R() < .5 ? [0, 0, 0] : p.haze, R() * .3), .7); x.lineWidth = Math.max(.7, .9 * dpr * v);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + lean * .3, py - len * .6, px + lean, py - len); x.stroke(); }
    for (let i = 0; i < 160; i++) { const v = .15 + R() * .85, side = R() < .5 ? -1 : 1, px = rv(v) + side * (rw(v) + (1 + R() * 5) * dpr), py = ry(v), len = (6 + R() * 12) * dpr * (.3 + v);
      rx.strokeStyle = rgba(mix(hex('#4F7A3A'), [0, 0, 0], R() * .3), .85); rx.lineWidth = Math.max(.7, dpr * (.5 + v * .6)); rx.beginPath(); rx.moveTo(px, py); rx.lineTo(px + (R() - .5) * 4 * dpr, py - len); rx.stroke(); }
    for (const side of [0, 1]) for (let i = 0; i < 24; i++) { const px = side ? W - R() * W * .2 : R() * W * .2, py = H - R() * (H - hy) * .2, r = (8 + R() * 18) * dpr;
      x.fillStyle = rgba(mix(p.near, [0, 0, 0], .2 + R() * .3)); x.beginPath(); x.arc(px, py, r, 0, 6.29); x.fill(); }
    // mist on the horizon
    g = x.createLinearGradient(0, hy - H * .03, 0, hy + H * .05); g.addColorStop(0, rgba(p.haze, 0)); g.addColorStop(.45, rgba(p.haze, .3)); g.addColorStop(1, rgba(p.haze, 0)); x.fillStyle = g; x.fillRect(0, hy - H * .03, W, H * .08);
    c.river = { rv, rw, ry }; c.fall = { x: sx(fx), top: wfTop, bot: wfBot, w: wfW, fw: fallW, river: p.river };
    return c;
  }

  // the waterfall, moving: falling streaks and a mist cloud at its foot
  function waterfall(ctx, f, t, dpr, a = 1) {
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = Math.max(1, dpr * .9);
    const len = f.bot - f.top;
    for (let i = 0; i < 14; i++) { const u = (i / 13 - .5) * .85, ph = ((t * (.75 + (i % 3) * .12) + i * .37) % 1), y = f.top + ph * len, y2 = Math.min(f.bot, y + len * .14);
      ctx.globalAlpha = a * (.4 + .5 * Math.sin(ph * Math.PI)); ctx.beginPath(); ctx.moveTo(f.x + u * f.fw(y), y); ctx.lineTo(f.x + u * f.fw(y2), y2); ctx.stroke(); }
    ctx.globalAlpha = a;
    const m = ctx.createRadialGradient(f.x, f.bot - f.w * .2, 0, f.x, f.bot - f.w * .2, f.w * 1.1); m.addColorStop(0, `rgba(255,255,255,${.38 + .08 * Math.sin(t * 2)})`); m.addColorStop(1, 'rgba(255,255,255,0)');   // spray
    ctx.fillStyle = m; ctx.beginPath(); ctx.arc(f.x, f.bot - f.w * .2, f.w * 1.1, 0, 6.29); ctx.fill(); ctx.restore();
  }

  // the waterfall ribbon, revealed from the lip down (k = 0..1), for the opening
  function fallRibbon(ctx, f, k, dpr) {
    if (k <= 0) return; const yEnd = f.top + (f.bot - f.top) * Math.min(1, k);
    const g = ctx.createLinearGradient(0, f.top, 0, f.bot); g.addColorStop(0, rgba(mix(f.river, [255, 255, 255], .35), .8)); g.addColorStop(1, rgba(mix(f.river, [255, 255, 255], .6), .92));
    ctx.fillStyle = g; ctx.beginPath(); for (let y = f.top; y <= yEnd; y += 2 * dpr) ctx.lineTo(f.x - f.fw(y) / 2 + Math.sin(y * .09) * dpr * 1.2, y); for (let y = yEnd; y >= f.top; y -= 2 * dpr) ctx.lineTo(f.x + f.fw(y) / 2 + Math.sin(y * .07 + 2) * dpr * 1.2, y); ctx.closePath(); ctx.fill();
    if (k < 1) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(f.x, yEnd, f.fw(yEnd) * .45, 2 * dpr, 0, 0, 6.29); ctx.fill(); }
  }
  // water lilies drifting downstream (v = position along the river, s = across)
  function lilies(n, seed = 3) { const R = rng(seed); return Array.from({ length: n }, () => ({ v: .1 + R() * .85, s: (R() - .5) * 1.2, sp: .006 + R() * .006, fl: R() < .55, hue: R() < .6 ? '#F4A7C3' : '#FFF4F0', rot: R() * 6.28, sz: .8 + R() * .5 })); }
  function drawLilies(ctx, L, rv, t, dt, dpr, dark) {
    for (const l of L) { l.v += l.sp * dt * (.4 + l.v); if (l.v > 1.02) { l.v = .08; l.s = (Math.random() - .5) * 1.2; }
      const w = rv.rw(l.v), r = Math.min((3 + 12 * Math.pow(l.v, 1.3)) * dpr * l.sz, w * .45), off = Math.max(-1, Math.min(1, l.s)) * Math.max(0, w * .9 - r);
      if (l.v < .12 || r < 1.5 * dpr) continue;                    // lilies only once the river is wide enough to hold them
      const x = rv.rv(l.v) + off + Math.sin(t * .8 + l.rot) * Math.min(2 * dpr, w * .05), y = rv.ry(l.v), rot = l.rot + Math.sin(t * .4 + l.rot) * .2;
      ctx.fillStyle = dark ? 'rgba(20,50,30,.85)' : 'rgba(52,120,58,.95)';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.ellipse(x, y, r, r * .38, 0, rot + .35, rot + 6.0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(80,120,90,.4)' : 'rgba(140,200,120,.55)'; ctx.lineWidth = Math.max(.6, dpr * .6); ctx.stroke();
      if (l.fl && r > 3 * dpr) { const fr = r * .45; ctx.fillStyle = dark ? 'rgba(200,180,200,.7)' : l.hue;
        for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + t * .05; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * fr * .45, y - fr * .35 + Math.sin(a) * fr * .18, fr * .5, fr * .22, a, 0, 6.29); ctx.fill(); }
        ctx.fillStyle = '#F7D24A'; ctx.beginPath(); ctx.arc(x, y - fr * .35, fr * .18, 0, 6.29); ctx.fill(); } }
  }

  // grazing animals, side-on (origin on the ground, facing right, z = body length in px): a zebu cow and a Black Bengal goat.
  // Proportions follow the real animals; they graze head-down, look up now and then, swish their tails and step.
  function animal(ctx, a, t, dpr, dark) {
    const z = a.z, tt = t + a.ph, g = (Math.sin(tt * .42) + 1) / 2, down = clamp((g - .3) / .25), walk = a.walking ? Math.sin(tt * 5.5) : 0, goat = !!a.goat;
    const base = dark ? mix(hex(a.col), [20, 25, 40], .55) : hex(a.col), shade = mix(base, [0, 0, 0], .32), light = mix(base, [255, 255, 255], .16), hoof = dark ? [15, 15, 20] : [38, 30, 24];
    const P = (u, v) => [u * z, v * z];                                         // unit → px
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(a.face, 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, z * .55, z * .06, 0, 0, 6.29); ctx.fill();
    const H = goat ? .62 : .78, LB = goat ? .36 : .4;                           // back height, belly height (as a share of body length)
    // a leg as a tapered two-part limb: hip/shoulder → knee/hock → fetlock → hoof
    const leg = (hx, hy, kx, ky, fx, w0, col, sw) => { const w1 = w0 * .55;
      ctx.fillStyle = rgba(col); ctx.beginPath(); ctx.moveTo((hx - w0 / 2) * z, -hy * z); ctx.lineTo((hx + w0 / 2) * z, -hy * z);
      ctx.lineTo((kx + w1 / 2 + sw * .5) * z, -ky * z); ctx.lineTo((fx + w1 / 2 + sw) * z, -.035 * z); ctx.lineTo((fx - w1 / 2 + sw) * z, -.035 * z); ctx.lineTo((kx - w1 / 2 + sw * .5) * z, -ky * z); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgba(hoof); ctx.beginPath(); ctx.ellipse((fx + sw) * z, -.018 * z, w1 * .65 * z, .022 * z, 0, 0, 6.29); ctx.fill(); };
    const fw = goat ? .055 : .075, s1 = walk * .04, s2 = -walk * .04;
    // far legs (darker), drawn first
    leg(-.3, LB + .06, -.36, LB * .5, -.3, fw, shade, s2); leg(.3, LB + .04, .31, LB * .45, .3, fw * .9, shade, s1);
    // body: rump, a gently sloping back with the zebu hump at the withers, deep chest, belly, flank
    const bg = ctx.createLinearGradient(0, -H * z, 0, -LB * z); bg.addColorStop(0, rgba(light)); bg.addColorStop(.6, rgba(base)); bg.addColorStop(1, rgba(shade));
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(...P(-.47, -(H - .06)));
    ctx.bezierCurveTo(...P(-.4, -(H + .02)), ...P(-.1, -(H - .03)), ...P(.18, -(H - .01)));
    if (!goat) { ctx.bezierCurveTo(...P(.24, -(H + .1)), ...P(.32, -(H + .1)), ...P(.36, -(H - .03))); }   // hump
    else ctx.lineTo(...P(.32, -(H + .02)));
    ctx.bezierCurveTo(...P(.45, -(H - .12)), ...P(.46, -(LB + .1)), ...P(.4, -LB));                      // chest
    ctx.bezierCurveTo(...P(.15, -(LB - .04)), ...P(-.2, -(LB - .03)), ...P(-.36, -(LB + .02)));          // belly
    ctx.bezierCurveTo(...P(-.46, -(LB + .08)), ...P(-.52, -(H - .2)), ...P(-.47, -(H - .06))); ctx.fill(); // thigh / rump
    if (!goat && a.patch) { ctx.fillStyle = rgba(mix(base, [70, 50, 35], .55), .5); ctx.beginPath(); ctx.ellipse(-.16 * z, -(H - .16) * z, .12 * z, .08 * z, .3, 0, 6.29); ctx.fill(); }
    // near legs: front straight with a knee, hind bending back at the hock
    leg(.33, LB + .06, .34, LB * .48, .33, fw, base, s1); leg(-.36, LB + .1, -.42, LB * .5, -.36, fw * 1.1, base, s2);
    // tail: long with a tuft (cow), short and upright (goat)
    ctx.strokeStyle = rgba(shade); ctx.lineWidth = z * .02;
    if (goat) { ctx.beginPath(); ctx.moveTo(...P(-.47, -(H - .06))); ctx.quadraticCurveTo(...P(-.53, -(H + .04)), ...P(-.5 + Math.sin(tt * 4) * .015, -(H + .1))); ctx.stroke(); }
    else { const sw = Math.sin(tt * 2.1) * .06; ctx.beginPath(); ctx.moveTo(...P(-.47, -(H - .05))); ctx.bezierCurveTo(...P(-.52, -(H - .25)), ...P(-.5 + sw * .5, -LB), ...P(-.5 + sw, -(LB * .45)));
      ctx.stroke(); ctx.fillStyle = rgba(mix(shade, [0, 0, 0], .4)); ctx.beginPath(); ctx.ellipse((-.5 + sw) * z, -(LB * .4) * z, .022 * z, .05 * z, sw, 0, 6.29); ctx.fill(); }
    // neck and head: lowered to graze or raised to look around
    const nx = .36, ny = H - .08, hx = .58 + .02 * down, hyy = lerpN(H + .02, .14, down), ang = lerpN(.35, 1.25, down);
    ctx.fillStyle = rgba(base); ctx.beginPath(); ctx.moveTo(...P(nx - .08, -(ny + .06))); ctx.quadraticCurveTo(...P((nx + hx) / 2, -((ny + hyy) / 2 + .08)), ...P(hx - .02, -(hyy + .05)));
    ctx.lineTo(...P(hx + .03, -(hyy - .06))); ctx.quadraticCurveTo(...P((nx + hx) / 2 + .02, -((ny + hyy) / 2 - .1)), ...P(nx + .06, -(ny - .16))); ctx.closePath(); ctx.fill();
    if (!goat) { ctx.fillStyle = rgba(mix(base, shade, .35)); ctx.beginPath(); ctx.moveTo(...P(nx + .04, -(ny - .14))); ctx.quadraticCurveTo(...P((nx + hx) / 2, -((ny + hyy) / 2 - .2)), ...P(hx - .02, -(hyy - .06))); ctx.lineTo(...P(hx - .04, -(hyy - .02))); ctx.closePath(); ctx.fill(); } // dewlap
    ctx.save(); ctx.translate(hx * z, -hyy * z); ctx.rotate(ang); const hl = z * (goat ? .2 : .24);
    ctx.fillStyle = rgba(base); ctx.beginPath(); ctx.moveTo(-hl * .15, -hl * .3); ctx.bezierCurveTo(hl * .35, -hl * .38, hl * .75, -hl * .22, hl * .95, -hl * .02); ctx.bezierCurveTo(hl * 1.02, hl * .16, hl * .8, hl * .26, hl * .55, hl * .22); ctx.bezierCurveTo(hl * .25, hl * .2, -hl * .1, hl * .24, -hl * .15, -hl * .3); ctx.fill();
    ctx.fillStyle = rgba(mix(base, [60, 40, 40], goat ? .3 : .42)); ctx.beginPath(); ctx.ellipse(hl * .86, hl * .06, hl * .15, hl * .15, 0, 0, 6.29); ctx.fill();                       // muzzle
    ctx.fillStyle = rgba(shade); ctx.beginPath(); ctx.ellipse(-hl * .02, goat ? hl * .1 : -hl * .26, hl * .24, hl * .08, goat ? 1.1 : -.35, 0, 6.29); ctx.fill();                          // ear
    ctx.strokeStyle = rgba(goat ? mix(base, [255, 255, 255], .3) : hex('#D9CBB0')); ctx.lineWidth = z * .022; ctx.beginPath();                                                       // horns
    if (goat) { ctx.moveTo(hl * .1, -hl * .28); ctx.quadraticCurveTo(-hl * .12, -hl * .62, -hl * .38, -hl * .42); } else { ctx.moveTo(hl * .1, -hl * .28); ctx.quadraticCurveTo(hl * .02, -hl * .5, hl * .18, -hl * .56); } ctx.stroke();
    ctx.fillStyle = 'rgba(12,10,10,.9)'; ctx.beginPath(); ctx.arc(hl * .4, -hl * .1, hl * .045, 0, 6.29); ctx.fill();                                                                 // eye
    if (goat) { ctx.fillStyle = rgba(shade); ctx.beginPath(); ctx.moveTo(hl * .72, hl * .2); ctx.lineTo(hl * .66, hl * .46); ctx.lineTo(hl * .8, hl * .24); ctx.fill(); }               // beard
    ctx.restore(); ctx.restore();
  }
  // people resting in the shade beneath the tree: a father leaning on the trunk, a mother in a sari, a child.
  // (X, Y) is the tree's base, S its scale, wb the trunk width in px.
  function people(ctx, X, Y, S, t, dark, wb) {
    const h = S * .075, k = dark ? .5 : 0, col = c => rgba(mix(hex(c), [20, 25, 40], k)), skin = col('#B07A52'), hair = col('#1E1612');
    const breathe = Math.sin(t * 1.4) * h * .012;
    const seated = (x, y, sc, cloth, top, headCover, face) => { const u = h * sc;
      ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, u * .6, u * .08, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = col(cloth); ctx.beginPath(); ctx.moveTo(-u * .32, 0); ctx.quadraticCurveTo(-u * .34, -u * .3, -u * .1, -u * .34); ctx.quadraticCurveTo(u * .3, -u * .32, u * .5, -u * .16); ctx.quadraticCurveTo(u * .56, 0, u * .4, 0); ctx.closePath(); ctx.fill();   // folded legs
      ctx.fillStyle = col(top); ctx.beginPath(); ctx.moveTo(-u * .2, -u * .3); ctx.quadraticCurveTo(-u * .24, -u * .72 - breathe, 0, -u * .78 - breathe); ctx.quadraticCurveTo(u * .2, -u * .72 - breathe, u * .16, -u * .3); ctx.closePath(); ctx.fill();         // body
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(u * .02, -u * .92 - breathe, u * .14, 0, 6.29); ctx.fill();                                                                                     // head
      ctx.fillStyle = headCover ? col(headCover) : hair; ctx.beginPath(); ctx.arc(u * .0, -u * .96 - breathe, u * .15, Math.PI * .95, Math.PI * 2.05); ctx.fill();
      if (headCover) { ctx.beginPath(); ctx.moveTo(-u * .15, -u * .95 - breathe); ctx.quadraticCurveTo(-u * .26, -u * .6, -u * .2, -u * .32); ctx.lineTo(-u * .1, -u * .34); ctx.quadraticCurveTo(-u * .16, -u * .6, -u * .06, -u * .9); ctx.fill(); }  // the end of the sari over the head
      ctx.strokeStyle = skin; ctx.lineWidth = u * .07; ctx.beginPath(); ctx.moveTo(u * .1, -u * .62); ctx.quadraticCurveTo(u * .28, -u * .42, u * .3, -u * .22); ctx.stroke();        // arm resting on the knee
      ctx.restore(); };
    // father: white panjabi, checked lungi, leaning on the trunk; mother: green sari with a red border; child playing with a ball
    seated(X - wb * 1.25, Y + h * .05, 1, '#3E5E8E', '#F1EEE6', null, 1);
    seated(X + wb * 1.35, Y + h * .08, .94, '#2E7D4F', '#2E7D4F', '#C0392B', -1);
    const bx = X + wb * 3.2, bounce = Math.abs(Math.sin(t * 2.4)) * h * .35;
    { const u = h * .6; ctx.save(); ctx.translate(bx, Y + h * .12);
      ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(0, 0, u * .4, u * .07, 0, 0, 6.29); ctx.fill();
      ctx.strokeStyle = col('#3A4E7A'); ctx.lineWidth = u * .12; ctx.beginPath(); ctx.moveTo(-u * .08, 0); ctx.lineTo(-u * .04, -u * .42); ctx.moveTo(u * .1, 0); ctx.lineTo(u * .05, -u * .42); ctx.stroke();       // legs
      ctx.fillStyle = col('#F2B33D'); ctx.beginPath(); ctx.moveTo(-u * .18, -u * .4); ctx.lineTo(u * .18, -u * .4); ctx.lineTo(u * .14, -u * .86); ctx.lineTo(-u * .14, -u * .86); ctx.closePath(); ctx.fill();     // shirt
      ctx.strokeStyle = skin; ctx.lineWidth = u * .08; ctx.beginPath(); ctx.moveTo(u * .12, -u * .8); ctx.lineTo(u * .34, -u * .98 + Math.sin(t * 2.4) * u * .05); ctx.stroke();
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -u * 1.02, u * .16, 0, 6.29); ctx.fill(); ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -u * 1.06, u * .16, Math.PI, 0); ctx.fill();
      ctx.fillStyle = col('#E4573D'); ctx.beginPath(); ctx.arc(u * .42, -u * 1.15 - bounce / 1.2, u * .1, 0, 6.29); ctx.fill(); ctx.restore(); }
  }
  const lerpN = (a, b, k) => a + (b - a) * k;
  function herd(W, H, hy, dpr, flip) {
    const side = u => flip ? 1 - u : u;
    return [{ col: '#EDE6DA', z: 44, u: .14, v: .52, patch: true }, { col: '#B98A5E', z: 40, u: .3, v: .42 }, { col: '#2E2925', z: 30, u: .22, v: .62, goat: true }, { col: '#5A4636', z: 26, u: .38, v: .58, goat: true }]
      .map((a, i) => ({ ...a, x: side(a.u) * W, y: hy + (H - hy) * a.v, z: a.z * (.55 + a.v * .8) * (H / 900), face: (i % 2 ? -1 : 1) * (flip ? -1 : 1), ph: i * 2.3, walking: false, home: side(a.u) * W }));
  }
  function moveHerd(herdA, t, dt, W) { herdA.forEach(a => { const cyc = (t + a.ph * 3) % 26; a.walking = cyc > 20 && cyc < 24; if (a.walking) a.x += a.face * W * .004 * dt; if (Math.abs(a.x - a.home) > W * .05) a.face = a.x > a.home ? -1 : 1; }); }

  return { paint, fallRibbon, waterfall, lilies, drawLilies, animal, people, herd, moveHerd };
})();
