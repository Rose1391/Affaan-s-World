// ============ AFFAAN'S WORLD — LEARNING CONTENT (English + বাংলা) ============

// ---------- ENGLISH LETTERS ----------
window.LETTERS_EN = [
["A","Apple","🍎"],["B","Ball","⚽"],["C","Cat","🐱"],["D","Dog","🐶"],["E","Elephant","🐘"],
["F","Fish","🐟"],["G","Grapes","🍇"],["H","Hat","🎩"],["I","Ice cream","🍦"],["J","Juice","🧃"],
["K","Kite","🪁"],["L","Lion","🦁"],["M","Moon","🌙"],["N","Nest","🪺"],["O","Orange","🍊"],
["P","Penguin","🐧"],["Q","Queen","👑"],["R","Rainbow","🌈"],["S","Sun","☀️"],["T","Tiger","🐯"],
["U","Umbrella","☂️"],["V","Violin","🎻"],["W","Watch","⌚"],["X","Xylophone","🎵"],["Y","Yo-yo","🪀"],["Z","Zebra","🦓"]
];

// ---------- BANGLA VOWELS (স্বরবর্ণ) ----------
window.BN_VOWELS = [
["অ","অজগর","🐍"],["আ","আম","🥭"],["ই","ইঁদুর","🐭"],["ঈ","ঈগল","🦅"],["উ","উট","🐫"],
["ঊ","ঊষা","🌅"],["ঋ","ঋষি","🧘"],["এ","একতারা","🪕"],["ঐ","ঐরাবত","🐘"],["ও","ওল","🍠"],["ঔ","ঔষধ","💊"]
];

// ---------- BANGLA CONSONANTS (ব্যঞ্জনবর্ণ) ----------
window.BN_CONS = [
["ক","কলা","🍌"],["খ","খরগোশ","🐰"],["গ","গরু","🐄"],["ঘ","ঘড়ি","⏰"],["ঙ","ব্যাঙ","🐸"],
["চ","চাঁদ","🌙"],["ছ","ছাতা","☂️"],["জ","জাহাজ","🚢"],["ঝ","ঝিনুক","🐚"],["ঞ","মিঞা","🐱"],
["ট","টমেটো","🍅"],["ঠ","ঠোঁট","👄"],["ড","ডিম","🥚"],["ঢ","ঢোল","🥁"],["ণ","হরিণ","🦌"],
["ত","তারা","⭐"],["থ","থালা","🍽️"],["দ","দাঁত","🦷"],["ধ","ধান","🌾"],["ন","নৌকা","⛵"],
["প","পাখি","🐦"],["ফ","ফুল","🌸"],["ব","বই","📖"],["ভ","ভালুক","🐻"],["ম","মাছ","🐟"],
["য","যন্ত্র","⚙️"],["র","রকেট","🚀"],["ল","লেবু","🍋"],["শ","শাপলা","🪷"],["ষ","ষাঁড়","🐂"],
["স","সূর্য","☀️"],["হ","হাতি","🐘"]
];

// ---------- NUMBERS 1–10 ----------
window.NUMBERS = [
{en:"1", bn:"১", wEn:"One", wBn:"এক", emoji:"🍎", objEn:"apple", objBn:"আপেল"},
{en:"2", bn:"২", wEn:"Two", wBn:"দুই", emoji:"🐤", objEn:"chicks", objBn:"ছানা"},
{en:"3", bn:"৩", wEn:"Three", wBn:"তিন", emoji:"🎈", objEn:"balloons", objBn:"বেলুন"},
{en:"4", bn:"৪", wEn:"Four", wBn:"চার", emoji:"⭐", objEn:"stars", objBn:"তারা"},
{en:"5", bn:"৫", wEn:"Five", wBn:"পাঁচ", emoji:"🌸", objEn:"flowers", objBn:"ফুল"},
{en:"6", bn:"৬", wEn:"Six", wBn:"ছয়", emoji:"🍓", objEn:"strawberries", objBn:"স্ট্রবেরি"},
{en:"7", bn:"৭", wEn:"Seven", wBn:"সাত", emoji:"🐟", objEn:"fish", objBn:"মাছ"},
{en:"8", bn:"৮", wEn:"Eight", wBn:"আট", emoji:"🦋", objEn:"butterflies", objBn:"প্রজাপতি"},
{en:"9", bn:"৯", wEn:"Nine", wBn:"নয়", emoji:"🍊", objEn:"oranges", objBn:"কমলা"},
{en:"10", bn:"১০", wEn:"Ten", wBn:"দশ", emoji:"🐞", objEn:"ladybugs", objBn:"লেডিবাগ"}
];

