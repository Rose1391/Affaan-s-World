/* ============ Dhaka weather (Open-Meteo, free, no key) — cached for offline ============ */
const Weather = (() => {
  const URL_ = 'https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,apparent_temperature,weather_code,is_day,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=Asia%2FDhaka&forecast_days=7';
  const CODES = { 0: ['Clear', '☀️'], 1: ['Mostly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Cloudy', '☁️'], 45: ['Fog', '🌫️'], 48: ['Fog', '🌫️'], 51: ['Drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Drizzle', '🌦️'],
    61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 80: ['Showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Heavy showers', '⛈️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm', '⛈️'], 99: ['Thunderstorm', '⛈️'] };
  const desc = c => CODES[c] || ['—', '🌡️'];
  let cache = null, inflight = null;
  async function get(force = false) {
    if (!cache) cache = await DB.meta.get('weather', null);
    const fresh = cache && Date.now() - cache.at < 30 * 60 * 1000;
    if ((fresh && !force) || !navigator.onLine) return cache;
    if (!inflight) inflight = (async () => {
      try {
        const ctl = new AbortController(); setTimeout(() => ctl.abort(), 8000);
        const r = await fetch(URL_, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status);
        const j = await r.json();
        cache = { at: Date.now(), now: { t: Math.round(j.current.temperature_2m), feel: Math.round(j.current.apparent_temperature), code: j.current.weather_code, day: !!j.current.is_day },
          days: j.daily.time.map((d, i) => ({ date: d, hi: Math.round(j.daily.temperature_2m_max[i]), lo: Math.round(j.daily.temperature_2m_min[i]), rain: j.daily.precipitation_probability_max[i] ?? 0, uv: j.daily.uv_index_max[i] ?? 0, code: j.daily.weather_code[i] })) };
        await DB.meta.set('weather', cache); Bus.emit('weather', cache);
      } catch (e) { /* offline or blocked: keep the cached copy */ }
      inflight = null; return cache;
    })();
    return inflight;
  }
  // a parent-friendly tip for a toddler's day
  function tip(w) {
    if (!w || !w.days || !w.days[0]) return null;
    const d = w.days[0];
    if (d.rain >= 60) return ['Rain likely — plan indoor play, keep a towel ready', 'বৃষ্টির সম্ভাবনা — ঘরে খেলা'];
    if (d.hi >= 34) return ['Hot day — water often, play outside before 10 or after 4', 'গরম — বেশি পানি, সকাল-বিকেলে খেলা'];
    if (d.uv >= 8) return ['Strong sun (UV ' + Math.round(d.uv) + ') — hat and shade', 'কড়া রোদ — টুপি ও ছায়া'];
    if (d.lo <= 14) return ['Cool morning — a light jumper for him', 'ঠান্ডা সকাল — হালকা গরম কাপড়'];
    return ['Lovely weather for outside play', 'বাইরে খেলার চমৎকার আবহাওয়া'];
  }
  return { get, desc, tip };
})();
