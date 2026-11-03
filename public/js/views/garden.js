/* ============ AFFAAN'S GARDEN — the Home scene, drawn from his real records ============
 Tree height  ← latest height (cm)        Door-frame post ← every height measurement (pencil marks)
 Four branches ← milestone domains         Flowers ← milestones achieved (domain colour)
 Leaves        ← words (green English, gold বাংলা, teal skills), golden-angle phyllotaxis
 Lanterns      ← newest photos             Roots   ← vaccine doses given
 Butterflies   ← stars earned in Play (fireflies at night)   Stickers ← the ones he chose after play
 Sun / moon    ← Dhaka clock               Paddy & riverbank ← Bengali season          */
const Garden = (() => {
  const DOM = { language: { a: -128, c: '#4F8FDB' }, movement: { a: -52, c: '#3DAA66' }, social: { a: -152, c: '#E46A8C' }, thinking: { a: -28, c: '#9B6BE0' } };
  const SEASON_PADDY = { grishmo: ['#B9C95A', '#9DB348'], borsha: ['#5FB54A', '#3F9A3A'], shorot: ['#7CC25A', '#5BA544'], hemonto: ['#E8BE45', '#D19D2A'], sheet: ['#C9C88E', '#ABA86E'], boshonto: ['#8FD06A', '#6DB650'] };
  function rng(seed) { let h = 2166136261; for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const f1 = n => n.toFixed(1);

  async function data() {
    const T = Cal.today();
    const growth = (await DB.list('growth')).filter(g => g.height != null).sort((a, b) => a.date.localeCompare(b.date));
    const ms = (await DB.list('milestone')).filter(m => m.achieved).map(m => ({ ...m, it: CDC_BY_ID[m.id.slice(3)] })).filter(m => m.it);
    const words = (await DB.list('word')).sort((a, b) => a.date.localeCompare(b.date));
    const photos = (await galleryItems()).filter(p => p.type === 'photo').slice(0, 6);
    const vx = await vaccineMap(); const doses = Object.values(vx).filter(v => v.given).length;
    const stars = (await DB.list('playsession')).reduce((t, s) => t + (s.stars || 0), 0);
    const stickers = await DB.list('sticker');
    return { T, growth, ms, words, photos, doses, stars, stickers, height: growth.length ? growth[growth.length - 1].height : null };
  }

  function flower(x, y, c, r = 5.2) {
    let p = ''; for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; p += `<ellipse cx="${f1(x + Math.cos(a) * r * .62)}" cy="${f1(y + Math.sin(a) * r * .62)}" rx="${f1(r * .55)}" ry="${f1(r * .38)}" transform="rotate(${i * 72} ${f1(x + Math.cos(a) * r * .62)} ${f1(y + Math.sin(a) * r * .62)})" fill="${c}"/>`; }
    return p + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .32)}" fill="#FFE27A"/>`;
  }
  function svg(d) {
    const { T } = d, R = rng(Child.birth), season = T.bd.season.k, night = T.phase === 'night', paddy = SEASON_PADDY[season] || SEASON_PADDY.hemonto;
    const W = 400, GY = 246;                                   // ground line
    let s = `<svg class="garden-svg" viewBox="0 0 ${W} 320" preserveAspectRatio="xMidYMax slice" role="img" aria-label="${esc(Child.first())}'s garden">`;
    s += `<defs><radialGradient id="gSun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".55" stop-color="#FFD45E"/><stop offset="1" stop-color="#FFB23C" stop-opacity="0"/></radialGradient>
      <radialGradient id="gLan"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient>
      <linearGradient id="gRiver" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${night ? '#22476B' : '#5FB3E0'}"/><stop offset="1" stop-color="${night ? '#16314D' : '#2F7FB8'}"/></linearGradient>
      <linearGradient id="gTrunk" x1="0" x2="1"><stop offset="0" stop-color="#7A4A2A"/><stop offset=".55" stop-color="#9C6338"/><stop offset="1" stop-color="#6B3F22"/></linearGradient></defs>`;
    // sun / moon on an arc that follows the Dhaka clock
    const mins = T.h * 60 + T.mi, day = mins >= 360 && mins < 1080, t = day ? (mins - 360) / 720 : ((mins >= 1080 ? mins - 1080 : mins + 360) / 720);
    const sx = 40 + 320 * t, sy = 128 - Math.sin(Math.PI * t) * 92;
    s += day ? `<g class="g-sun"><circle cx="${f1(sx)}" cy="${f1(sy)}" r="42" fill="url(#gSun)"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="15" fill="#FFD84F"/></g>`
      : `<g class="g-moon"><circle cx="${f1(sx)}" cy="${f1(sy)}" r="13" fill="#FFF4D0"/><circle cx="${f1(sx + 6)}" cy="${f1(sy - 4)}" r="11" fill="var(--sky2,#1B2D52)"/></g>`;
    if (night || T.phase === 'dusk') for (let i = 0; i < 34; i++) s += `<circle class="g-star" cx="${f1(R() * W)}" cy="${f1(R() * 120)}" r="${f1(.6 + R() * .9)}" style="animation-delay:${f1(-R() * 4)}s"/>`;
    // paper-cut hills with kantha stitches
    s += `<path d="M0 168 C60 132 110 150 160 138 C220 122 260 150 320 132 C360 122 385 130 400 128 V320 H0Z" fill="${night ? '#24463A' : '#9CCB8A'}" opacity=".9"/>`;
    s += `<path d="M0 168 C60 132 110 150 160 138 C220 122 260 150 320 132 C360 122 385 130 400 128" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 4" opacity=".55"/>`;
    s += `<path d="M0 192 C70 170 130 186 200 174 C270 162 330 184 400 170 V320 H0Z" fill="${night ? '#1E3B2F' : '#7DB86C'}"/>`;
    s += `<path d="M0 192 C70 170 130 186 200 174 C270 162 330 184 400 170" fill="none" stroke="#fff" stroke-width="1.1" stroke-dasharray="2.5 4" opacity=".5"/>`;
    // paddy field in the season's colour
    s += `<path d="M0 206 C90 196 200 204 400 196 V226 H0Z" fill="${night ? '#3B4A2A' : paddy[0]}"/>`;
    for (let i = 0; i < 70; i++) { const x = R() * W, y = 200 + R() * 22; s += `<path d="M${f1(x)} ${f1(y + 5)} q1 -4 ${f1(1 + R() * 2)} -6" stroke="${night ? '#55663A' : paddy[1]}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`; }
    if (season === 'shorot') for (let i = 0; i < 9; i++) { const x = 230 + R() * 160; s += `<path d="M${f1(x)} 226 q-2 -12 2 -20" stroke="#E8E2D0" stroke-width="1.4" fill="none"/><ellipse cx="${f1(x + 2)}" cy="203" rx="3" ry="6" fill="#fff" opacity=".9"/>`; }
    // river with a nouka
    s += `<path d="M0 224 C100 218 220 230 400 220 V240 C260 246 120 236 0 244Z" fill="url(#gRiver)"/>`;
    s += `<g class="g-ripple" stroke="#fff" stroke-width="1" opacity=".55" fill="none"><path d="M30 233 h22"/><path d="M140 236 h16"/><path d="M260 230 h26"/><path d="M350 234 h14"/></g>`;
    s += `<g class="g-boat"><path d="M0 0 q20 9 44 0 l-5 6 q-17 5 -34 0z" fill="#8A4B2A"/><path d="M14 -2 q8 -14 18 0" fill="#F2E3C2" stroke="#8A4B2A" stroke-width="1"/><path d="M22 -16 v14" stroke="#5B3A22" stroke-width="1.4"/><path d="M22 -16 l12 7 l-12 4z" fill="#E4573D"/></g>`;
    // ground
    s += `<path d="M0 ${GY - 4} C80 ${GY - 10} 180 ${GY - 2} 260 ${GY - 8} C320 ${GY - 12} 370 ${GY - 4} 400 ${GY - 6} V320 H0Z" fill="${night ? '#1F3A26' : '#6FB25A'}"/>`;
    s += `<path d="M0 ${GY - 4} C80 ${GY - 10} 180 ${GY - 2} 260 ${GY - 8} C320 ${GY - 12} 370 ${GY - 4} 400 ${GY - 6}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 4" opacity=".5"/>`;
    for (let i = 0; i < 60; i++) { const x = R() * W, y = GY + R() * 66; s += `<path d="M${f1(x)} ${f1(y)} l-2 -6 M${f1(x)} ${f1(y)} l2 -7" stroke="${night ? '#2E5236' : '#4F9A3A'}" stroke-width="1" stroke-linecap="round"/>`; }
    // soil window with roots = vaccine doses
    const TX = 140;
    s += `<g class="g-roots" data-act="go" data-to="health/vaccines"><title>${d.doses} vaccine doses — roots that protect him</title><path d="M${TX - 58} ${GY + 8} h116 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-116 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="${night ? '#2A1E14' : '#8C5B36'}" opacity=".85"/>`;
    s += `<path d="M${TX - 58} ${GY + 8} h116 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-116 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="none" stroke="#F3E2C0" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>`;
    const nr = Math.min(18, d.doses);
    for (let i = 0; i < nr; i++) { const a = -70 + (140 * (i + .5) / Math.max(1, nr)), L = 22 + R() * 22, ex = TX + Math.sin(a * Math.PI / 180) * L * 1.6, ey = GY + 12 + Math.cos(a * Math.PI / 180) * L * .9;
      s += `<path d="M${TX} ${GY + 6} Q${f1(TX + (ex - TX) * .4)} ${f1(GY + 22)} ${f1(ex)} ${f1(Math.min(ey, GY + 62))}" stroke="#E9C995" stroke-width="${f1(2.4 - i * .08)}" fill="none" stroke-linecap="round"/>`; }
    if (!nr) s += `<text x="${TX}" y="${GY + 40}" text-anchor="middle" font-size="9" fill="#F3E2C0">roots grow with each vaccine</text>`;
    s += `</g>`;
    // the tree — height from his latest measurement
    const H = d.height ? Math.max(70, Math.min(150, 46 + (d.height - 45) * 1.15)) : 78, top = GY - H;
    s += `<g class="g-tree" data-act="go" data-to="dev/growth"><title>${d.height ? d.height + ' cm tall' : 'Add his height'}</title><path d="M${TX - 9} ${GY + 4} C${TX - 7} ${GY - H * .45} ${TX - 4} ${top + 18} ${TX - 2} ${top} L${TX + 3} ${top} C${TX + 5} ${top + 18} ${TX + 8} ${GY - H * .45} ${TX + 11} ${GY + 4}Z" fill="url(#gTrunk)"/>`;
    s += `<path d="M${TX - 2} ${GY - 10} q3 -20 0 -40" stroke="#5B3420" stroke-width="1" fill="none" opacity=".5"/></g>`;
    // canopy: words as leaves (golden angle)
    const cy = top - 4, nW = d.words.length, LR = 7.5;
    const canopyR = 26 + Math.sqrt(Math.max(nW, 10)) * LR * .9;
    s += `<g class="g-canopy" data-act="go" data-to="dev/words"><title>${nW} words</title><ellipse cx="${TX}" cy="${f1(cy)}" rx="${f1(canopyR * 1.1)}" ry="${f1(canopyR * .78)}" fill="${night ? '#1F4430' : '#4E9A42'}" opacity=".8"/><ellipse cx="${TX - canopyR * .25}" cy="${f1(cy - canopyR * .18)}" rx="${f1(canopyR * .75)}" ry="${f1(canopyR * .55)}" fill="${night ? '#2A5A3A' : '#6DBA58'}" opacity=".7"/>`;
    const leaves = nW ? d.words : Array.from({ length: 10 }, () => ({ lang: 'none' }));
    leaves.slice(0, 160).forEach((w, i) => {
      const a = i * 137.508 * Math.PI / 180, r = Math.sqrt(i + 1) * LR, x = TX + Math.cos(a) * r * 1.1, y = cy + Math.sin(a) * r * .78;
      const c = w.lang === 'none' ? (night ? '#2F5E3C' : '#8CC873') : w.type === 'skill' ? '#3FB7A6' : w.lang === 'bn' ? '#E8B93A' : '#3E9B45';
      s += `<ellipse class="g-leaf" cx="${f1(x)}" cy="${f1(y)}" rx="7.4" ry="4.2" transform="rotate(${f1(a * 57.3 + 30)} ${f1(x)} ${f1(y)})" fill="${c}" style="animation-delay:${f1(-R() * 5)}s"/>`;
    });
    s += `</g>`;
    // four branches (milestone domains) with flowers
    Object.entries(DOM).forEach(([k, b]) => {
      const list = d.ms.filter(m => m.it.tag === k), len = Math.min(96, 34 + list.length * 6.5);
      const by = k === 'social' || k === 'thinking' ? top + H * .34 : top + 10, a = b.a * Math.PI / 180;
      const ex = TX + Math.cos(a) * len, ey = by + Math.sin(a) * len * .55;
      s += `<path d="M${TX} ${f1(by)} Q${f1(TX + Math.cos(a) * len * .5)} ${f1(by + Math.sin(a) * len * .2 - 6)} ${f1(ex)} ${f1(ey)}" stroke="#7A4A2A" stroke-width="${list.length ? 4 : 3}" fill="none" stroke-linecap="round"/>`;
      list.forEach((m, i) => {
        const t = (i + 1) / (list.length + 1), x = TX + (ex - TX) * t + (R() - .5) * 8, y = by + (ey - by) * t - 6 + (R() - .5) * 8;
        s += `<g class="g-flower" data-act="milestone" data-id="${m.id.slice(3)}" style="animation-delay:${f1(-R() * 4)}s"><title>${esc(m.it.en)}</title><circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="transparent"/>${flower(x, y, b.c)}</g>`;
      });
    });
    // lanterns: newest photos
    d.photos.forEach((p, i) => {
      const x = TX - 70 + i * 28 + (i % 2) * 6, y0 = cy + canopyR * .45, y = y0 + 20 + (i % 3) * 9;
      s += `<g class="g-lantern" data-act="viewPhoto" data-id="${esc(p.photoId)}" style="animation-delay:${f1(-i * .7)}s"><path d="M${f1(x)} ${f1(y0)} V${f1(y - 13)}" stroke="#C9A05A" stroke-width=".8"/>
        <circle cx="${f1(x)}" cy="${f1(y)}" r="20" fill="url(#gLan)"/><clipPath id="lc${i}"><circle cx="${f1(x)}" cy="${f1(y)}" r="11"/></clipPath>
        <image data-photo="${esc(p.photoId)}" x="${f1(x - 11)}" y="${f1(y - 11)}" width="22" height="22" clip-path="url(#lc${i})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="${f1(x)}" cy="${f1(y)}" r="11.5" fill="none" stroke="#F2C14E" stroke-width="1.6"/></g>`;
    });
    // Doel on the top branch
    s += `<g class="g-doel" data-act="go" data-to="play" transform="translate(${TX + 14} ${f1(top - canopyR * .55 - 22)}) scale(.26)">${doelInner()}</g>`;
    // door-frame post: every height measurement as a pencil mark
    const PX = 312, scale = 1.05;
    s += `<g class="g-door" data-act="go" data-to="dev/growth"><title>Height marks</title><rect x="${PX}" y="${GY - 128}" width="11" height="130" rx="2" fill="#E9D3A8" stroke="#B8935A" stroke-width="1"/>`;
    for (let cm = 10; cm <= 120; cm += 10) s += `<path d="M${PX} ${f1(GY - cm * scale)} h${cm % 50 ? 4 : 7}" stroke="#9A7440" stroke-width=".8"/>`;
    d.growth.forEach((g, i) => { const y = GY - g.height * scale, last = i === d.growth.length - 1; s += `<path d="M${PX - 3} ${f1(y)} h17" stroke="${last ? '#C0392B' : '#5B4A3A'}" stroke-width="${last ? 1.8 : 1}"/>`; if (last) s += `<text x="${PX + 16}" y="${f1(y + 3)}" font-size="8.5" font-weight="700" fill="#5B2A10">${g.height}</text>`; });
    s += `</g>`;
    // a little home (calendar)
    s += `<g class="g-house" data-act="go" data-to="calendar"><title>Calendar</title><path d="M342 ${GY - 4} v-26 h40 v26z" fill="#E8C9A0"/><path d="M336 ${GY - 30} l26 -18 l26 18z" fill="#B85C38"/><path d="M336 ${GY - 30} l26 -18 l26 18" fill="none" stroke="#fff" stroke-dasharray="2 3" stroke-width="1" opacity=".7"/>
      <rect x="349" y="${GY - 24}" width="10" height="9" rx="1" fill="${night || T.phase === 'dusk' ? '#FFD45E' : '#7FB6D9'}" class="${night ? 'g-win' : ''}"/><rect x="365" y="${GY - 22}" width="10" height="18" rx="1.5" fill="#8A4B2A"/></g>`;
    // shapla pond
    s += `<g class="g-pond"><ellipse cx="236" cy="${GY + 40}" rx="40" ry="11" fill="${night ? '#1E3F5C' : '#6CC0E0'}"/><ellipse cx="226" cy="${GY + 40}" rx="9" ry="3" fill="#3E9B45"/><ellipse cx="250" cy="${GY + 43}" rx="8" ry="2.6" fill="#3E9B45"/>${flower(238, GY + 37, '#F28DB2', 6)}</g>`;
    // butterflies (stars from play) — fireflies at night
    const nb = Math.min(12, Math.floor(d.stars / 8) + (d.stars ? 1 : 0));
    for (let i = 0; i < nb; i++) { const x = 30 + R() * 340, y = 120 + R() * 110, c = ['#FF8A3D', '#E46A8C', '#4F8FDB', '#F2C14E', '#9B6BE0'][i % 5];
      s += night ? `<circle class="g-firefly" cx="${f1(x)}" cy="${f1(y)}" r="2" style="animation-delay:${f1(-R() * 3)}s"/>`
        : `<g class="g-fly" data-act="go" data-to="play" style="animation-delay:${f1(-R() * 6)}s;--dx:${f1((R() - .5) * 60)}px;--dy:${f1((R() - .5) * 30)}px"><path d="M${f1(x)} ${f1(y)} q-6 -7 -8 0 q2 6 8 0 q6 -7 8 0 q-2 6 -8 0" fill="${c}"/><path d="M${f1(x)} ${f1(y - 3)} v6" stroke="#3A2A20" stroke-width=".8"/></g>`; }
    // stickers he chose after play
    d.stickers.slice(-24).forEach(st => { s += `<text class="g-sticker" x="${f1(st.x * W)}" y="${f1(GY + 14 + st.y * 52)}" font-size="15" text-anchor="middle">${esc(st.emoji)}</text>`; });
    // birthday: balloons + golden halo (the one place the mandala belongs)
    if (T.special?.k === 'birthday') { ['#E4573D', '#F2C14E', '#4F8FDB'].forEach((c, i) => { const x = TX + 40 + i * 14; s += `<path d="M${x} ${f1(top + 30)} q-4 30 ${-30 + i * 10} 60" stroke="#999" stroke-width=".7" fill="none"/><ellipse class="g-balloon" cx="${x}" cy="${f1(top + 20)}" rx="9" ry="11" fill="${c}" style="animation-delay:${-i}s"/>`; }); }
    return s + `</svg>`;
  }
  function doelInner() {
    return `<path d="M80 76 C86 56 92 38 98 24 C104 18 116 22 114 32 C110 50 100 68 92 84Z" fill="#232838"/><ellipse cx="58" cy="74" rx="34" ry="30" fill="#232838"/><ellipse cx="54" cy="84" rx="24" ry="19" fill="#fff"/><circle cx="49" cy="45" r="25" fill="#232838"/><circle cx="40" cy="43" r="7.5" fill="#fff"/><circle cx="41.5" cy="44" r="4.2" fill="#14161F"/><circle cx="59" cy="43" r="7.5" fill="#fff"/><circle cx="60.5" cy="44" r="4.2" fill="#14161F"/><path d="M45 52 h9 l-4.5 6z" fill="#FFB020"/><circle cx="33" cy="54" r="4.5" fill="#FF8FA3" opacity=".75"/><circle cx="66" cy="54" r="4.5" fill="#FF8FA3" opacity=".75"/>`;
  }
  // fill <image data-photo> inside the SVG
  function hydrate(root) { $$('image[data-photo]', root).forEach(async im => { const u = await Media.url(im.getAttribute('data-photo'), 'thumb'); if (u) im.setAttribute('href', u); }); }
  return { data, svg, hydrate, DOM };
})();