// ---------- COLOURS ----------
window.COLORS_L = [
{en:"Red", bn:"লাল", hex:"#E23B3B", emoji:"🍎"},
{en:"Blue", bn:"নীল", hex:"#2F6DB5", emoji:"🐳"},
{en:"Green", bn:"সবুজ", hex:"#3F9A5F", emoji:"🌿"},
{en:"Yellow", bn:"হলুদ", hex:"#F2C038", emoji:"🌻"},
{en:"Orange", bn:"কমলা", hex:"#EE8434", emoji:"🍊"},
{en:"Purple", bn:"বেগুনি", hex:"#8455B2", emoji:"🍇"},
{en:"Pink", bn:"গোলাপি", hex:"#E86FA4", emoji:"🌸"},
{en:"Brown", bn:"বাদামি", hex:"#8B5A3C", emoji:"🐻"},
{en:"Black", bn:"কালো", hex:"#2B2B2B", emoji:"🐈‍⬛"},
{en:"White", bn:"সাদা", hex:"#F4F1E8", emoji:"🕊️", dark:true}
];

// ---------- SHAPES ----------
window.SHAPES_L = [
{en:"Circle", bn:"বৃত্ত", svg:'<circle cx="50" cy="50" r="38"/>' , emoji:"⚽"},
{en:"Square", bn:"বর্গ", svg:'<rect x="14" y="14" width="72" height="72" rx="6"/>', emoji:"🎁"},
{en:"Triangle", bn:"ত্রিভুজ", svg:'<polygon points="50,12 90,86 10,86"/>', emoji:"⛺"},
{en:"Rectangle", bn:"আয়তক্ষেত্র", svg:'<rect x="8" y="26" width="84" height="48" rx="6"/>', emoji:"📱"},
{en:"Star", bn:"তারা", svg:'<polygon points="50,8 61,38 94,38 67,58 77,90 50,70 23,90 33,58 6,38 39,38"/>', emoji:"⭐"},
{en:"Heart", bn:"হৃদয়", svg:'<path d="M50 88 C20 62 8 44 16 28 C24 12 44 14 50 30 C56 14 76 12 84 28 C92 44 80 62 50 88z"/>', emoji:"❤️"}
];

// ---------- OUR WORLD ----------
window.WORLD = {
"Animals · পশু": {color:"#3F9A5F", icon:"🦁", items:[
  ["Lion","সিংহ","🦁"],["Tiger","বাঘ","🐯"],["Elephant","হাতি","🐘"],["Cow","গরু","🐄"],
  ["Goat","ছাগল","🐐"],["Monkey","বানর","🐵"],["Rabbit","খরগোশ","🐰"],["Deer","হরিণ","🦌"],
  ["Bear","ভালুক","🐻"],["Horse","ঘোড়া","🐴"],["Cat","বিড়াল","🐱"],["Dog","কুকুর","🐶"]]},
"Birds · পাখি": {color:"#2F6DB5", icon:"🦜", items:[
  ["Doyel","দোয়েল","🐦"],["Parrot","টিয়া","🦜"],["Peacock","ময়ূর","🦚"],["Owl","পেঁচা","🦉"],
  ["Duck","হাঁস","🦆"],["Hen","মুরগি","🐔"],["Eagle","ঈগল","🦅"],["Crow","কাক","🐦‍⬛"],
  ["Penguin","পেঙ্গুইন","🐧"],["Swan","রাজহাঁস","🦢"]]},
"Fish · মাছ": {color:"#1B7F8E", icon:"🐟", items:[
  ["Hilsa","ইলিশ","🐟"],["Goldfish","সোনালি মাছ","🐠"],["Shark","হাঙর","🦈"],["Whale","তিমি","🐋"],
  ["Octopus","অক্টোপাস","🐙"],["Crab","কাঁকড়া","🦀"],["Shrimp","চিংড়ি","🦐"],["Dolphin","ডলফিন","🐬"],
  ["Turtle","কচ্ছপ","🐢"],["Starfish","তারামাছ","⭐"]]},
"Flowers · ফুল": {color:"#C6538C", icon:"🌸", items:[
  ["Water lily (Shapla)","শাপলা","🪷"],["Rose","গোলাপ","🌹"],["Sunflower","সূর্যমুখী","🌻"],
  ["Marigold","গাঁদা","🏵️"],["Tulip","টিউলিপ","🌷"],["Hibiscus","জবা","🌺"],
  ["Lotus","পদ্ম","🪷"],["Daisy","ডেইজি","🌼"]]},
"Nature · প্রকৃতি": {color:"#7A5FB5", icon:"🌈", items:[
  ["Sun","সূর্য","☀️"],["Moon","চাঁদ","🌙"],["Star","তারা","⭐"],["Rain","বৃষ্টি","🌧️"],
  ["Rainbow","রংধনু","🌈"],["Tree","গাছ","🌳"],["Mountain","পাহাড়","⛰️"],["River","নদী","🏞️"],
  ["Sea","সাগর","🌊"],["Cloud","মেঘ","☁️"],["Flower","ফুল","🌸"],["Leaf","পাতা","🍃"]]}
};

