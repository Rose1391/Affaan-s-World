// ============ CONTENT LIBRARY for Rehbar Learning ============

// Small inline SVG icon paths per area (use with stroke=currentColor)
window.AREA_ICONS = {
  "Language": '<path d="M4 5h16v10H8l-4 4V5z"/><path d="M8 9h8M8 12h5"/>',
  "Numbers": '<path d="M9 4v16M15 4v16M4 9h16M4 15h16"/>',
  "Colours & Shapes": '<circle cx="8" cy="9" r="4"/><rect x="12" y="11" width="8" height="8" rx="1"/>',
  "Motor": '<circle cx="12" cy="6" r="2"/><path d="M6 12a6 6 0 0 1 12 0M12 12v8M8 20h8"/>',
  "Sensory": '<path d="M12 3C7 8 5 11 5 14a7 7 0 0 0 14 0c0-3-2-6-7-11z"/>',
  "Nature": '<path d="M12 22V8M12 8c0-3 2-5 5-5 0 3-2 5-5 5zM12 12c0-3-2-5-5-5 0 3 2 5 5 5z"/>',
  "Music": '<circle cx="7" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M10 18V5l10-2v11"/>',
  "Character": '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>'
};

// ---------- DAILY SPARK ACTIVITIES ----------
window.ACTIVITIES = [
  {id:"l1",title:"Name five things",area:"Language",ageMin:18,mins:5,what:"Walk around a room and name five objects together, pointing at each. Ask him to point back when you say the word.",why:"Labeling builds vocabulary fast at this age — the more words he hears, the wider his lexicon grows."},
  {id:"l2",title:"Picture book chat",area:"Language",ageMin:12,mins:10,what:"Read one picture book, but pause to ask 'What's this?' and 'What is the dog doing?' instead of just reading straight.",why:"Dialogic reading — asking questions while reading — boosts language more than passive reading."},
  {id:"l3",title:"Body parts song",area:"Language",ageMin:15,mins:5,what:"Touch and name head, shoulders, knees, toes, eyes, ears. Sing it if you know the tune.",why:"Links words to his own body — embodied learning sticks best for toddlers."},
  {id:"l4",title:"Two-word echo",area:"Language",ageMin:20,mins:5,what:"When he says one word ('dog'), expand it back: 'Yes, a big dog!' Model slightly longer phrases.",why:"Gentle expansion nudges him from single words toward phrases — the next language milestone."},
  {id:"l5",title:"Animal sounds",area:"Language",ageMin:12,mins:5,what:"Go through 4-5 animals and make their sounds together. Ask 'What does the cow say?'",why:"Sound-word pairing is playful early phonological practice and builds recall."},
  {id:"l6",title:"Name the feeling",area:"Language",ageMin:22,mins:5,what:"When he's happy, sad, or cross, name it: 'You feel frustrated.' Keep it calm and simple.",why:"Emotional vocabulary early is the foundation of self-regulation and emotional intelligence."},
  {id:"n1",title:"Count the stairs",area:"Numbers",ageMin:18,mins:5,what:"Count out loud each step as you climb stairs together, 1 to 10.",why:"Rote counting in daily routines builds number sense long before formal maths."},
  {id:"n2",title:"Stack and count",area:"Numbers",ageMin:18,mins:10,what:"Stack blocks and count them as they go up: one, two, three. Knock down and start again.",why:"Ties numbers to a physical quantity — the beginning of understanding amounts."},
  {id:"n3",title:"One for you, one for me",area:"Numbers",ageMin:20,mins:5,what:"Hand out snacks or toys one at a time saying 'one for you, one for me'.",why:"Introduces one-to-one correspondence, a core early-maths concept."},
  {id:"n4",title:"How many fingers?",area:"Numbers",ageMin:22,mins:5,what:"Hold up 1, 2, 3 fingers and count them. Ask him to copy with his own fingers.",why:"Finger counting links quantity to his own hands — a natural early calculator."},
  {id:"n5",title:"Big and small",area:"Numbers",ageMin:20,mins:5,what:"Compare two objects: 'This ball is big, this one is small.' Let him pick the big one.",why:"Comparison and size words are early quantitative reasoning."},
  {id:"c1",title:"Colour hunt",area:"Colours & Shapes",ageMin:20,mins:10,what:"Pick one colour for the day. Find five red things around the house together.",why:"Focusing on one colour at a time prevents overwhelm and cements the label."},
  {id:"c2",title:"Shape sorting",area:"Colours & Shapes",ageMin:20,mins:10,what:"Sort round things and square things into two piles. Name each shape.",why:"Sorting is early categorisation — a thinking skill, not just shape naming."},
  {id:"c3",title:"Circle everywhere",area:"Colours & Shapes",ageMin:22,mins:5,what:"Spot circles around you: clock, plate, wheel, ball. Trace them with a finger.",why:"Recognising one shape in many contexts builds abstract pattern recognition."},
  {id:"c4",title:"Colour matching",area:"Colours & Shapes",ageMin:22,mins:10,what:"Match socks or blocks by colour into pairs.",why:"Matching sharpens visual discrimination — a pre-reading skill."},
  {id:"m1",title:"Crayon scribbles",area:"Motor",ageMin:18,mins:10,what:"Give him a chunky crayon and paper. Let him scribble freely — no rules.",why:"Free scribbling builds the grip and control that later becomes writing."},
  {id:"m2",title:"Pour and fill",area:"Motor",ageMin:18,mins:10,what:"In the bath or a tray, pour water between two cups.",why:"Pouring develops hand-eye coordination and an intuitive sense of volume."},
  {id:"m3",title:"Sticker peeling",area:"Motor",ageMin:20,mins:10,what:"Let him peel stickers and place them on paper.",why:"Peeling builds the fine pincer grip essential for later pencil control."},
  {id:"m4",title:"Ball roll and catch",area:"Motor",ageMin:15,mins:10,what:"Sit facing each other and roll a ball back and forth.",why:"Turn-taking plus gross motor coordination — social and physical at once."},
  {id:"m5",title:"Jump and stomp",area:"Motor",ageMin:22,mins:5,what:"Jump together, stomp like an elephant, tiptoe like a mouse.",why:"Varied movement builds balance, body awareness, and burns happy energy."},
  {id:"s1",title:"Texture basket",area:"Sensory",ageMin:15,mins:10,what:"Gather soft, rough, smooth, bumpy objects. Feel each and name the texture.",why:"Sensory exploration builds descriptive vocabulary and neural connections."},
  {id:"s2",title:"Water play",area:"Sensory",ageMin:15,mins:15,what:"A tub of water with cups and toys. Let him splash, scoop, and explore.",why:"Open-ended sensory play encourages experimentation and calm focus."},
  {id:"s3",title:"Smell test",area:"Sensory",ageMin:22,mins:5,what:"Smell an orange, some mint, a flower. Talk about each smell.",why:"Engaging a less-used sense broadens sensory vocabulary and attention."},
  {id:"nt1",title:"Sound walk",area:"Nature",ageMin:18,mins:15,what:"Walk outside and stop to listen. What sounds do you hear? Birds, cars, wind?",why:"Listening on purpose builds attention and connects him to the world around him."},
  {id:"nt2",title:"Collect leaves",area:"Nature",ageMin:20,mins:15,what:"Gather a few leaves or stones. Sort by size or colour at home.",why:"Combines nature, collection, and sorting — curiosity in action."},
  {id:"nt3",title:"Watch the sky",area:"Nature",ageMin:22,mins:5,what:"Lie back and watch clouds or birds. Wonder aloud: 'Where is that bird going?'",why:"Modelling wonder teaches him that questions are exciting, not just answers."},
  {id:"mu1",title:"Clap the rhythm",area:"Music",ageMin:15,mins:5,what:"Clap a simple pattern and have him copy it. Start with two claps.",why:"Rhythm imitation builds memory, pattern sense, and early maths intuition."},
  {id:"mu2",title:"Pot drum band",area:"Music",ageMin:15,mins:10,what:"Give him a pot and spoon. Play loud, soft, fast, slow together.",why:"Exploring loud/soft and fast/slow is early understanding of contrast and control."},
  {id:"mu3",title:"Sing and pause",area:"Music",ageMin:20,mins:5,what:"Sing a familiar song but pause before the last word so he fills it in.",why:"Filling the gap shows memory and anticipation — and it's joyful."},
  {id:"ch1",title:"Say thank you",area:"Character",ageMin:20,mins:3,what:"Model 'thank you' when he gives you something, and prompt gently when he receives.",why:"Gratitude modelled daily becomes a habit long before he understands the word."},
  {id:"ch2",title:"Help tidy up",area:"Character",ageMin:20,mins:5,what:"Put toys away together, singing a tidy-up song. Praise the helping, not speed.",why:"Small responsibilities build a sense of agency and belonging."},
  {id:"ch3",title:"Gentle hands",area:"Character",ageMin:18,mins:3,what:"Practise soft touches with a pet or sibling: 'gentle hands'. Praise gentleness.",why:"Early empathy and self-control grow from these tiny, repeated moments."}
];

