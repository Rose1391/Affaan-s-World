/* ============ Dhaka time · Bangla calendar (Bangladesh, 2019 revision) · Hijri · seasons · special days ============ */
const Cal = (() => {
  const BN_MON = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  const BN_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SEASONS = [
    { k: 'grishmo', bn: 'গ্রীষ্ম', en: 'Grishmo · summer' }, { k: 'borsha', bn: 'বর্ষা', en: 'Borsha · monsoon' },
    { k: 'shorot', bn: 'শরৎ', en: 'Shorot · autumn' }, { k: 'hemonto', bn: 'হেমন্ত', en: 'Hemonto · harvest' },
    { k: 'sheet', bn: 'শীত', en: 'Sheet · winter' }, { k: 'boshonto', bn: 'বসন্ত', en: 'Boshonto · spring' }];
  const HM = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
  const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  // "now" on the Dhaka wall clock (UTC+6, no DST) as a plain Date whose UTC fields are Dhaka's
  const dhaka = (t = Date.now()) => new Date(t + 6 * 3600 * 1000);
  function dhakaParts(t = Date.now()) {
    const d = dhaka(t);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds() };
  }
  // Bangla date for a Gregorian calendar day: year starts 14 April; months 1–6 have 31 days,
  // 7–10 and 12 have 30, Falgun has 30 in a (Gregorian) leap year else 29 (2019 revision)
  function bangla(y, m, d) {
    const startY = (m > 3 || (m === 3 && d >= 14)) ? y : y - 1;
    let day = Math.round((Date.UTC(y, m, d) - Date.UTC(startY, 3, 14)) / 864e5);
    const len = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap(startY + 1) ? 30 : 29, 30]; let mo = 0;
    while (mo < 11 && day >= len[mo]) { day -= len[mo]; mo++; }
    return { d: day + 1, m: mo, y: startY - 593, month: BN_MON[mo], season: SEASONS[Math.floor(mo / 2)] };
  }
  let hijriFmt = null;
  function hijri(y, m, d) {
    try {
      if (!hijriFmt) {
        let cal = 'islamic-umalqura';
        try { new Intl.DateTimeFormat('en-u-ca-' + cal).format(new Date()); } catch (e) { cal = 'islamic'; }
        hijriFmt = new Intl.DateTimeFormat('en-u-ca-' + cal + '-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' });
      }
      const p = {}; hijriFmt.formatToParts(new Date(Date.UTC(y, m, d, 12))).forEach(x => p[x.type] = x.value);
      const mm = +p.month; return { d: +p.day, m: mm, y: String(p.year).replace(/\D/g, ''), month: HM[mm - 1] || p.month };
    } catch (e) { return null; }
  }
  // special days (Hijri ones are calculated; Bangladesh moon sighting can differ by a day)
  function special(y, m, d, h, birth) {
    const b = birth ? parseDate(birth) : null;
    if (b && b.getMonth() === m && b.getDate() === d) return { k: 'birthday', en: 'Happy birthday, ' + Child.first() + '!', bn: 'শুভ জন্মদিন!' };
    const md = (m + 1) * 100 + d;
    if (md === 414) return { k: 'boishakh', en: 'Shubho Noboborsho · Pohela Boishakh', bn: 'শুভ নববর্ষ' };
    if (md === 221) return { k: 'ekushe', en: 'Ekushe February · Language Martyrs’ Day', bn: 'অমর একুশে' };
    if (md === 326) return { k: 'flag', en: 'Independence Day', bn: 'স্বাধীনতা দিবস' };
    if (md === 1216) return { k: 'flag', en: 'Victory Day', bn: 'বিজয় দিবস' };
    if (h && h.m === 10 && h.d <= 3) return { k: 'eid', en: 'Eid Mubarak · Eid al-Fitr', bn: 'ঈদ মোবারক' };
    if (h && h.m === 12 && h.d >= 10 && h.d <= 12) return { k: 'eid', en: 'Eid Mubarak · Eid al-Adha', bn: 'ঈদ মোবারক' };
    if (h && h.m === 9) return { k: 'ramadan', en: 'Ramadan Mubarak', bn: 'রমজান মোবারক' };
    return null;
  }
  function today() {
    const p = dhakaParts(), bd = bangla(p.y, p.m, p.d), h = hijri(p.y, p.m, p.d);
    const mins = p.h * 60 + p.mi;
    const phase = mins >= 300 && mins < 450 ? 'dawn' : mins >= 450 && mins < 960 ? 'day' : mins >= 960 && mins < 1110 ? 'dusk' : 'night';
    return { ...p, iso: `${p.y}-${pad2(p.m + 1)}-${pad2(p.d)}`, bd, hj: h, phase, special: special(p.y, p.m, p.d, h, Child.birth),
      en: `${EN_DAYS[p.wd]}, ${p.d} ${EN_MONTHS_LONG[p.m]} ${p.y}`, bnDay: BN_DAYS[p.wd] };
  }
  const greeting = (h = dhakaParts().h) => h < 5 ? ['Good night', 'শুভ রাত্রি'] : h < 12 ? ['Good morning', 'শুভ সকাল'] : h < 16 ? ['Good afternoon', 'শুভ দুপুর'] : h < 19 ? ['Good evening', 'শুভ সন্ধ্যা'] : ['Good night', 'শুভ রাত্রি'];
  const clock = (t = Date.now(), secs = true) => { const p = dhakaParts(t); const h12 = (p.h % 12) || 12; return `${h12}:${pad2(p.mi)}${secs ? ':' + pad2(p.s) : ''} ${p.h < 12 ? 'AM' : 'PM'}`; };
  return { bangla, hijri, today, greeting, clock, dhakaParts, BN_MON, SEASONS, EN_DAYS, BN_DAYS };
})();
