/* Doctor's view: fetch the summary from the family's private, time-limited link and show it. No app, no account. */
(async () => {
  const doc = document.getElementById('doc');
  document.getElementById('printBtn').onclick = () => window.print();
  const url = decodeURIComponent(location.hash.slice(1));
  const fail = (t, s) => { doc.innerHTML = `<div class="msg"><h1>${t}</h1><p>${s}</p></div>`; };
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/sign\//.test(url)) return fail('This link is incomplete', 'Ask the family to send the link again.');
  try {
    const r = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!r.ok) return fail('This link has expired', 'Shared summaries stay open for 7 days. Ask the family for a fresh link.');
    const parsed = new DOMParser().parseFromString(await r.text(), 'text/html');
    parsed.querySelectorAll('script,iframe,object,embed,link,meta,base,form').forEach(e => e.remove());
    parsed.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name); }));
    doc.innerHTML = '';
    parsed.querySelectorAll('style').forEach(s => document.head.appendChild(s));
    const wrap = document.createElement('div'); wrap.style.padding = '0 20px';
    while (parsed.body.firstChild) wrap.appendChild(parsed.body.firstChild);
    doc.appendChild(wrap);
    document.title = (parsed.title || 'Health summary') + ' · shared privately';
  } catch (e) { fail('Could not open the summary', 'Check the internet connection and try again.'); }
})();
