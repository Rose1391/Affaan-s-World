/* ============ Backup now / Restore (one ZIP: all records + all photo/video files) ============
 affaans-world-backup-YYYY-MM-DD.zip
   manifest.json            { app, format, exportedAt, child, records:[…incl. deletions] }
   media/<id>.original.<ext> original file as picked
   media/<id>.jpg           compressed copy (what syncs)
   media/<id>.thumb.jpg     thumbnail
   README.txt */
const Backup = (() => {
  const extOf = mime => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/heic': 'heic', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' }[mime] || (mime || 'bin').split('/')[1] || 'bin');
  async function exportZip(say = () => { }) {
    say('Collecting records…');
    const records = await DB.allRecords();
    const entries = [];
    const manifest = { app: 'affaans-world', format: 5, exportedAt: new Date().toISOString(), child: { name: Child.name, birth: Child.birth },
      records: records.map(r => ({ id: r.id, kind: r.kind, data: r.data, updatedAt: r.updatedAt, deleted: !!r.deleted })), media: [] };
    for (const r of records.filter(r => r.kind === 'photo' && !r.deleted)) {
      const b = await DB.blob.get(r.id); if (!b) continue;
      const m = { id: r.id, type: b.type, mime: b.mime };
      if (b.original) { m.original = `media/${r.id}.original.${extOf(b.original.type || b.mime)}`; m.originalMime = b.original.type || b.mime; entries.push({ name: m.original, data: b.original }); }
      if (b.compressed) { m.compressed = `media/${r.id}.jpg`; entries.push({ name: m.compressed, data: b.compressed }); }
      if (b.thumb) { m.thumb = `media/${r.id}.thumb.jpg`; entries.push({ name: m.thumb, data: b.thumb }); }
      manifest.media.push(m);
    }
    entries.unshift({ name: 'manifest.json', data: JSON.stringify(manifest) },
      { name: 'README.txt', data: `Affaan's World backup — ${new Date().toLocaleString()}\n${records.filter(r => !r.deleted).length} records, ${manifest.media.length} photos/videos.\nRestore: open the app → Settings → Backup → Restore… and pick this ZIP.\nPhotos are in /media (originals are the *.original.* files).\n` });
    const zip = await Zip.create(entries, (i, n) => say(`Packing ${i}/${n}…`));
    const name = `affaans-world-backup-${todayISO()}.zip`;
    downloadBlob(zip, name);
    await DB.meta.set('lastBackup', new Date().toISOString());
    say(`✓ ${name} — ${fmtBytes(zip.size)}. Save it somewhere safe (computer / Drive).`);
    return { size: zip.size, name, records: manifest.records.length, media: manifest.media.length };
  }
  async function restoreZip(file, say = () => { }) {
    say('Reading ZIP…');
    const z = await Zip.read(file);
    const mf = z.get('manifest.json'); if (!mf) throw new Error('This is not an Affaan\'s World backup (no manifest.json)');
    const m = JSON.parse(await mf.text()); if (m.app !== 'affaans-world') throw new Error('Unknown backup format');
    let photos = 0, i = 0;
    for (const md of m.media || []) {
      say(`Restoring photos ${++i}/${m.media.length}…`);
      const existing = await DB.blob.get(md.id);
      if (existing && existing.original) continue;
      const get = async (path, type) => path && z.get(path) ? new Blob([await (await z.get(path).blob()).arrayBuffer()], { type }) : null;
      const original = md.original ? await get(md.original, md.originalMime || md.mime) : null;
      const compressed = await get(md.compressed, 'image/jpeg'), thumb = await get(md.thumb, 'image/jpeg');
      await DB.blob.put({ ...(existing || {}), id: md.id, type: md.type, mime: md.mime, original: original || existing?.original || null, compressed: compressed || existing?.compressed || null, thumb: thumb || existing?.thumb || null, uploaded: existing?.uploaded || false });
      Media.forget(md.id); photos++;
    }
    say('Merging records…'); let records = 0;
    for (const r of m.records || []) if (await DB.applyIncoming(r, true)) records++;
    Bus.emit('change', null);
    say(`✓ Restored ${records} records and ${photos} photos/videos from ${file.name}`);
    return { records, photos };
  }
  return { exportZip, restoreZip };
})();
