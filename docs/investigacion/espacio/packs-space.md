# Space & the Cosmic Endgame in GT-family Modpacks — research for Gregtech Grindless

Mined 2026-10-24 from local catalogs (`research/content/*.md`, `research/gtl-raw/*`) + live wiki/GitHub re-verification this pass. Tags: **[W]** GTNH wiki (live-fetched) · **[Q]** GTNH quest book · **[S]** source/GitHub (live-fetched where a URL is given) · **[Search]** AI web-search synthesis, not a primary source — flagged wherever used. Local-catalog citations are `content/<file>.md:<lines>`.

## 1. Per-pack findings

### GregTech: New Horizons (GTNH) — the reference point
*content/gtnh.md:101-117,391-435,473-507*
- **Travel/exploitation ladder**: Rocket T1→T8 gates Moon→Mars→Asteroids→…→exoplanets (Amun-Ra/Seth) by voltage tier (ladder in §4); schematics are often dungeon drops. **Space Elevator** (UV, ≤24 modules: Mining/Pump/Assembler) replaces rockets, exploiting a planet **without landing**, needing computation+plasma [W: wiki.gtnewhorizons.com/wiki/Space_Elevator]. Arc = visit-in-person → Void Miner/FDR auto-gen → SE remote modules → **Eye of Harmony** "cosmos simulation" (UMV), which replaces mining entirely.
- **Megastructures**: **Godforge** (TecTech rings, 8/12/16 module slots, wireless-only power, upgrade tree paid in Graviton Shards, "END"→Magmatter) is a smelter-of-everything; **Eye of Harmony** (33×33×33) burns H/He/raw stellar plasma keyed by an inserted "tiny planet" and is the *only* source of White/Black Dwarf Matter + Universium, surpassing every other power method [W: wiki.gtnewhorizons.com/wiki/Eye_of_Harmony]; **Pseudostable Black Hole Containment Field** (UIV) holds a **seeded, decaying (1%/s) black hole** — the closest existing precedent for our finale — compressing it into Eternal Singularities; **Stargate** (UXV, 5×5 ring + 7 chevrons) is the stated final goal: "the crowning achievement of GTNH… a space-time wormhole" [W: wiki.gtnewhorizons.com/wiki/Stargate]. Winning = dial out; nothing real exists past UXV/MAX.
- **Loved**: the Space Elevator as a reward that ends rocket/drill busywork; planet identity (unique ores, dungeons, named hazards); EOH/Godforge as legible "capstone projects" with real inputs/outputs, not just bigger cubes.
- **Hated** [Q/W + Search-aggregated sentiment, unverified]: rocket-tier grind and dungeon-diving for schematics; manual landings ("hold SPACE or die"); EOH base recipe ≈2,965 s, first UXV parts ≈111 h; DTPF needs an 8 h continuous run for its bonus; RNG gates (a LuV quest literally titled "RNG is Definitely Good Game Design"); some planets feel thin relative to the grind to reach them; multiblocks **void inputs** on power failure.
- **License verdict**: GT5-Unofficial core LGPL-3.0; merged addons mixed MIT (TecTech/GoodGenerator/KekzTech/Intergalactic)/LGPL (KubaTech/Lanthanides)/**GPL-3.0 (GT++)**/**GPL-2.0 (GalacticGreg)**/**AGPL-3.0 (ggfab)**; pack scripts/configs **CC BY-NC-SA 4.0**; quest book **no license (ARR)**. → **Ideas/shapes only**; never copy text/code/quests/textures; GT++/ggfab copyleft is sticky — avoid entirely.

### GregTech Leisure (GTL) — GTM 1.20.1 Chinese pack
*content/gtl.md:384-516,820-883*
- **Travel/ladder**: 8 rocket tiers gate Moon→…→Barnard C (ladder in §4), each with a unique fluid "specialty" (He/He-3, Rn, H₂SO₄, noble gases, HCl, CH₄…) so the rocket ladder *is* a chemistry ladder. **Space hub** (T8, UV) hosts Resource/Assembly modules fed by non-consumed **Drones MK1–6**, scaled by Power-Module tier — exploits planets abstractly once built, no further landings.
- **Megastructures**: a full UHV→MAX "laser Mega-machine" family (Stellar Forge, Suprachronal Assembly Line, Transfinite Computation Array…); **Cosmic Probe Surface Reception Unit** (UIV) launches non-consumed probes for pure-computation fluid income; **DT Plasma Forge** (UIV, GTNH-derived) replaces Stellar Forge; **Dyson Sphere Control System** (UXV) launches ≤10,000 modules for +2A MAX each with a damage/efficiency curve; **Eye of Harmony** (OpV, ported from GTNH) is a "cosmos simulation… one-block universe," flagged by the pack's own documented design notes as absurd; **no dedicated black-hole multiblock** exists — singularities come from a bolted-on Avaritia Neutronium Compressor, not a GT mechanic.
- **Final goal**: **MAX** = Door of Creation + Creative-tier devices + "Congratulations on finishing this game" — a deliberately anticlimactic **sandbox finish line**, not a destructive/cosmic narrative beat.
- **Loved**: scan-once data catalysts; scaling via coil-temperature parallels; "Mega X" combined-step machines.
- **Hated**: the catalog's own license/design review calls out GTL's **524,288-parallel instant Dirt Forge**, 64-ore/tick primitive Void Miner, "2.1 B parallel" ore processor, and Element/Dragon-Egg Copiers as quantity-inflation/scarcity-breaking shortcuts explicitly *not* to imitate.
- **License verdict**: **contradictory** — CC BY-NC-SA 4.0 in the shipped zip vs **LGPLv3** declared on CurseForge [curseforge.com/minecraft/modpacks/gregtech-leisure]; GTLCore has no public 1.2.x source; its own credits admit GPL-3.0 (Twist Space Technology) and **AGPL-3.0 (Epimorphism Modern)** code inside it. → **Re-implement only**, credit "GregTech Leisure (nutant233 et al.)"; never copy scripts/quests/textures/Java.

### Star Technology
*content/star-technology.md:260-335,400-460*
- **Travel is NOT planetary — it is Stargate-dimensional**: a Classic Stargate (ZPM/pre-gate) unlocks Abydos (UV–UHV), an Ancient Stargate unlocks Nether/End reinterpreted as "UEV"/"UIV" realms, then a **Draconic Stargate** (UXV) opens the "Riftic" frontier — each gate is *built + discovered* via a researched **Dimensional Finder** (CWU-driven chanced "ping" for a coordinate crystal), not rocket tiers.
- **Exploitation**: in-person at first (Chemical Plant/Bacteria Synthesizer/void-drill lines per dimension); no orbital-abstraction layer — a real gap versus our "orbital stations without landing" pillar.
- **Megastructure**: **K.O.M.A.R.U** ("Kaleidoscopically Omnipotent Mystically Ascendant Rift Umbilicus", UXV+) — a frame hosting ≤24 module multiblocks, with **exponential upkeep** (Faematter cost ×1.025^modules per cycle) stabilised by consumable filaments — an elegant "scale vs. stability" capstone, no numbers worth copying.
- **Final goal**: still frontier/WIP ("Theta 3 continues") — no finished ending.
- **Loved/hated**: no direct player-quote source found this pass; the catalog itself flags non-consumed catalysts/chanced wear (vs. re-gathering) as standout wins, and large cubes/pay-to-skip shop/inflated CWU walls as anti-patterns the authors' own changelogs retuned away from repeatedly.
- **License verdict**: pack repo **MIT** ("Copyright (c) 2023 trulyno") — **the single most copy-friendly source in this whole study**: scripts/quests/data tables may be copied verbatim with attribution. StarT-Core (Java) + its GTM fork are **LGPL-3.0** — re-implement, don't paste.

### GregTech Odyssey (GTO)
*content/other-packs.md:77-183*
- **Travel**: full Ad Astra solar-system layer mainlined (Moon→Mars→Venus→Mercury→Ceres→Io→Ganymede→Titan→Pluto→interstellar) with realistic T1–T8 fuel chemistry; **Void Miner→Large Void Miner→Resource Collection Module** (UV) mines **any previously-scanned dimension remotely** via a Dimension-Data item — devs' own line: "终于可以不用到处插矿机了" ("finally you don't have to plant miners everywhere") — a direct precedent for our "no manual gathering" rule.
- **Megastructures**: self-levelling **Harmony Machine**/"Eye of Harmony" (fuses 1.024 B mB H+He per cycle, auto-advances tier every 17+4×tier runs, doubles as an ore-acquisition method — "这也是矿机!"); **God Forge** (animated multi-tier ring); **Dyson Sphere Launch Silo + Receiving Station** ("ultimate power-generation win condition").
- **Final goal**: top of the 18-tier main line is **MAX** (Eternity, MHD-constrained Star Matter, Spacetime Continuum…); no single "you win" screen — MAX plus a research-tree node literally named **"Create"** ("创造一切") function as the terminal goal.
- **Loved**: casing-tier-rescaled single multiblocks (one Digital Miner blueprint for every era); dual tech+magic automation tracks closing progression gaps; Easy/Normal/Expert as a **pure challenge dial** that never changes unlock order.
- **Hated**: Expert mode's finite bedrock veins mean "never run dry" automation is *not* guaranteed on every difficulty.
- **License verdict** (raw LICENSE.txt re-fetched live this pass): modpack arrangement **All Rights Reserved**; **GTOCore code = PolyForm Noncommercial 1.0.0**; its assets/community translations **CC BY-NC-SA 4.0**; quest data ARR [github.com/GregTech-Odyssey/GregTech-Odyssey/blob/main/LICENSE.txt]. → reusing *mechanics/ideas* is safe (PolyForm restricts only commercial copying of their files, not game-design facts); never copy code/assets/quests.

