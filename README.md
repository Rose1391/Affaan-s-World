# Affaan's World v5

A private, offline-first parent app for **Affaan Rehbar** (born 30 Sep 2024). It's a lifelong record vault and gallery, with a short "play together" corner.
**Live:** <https://affaans-world.vercel.app> (Vercel project `affaans-world`).
It’s a vanilla HTML/CSS/JS installable PWA with no framework and no build step. English + বাংলা throughout.

| Section | What's inside |
|---|---|
| **Home** | Exact age today (y/m/d, Bangla too), next milestone to watch, next vaccine, latest growth, latest photos, **＋ quick add** |
| **Play together** | 10/12/15-minute sessions in a locked-down kid mode with big targets. Content carried over from v4: bilingual letters (ABC, স্বরবর্ণ, ব্যঞ্জনবর্ণ), numbers, colours & shapes, 6 story readers, Our World, Great People, 3 games. The session ends on a **"Time to play outside!"** screen, and a grown-up must press and hold to leave. Also: Daily Spark, Books, Tips (off-screen ideas). No ads, no external links. |
| **Development** | CDC *Learn the Signs. Act Early.* checklists for 2 y, 30 m, 3 y, 4 y and 5 y, tagged Language / Movement / Social / Thinking, each with date achieved, note and photo. Growth log (weight, height, head) with charts and a WHO median reference. First words & skills log. Journal (the v4 Health & Milestones journal). |
| **Calendar** | Month grid in English and বাংলা, day agenda, upcoming countdowns, events, .ics export to the phone calendar |
| **Health** | Bangladesh EPI schedule with due and done dates (plus Vitamin A and deworming campaigns, and optional vaccines). Doctor visits, prescriptions and report photos, illnesses, and **Meals & Diet** (the v4 dietician plans and charts) |
| **Gallery & timeline** | Photos and videos by month, search by caption or tag, filter by month or tag, link to milestones. The timeline shows every event by date. |
| **Reports** | Monthly summary, a printable **paediatrician summary** (Print → Save as PDF), and the Learning report (the v4 progress report) |
| **Settings** | Child profile, sync and account, second-parent invite, storage used vs 1 GB, **Backup now / Restore**, PIN and auto-lock, voice check |

## What's new in v6 — EYE 3 standard: Emerald & Gold, alive and real-time
- **Opening show** (about 5.5 s, every time the app opens; any tap skips; can be turned off in Settings): a gold ring draws itself, a lotus mandala blooms, his photo appears, AFFAAN'S WORLD rises letter by letter in engraved gold, and a greeting ends it.
- **Living Home hero:**
  - His photo sits inside a revolving alpana lotus mandala, and the six section symbols ride its edge (tap one to open that section).
  - The sky follows the Dhaka hour (dawn, day, dusk, night with stars), with drifting clouds and live Dhaka weather (Open-Meteo; rain streaks or a heat glow).
  - Particles for the Bengali season fall in the background: golden paddy now in Hemonto, kash in Shorot, shimul petals in Boshonto.
  - Special days tint the hero: his birthday, Pohela Boishakh, Ekushe, Independence and Victory Days, Ramadan and the Eids.
  - The layers drift with your finger, and an engraved gold name catches a passing gleam.
  - A typed greeting shows **English, Bangla (বঙ্গাব্দ) and Hijri dates**, beside a live Dhaka clock and his age ticking to the second.
- **Home briefing:** three lines on development, health and memories, a Today strip (date, weather plus a toddler tip, today's and tomorrow's events, the next countdown), KPI cards that count up, and picture tiles with a **live animated object** and stat. The tiles tilt toward your finger with a gold sheen.
- **"On the horizon"** countdown rings: next birthday, EPI doses, milestone band, next event.
- **New Calendar section:** a month grid with Bangla day numbers, a day agenda across every record, a "Coming up" list, your own events (appointments, family, outings), and **.ics export** so the phone's calendar app reminds you.
- **Every section** has its own moving object (bouncing ball, growing sprout, beating heart with ECG, a real-time clock with an orbiting planet, a camera aperture, rising bars, turning gears), and a **gold mandala wipe** plays between sections.
- **Enterprise touches:**
  - **Live sync:** the other parent's edits appear within seconds (Supabase Realtime; RLS still applies).
  - **Ctrl/⌘+K search** across all records, plus quick actions.
  - **Undo** after a delete.
  - **Theme:** Emerald & Gold (night), Ivory & Gold (day), or follow the phone setting.
  - On desktop the nav becomes a floating dock.

## What's new in v5.1 — design & "baby attraction"
- **Eye 3 design language:** Fraunces display type with gold italics, Outfit body, mono numbers, and photo or patterned gradient heroes on every section (a nakshi-kantha–style gold motif), each section in its own tone. Also gold-ruled section heads, sticky pill tabs, a frosted nav with a gold border, and a new Home: age card, a countdown to his next birthday, Play and Gallery tiles, a "Watch next" area, a "Recently" timeline and "The story so far".
- **Kid mode rebuilt for a 2-year-old:**
  - **Doel**, the national bird, is his play buddy: it hops, blinks and chirps.
  - His own photo greets him, and the big 3D tiles wiggle.
  - Each tap sends a ⭐ flying into his star counter, and correct answers bring confetti and happy sounds (synthesized offline).
  - The "Time to play outside" screen celebrates the stars he earned.
  - Two new toddler games: **Bubble Pop**, where each bubble says its colour in English or বাংলা, and **Peekaboo**, where lifting the curtain reveals an animal named in both languages.
