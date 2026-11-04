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
    // 2) a mountain range on one side: a pale back range and a nearer forested range, both with real ridges
    const ridge = (n, x) => 1 - Math.abs(2 * n(x) - 1);
    const env = u => { const k = clamp((u - .44) / .56); return k > 0 ? Math.pow(Math.sin(k * Math.PI * .96), .8) * Math.min(1, k * 5) : 0; };
    const mtB = u => hy - H * env(u) * (.06 + .09 * ridge(n2, u * 2.3 + 4) + .025 * n1(u * 11));
    const mt = u => hy - H * env(u) * (.035 + .09 * ridge(n3, u * 3.4 + 1) + .02 * n1(u * 17 + 2));
    for (const [fn, k0, k1, tone] of [[mtB, .35, .62, .12], [mt, .1, .4, 0]]) {
      x.beginPath(); x.moveTo(sx(.4), hy + 2); for (let u = .4; u <= 1.001; u += .003) x.lineTo(sx(u), fn(u)); x.lineTo(sx(1), hy + 2); x.closePath();
      g = x.createLinearGradient(0, hy - H * .26, 0, hy); g.addColorStop(0, haze(mix(p.far, [125, 115, 105], .3), k0)); g.addColorStop(1, haze(mix(p.mid, p.far, tone ? .6 : 0), k1)); x.fillStyle = g; x.fill();
      // sunlit and shaded faces following the ridgelines
      x.save(); x.clip();
      // soft light from the left, shadow toward the right of each range
      { const lg = x.createLinearGradient(sx(.45), 0, sx(1), 0); lg.addColorStop(0, 'rgba(255,246,222,.08)'); lg.addColorStop(.55, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = lg; x.fillRect(0, hy - H * .4, W, H * .4); }
      if (!tone) for (let i = 0; i < 340; i++) { const u = .42 + R() * .58, top = fn(u), y = top + (hy - top) * (.35 + R() * .65), r = (1.8 + R() * 3.2) * dpr;
        x.fillStyle = rgba(mix(mix(p.mid, p.haze, .25), [0, 0, 0], R() * .3)); x.beginPath(); x.arc(sx(u), y, r, 0, 6.29); x.fill(); }
      x.restore(); }
    // the waterfall: narrow at the lip, widening, broken by a rock ledge, foaming at the pool
    const wfTop = mt(fx) + H * .012, wfBot = hy + H * .006, wfW = W * .02, wfLedge = wfTop + (wfBot - wfTop) * .55;
    const fallW = y => wfW * (.35 + .65 * clamp((y - wfTop) / (wfBot - wfTop)));
    const fallPath = () => { x.beginPath(); for (let y = wfTop; y <= wfBot; y += 2 * dpr) x.lineTo(sx(fx) - fallW(y) / 2 + Math.sin(y * .09) * dpr * 1.2, y); for (let y = wfBot; y >= wfTop; y -= 2 * dpr) x.lineTo(sx(fx) + fallW(y) / 2 + Math.sin(y * .07 + 2) * dpr * 1.2, y); x.closePath(); };
    g = x.createLinearGradient(0, wfTop, 0, wfBot); g.addColorStop(0, rgba(mix(p.river, [255, 255, 255], .35), .75)); g.addColorStop(1, rgba(mix(p.river, [255, 255, 255], .6), .9));
    if (!opt.split) {
    fallPath(); x.fillStyle = g; x.fill();
    x.fillStyle = rgba(mix(p.mid, [0, 0, 0], .45)); x.beginPath(); x.ellipse(sx(fx) - fallW(wfLedge) * .9, wfLedge, fallW(wfLedge) * .7, H * .006, -.2, 0, 6.29); x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(sx(fx), wfLedge, fallW(wfLedge) * .75, H * .004, 0, 0, 6.29); x.fill();
    }
    // 3) the village line on the other side
    const vStart = flip > 0 ? 0 : .55, vEnd = flip > 0 ? .45 : 1, hu = H * .016;
    for (let k = 0; k < 40; k++) { const u = vStart + (vEnd - vStart) * (k / 40) + (R() - .5) * .01, px = u * W, base = hy + 1;
      if (R() < .35) { // coconut palm
        const ph = hu * (2.6 + R() * 1.4), lean = (R() - .5) * hu; x.strokeStyle = haze(hex('#5B4A36'), .5); x.lineWidth = Math.max(1, hu * .14); x.beginPath(); x.moveTo(px, base); x.quadraticCurveTo(px + lean, base - ph * .5, px + lean * 1.5, base - ph); x.stroke();
        x.strokeStyle = haze(hex('#3F6B34'), .45); x.lineWidth = Math.max(1, hu * .16); for (let f = 0; f < 6; f++) { const a = -Math.PI / 2 + (f / 5 - .5) * 2.8; x.beginPath(); x.moveTo(px + lean * 1.5, base - ph); x.quadraticCurveTo(px + lean * 1.5 + Math.cos(a) * hu * .9, base - ph + Math.sin(a) * hu * .4 - hu * .3, px + lean * 1.5 + Math.cos(a) * hu * 1.5, base - ph + Math.sin(a) * hu * .2 + hu * .5); x.stroke(); }
      } else if (R() < .55) { // hut: mud wall + tin roof catching the light
        const w = hu * (1.2 + R() * .8), h = hu * (.7 + R() * .3);
        x.fillStyle = haze(hex('#9C7B55'), .45); x.fillRect(px - w / 2, base - h, w, h);
        x.fillStyle = haze(mix(hex('#B8C6D0'), p.sun, .2), .3); x.beginPath(); x.moveTo(px - w * .62, base - h); x.lineTo(px, base - h - hu * .65); x.lineTo(px + w * .62, base - h); x.closePath(); x.fill();
        x.fillStyle = haze(hex('#3A2A1A'), .5); x.fillRect(px - w * .12, base - h * .6, w * .24, h * .6);
      } else { // trees and bamboo clumps
        const r = hu * (.6 + R() * .7); x.fillStyle = haze(mix(p.mid, [0, 0, 0], R() * .2), .4); x.beginPath(); x.arc(px, base - r * .9, r, 0, 6.29); x.arc(px + r * .7, base - r * .6, r * .7, 0, 6.29); x.fill(); } }
    // a small white mosque in the village
    { const mx = (vStart + (vEnd - vStart) * .55) * W, base = hy + 1, w = hu * 2.4; x.fillStyle = haze(hex('#EDE9DF'), .25); x.fillRect(mx - w / 2, base - hu * 1.2, w, hu * 1.2);
      x.beginPath(); x.arc(mx, base - hu * 1.2, w * .32, Math.PI, 0); x.fill(); x.fillRect(mx + w * .55, base - hu * 2.6, hu * .3, hu * 2.6);
      x.beginPath(); x.arc(mx + w * .55 + hu * .15, base - hu * 2.6, hu * .22, Math.PI, 0); x.fill(); }
    // 4) the ground and paddy fields
    g = x.createLinearGradient(0, hy, 0, H); g.addColorStop(0, rgba(mix(p.near, p.haze, .5))); g.addColorStop(.3, rgba(mix(p.field, p.near, .3))); g.addColorStop(1, rgba(mix(p.near, [0, 0, 0], .25)));
    x.fillStyle = g; x.fillRect(0, hy, W, H - hy);
    const fieldC = opt.season === 'hemonto' ? hex('#C8A848') : p.field;
    for (let row = 0; row < 22; row++) { const v0 = Math.pow(row / 22, 1.7), v1 = Math.pow((row + 1) / 22, 1.7), y0 = hy + (H - hy) * .55 * v0, y1 = hy + (H - hy) * .55 * v1;
      for (let col = -8; col < 12; col++) { const sk = (col - 2) * W * .14, l = W * .5 + sk * (.25 + v0 * 2.2), r = W * .5 + (sk + W * .14) * (.25 + v0 * 2.2), l1 = W * .5 + sk * (.25 + v1 * 2.2), r1 = W * .5 + (sk + W * .14) * (.25 + v1 * 2.2);
        const shade = (n3(row * 1.7 + col * 3.3) - .5) * .12; x.fillStyle = rgba(mix(mix(fieldC, p.near, .25 + v0 * .3), shade > 0 ? [255, 250, 210] : [0, 0, 0], Math.abs(shade)), .35 + v0 * .3);
        x.beginPath(); x.moveTo(l, y0); x.lineTo(r, y0); x.lineTo(r1, y1); x.lineTo(l1, y1); x.closePath(); x.fill(); } }
    // 5) the river: from the waterfall pool, wide and winding toward us
    const y0 = wfBot, rv = v => W * (flip > 0 ? fx + (.6 - fx) * v + .14 * Math.sin(v * 5.2 + .2) * (.25 + .75 * v) : fx + (.4 - fx) * v - .14 * Math.sin(v * 5.2 + .2) * (.25 + .75 * v)), rw = v => W * (.03 + .34 * Math.pow(v, 1.35)), ry = v => y0 + (H - y0) * v;
    const rx = opt.split ? (c.riverLayer = canvas(W, H)).getContext('2d') : x;
    rx.beginPath(); for (let i = 0; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) - rw(v), ry(v)); } for (let i = 80; i >= 0; i--) { const v = i / 80; rx.lineTo(rv(v) + rw(v), ry(v)); } rx.closePath();
    g = rx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, rgba(mix(p.river, p.haze, .45))); g.addColorStop(.4, rgba(mix(p.river, [30, 70, 100], .3))); g.addColorStop(1, rgba(mix(p.river, [10, 35, 55], .6)));
    rx.fillStyle = g; rx.fill();
    // banks: soft dark edge with a sandy lip
    for (const side of [-1, 1]) { rx.strokeStyle = rgba(mix(p.near, [0, 0, 0], .4), .75); rx.lineWidth = 2.4 * dpr; rx.beginPath(); for (let i = 0; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) + side * rw(v), ry(v)); } rx.stroke();
      rx.strokeStyle = rgba(mix(hex('#D8C08A'), p.haze, .3), .35); rx.lineWidth = 1.4 * dpr; rx.beginPath(); for (let i = 0; i <= 80; i++) { const v = i / 80; rx.lineTo(rv(v) + side * (rw(v) + 3 * dpr * (1 + v)), ry(v)); } rx.stroke(); }
    // the pool at the foot of the waterfall
    rx.fillStyle = rgba(mix(p.river, p.haze, .35)); rx.beginPath(); rx.ellipse(sx(fx), y0 + H * .004, W * .05, H * .008, 0, 0, 6.29); rx.fill();
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
    const m = ctx.createRadialGradient(f.x, f.bot, 0, f.x, f.bot, f.w * 3.4); // spray m.addColorStop(0, `rgba(255,255,255,${.55 + .1 * Math.sin(t * 2)})`); m.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = m; ctx.beginPath(); ctx.ellipse(f.x, f.bot, f.w * 3.4, f.w * 1.6, 0, 0, 6.29); ctx.fill(); ctx.restore();
  }

  // the waterfall ribbon, revealed from the lip down (k = 0..1), for the opening
  function fallRibbon(ctx, f, k, dpr) {
    if (k <= 0) return; const yEnd = f.top + (f.bot - f.top) * Math.min(1, k);
    const g = ctx.createLinearGradient(0, f.top, 0, f.bot); g.addColorStop(0, rgba(mix(f.river, [255, 255, 255], .35), .8)); g.addColorStop(1, rgba(mix(f.river, [255, 255, 255], .6), .92));
    ctx.fillStyle = g; ctx.beginPath(); for (let y = f.top; y <= yEnd; y += 2 * dpr) ctx.lineTo(f.x - f.fw(y) / 2 + Math.sin(y * .09) * dpr * 1.2, y); for (let y = yEnd; y >= f.top; y -= 2 * dpr) ctx.lineTo(f.x + f.fw(y) / 2 + Math.sin(y * .07 + 2) * dpr * 1.2, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(f.x, yEnd, f.fw(yEnd) * .7, 2 * dpr, 0, 0, 6.29); ctx.fill();
  }
  // water lilies drifting downstream (v = position along the river, s = across)
  function lilies(n, seed = 3) { const R = rng(seed); return Array.from({ length: n }, () => ({ v: .1 + R() * .85, s: (R() - .5) * 1.2, sp: .006 + R() * .006, fl: R() < .55, hue: R() < .6 ? '#F4A7C3' : '#FFF4F0', rot: R() * 6.28, sz: .8 + R() * .5 })); }
  function drawLilies(ctx, L, rv, t, dt, dpr, dark) {
    for (const l of L) { l.v += l.sp * dt * (.4 + l.v); if (l.v > 1.02) { l.v = .08; l.s = (Math.random() - .5) * 1.2; }
      const x = rv.rv(l.v) + l.s * rv.rw(l.v) * .8 + Math.sin(t * .8 + l.rot) * 2 * dpr, y = rv.ry(l.v), r = (3 + 12 * Math.pow(l.v, 1.3)) * dpr * l.sz, rot = l.rot + Math.sin(t * .4 + l.rot) * .2;
      ctx.fillStyle = dark ? 'rgba(20,50,30,.85)' : 'rgba(52,120,58,.95)';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.ellipse(x, y, r, r * .38, 0, rot + .35, rot + 6.0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(80,120,90,.4)' : 'rgba(140,200,120,.55)'; ctx.lineWidth = Math.max(.6, dpr * .6); ctx.stroke();
      if (l.fl && r > 3 * dpr) { const fr = r * .45; ctx.fillStyle = dark ? 'rgba(200,180,200,.7)' : l.hue;
        for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + t * .05; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * fr * .45, y - fr * .35 + Math.sin(a) * fr * .18, fr * .5, fr * .22, a, 0, 6.29); ctx.fill(); }
        ctx.fillStyle = '#F7D24A'; ctx.beginPath(); ctx.arc(x, y - fr * .35, fr * .18, 0, 6.29); ctx.fill(); } }
  }

  // grazing animals, drawn side-on (origin on the ground, facing right): a zebu cow with its hump and dewlap,
  // and a Black Bengal goat. They graze (head down), look up, swish their tails and now and then take a few steps.
  function animal(ctx, a, t, dpr, dark) {
    const z = a.z, tt = t + a.ph, g = (Math.sin(tt * .42) + 1) / 2, down = clamp((g - .3) / .25), walk = a.walking ? Math.sin(tt * 5.5) : 0, goat = !!a.goat;
    const base = dark ? mix(hex(a.col), [20, 25, 40], .55) : hex(a.col), shade = mix(base, [0, 0, 0], .3), light = mix(base, [255, 255, 255], .18), hoof = dark ? [15, 15, 20] : [40, 32, 26];
    const leg = z * (goat ? .4 : .44), bt = -leg;                                  // body bottom line
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(a.face, 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, z * .62, z * .08, 0, 0, 6.29); ctx.fill();
    // legs: tapered, with a knee and a hoof; far legs darker and drawn first
    const legDraw = (lx, s, far) => { const sw = walk * s * z * .06, w0 = z * (goat ? .07 : .09), w1 = z * (goat ? .035 : .045);
      ctx.fillStyle = rgba(far ? shade : base); ctx.beginPath(); ctx.moveTo(lx * z - w0 / 2, bt + z * .04); ctx.lineTo(lx * z + w0 / 2, bt + z * .04);
      ctx.lineTo(lx * z + w1 / 2 + sw * .5, bt + leg * .55); ctx.lineTo(lx * z + w1 / 2 + sw, -z * .05); ctx.lineTo(lx * z - w1 / 2 + sw, -z * .05); ctx.lineTo(lx * z - w1 / 2 + sw * .5, bt + leg * .55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgba(hoof); ctx.fillRect(lx * z - w1 / 2 + sw - z * .005, -z * .05, w1 + z * .01, z * .05); };
    legDraw(-.3, -1, true); legDraw(.3, -1, true);
    // body: back line, hump (cow), chest, belly
    const by = bt - z * .02;
    const bodyG = ctx.createLinearGradient(0, by - z * .4, 0, bt + z * .06); bodyG.addColorStop(0, rgba(light)); bodyG.addColorStop(.6, rgba(base)); bodyG.addColorStop(1, rgba(shade));
    ctx.fillStyle = bodyG; ctx.beginPath();
    ctx.moveTo(-z * .46, by - z * (goat ? .2 : .24));
    ctx.quadraticCurveTo(-z * .1, by - z * (goat ? .3 : .33), z * .18, by - z * (goat ? .29 : .33));
    if (!goat) ctx.quadraticCurveTo(z * .27, by - z * .5, z * .36, by - z * .34); else ctx.lineTo(z * .3, by - z * .3);
    ctx.quadraticCurveTo(z * .5, by - z * .2, z * .44, by + z * .02);
    ctx.quadraticCurveTo(z * .05, by + z * .1, -z * .36, by + z * .03);
    ctx.quadraticCurveTo(-z * .52, by - z * .05, -z * .46, by - z * (goat ? .2 : .24)); ctx.fill();
    if (!goat && a.patch) { ctx.fillStyle = rgba(mix(base, [60, 40, 30], .5), .55); ctx.beginPath(); ctx.ellipse(-z * .18, by - z * .14, z * .13, z * .09, .4, 0, 6.29); ctx.fill(); }
    // near legs over the body
    legDraw(-.22, 1, false); legDraw(.36, 1, false);
    // tail with a tuft (cow) or a short upright tail (goat)
    ctx.strokeStyle = rgba(shade); ctx.lineWidth = z * .025;
    if (goat) { ctx.beginPath(); ctx.moveTo(-z * .44, by - z * .2); ctx.lineTo(-z * .52, by - z * .32 + Math.sin(tt * 4) * z * .02); ctx.stroke(); }
    else { const sw = Math.sin(tt * 2.1) * z * .07; ctx.beginPath(); ctx.moveTo(-z * .46, by - z * .2); ctx.quadraticCurveTo(-z * .54, by + z * .05, -z * .5 + sw, bt + leg * .45); ctx.stroke();
      ctx.fillStyle = rgba(mix(shade, [0, 0, 0], .4)); ctx.beginPath(); ctx.ellipse(-z * .5 + sw, bt + leg * .5, z * .025, z * .05, 0, 0, 6.29); ctx.fill(); }
    // neck and head: lowered to graze or raised to look around
    const sx0 = z * .34, sy0 = by - z * (goat ? .22 : .26);
    const hx = z * (.56 + .06 * down), hy = lerpN(by - z * (goat ? .42 : .4), -z * .1, down), ang = lerpN(-.25, 1.15, down);
    ctx.fillStyle = rgba(base); ctx.beginPath(); ctx.moveTo(sx0 - z * .06, sy0 - z * .1); ctx.lineTo(hx - z * .03, hy - z * .06); ctx.lineTo(hx + z * .02, hy + z * .06); ctx.lineTo(sx0 + z * .06, sy0 + z * .14); ctx.closePath(); ctx.fill();
    if (!goat) { ctx.fillStyle = rgba(mix(base, shade, .4)); ctx.beginPath(); ctx.moveTo(sx0, sy0 + z * .12); ctx.quadraticCurveTo(lerpN(sx0, hx, .5), lerpN(sy0, hy, .5) + z * .16, hx, hy + z * .04); ctx.lineTo(sx0 + z * .05, sy0 + z * .1); ctx.fill(); } // dewlap
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
    const hl = z * (goat ? .2 : .24);
    ctx.fillStyle = rgba(base); ctx.beginPath(); ctx.moveTo(-hl * .2, -hl * .32); ctx.quadraticCurveTo(hl * .55, -hl * .36, hl * .95, -hl * .08); ctx.quadraticCurveTo(hl * 1.05, hl * .14, hl * .8, hl * .22); ctx.quadraticCurveTo(hl * .3, hl * .3, -hl * .2, hl * .2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(mix(base, [60, 40, 40], goat ? .3 : .45)); ctx.beginPath(); ctx.ellipse(hl * .86, hl * .05, hl * .17, hl * .17, 0, 0, 6.29); ctx.fill();          // muzzle
    ctx.fillStyle = rgba(shade); ctx.beginPath(); ctx.ellipse(-hl * .05, goat ? hl * .12 : -hl * .3, hl * .28, hl * .1, goat ? 1.2 : -.5, 0, 6.29); ctx.fill();           // ear
    ctx.strokeStyle = rgba(goat ? mix(base, [255, 255, 255], .25) : hex('#D9CBB0')); ctx.lineWidth = z * .03; ctx.beginPath();                                    // horns
    if (goat) { ctx.moveTo(hl * .05, -hl * .3); ctx.quadraticCurveTo(-hl * .2, -hl * .7, -hl * .45, -hl * .45); } else { ctx.moveTo(hl * .12, -hl * .3); ctx.quadraticCurveTo(hl * .05, -hl * .6, hl * .25, -hl * .65); } ctx.stroke();
    ctx.fillStyle = 'rgba(10,10,10,.85)'; ctx.beginPath(); ctx.arc(hl * .38, -hl * .1, hl * .05, 0, 6.29); ctx.fill();                                                  // eye
    if (goat) { ctx.fillStyle = rgba(shade); ctx.beginPath(); ctx.moveTo(hl * .7, hl * .2); ctx.lineTo(hl * .62, hl * .5); ctx.lineTo(hl * .78, hl * .24); ctx.fill(); }  // beard
    ctx.restore(); ctx.restore();
  }
  const lerpN = (a, b, k) => a + (b - a) * k;
  function herd(W, H, hy, dpr, flip) {
    const side = u => flip ? 1 - u : u;
    return [{ col: '#EDE6DA', z: 44, u: .14, v: .52, patch: true }, { col: '#B98A5E', z: 40, u: .3, v: .42 }, { col: '#2E2925', z: 30, u: .22, v: .62, goat: true }, { col: '#5A4636', z: 26, u: .38, v: .58, goat: true }]
      .map((a, i) => ({ ...a, x: side(a.u) * W, y: hy + (H - hy) * a.v, z: a.z * (.55 + a.v * .8) * (H / 900), face: (i % 2 ? -1 : 1) * (flip ? -1 : 1), ph: i * 2.3, walking: false, home: side(a.u) * W }));
  }
  function moveHerd(herdA, t, dt, W) { herdA.forEach(a => { const cyc = (t + a.ph * 3) % 26; a.walking = cyc > 20 && cyc < 24; if (a.walking) a.x += a.face * W * .004 * dt; if (Math.abs(a.x - a.home) > W * .05) a.face = a.x > a.home ? -1 : 1; }); }

  return { paint, fallRibbon, waterfall, lilies, drawLilies, animal, herd, moveHerd };
})();
