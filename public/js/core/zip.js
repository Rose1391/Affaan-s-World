/* ============ minimal ZIP writer/reader (no dependencies) ============
 Writer stores files uncompressed (photos are already compressed); file bytes stay as
 Blob references so large backups don't sit in JS memory. Reader handles stored and
 deflated entries (via DecompressionStream) so a re-zipped backup also restores. */
const Zip = (() => {
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(buf, crc = 0) { crc = ~crc >>> 0; for (let i = 0; i < buf.length; i++) crc = CRC[(crc ^ buf[i]) & 255] ^ (crc >>> 8); return ~crc >>> 0; }
  const enc = new TextEncoder();
  function dosTime(d) { return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() }; }

  // entries: [{name, data: Blob|string}]
  async function create(entries, onProgress) {
    const parts = [], central = []; let offset = 0; const { time, date } = dosTime(new Date());
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const blob = typeof e.data === 'string' ? new Blob([e.data]) : e.data;
      const crc = crc32(new Uint8Array(await blob.arrayBuffer()));
      const name = enc.encode(e.name), size = blob.size;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(lh.buffer, name, blob);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(ch.buffer, name);
      offset += 30 + name.length + size;
      if (onProgress) onProgress(i + 1, entries.length);
    }
    const cdSize = central.reduce((a, p) => a + (p.byteLength ?? p.length), 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
  }

  // returns Map name → {size, blob(): Promise<Blob>, text(): Promise<string>}
  async function read(file) {
    const tailLen = Math.min(file.size, 65557);
    const tail = new DataView(await file.slice(file.size - tailLen).arrayBuffer());
    let eocd = -1; for (let i = tailLen - 22; i >= 0; i--) if (tail.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('Not a ZIP file');
    const count = tail.getUint16(eocd + 10, true), cdSize = tail.getUint32(eocd + 12, true), cdOff = tail.getUint32(eocd + 16, true);
    const cd = new DataView(await file.slice(cdOff, cdOff + cdSize).arrayBuffer());
    const dec = new TextDecoder(); const out = new Map(); let p = 0;
    for (let i = 0; i < count; i++) {
      if (cd.getUint32(p, true) !== 0x02014b50) throw new Error('Corrupt ZIP');
      const method = cd.getUint16(p + 10, true), comp = cd.getUint32(p + 20, true), size = cd.getUint32(p + 24, true);
      const nl = cd.getUint16(p + 28, true), xl = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true), lho = cd.getUint32(p + 42, true);
      const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nl));
      p += 46 + nl + xl + cl;
      const getBlob = async () => {
        const lh = new DataView(await file.slice(lho, lho + 30).arrayBuffer());
        const start = lho + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
        const raw = file.slice(start, start + comp);
        if (method === 0) return raw;
        if (method === 8 && 'DecompressionStream' in window) return new Response(raw.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
        throw new Error('Unsupported compression in ' + name);
      };
      out.set(name, { size, blob: getBlob, text: async () => (await getBlob()).text() });
    }
    return out;
  }
  return { create, read, crc32 };
})();
