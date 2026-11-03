/* ============ Supabase sync (optional; the app is complete without it) ============
 push : dirty records → rpc upsert_records (server keeps the newer updated_at = last edit wins)
 photos: compressed copies → private bucket "photos/<family>/<photo>.jpg"
 pull : rows changed on the server since our cursor → applied locally if newer */
const Sync = (() => {
  let client = null, session = null, familyId = null, running = false, lastError = '', cfg = null, channel = null, live = false;
  const state = () => ({ configured: !!client, signedIn: !!session, email: session?.user?.email || '', familyId, running, lastError, online: navigator.onLine, live });
  // Realtime: the other parent's edits arrive within a second or two (falls back to the 5-minute timer)
  function subscribe() {
    if (!client || !session || !familyId || channel || !client.channel) return;
    try {
      channel = client.channel('records-' + familyId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records', filter: 'family_id=eq.' + familyId }, () => soon())
        .subscribe(status => { live = status === 'SUBSCRIBED'; Bus.emit('sync', state()); });
    } catch (e) { channel = null; }
  }
  function unsubscribe() { if (channel && client) { try { client.removeChannel(channel); } catch (e) { } } channel = null; live = false; }

  function keyRole(key) {
    if (!key) return null;
    if (key.startsWith('sb_secret_')) return 'secret';
    if (key.startsWith('sb_publishable_')) return 'anon';
    try { return JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role; } catch (e) { return null; }
  }
  async function getConfig() {
    const local = await DB.meta.get('supabase', null);
    const file = window.AFFAAN_CONFIG || {};
    const url = (local?.url || file.SUPABASE_URL || '').trim(), key = (local?.key || file.SUPABASE_ANON_KEY || '').trim();
    return { url, key, fromFile: !local?.url && !!file.SUPABASE_URL };
  }
  async function init() {
    cfg = await getConfig();
    familyId = await DB.meta.get('familyId', null);
    if (!cfg.url || !cfg.key || !window.supabase) { Bus.emit('sync', state()); return; }
    const role = keyRole(cfg.key);
    if (role === 'service_role' || role === 'secret') { lastError = 'That is a SECRET key — use the anon/publishable key only.'; Bus.emit('sync', state()); return; }
    client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'affaan-auth' } });
    try { session = (await client.auth.getSession()).data.session; } catch (e) { session = null; }
    client.auth.onAuthStateChange((ev, s) => { const was = !!session; session = s; Bus.emit('sync', state()); if (s && !was) soon(); });
    Bus.emit('sync', state());
    if (session) soon(200);
  }
  async function saveConfig(url, key) {
    const role = keyRole(key);
    if (role === 'service_role' || role === 'secret') throw new Error('Never paste the service_role / secret key. Use the anon (publishable) key.');
    if (!/^https:\/\/.+/.test(url)) throw new Error('URL must start with https://');
    await DB.meta.set('supabase', { url: url.trim(), key: key.trim() });
    location.reload();
  }
  async function clearConfig() { await DB.meta.set('supabase', null); location.reload(); }

  const need = () => { if (!client) throw new Error('Add your Supabase URL and anon key first.'); };
  async function signIn(email, password) { need(); const { error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; await ensureFamily(); run(); }
  async function signUp(email, password) {
    need(); const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) throw error; if (data.session) { await ensureFamily(); run(); return 'in'; } return 'confirm';
  }
  async function magicLink(email) { need(); const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } }); if (error) throw error; }
  async function verifyPassword(password) { need(); if (!session) throw new Error('Not signed in'); const { error } = await client.auth.signInWithPassword({ email: session.user.email, password }); if (error) throw error; return true; }
  async function signOut() { unsubscribe(); if (client) await client.auth.signOut(); session = null; await DB.meta.set('familyId', null); familyId = null; Bus.emit('sync', state()); }
  async function ensureFamily() {
    const { data, error } = await client.rpc('ensure_family'); if (error) throw error;
    if (familyId && familyId !== data) await DB.meta.set('lastPull', null);   // switched family → full pull
    familyId = data; await DB.meta.set('familyId', familyId); return familyId;
  }
  async function invite(email) { need(); const { error } = await client.rpc('invite_parent', { invite_email: email }); if (error) throw error; }
  async function cancelInvite() { need(); const { error } = await client.rpc('cancel_invite'); if (error) throw error; }
  async function members() {
    if (!client || !session || !familyId) return { members: [], invites: [] };
    const [m, i] = await Promise.all([client.from('family_members').select('email,role,created_at'), client.from('family_invites').select('email,created_at')]);
    return { members: m.data || [], invites: i.data || [] };
  }

  // ---- the sync run ----
  async function run() {
    if (!client || !session || running || !navigator.onLine) return state();
    running = true; lastError = ''; Bus.emit('sync', state());
    let pulled = 0;
    try {
      if (!familyId) await ensureFamily();
      // 1) push records (chunks of 200)
      const dirty = await DB.dirty();
      for (let i = 0; i < dirty.length; i += 200) {
        const chunk = dirty.slice(i, i + 200);
        const rows = chunk.map(r => ({ id: r.id, kind: r.kind, data: r.data, updated_at: r.updatedAt, deleted: !!r.deleted }));
        const { error } = await client.rpc('upsert_records', { fid: familyId, rows }); if (error) throw error;
        await DB.markClean(chunk);
      }
      // 2) photos up / deletes
      for (const p of (await DB.allRecords()).filter(r => r.kind === 'photo')) {
        const path = `${familyId}/${p.id}.jpg`;
        if (p.deleted) {
          if (p.data.remote) { await client.storage.from('photos').remove([path]); await DB.put('photo', { ...p.data, remote: false }, p.id); await DB.del(p.id); }
          continue;
        }
        if (p.data.type !== 'photo' || p.data.remote) continue;
        const b = await DB.blob.get(p.id); if (!b || !b.compressed) continue;
        const { error } = await client.storage.from('photos').upload(path, b.compressed, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' });
        if (error) throw error;
        await DB.blob.update(p.id, { uploaded: true });
        await DB.patch(p.id, 'photo', { remote: true });
      }
      // push the "remote:true" flags just written
      const again = await DB.dirty();
      if (again.length) {
        const rows = again.map(r => ({ id: r.id, kind: r.kind, data: r.data, updated_at: r.updatedAt, deleted: !!r.deleted }));
        const { error } = await client.rpc('upsert_records', { fid: familyId, rows }); if (error) throw error;
        await DB.markClean(again);
      }
      // 3) pull (cursor on server time, 2-minute overlap to survive concurrent commits)
      let since = await DB.meta.get('lastPull', null); let cursor = since;
      const from = since ? new Date(Date.parse(since) - 120000).toISOString() : '1970-01-01T00:00:00Z';
      for (let page = 0; page < 200; page++) {
        const { data, error } = await client.from('records').select('id,kind,data,updated_at,deleted,server_updated_at')
          .eq('family_id', familyId).gt('server_updated_at', from).order('server_updated_at', { ascending: true }).range(page * 1000, page * 1000 + 999);
        if (error) throw error;
        for (const row of data) {
          if (await DB.applyIncoming({ id: row.id, kind: row.kind, data: row.data, updatedAt: new Date(row.updated_at).toISOString(), deleted: row.deleted })) pulled++;
          if (!cursor || row.server_updated_at > cursor) cursor = row.server_updated_at;
        }
        if (data.length < 1000) break;
      }
      if (cursor) await DB.meta.set('lastPull', cursor);
      await DB.meta.set('lastSync', new Date().toISOString());
      if (pulled) { await Child.load(); Bus.emit('remote', pulled); }
      subscribe();
    } catch (e) {
      lastError = e.message || String(e); console.warn('sync', e);
    } finally { running = false; Bus.emit('sync', state()); }
    return state();
  }
  const soon = debounce(() => run(), 3000);
  async function downloadPhoto(id) {
    if (!client || !session || !familyId || !navigator.onLine) return null;
    const { data, error } = await client.storage.from('photos').download(`${familyId}/${id}.jpg`);
    return error ? null : data;
  }
  async function storageUsed() {
    if (client && session && familyId && navigator.onLine) {
      const { data, error } = await client.rpc('storage_used', { fid: familyId });
      if (!error) return { bytes: Number(data), source: 'server' };
    }
    const recs = await DB.list('photo');
    return { bytes: recs.filter(p => p.remote).reduce((a, p) => a + (p.size || 0), 0), source: 'local estimate' };
  }

  Bus.on('change', () => soon());
  window.addEventListener('online', () => { Bus.emit('sync', state()); soon(); });
  window.addEventListener('offline', () => Bus.emit('sync', state()));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) soon(); });
  setInterval(() => run(), 5 * 60 * 1000);

  return { init, run, state, saveConfig, clearConfig, getConfig, signIn, signUp, magicLink, signOut, verifyPassword, invite, cancelInvite, members, downloadPhoto, storageUsed, keyRole };
})();
