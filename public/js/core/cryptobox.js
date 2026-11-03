/* ============ password-protected backups: AES-256-GCM, key from PBKDF2-SHA256 (310k rounds), 4 MB chunks ============
 File layout:  "AFWENC1\n" · salt(16) · rounds(u32 LE) · chunkSize(u32 LE) · [ iv(12) · length(u32 LE) · ciphertext ]…
 Every chunk is authenticated, so a wrong password or a damaged file is detected, never silently restored. */
const CryptoBox = (() => {
  const MAGIC = new TextEncoder().encode('AFWENC1\n'), CHUNK = 4 * 1024 * 1024, ROUNDS = 310000;
  async function key(pw, salt, rounds) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: rounds }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  const u32 = n => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
  async function encrypt(blob, pw, onProgress) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), k = await key(pw, salt, ROUNDS);
    const parts = [MAGIC, salt, u32(ROUNDS), u32(CHUNK)];
    for (let off = 0; off < blob.size; off += CHUNK) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, await blob.slice(off, off + CHUNK).arrayBuffer()));
      parts.push(iv, u32(ct.length), ct); onProgress && onProgress(Math.min(1, (off + CHUNK) / blob.size));
    }
    return new Blob(parts, { type: 'application/octet-stream' });
  }
  async function isEncrypted(file) { const h = new Uint8Array(await file.slice(0, 8).arrayBuffer()); return h.every((b, i) => b === MAGIC[i]); }
  async function decrypt(file, pw, onProgress) {
    const head = new DataView(await file.slice(8, 32).arrayBuffer());
    const salt = new Uint8Array(await file.slice(8, 24).arrayBuffer()), rounds = head.getUint32(16, true);
    const k = await key(pw, salt, rounds), out = []; let off = 32;
    while (off < file.size) {
      const iv = new Uint8Array(await file.slice(off, off + 12).arrayBuffer()), len = new DataView(await file.slice(off + 12, off + 16).arrayBuffer()).getUint32(0, true);
      try { out.push(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, await file.slice(off + 16, off + 16 + len).arrayBuffer())); }
      catch (e) { throw new Error(out.length ? 'The backup file is damaged' : 'Wrong password for this backup'); }
      off += 16 + len; onProgress && onProgress(off / file.size);
    }
    return new Blob(out, { type: 'application/zip' });
  }
  return { encrypt, decrypt, isEncrypted };
})();