- Fonts are bundled in `public/fonts` (SIL OFL), so everything still works offline.

## How the data works

- **Offline first.** Everything lives in IndexedDB on the phone, and the app works with no internet. The service worker caches the whole app.
- **Sync (optional).** When online and signed in, records sync as rows in Supabase. Row Level Security limits access to the members of your family: you plus one invited parent.
- **Last edit wins.** Every record carries an edit timestamp, and the server only accepts an incoming row if it is newer (`upsert_records`).
- **Photos.** The original stays on the phone. A compressed copy (max 1600 px, about 150 KB JPEG) uploads to the **private** `photos` bucket. Videos stay on the device (they're in your backups) so they don't use up the 1 GB free tier. Settings shows the storage used.
- **Backup now.** This downloads one ZIP with all records plus every original photo and video (`manifest.json` + `media/`). **Restore** merges a ZIP back, and the newest edit wins for each record. It's a standard ZIP that opens on any computer.
- **PIN lock.** The PIN is asked for on open and after a chosen time in the background. It's stored only as a salted PBKDF2 hash on this phone. *Forgot PIN* lets you reset it with your account password, or erase the device and restore.
- **Audio fix (from v4).** The first tap (the PIN keypad) unlocks speech on mobile. Voices load asynchronously (`voiceschanged` plus polling), and the voice is picked at speak time. For Bangla speech, the phone needs a Bangla TTS voice: on Android go to Settings → Accessibility → Text-to-speech → Google → install Bangla; on iPhone go to Settings → Accessibility → Spoken Content → Voices → Bangla. **Settings → Sound** shows which voices the phone has.

```
public/
├─ index.html, css/app.css, manifest.webmanifest, sw.js, robots.txt
├─ config.js            ← Supabase URL + anon/publishable key (public by design; RLS protects data)
├─ vendor/supabase.js   ← supabase-js 2.118.0 UMD, vendored so it works offline
├─ js/core/             ← util, db (IndexedDB), sync, media (compression), zip, backup, lock (PIN), speech
├─ js/views/            ← play, dev, health, gallery, reports  (Home + Settings live in js/app.js)
├─ js/content/          ← learn.js, activities.js, data-diet.js (from v4) + health-data.js (CDC, EPI, WHO)
└─ img/, icons/
supabase/schema.sql     ← tables, RLS, RPCs, private bucket + storage policies
```

---

## 1. Supabase (free tier) — one time

> Already done for the project **"Affaan's World"** (`yteazojpoyxrvvvwvxky`): the schema is applied and `public/config.js` is filled in. Do these steps only if you set up a new project.

1. Go to <https://supabase.com> → **New project** (free plan). Pick a region near Dhaka, e.g. Singapore (`ap-southeast-1`).
2. Open **SQL Editor** → New query → paste all of `supabase/schema.sql` → **Run**. It's safe to re-run.
3. Under **Project Settings → API**, copy the **Project URL** and the **anon** (or `sb_publishable_…`) key into `public/config.js`.
   You can paste them in the app under Settings → Sync & account instead.
   **Never use the `service_role` / `sb_secret_` key.** The app refuses it.
4. Under **Authentication → URL Configuration**, set **Site URL** to your Vercel URL (`https://affaans-world.vercel.app`) and add it to the Redirect URLs. Confirmation and magic-link emails then come back to the app.
5. In the app: **Settings → Create account** with your email, confirm the email, then **Sign in**. The first account creates the family.
6. Second parent: under **Settings → Second parent**, enter their email and tap **Invite**. They install the app, open Settings and **Create account** with that exact email, and join automatically.
7. After both accounts exist, go to **Authentication → Sign In / Providers → Email** and turn off **Allow new users to sign up**. Strangers couldn't see your data anyway, but this keeps them out of your free quota.

## 2. GitHub

```bash
git clone https://github.com/Rose1391/Affaan-s-World.git
```

```bash
cd Affaan-s-World
```

After any change:

```bash
git add -A && git commit -m "Describe the change" && git push -u origin main
```

When you change app files, bump `VERSION` in `public/sw.js` (e.g. `affaan-v5.0.1`) so installed phones fetch the update.

## 3. Vercel

1. <https://vercel.com> → **Add New → Project** → import `Rose1391/Affaan-s-World`.
2. **Framework Preset: Other**. **Build Command: empty** (toggle the override on and leave it blank). **Output Directory: `public`**. Install command: empty.
3. **Deploy.** Every push to `main` redeploys automatically.
4. Under **Settings → Deployment Protection**, you can optionally turn on Vercel Authentication for an extra login in front of the app. `vercel.json` already sends `noindex`, a strict Content-Security-Policy and other security headers.

## 4. Install on the phones

Open the Vercel URL. On Android Chrome, tap ⋮ → **Install app**. On iPhone Safari, tap Share → **Add to Home Screen**.
Then create a PIN, sign in under Settings, and tap **Backup now** once a month.

## Run locally

```bash
npx serve public -l 3000
```

## Privacy notes

- The PIN guards the screen. Data on the phone sits in the browser's private storage and isn't encrypted at rest beyond what the phone itself does, so keep a screen lock on the phone too.
- The repo contains only code. Records and photos never go to GitHub or Vercel; they stay on the phones, in Supabase (private, RLS) and in your backup ZIPs.
- Milestones come from CDC "Learn the Signs. Act Early." (2022 checklists). The vaccine schedule follows the Bangladesh EPI (DGHS); campaign dates are approximate. None of this is medical advice: follow the EPI card and your paediatrician.