// ---------- GREAT PEOPLE ----------
window.PEOPLE = {
"History · ইতিহাস": [
 {n:"Sheikh Mujibur Rahman", bn:"শেখ মুজিবুর রহমান", e:"🇧🇩", c:"#0A6847",
  dEn:"The Father of the Nation of Bangladesh. He led our people to independence in 1971. He loved Bangladesh and its people deeply.",
  dBn:"বাংলাদেশের জাতির পিতা। ১৯৭১ সালে তিনি আমাদের স্বাধীনতার পথ দেখান। তিনি দেশ ও মানুষকে গভীরভাবে ভালোবাসতেন।"},
 {n:"Begum Rokeya", bn:"বেগম রোকেয়া", e:"📚", c:"#8455B2",
  dEn:"A brave writer who opened schools for girls when very few could study. She taught that education makes everyone strong.",
  dBn:"একজন সাহসী লেখিকা, যিনি মেয়েদের জন্য স্কুল খুলেছিলেন। তিনি শিখিয়েছেন, শিক্ষাই সবাইকে শক্তিশালী করে।"},
 {n:"Ibn Sina (Avicenna)", bn:"ইবনে সিনা", e:"⚕️", c:"#1B7F8E",
  dEn:"A great doctor and thinker from long ago. His medicine books taught the world for hundreds of years.",
  dBn:"অনেক আগের একজন মহান চিকিৎসক ও চিন্তাবিদ। তাঁর চিকিৎসার বই শত শত বছর পৃথিবীকে শিখিয়েছে।"}],
"Writers · সাহিত্য": [
 {n:"Rabindranath Tagore", bn:"রবীন্দ্রনাথ ঠাকুর", e:"✍️", c:"#B0632F",
  dEn:"A world-famous poet who wrote our national anthem. He won the Nobel Prize for his beautiful poems and songs.",
  dBn:"বিশ্বখ্যাত কবি, আমাদের জাতীয় সংগীতের রচয়িতা। সুন্দর কবিতা ও গানের জন্য তিনি নোবেল পুরস্কার পান।"},
 {n:"Kazi Nazrul Islam", bn:"কাজী নজরুল ইসলাম", e:"🎵", c:"#C0392B",
  dEn:"Our national poet, called the Rebel Poet. His songs and poems are full of courage, love, and fairness for all.",
  dBn:"আমাদের জাতীয় কবি, বিদ্রোহী কবি। তাঁর গান ও কবিতা সাহস, ভালোবাসা আর ন্যায়ের কথা বলে।"}],
"Science · বিজ্ঞান": [
 {n:"Albert Einstein", bn:"আলবার্ট আইনস্টাইন", e:"🔬", c:"#4A5FA5",
  dEn:"A scientist with big ideas about light, time, and space. He said imagination is even more important than knowledge.",
  dBn:"আলো, সময় ও মহাকাশ নিয়ে বড় ভাবনার বিজ্ঞানী। তিনি বলতেন, কল্পনা জ্ঞানের চেয়েও গুরুত্বপূর্ণ।"},
 {n:"Neil Armstrong", bn:"নিল আর্মস্ট্রং", e:"🚀", c:"#4B4E6D",
  dEn:"The first human to walk on the Moon in 1969. One small step for him, a giant leap for everyone.",
  dBn:"১৯৬৯ সালে চাঁদে হাঁটা প্রথম মানুষ। তাঁর ছোট্ট এক পা ছিল মানবজাতির বিশাল অগ্রযাত্রা।"},
 {n:"Dr. Muhammad Yunus", bn:"ড. মুহাম্মদ ইউনূস", e:"🕊️", c:"#0A6847",
  dEn:"A Bangladeshi Nobel Peace Prize winner. He helped poor families with tiny loans so they could build better lives.",
  dBn:"নোবেল শান্তি পুরস্কারজয়ী বাংলাদেশি। ক্ষুদ্রঋণ দিয়ে তিনি গরিব পরিবারগুলোকে ভালো জীবন গড়তে সাহায্য করেন।"}],
"Sports · খেলা": [
 {n:"Shakib Al Hasan", bn:"সাকিব আল হাসান", e:"🏏", c:"#0A6847",
  dEn:"One of the best cricket all-rounders in the world, from Bangladesh. He bats and bowls brilliantly.",
  dBn:"বাংলাদেশের গর্ব, বিশ্বের সেরা অলরাউন্ডারদের একজন। ব্যাট ও বলে সমান পারদর্শী।"},
 {n:"Lionel Messi", bn:"লিওনেল মেসি", e:"⚽", c:"#75AADB",
  dEn:"A football magician from Argentina who won the World Cup. He shows that practice and love for the game work wonders.",
  dBn:"আর্জেন্টিনার ফুটবল জাদুকর, বিশ্বকাপজয়ী। অনুশীলন আর খেলার প্রতি ভালোবাসাই তাঁর জাদু।"}]
};

