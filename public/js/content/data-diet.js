// ============ DIET + HEALTH CONTENT (bilingual) ============
// Transcribed & adapted from the dietician's charts (CMH, Dhaka).
// NOTE for parents: general guidance, not a substitute for your paediatrician.

window.DIET = {
  measures: {
    en: "1 cup = 250 g · 1 glass = 200 g · 1 tsp = 5 g · 1 tbsp = 15 g",
    bn: "১ বাটি = ২৫০ গ্রাম · ১ গ্লাস = ২০০ গ্রাম · ১ চা-চামচ = ৫ গ্রাম · ১ টেবিল চামচ = ১৫ গ্রাম"
  },
  groups: [
    {
      id: "g23",
      titleEn: "Diet for Kids · 2 to 3 years",
      titleBn: "শিশু খাদ্য ও পথ্য · ২৫–৩৬ মাস",
      color: "#3F9A5F",
      // A sample day plan (adapted to the 2–3 yr chart)
      schedule: [
        {timeEn:"Morning", timeBn:"সকাল", en:"Milk / soup / suji / sago — 1 cup, or mother's milk.", bn:"দুধ / স্যুপ / সুজি / সাগু — ১ কাপ, অথবা মায়ের দুধ।", emoji:"🥛"},
        {timeEn:"Breakfast (7:30–8:30)", timeBn:"সকালের নাস্তা (৭:৩০–৮:৩০)", en:"Rice/khichuri with dal + chicken + soft veggies in a little oil — 1 cup/bowl.", bn:"চাল/ভাত + ডাল + মুরগির মাংস + তেলে নরম সবজি দিয়ে খিচুড়ি — ১ কাপ/বাটি।", emoji:"🍲"},
        {timeEn:"Mid-morning (10:00–10:30)", timeBn:"মধ্য সকাল (১০:০০–১০:৩০)", en:"Milk, soup or puffed rice — 1 cup + almond powder 1 tsp.", bn:"দুধ বা স্যুপ বা মুড়ি — ১ কাপ + বাদামের গুঁড়া ১ চা-চামচ।", emoji:"🥣"},
        {timeEn:"Noon (12:00)", timeBn:"দুপুরের আগে (১২:০০)", en:"Fruit / fruit juice — 1, biscuits — 2, coconut water — 1 glass.", bn:"ফল / ফলের রস — ১টি, বিস্কুট — ২টি, ডাবের পানি — ১ গ্লাস।", emoji:"🍎"},
        {timeEn:"Lunch (1:30–2:00)", timeBn:"দুপুরের খাবার (১:৩০–২:০০)", en:"Rice + dal + liver/fish/meat + soft leafy veggies in oil — 1 cup/bowl.", bn:"চাল + ডাল + কলিজা/মাছ/মাংস + তেলে নরম শাক-সবজি — ১ কাপ/বাটি।", emoji:"🍛"},
        {timeEn:"Afternoon (4:00)", timeBn:"বিকালের নাস্তা (৪:০০)", en:"Biscuits — 2 & fruit/juice — 1, or milk — 1 cup/glass.", bn:"বিস্কুট — ২টি ও ফল/রস — ১টি, বা দুধ — ১ কাপ/গ্লাস।", emoji:"🍪"},
        {timeEn:"Evening (5:30–6:00)", timeBn:"সন্ধ্যার নাস্তা (৫:৩০–৬:০০)", en:"Soup / noodles / payesh / suji / sago — 1 cup.", bn:"স্যুপ / নুডলস / পায়েস / সুজি / সাগু — ১ কাপ।", emoji:"🍜"},
        {timeEn:"Dinner (8:00–8:30)", timeBn:"রাতের খাবার (৮:০০–৮:৩০)", en:"Rice + dal + fish/meat + soft veggies in oil — 1 cup/bowl.", bn:"চাল/ভাত + ডাল + মাছ/মাংস + তেলে নরম সবজি — ১ কাপ/বাটি।", emoji:"🍲"},
        {timeEn:"Night (10:00–10:30)", timeBn:"রাত (১০:০০–১০:৩০)", en:"Milk / soup / suji / sago — 1 cup, or mother's milk.", bn:"দুধ / স্যুপ / সুজি / সাগু — ১ কাপ, অথবা মায়ের দুধ।", emoji:"🥛"}
      ],
      tips: [
        {en:"Give at least three heavy, nutrient-rich meals (1 bowl each) daily.", bn:"প্রতিদিন কমপক্ষে তিন বেলা ১ বাটি করে পুষ্টিসমৃদ্ধ ভারী খাবার দিন।"},
        {en:"Between meals, 2–3 nutritious snacks: ripe fruit or juice, noodles, egg, milk, soup, suji, sago, oats, semai, muri, chira, biscuits, cake.", bn:"ভারী খাবারের ফাঁকে ২–৩ বার পুষ্টিকর নাস্তা: পাকা ফল/রস, নুডলস, ডিম, দুধ, স্যুপ, সুজি, সাগু, ওটস, সেমাই, মুড়ি, চিড়া, বিস্কুট, কেক।"},
        {en:"Food should always be soft, easy to digest, and to the child's liking.", bn:"খাবার সবসময় নরম, সহজপাচ্য ও শিশুর পছন্দমতো হতে হবে।"},
        {en:"After age 2, stop breastfeeding.", bn:"দুই বছর বয়সের পর বুকের দুধ খাওয়ানো বন্ধ করতে হবে।"},
        {en:"Iron & iodine foods: fish, meat, egg, liver, nut powder, oats, jaggery, small fish, sea fish, milk, green & red leafy veg, pumpkin, papaya, coconut water.", bn:"আয়রন ও আয়োডিন: মাছ, মাংস, ডিম, কলিজা, বাদামের গুঁড়া, ওটস, গুড়, ছোট মাছ, সামুদ্রিক মাছ, দুধ, কচু/লাল শাক, মিষ্টি কুমড়া, পেঁপে, ডাবের পানি।"},
        {en:"Vitamin A & C: carrot, red spinach, ripe pumpkin, sweet potato, ripe tomato, papaya, orange, guava, lemon, amra, jujube.", bn:"ভিটামিন এ ও সি: গাজর, লালশাক, পাকা মিষ্টি কুমড়া, মিষ্টি আলু, পাকা টমেটো, পেঁপে, কমলা, পেয়ারা, লেবু, আমড়া, জাম্বুরা।"},
        {en:"Calcium & Vitamin D: milk, yoghurt, chhana, small fish, egg yolk, sunlight.", bn:"ক্যালসিয়াম ও ভিটামিন ডি: দুধ, দই, ছানা, ছোট মাছ, ডিমের কুসুম, সূর্যের আলো।"},
        {en:"Include one animal-protein food and one seasonal fruit every day.", bn:"প্রতিদিন একটি প্রাণিজ প্রোটিন ও একটি মৌসুমি ফল রাখুন।"},
        {en:"Cook colourful (yellow, red, green) veggies with a little oil.", bn:"রঙিন (হলুদ, লাল, সবুজ) শাক-সবজি অল্প তেলে রান্না করে খাওয়ান।"},
        {en:"Avoid soft drinks and too many sweets/chocolate — they harm teeth.", bn:"কোমল পানীয় ও অতিরিক্ত মিষ্টি/চকলেট এড়িয়ে চলুন — এতে দাঁতের ক্ষয় হয়।"}
      ],
      care: [
        {en:"For loose stools/diarrhoea: rice starch, boiled raw banana, boiled potato, coconut water, rice water, banana, apple puree, rice soup, oral saline.", bn:"পাতলা পায়খানা/ডায়রিয়া হলে: আতপ চালের জাউ, সেদ্ধ কাঁচকলা, আলু সেদ্ধ, ডাবের পানি, ভাতের মাড়, কলা, আপেল পিউরি, রাইস স্যুপ, খাবার স্যালাইন।"},
        {en:"Any new food may cause mild vomiting or loose stool — nothing to fear.", bn:"নতুন খাবারে হালকা বমি বা পাতলা পায়খানা হতে পারে, ভয়ের কিছু নেই।"},
        {en:"Never force or frighten a child to eat — encourage and praise gently.", bn:"জোর করে বা ভয় দেখিয়ে খাওয়ানো যাবে না — উৎসাহ ও প্রশংসা করে খাওয়ান।"},
        {en:"Encourage self-feeding by hand.", bn:"শিশুকে নিজ হাতে খেতে উৎসাহিত করুন।"},
        {en:"Wash hands before and after eating.", bn:"খাবার আগে ও পরে হাত ধোয়ার অভ্যাস করান।"}
      ]
    },
    {
      id: "g12",
      titleEn: "Diet for Toddlers · around 2 years",
      titleBn: "শিশু খাদ্য · প্রায় ২ বছর",
      color: "#2F6DB5",
      schedule: [
        {timeEn:"Morning", timeBn:"সকাল", en:"Mother's milk or milk — 1 cup.", bn:"মায়ের দুধ বা দুধ — ১ কাপ।", emoji:"🥛"},
        {timeEn:"Breakfast (7:30–8:30)", timeBn:"সকালের নাস্তা (৭:৩০–৮:৩০)", en:"Soft khichuri: rice + dal + chicken + a little oil + soft veg — ¾ cup.", bn:"নরম খিচুড়ি: চাল + ডাল + মুরগি + অল্প তেল + নরম সবজি — ¾ কাপ।", emoji:"🍲"},
        {timeEn:"Mid-morning (10:30)", timeBn:"মধ্য সকাল (১০:৩০)", en:"Mashed ripe fruit (banana/papaya) or milk — ½ cup.", bn:"চটকানো পাকা ফল (কলা/পেঁপে) বা দুধ — ½ কাপ।", emoji:"🍌"},
        {timeEn:"Lunch (1:00–2:00)", timeBn:"দুপুরের খাবার (১:০০–২:০০)", en:"Soft rice + dal + mashed fish/egg + soft veggies — ¾ cup.", bn:"নরম ভাত + ডাল + চটকানো মাছ/ডিম + নরম সবজি — ¾ কাপ।", emoji:"🍛"},
        {timeEn:"Afternoon (4:00)", timeBn:"বিকাল (৪:০০)", en:"Milk — 1 cup + 1 soft biscuit, or suji/payesh.", bn:"দুধ — ১ কাপ + ১টি নরম বিস্কুট, বা সুজি/পায়েস।", emoji:"🍮"},
        {timeEn:"Dinner (7:30–8:00)", timeBn:"রাতের খাবার (৭:৩০–৮:০০)", en:"Soft khichuri or rice + dal + fish/meat + soft veg — ¾ cup.", bn:"নরম খিচুড়ি বা ভাত + ডাল + মাছ/মাংস + নরম সবজি — ¾ কাপ।", emoji:"🍲"},
        {timeEn:"Night", timeBn:"রাত", en:"Mother's milk or milk — 1 cup.", bn:"মায়ের দুধ বা দুধ — ১ কাপ।", emoji:"🥛"}
      ],
      tips: [
        {en:"Offer small amounts often — a toddler's tummy is small.", bn:"অল্প অল্প করে বারবার খাওয়ান — শিশুর পেট ছোট।"},
        {en:"Keep everything soft and mashed; avoid whole nuts and hard chunks (choking).", bn:"সব খাবার নরম ও চটকানো রাখুন; আস্ত বাদাম ও শক্ত টুকরা এড়িয়ে চলুন (গলায় আটকানোর ঝুঁকি)।"},
        {en:"One animal protein (egg/fish/meat/liver) and one fruit daily.", bn:"প্রতিদিন একটি প্রাণিজ প্রোটিন (ডিম/মাছ/মাংস/কলিজা) ও একটি ফল।"},
        {en:"Add a little oil/ghee for energy and brain growth.", bn:"শক্তি ও মস্তিষ্ক বিকাশে অল্প তেল/ঘি যোগ করুন।"},
        {en:"Continue breastfeeding until age 2 alongside meals.", bn:"২ বছর পর্যন্ত খাবারের পাশাপাশি বুকের দুধ চালিয়ে যান।"},
        {en:"Iodine, Omega-3 & DHA foods help brain development.", bn:"সুস্থ শরীর ও মেধা বিকাশে আয়োডিন, ওমেগা-৩ ও DHA যুক্ত খাবার দিন।"}
      ],
      care: [
        {en:"For diarrhoea: coconut water, rice water, banana, apple puree, oral saline.", bn:"ডায়রিয়ায়: ডাবের পানি, ভাতের মাড়, কলা, আপেল পিউরি, খাবার স্যালাইন।"},
        {en:"Introduce one new food at a time; a little fussiness is normal.", bn:"একবারে একটি নতুন খাবার দিন; সামান্য অনীহা স্বাভাবিক।"},
        {en:"Never force-feed; make mealtime calm and happy.", bn:"জোর করে খাওয়াবেন না; খাওয়ার সময় শান্ত ও আনন্দময় রাখুন।"}
      ]
    }
  ],
  // reference charts (images from the dietician)
  charts: [
    {src:"./img/diet-guide.jpg", captionEn:"Full guidance — Diet for Kids (2–3 years)", captionBn:"পূর্ণ নির্দেশিকা — শিশু খাদ্য (২–৩ বছর)"},
    {src:"./img/diet-plan.jpg", captionEn:"Diet plan template (from CMH dietician)", captionBn:"পথ্য পরিকল্পনা ছক (সিএমএইচ ডায়েটিশিয়ান)"}
  ]
};

// Health & Milestones tag palette (for the special journal)
window.HEALTH_TAGS = {
  "Health": {color:"#E8604C", emoji:"🩺", labelBn:"স্বাস্থ্য"},
  "Growth": {color:"#3F9A5F", emoji:"📏", labelBn:"বৃদ্ধি"},
  "Milestone": {color:"#2F6DB5", emoji:"⭐", labelBn:"মাইলফলক"},
  "Achievement": {color:"#F2A93B", emoji:"🏆", labelBn:"অর্জন"},
  "Vaccine": {color:"#7A5FB5", emoji:"💉", labelBn:"টিকা"},
  "Life moment": {color:"#C6538C", emoji:"💛", labelBn:"স্মরণীয় মুহূর্ত"}
};
