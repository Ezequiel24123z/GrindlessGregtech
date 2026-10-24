# Reuse catalog: UHV→MAX, planets/orbit, and the black-hole project

Research pass 2026-10-24. Every license below was re-verified this pass directly against a repo's `LICENSE` file or the GitHub/Modrinth API (not just README prose) — see citations. Builds on `gtm-tiers.md`, `packs-space.md`, `machines-catalog.md` and the `research/content/*.md` catalogs; where this pass contradicts that earlier research (e.g. gregicality-legacy's real license, the GalacticGreg/ggfab question, "Stellar Forge") it is called out explicitly in the relevant row. Goal: port before we create, per the user's post-UHV policy.

## Already in our pack (zero extra install cost)

| Mod | License (file) | Relevant to |
|---|---|---|
| [GT-- / `gtnn` 1.3.10](https://github.com/Arborsm/GT--) | **AGPL-3.0-or-later** ([LICENSE](https://github.com/Arborsm/GT--/blob/master/LICENSE)) | Ships recipeless circuit tags ULV→MAX; MAX-tier textures exist (see below) |
| [GT Community Additions 2.2.0](https://github.com/mordgren/GTCA) | **LGPL-3.0** self-declared only in [`gradle.properties:4`](https://github.com/mordgren/GTCA/blob/master/gradle.properties) — no LICENSE file in repo, weaker evidence than a real grant | Tegmark Forge, PCB Factory MkI(UV)/MkII(**UHV**), Nano Forge (**UEV**-tier recipe) |
| [GTM Extended Features 3.0.0](https://github.com/NotArgxment/GT-Extended-Features) | **LGPL-3.0-only** ([LICENSE.md](https://github.com/NotArgxment/GT-Extended-Features/blob/main/LICENSE.md)) | Universal Circuits (`UniversalCircuits.java`), wireless optical hatches |
| [GregTech Modern Utilities 2.10.2](https://github.com/Omicron-Industries/GregTech-Modern-Utilities) | **LGPL-3.0** ([LICENSE](https://github.com/Omicron-Industries/GregTech-Modern-Utilities/blob/main/LICENSE)); code LGPL-3.0, assets MIT per README | Originally spun out of Monifactory; 64A converters, wireless active transformer |
| [Gregtech Terminals 6.8.5](https://github.com/BgameXL/GTCEu-Terminals) | **MIT** | QoL only, no era content |
| [GCYR 0.2.9](https://github.com/Argent-Matter/gcys) | **LGPL-3.0** | Dyson System Controller (Sun only), space elevator — already our base for §Planets |

GT--/GTCA are fine as downloaded dependencies (we don't redistribute their jar). The AGPL/weak-LGPL status only matters if we **copy their files into our repo** — see License traps.

## Era tables, UHV → MAX

Columns: what's missing, best source, exact license, what to take, port effort (S=recipe/pattern, M=+JS modifier/hook, L=needs real Java).

### UHV (T9) — hull/hatches exist; no singleblock, component, coil or Fusion MK4 (`gtm-tiers.md` §2-3)

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| Fusion MK4 (GTM caps at MK3/UV) | [Monifactory](https://github.com/Omicron-Industries/Monifactory) `registerFusionTier(GTValues.UHV," (Helical)")` — a **public stock GTCEu API call**, no Monifactory dependency — `kubejs/startup_scripts/registry/multiblock_registry.js:245-291` | LGPL-3.0 | Code (pattern/casing refs are Monifactory's; drop the renderer line) | **S** |
| UHV single blocks/coil | GTCA (installed) Tegmark Forge/Nano Forge/PCB MkII — already a dependency | LGPL-3.0 (weak evidence, see traps) | Recipes only | **S** |
| UHV circuit alt/backup | [Star Technology](https://github.com/StarT-Dev-Team/Star-Technology) `runic_processor_computer` → `#gtceu:circuits/uhv`, `kubejs/server_scripts/utils/tags.js:6-18` | **MIT** | Code + textures | **S** |

### UEV (T10) — GTM has *nothing*: no hull, casing, hatch, circuit, cable (`gtm-tiers.md` §2)

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| Hull/casing/hatch scaffold | **Monifactory `Post_UV_Components.js`** — UEV hull+casing `:49-73`, MAX hull+casing `:75-100`, hatches `:140-310` | LGPL-3.0 | Code, direct port, re-ID items | **S** |
| Circuit line (no Java gate) | Star Technology `ancient_runicalium`/`draconic_processor_mainframe` → `#gtceu:circuits/uev`, `kubejs/startup_scripts/.../circuits.js:42-86` + `tags.js` | MIT | Code + textures | **S** |
| Circuit line (alt., Java-gated) | Monifactory "Extradimensional" family, `kubejs/server_scripts/gregtech/circuits.js:373-390,537-560` — gated by custom `microverse` condition (needs MoniLabs Java or strip the condition) | LGPL-3.0 | Code (recipes), ideas (gate) | **M** |
| Superconductor | Star Tech `enriched_pallarovium_alloy` (`conductorPlasma`), `kubejs/startup_scripts/elements_materials/material/base_materials.js:139-147` | MIT | Code | **S** |
| Flagship multiblock (Stellar Forge) | Star Tech **Hell Forge** recipes, `kubejs/server_scripts/systems/hellforge.js:1-514` (MIT) + temperature-decay controller `StarT-Core:.../StarTHellForgeMachine.java:27-242` (LGPL-3.0, ~210 lines, self-contained) | MIT / LGPL-3.0 | Recipes direct; controller reimplement | **S**/**M** |

### UIV (T11) — neutronium/r-process metals; Penrose-engine rehearsal stage

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| Circuit/coil continuation | Star Tech `rhenium_super_composite_alloy` (`V[UIV]`), `base_materials.js:200-214`; `draconic_processor_mainframe` | MIT | Code | **S** |
| Black-hole rehearsal mechanic | GTNH **Pseudostable Black Hole Containment Field** — seeded BH decays 1%/s, spacetime halts decay, collapse yields Eternal Singularities ([wiki](https://wiki.gtnewhorizons.com/wiki/Black_Hole)) — 1.7.10 Java, API-incompatible | LGPL-3.0 (`GT5-Unofficial` root) | **Ideas only** — best existing precedent for Penrose engine's "manage a hazard" shape | **M** (design), no code reuse |
| Exotic-matter precedent | Monifactory **Antimatter Collider** recipes/shape, `multiblock_registry.js:761-796`; machine class `AntimatterGeneratorMachine` is MoniLabs Java | LGPL-3.0 | Recipes/shape; reimplement controller | **M/L** |
| Harvester basis | Star Tech **Abyssal Harvester** — casing is KubeJS (`getKjsBlock("draneko_casing")`), parallel-scaling controller is Java (`StarTAbyssalHarvesterMachine.java`) | MIT / LGPL-3.0 | Casing code direct; controller reimplement | **S**/**M** |

### UXV (T12) — star lifter, disk skimmer (black-hole stage 2)

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| **Modular frame, exponential upkeep** (matches our own plan exactly) | Star Tech **K.O.M.A.R.U.** — items/recipes `kubejs/.../progression/komaru/frame.js`, `riftic.js`, `faematter_filaments.js` (MIT); scaling engine `StarTKomaruFrameMachine.java` + 275 KB registry `StarTKomaruFrameMachines.java` + mixin shader renderer (LGPL-3.0) | MIT / LGPL-3.0 | Recipes/items direct (drop optional `flowyan/PlaceableMaxwell` dep, license unchecked); frame scaling + renderer = **reimplement from scratch**, biggest single Java item in this whole catalog | **S** / **L** |
| Circuit continuation | Star Tech `abyssal_processor_mainframe` reaches UXV, `tags.js` | MIT | Code | **S** |
| Visual/naming reference only | GT-- "spintronic" MAX-family textures, `src/main/resources/assets/gtnn/textures/item/` | AGPL-3.0 | **Ideas/look only** — do not copy files (see traps) | — |
| Star lifter / disk skimmer mechanic | No existing multiblock precedent found anywhere in this study | — real physics | Build ourselves (policy's accepted last resort) | **L** |

### OpV (T13) — Kugelblitz forge (black-hole stage 3)

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| Circuit (placeholder only) | GT--/GTCA register the OpV **tag**, no recipe; GT-- "cosmic" texture family | AGPL-3.0 / weak-LGPL | Texture/name reference only | — |
| Modular-ring + upgrade-tree idea | GTNH **Godforge** (TecTech rings, wireless-only power) — TecTech itself is MIT (confirmed, see Planets), but 1.7.10 Forge API, unusable as code | MIT (ideas only in practice) | Ideas only | **L** |
| Photon→micro-black-hole concept | GTL's "Eye of Harmony"/Kugelblitz-adjacent idea — license **contradictory** (CC BY-NC-SA 4.0 in zip vs LGPLv3 on CurseForge, GPL-3.0/AGPL-3.0 code inside) | contradictory | **Paraphrase the physics (public domain), not the text** | **L** |
| Seed/decay/stabilize loop (reused at bigger scale) | Same GTNH containment-field idea as UIV, scaled up | LGPL-3.0 (ideas only) | Ideas only | **L** |

### MAX (T14–15) — the mirror shell, no GTM/addon content exists here at all

| Gap | Best source | License | Take | Effort |
|---|---|---|---|---|
| Everything | **Nothing portable found.** Every "MAX = capstone" precedent in the genre is flagged **anti-pattern** by our own prior research: GTNH Stargate (ideas only, LGPL/GPL/ARR mix), GTL "Door of Creation"/Creative tier ("anticlimactic... avoid"), Monifactory Transdimensional Energy Singularity ("nullifies logistics instead of rewarding it") — see `packs-space.md` §2 | — | Build ourselves; cite public-domain physics (Press & Teukolsky 1972 superradiance; Penrose 1969; Blandford–Znajek 1977) | **L** |
| Texture/name reference only | GT-- "supracausal" MAX family, 15-file voltage superscript set `.../textures/superscript/voltage/` | AGPL-3.0 | Look/name only | — |
| Prerequisite (not content) | `lib/patterns.js` 16-row cap must grow for a megastructure this size — our own code, no external source | — | Our own work | **M** |

## Planet and orbital machines

| Need | Best source | License | Take | Effort |
|---|---|---|---|---|
| Remote-mining/Dyson mechanic numbers (module-count × EU/module × **per-dimension power factor** table of ~45 bodies; cryotheum coolant; decay formula) | **GTNH-Intergalactic** — `GTNewHorizons/GT5-Unofficial:src/main/java/gtnhintergalactic/tile/multi/TileEntityDysonSwarm.java` + `IGConfig.java:30-100`; Space Elevator `tile/multi/elevator/TileEntitySpaceElevator.java` | **MIT**, confirmed twice: byte-identical `archive/original-gtnhintergalactic-license-notice.txt` in the monorepo **and** the standalone [`GTNH-Museum/GTNH-Intergalactic`](https://github.com/GTNH-Museum/GTNH-Intergalactic) repo (same SHA) | Ideas + exact formulas (1.7.10/GT5 API, not copy-pasteable into GTCEu — full Java reimplementation) | **M/L** |
| Multi-star Dyson swarm (GCYR only powers the Sun) | Extend our own installed **GCYR** (`gcyr:DysonSystemController`, UV hull) | LGPL-3.0 | Code, direct extension | **M** |
| Asteroid/orbital remote-mining state machine (non-consumed catalyst; 5-state integrity: `NONE/NORMAL/HOSTILE/SHATTERED/CORRUPTED`, each with `decayRate/isRepairable/isHungry`) | Monifactory **Microverse** — KubeJS `kubejs/server_scripts/microverse/*.js` (LGPL-3.0); state enum `Omicron-Industries/MoniLabs:.../common/machine/multiblock/Microverse.java` (LGPL-3.0, genuinely reusable code, **not** just ideas) | LGPL-3.0 | Code — **except** the multiblock base class (next row) | **M** |
| — pitfall inside the above | MoniLabs' `UniqueWorkableElectricMultiblockMachine` is explicitly "*Copied from CosmicCore with some minor changes (thank you Caitlynn!)*" | **Permission-only**, not LGPL despite sitting in an LGPL repo | **Do not copy** — ask CosmicCore's author (Ghostipedia/Caitlynn) directly, or clean-room it | — |
| QoL: multi-structure manager, schematic paste | [Gregtech Terminals](https://github.com/BgameXL/GTCEu-Terminals) (installed) | MIT | Code | **S** |
| Anti-pattern to avoid | TFG's Ad Astra integration ships Venus/Europa biomes/materials with **zero recipes** — "shipping stub content before the processing loop exists" | LGPL-3.0 (lesson, not code) | Lesson only | — |

## The black-hole project, 4 stages (cross-reference to era tables above)

| Stage | Era | Best concrete source | Verdict |
|---|---|---|---|
| 1. Penrose/Blandford-Znajek engine | UIV | GTNH Pseudostable Black Hole Containment Field (decay/seed/stabilize shape) | Ideas only, LGPL-3.0 core, 1.7.10 Java |
| 2. Accretion-disk skimmer | UXV | No precedent; nearest analog = Monifactory Antimatter Collider shape | Recipes/shape LGPL-3.0, machine class reimplement |
| 3. Kugelblitz forge | OpV | GTNH Godforge (modular ring+upkeep idea only) | Ideas only |
| 4. Mirror shell (finale) | MAX | None — deliberately original, physics-only | Build ourselves |

No studied pack has a finale we should copy even as structure: GTNH Stargate, GTL Door of Creation, and Monifactory's Singularity are each flagged by our own `packs-space.md` §2(2) as anti-patterns (creative-tier/anticlimactic/logistics-nullifying). The K.O.M.A.R.U. frame (UXV table above) is the one *mechanic* worth carrying into stages 2-3 almost unchanged: exponential upkeep scaled by module count, stabilized by a consumable.

## License traps (read before porting anything)

| Source | Trap | Consequence |
|---|---|---|
| **GT-- (AGPL-3.0-or-later, installed)** | Strongest copyleft in the study. Fine as a *downloaded dependency* (we don't redistribute its jar) — our own `CREDITS.md` already notes this correctly for its ore veins. | **Copying its files** (e.g. the 257 MAX-tier circuit textures) into our repo would force those specific files to stay AGPL-3.0, incompatible with our proposed LGPL-3.0/CC BY-SA license unless we formally multi-license them. Treat as look-only. |
| **GTCA (LGPL-3.0, installed)** | No LICENSE file anywhere in [`mordgren/GTCA`](https://github.com/mordgren/GTCA) — the only evidence is one line in `gradle.properties:4` (`mod_license = LGPL-3.0 license`), propagated to Modrinth by the build. | Weaker evidence than a real grant. Fine to keep using as a dependency; if we ever copy actual GTCA code, screenshot/archive the Modrinth declaration first. |
| **GTMThings** (not installed) | **Zero LICENSE/COPYING/NOTICE** anywhere in repo or subfolders — confirmed exhaustively. | Visible source ≠ licensed. Ideas-only at most, and legally murky even for that; don't install expecting reuse rights. |
| **CosmicCore** (Monifactory's library) | Split license: code "LGPL-3.0 unless stated in file header"; `textures/item` & `textures/block` (excl. `iris`) = MIT; everything else under `textures/cosmiccore/`, plus all `.mtl`/`.obj` = **All Rights Reserved** by default (`README.md` "License" section, branch `main-1.20.1-forge`). The multiblock base class Monifactory/MoniLabs uses is **personal permission to them only** ("thank you Caitlynn!"), not a blanket grant. | Never assume "inside an LGPL repo" = safe. Ask the author before reusing that one class. |
| **Monifactory's own textures** | LGPL-3.0 repo license, but `kubejs/attributions.txt` lists real exceptions: `infinity_catalyst.png`/`infinity_ingot.png` from Avaritia (MIT), `phantom_paste.png` from **FramedBlocks (GPLv3!)**, a Tinkers' Construct blood texture (unstated). | A GPLv3 file sitting inside an LGPL-3.0 tree. **Do not copy Monifactory textures at all**, per our own earlier `monifactory.md` verdict — confirmed still correct. |
| **gregicality-legacy** | README claims "LGPL3.0"; actual `LICENSE` file is full **GPL-3.0** (byte-identical to its stated upstream, [`Shadows-of-Fire/Shadows-of-Greg`](https://github.com/Shadows-of-Fire/Shadows-of-Greg) — this answers the user's "Shadows of Greg?" question: it's real, GPL-3.0, and is gregicality-legacy's actual foundation). README also names specific textures/armor credited individually (TheDarkDnKTv-GPLv3, Asther, hjae78, emeraldsemerald/bartworks) with no restated license. | Trust the LICENSE file (GPL-3.0), not the README. Treat the named individual textures with extra caution even under the GPL-3.0 umbrella. "Stellar Forge"/wormhole-chain content **was not found anywhere** in this repo despite exhaustive search — drop that claim from future notes unless a source turns up. |
| **GalacticGreg / "ggfab"** | **Contradiction between research passes.** This session found **no** standalone repo or file header anywhere for either (both 404 on `GTNH-Museum`), meaning the only textually-provable license is the `GT5-Unofficial` monorepo's own LGPL-3.0. Our earlier `gtnh.md` pass claimed GPL-2.0 / AGPL-3.0 respectively, citing "museum repo" licenses we could not re-locate. | Unresolved — **assume the stricter prior claim (GPL-2.0 / AGPL-3.0) until a human re-verifies**, since assuming the more permissive reading is the riskier error. Either way: 1.7.10 Java, ideas-only regardless. |
| **Supersymmetry-Core-Modern** (1.20.1 WIP port) | **No LICENSE file at all.** Derivative of GPL-3.0 `Susy-Core` with no compatible license of its own. | Do not use anything from it. No rocketry content exists there yet anyway (only 36 industrial multiblocks ported so far). |
| **GT-New-Horizons-Modpack quest book** | Root repo is CC BY-NC-SA 4.0 (confirmed, full text in `LICENSE`); the quest-book folder (`config/betterquesting/`) has no explicit carve-out **and** no explicit inclusion. | Treat conservatively as CC BY-NC-SA 4.0 → **NonCommercial clause conflicts with ever monetizing the pack**; paraphrase ideas only, never copy quest text. |
| **TFG quest/field-guide text** | `QuestBook-Modern`/`Field-Guide-Modern` have no license, and TFG's own README admits the text is itself informally borrowed from "GregTech Community Pack Modern." | No chain of title — we can't sub-license what TFG doesn't own. Don't copy. |
| **GTQT** | Triple-locked: AGPL-3.0 code **+** CC BY-NC-SA-**3.0** (NonCommercial) on all text/translations/textures/models, stated explicitly in its own README. Also just a modpack-export repo (no `src/main/java` to read). | Strongest combined lock in the study. Ideas-only, and even "ideas" should avoid anything visual given the explicit NC clause. |
| **GregTech Odyssey** | Three different licenses depending on content: modpack packaging = All Rights Reserved; **GTOCore code** = PolyForm Noncommercial 1.0.0 ([`GTOCore-Main:LICENSE`](https://github.com/GregTech-Odyssey/GTOCore-Main/blob/main/LICENSE)); GTOCore assets = CC BY-NC-SA 4.0; quest data = ARR. | Ideas/mechanics only (PolyForm restricts commercial copying of files, not game-design facts — per our own `other-packs.md` verdict). Two LGPLv3 sub-addons surfaced as a side-lead for later: `ABKQPO/GT-Not-Leisure`, `62832/ArsEnergistique` — not deep-dived this pass. |
| **Our own license compatibility** | Proposed pack license = LGPL-3.0 code / CC BY-SA 4.0 textures. | MIT and LGPL-3.0 sources absorb cleanly (MIT ⊂ LGPL-3.0 permissions). GPL-3.0/AGPL-3.0 files we do copy must be **segregated and kept under their own license** (e.g. `third_party/<name>/` + header, exactly the convention `monifactory.md` already recommends) — don't silently relabel them LGPL-3.0. CC BY-NC-SA / no-license / ARR sources: do not copy, full stop. |

## Recommended porting order

1. **UHV gap-fill (S, days)** — write recipes for GTCA's already-installed Tegmark Forge/Nano Forge/PCB MkII, and call Monifactory's `registerFusionTier(UHV)` for a Fusion MK4. Zero new installs, cheapest win, unblocks nothing downstream but closes an existing hole.
2. **UEV hull/casing/hatch scaffold (S, before any other UEV+ work)** — port `Post_UV_Components.js` almost verbatim (LGPL-3.0, re-ID items). This is GTM's actual structural gap; every era above UHV depends on it existing first.
3. **UEV/UIV circuits + superconductors (S)** — Star Technology's `runic`/`draconic` families and `enriched_pallarovium_alloy`/`rhenium_super_composite_alloy` wires, MIT, no Java dependency — simpler than Monifactory's microverse-gated "Extradimensional" alternative, so do this before touching MoniLabs content.
4. **UEV Stellar Forge (S recipes / M controller)** — port Star Tech's Hell Forge recipes directly; reimplement the ~210-line temperature-decay controller in our own Java (small, self-contained).
5. **UXV K.O.M.A.R.U.-derived frame (S recipes / L Java) — start this early**, in parallel with step 3-4, because it is the single largest Java lift in the whole catalog (scaling engine + 275 KB registry + mixin shader renderer) and directly matches our plan's "modular frame, exponential upkeep" need for the disk skimmer/Kugelblitz stages too.
6. **Planets/orbit, in parallel with 2-5** (independent track per `viaje.md`'s own parallelization note): extend GCYR's Dyson controller to other stars (M); adapt MoniLabs' `Microverse` enum for asteroid/orbital remote mining, cleanly excluding the CosmicCore-derived base class (M).
7. **UIV Penrose engine (L)** — design from GTNH's containment-field *idea* only; no code to port. Build after step 5 frees up Java capacity.
8. **UXV/OpV/MAX finale (L, last)** — disk skimmer, Kugelblitz forge, mirror shell: original work, physics citations only, built on the K.O.M.A.R.U.-derived frame tech from step 5. Grow `lib/patterns.js` past 16 rows before attempting the mirror shell specifically.

## Key sources (owner/repo — license — role)

- [`StarT-Dev-Team/Star-Technology`](https://github.com/StarT-Dev-Team/Star-Technology) — MIT — KubeJS circuits/SC/coils/quests, best single UEV-UXV source
- [`StarT-Dev-Team/StarT-Core`](https://github.com/StarT-Dev-Team/StarT-Core) — LGPL-3.0 — Java controllers (Hell Forge, Abyssal Harvester, Fusion MK4, K.O.M.A.R.U.)
- [`Omicron-Industries/Monifactory`](https://github.com/Omicron-Industries/Monifactory) — LGPL-3.0 — `Post_UV_Components.js`, circuits, microverse KubeJS, Helical Fusion call
- [`Omicron-Industries/MoniLabs`](https://github.com/Omicron-Industries/MoniLabs) — LGPL-3.0 (+MIT FastNoiseLite) — Microverse state machine, Antimatter/Omnic machine classes
- [`GregTechCEu/gregicality-science`](https://github.com/GregTechCEu/gregicality-science), [`gregicality-multiblocks`](https://github.com/GregTechCEu/gregicality-multiblocks) — MIT — Fullerene/Kevlar/Kapton/Pedot chains, 1.12.2 Java, cheapest real chemistry source
- [`GregTechCEu/gregicality-legacy`](https://github.com/GregTechCEu/gregicality-legacy) — GPL-3.0 — ideas only
- [`SymmetricDevs/Supersymmetry`](https://github.com/SymmetricDevs/Supersymmetry) (branch `master-ceu`) — LGPL-3.0 — `groovy/` recipe layer
- [`SymmetricDevs/Susy-Core`](https://github.com/SymmetricDevs/Susy-Core) — GPL-3.0 — `VoidingMultiblockBase.java`, ideas only
- [`GTNewHorizons/GT5-Unofficial`](https://github.com/GTNewHorizons/GT5-Unofficial) — root LGPL-3.0; TecTech/GoodGenerator/KekzTech/Intergalactic MIT (archive-notice + `GTNH-Museum` confirmed); GalacticGreg/ggfab license unresolved (§traps)
- [`Frontiers-PackForge/CosmicCore`](https://github.com/Frontiers-PackForge/CosmicCore) (branch `main-1.20.1-forge`) — split license, see traps
- [`Arborsm/GT--`](https://github.com/Arborsm/GT--) — AGPL-3.0-or-later — installed; MAX-tier texture reference
- [`mordgren/GTCA`](https://github.com/mordgren/GTCA) — LGPL-3.0 (weak evidence) — installed; Tegmark/PCB/Nano Forge
- [`liansishen/GTMThings`](https://github.com/liansishen/GTMThings) — no license — do not use
- [`GTQT/GT-QuantumTransition`](https://github.com/GTQT/GT-QuantumTransition) — AGPL-3.0 + CC BY-NC-SA-3.0 — ideas only, low confidence even there

## Gaps / uncertainties

- "Stellar Forge" and the Reissner–Nordström→Kerr-Newman wormhole chain, previously attributed to `gregicality-legacy`/Supersymmetry, **could not be found anywhere** in either codebase after exhaustive search — treat our own prior catalogs' mention of it as unconfirmed.
- GalacticGreg/ggfab license is a genuine contradiction between this pass and `gtnh.md`'s earlier pass (see traps) — needs a human to re-check GTNH's own wiki/Discord, not just GitHub.
- Monifactory's Prismatic Crucible looked mid-refactor (controller craftable, recipe-type registration commented out) — re-check before relying on it.
- GTQT's actual UHV+ multiblock names were not identified (its repo is a modpack export with no Java source; scripts live in `overrides/groovy`/`overrides/scripts`, not opened this pass).
- Texture pixel-level provenance (vs. documentation-level) was not visually spot-checked anywhere in this study — recommend a human glance before shipping any ported PNG verbatim.