// ---------- STORIES (bilingual, illustrated pages) ----------
window.STORIES = [
{id:"crow", kind:"Story · গল্প", color:"#1B7F8E", cover:"🐦🏺",
 tEn:"The Thirsty Crow", tBn:"তৃষ্ণার্ত কাক",
 pages:[
  {art:"☀️🐦💧", en:"One hot day, a thirsty crow flew far and wide looking for water.", bn:"এক গরমের দিনে, এক তৃষ্ণার্ত কাক পানির খোঁজে অনেক দূর উড়ে গেল।"},
  {art:"🐦👀🏺", en:"At last he found a pot. But the water was at the very bottom. His beak could not reach!", bn:"অবশেষে সে একটি কলসি পেল। কিন্তু পানি ছিল একেবারে নিচে। তার ঠোঁট পৌঁছাল না!"},
  {art:"🐦🪨🏺", en:"The clever crow had an idea. He dropped small stones into the pot, one by one.", bn:"চালাক কাকটির মাথায় বুদ্ধি এল। সে ছোট ছোট পাথর কলসিতে ফেলতে লাগল, একটার পর একটা।"},
  {art:"💧⬆️🐦", en:"The water rose up and up. The crow drank happily and flew away.", bn:"পানি উঠে এল ওপরে। কাকটি খুশি মনে পানি খেয়ে উড়ে গেল।"},
  {art:"⭐🧠⭐", en:"Lesson: Where there is a will, there is a way!", bn:"শিক্ষা: ইচ্ছা থাকলে উপায় হয়!"}]},
{id:"hare", kind:"Story · গল্প", color:"#3F9A5F", cover:"🐰🐢",
 tEn:"The Hare and the Tortoise", tBn:"খরগোশ ও কচ্ছপ",
 pages:[
  {art:"🐰😄🐢", en:"A hare laughed at a slow tortoise. 'Let us race!' said the tortoise calmly.", bn:"এক খরগোশ ধীর কচ্ছপকে দেখে হাসল। কচ্ছপ শান্তভাবে বলল, 'চলো দৌড় প্রতিযোগিতা হোক!'"},
  {art:"🏁🐰💨", en:"The hare ran fast, far ahead. 'I have plenty of time,' he said, and slept under a tree.", bn:"খরগোশ দৌড়ে অনেক এগিয়ে গেল। 'আমার অনেক সময় আছে,' বলে সে গাছের নিচে ঘুমিয়ে পড়ল।"},
  {art:"🐢🐢🐢", en:"The tortoise walked on slowly, steadily, never stopping.", bn:"কচ্ছপ ধীরে ধীরে, একটানা হেঁটে চলল, একবারও থামল না।"},
  {art:"🐢🏁🎉", en:"When the hare woke up, the tortoise had already won the race!", bn:"খরগোশ যখন জাগল, কচ্ছপ ততক্ষণে জিতে গেছে!"},
  {art:"⭐🐢⭐", en:"Lesson: Slow and steady wins the race.", bn:"শিক্ষা: ধীর ও স্থির থাকলেই জয় আসে।"}]},
{id:"rhymes", kind:"Poem · ছড়া", color:"#7A5FB5", cover:"🌙⭐",
 tEn:"Twinkle & Chand Mama", tBn:"টুইঙ্কেল ও চাঁদ মামা",
 pages:[
  {art:"⭐✨⭐", en:"Twinkle, twinkle, little star, how I wonder what you are!", bn:"টুইঙ্কেল টুইঙ্কেল ছোট্ট তারা, তুমি কী, ভাবি সারা!"},
  {art:"🌍⬆️💎", en:"Up above the world so high, like a diamond in the sky.", bn:"পৃথিবীর অনেক উঁচুতে, হীরার মতো আকাশেতে।"},
  {art:"🌙👴🍚", en:"আয় আয় চাঁদ মামা, টিপ দিয়ে যা।", bn:"Come, come, Uncle Moon, put a dot on baby's forehead!"},
  {art:"👶🌙💛", en:"চাঁদের কপালে চাঁদ, টিপ দিয়ে যা।", bn:"A moon-dot for our little moon — a kiss of light from the sky."}]},
{id:"bd", kind:"History · ইতিহাস", color:"#0A6847", cover:"🇧🇩🪷",
 tEn:"Our Bangladesh", tBn:"আমাদের বাংলাদেশ",
 pages:[
  {art:"🇧🇩💚❤️", en:"Our flag is green like our fields, with a red circle like the rising sun.", bn:"আমাদের পতাকা মাঠের মতো সবুজ, মাঝে লাল বৃত্ত — উদিত সূর্যের মতো।"},
  {art:"🐯🪷🐦", en:"Our national animal is the Royal Bengal Tiger, our flower is the Shapla, our bird is the Doyel.", bn:"আমাদের জাতীয় পশু রয়েল বেঙ্গল টাইগার, ফুল শাপলা, পাখি দোয়েল।"},
  {art:"🗣️📖✊", en:"In 1952, brave people gave their lives for our sweet Bangla language. The world remembers them on 21 February.", bn:"১৯৫২ সালে সাহসী মানুষেরা আমাদের মিষ্টি বাংলা ভাষার জন্য জীবন দেন। ২১শে ফেব্রুয়ারি বিশ্ব তাঁদের স্মরণ করে।"},
  {art:"🌾🏞️😊", en:"Bangladesh is a land of rivers, green fields, and kind hearts. We love our country!", bn:"বাংলাদেশ নদী, সবুজ মাঠ আর ভালো মানুষের দেশ। আমরা আমাদের দেশকে ভালোবাসি!"}]},
{id:"football", kind:"Sports · খেলা", color:"#2F6DB5", cover:"⚽🥅",
 tEn:"The Magic of Football", tBn:"ফুটবলের জাদু",
 pages:[
  {art:"⚽👟🥅", en:"Football is the world's favourite game. Two teams try to kick the ball into the goal.", bn:"ফুটবল পৃথিবীর সবচেয়ে প্রিয় খেলা। দুই দল বলকে গোলে পাঠানোর চেষ্টা করে।"},
  {art:"🏃🤝🏃", en:"Players pass the ball to each other. Teamwork makes the goal!", bn:"খেলোয়াড়রা একে অপরকে বল পাস দেয়। দলবদ্ধ চেষ্টাতেই গোল হয়!"},
  {art:"🏆🌍🎉", en:"Every four years, countries play the World Cup — the greatest show on Earth.", bn:"প্রতি চার বছরে দেশগুলো বিশ্বকাপ খেলে — পৃথিবীর সবচেয়ে বড় উৎসব।"},
  {art:"⚽❤️😊", en:"Playing makes us strong, happy, and good friends.", bn:"খেলা আমাদের শক্তিশালী, আনন্দিত আর ভালো বন্ধু করে তোলে।"}]},
{id:"seed", kind:"Nature · প্রকৃতি", color:"#B0632F", cover:"🌱🌳",
 tEn:"The Little Seed", tBn:"ছোট্ট বীজ",
 pages:[
  {art:"🌱🌧️☀️", en:"A little seed slept in the soil. Rain gave it water, the sun gave it warmth.", bn:"একটি ছোট্ট বীজ মাটিতে ঘুমিয়ে ছিল। বৃষ্টি দিল পানি, সূর্য দিল ওম।"},
  {art:"🌱⬆️🍃", en:"Slowly, slowly it woke up and pushed out a tiny green leaf.", bn:"ধীরে ধীরে সে জেগে উঠল, বের করল ছোট্ট একটি সবুজ পাতা।"},
  {art:"🌳🐦🍎", en:"Days passed. It grew into a big tree, giving shade, fruit, and a home for birds.", bn:"দিন গেল। সে বড় গাছ হলো — ছায়া, ফল আর পাখিদের বাসা দিল।"},
  {art:"⭐🌳⭐", en:"Lesson: Great things grow from small beginnings — just like you!", bn:"শিক্ষা: ছোট থেকেই বড় কিছু হয় — ঠিক তোমার মতো!"}]}
];
