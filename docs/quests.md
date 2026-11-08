# Quests: quest book guide

This guide governs everything written in `pack/config/ftbquests/quests/`. Read all of it before touching a chapter. The rules come from what the user asked for, from reading the quest books of other GregTech packs, and from playing the first hours of this pack with GTM 7.5.3 at hand.

The reference chapters are `welcome.snbt` and `steam_age.snbt`: if a rule is unclear, check how it was solved there.

## 1. What the user asks for

Verbatim, from their messages:

- "Quests: short, concrete, and in the voice of someone who has played. Quantities go in the recipe viewer, not in a paragraph. No reports or audit language. Quests teach the age, give a small reward, and never block recipes. The first quest leaves the player in the Steam Age with just the essentials. The book can be recovered if it gets lost." (translated from Spanish)
- Complaint about the previous book: the texts sound like AI, they make little sense, the order is odd, and the sub-dependencies are badly placed. There are quests floating with no dependencies, long lines crossing the chapter, and branches with no visible order.
- The first hour has to go step by step, with real dependencies: wood and stone → GT tools (what each one is for) → copper and tin (veins, surface rocks) → dusts with the mortar, and mixing → bronze → coke oven → boilers and steam machines → our drill (and why) → steel → gate to LV.
- An early quest gives the full set of unbreakable neutronium tools, to remove the tool grind.
- Take inspiration from the quest books of other packs, and copy from those whose license allows it.
- **2026-10-31, Project Reforge (owner decision; it supersedes "short" and "a small reward" in the first quote):** "Quests may be longer and more numerous in advanced eras, in the style of Star Technology and GTNH. Each era must teach its new wafers, circuit generations, processes and multiblocks." Each era teaches six roles: What's new, Materials processing, Wafers and circuits, Machines and multiblocks, Integration, and Capstone project, as sections of one chapter (section 4b; `docs/reforge/05_quest_design.md` describes the roles, but its chapter split was replaced by QB-0). Every new mechanic explains what it's for, how it's made, what it needs, what it unlocks and how to automate it. The book is generated from data files (sections 4b and 14).

## 2. Sources

The quest files were read, not the summaries. Working copies are in the session folder (`files/research/quests-src/`).

| Pack | Repository | License | Use |
|---|---|---|---|
| GregTech Community Pack Modern | `GregTechCEu/GregTech-Modern-Community-Pack` | LGPL-2.1 (whole repo, quests included) | Main source: it is GTM 1.20.1 with no changed recipes, so its mechanics data holds as it is. Text is adapted with attribution. |
| Monifactory | `Omicron-Industries/Monifactory` | LGPL-3.0 | GTM 1.20.1 with many changed recipes (steel from mixed dusts, rubber by hammer): its facts are not copied without checking them against our dump. Structure and tone are taken. |
| Star Technology | `StarT-Dev-Team/Star-Technology` | MIT (© 2023 trulyno) | GTM 1.20.1 on skyblock. The best there is for short texts with voice, and for tasks that teach the chain step by step. |
| Cosmic Frontiers | `Frontiers-PackForge/CosmicFrontiers` | LGPL-3.0 | Already on 1.21.1. Serves as a counterexample for layout (see table). |
| GregTech Leisure (GTL) | the user's instance (`files/research/gtl-raw/`) | unclear | Ideas only, no text or structure copied (section 12). |
| Nomi-CEu, GregTech Community Pack 1.12 | `Nomi-CEu/Nomi-CEu`, `GregTechCEu/GregTech-Community-Pack` | LGPL-3.0 | Not used: they run BetterQuesting and GTCEu 1.12. GTCP Modern covers the same ground for our GT version. |
| GTNH, TerraFirmaGreg, GT Odyssey | — | reference only | Not used for this guide. |

Anything copied or adapted from a licensed source is noted in `CREDITS.md`, section *Quests*, with the chapter and the quest.

## 3. How good quest books are built

Measurements of the Steam to HV chapters (computed by `files/scratch/quests-overhaul/stats.mjs` over the SNBT files). "Back" = dependencies that point against the reading direction; "p90" = 90% of the lines are shorter than this, in squares.

| Chapter | Quests | Starts | Back | Median line | p90 | Words (median) |
|---|---:|---:|---:|---:|---:|---:|
| GTCP Modern, Introduction | 25 | 4 | 4 | 1.5 | 2.1 | 125 |
| GTCP Modern, Steam Age | 40 | 0 | 17 | 1.4 | 2.3 | 96 |
| GTCP Modern, LV | 75 | 0 | 26 | 1.5 | 4.5 | 96 |
| Monifactory, Genesis | 55 | 1 | 24 | 2.3 | 11.4 | 76 |
| Star Technology, Industrial Revolution | 82 | 1 | 20 | 2.0 | 4.0 | 12 |
| GTL, Where It Begins | 45 | 8 | 6 | 2.0 | 4.3 | 22 |
| Cosmic Frontiers, The First Steps | 124 | 15 | 54 | 2.0 | 6.0 | 22 |
| **Grindless, Steam (before)** | 33 | 1 | 1 | **4.7** | **12.5** | 31 |
| **Grindless, Steam (now)** | 41 | 0 | 0 | 2.5 | 3.6 | 29 |

What they do well:

- **One spine, with branches.** GTL puts the spine in one row (`Where It Begins`: stone → veins → ores → tools → dusts → bronze, every two squares) and the branches in rows above and below. Monifactory does the same vertically. Star Technology uses a two-square grid, and nothing leaves it.
- **Short lines.** In the good ones, nine out of ten lines are under 2.5–4.5 squares long. The old Steam book had a median of 4.7 and lines of 20 squares.
- **Milestones that stand out.** A gear or a diamond, and a bigger size, for the multiblock or the chapter exit; side quests are smaller (GTCP: 0.66 vs. 0.75 and 1.2).
- **Tasks teach the chain.** Star Technology asks in *Firebrick* for clay dust, brick dust, refractory clay dust, pressed clay, brick and block: the quest is the recipe, and the text stays to one line.
- **"Any material".** GTCP asks for tools with `itemfilters:tag` (`gtceu:tools/crafting_hammers`) so that any hammer counts.
- **Structure blocks with a count.** Star Technology and GTCP ask for 25 coke oven bricks and 32 firebricks: the number is the structure's own count.
- **Rewards that help with the next step.** GTCP gives clay dust for making the macerator and bronze plates for making the smelter.

