/* ============ IndexedDB store (offline-first source of truth) ============
 records : every synced record  {id, kind, data, updatedAt(ISO), deleted, dirty(0|1)}
 blobs   : local media           {id, original, compressed, thumb, mime, type, uploaded}
 meta    : device-only settings  {k, v}   (PIN hash, sync cursor, config …)
*/
const DB = (() => {
  const NAME = 'affaans-world', VER = 1;
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(NAME, VER);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('records')) {
          const s = d.createObjectStore('records', { keyPath: 'id' });
          s.createIndex('kind', 'kind'); s.createIndex('dirty', 'dirty');
        }
        if (!d.objectStoreNames.contains('blobs')) d.createObjectStore('blobs', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });
      };
      r.onsuccess = () => { const d = r.result; d.onversionchange = () => d.close(); res(d); };
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  const reqP = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function tx(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode); let out;
      Promise.resolve(fn(t.objectStore(store))).then(v => out = v, rej);
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  }
  // in-memory cache of records for fast synchronous-feeling renders
  let cache = null;
  async function loadAll() {
    if (cache) return cache;
    const all = await tx('records', 'readonly', s => reqP(s.getAll()));
    cache = new Map(all.map(r => [r.id, r]));
    return cache;
  }
  const nowISO = () => new Date().toISOString();

  async function writeRaw(rec) {
    await tx('records', 'readwrite', s => reqP(s.put(rec)));
    (await loadAll()).set(rec.id, rec);
    return rec;
  }
  // create/update a record locally → marked dirty for sync
  async function put(kind, data, id) {
    await loadAll();
    const rec = { id: id || uid(), kind, data, updatedAt: nowISO(), deleted: false, dirty: 1 };
    await writeRaw(rec); Bus.emit('change', rec); return rec;
  }
  async function patch(id, kind, fields) {
    const cur = await get(id);
    return put(kind, Object.assign({}, cur && !cur.deleted ? cur.data : {}, fields), id);
  }
  async function del(id) {
    const cur = await get(id); if (!cur) return;
    const rec = { ...cur, deleted: true, updatedAt: nowISO(), dirty: 1 };
    await writeRaw(rec); Bus.emit('change', rec);
    if (cur.kind === 'photo') await blob.del(id);
  }
  async function get(id) { return (await loadAll()).get(id) || null; }
  async function data(id) { const r = await get(id); return r && !r.deleted ? r.data : null; }
  // non-deleted records of a kind, as [{id, ...data, _u}] for convenient rendering
  async function list(kind) {
    const out = [];
    for (const r of (await loadAll()).values()) if (r.kind === kind && !r.deleted) out.push({ ...r.data, id: r.id, _u: r.updatedAt });
    return out;
  }
  async function allRecords() { return [...(await loadAll()).values()]; }
  async function dirty() { return [...(await loadAll()).values()].filter(r => r.dirty); }
  async function markClean(recs) {
    for (const r of recs) { const cur = await get(r.id); if (cur && cur.updatedAt === r.updatedAt) await writeRaw({ ...cur, dirty: 0 }); }
  }
  // apply a remote/backup record if it is newer (last edit wins); returns true if applied
  async function applyIncoming(rec, markDirty = false) {
    const cur = await get(rec.id);
    if (cur && Date.parse(cur.updatedAt) >= Date.parse(rec.updatedAt)) return false;
    await writeRaw({ id: rec.id, kind: rec.kind, data: rec.data || {}, updatedAt: rec.updatedAt, deleted: !!rec.deleted, dirty: markDirty ? 1 : 0 });
    if (rec.deleted && rec.kind === 'photo') await blob.del(rec.id);
    return true;
  }

  const blob = {
    get: async id => (await tx('blobs', 'readonly', s => reqP(s.get(id)))) || null,
    put: async b => { await tx('blobs', 'readwrite', s => reqP(s.put(b))); return b; },
    del: async id => tx('blobs', 'readwrite', s => reqP(s.delete(id))),
    keys: async () => tx('blobs', 'readonly', s => reqP(s.getAllKeys())),
    update: async (id, fields) => { const b = await blob.get(id); if (b) await blob.put({ ...b, ...fields }); }
  };
  const meta = {
    get: async (k, d = null) => { const r = await tx('meta', 'readonly', s => reqP(s.get(k))); return r ? r.v : d; },
    set: async (k, v) => tx('meta', 'readwrite', s => reqP(s.put({ k, v })))
  };
  async function wipe() {
    const d = await open(); d.close(); dbp = null; cache = null;
    await new Promise(res => { const r = indexedDB.deleteDatabase(NAME); r.onsuccess = r.onerror = r.onblocked = () => res(); });
  }
  return { open, put, patch, del, get, data, list, allRecords, dirty, markClean, applyIncoming, blob, meta, wipe, loadAll };
})();

/* ---- child profile (synced) ---- */
const Child = {
  _p: { name: 'Affaan Rehbar', nameBn: 'আফফান রেহবার', birth: '2024-09-30', sex: 'boy' },
  async load() { const d = await DB.data('settings:child'); if (d) Object.assign(this._p, d); return this._p; },
  get name() { return this._p.name; }, get nameBn() { return this._p.nameBn; }, get birth() { return this._p.birth; },
  first() { return (this._p.name || 'Affaan').split(' ')[0]; },
  async save(p) { Object.assign(this._p, p); await DB.put('settings', { ...this._p }, 'settings:child'); }
};
/* ---- small synced key/value records (spark days, books read …) ---- */
const KV = {
  get: async (k, d) => { const v = await DB.data('kv:' + k); return v ? v.v : d; },
  set: async (k, v) => DB.put('kv', { v }, 'kv:' + k)
};
