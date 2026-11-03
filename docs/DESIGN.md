# Affaan's World — design system (v7 "The Garden")

## 1. The idea: his data grows a world
The app has two audiences, so it has two design languages:

| Audience | Needs | Language |
|---|---|---|
| **Parents** (daily, one hand, often tired) | Find, record and trust facts fast; share with a doctor | Calm paper-and-ink "garden journal": warm paper, clear type, one tone per section, charts that read in a glance |
| **Affaan** (2 years, tapping, no reading) | Big targets, instant cause-and-effect, familiar faces and voices, a gentle end | A bright, chunky **island** with big objects, the family's own voices, and no text needed |

**Rule 0:** a picture must *mean* something. Decoration that is not driven by his records or by the real time and place (the Dhaka hour, the Bengali season) is removed. That is why the v6 mandala became a garden: a mandala is the same every day, while the garden changes as he grows.

## 2. The living landscape (v7.4, `js/core/scene.js`)
One scene engine paints the opening and the Home hero: atmospheric hill ranges, a forest line, Bangladeshi paddy fields in perspective (golden in Hemonto), a winding river that mirrors the sky, meadow grass and framing shrubs, all lit for the real Dhaka hour (dawn / day / dusk / night) and painted once to offscreen canvases. The tree is one seeded Tree of Life: in the opening it draws itself in gold, its buds open and turn from gold to spring green to deep green, and the sketch becomes living bark. Doels (the national bird) use a flight model: flap/glide cycles, banking, slowing on approach, wings flared to land, then folding and settling. Home runs at 30 fps and pauses off-screen; his photo hangs in the crown as a gold leaf-wreath locket; the stickers he earns stand in the meadow.

### Earlier: the Garden algorithm (`js/views/garden.js`, data model still used for stickers and stats)
| Record | Visual | Rule |
|---|---|---|
| Latest height | Tree trunk height | `46 + (cm − 45) × 1.15`, clamped 70–150 px; tooltip shows the cm |
| Milestone domains | Four branches | Language, Movement, Social, Thinking, each at its own angle and colour |
| Milestones reached | Flowers on their domain's branch | one per milestone, domain colour, seeded position so they never jump |
| Words & skills | Leaves in the crown | golden-angle (137.508°) phyllotaxis; green English, gold বাংলা, teal skills |
| Newest photos | Lanterns hanging under the crown (tap to open) | his photo inside each lantern |
| Vaccine doses given | Roots | one per dose, up to 18 |
| Stars earned in Play | Butterflies (fireflies at night) | 1 + one per 8 stars, up to 12 |
| Stickers (kind `sticker`) | Placed exactly where he dropped them | x/y stored in the record |
| Dhaka hour | Sky phase (dawn / day / dusk / night), sun or moon arc, fireflies at night | `Cal.today().h` |
| Bengali season | Paddy, kash, shimul petals or rain | `Cal.today().bd.season` |

The positions are **deterministic**: a seeded PRNG keyed on the record id. So the same data always draws the same garden, and a new record only *adds* something.

The other content-driven visuals:
- **Door-frame:** pencil marks at real scale beside a chair, a table and a door handle.
- **WHO bands:** P3–P97 and P15–P85 from the LMS tables.
- **Vaccine passport:** a stamp per dose, tinted by status.
- **Stone path:** milestone bands as stepping stones.
- **Storybook:** auto-titled monthly chapters.

## 3. Tokens (`css/app.css`, `:root[data-theme=garden]`)
- **Paper & ink:**
  - `--paper #FFF8EC`, `--cloud #F5ECDA`, `--line #EBDDC3`
  - `--ink #2B2620`, `--slate #5A5148`, `--mist #958A7C`
  - Fractal-noise `--grain` overlay for a paper feel.
- **Accents:**
  - `--gold #E0A526` / `--gold-ink #9A6A0B`
  - `--green #3E8E41`, `--red #C0563A`, `--blue #2F7FB8`
- **Status:**
  - `--ok`/`--ok-bg`
  - `--amber-bg`/`--amber-ink`
  - `--warn-bg`/`--warn-ink`
  - `--danger`