// ---------- READ TOGETHER: recommended shelf ----------
window.BOOKS = [
  {title:"Dear Zoo", author:"Rod Campbell", ageMin:12, tag:"Lift-the-flap", note:"Flaps and animals — perfect for little hands and naming."},
  {title:"Brown Bear, Brown Bear", author:"Bill Martin Jr.", ageMin:12, tag:"Rhythm", note:"Repetitive, colourful, sing-song. Builds colour and animal words."},
  {title:"The Very Hungry Caterpillar", author:"Eric Carle", ageMin:15, tag:"Counting", note:"Counting, days of the week, and food — gentle early numbers."},
  {title:"Goodnight Moon", author:"Margaret Wise Brown", ageMin:12, tag:"Bedtime", note:"A calm bedtime ritual that builds naming and routine."},
  {title:"Where's Spot?", author:"Eric Hill", ageMin:15, tag:"Lift-the-flap", note:"Hide-and-seek flaps teach prepositions: under, behind, in."},
  {title:"Press Here", author:"Hervé Tullet", ageMin:24, tag:"Interactive", note:"He presses dots and turns the page to see magic — cause and effect."},
  {title:"We're Going on a Bear Hunt", author:"Michael Rosen", ageMin:24, tag:"Rhythm", note:"Movement and sounds to act out together — language plus motor."},
  {title:"The Gruffalo", author:"Julia Donaldson", ageMin:30, tag:"Story", note:"A rhyming story with a clever twist — for slightly older listening."}
];

