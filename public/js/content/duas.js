/* ============ DUAS & SHORT SURAHS for little ones ============
 Short everyday duas (Arabic, transliteration, Bangla meaning) and the short surahs children learn first.
 Audio is the parents' own recitation (Play → Voices → “Duas & surahs”); without one, only the Bangla
 meaning is read aloud — Arabic is never spoken by the robot voice. Surahs are listed by name and meaning;
 recite them together from your own copy of the Qur'an. */
const DUAS = [
  { id: 'bismillah', ic: '🌱', en: 'Before anything', bn: 'শুরু করার আগে', ar: 'بِسْمِ اللَّهِ', tr: 'Bismillah', mBn: 'আল্লাহর নামে শুরু করছি।', mEn: 'In the name of Allah.' },
  { id: 'salam', ic: '👋', en: 'Greeting', bn: 'সালাম', ar: 'السَّلَامُ عَلَيْكُمْ', tr: 'Assalamu alaikum', mBn: 'তোমার উপর শান্তি বর্ষিত হোক।', mEn: 'Peace be upon you.' },
  { id: 'eat', ic: '🍽️', en: 'Forgot Bismillah at a meal', bn: 'খাওয়ার মাঝে মনে পড়লে', ar: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ', tr: 'Bismillahi awwalahu wa akhirahu', mBn: 'শুরুতে ও শেষে আল্লাহর নামে।', mEn: 'In the name of Allah, at its beginning and its end.' },
  { id: 'aftereat', ic: '😋', en: 'After eating', bn: 'খাওয়ার পরে', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', tr: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin", mBn: 'সব প্রশংসা আল্লাহর, যিনি আমাদের খাইয়েছেন, পান করিয়েছেন এবং মুসলিম বানিয়েছেন।', mEn: 'Praise be to Allah who fed us, gave us drink and made us Muslims.' },
  { id: 'alhamdulillah', ic: '🙏', en: 'Thank you, Allah', bn: 'শুকরিয়া', ar: 'الْحَمْدُ لِلَّهِ', tr: 'Alhamdulillah', mBn: 'সব প্রশংসা আল্লাহর।', mEn: 'All praise is for Allah.' },
  { id: 'subhanallah', ic: '✨', en: 'Something wonderful', bn: 'সুন্দর কিছু দেখলে', ar: 'سُبْحَانَ اللَّهِ', tr: 'Subhanallah', mBn: 'আল্লাহ পবিত্র ও মহান।', mEn: 'Glory be to Allah.' },
  { id: 'sleep', ic: '😴', en: 'Before sleeping', bn: 'ঘুমানোর আগে', ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', tr: 'Bismika Allahumma amutu wa ahya', mBn: 'হে আল্লাহ, তোমার নামেই আমি ঘুমাই ও জেগে উঠি।', mEn: 'In Your name, O Allah, I die and I live.' },
  { id: 'wake', ic: '🌅', en: 'Waking up', bn: 'ঘুম থেকে উঠে', ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', tr: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", mBn: 'সব প্রশংসা আল্লাহর, যিনি ঘুমের পর আমাদের জাগিয়েছেন, আর তাঁর কাছেই ফিরে যাব।', mEn: 'Praise be to Allah who gave us life after sleep, and to Him is the return.' },
  { id: 'leave', ic: '🚪', en: 'Leaving home', bn: 'ঘর থেকে বের হতে', ar: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ', tr: "Bismillahi tawakkaltu 'alallah", mBn: 'আল্লাহর নামে বের হলাম, আল্লাহর উপর ভরসা করলাম।', mEn: 'In the name of Allah, I trust in Allah.' },
  { id: 'parents', ic: '👨‍👩‍👦', en: 'For Abbu & Ammu', bn: 'বাবা-মায়ের জন্য', ar: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', tr: 'Rabbir-hamhuma kama rabbayani saghira', mBn: 'হে আমার রব, তাঁদের প্রতি দয়া করো, যেমন তাঁরা ছোটবেলায় আমাকে লালন-পালন করেছেন।', mEn: 'My Lord, have mercy on them as they raised me when I was small.' },
  { id: 'ilm', ic: '📚', en: 'To learn more', bn: 'জ্ঞানের জন্য', ar: 'رَبِّ زِدْنِي عِلْمًا', tr: "Rabbi zidni 'ilma", mBn: 'হে আমার রব, আমার জ্ঞান বাড়িয়ে দাও।', mEn: 'My Lord, increase me in knowledge.' }
];
const SURAHS = [
  { id: 'fatiha', ic: '📖', en: 'Al-Fatiha', bn: 'সূরা আল-ফাতিহা', mBn: 'কুরআনের শুরু — আল্লাহর প্রশংসা আর সঠিক পথের জন্য দোয়া।', mEn: 'The Opening — praise of Allah and a prayer for the right path.' },
  { id: 'ikhlas', ic: '☝️', en: 'Al-Ikhlas', bn: 'সূরা আল-ইখলাস', mBn: 'আল্লাহ এক, তাঁর মতো কেউ নেই।', mEn: 'Allah is One; there is none like Him.' },
  { id: 'falaq', ic: '🌄', en: 'Al-Falaq', bn: 'সূরা আল-ফালাক', mBn: 'সব রকম অনিষ্ট থেকে ভোরের রবের কাছে আশ্রয় চাওয়া।', mEn: 'Seeking refuge with the Lord of daybreak from every harm.' },
  { id: 'nas', ic: '🤲', en: 'An-Nas', bn: 'সূরা আন-নাস', mBn: 'মানুষের রবের কাছে কুমন্ত্রণা থেকে আশ্রয় চাওয়া।', mEn: 'Seeking refuge with the Lord of mankind from whispered evil.' },
  { id: 'kawthar', ic: '💧', en: 'Al-Kawthar', bn: 'সূরা আল-কাওসার', mBn: 'আল্লাহর দেওয়া অফুরন্ত কল্যাণের জন্য শুকরিয়া।', mEn: 'Thanks for the abundant good Allah has given.' }
];
// fixed lines the games speak — recorded once in Voices, they replace the robot voice everywhere (key T:<text>)
const GAME_LINES = [
  ['Yes! Well done!', 'en-US'], ['সাবাশ! খুব ভালো হয়েছে!', 'bn-BD'], ['How many stars?', 'en-US'], ['কয়টি তারা?', 'bn-BD'],
  ['Peekaboo!', 'en-US'], ['It is in your garden now!', 'en-US'], ['চলো খেলি!', 'bn-BD'], ['চলো, এবার বাইরে খেলি!', 'bn-BD'], ['এবার বাইরে খেলার সময় হয়ে এলো', 'bn-BD']
];