- **Section tones** (set on `body[data-sec]`; `--t1 --t2 --tone --tone-soft --tone-ink`):
  - Home is leaf green, Play is violet, Development is sky blue, Health is terracotta.
  - Gallery is teal, Calendar is marigold, Reports is indigo, Settings is bark.
- **Type:**
  - Display: Fraunces (headings, the garden name).
  - Body: Outfit.
  - Numbers: mono.
  - Bangla: Hind Siliguri.
  - Body text is never below 15 px. The `--zoom` text-size setting scales `#view` (90–130 %).
- **Shape:** radius 14/18/24. Kid targets are at least 96 px (parent targets at least 44 px).
- **Night theme:** `:root[data-theme=emerald]`, with the same token names, so components never branch on theme.

## 4. Components
- **Hero:** `.gh` (Home garden) or `.hero2` (sections: tone gradient, live object, paper-cut hills, stitched vine).
- **Section head and tabs:** `shead()`, sticky `.tabs`.
- **Cards and panels:**
  - `.panel`, `.card`, `.kpi` (count-up), `.ha-tile` (tilt), `.ring` (countdown).
  - `.otd` (On this day).
- **Records:**
  - `.stone` (milestone), `.stamp` (vaccine), `.door` and `.lchart` with `.wb1`/`.wb2` bands and `.pctl` chip.
  - `.sbook` (storybook page).
- **Kid:**
  - `.island` with `.spot`; `.spot.rec` glows for today's picks.
  - `.faces`, sorter, xylo/tabla/ektara, easel.
  - Sticker tray.
- **Feedback:** toast, `toastUndo`, the sheet (bottom sheet), the sync pill (offline / syncing / live).

## 5. Motion rules
1. **Motion explains or delights. It never blocks.**
   - The intro is 5.6 s and any tap skips it.
   - Section wipes last 450 ms.
   - Nothing loops faster than 2 s, except feedback such as a tap pop.
2. **One hero animation per screen.** Everything else is ambient: at most 3 px of drift and opacity no higher than 0.6.
3. **Kid feedback is instant:**
   - Under 100 ms to sound and a scale pop on every tap.
   - Wrong answers never buzz; the target wiggles and the voice says the right word.
4. **Wind-down:** in the last 2 minutes of a play session, saturation and animation speed fall, and lullaby tones replace effects.
5. `prefers-reduced-motion` turns all animation off (CSS and `Motion.still()`), and the intro is skipped.
6. Animate only `transform` and `opacity`. SVG gardens are drawn once per render and are not re-laid out per frame.

## 6. Sound & voice
- Priority order: **family recording → Web Speech (en-IN / bn-IN) → silence**, via `Voice.say(key, parts)`.
- Audio unlocks on the first tap (an iOS requirement).
- Effects are synthesised (Web Audio). There are no audio files in the bundle.

## 7. Performance budget
| Metric | Budget |
|---|---|
| Shell (HTML+CSS+JS, uncompressed) | ≤ 900 KB, no framework, no build |
| First render from cache | < 1 s on a mid-range Android |
| Garden SVG | < 600 nodes |
| Photo upload | 1600 px JPEG at ~150 KB; thumb 320 px |
| Voice clip | ≤ 3 MB (bucket limit), typically 20–60 KB |
| Network | none required. Optional: Supabase sync and Open-Meteo weather (cached 30 min) |

## 8. Accessibility & language
- Every label is in English and বাংলা.
- Colour is never the only signal: stamps carry a ✓ or date, and percentile chips carry text.
- Focus ring: 3 px gold `:focus-visible`.
- Kid mode needs no reading and no gestures beyond tap and drag.
- A grown-up must press and hold to leave kid mode.
- Strict CSP (no inline handlers): every interaction goes through `data-act` / `data-change` / `data-input` delegation.

## 9. Adding a new visual — checklist
1. Which record or real-world signal drives it? If none, don't add it.
2. Is it deterministic (seeded by the record id)?
3. Does it read in under 2 s, in both themes, at 130 % text?
4. Does it respect reduced motion and the node and size budget?
5. Add it to `sw.js` SHELL and bump `VERSION`.
