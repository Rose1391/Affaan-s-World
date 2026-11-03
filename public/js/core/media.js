/* ============ photos & videos ============
 Original file stays on this device (IndexedDB). A compressed copy (max 1600 px,
 ~150 KB JPEG) is what syncs to the private Supabase bucket. A 480 px thumb keeps
 grids fast. Videos stay device-only (they would eat the 1 GB free tier). */
const Media = (() => {
  const MAX = 1600, TARGET = 150 * 1024, THUMB = 480;

  async function decode(file) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { /* fall back */ }
    }
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = () => rej(new Error('Cannot read image')); img.src = URL.createObjectURL(file); });
  }
  function draw(src, maxDim) {
    const w0 = src.width, h0 = src.height, s = Math.min(1, maxDim / Math.max(w0, h0));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * s)); c.height = Math.max(1, Math.round(h0 * s));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  const toJpeg = (c, q) => new Promise(res => c.toBlob(b => res(b), 'image/jpeg', q));
  async function compress(src) {
    let dim = MAX, best = null;
    for (let round = 0; round < 4; round++) {
      const c = draw(src, dim);
      for (let q = 0.82; q >= 0.46; q -= 0.08) {
        const b = await toJpeg(c, q); best = { blob: b, w: c.width, h: c.height };
        if (b.size <= TARGET) return best;
      }
      dim = Math.round(dim * 0.82);
    }
    return best;
  }
  async function processImage(file) {
    const src = await decode(file);
    const comp = await compress(src);
    const thumb = await toJpeg(draw(src, THUMB), 0.78);
    if (src.close) src.close();
    return { compressed: comp.blob, thumb, w: comp.w, h: comp.h };
  }
  function videoThumb(file) {
    return new Promise(res => {
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata';
      const url = URL.createObjectURL(file); let done = false;
      const finish = b => { if (done) return; done = true; URL.revokeObjectURL(url); res(b); };
      v.onloadeddata = () => { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); } catch (e) { finish(null); } };
      v.onseeked = async () => { try { finish(await toJpeg(draw(v, THUMB), 0.75)); } catch (e) { finish(null); } };
      v.onerror = () => finish(null); setTimeout(() => finish(null), 6000);
      v.src = url;
    });
  }
  // store a picked file → returns photo id (record kind "photo")
  async function save(file) {
    const id = uid();
    const takenAt = file.lastModified ? isoDate(new Date(file.lastModified)) : todayISO();
    if (file.type.startsWith('video/')) {
      const thumb = await videoThumb(file);
      await DB.blob.put({ id, original: file, thumb, mime: file.type, type: 'video', uploaded: false });
      await DB.put('photo', { type: 'video', mime: file.type, origSize: file.size, takenAt, name: file.name || '' }, id);
    } else {
      const p = await processImage(file);
      await DB.blob.put({ id, original: file, compressed: p.compressed, thumb: p.thumb, mime: file.type || 'image/jpeg', type: 'photo', uploaded: false });
      await DB.put('photo', { type: 'photo', w: p.w, h: p.h, size: p.compressed.size, origSize: file.size, takenAt, name: file.name || '' }, id);
    }
    return { id, takenAt };
  }

  // object-URL cache; size = 'thumb' | 'full' | 'original'
  const urls = new Map();
  async function url(id, size = 'thumb') {
    const key = id + ':' + size; if (urls.has(key)) return urls.get(key);
    let b = await DB.blob.get(id);
    if (!b || (!b.thumb && !b.compressed && !b.original)) {
      const remote = await Sync.downloadPhoto(id);            // other parent's photo → fetch compressed copy
      if (!remote) return null;
      let thumb = null; try { thumb = await toJpeg(draw(await decode(remote), THUMB), 0.78); } catch (e) { }
      b = { id, compressed: remote, thumb, mime: 'image/jpeg', type: 'photo', uploaded: true, remoteOnly: true };
      await DB.blob.put(b);
    }
    const pick = size === 'thumb' ? (b.thumb || b.compressed || b.original) : size === 'full' ? (b.type === 'video' ? b.original : (b.compressed || b.original)) : (b.original || b.compressed);
    if (!pick) return null;
    const u = URL.createObjectURL(pick); urls.set(key, u); return u;
  }
  function forget(id) { for (const k of [...urls.keys()]) if (k.startsWith(id + ':')) { URL.revokeObjectURL(urls.get(k)); urls.delete(k); } }
  // fill every <img data-photo> inside root
  function hydrate(root = document) {
    $$('img[data-photo]:not([data-h])', root).forEach(async img => {
      img.dataset.h = '1';
      try { const u = await url(img.dataset.photo, img.dataset.size || 'thumb'); if (u) img.src = u; else img.classList.add('missing'); }
      catch (e) { img.classList.add('missing'); }
    });
  }
  const img = (id, size = 'thumb', cls = '', alt = '') => `<img data-photo="${esc(id)}" data-size="${size}" class="${cls}" alt="${esc(alt)}" loading="lazy">`;
  return { save, url, hydrate, img, forget, processImage };
})();