// ---------- LEARNING PLAY: mini-games ----------
window.GAMES = [
  {id:"colourtap", title:"Colour Tap", area:"Colours & Shapes", ageMin:20, desc:"A colour is named — tap the matching circle. Builds colour recognition."},
  {id:"countstars", title:"Count the Stars", area:"Numbers", ageMin:22, desc:"Count how many stars appear, then tap the right number. Early counting."},
  {id:"soundmatch", title:"Animal Match", area:"Language", ageMin:18, desc:"Find the two matching animals. Vocabulary and memory."}
];

// ---------- RESOURCES: parent tips grouped into sub-sections ----------
window.RESOURCES = {
  "Daily Rhythm": [
    {title:"The 3 things that matter most now", body:"At this age, three habits outweigh everything else: talking to him constantly (narrate your day), reading aloud daily, and giving him unstructured play. No app or flashcard beats these. Everything in Rehbar supports them, not replaces them."},
    {title:"Screen time and toddlers", body:"Leading paediatric guidance (AAP) recommends avoiding solo screen use under 2, and keeping it minimal and co-viewed after. That's why this app is for YOU — a planning and tracking companion — not something to hand to Affaan. His screen is the world around him."},
    {title:"Why routines help him learn", body:"Predictable daily rhythms (meals, naps, a bedtime book) lower his stress and free his brain to learn. You don't need a rigid schedule — just a familiar shape to the day."}
  ],
  "Language & Reading": [
    {title:"Narrate everything", body:"Talk through what you're doing: 'Now we're washing the red apple.' This flood of words, tied to real objects, is the biggest driver of vocabulary. Describe, ask, and pause for his response."},
    {title:"How to read aloud well", body:"Don't just read the words — point, ask 'what's that?', make the sounds, and let him turn the pages. Re-reading the same book many times is good, not boring; repetition is how he masters it."},
    {title:"The power of hearing words", body:"Children who hear far more words in early years tend to arrive at school with real advantages. The good news: ordinary chatter counts. You build his mind just by talking with him."}
  ],
  "Play & Development": [
    {title:"Why play IS the learning", body:"For toddlers, play isn't a break from learning — it is the learning. Stacking, pouring, sorting, and pretend all build real cognitive skills. Provide simple materials and join in, rather than directing."},
    {title:"Let him struggle a little", body:"When a puzzle piece won't fit, resist jumping in instantly. A few seconds of productive struggle builds persistence and problem-solving — worth far more long-term than being 'ahead'."},
    {title:"Follow his curiosity", body:"Notice what he returns to — wheels, water, animals, music. Leaning into his current fascination is more powerful than a fixed curriculum. Depth of interest is what elite universities later reward."}
  ],
  "The Long Road": [
    {title:"Character over credentials", body:"Harvard and MIT reject thousands with perfect scores. They seek genuine intellectual passion, initiative, kindness, and resilience — traits that grow from a childhood rich in love, curiosity, and small responsibilities, not early cramming."},
    {title:"Protect his love of learning", body:"Guard above all that learning stays joyful. Pressure and drilling in early years can quietly kill curiosity. Keep it light; a child who loves to learn will climb any mountain later, in sha' Allah."},
    {title:"You are the curriculum", body:"No app, school, or programme shapes him as much as you do — your words, your patience, your example. Rehbar is just a helper. The real work, and the real joy, is the time you spend together."}
  ]
};
