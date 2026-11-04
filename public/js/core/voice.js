/* ============ FAMILY VOICES — Abbu & Ammu record words once; Affaan hears them instead of the robot voice ============
 Each clip is a record (kind "voice", id "vc:<key>") + an audio blob on this phone. Clips sync to the other
 parent's phone through the private bucket, are included in backups, and always win over text-to-speech.
 Keys: L:en:A · L:bv:অ · L:bc:ক · N:en:3 · N:bn:3 · C:Red · S:Circle · W:Cow · P:<name> · ST:<story>:<page>:en|bn
       F:<familyId> (hello) · FQ:<familyId> (“where is …?”) · G:hello · G:yes · G:outside · G:sleepy · WD:<word> */
const Voice = (() => {
  let map = {}, current = null, rec = null;
  const vid = key => 'vc:' + key;
  async function load() { map = {}; for (const r of await DB.list('voice')) map[r.key] = r; return map; }
  Bus.on('change', r => { if (!r || r.kind === 'voice') load(); });
  Bus.on('remote', () => load());
  const has = key => !!map[key];
  const count = () => Object.keys(map).length;
  const idle = () => current ? new Promise(r => { const c = current; const t = setInterval(() => { if (current !== c) { clearInterval(t); r(); } }, 150); }) : Promise.resolve();
  function stop() { if (current) { try { current.pause(); } catch (e) { } current = null; } }
  async function blob(key) {
    let b = await DB.blob.get(vid(key));
    if (b?.audio) return b.audio;
    const r = map[key]; if (!r?.remote) return null;
    const a = await Sync.downloadFile(`voice/${safe(key)}.${ext(r.mime)}`, r.mime); if (!a) return null;
    await DB.blob.put({ id: vid(key), audio: a, mime: r.mime, type: 'voice', uploaded: true }); return a;
  }
  // play one clip; resolves when it ends (false if there is no clip)
  async function play(key) {
    if (!Speech.isEnabled() || !has(key)) return false;
    const a = await blob(key); if (!a) return false;
    stop(); Speech.stop();
    const el = new Audio(URL.createObjectURL(a)); current = el;
    return new Promise(res => { el.onended = el.onerror = () => { URL.revokeObjectURL(el.src); if (current === el) current = null; res(true); }; el.play().catch(() => res(false)); });
  }
  // family voice first, text-to-speech as the fallback; parts = [[text, lang, rate], …]
  async function say(key, parts) {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.some(has)) { Speech.stop(); for (const k of keys) if (has(k)) await play(k); return; }
    stop(); return Speech.seq(parts);
  }
  /* ---- recording ---- */
  function pickMime() {
    if (!window.MediaRecorder) return null;
    for (const m of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) if (MediaRecorder.isTypeSupported?.(m)) return m;
    return '';
  }
  async function start(maxSec = 10, onTick) {
    if (rec) return; const mime = pickMime();
    if (mime === null || !navigator.mediaDevices?.getUserMedia) throw new Error('This browser cannot record audio');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined);
    const chunks = []; const t0 = Date.now();
    rec = { mr, stream, done: null };
    rec.done = new Promise(res => { mr.ondataavailable = e => e.data.size && chunks.push(e.data); mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); res(new Blob(chunks, { type: (mr.mimeType || mime || 'audio/webm').split(';')[0] })); }; });
    mr.start(250);
    rec.iv = setInterval(() => { const s = (Date.now() - t0) / 1000; onTick && onTick(s); if (s >= maxSec) finish(); }, 200);
    return rec.done;
  }
  async function finish() { if (!rec) return null; clearInterval(rec.iv); const r = rec; rec = null; if (r.mr.state !== 'inactive') r.mr.stop(); return r.done; }
  const recording = () => !!rec;
  async function save(key, label, audio) {
    await DB.blob.put({ id: vid(key), audio, mime: audio.type, type: 'voice', uploaded: false });
    await DB.put('voice', { key, label, mime: audio.type, size: audio.size, remote: false }, vid(key)); await load();
  }
  async function remove(key) { await DB.blob.del(vid(key)); await DB.del(vid(key)); await load(); }
  const safe = key => key.replace(/[^\wঀ-৿:-]/g, '_').replace(/:/g, '-');
  const ext = mime => (mime || '').includes('mp4') ? 'm4a' : (mime || '').includes('ogg') ? 'ogg' : 'webm';
  return { idle, load, has, count, play, say, stop, start, finish, recording, save, remove, blob, safe, ext, vid };
})();