### Cosmic Frontiers
*content/other-packs.md:183-270*
- **Travel**: T5–7 "Cosmic Rocketry" (Ad Astra) to the Aether, Moon, and exoplanet stops; narrative-first pack (a "Ghost" narrator), chapters named for emotional beats toward the ending.
- **Megastructures/exploitation**: tiered **Ore Extraction Drill** (LV→ZPM) + Mechanical Mineshaft automate mining in-place; **Drone Station** (endgame, "under active development") is a planned automated-logistics layer; Fusion is explicitly **replaced**, not kept — a **Naquahine Pressure Reactor** fission line powers the late game ("I removed plasma power… via fusion production").
- **Final goal (official public roadmap, largely unbuilt as of this pass)**: UHV = "Official Story Release, Ending #1"; UXV = "Ending #2"; a joke-named **"ERROR"** tier = "Ending #3." The planned capstone quest explicitly **benchmarks itself against GTNH's Stargate**, then deliberately substitutes a quick "Cosmic Meatball" reward plus an opt-in NG+ "Glory Mode" instead of forcing the brutal grind on everyone — a good template for referencing the genre without copying its worst pacing.
- **Gaps flagged by the researchers**: no confirmed automatic wood/plant farm; early ore extraction still manual by design; **content past HV is mostly design-doc, not shipped** — treat its endgame as aspirational, not proven.
- **License verdict**: pack + NebulAE2 **LGPL-3.0**; **CosmicCore** code "LGPL-3.0 unless stated," but `.mtl/.obj/.fsh/.vsh` + default textures **ARR**, `models/item|block` **MIT** — a deliberate split (open glue, closed/ARR engine internals) worth mirroring if we ever want to protect specific assets.

