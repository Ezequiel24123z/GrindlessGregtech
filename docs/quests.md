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

## 5. Dependencies

- **A dependency is a real requirement:** without that quest's item, this one cannot be done. The only other valid reason is the **assembly order of a single machine** (probe → sample → drill; tubes → resistors and plates → red alloy → circuit).
- **Never** add a dependency just to place a quest, and never chain topics that have nothing to do with each other.
- No need to list every ingredient. If the real requirement sits far away (more than 5 squares), the text names it and the dependency goes to the nearby step that makes sense. Example: the steam vein drill has a steam miner in its recipe, but it hangs off the sample and the drill bits, and its text says "Your steam miner is inside it."
- **One start per chapter.** The first chapter of the book starts with no dependencies; each age chapter starts with a quest that depends on the exit of the previous one (Steam depends on *Bronze*, LV on *LV Steam Turbine*). No quest floats.
- `dependency_requirement: "one_completed"` only for "any of these routes works".
- Quests on other tabs (quality of life) that ask for something from an age depend on the quest in that age where they open, not on anything loose.

## 6. Tasks

- A task is **what the player crafts**, not a quiz. Checkmark tasks (`checkmark`) are for reading only: start, information, rules.
- **Chains in tasks:** if the path has intermediate steps, each intermediate is asked for (count 1). The quest teaches the recipe without reciting it in the text.
- **Count** only when the number is the real requirement: the blocks of a structure (25 coke oven bricks, 32 firebricks) or a clear handful (steel ×16). Everything else, 1.
- "Any material" or "any of these": `itemfilters:tag` or `itemfilters:or`, with `title` and `icon` in the task.
- Items are never consumed (`consume_items` stays at the book's value, `false`).
- Optional tasks inside a quest (`optional_task: true`) for "one of these counts".

## 7. Rewards

- **Small and useful for the next step:** coal when making iron, clay when finishing bronze, glass when learning glass, drill bits when making the vein drill. XP for the reading ones.
- Nothing that skips a step of the age. The exception is the neutronium toolbox, which the user asked for.
- Six rewards per quest at most (Arrival and the toolbox are on the linter's exceptions list).

### Starter equipment and existing saves

Arrival gives a diamond pickaxe, axe, shovel and hoe with Efficiency V, a Field Prospector (HV), a stack of bread and the original torches. These are ordinary FTB item rewards, not login grants. The neutronium toolbox stays where it was, with its existing ids and rewards.

The original 8-bread reward (`21A6FB493B3D6DA8`) is retained unchanged. A separate 56-bread reward brings the total to 64, so a player who already claimed Arrival can claim the additions without resetting any quest or receiving the original bread and torches twice. Each new tool has its own new reward id. Arrival is an explicit exception to the reward-count limit for this save-compatible starter kit.

The gifted `gtceu:prospector.hv` carries `grindless_starter_prospector: 1b`. Its right-click queries GTM 7.5.3's saved vein cache and calls its public `prospectByDepositName` once per matching deposit type; GTM sends its native ore-discovery packets to the installed map integrations. This avoids KubeJS's blocked network classes without bypassing the class filter. Open the map and enable **Ore Veins**. The query includes vein centres within **256 blocks in both X and Z**, inclusive, relative to the player's block position: a square with a real 16-chunk reach in every cardinal direction, not a 16-chunk-wide display. Results are delivered immediately, with a half-second cooldown between uses. No EU is spent, even with zero charge; no infinite-charge flag or electric capability is changed. Native HV tools cannot export charge, and crafted prospectors remain unchanged.

This is a **survey of generated terrain**, including saved veins whose chunks are currently unloaded. It does not generate or load chunks, predict ungenerated deposits, scan stray placed ore blocks, or replace the normal prospector's fluid modes. Empty results say there is no cached survey data, not that the ground has no ores. Results are native ore-overlay markers, not automatically created waypoints. GTM persists both its server vein metadata and the discovered client map data.

Why not enlarge the native scanner window: GTM 7.5.3's `ProspectorScannerBehavior#createUI` fixes it at 332x200, while a radius of 16 needs a 528-pixel-wide map and makes the sidebar width negative. Its `ProspectingMapWidget` also calls `getChunk` and scans every block in 1,089 chunks, one chunk per tick. The existing `ServerCache#getNearbyVeins` / `SPacketProspectOre` path already provides the safe, immediate survey and native map markers; there is no custom worldgen, energy implementation or compiled compatibility mod. See `CREDITS.md` for the pinned source.

### Unbreakable tools: how it is done

- GTM 7.5.3 reads the `Unbreakable` tag at the root of the item's NBT: `ToolHelper.damageItem` returns without doing damage, and the description stops showing uses. `IGTTool#get()` only sets it if the material is unbreakable (neutronium is).
- An FTB Quests reward with only the id gives a "raw" item, without `Unbreakable` or the behaviors that `get()` adds (3x3 area of the mining hammer and the shovel, neutronium magnet, tree felling).
- That is why each reward carries the exact NBT from `get()`, dumped in-game with `kubejs custom_command gg_dump_toolbox` (overlay `gg_test_quests.js`), plus `Unbreakable: 1b`. The `gg_test_quests` test checks in-game that they do not wear out and that they are not a hazard.
- GTM has no neutronium mortar, mallet or plunger: they are made of naquadah and rubber instead, and are unbreakable all the same. Electric neutronium tools are left out: they need a battery and would be IV tier.

## 8. Writing

Written in English. One to three short sentences, seventy words at most.

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

A quest earns its place by teaching something about **this** pack. Cut the ones that only teach what any GregTech or AE2 player already knows and that the pack doesn't change: transformers (LV and MV already explain them), cables and voltage tiers, "AE2 can link dimensions", a machine that works exactly as in GregTech. If the pack adds a twist, it goes in one sentence of the quest it belongs to ("the seed for the lunar bridge has to be made on the Moon"). Keep the id of every quest that stays (players keep their progress); when one goes, its children depend on its parents.

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

## 10. Saved games and ids

The user has a world. FTB Quests saves progress by the id of the chapter, quest, task and reward.

- **Every id runs from `0000000000000001` to `7FFFFFFFFFFFFFFF`:** 16 uppercase hexadecimal digits, with the first between 0 and 7. FTB Quests 2001.4 reads ids with `Long.parseLong(hex, 16)` (`BaseQuestFile#readID`, `QuestObjectBase#parseCodeString`). An id starting with 8–F fails silently: the object gets a random id on every load (its progress is lost and its reward can be claimed again), and every dependency pointing to it disappears. Half the book was like that until v0.4.1, which is where the floating quests in the user's screenshots came from. The FTB Quests editor never creates those ids; our generators did.
- **Fix:** `node tools/quests/fix-ids.mjs --write` clears the high bit (8 → 0, 9 → 1 … F → 7). It is deterministic and idempotent: it can run chapter by chapter (`--chapter lv_age`) and the links between chapters still match up. The linter flags it as an error (`id-range`), and `gg_test_quests` counts the dependencies that FTB Quests loads in each chapter.
- If a quest still means the same thing, **keep its id** (the already fixed one), even if it changes chapter, place, text or tasks. Moving a quest to another file does not lose progress: *Bronze* and *Sticky Resin* moved from Steam to Welcome; the Ender Eye, the End Key and the End Veins from HV to MV; titanium and the EV parts from HV to EV.
- What cannot be saved: the progress of quests with id 8–F in worlds from v0.4.1 or earlier, because their id was random there. Since the fix, progress stays fixed.
- Tasks that still mean the same thing keep their id; new ones get a new id. Changing a task's count breaks nothing.
- New ids: never repeated anywhere in the book (the linter checks this), and with a first digit of 1–7. In Node: `const b = crypto.randomBytes(8); b[0] = (b[0] & 0x7f) | 0x10; b.toString('hex').toUpperCase()`.
- A quest is only removed if it has no equivalent.

## 11. Tools

```powershell
# Linter: layout, dependencies, ids, text and rewards; prints the quests and dependencies of each chapter
node tools\quests\lint.mjs [--chapter welcome,steam_age] [--items <items.json>] [--tags <tags.json>]

# Ids that FTB Quests cannot read (first digit 8-F): a report, or a fix with --write
node tools\quests\fix-ids.mjs [--chapter lv_age] [--write] [--map]

# Preview: one PNG per chapter (boxes, lines, grid)
powershell -File tools\quests\Render-QuestPreview.ps1 -Chapter steam_age -OutDir <folder> [-Prefix after-]

# Generated chapters: edit the data, then regenerate (the SNBT comes out with the same ids)
node tools\quests\ev-chapter\gen.mjs                                    # ev_age.snbt from quests-data.mjs (section 14)
node tools\quests\luv-chapter\gen.mjs [--pending] [--all --out <file>]  # luv_age.snbt; only the landed LuV packages (section 14)
powershell -File tools\quests\processing-lines\run.ps1 -Dump <kubejs-exported> -Write [-Preview]   # Processing Lines and Power (sections 17 and 18)
```

- The preview draws quest links as teal dashed boxes, with the lines FTB Quests draws to them.
- `--items`/`--tags` use the `items.json` and `tags.json` files from a `gg_dump` (the most recent one, with the Moon: `files/test-runs/hidden-moon-dump1/results/server/kubejs-exported/`). The dump only includes the tags that some recipe uses, so a tag missing there is a warning; `gg_test_quests` checks all of them in-game.
- Errors: repeated id, id that FTB Quests cannot read (8–F), dependency that does not exist or is circular, second start, floating quest, overlapping boxes, backward line, line longer than 5 squares, item that does not exist, chapter without a title, quest without tasks.
- Warnings: off the grid, boxes almost touching, vertical drop of more than 3, line passing under another quest, crossings, long text, banned phrase, long dash or " - " used as a dash, quantity in the text, no reward, too many rewards.
- Exceptions (`lint-config.json`), always with their reason: `allowLongEdges`, `allowRoots`, `manyRewardsOk`, `quantityOk` (a number in the text that is not from a recipe: the 8 fuel buckets of a launch), `noRewardGroups` (chapter groups with no rewards on purpose: the Processing Lines) and `direction` per chapter (`ltr` by default, `ttb` if a chapter is read from top to bottom).
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

- **Glass comes after steel.** With GTM's `hardGlassRecipes`, sand does not melt into glass: you need glass dust and the block mold in the alloy smelter, and the mold comes from steel plates. The vein probe and the greenhouse use glass, so the vein drill and the greenhouse come after steel, not before as `docs/eras/steam.md` assumed.
- **Steam sulfur only comes from the Nether.** Steam macerators (and the electric LV and MV ones) only give the first output (`addOutputLimit`), with no byproducts until HV. Rubber needs sulfur, so the first rubber means a trip to the Nether with a flint and steel, as in GTCP Modern (*S is for Sulfur*). In LV, the centrifuge gets it from the realgar in the copper and tin vein.
- **Firebricks need the steam compressor** (refractory clay is not pressed by hand), and so does wrought iron (nuggets are not joined by hand).
- **The Large Bronze Boiler asks for LV circuits:** it hangs off the circuit quest as an optional one.

**Tested in-game (24-10-2026, pack with the Moon):** `gg_test_quests` loads both with all their quests and dependencies; `gg_test_quest_book`, on a real client, completes *Arrival* and *The Neutronium Toolbox*, claims their 22 rewards, and checks that the 20 tools carry GTM's NBT, do not wear out, mine, pick up items with the magnet, break a 3x3 area (mining hammer), and show "Unbreakable" with no durability lines. The book screenshots read from left to right.

The SNBT files are the source: they are edited by hand, following this guide. Exceptions generated from data in `tools/quests/` are `ev_age.snbt` and `luv_age.snbt` (section 14), the Processing Lines (section 17) and Power (section 18). For those, edit the data and regenerate.

## 14. Plan for Steam, LV, MV, HV, EV and IV: the Moon through each instrument

### The journey's spine

Each age looks at the Moon through a better instrument, and what it sees is what the next age needs. In each chapter this is the **sky row**: its own row above all the others, from left to right, ending above the chapter's exit.

| Age | Instrument (id) | What the player sees | Chart (id) | Used by |
|---|---|---|---|---|
| Steam | Clockwork Observatory (`gtceu:steam_observatory`, *Stargazing* recipes) | Through the eyepiece, at night: dark seas, bright highlands, the big craters and their rays. Clear sky, and the controller at Y 100 or higher, above the haze and the smoke of the coke ovens. | Lunar Chart (Draft) (`grindless:lunar_chart_draft`) | The optical observatory, without using it up |
| LV | Optical Observatory (`gtceu:optical_observatory`, *Astrophotography*) | On photographic plates (`grindless:photographic_plate`): cracks, chains of craters, long shadows on the terminator; flat and rugged ground told apart. And the tables of where the Moon will be each night. | Photographic Lunar Map (`grindless:lunar_map`) and Lunar Ephemeris (`grindless:lunar_ephemeris`) | The radio telescope, without using them up |
| MV | Radio Telescope (`gtceu:radio_telescope`, *Radio Astronomy*) | Radar echoes over the map: smooth seas, fields of rocks, crater walls, and an ellipse on a flat sea marked in red. It works through clouds and rain; a storm drowns out the echo. | Lunar Landing-Site Chart (`grindless:lunar_landing_chart`) | The rocket chip (HV) |
| HV | The rocket | The landing site on the chart | — | *Liftoff* → *The Moon* |
| EV | The lunar base | The Moon up close: regolith, ilmenite, lunar day and night | — | — |

Rules:

- **Never promise a machine that has not passed its test.** Until the coordinator says a machine has passed, no quest or text names it. Meanwhile the sky row stays empty; the text at the start of each chapter can mention the Moon in the sky, without machines.
- When an instrument comes in: a gear at 1.25 in the sky row, with the controller as a task; to its right, the chart (task: the chart). An age's chart is a dependency of the next instrument. Lines are not drawn between chapters, so the text says so ("the draft from the steam age guides it").
- The text says what is seen, in one sentence, plus the sky rule (night, clouds, height). The table is source material, not text to copy.
- In HV, when the launch route changes the chip recipe, *Liftoff* gains a dependency on the landing-site chart and its text changes ("the chip is written from the landing-site chart"). Its id does not change.

### Incoming machines

They come in once their test passes and the coordinator says so; each agent leaves its list in `files/scratch/quest-needs/<agent>.md`. All five are in the book now.

| Agent | Machines | Where they go | How they hook in |
|---|---|---|---|
| steam-content | Steam blast furnace, coke battery | Steam | The battery in the coke row, after *Coke Oven*; the steam blast furnace after *Primitive Blast Furnace*, as a second route to steel |
| lv-content | Sulfide roaster, heliostat tower | LV | The roaster in the chemistry row, after the contact catalyst; the tower in the power row |
| observatory | The three observatories and their charts | Steam, LV, MV | Sky row (top) |
| launch-road | Engine test stand, RP-1, qualified thrusters (MV); composite autoclave, ablative tiles, wrapped tanks, untested engine and static fire (HV) | MV and HV | In HV they go in front of the rocket parts: *Rocket Motors* comes to depend on the static fire, and *Fuel Tanks* on the wrapped tanks. Their ids and tasks do not change |
| syngas | Syngas plant | HV | Chemistry row, after the refinery: hydrogen and CO for methanol and ammonia |

### Steam — "Steam Age: Escape Velocity" (`steam_age.snbt`, 44 quests, 50 dependencies; done, with the sky row and the new steam machines; voice rewrite 2026-10-25)

The sky row and the steam-content machines are in. Section 13 describes the chapter.

### LV — "LV: The First Spark" (`lv_age.snbt`, 51 quests, 52 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *LV Factory* (current id), depends on *LV Steam Turbine*. Journey line: first electricity; the Nether goes from a round trip to a place you work in.
- **Spine:** *LV Factory* → *LV Components* (motor, piston, pump, belt, arm) → *LV Assembler* → cupronickel coils → *Electric Blast Furnace* (gear 1.5) → *Aluminium* → *MV Machine Hull* → *LV to MV Transformer* (exit, diamond).
- **Branches:**
  - at the very top, the sky row: photographic plates → *Optical Observatory* (gear 1.5) → lunar map → ephemeris;
  - top, ore: macerator → washer → thermal centrifuge → centrifuge (with the warning that the LV and MV macerators give no byproducts);
  - above the spine, power: the generator array (*Sixteen Turbines, One Hall*), and mirror field → *Heliostat Tower* → steam for the night;
  - below the spine, the *LV Vein Drill* (gear 1.5) → drilling fluid → *Nether Veins*;
  - bottom, chemistry: gas collector → electrolyzer → chemical reactor → mixer → contact catalyst → *Sulfide Roaster* → silver from galena;
  - bottom, green: *LV Greenhouse* (gear 1.5) → fertilizer → creature simulator → first pearl → models → the creeper and blaze models (for MV);
  - bottom, circuits: good board (off the chemical reactor) → diodes → *MV Circuit* → circuit assembler;
  - bottom right: forming press → graphite electrode → *Submerged Arc Furnace* (gear 1.5) and the AE2 branch, up to *ME Network Access*.
- **Cut on 2026-10-25** (section 8): *LV Grid*. The two-hatch trick is in *Electric Blast Furnace*.
- **AE2:** the AE2 steps that live in LV today stay in LV as their branch (the user wants all of AE2 in LV). The AE2 tab starts by depending on the last of them and does not repeat them.
- **Sources:** GTCP Modern `lv__low_voltage` (*Progressing Through LV*, *Electricity Generation*, *But what are Amps?*, *Battery Buffer*, *Machine Auto-Output Behaviour*, *Cover Behaviour*, *Programmed Circuits*, *What is this Mess?: Part Two*, *Cupronickel Coils*, *Gallium Arsenide*, *First MV Circuit!*); Monifactory `genesis` (*A Primer on Power*, *Battery Buffers*, *Charging Items*); Star Technology `industrial_revolution` for tone.

### MV — "MV: The Far End" (`mv_age.snbt`, 49 quests, 60 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *MV Factory*, depends on *LV to MV Transformer*. Journey line: the End, beyond the world.
- **Spine:** *MV Factory* → *MV Components* → chromium and aluminium → *Kanthal* → *Silicon Ingot* → *Silicon Boule* → *Silicon Wafers* → ILC and RAM → *Integrated Circuits* → *Advanced Integrated Circuit* → *Cleanroom* (exit, also after *HV Machine Hull* and *HV Motor and Pump*).
- **Fixed End row** (v0.5.0): *Blaze* (`3C356A1439744E15`) → *Ender Eye* (`3DDBE9267C197FEE`) → *End Key* (`756117B334515EA3`) → *End Veins* (`004525B795119B1B`, also depends on *Vanadium Steel Drill Bit*). Ids and tasks stay; the row can be moved as a whole.
- **Branches:**
  - at the very top, the sky row: *Radio Telescope* (gear 1.5) → landing-site chart, and the weather controller;
  - top, ore: *Ore Plant* (gear 1.75, the age's multiblock) → stone dust separation, and *MV Vein Drill* with the vanadium steel drill bit; the End row runs up from *Blaze* to *End Veins*;
  - above the spine: vanadium steel → *MV Cutter and Laser Engraver*, which the wafers need; *AE2 Grows Up* (optional) off the integrated circuits;
  - below the spine: *Stainless Steel* off *Kanthal*; *MV Fluid Drilling Rig* → diesel → kerosene → RP-1 → *Engine Test Stand* → qualified power thrusters (the MV launch route), and brine and chlorine;
  - bottom, carbon: *MV Greenhouse* → pyrolysis → methanol → *Biorefinery* (gear 1.5, the age's second multiblock) → ethylene and PE → transistors, PVC → hazmat suit, and *HV Machine Hull* → *HV Motor and Pump*;
  - bottom left: the four universal factories → advanced multi smelter → lava furnace.
- **Layout fixes:** done in v0.5.1 (the lines of 14 to 27 squares from *MV Grid*, *MV Components* and *Biorefinery* crossed the whole chapter and the End row).
- **Cut on 2026-10-25** (section 8): *Copper Cable*, *MV Grid*, *MV Ore Machines*, *MV Steam Turbine* and *MV to HV Transformer*.
- **Sources:** GTCP Modern `mv__medium_voltage` (*Transformers*, *Kanthal Coils*, *Stainless Steel*, *Silicon Lottery*, *Moore's Law*, *Polyethylene*, *The Church of Diesel*, *Desulfurization*, *Distillery*, *Pyrolyse Oven*, *Greenhouse*, *Sulfuric Acid*, *Hydrochloric Acid*); Monifactory `groundwork` (silicon, Kanthal) for structure.

### HV — "HV: Moonshot" (`hv_age.snbt`, 32 quests, 40 dependencies; done in v0.5.1, voice rewrite 2026-10-25)

- **Start:** *HV Factory*, depends on *Cleanroom* (the MV exit). Journey line: the Moon, the first place off Earth.
- **Spine:** *HV Factory* → *HV Components* → *Refinery* (gear 1.5) → hydrotreating catalyst → cracking and olefins → PTFE → *Gasoline* (the large chemical reactor) → rocket fuel → *Static Fire* (gear 1.25) → rocket motors → *First Rocket* → *Liftoff* → *The Moon* (exit).
- **Fixed rocket block** (v0.5.0): *Rocket Fuel* (`76D281E9D9C6FD20`), *Rocket Motors* (`5C1D3FB96A9FB74A`), *Fuel Tanks* (`4A6E81ABD8026025`), *Launch Pad* (`7B21622AADB1E1D1`), *Space Suit* (`5615E54AF782990A`), *First Rocket* (`5151DE8D3623EDCF`, scanner and seat), *Liftoff* (`4A672DF7CF424623`, chip), *The Moon* (`2897E3EB8159710C`, dimension task `gcyr:luna`). They go piece by piece so the launch route can change recipes without breaking them. The fuel and the pad hang off *Gasoline*, the motors off the static fire and the tanks off the overwrapped tanks. The suit hangs off *Fuel Tanks*, because its fabric is the same para-aramid and Kapton. *Liftoff* also needs MV's landing-site chart, and *The Moon* needs the suit. They can be moved; ids and tasks stay.
- **No longer in HV:** Ender Eye, End Key and End Veins (MV); titanium, EV Machine Hull, HV→EV transformer, EV Motor and Pump, and Distillation Tower (all EV; since the 2026-10-25 voice pass the transformer and the tower are gone, and the motor and pump quest is *EV Components*). *Nichrome* stays in HV as a branch: EV's *Regolith Cell* depends on it, because its crucible is ringed with nichrome coils.
- **Branches:**
  - top left, ore and green: *HV Greenhouse* (gear 1.5) and *HV Vein Drill* → stainless steel drill bit;
  - top, the optional *Catalytic Reformer* (gear 1.5) → reforming catalyst, off the hydrotreating catalyst;
  - top right, the launch road: *Composite Autoclave* (gear 1.5, off cracking) → heat-shield tiles → *Untested Rocket Motor* → *Static Fire* on the spine, which also depends on MV's engine test stand; GT drums (off MV's stainless steel) and the autoclave → overwrapped tanks → *Fuel Tanks* → *Space Suit*;
  - bottom: *Cleanroom in a Hatch* off *HV Components*, and *Syngas Plant* → water-gas shift off the refinery;
  - bottom, circuits: *EV Workstation* (CPU wafer, microprocessor assembly and workstation in one quest) → *Vacuum Freezer* → *Nichrome*.
- **Cut on 2026-10-25** (section 8): *HV Grid*, *Large Steel Boiler and Turbine*, *Black Steel and Red Steel*, *HV Cutter and Laser Engraver*, *Natural Gas and Refinery Gas*, *Hydrofluoric Acid*, *Epoxy and SBR*, *Super Chest and Tank* and *AE2 at HV*. *CPU Wafer* and *Microprocessor Assembly* went into *EV Workstation*.
- **Sources:** GTCP Modern `hv__high_voltage` (*High Voltage Machines*, *The Cleanroom*, *Large Chemical Reactor*, *Ice Cold*, *Nichrome Coils*, *Polytetrafluoroethylene*, *HV Circuit Assembler*, *The End of an Era*).

### EV — "EV: Lunar Base" (`ev_age.snbt`, 55 quests, 63 dependencies; done in v0.6.0, voice rewrite 2026-10-25)

Spine: the journey from *Lunar Base* to *Red Horizon* and the *IV Machine Hull*. Above it the Moon and Mars, below it Earth's power, platinum and nano circuits (see `docs/eras/ev.md`, "Quests"). Far requirements are named in the text, not drawn as long lines (section 5).

The chapter is generated: its source is `tools/quests/ev-chapter/quests-data.mjs` (every quest, task and reward id spelled out). Edit the data and run `node tools/quests/ev-chapter/gen.mjs`, which rewrites `ev_age.snbt` in the book's format.

### IV — "IV: Inner Planets" (`iv_age.snbt`, 53 quests, 74 dependencies; done in v0.7.0)

Spine: the route from the hot cell and the reactor, through the Moon's tritium and the chart, to Mercury, iridium and the assembly line, ending at *Gate to LuV*. Above it uranium, fuel and Venus; below it heavy water, Mercury's solar field and the parallel hatch (see `docs/eras/iv.md`, "Quests"). Machine quests carry the machine's name; the two landings (*Under the Clouds*, *Day of Fire*) are the milestones.

### LuV — "LuV: The Outer System" (`luv_age.snbt`; written while LuV is built, package LuV-C2)

- **Start:** *The Outer System*, after *Gate to LuV*. Journey line: superconductors at home, a station in orbit, then the belt and Jupiter's moons.
- **Spine:** *LuV Components* → *Osmiridium* → *Tape* (coated conductor line) → *Winding* (HTS magnet works, gear 1.5) → *The Network Goes LuV* (SMES cells) → *Packed and Launched* → *First Station* (Earth orbit) → *Level Four* → *Behind the Vault* (Io) → *Fumarole* → *Patera* → *Riding the Torus* or *Iodine Loop* → *Fusion* → *Europium* → *First Data Orb* → *Gate to ZPM* (exit).
- **Above:** the trinium line (*Naquadah Coil*, *Full Recovery*, *Trinium*, *Reactor III*, *Sixteen at Once*); the station's machines (*Endless Day*, *Fibre from Nothing*, *In the Wake*); the belt (*The Belt*, *Harpoon*, *Mond*, *Star Metal*, *Sunlight on a Boulder*, *Molecular Farm*).
- **Below:** *Closed Loop*, *Biofoundry*, *Engineered Seeds*, *Perfect Crystal*; Europa (*Under the Ice*, *Cryobot*, *Something Alive*, *Stem Cells*, *Organoid*, *Living Circuits*) and Ganymede (*Quiet Moon*, *Chirp*, *Coilgun*, *Into the Clouds*, *Slingshot*).
- **Generated:** `tools/quests/luv-chapter/quests-data.mjs` → `gen.mjs`. Ids are hashes of the quest keys. Each quest names the LuV packages it needs; only quests whose packages are all in `LANDED` reach the book, a dependency on a left-out quest goes to its parents, and `fallback` places fusion and research at home until Io lands. `S03` stands for spike S0-3 (`tables/stations.json` `enabled`): the station, Earth orbit's machines and what needs their products (the ring, the organoid lab, living circuits, the detector and the gate) wait for it. When a package merges: add it to `LANDED`, check its ids, run `gen.mjs --pending` (what is still waiting), `gen.mjs`, the linter, and update `GG_QUESTS_EXPECTED.luv_age`. `gen.mjs --all --out <file>` draws the finished chapter (it lints clean too). `tools/analysis/test/luv-quests.test.mjs` fails if the book names an id nothing registers or is stale.
- **No low gravity in the text:** GCYR's gravity isn't applied in game.

## 15. Quality of life tabs: what to fix

The five are in the *Quality of Life* group and were written before this guide. The ids are already fixed (section 10), and the texts that v0.5.0 left false are already corrected (bees: the blaze is MV, and the ilmenite and titanium honeycombs are only processed on the Moon; AE2: the bridge between planets is EV). What still sounds like AI is mostly " - " as a dash, recited recipes and design voice. Linter count as of 24-10-2026:

| Tab | Layout | Text | Fix |
|---|---|---|---|
| **Storage** (21) | Star-shaped layout around *Storage*: 7 lines backward, 3 longer than 5 squares. | 7 dashes; recipes written as prose ("Aluminium plates and an MV circuit around the pouch"), design voice ("Every byproduct in this pack has an honest end"). | From left to right in the order they are obtained: chests and backpacks → drawers → Sophisticated → ender chests and tanks (they work between planets: the small, cheap link; the industrial one is EV's AE2 bridge) → drums and GT crates → exit toward AE2. Each mod's side quests go in their own row. |
| **Applied Energistics** (19; 40 on 24-10-2026) | The best: spine from left to right. Two long lines (*Wireless Access*, *ExtendedAE*) and a column under *ME Controller* that reads from top to bottom. | 13 dashes, "runs on its own", recipes recited ("Three 1k components, a calculation processor…"). | The start depends on the last AE2 step in LV; the column under the controller becomes a row; the bridge between planets stays in EV and is only named here. |
| **Productive Bees** (12) | Clean. | 5 dashes. | Start depends on the age it opens in; rewards that are more than just XP. It is the shortest chunk. |
| **Travel and Teams** (16) | Star-shaped layout around *Getting Around*: 5 lines backward. | 7 dashes, "the heart of". | Travel row (hang glider, Waystones, scrolls) and team row (teams, homes, claiming, loading chunks) that leave the start to the right; *Other Worlds* as a milestone, without repeating what *Lunar Base* (EV) says. EV's *Waystone on the Moon* was cut on 2026-10-25, so waystones between worlds are this tab's job. |
| **Workshop** (17; 15 on 24-10-2026) | Star-shaped layout around *Workshop*: 5 lines backward; mixes three topics. | 11 dashes, "32 blocks" in the text. | Three rows: building (Effortless, Carry On, Ultimine, decoration), logistics (Pipez, LaserIO, Modular Routers, collectors) and GT aids (terminal, memory card, structure manager). |

In all five: almost every reward is XP (put in something small and useful instead), and none is tied to the age where it opens. The text must follow the rules in section 8.

**Status (2026-10-25).** v0.5.1 rewrote the five (section 16), and the voice pass (section 8) rewrote them again: none has a linter warning, and the counts in the table are today's. Storage, AE2 and Productive Bees now start from an age quest; most rewards are still XP. The AE2 tab went from 42 quests to 19. It starts at LV's *ME Network Access* and only covers what LV's AE2 branch doesn't: powering the network, the wireless terminals, GregTech's ME hatches and the addons. The column under *ME Controller* went with the controller quest, and the bridge between planets is still only named, in *Beyond This World*.

## 16. Chunks to write in parallel

Done in v0.5.1: the eight chunks and the incoming machines. Six writers in parallel with a cheap model and then a review of the LV, MV and HV logic with a more capable model. The cheap model writes well, but it does not reason through the progression: the spine and the dependencies of the age chapters always need that review.

On 2026-10-25 two sessions rewrote every chapter in the new voice (section 8) and cut the quests that teach nothing new. Welcome to MV plus Storage, Productive Bees, Travel and Teams and Workshop went from 235 quests to 225, HV from 43 to 32, EV from 66 to 55 and the AE2 tab from 42 to 19. The book has 331 quests, with 0 linter errors and 5 layout warnings, all in LV and MV.

A chunk is one chapter, written by one person. The contract is this guide and the linter:

1. Read `AGENTS.md`, this whole guide, and the two reference chapters (`welcome.snbt`, `steam_age.snbt`).
2. Touch only your chapter file, its line in `GG_QUESTS_EXPECTED` in `tools/test/overlay/kubejs/server_scripts/gg_test_quests.js` and, if you adapt anything from another pack, `CREDITS.md`.
3. Keep the ids of every quest that still means the same thing, and the blocks marked as fixed in section 14. New ids follow section 10.
4. Check every fact against the recipe dump (`files/test-runs/hidden-moon-dump1/results/server/kubejs-exported/`), not from memory.
5. No quests or text about the incoming machines in section 14.
6. Done = linter with 0 errors and 0 warnings in your chapter (or warnings explained in `lint-config.json`), preview from left to right with no crossings, and `gg_test_quests` on the test bench with a copy of `pack/`.
7. LF and no BOM. No commits and no `Update-PackIndex`.

| Chunk | File | Per the linter, before v0.5.1 | Plan |
|---|---|---|---|
| 1 | `lv_age.snbt` | 8 long lines, 2 crossings, 20 under another quest, 33 dashes, "for good" | Section 14, LV |
| 2 | `mv_age.snbt` | 12 long, 1 backward, 13 crossings, 16 under another quest, 29 dashes | Section 14, MV (fixed End row) |
| 3 | `hv_age.snbt` | 8 long, 1 backward, 2 crossings, 5 under another quest, 20 dashes | Section 14, HV (fixed rocket block) |
| 4 | `storage.snbt` | 7 backward, 3 long, 7 dashes | Section 15 |
| 5 | `applied_energistics.snbt` | 2 long, 13 dashes, 1 banned phrase | Section 15 |
| 6 | `travel_and_teams.snbt` | 5 backward, 7 dashes, 1 banned phrase | Section 15 |
| 7 | `workshop.snbt` | 5 backward, 11 dashes, 1 quantity | Section 15 |
| 8 | `productive_bees.snbt` | 5 dashes | Section 15 |

Welcome, Steam and EV are not split up: they are done. The incoming machines and the Moon are added by the book team when the coordinator says so.

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

## 18. Power

The `power` chapter ("Power") sits in Quality of Life after Workshop. It compares generation from Steam through LuV, fuel values, storage and transmission without making progression depend on it.

- **Layout:** one band per tier, with two IV bands and two LuV bands; then the later row (the Dyson sphere, no figures), the grid and the wireless network. Generators are gears, fuels rounded squares and grid components hexagons.
- **Reference only:** 90 quests, 101 dependencies and 54 links, flexible progression, optional item tasks plus checkmarks, no rewards and no dependencies from progression chapters.
- **Links:** fuels import the Processing Lines nodes that make them; generators import their introduction quests. Links never receive an arrow. Do not import a quest if its inherited dependencies would draw a long line across the chart.
- **Source:** `tools/quests/processing-lines/power-data.mjs`, the shared generator and `pl-check.mjs`. Counts go in `GG_QUESTS_EXPECTED.power`; stable node keys preserve quest ids.
- **Figures:** the checker recomputes EU per unit of fuel, output, steam, capacities, cable loss and AE2's P2P tax from the recipe dump, `electric.json`, pack config and scripts. Wireless figures also check the current table, structure slots and registered ids. An unverifiable number does not go in.
- **Wireless:** the band runs LV to LuV and requires the wireless implementation. Its covers follow the exact-class support boundary: normal GTM machines, chargers and battery buffers, not converters or multiblock controllers. LuV's cell, the SMES cell, comes from the LuV chart's HTS magnet works, and its node states the jump (LuV only when every formed tower holds SMES cells; before it, two IV wireless hatches on one multiblock). `WITH_WIRELESS = false` is a fallback for a release without wireless (83 quests and 93 dependencies), not the assembled candidate.
- **LuV band:** GT--'s naquadah reactor III (machine tier, EU per long rod from the dump, what reaches the network from the wireless table's loss), the orbital solar station (630 EU/t a lit panel recomputed from B2's script constants, `tables/sunlight.json` and `tables/orbits.json`; 64 panels from the script; 38,304 into the network), the Mk1 with D + T and GTCA's calcium plasma into GTM's plasma turbine (turbine and helium plasma figures from the dump), and B6's volcanic intake (EU/t a module and the module count from B6's scripts, EU per bundle from the dump). The calcium plasma has no figure: its net power waits for the bench (decision 19).
- **The LANDED gate:** every LuV node or cluster names its packages (`pkg`, `docs/eras/luv.md` "Build order", with the LuV chapter's names: `B7T` the tether, `B7S` the sulfur-iodine plant). `gate()` leaves out anything whose packages are not all in `LANDED`, with every arrow into it and any band left empty, so landing a package is adding it to that set. Written and waiting: the flux-tube tether (`B1` + `B7T`), the sulfur-iodine plant (`B1` + `B7S`) and the intake's link to the book's *Patera* (`B1` + `B6`).
- **Newer than the dump:** `pl-check.mjs` reports what a dump taken before a package cannot prove (ids this checkout's startup scripts register and the dump's pack did not) as pending, not failed, while still checking every figure that comes from scripts and tables. `--strict` counts pending as issues: use it on the integrated run's dump.