What not to copy:

- GTCP writes 100-word paragraphs with jokes and "Lore"; it is useful as a source of data, not of tone.
- GTCP has 17 backward lines in Steam Age (the chapter reads in a spiral), and Cosmic Frontiers has 15 starts and 54 backward lines across 124 quests: it is the scattered map the user complains about.
- Monifactory and GTL place loose information quests, with no dependencies, around the start.

Short examples from the sources, for tone:

- Star Technology (MIT), *Coke Oven*: "A staple of any GregTech pack. Get some tasty creosote to coat your planks in."
- Star Technology (MIT), *Firebrick*: "The building-block of any primitive machine."
- GTCP Modern (LGPL-2.1), *Steam Macerator*: "The macerator will output only the first item shown in recipes from EMI. The other slots are locked until you make a HV Macerator."
- GTCP Modern (LGPL-2.1), *This Rocks!*: "These little guys indicate the type of veins that are below them."
- Monifactory (LGPL-3.0), *Some Starter Tools*: "Hammers can be used to turn two ingots into one plate. Plates can make a File, Files can make Rods, etc." (useful as a chain, but it carries quantities in the text: not here).

## 4. Layout

The grid is FTB Quests' grid: one square = one unit of `x`/`y`.

- **Columns every 2 squares** in `x`; **rows every 1.5** in `y`. Positions in multiples of 0.25 at most.
- **Read from left to right.** Every dependency is to the left of its quest or, if it is a short drop, in the same column.
- **The spine goes at `y = 0`**: the shortest path out of the age, from the first quest to the last.
- **One row per subtopic.** Above the spine, one thing (in Steam: coke and pump at the top left; drill and greenhouse at the top right); below it, another (smelter, wrought iron, circuit parts). A subtopic does not change rows halfway through.
- **Side quests hang off what they expand**, in the next column, one or two rows above or below.
- **Sizes and shapes:**

  | Role | Shape | Size |
  |---|---|---|
  | Chapter start | `rsquare` | 1.5 |
  | Normal step | hexagon (default) | 1 |
  | Important machine or multiblock | `gear` | 1.25 (1.5 if it is the age's multiblock) |
  | Reading (checkmark task) | `circle` | 0.75, or 1 if it is on the spine |
  | Optional side quest (`optional: true`) | hexagon | 0.75 |
  | Mid-chapter milestone | `rsquare` | 1.25 |
  | Chapter exit | `diamond` | 1.5–2 |

- **Distances:** no line longer than 5 squares (two columns and two rows at most), no line passing under another quest, and at least 0.25 squares of air between boxes. Avoid crossings; if there is one, move a branch to another row.
- The chapter's **`autofocus_id`** points to its first quest, so the book opens there.
- The chapter's **`subtitle`**: one line with the step of the journey (section 9).

## 4b. One chapter per era (QB-0)

Owner, 2026-11-02: "Cada tier debe ser una sola pestaña/capitulo, no 6 capitulos bajo una pestaña" and "todas las quests deben estar interconectadas de manera logica y no tener cosas sueltas por ahi". Chapters may be as big as they need to be; what they may not have is loose quests.

- **One chapter per era**: `<era>_age` (Steam to MAX+), in the single group **Progression**. The old per-era groups are gone; `chapter_groups.snbt` has Progression, Quality of Life and Processing Lines, written by `gen-chapters.mjs` (`lib/groups.mjs`).
- **Sections.** Every data file of an era (`quests-data.mjs`, `circuits-data.mjs`, `age1-data.mjs`, ...) becomes a section of that one chapter. `CHAPTER.section = { name, origin: { x, y }, heading? }` places it: its `x`/`y` are offsets from `origin`. Without a `section`, the generator puts the file to the right of the previous sections with a gap of 8 squares. The chapter's id, title, icon, subtitle and autofocus come from the main data file (`quests-data.mjs`, else the file whose `CHAPTER.filename` is `<era>_age`, else the lowest `order`). `CHAPTER.filename` is ignored; the maxplus chapter is `maxplus_age`.
- **Section titles.** `heading: { key, x, y, deps?, icon?, desc? }` adds a `reading` quest (circle, checkmark task, no reward) that names the section in the map. It is an ordinary quest and takes part in the connectivity rule.
- **Same-era quest links** (`LINKS` pointing into the same era) are dropped: everything is already in one chapter. Links to other eras stay.
- **Connectivity rule** (`connectivity`, error). Counting only dependencies inside the chapter, exactly one quest has none (the start), and every other quest is reachable from it. A dependency on another chapter does not connect a quest. In merged era chapters this replaces `root` and `isolated` (so `allowRoots` and `allowIsolated` do not apply to them).
- **Section bridges.** A forward line between two sections may be up to `eraChapters.bridgeMaxEdge` (14) squares long; the other limits (backward, vertical, crossings, lines through quests, overlap) stay.
- **Switching on.** `lint-config.json` `eraChapters.enabled` lists the chapters under the new rules; `lint.mjs --merged-eras` applies them to every `<era>_age`. The integrator fills `enabled` as the data is regenerated.
- **Dry merge.** `node tools/quests/gen-chapters.mjs --dry-merge [--era ev,luv]` copies the book to a temp folder, replaces each era by its merged chapter, lints it with `--merged-eras` and prints per era the quests, dropped links and findings by rule. It writes nothing in the pack.

## 5. Dependencies

- **A dependency is a real requirement:** without that quest's item, this one cannot be done. The only other valid reason is the **assembly order of a single machine** (probe → sample → drill; tubes → resistors and plates → red alloy → circuit).
- **Never** add a dependency just to place a quest, and never chain topics that have nothing to do with each other.
- No need to list every ingredient. If the real requirement sits far away (more than 5 squares), the text names it and the dependency goes to the nearby step that makes sense. Example: the steam vein drill has a steam miner in its recipe, but it hangs off the sample and the drill bits, and its text says "Your steam miner is inside it."
- **One start per chapter.** The first chapter of the book starts with no dependencies; each age chapter starts with a quest that depends on the exit of the previous one (Steam depends on *Bronze*, LV on *LV Steam Turbine*). No quest floats.
- `dependency_requirement: "one_completed"` only for "any of these routes works".
- Quests on other tabs (quality of life) that ask for something from an age depend on the quest in that age where they open, not on anything loose.
- **Visibility is cached.** Generated chapters set `hide_quest_until_deps_visible: true`. Without it, FTB Quests checks each quest's visibility every frame by walking its dependency chain back to the start of the book, which dropped the long late chapters to about 1 fps. Every quest is still visible as long as no quest is hidden and no dependency dangles, and the client quest book test checks both.

## 6. Tasks

- A task is **what the player crafts**, not a quiz. Checkmark tasks (`checkmark`) are for reading only: start, information, rules.
- **Chains in tasks:** if the path has intermediate steps, each intermediate is asked for (count 1). The quest teaches the recipe without reciting it in the text.
- **Count** only when the number is the real requirement: the blocks of a structure (25 coke oven bricks, 32 firebricks) or a clear handful (steel ×16). Everything else, 1.
- "Any material" or "any of these": `itemfilters:tag` or `itemfilters:or`, with `title` and `icon` in the task.
- Items are never consumed (`consume_items` stays at the book's value, `false`).
- Optional tasks inside a quest (`optional_task: true`) for "one of these counts".

## 7. Rewards

- **Proportionate and useful for the next step:** coal when making iron, clay when finishing bronze, glass when learning glass, drill bits when making the vein drill. XP for the reading ones. A big capstone may earn a bigger reward.
- Nothing that skips a step of the age or a production line. The exception is the neutronium toolbox, which the user asked for.
- Six rewards per quest at most (Arrival and the toolbox are on the linter's exceptions list).

### Starter equipment

Arrival gives a diamond pickaxe, axe, shovel and hoe with Efficiency V, a fully charged HV Prospector, a stack of bread and the original torches. These are ordinary FTB item rewards, not login grants. The neutronium toolbox stays where it was.

The bread comes as two rewards (8 under `21A6FB493B3D6DA8`, then 56), left over from keeping old worlds claimable. There are no saves to protect, so Phase 5 may merge them. Arrival is an explicit exception to the reward-count limit.

The gifted prospector is an ordinary `gtceu:prospector.hv` with `Charge: 1600000` (full, 1.6 MEU), and Grindless adds no scripts, tags or names to it. It works as in GregTech 1.12.2 through GTM 7.5.3's own prospecting GUI: right-click opens the map window, which scans the 7x7 chunks around you (radius 4), one chunk per tick, and draws ore veins and fluid deposits on the grid; sneak and right-click cycles ore and fluid modes. The overlay also feeds the installed map mod's **Ore Veins** layer.

The GUI drains 32 EU per tick while open and closes when the charge runs out, so a full charge allows about 1,000 quick scans. Recharge it in an HV charger or battery buffer. A scan reads generated terrain and does not predict ungenerated ground.

### Unbreakable tools: how it is done

- GTM 7.5.3 reads the `Unbreakable` tag at the root of the item's NBT: `ToolHelper.damageItem` returns without doing damage, and the description stops showing uses. `IGTTool#get()` only sets it if the material is unbreakable (neutronium is).
- An FTB Quests reward with only the id gives a "raw" item, without `Unbreakable` or the behaviors that `get()` adds (3x3 area of the mining hammer and the shovel, neutronium magnet, tree felling).
- That is why each reward carries the exact NBT from `get()`, dumped in-game with `kubejs custom_command gg_dump_toolbox` (overlay `gg_test_quests.js`), plus `Unbreakable: 1b`. The `gg_test_quests` test checks in-game that they do not wear out and that they are not a hazard.
- GTM has no neutronium mortar, mallet or plunger: they are made of naquadah and rubber instead, and are unbreakable all the same. Electric neutronium tools are left out: they need a battery and would be IV tier.

## 8. Writing

Written in English. One to three short sentences, seventy words at most (`maxWords` in `tools/quests/lint-config.json`). Phase 5 raises the limit for advanced-era quests that teach a new mechanic (section 1).

**The voice** (the user, 2026-10-25, translated from Spanish: "more human, a bit more humorous, not too much, less 'an AI made this'"): a friendly engineer who has done this run before and talks to you across the workbench. Plain words, a little dry, sometimes amused. It tells you what the thing does in this pack, the catch worth knowing about, and now and then a small joke.

- **Humour:** light and occasional, about one quest in four. Understatement, a wink at GregTech's habits (another hull, another trip to the EBF), at the Grindless deal (you will never mine this by hand), at the planets (your diesel generator on the Moon). Never a pun in a title, never sarcasm at the player, no memes, no emoji.
- **Rhythm:** vary it. A short sentence after a long one. Not every sentence hangs on a colon or a semicolon, and not every quest has the same two-sentence shape.
- **Talk like a person:** contractions ("you'll", "it's", "don't"), "you" for the player, everyday verbs. Say what you'd say to a friend at the screen, not what a manual would print.
- **First sentence:** what it is or what it does in this pack. **Then:** the catch (the vent, the boiler that explodes, the fuel that won't burn on the Moon) or the reason it matters. A joke, if any, rides on one of those; it never replaces them.
- **No quantities in the text.** Neither "three copper and one tin" nor "two ingots per plate". If the number matters: "EMI shows the ratio".
- **No recipes recited.** The text does not list ingredients or steps with numbers; the tasks and EMI already do that. Naming the long road is fine ("the EBF twice, a chlorine bath and the freezer"); copying it isn't.
- **No report voice.** No "here the recipe asks for X instead of Y", "stays as the mod made it", "every byproduct has an honest end": that is design language, not player language.
- **Highlighted names** with `&6Name&r`, only the item or machine of the quest.
- **No long dashes** (— or –) and no "a - b" as a stand-in: use two sentences.
- **Titles** short and concrete: the name of the thing or what you get ("Coke Oven Bricks", "Sulfur from the Nether", "No More Pickaxe"). No wordplay that hides the content.

### What does not need a quest

A quest earns its place by teaching something the player needs in **this** pack. Every new wafer, circuit generation, process and multiblock of the era gets one, even when GTM makes it as usual (section 1). Cut the ones that only teach what any GregTech or AE2 player already knows and that the era does not lean on: transformers (LV and MV already explain them), cables and voltage tiers, "AE2 can link dimensions". If the pack adds a twist, it goes in one sentence of the quest it belongs to ("the seed for the lunar bridge has to be made on the Moon"). When a quest goes, its children depend on its parents.

### Banned phrases

The linter flags these (full list in `tools/quests/lint-config.json`): *nothing fancy, nothing exotic, the whole trick, that's really, simple, cheap…, the heart of, for good, on autopilot, the first real, the base has ever…, keep it fed, runs on its own, worth building the moment, embark, delve, dive into, seamless, game-changer, powerhouse, unlock the, unleash, whether you're, it's worth noting, in this quest, this quest will, let's, buckle up, a testament, elevate, journey awaits, the possibilities, say goodbye, just like that, and that's it, trusty, humble, behold*, and since 2026-10-25 *this tab, this chapter, crucially, importantly, ensure, utilize, leverage*.

Also, things the linter does not catch: rhetorical triplets ("wood, rubber wood and crops, all on autopilot"), "no X, no Y, just Z", "not only X but Y", sentences that start with "Simple", "Just", "Every…" to sound emphatic, moral closers ("That's the Steam Age done"), and the same "Thing: explanation." pattern in every quest.

### Before and after

| Before | After |
|---|---|
| "Bronze is just copper and tin, nothing exotic. A mortar and a casting mold get you plates and gears before you ever touch a real press." (also false: bronze does not use a mold) | "Copper dust and tin dust mixed in the grid give bronze dust; EMI shows the ratio. Smelt it into ingots and hammer those into plates." |
| "Coal or charcoal in, steam out. The Low-Pressure Solid Boiler is the heart of every machine you're about to build. Keep it fed and the whole line runs on its own." | "Bronze plates, bricks and a furnace. Fill it with water before the first fuel goes in: a dry, hot boiler that suddenly gets water doesn't stay a boiler for long." |
| (EV, Lunar Base) "Titanium only exists up here. This tab makes the Moon work without you, then finds the way to Mars. Ender chests and ender tanks work between Earth and the Moon: the cheap link for a few stacks. A whole factory crosses over the AE2 bridge." | "Every bit of titanium in this pack is up here, under grey dust and a black sky. First the Moon learns to run without you. Then you point a rocket at Mars." |
| (EV, Vacuum: Nothing Burns) "Combustion generators, gas turbines and boilers only burn where there is air: Earth, the Nether, the End and the building worlds. Up here they sit idle, and EMI lists the worlds each fuel burns in." | "No air, no fire. Bring a diesel generator up here and it'll just sit there, looking embarrassed. Methalox and rocket fuel carry their own oxygen; EMI lists where everything else burns." |
| (EV, Titanium) "The Moon's ilmenite is the only titanium in the pack. At home the EBF turns it into rutile, chlorine and carbon make titanium tetrachloride, magnesium reduces that in the EBF, and the vacuum freezer cools the hot ingot." | "The Moon's ilmenite is the only titanium you'll ever get. Back home it takes the long way round: the EBF twice, a chlorine bath and the vacuum freezer. Clear your afternoon." |

## 9. The journey in the book

- Each age tab is a step toward Sagittarius A\* (`docs/journey.md`). The chapter's first quest and its `subtitle` say, in one line, where we are and what changes.
- Each chapter ends in an **exit milestone** (diamond shape) that names the next place: Steam ends at the LV Steam Turbine and announces the Nether; HV ends on the Moon and EV starts at the lunar base.
- Never promise a multiblock or a place that does not exist yet.

## 10. Ids

FTB Quests saves progress by the id of the chapter, quest, task and reward. Nobody has played the pack yet (Project Reforge, 2026-10-31), so there is no progress to protect; the format rules still matter, because a bad id breaks the book.

- **Every id runs from `0000000000000001` to `7FFFFFFFFFFFFFFF`:** 16 uppercase hexadecimal digits, with the first between 0 and 7. FTB Quests 2001.4 reads ids with `Long.parseLong(hex, 16)` (`BaseQuestFile#readID`, `QuestObjectBase#parseCodeString`). An id starting with 8–F fails silently: the object gets a random id on every load (its progress is lost and its reward can be claimed again), and every dependency pointing to it disappears. Half the book was like that until v0.4.1, which is where the floating quests in the user's screenshots came from. The FTB Quests editor never creates those ids; our generators did.
- **Fix:** `node tools/quests/fix-ids.mjs --write` clears the high bit (8 → 0, 9 → 1 … F → 7). It is deterministic and idempotent: it can run chapter by chapter (`--chapter lv_age`) and the links between chapters still match up. The linter flags it as an error (`id-range`), and `gg_test_quests` counts the dependencies that FTB Quests loads in each chapter.
- Keeping the id of a quest that still means the same thing is optional: it keeps diffs small and cross-chapter dependencies intact. Quests may be removed, merged or renumbered.
- New tasks get a new id. Changing a task's count breaks nothing.
- New ids: never repeated anywhere in the book (the linter checks this), and with a first digit of 1–7. In Node: `const b = crypto.randomBytes(8); b[0] = (b[0] & 0x7f) | 0x10; b.toString('hex').toUpperCase()`.

## 11. Tools

```powershell
# Linter: layout, dependencies, ids, text and rewards; prints the quests and dependencies of each chapter
node tools\quests\lint.mjs [--chapter welcome,steam_age] [--items <items.json>] [--tags <tags.json>]

# Ids that FTB Quests cannot read (first digit 8-F): a report, or a fix with --write
node tools\quests\fix-ids.mjs [--chapter lv_age] [--write] [--map]

# Preview: one PNG per chapter (boxes, lines, grid)
powershell -File tools\quests\Render-QuestPreview.ps1 -Chapter steam_age -OutDir <folder> [-Prefix after-]

# Generated chapters: edit the data, then regenerate (the SNBT comes out with the same ids)
node tools\quests\gen-chapters.mjs [--era ev,luv] [--pending] [--every-package --out <dir>] [--dry-merge]   # every era chapter (Steam to MAX), one <era>_age each, from its data files (section 4b); LuV keeps only the landed packages
powershell -File tools\quests\processing-lines\run.ps1 -Dump <kubejs-exported> -Write [-Preview]   # Processing Lines and Power (sections 17 and 18)
```

- `lib/import-snbt.mjs` (`node tools/quests/lib/import-snbt.mjs [--book <dir>] [--out <dir>|-] <era> ...`) turned the hand-written Steam, LV, MV, HV and IV chapters into their `quests-data.mjs` once (RF-5L2): every id pinned, keys from the titles (`<ERA>_<WORDS>`), anything the writer does not model carried in `raw` or, for a task with a tag filter or a title, in `snbt` (the task's own text). It stops on a field it cannot carry. It is not part of the normal flow: the data is the source now.
- **Text limits** are per chapter role (`limits` in `lint-config.json`; `textLimits` in `lib/checks.mjs`): 70 words and 4 paragraphs by default; 120 words and 5 paragraphs in `_circuits`, `_machines`, `_integration` chapters (by file name suffix) and the chapters listed in `limits.chapterRoles` (`max_horizon` and the MAX+ capstones). They stay warnings.
- Chart and Power era links (`E()` in `processing-lines/pl-lib.mjs`) take their chapter from the quest id: when a quest moves to another era chapter the link follows it, and the chapter in the data file is only a hint.
- The preview draws quest links as teal dashed boxes, with the lines FTB Quests draws to them.
- `gen-chapters.mjs` also reads, per quest, `kind` (start, step, reading, side, exit, milestone, machine, plant, signature, wafer, circuit, process: shape and size as in `docs/reforge/05_quest_design.md` §4.2), `teach` (`for`, `needs`, `unlocks`, `automate`; required for machine, plant, signature, wafer, circuit and process) and a chapter-level `LINKS` list (quest links by key). The package gate (`PACKAGES`, `LANDED`, `pkg`, `fallback`, `slot`) works in every era. An explicit `shape` or `size` always wins over `kind`.
- `--items`/`--tags` use the `items.json` and `tags.json` files from a `gg_dump` (the most recent one, with the Moon: `files/test-runs/hidden-moon-dump1/results/server/kubejs-exported/`). The dump only includes the tags that some recipe uses, so a tag missing there is a warning; `gg_test_quests` checks all of them in-game.
- Errors: repeated id, id that FTB Quests cannot read (8–F), dependency that does not exist or is circular, second start, floating quest, overlapping boxes, backward line, line longer than 5 squares, item that does not exist, chapter without a title, quest without tasks.
- Warnings: off the grid, boxes almost touching, vertical drop of more than 3, line passing under another quest, crossings, long text, banned phrase, long dash or " - " used as a dash, quantity in the text, no reward, too many rewards.
- Exceptions (`lint-config.json`), always with their reason: `allowLongEdges`, `allowLayout` (`{ from, to, kinds, why }`: a real dependency whose line cannot avoid a crossing or a node keeps its line; real dependencies come before a clean drawing), `allowRoots`, `manyRewardsOk`, `quantityOk` (a number in the text that is not from a recipe: the 8 fuel buckets of a launch), `noRewardGroups` (chapter groups with no rewards on purpose: the Processing Lines), `noRewardQuests` (single quests that give nothing on purpose: the MAX+ arrival) and `direction` per chapter (`ltr` by default, `ttb` if a chapter is read from top to bottom).
- **In-game test, server:** `tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <pack copy> -Commands 'kubejs custom_command gg_test_quests' -WaitForLog 'GGTEST\|quests\|DONE@@900'`. It checks that each chapter loads with its number of quests **and dependencies** (`GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js`: when a chapter changes, both numbers are updated, which the linter prints), that every item and tag exists, and that the toolbox gives what it should.
- **Real client test:** `gg_test_quest_book` (marker `kubejs/config/gg_test_quest_book.json`, see `tools/test/README.md`). It completes *Arrival* and the toolbox with the FTB Quests command, claims their rewards through the same path as the button, checks the tools (NBT, damage, magnet, 3x3, description) and takes screenshots of the open book (`kubejs/exported/gg_book_*.png`). To photograph another chapter, add an entry to `SHOTS` in `client_scripts/gg_test_quest_book.js`.
- Always pass the test bench a copy of `pack/` with `-PackDir`: it runs `Update-PackIndex` over whatever you give it.

A chapter is ready when the linter reports 0 errors and 0 warnings (or explained warnings), the preview reads left to right with no crossings, and `gg_test_quests` passes.

## 12. What we take from GregTech Leisure

Ideas only; its license does not allow copying.

- **Tools that do not break early on.** GTL asks you to craft the hammer, the file and the iron mortar, and swaps them for unbreakable versions; here the quest asks for any hammer, and the next quest gives the full set.
- **Spine in one row and branches above and below** in the first chapter, with two squares between steps.
- **One-line warnings about what breaks a playthrough:** do not block the vent of the steam machines, do not pour water into a dry, hot boiler, and the steam macerator gives no byproducts until HV.
- **Replacement reward** ("If You Lost Your Tools"): not needed here, because nothing breaks.

Not taken: the coin market, the shortcuts (Dimensionally Transcendent Dirt Forge, primitive void miner), or the information quests with no dependencies around the start.

## 13. Reference chapters: Welcome and Steam

**Welcome** (15 quests, 14 dependencies). Spine: *Arrival → Wood and Stone → Ore Veins → Iron from the Veins → Your First Hammer → The Neutronium Toolbox → Copper and Tin → Grinding Dust → Bronze* (exit). Above: resin and the tool cheat sheet; below: the Void and Flatlands keys, coal and the deep veins.

**Steam** (44 quests, 50 dependencies). Spine: *Steam Age → Clay and Bricks → Low-Pressure Boiler → Steam Machines → Steam Compressor → Firebricks → Primitive Blast Furnace → Steel → Casting Molds → Glass → Steam Extractor → Sulfur from the Nether → Rubber Sheets → LV Machine Hull → LV Steam Turbine* (exit). Top left, the coke oven with the pump and the coke battery; in the machines column, the fan (miner, macerator, compressor, alloy smelter, and the optional rock crusher and small steam plants); above the blast furnace, the sky row (*Clockwork Observatory → Lunar Chart (Draft)*), and below it the steam blast furnace; top right, the vein drill and the greenhouse, up to *No More Pickaxe*; bottom right, the circuit parts up to *LV Circuit*. The hull, the motor and the circuit hang off *Rubber Sheets*, and the turbine needs all three.

The 2026-10-25 voice pass (section 8) cut *Read the Recipes* from Welcome (EMI's R and U keys are now in *Arrival*) and *Insulated Cable*, *High-Pressure Machines* and *High-Pressure Miner* from Steam (*Rubber Sheets* now says how a cable is made).

Why this order, checked against the recipe dump of v0.4.0:

- **Glass comes after steel.** Since v1.5.4 `hardGlassRecipes` is off, so sand smelts into glass in a furnace; the quest still sits after steel because the block mold in the alloy smelter (glass dust, a mold from steel plates) is the machine route. The vein probe and the greenhouse use glass, so the vein drill and the greenhouse come after steel, not before as `docs/eras/steam.md` assumed.
- **Steam sulfur only comes from the Nether.** Steam macerators (and the electric LV and MV ones) only give the first output (`addOutputLimit`), with no byproducts until HV. Rubber needs sulfur, so the first rubber means a trip to the Nether with a flint and steel (vanilla recipe since v1.5.4), as in GTCP Modern (*S is for Sulfur*). In LV, the centrifuge gets it from the realgar in the copper and tin vein.
- **Firebricks need the steam compressor** (refractory clay is not pressed by hand), and so does wrought iron (nuggets are not joined by hand).
- **The Large Bronze Boiler asks for LV circuits:** it hangs off the circuit quest as an optional one.

**Tested in-game (24-10-2026, pack with the Moon):** `gg_test_quests` loads both with all their quests and dependencies; `gg_test_quest_book`, on a real client, completes *Arrival* and *The Neutronium Toolbox*, claims their 22 rewards, and checks that the 20 tools carry GTM's NBT, do not wear out, mine, pick up items with the magnet, break a 3x3 area (mining hammer), and show "Unbreakable" with no durability lines. The book screenshots read from left to right.

The data is the source for the Steam chapter, as for the other era chapters: `tools/quests/steam-chapter/quests-data.mjs` (imported from the hand-written SNBT by RF-5L2; edit it and run `node tools/quests/gen-chapters.mjs --era steam`). Welcome and the Quality of Life tabs stay hand-written SNBT, edited following this guide. Generated from data in `tools/quests/` are the Steam to MAX era chapters (section 14), the Processing Lines (section 17) and Power (section 18). For those, edit the data and regenerate.

## 14. Era chapter plan: the Phase 5 design

Phase 5 of Project Reforge rebuilds the progression chapters to rule 5. The plan is `docs/reforge/05_quest_design.md` (RF-5A): read its section 2 row for your era, its section 3 for the rules it adds, and its section 5 row for your package.

- **Shape.** One chapter per era, `<era>_age`, however large (section 4b). The six roles (what's new, materials processing, wafers and circuits, machines and multiblocks, integration, capstone) are sections of that chapter, one per data file; never split an era into several chapters. Materials processing stays the era's Processing Lines chart (section 17).
- **Nothing taught twice.** Each thing is taught in one progression chapter; any other chapter shows it as a quest link. Role sections start each row at a link to the quest that opens it. The charts own line intermediates, the Multiblocks index owns where, Power owns figures and the AE2 tab owns the mod (design, section 2.6).
- **Generated.** Every progression chapter from Steam to MAX+ comes from data in `tools/quests/<era>-chapter/` through one shared writer, `tools/quests/gen-chapters.mjs`: edit the data files, regenerate with `node tools\quests\gen-chapters.mjs --era <era>`, and never hand-edit a generated chapter (the next run overwrites it). Welcome and the Quality of Life tabs stay hand-written.
- **Still in force from the v0.17.0 plan** (moved unchanged to the design's Appendix A): the sky row and its rules, MV's fixed End row, HV's fixed rocket block, LuV's package gate and stations switch, and the regeneration order that Power needs.

**Archival note.** Phase 5 first planned one to nine chapters per era (`_circuits`, `_machines`, `_integration`, `max_horizon`...); QB-0 (2026-11-02) merged them into one chapter per era. The older design text may still mention the split.

**Phase 5 note (2026-11-01).** The other sections describe the book as of v0.17.0 and the rules Phase 5 keeps. Where the design adds a rule (the five teaching questions, longer text in teaching chapters, the reward rule, English only), its section 3 applies until the integrator folds it into this guide.

## 15. Quality of life tabs: what to fix

The five are in the *Quality of Life* group and were written before this guide. The ids are already fixed (section 10), and the texts that v0.5.0 left false are already corrected (AE2: the bridge between planets is EV). What still sounds like AI is mostly " - " as a dash, recited recipes and design voice. Linter count as of 24-10-2026:

| Tab | Layout | Text | Fix |
|---|---|---|---|
| **Storage** (21) | Star-shaped layout around *Storage*: 7 lines backward, 3 longer than 5 squares. | 7 dashes; recipes written as prose ("Aluminium plates and an MV circuit around the pouch"), design voice ("Every byproduct in this pack has an honest end"). | From left to right in the order they are obtained: chests and backpacks → drawers → Sophisticated → ender chests and tanks (they work between planets: the small, cheap link; the industrial one is EV's AE2 bridge) → drums and GT crates → exit toward AE2. Each mod's side quests go in their own row. |
| **Applied Energistics** (19; 40 on 24-10-2026) | The best: spine from left to right. Two long lines (*Wireless Access*, *ExtendedAE*) and a column under *ME Controller* that reads from top to bottom. | 13 dashes, "runs on its own", recipes recited ("Three 1k components, a calculation processor…"). | The start depends on the last AE2 step in LV; the column under the controller becomes a row; the bridge between planets stays in EV and is only named here. |
| **Travel and Teams** (16) | Star-shaped layout around *Getting Around*: 5 lines backward. | 7 dashes, "the heart of". | Travel row (hang glider, Waystones, scrolls) and team row (teams, homes, claiming, loading chunks) that leave the start to the right; *Other Worlds* as a milestone, without repeating what *Lunar Base* (EV) says. EV's *Waystone on the Moon* was cut on 2026-10-25, so waystones between worlds are this tab's job. |
| **Workshop** (17; 15 on 24-10-2026) | Star-shaped layout around *Workshop*: 5 lines backward; mixes three topics. | 11 dashes, "32 blocks" in the text. | Three rows: building (Effortless, Carry On, Ultimine, decoration), logistics (Pipez, LaserIO, Modular Routers, collectors) and GT aids (terminal, memory card, structure manager). |

In all five: almost every reward is XP (put in something small and useful instead), and none is tied to the age where it opens. The text must follow the rules in section 8.

**Status (2026-10-25).** v0.5.1 rewrote the five (section 16), and the voice pass (section 8) rewrote them again: none has a linter warning, and the counts in the table are today's. Storage and AE2 now start from an age quest; most rewards are still XP. The AE2 tab went from 42 quests to 19. It starts at LV's *ME Network Access* and only covers what LV's AE2 branch doesn't: powering the network, the wireless terminals, GregTech's ME hatches and the addons. The column under *ME Controller* went with the controller quest, and the bridge between planets is still only named, in *Beyond This World*.

## 16. Working on the book in packages

A work package owns only the files its contract lists: normally one era's data files in `tools/quests/<era>-chapter/`, and that chapter's line in `GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js` when the contract allows it. Never split an era into several chapters, and never hand-edit a generated chapter: it is an output.

1. Read `AGENTS.md`, the sections of this guide that `.github/instructions/quests.instructions.md` lists for your task, and the two reference chapters (`welcome.snbt`, `steam_age.snbt`).
2. Edit the era's data files, then regenerate: `node tools\quests\gen-chapters.mjs --era <era>`. The generated `<era>_age.snbt` and the integrator-owned files (`lint-config.json` `eraChapters.enabled`, shared aggregates) are not yours unless the contract says so. If you adapt anything from another pack, propose the `CREDITS.md` line in the handoff.
3. Keep the blocks marked as fixed in section 14. Keeping the ids of quests that still mean the same thing is optional (section 10); new ids follow section 10.
4. Check every fact against the latest recipe dump, `$GG_DUMP` on the VM (run it through `tools/vm/gg-vm-exec.sh`, see `docs/testing/usage.md`), not from memory.
5. Done = linter with 0 errors and 0 warnings in your chapter (or warnings explained in `lint-config.json`), preview from left to right with no crossings, and the T0/T1 the contract names. The workstation only edits: run checks on the VM or in Actions.
6. LF and no BOM. Commit on your own branch and push; the integrator runs `Update-PackIndex` and merges.

History: v0.5.1 and the 2026-10-25 voice pass rewrote the Steam to HV chapters and the five Quality of Life tabs by hand; those chapters are now generated from data.

## 17. Processing Lines

A chapter group of its own, "Processing Lines", with one chart per tier: `pl_steam`, `pl_lv`, `pl_mv`, `pl_hv`, `pl_ev`, `pl_iv` and `pl_luv` (Steam Lines to LuV Lines). Each chart shows the tier's lines at a glance, the way Star Technology's `pl1`–`pl5` do: what goes in, which machine, what comes out, where each byproduct ends and where the loops close. EMI shows one recipe; a chart shows the line.

- **Nodes:** every node is a quest with one item: an optional item task (never consumed) plus a checkmark, so it can be ticked by hand or by holding the item. No rewards. The charts are `progression_mode: "flexible"` and no quest elsewhere depends on them: they never block anything.
- **Shapes:** raw inputs are rounded squares; items the default hexagon, products a bigger one, byproducts a small one; machines are gears, our multiblocks a bigger gear; a return (something that goes back into an earlier step: "Electrodes, Back", "Heavy Water, Back") is a small circle at the end of its line. A fluid shows as its bucket.
- **Arrows** are dependencies and read left to right. An arrow is one recipe, or a short chain whose intermediates the subtitle names ("EBF at 5,000 K, then the freezer").
- **Quest links** import a quest from an earlier chart (sulfuric acid from LV, nitric acid from EV). Only across chapters: FTB Quests draws a dependency's line to every button of that quest, links included, so a link in its own chapter repeats all its lines, and a loop through a link is a cycle.
- **Text:** a title, a subtitle (the machine, or where the thing goes), and on our multiblocks one or two sentences in the voice of section 8. A leaf always says where it ends (rule 3).
- **The source is the data, not the SNBT.** `tools/quests/processing-lines/pl-data-<tier>.mjs` holds the clusters, nodes, arrows and texts; `pl-gen.mjs` writes the chapters, the group line and the linter's roots; `pl-check.mjs --dump <kubejs-exported>` checks every arrow against a `gg_dump` (`--out <file>` writes the full report, every arrow with the recipe that proves it). `run.ps1 -Dump <kubejs-exported> -Write -Preview` does all of it, lints and renders the previews into `out\` next to it (ignored by git). Ids are hashes of the chapter and the node's key, so they don't change when a chart is regenerated.
- **When a tier lands:** write its data file from the era's "As built" sections, check it against a dump of that era, regenerate, and add its counts to `GG_QUESTS_EXPECTED`.
- **A tier that lands in packages** (`pl_luv`): pending clusters and nodes carry `pkg: '<package>'` and the data file's `LANDED` set lists the packages in the pack; the generator leaves out what has not landed, arrows included, but keeps its place in the layout, so landing a package is adding it to `LANDED`, regenerating and updating the counts.
- **Rate cards** (AUD3-RATES) size a real factory from the recipe dump; they sit on a machine node as `figs` plus `desc: rateText(card)`, so the text is built from the checked claims and cannot drift from them. `pl-lib.mjs` has three builders, and `pl-check.mjs` recomputes every number of each against the dump (`checkRate`), so a changed recipe fails the chart:
  - `R.rate(recipe, profile, claims)`: one machine on one recipe: `eut`, `ticks` per run, `ins` and `outs` per minute (a chanced output or catalyst counts its odds), and `hatch`, what one run needs room for in its hatches and buses. The profile is `{ tier, amps?, oc?, par?, parSrc? }`: the hatch voltage (`voltage(tier) * amps` must carry the EU/t), the overclocks (each halves the time and quadruples the EU/t; the time must stay whole ticks), and the parallels (they multiply the amounts and the EU/t, not the time; a `parSrc: { file, re }` names the script constant that caps them, and a number over it fails).
  - `R.cmp(key, unit, name, profile, routes, { dominates, verdict, what })`: routes that make the same product, per `unit` of it (1,000 for a bucket, 1 for an item) under one profile. Each route claims `perMin`, `eu`, its `ins` and the rest it makes (`out`). A route may name its own `key` when the products differ (iron dust and carbonyl iron powder). If a route costs less than another in every input, the EU and the rate, the card must list it in `dominates`: it is a balance decision for the owner, never a silent change, and an unlisted dominance fails the check.
  - `R.ratio(prod, cons, key, n, m, claims)`: the bottleneck. `n` producer machines make exactly what `m` consumer machines take of `key` (the smallest whole counts: `make` per minute against `take` per minute). Example: a slurry furnace makes 12,000 mB a minute and a core boule furnace takes 2,000,000, so 500 furnaces feed 3.
  - `pl-index.mjs k <recipe id> [oc=N par=N] [key:::unit]` prints the numbers to copy into a card. `tools/quests/test/production-rates.test.mjs` mutates quantity, time, EU/t, buffer, voltage, parallels and dominance of synthetic recipes and expects each to fail.
  - The pilots: the HV syngas plant (`pl_hv`), the LuV carbonyl line (`pl_luv`) and the MAX+ horizon furnaces (`pl_maxplus`).

## 18. Power

The `power` chapter ("Power") sits in Quality of Life after Workshop. It compares generation from Steam through LuV, fuel values, storage and transmission without making progression depend on it.

- **Layout:** one band per tier, with two IV bands and two LuV bands; then the later row (the Dyson sphere, no figures), the grid and the wireless network. Generators are gears, fuels rounded squares and grid components hexagons.
- **Reference only:** 90 quests, 101 dependencies and 54 links, flexible progression, optional item tasks plus checkmarks, no rewards and no dependencies from progression chapters.
- **Links:** fuels import the Processing Lines nodes that make them; generators import their introduction quests. Links never receive an arrow. Do not import a quest if its inherited dependencies would draw a long line across the chart.
- **Source:** `tools/quests/processing-lines/power-data.mjs`, the shared generator and `pl-check.mjs`. Counts go in `GG_QUESTS_EXPECTED.power`; stable node keys preserve quest ids.
- **Figures:** the checker recomputes EU per unit of fuel, output, steam, capacities, cable loss and AE2's P2P tax from the recipe dump, `electric.json`, pack config and scripts. Wireless figures also check the current table, structure slots and registered ids. An unverifiable number does not go in.
- **Wireless:** the band runs LV to LuV and requires the wireless implementation. Its covers follow the exact-class support boundary: normal GTM machines, chargers and battery buffers, not converters or multiblock controllers. LuV's cell, the SMES cell, comes from the LuV chart's HTS magnet works, and its node states the jump (WL-1, 2026-11-02: the network runs at the tier of its strongest cell, so one tower holding a SMES cell makes it LuV; before it, two IV wireless hatches on one multiblock). `WITH_WIRELESS = false` is a fallback for a release without wireless (83 quests and 93 dependencies), not the assembled candidate.
- **LuV band:** GT--'s naquadah reactor III (machine tier, EU per long rod from the dump, what reaches the network from the wireless table's loss), the orbital solar station (630 EU/t a lit panel recomputed from B2's script constants, `tables/sunlight.json` and `tables/orbits.json`; 64 panels from the script; 38,304 into the network), the Mk1 with D + T and GTCA's calcium plasma into GTM's plasma turbine (turbine and helium plasma figures from the dump), and B6's volcanic intake (EU/t a module and the module count from B6's scripts, EU per bundle from the dump). The calcium plasma has no figure: its net power waits for the bench (decision 19).
- **The LANDED gate:** every LuV node or cluster names its packages (`pkg`, `docs/eras/luv.md` "Build order", with the LuV chapter's names: `B7T` the tether, `B7S` the sulfur-iodine plant). `gate()` leaves out anything whose packages are not all in `LANDED`, with every arrow into it and any band left empty, so landing a package is adding it to that set. Written and waiting: the flux-tube tether (`B1` + `B7T`), the sulfur-iodine plant (`B1` + `B7S`) and the intake's link to the book's *Patera* (`B1` + `B6`).
- **Newer than the dump:** `pl-check.mjs` reports what a dump taken before a package cannot prove (ids this checkout's startup scripts register and the dump's pack did not) as pending, not failed, while still checking every figure that comes from scripts and tables. `--strict` counts pending as issues: use it on the integrated run's dump.

## 19. Multiblocks

The `multiblocks` chapter ("Multiblocks") sits in Quality of Life after Power. It is a map: every craftable multiblock controller in the pack, ours and the other mods', in one band per voltage tier from Steam up.

- **Layout:** one row per tier, from top to bottom; the band's label is the tier's machine hull (Steam: the bronze casing). Ours come first, as a bigger gear, then the rest in alphabetical order.
- **Reference only:** one optional item task per controller, no dependencies, 10 XP, nothing depends on it.
- **Placement:**
  - Ours go in the band of their startup era folder. A controller is ours when the folder script creates it, or names it (directly or through a `data/grindless/tables/*.json` it reads) and our `client_scripts/grindless/*_lang.js` names `block.gtceu.<id>`; when two folders name it, the lang file's era prefix decides.
  - Other mods' controllers go in the higher of two tiers: the first gate that reaches the controller (`tools/analysis/tiers/<tier>.json`), and the tier of its own recipe (its hull, else its highest circuit).
  - Controllers hidden by `hidden_until.json` and controllers that no gate reaches are left out; `gen.mjs --list` prints them and the shifted ones.
- **Descriptions:** each quest teaches its machine in one paragraph of at most 450 characters, written by `gen.mjs` from data and never by hand: its tooltip (ours, from `grindless.machine.<id>.tooltip.0`; otherwise the recipe types it runs), its main casing and heating coil from `structures.json`, the main inputs of its controller recipe, the main products of its recipe types (what it unlocks), the controllers whose recipe uses it, and a sentence on which buses and hatches to automate. Detail is dropped, last sentence first, until the text fits. An empty description in this chapter is a lint error (`classLevels["empty-description:multiblocks"]`). Test: `node --test tools/quests/test/mb-descriptions.test.mjs`.
- **Source:** `tools/quests/multiblocks/mb-data.mjs` (tiers, label icons, overrides), `mb-lib.mjs` (description builder) and `gen.mjs`. Ids are hashes of the controller id, so they survive regeneration. Run `node tools/quests/multiblocks/gen.mjs --dump <kubejs-exported> --write` after the Processing Lines generator (it rewrites `lint-config.json`), once per batch, and update `GG_QUESTS_EXPECTED.multiblocks`.


## Rendering the book

`tools/quests/render-book.mjs` draws every chapter as the questbook lays it out (quests at x/y with shape and size, dependency arrows, titles or icon ids, chapter images). Offline, no npm dependencies, read-only on the book.

```
node tools/quests/render-book.mjs --out <dir>                       # svg/, csv/, chapters.csv, index.html, book.json
node tools/quests/render-book.mjs --compare <before> <after> [--out <dir>]   # one before | after page per chapter
```

Capture the book before a rewrite into a folder outside the repo (never commit the images), render again afterwards, then compare. Tests: `node --test tools/quests/test/render-book.test.mjs`.