### Phoenix Forge Technologies
*content/other-packs.md:270-340*
- **Travel/exploitation**: "Blazing Drill" (EV+, dimensional-anchoring) and its Moon-targeting "Voidic Drill" twin give bulk, **location-independent** raw ore via a craftable tiered kit + consumable fluid — no landing required once built.
- **Stated final goal**: the pack's own namesake, an "omniverse-traversing" **Phoenix Forge**, is **confirmed NOT implemented** (zero code hits for `phoenix_forge`/`multiverse`/`omniverse`) — only a commented-out OpV "Phoenix Infuser" precursor exists. A cautionary example: **never let the quest book promise a capstone before it's built.**
- **License verdict**: messy — GitHub auto-tags MIT, but an unreconciled full LGPLv3 text file sits alongside it, and PhoenixCore (the Java mod) has **no license at all**; some designs are themselves "borrowed with permission" from Monifactory/Sky of Grind. → ideas only, treat with extra caution.

### Monifactory / Nomifactory / Nomi-CEu — the "Microverse" space alternative
*content/monifactory.md:130-166,343-447; content/nomifactory.md:1-280*
- **No planets/rockets as the core path.** All three replace void-miners *and* planetary travel with one idea at increasing sophistication: a **non-consumed "miner ship"/Microminer item**, crafted at an Extended-Crafting table, inserted into a **Microverse/Microminer Projector** multiblock with cheap recurring reagents (fuel, Quantum Flux/data), runs a timed "mission," and returns a **fixed-quantity** ore/gem/rare-material bundle; **the drill-head/kit material selects the loot table**, not a dimension choice. Monifactory's version adds a full **state machine** (Normal/Hostile/Shattered/Corrupted integrity, "hungry" states that eat Quantum Flux, sensor hatches for automation).
- **"Endgame" resource**: a Tier-10 **Heart of a Universe** ("You have become Death, destroyer of Universes") is the single rarest renewable, feeding the Creative Quantum Tank chain, Stabilized Miners, and the Infinity Catalyst.
- **Megastructure/final goal**: Monifactory's **Transdimensional Energy Singularity** (UIV/MAX, 31×37×31) makes every machine/hatch of the owner read as "full" once fuelled — an explicit, self-aware **anti-pattern** the catalog flags (nullifies logistics instead of rewarding it). Nomifactory/Nomi-CEu's literal final quest text: **"You win. Congratulations. I hope you enjoyed playing Nomifactory."** A **ZBGT** addon adds a genuine MAX tier beyond UHV (HOGifactory pushes this further).
- **Loved**: fixed, non-RNG mission yields; "automate the automator" capstone (Actualization Chamber turns a consumable miner permanently reusable); quest-chapter-as-tier-summary with an explicit progress metric ("circuits are the primary measure of your progress").
- **Hated**: by Tier 7–10, re-crafting a probe every mission becomes a chore players route around with AE2 auto-crafting tricks instead of embracing; a documented **lag bug** ("Modular Machine energy output hatches cause a lot of lag by scanning a large region"); dimensional/rocketry content (Advanced Rocketry) is kept almost entirely **optional/flavor** — explicitly *not* the main resource-automation answer in this lineage.
- **License verdict**: the entire lineage (Omnifactory→Nomifactory→Nomi-CEu/Nomi-Labs→Monifactory) is **LGPL-3.0** end-to-end, confirmed per-repo; Monifactory's "unique multiblock" base class is **CosmicCore-derived code used with personal permission** (not relicensed, not inheritable by us); HOGifactory's own GitHub "MIT" tag is unreliable (can't relicense its LGPL-3.0 upstream). → copying small generic KubeJS files is **legally fine under LGPL-3.0 with notice**; treat anything CosmicCore-derived or themed (Draconic/Avaritia lore, textures) as re-implement-only.

### TerraFirmaGreg (TFG-Modern)
*content/tfg.md:163-176*
- **Travel/exploitation**: Ad Astra is wired in but explicitly **"(WIP)"** by the authors — Moon + Mars have real automation (HV dust harvester, EV ostrum harvester) and finite biome-weighted fluid veins (ammoniacal water, CO₂, ice, depletion-tracked); **Venus and Europa are literal empty stubs** (biomes/materials staged, zero recipes) — a cautionary example of shipping assets before the processing loop exists.
- **No endgame content past IV was found** (no LuV+ rework files) — not useful as a cosmic-finale source, but its **"rework" files** (retroactively inserting a new required material into earlier recipes) are the cleanest proof-of-concept anywhere in this study for "difficulty by complexity, not quantity."
- **License verdict**: pack + Core-Modern **LGPL-3.0**; QuestBook/Field-Guide/Wiki repos have **no license (ARR)**, and TFG's own README admits its quest text is **itself borrowed** from GTCP-Modern under informal credit. → mechanics/KubeJS patterns copy-with-credit; never copy quest text or art (also credits Better End/Cosmic Frontiers/an individual artist for borrowed textures).

### Gregicality / Supersymmetry (GTM/GTCEu addons, not full packs, but directly portable)
*content/gregicality-supersymmetry.md:1-41,367-450*
- **Supersymmetry's rocketry** is the most mechanically serious "real rocket science" in this whole study: rockets assembled from real in-world stage blocks, nozzle efficiency computed **as a function of ambient pressure** (sea-level nozzles underperform in vacuum), launch success a **probabilistic 0–100%** function of Δv/drag/mass/separation-timing — rockets can **launch, crash, or explode**; above it sits a full custom Galaxy/StarSystem/Orbit/CelestialObject layer. "Winning" = unlocking a traversable multi-body solar system through genuine engineering risk, not one capstone block.
- **`VoidingMultiblockBase`** is a ready-made **"honest byproduct destination"** reference implementation: default-deny voiding, inert liquids/gases void via Dumper/SmokeStack, flammables burn via FlareStack (pollution-gated), **everything else has no voiding path and must be captured** — directly matches our own byproduct rule.
- **License verdict**: **Gregicality Science (GCYS)** and **Gregicality Multiblocks (GCYM)** = **MIT** (2022/2024, GregTechCEu) — safe to **port code/recipes directly** with attribution, our cheapest real content source in this entire study; original **Gregicality-legacy** and **Susy-Core** (the rocketry mod) = **GPL-3.0** — re-implement, don't paste; the Supersymmetry **modpack**'s own `groovy/` recipe layer is **LGPL-3.0** (more permissive than its GPL-3.0 engine) — our best pocket of directly-adaptable realistic-chemistry recipes; the 1.20.1 port `Supersymmetry-Core-Modern` currently ships with **no license at all** — do not use.

### Other notable (lower depth)
- **GregTech: Quantum Transition (GTQT)** and sibling Chinese GT packs — survey depth only, *content/other-packs.md:542-628*; casing-tier auto-rescaling multiblocks (one blueprint, many tiers) is its standout idea.
- **ATM Star (All the Mods)** [Search, unverified]: a single "prove you've mastered everything" craft needing 8 cross-mod components including a **"Pulsating Black Hole"** — thematically close to our finale naming, but it's a crafting checklist, not a megastructure/journey.
- **Create: Astral** [Search, unverified]: space (Moon→Mars→Mercury) is woven through the *whole* progression rather than placed only at the end — each planet is itself a mid-game automation goal, not just a trophy; a useful counter-example to "planets only unlock at the very end."

## 2. Synthesis

### (1) What works
- **Abstraction after a real first visit**: every strong pack lets you *land once*, then automates exploitation remotely — GTNH Space Elevator modules, GTL Space Hub + Drones, GTO's scan→Void-Miner, Monifactory/Nomifactory's Microverse missions. None force repeat manual visits.
- **Legible capstones that *do* something, not just unlock a cutscene**: Godforge/EOH/Harmony Machine/K.O.M.A.R.U are all *operated* machines with real inputs/outputs and a win-condition tied to output (power, Universium, Dwarf Matter), not a flag-planting ritual.
- **One mental model reused everywhere**: non-consumed catalyst + cheap consumable reagent → bulk output (Microminer, GTL drones, GTO Void Miner, Star Tech's catalysts) is the single most-copied "no manual gathering" idiom across every pack studied.
- **Explicit obsolescence signposting** (Cosmic Frontiers: "Steam is dead by LV, go do X") and **quest-chapter-as-tier-summary** (Nomi-CEu: "Circuits are the primary measure of your progress") keep huge trees legible.
- **Risk/engineering framing beats pure numbers**: Supersymmetry's probabilistic rocket launches and GTNH's black-hole decay/collapse mechanic make "space is dangerous" a system, not flavor text.

### (2) What tires the player (and how to avoid it)
- **Timer/RNG inflation**: GTNH's 111 h EOH recipes, 8 h DTPF runs, "RNG is Definitely Good Game Design" quests. **Avoid**: divide every reference timer by 10–30×; ban RNG on anything mandatory.
- **Manual commutes**: rocket-schematic dungeon-diving, manual landings, "plant miners everywhere." **Avoid**: gate *access* with a build/compute project (Star Tech's Dimensional Finder, GTO's scan-item), then automate exploitation permanently from one base.
- **Quantity walls dressed as progression**: 4,000+ superconductors, 19,008 Hypogen, 22 Mega Ultimate Batteries, a Dyson ground unit's 544 conveyors (GTNH); GTL's own design notes flag its 524,288-parallel/2.1 B-parallel machines as anti-patterns. **Avoid**: cap parallels/hatch counts; every tier upgrade should add a *mechanic*, not a multiplier.
- **Punitive failure**: GTNH voids inputs on power loss; black holes decay if neglected; an undersized Dyson laser hatch explodes it. **Keep** some operable risk (good tension — see Supersymmetry) but **replace silent voiding with stall+refund**, as GTNH's own researchers recommend.
- **Promising capstones that don't exist**: Phoenix Forge's namesake machine, Cosmic Frontiers' endgame "Endings," Cosmic Frontiers' Drone Station — all are referenced in quests/marketing but unbuilt. **Avoid**: never reference a capstone in quest text before its mechanic is implemented.
- **Logistics-nullifying "creative" capstones**: Monifactory's Transdimensional Energy Singularity, GTL's Creative tier at MAX. **Avoid entirely** for our finale — a black hole that "explodes the universe" should be a destination, not a cheat code.

### (3) Concrete mechanics to reuse (license verdict per item)
| Mechanic | Source | Verdict |
|---|---|---|
| Non-consumed catalyst + cheap reagent → bulk, fixed-yield mission (void-miner replacement) | GTNH Void Miner/SE, GTL Drones, Monifactory Microminer, Nomifactory probes | **Ideas only** (all LGPL/GPL/ARR cores) — re-implement in KubeJS |
| Orbital hub + modules exploiting a planet without landing | GTNH Space Elevator, GTL Space Hub | **Ideas only** (LGPL/CC-BY-NC-SA) |
| Stateful "integrity/type" resource-generation machine (hostile/corrupted states, sensor hatches) | Monifactory Microverse Projector | **Ideas only** — LGPL-3.0 core is CosmicCore-derived (permission-only) — clean-room it |
| Modular ring + upgrade-tree megastructure, wireless-only power | GTNH Godforge | **Ideas only** (TecTech MIT in a merged monorepo, but 1.7.10/incompatible API — re-implement) |
| "Insert a tiny planet to pick the recipe" cosmos-simulation generator | GTNH/GTL Eye of Harmony | **Ideas only** (GT5U LGPL-3.0) |
| Seeded, decaying black-hole containment → singularity | GTNH Pseudostable Black Hole Containment Field | **Ideas only** (GT5U LGPL-3.0) — **best existing precedent for our finale mechanic** |
| Exponential-upkeep modular frame stabilised by consumable filaments | Star Technology K.O.M.A.R.U | **Copy OK w/ attribution** (pack MIT) for KubeJS/data; Java core is LGPL-3.0, re-implement |
| Default-deny byproduct voider (inert→void, flammable→burn, rest→capture) | Supersymmetry `VoidingMultiblockBase` | **Ideas only** (GPL-3.0) — simple enough to clean-room |
| Pressure-ambient-dependent nozzle efficiency + probabilistic launch success | Supersymmetry rocketry | **Ideas only** (GPL-3.0 mod); modpack's `groovy/` recipes **are** directly adaptable w/ attribution (LGPL-3.0) |
| Aromatic-polymer/anode-mud/fullerene self-recycling chemistry chains | Gregicality Science (GCYS) | **Copy directly, MIT** — our cheapest real content source |
| Casing-tier auto-rescaling single multiblock (one blueprint, many eras) | GTO Digital Miner, GTQT | **Ideas only** (ARR/PolyForm pack; no code available anyway) |
| "Automate the automator" one-time capstone making a consumable item permanently reusable | Nomi-CEu Actualization Chamber / Stabilized Miners | **Ideas only** (LGPL-3.0) |

### (4) Reference "planet ↔ voltage tier" ladder
| Tier | GTNH | GTL |
|---|---|---|
| HV | Rocket T1 → **Moon** (He/He-3) | Rocket T1 → **Moon** (He/He-3) |
| EV | T2 **Mars** (desh/tungsten/pitchblende); T3 **Venus/Mercury** (H₂SO₄; D) | T2 **Mars** (Rn); T3 **Venus/Mercury** (H₂SO₄; D) |
| EV–IV | T3 **Asteroids/Ceres/Io/Callisto/Mercury**; T4 more Tier-4 DIMs | T4 **Ceres** (Ne/Kr/Xe) |
| IV | — | T5 **Io** (naquadah ore, coal gas) |
| LuV | T5 gated by Europium | T6 **Ganymede/Pluto/Enceladus/Titan** (HCl; HNO₃; F/Cl; CH₄) |
| ZPM | T6 gated by Tritanium; T7 **Haumea/Makemake/Pluto/Kuiper** | T7 beyond the solar system (stellar-energy fuel) |
| UV | T8 **exoplanets** (T Ceti E, Barnarda C/F, Vega B); **Space Elevator** removes rockets | T8 **Barnard C** via Space Elevator "Departure"; **Space Hub** (Drone MK1) |
| UHV | **Mothership** → Amun-Ra/Seth | Drone MK2 (neutronium) |
| UEV–UIV | Seth (Tengam); DTPF era | Drone MK3–5; DT Plasma Forge |
| UMV | **Eye of Harmony** replaces all miners | Drone MK6; **Eye of Harmony** (ported, at OpV in GTL's own tier naming) |
| UXV+ | **Stargate** (final goal) | **Dyson Sphere**; MAX = Door of Creation (sandbox finish) |

*(GTL's tier names run one "slot" higher than GTNH's for the same rocket because GTL maps EOH to OpV, not UMV — see `content/gtl.md` Appendix C.4/C.5 for exact per-drone/per-rocket tables.)*

### (5) How the cosmic finales are actually built
- **GTNH Stargate** (the clearest "final goal" in the genre) is built from a **5×5 hollow ring** (8 ring + 7 chevron blocks + base + controller + RF power unit), reached via Eternity (QFT, 25%→72% focused success) → MHDCSM → Godforge END (22 Mega Ultimate Batteries) → Magmatter → 9/9/9 EOH → Astral Arrays → T0 raw Stellar Plasma → DEFC cores → Stargate parts. **Consumes**: Universium (20,736 L once), Magmatter, Astral-Array-scaled EOH output. **Winning** = dial an address, open a one-way 5-minute portal — a *destination*, not a power number.
- **GTNH's black hole** (Pseudostable Black Hole Containment Field, UIV) is a **mid-endgame ingredient step**, not the finale: a seeded black hole decays 1%/s unless fed spacetime (cost doubling every 30 s), and collapsing it yields Eternal Singularities that feed the *next* tier (EOH/Godforge) — i.e. GTNH treats "contain and harvest a black hole" as one rung, then builds two more capstones on top. **For our pack's "explodes the black hole and the universe" framing, this is the mechanic to scale up into the true final multiblock, not copy verbatim.**
- **GTO's Dyson Sphere + Harmony Machine + God Forge** stack has no single "win" screen; it treats a research-tree node literally named **"Create"** as the thematic end instead of one block.
- **GTL's Eye of Harmony/MAX** explicitly ends in a **sandbox/creative tier** ("Congratulations on finishing this game") rather than a destructive event — the weakest finale framing in the study; avoid this shape.
- **Common pattern across every real capstone**: (a) a late-tier *plasma/elemental catalyst* only producible by the previous capstone (GTNH stellar plasma, GTL excited stellar catalyst, Star Tech riftion plasma); (b) a *named rare material* gated to the second-to-last tier only (Universium, Heart of a Universe, Monium); (c) **wireless-only power draw** once the structure exceeds normal hatch capacity (GTNH Godforge/TPM/EOH all draw straight from the wireless EU net). Our black-hole megaproject should follow the same three-part recipe — a unique catalyst only the previous stage can make, a named "last-mile" rare resource, and wireless power — then its win event (the explosion) should consume the whole system's stockpile in one spectacular, non-repeatable recipe, mirroring the Stargate's one-way-portal framing rather than GTL's anticlimactic creative tier.

## Gaps / unverified
- Live Reddit threads could not be fetched this pass (anti-bot block); GTNH sentiment above is corroborated by wiki text + an aggregated web-search synthesis, not individually quoted posts — treat "loved/hated" bullets as representative, not exhaustively sourced.
- Star Technology and TFG have **no finished cosmic endgame** to study (Theta-3/IV-only respectively) — included for mechanics, not finale precedent.
- ATM Star / Create: Astral were spot-checked via web search only (not local catalogs) — flagged **[Search]**; treat as leads, not verified facts.
- GTL's exact OpV/MAX↔GTNH UMV/UXV tier-name mapping (§4 footnote) is the local catalog's own stated convention, not independently re-derived here.
