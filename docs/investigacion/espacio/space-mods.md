# Space mods for the GregTech campaign — comparison & recommendation

Research date 2026-10-24. Pack: MC 1.20.1, Forge 47.4.28, GTCEu 7.5.3 (pinned), KubeJS 2001.6.5. Re-evaluates the
2026-10-24 orchestrator decision "GCYR is space; Ad Astra out" (`docs/integracion/mods-tecnicos.md`) against GCYR's
actual source and the wider 1.20.1-Forge space-mod field. **Verdict: that decision holds, now with hard evidence.**

## 0. TL;DR

**Primary: keep GCYR (Gregicality Rocketry) 0.2.9**, already pinned (`pack/mods/gcyr.pw.toml`). It is the only
option that is (a) GT-native (Java multiblocks + recipe types, not a bolt-on), (b) already gates rockets/stations
behind GT Assembler recipes out of the box, (c) LGPL-3.0 (full reuse/redistribution rights), and (d) the *only*
mod surveyed that already stubs a black-hole destination. **Do not add Ad Astra or any Ad-Astra-family mod** —
every pack that uses Ad Astra (GTO, Cosmic Frontiers, GTL, TFG) had to hand-build an entire GT compatibility layer
because Ad Astra exposes nothing to KubeJS, and running it alongside GCYR would duplicate oxygen/rockets/materials.
**Fallback/combination:** GCYR for dimensions+rockets+stations+Dyson sphere, **GTCEu's own native `.dimension()`
KubeJS recipe condition** (zero Java, works today) for all per-planet machine/recipe behaviour, and the pack's
existing vein-drill multiblock design for every resource (GCYR's own ore gen must be suppressed — see §7).

## 1. Comparison — installable mod options (1.20.1 Forge)

| Option | Last 1.20.1-Forge release | License verdict | Dimensions | Oxygen/temp/gravity → KubeJS? | Rockets/fuel | GT integration work needed |
|---|---|---|---|---|---|---|
| **GCYR 0.2.9** (installed) | 2026-07-01 stable; dev snapshot 2026-09-08; 12 open issues [[releases]](https://github.com/Argent-Matter/gcyr/releases)[[repo]](https://api.github.com/repos/Argent-Matter/gcyr) | **LGPL-3.0-or-later** — OK to include, OK to copy code (attribution) [[LICENSE]](https://raw.githubusercontent.com/Argent-Matter/gcyr/master/LICENSE) | Luna, Mars, Mercury, Venus + orbits; 2nd system stub Proxima Centauri b; `black_hole_orbit` already registered | Java-only API, but **dimension-level gating is free via GTCEu itself** (not GCYR) — see §3 | Advanced-Rocketry-style built-from-parts; parts **already GT Assembler recipes** (HV→ZPM); any GT fluid pluggable as fuel; realistic distance-based fuel cost | Low — mostly curation (worldgen, planet JSON for new bodies) |
| **Ad Astra** (base) | 1.15.21, 2026-09-07, hotfix-only; Forge line frozen, dev moved to NeoForge/Fabric 1.21 [[versions]](https://api.modrinth.com/v2/project/ad-astra/version) | Split **MIT (code) / ARR (assets)** "Terrarium License v1" — OK to include, OK to copy code, NOT assets [[LICENSE]](https://raw.githubusercontent.com/terrarium-earth/Ad-Astra/1.20.x/LICENSE) | Moon, Mars, Mercury, Venus, Glacio (2 systems) | **No.** No KubeJS plugin at all (0 GitHub code-search hits for "kubejs"); oxygen/temp are Java-only `OxygenApi`/temperature classes | 4 tiers, Fuel Refinery; GT fluids pluggable via tag edit (proven in TFG) | **High** — every pack using it wrote a custom Java condition class (TFG's `TFGRecipeSchemaBindings`) |
| **Ad Astra: Rocketed** (celsiusqc) | 1.0.3, 2024-04-05 — **stale 2.5y** [[Modrinth API]](https://api.modrinth.com/v2/project/ad-astra-rocketed) | **ARR** (`LicenseRef-All-Rights-Reserved`) — packwiz-link OK, code/assets NOT reusable | +T5–7 rockets, reuses host planets | Same as Ad Astra | T5–7 only, cosmetically reuses Tier-4 model | N/A (addon only, needs Ad Astra) |
| **Ad Astra: Giselle Addon** | 2026-08-30, active [[Modrinth API]](https://api.modrinth.com/v2/project/ad-astra-giselle-addon) | **MIT**, author states "Can use in modpacks under license" — OK to include/copy | none (utility addon) | n/a | Fuel Loader + **hopper/AE2-automatable NASA Workbench** (ideas worth copying) | Addon only, needs Ad Astra |
| **Ad Extendra** (DRD2k8 continuation) | 0.1.2, 2024-07-07, repo pushed 2026-09-01 [[Modrinth]](https://modrinth.com/mod/ad_extendra-continuation) | **MIT** (Modrinth-declared; GitHub auto-detect shows none — minor inconsistency) | +Jupiter/Saturn/Uranus/Neptune, 9 dwarf planets, Proxima Centauri b (moons "planned", not shipped) | n/a | Requires Ad Astra ≥1.15.18 | Addon only, needs Ad Astra |
| **"Stellaris"** | n/a | CC-BY-NC-SA-4.0 | own, unrelated | n/a | n/a | **Discard** — Fabric/NeoForge only, no MC 1.20.1, not an Ad Astra addon [[Modrinth]](https://modrinth.com/mod/stellaris) |
| **Create: Northstar** (orig.) | 2024-08-09, abandoned, solo dev [[Modrinth]](https://modrinth.com/mod/create-northstar) | Claimed MIT but **no LICENSE file in repo**, open issue since 2024-07-30 [[issue #14]](https://github.com/lightning2401/northstar/issues/14) | 4 worlds (Moon/Mars shown) | n/a | Create-based | N/A — superseded |
| **Northstar Redux** | 0.6.6, 2026-09-23, active, 1.20.1-Forge + 1.21.1-NeoForge in parallel [[Modrinth]](https://modrinth.com/mod/northstar-redux) | **MIT**, real `LICENSE.md` [[LICENSE]](https://github.com/Astronauts-of-Create/Northstar-Redux/blob/1.20.1/dev/LICENSE.md) | Mercury, Venus, Mars+Deimos, Ganymede, Io; real orbital mechanics | **Own KubeJS plugin** registers custom planets/dimensions/fuel types (`NorthstarKubeJsPlugin`) — best 3rd-party KubeJS story of any non-GT option | Create-contraption rockets | High — Create-based, no GT recipe hooks; would still need a GT bridge |
| **Creating Space** | "1.20.1_1.7.13", 2026-03-31; 1.21.1 gets features first [[Modrinth]](https://modrinth.com/mod/creating-space) | **MIT**, clean `LICENSE.txt` [[LICENSE]](https://raw.githubusercontent.com/RealAntEngineer/creating_space/1.21.1-release/LICENSE.txt) | Earth/Moon/Mars orbits+surfaces, Venus (partial) | No KubeJS plugin found | Create-contraption rockets, cryogenic propellant | High — no KubeJS, bigger install base but same bridge-building cost as Ad Astra |
| **Galacticraft** | **None exists** | MIT (both lines) | n/a | n/a | n/a | **Not viable** — official Forge frozen at MC 1.12.2 [[Legacy]](https://github.com/TeamGalacticraft/Galacticraft-Legacy); active GC5 rewrite is Fabric-only, pre-alpha, no Forge ETA, stated in the mod's own README [[GC5 README]](https://github.com/TeamGalacticraft/Galacticraft/blob/main/README.md) |
| **Other GTCEu-native space addon** | — | — | — | — | — | **None found.** All 22 repos under github.com/GregTechCEu were checked; none are space-related. GCYR's real org (Argent-Matter) has no second space addon either. |

## 2. Prior art — what other serious GT packs actually use (not installable options for us)

| Pack | Space solution | License (their own layer) | Note |
|---|---|---|---|
| **GregTech Odyssey (GTO)** | Ad Astra, fully mainlined (Moon→Mars→Venus→Mercury→Ceres→Io→Ganymede→Titan→Pluto→interstellar), T1–8 fuel chemistry, all in closed Java (GTOCore) | PolyForm-Noncommercial + CC-BY-NC-SA + ARR, mixed [[repo]](https://github.com/GregTech-Odyssey/GregTech-Odyssey) | Ideas only; confirms Ad Astra is the de facto standard base, but needs a from-scratch Java core to integrate |
| **Cosmic Frontiers** | Ad Astra (Moon + exoplanets), T5-7 "Cosmic Rocketry"; their own drill pattern extends to the Moon | LGPL-3.0 (pack/CosmicCore code) + ARR (some assets); "not meant for use outside this pack" | Ideas only (see local note `other-packs.md`) |
| **GregTech Leisure (GTL)** | `ad_astra` 1.15.20 **+ `ad_astra_rocketed` 1.0.5 as a hard dependency** for T5–7 | GTLCore itself undocumented/no public 1.2.x source; Rocketed = ARR | Ideas only — and a live warning: GTL ships the same stale/ARR Rocketed addon flagged above (local note `gtl.md`) |
| **TerraFirmaGreg (TFG)** | Ad Astra, explicitly marked **"(WIP)"** by its own authors; Venus/Europa recipe files are literal empty stubs | Core-Modern = LGPL-3.0 (code), ad-hoc/ARR art | Best evidence of *how* to integrate Ad Astra with GT (`TFGRecipeSchemaBindings.isOxygenated`, GT-Assembler rocket parts) — but proves the integration labor is real and nontrivial (local note `tfg.md`) |
| **Star Technology** | **Not a planet mod at all.** Gates existing dimensions (Nether, End) + one custom desert world (Abydos) behind researched, built, and *discovered* Stargates (`dimensional_pinging.js`, `dimensional_stages.js`); hazards (radiation/erosion/abyssal drain) via config scripts, countered by armor/Curios talismans | MIT | Not a competing option — a different genre (gate-existing-dimensions, no Moon/Mars/orbit). Its "build+discover the gate, cancel `EntityTravelToDimensionEvent` without the stage" pattern is a good KubeJS idea for *any* future dimension gate (local note `star-technology.md`) |

## 3. GCYR deep-dive (source-verified, `Argent-Matter/gcyr`, commit `2c5f875`)

- **Not under GregTechCEu/Gregicality orgs** despite the name — real owner is `Argent-Matter` (40★/17 forks), a small
  3-core-dev team (screret, jmoiron, NemEzanevem) crediting *Advanced Rocketry* as inspiration
  [[repo]](https://github.com/Argent-Matter/gcyr). Forge range `[47.4,)` — compatible with our 47.4.28
  [[libs.versions.toml]](https://github.com/Argent-Matter/gcyr/blob/master/gradle/libs.versions.toml). Its only
  tracked Modrinth dependency is "GregTechCEu Modern" with **no pinned version range** recorded
  [[version meta]](https://api.modrinth.com/v2/version/Ne2N0mLN) — exact 7.5.3 compatibility is plausible but **not
  independently confirmed; test empirically.**
- **Planets are datapack/JSON-driven** (`PlanetData extends SimpleJsonResourceReloadListener`), with separate
  `Galaxy`/`SolarSystem`/`Planet` records (translation, dimension, orbit dimension, optional parent dimension,
  rocket tier, gravity, distance). The README states outright: *"Ability to easily add your own Custom Planets
  with Datapacks/KubeJS!"* — **our later-era "several planets, then many, then other star systems" requirement
  is additive JSON authoring, not Java**, for anything that doesn't need a brand-new mechanic.
- **The black hole is already there.** `GCYRDimensions.BLACK_HOLE_ORBIT` is a registered dimension key, paired with
  a complete, working ray-marched black-hole GLSL shader (accretion disk + gravitational lensing,
  `assets/gcyr/shaders/core/black_hole.fsh/.vsh`). No other mod surveyed has anything resembling this. Actual
  black-hole *gameplay* (multiblocks/recipes/hazards) was not found — the destination exists, the campaign content
  is ours to build.
- **Rockets are already GT-native.** Fuel tanks/motors are literal GT Assembler recipes using GT materials/tiers
  (`basic_fuel_tank` HV, `advanced_rocket_motor` IV, `elite_fuel_tank`/`elite_rocket_motor` ZPM —
  `data/recipe/MiscRecipes.java:209-267`); any GT fluid can become rocket fuel via
  `RocketFuelRecipeBuilder.rocketFuel(fluidOrTag, specificEnergy, tierRange)`; motor/tank tiers are KubeJS-extensible
  block types (`GCYRKubeJSPlugin` registers `gcyr:fuel_tank`/`gcyr:rocket_motor`, tier/thrust/efficiency all
  scriptable). Fuel cost scales by real inter-planet distance (`RocketPerformance.transferFuel`,
  `referenceFuel = -3000 + 15500·d^0.1 + 8000·(e^(max(0,d-1)/15)-1)`), config base costs 8/14/26/48 buckets for
  moon/system/galaxy/anywhere — "costly but not punishing" by construction, not a flat tax.
- **Stations, satellites, Dyson sphere are real code**, not vaporware: `SpaceStationPackagerMachine` (build→package→
  deploy via an ID-chip-tagged item), `DysonSystemControllerMachine`/`DysonSystemSavedData`/`DysonSphere` (a working
  GT multiblock that disables day/night system-wide when active, own `dyson_controller` EU recipe type, own
  `DysonSphereCondition`), and a `Satellite`/`LaserSatellite` framework. **However the mod's own README and Modrinth
  page explicitly flag satellites (incl. mining lasers) as "(NYI)"** — don't plan early quest content on them.
  A `SPACE_ELEVATOR` multiblock and a `DRONE_HANGAR` multiblock also exist (likely bulk cargo without rockets) but
  their recipe content wasn't fully enumerated — verify before relying on them for inter-planet transport.
- **Environment systems are self-contained**, explicitly adapted from Ad Astra's MIT code (`EntityOxygenSystem`,
  `EntityTemperatureSystem`, headers read *"Proudly copied from Ad Astra"*) — so we get Ad-Astra-grade
  oxygen/temperature without an Ad Astra dependency. Oxygen has local "distributor bubble" overrides plus a real GT
  machine, `OxygenSpreaderMachine` (own `oxygen_spreader` recipe type) — i.e. oxygen is already a machine's job, not
  a player's. The 0.2.9 changelog itself confirms temperature is a tuned, real hazard: *"heat/cold shielding allows
  players to safely visit venus/mercury... without using potions"* [[version 0.2.9 changelog]](https://api.modrinth.com/v2/version/Ne2N0mLN).
  **No radiation mechanic found** (same conclusion as Ad Astra — genre-wide gap).
- **The single most important finding applies to GCYR *or* any dimension:** GTCEu Modern itself (our already-pinned
  base mod) ships a native `DimensionCondition` recipe condition **exposed to KubeJS with zero Java**:
  `GTRecipeJS.dimension(ResourceLocation, boolean reverse)`
  [[GTRecipeSchema.java:953-958]](https://github.com/GregTechCEu/GregTech-Modern/blob/1.20.1/src/main/java/com/gregtechceu/gtceu/integration/kjs/recipe/GTRecipeSchema.java),
  backed by [[DimensionCondition.java:34-104]](https://github.com/GregTechCEu/GregTech-Modern/blob/1.20.1/src/main/java/com/gregtechceu/gtceu/common/recipe/condition/DimensionCondition.java),
  plus an analogous `.biome(...)` condition and a `.cleanroom(...)` condition. Multiple `.dimension(...)` calls OR
  together (`isOr()==true`). **This directly answers the user's own example ("a KubeJS recipe condition on
  dimension") — it already works, today, against any GCYR planet, with no addon-specific code.** GCYR additionally
  registers its own `orbit` and `dyson_sphere` conditions in the same registry
  (`GCYRRecipeConditions`/`GTRegistries.RECIPE_CONDITIONS`) for orbit-only / active-Dyson-Sphere-only recipes. What
  is **not** exposed to KubeJS by either mod: local-oxygen-bubble-value or temperature-value recipe conditions
  (whole-dimension gating is free; bubble-aware gating needs a ~40-line Java `RecipeCondition`, for which GCYR's own
  `OrbitCondition`/`DysonSphereCondition` are a ready template), gravity-based recipe/output modifiers (gravity only
  drives rocket/entity physics in the source reviewed), and dimension-gated **multiblock formation** (only
  dimension-gated *recipe execution* is native).
- **Worldgen gap — needs mitigation.** GCYR adds its own Mars ore veins through GTCEu's own native
  `GTOreDefinition`/`VeinedVeinGenerator`/`DikeVeinGenerator` system (`common/worldgen/GCYROres.java`), but the
  materials are **ordinary GT materials already on Earth** (Iron, Hematite, Gold, Pyrite, Copper, Nickel, Garnierite,
  Pentlandite, Cobaltite, Tungstate, Scheelite, Bastnasite, Neodymium, Monazite, Molybdenite) — this **violates the
  pack's "unobtainable on Earth" rule as shipped.** The fix is low-risk: because GCYR routes worldgen through GTCEu's
  own vein-registry pipeline (unlike Ad Astra's foreign-dimension integration, which has a documented
  `tag_prefix`-registration bug family — [[GT-Modern #262]](https://github.com/GregTechCEu/GregTech-Modern/issues/262),
  [[#621]](https://github.com/GregTechCEu/GregTech-Modern/issues/621), both pre-7.x and possibly already fixed but
  **unverified against 7.5.3**), removing/replacing GCYR's vein list is the same kind of edit already used for Earth.
  Moon/Mercury/Venus/Proxima ore-vein coverage was **not exhaustively checked** — only Mars veins were located.
- **Known reliability bugs (own issue tracker, unresolved as of research):**
  [[#91]](https://github.com/Argent-Matter/gcyr/issues/91) — rocket freezes the server at the exact moment of
  interplanetary teleport (~y500), reported against GTCEu 7.2.1-snapshot, opened 2025-10-01, no confirmed fix.
  [[#122]](https://github.com/Argent-Matter/gcyr/issues/122) — Rocket Scanner multiblock intermittently fails to
  capture the full built rocket ("disappears or builds partway"), core devs still diagnosing as of 2026-08-22.
  12 open issues total; 69 lifetime (mostly closed) — normal pre-1.0 churn, not abandonment.
- **Checked in game (2026-10-24, GCYR 0.2.9 + GTM 7.5.3; test `tools/test/overlay/kubejs/server_scripts/gg_test_gcyr_flight.js`,
  client suite = real client and player on the integrated server):
  - **#91 does not reproduce.** Earth -> Moon -> Earth round trips: the server kept ticking (longest tick at a
    teleport 2.4 s), the rider is still seated after every teleport, one rocket arrives and none stays behind. GCYR
    still moves the riders twice (the rocket's `changeDimension` moves them, then `goToDestination` again; the
    2026-09 dev snapshot keeps that code). A dedicated server with a remote client was not tested.
  - **#122 reproduces, two causes, fixed in the pack** (`server_scripts/grindless/space/rocket_scanner.js`): the scanner
    measures pad and tower only when the structure forms, so a tower that grows later is scanned at the old height (top
    of the rocket left behind, seat popped off as an item) - the right-click on the controller now re-checks the
    structure; an asymmetric pad is laid out mirrored (never forms facing N/S; forms facing E/W but "Build" scans the
    mirrored area) - the right-click is refused with a message until the pad is symmetric.
  - **Third bug: the climbing rocket burns its own rider** (`burnEntities`, 15 s of fire) when the rider's client is
    a tick ahead, because vehicle movement is client-side: 19 of 20 health points leaving the Moon. Fixed in the pack
    (`space/rocket_riders.js`: riders get fire resistance).
  - **A suit without oxygen does not protect**: the `gcyr:is_spacesuit` tag is empty in 0.2.9. The chestplate holds
    16 B of any `forge:oxygen` fluid (1 mB every 3 ticks, about 40 min); with it the full suit keeps 60-363 K (Moon
    113 K). Launch needs 8 B in the tank for the Moon (2 basic tanks); a leg burns about 1.2 B. Landing needs Space
    held (a rocket that hits the ground with fall distance > 48 explodes).

## 4. License verdicts (exact)

| Mod | License | Redistribute via packwiz? | Copy code? | Copy assets? |
|---|---|---|---|---|
| GCYR | LGPL-3.0-or-later | ✅ | ✅ (attribution) | ✅ (same license) |
| Ad Astra | MIT (code) / ARR (assets) | ✅ | ✅ | ❌ |
| Ad Astra: Rocketed | ARR (`LicenseRef-All-Rights-Reserved`) | ✅ (packwiz = link to official CDN, not rehosting) | ❌ | ❌ |
| Ad Astra: Giselle Addon | MIT, modpack use explicitly blessed | ✅ | ✅ | ✅ |
| Ad Extendra | MIT (Modrinth-declared) | ✅ | ✅ | ✅ |
| Northstar (original) | Claimed MIT, no LICENSE file (open gap) | ⚠️ unclear | ⚠️ unclear | ⚠️ unclear |
| Northstar Redux | MIT, real LICENSE.md | ✅ | ✅ | ✅ |
| Creating Space | MIT | ✅ | ✅ | ✅ |
| Galacticraft (both lines) | MIT | n/a (not viable, §1) | — | — |
| GTO / Cosmic Frontiers / GTL / TFG (as packs) | Mixed LGPL/ARR/noncommercial, each pack's own layer | n/a — not installable | **Ideas only**, never literal code/assets | ❌ |
| Star Technology (as pack) | MIT | n/a — not a space mod | Ideas only | ❌ |

## 5. Recommendation

1. **Primary: keep GCYR.** It is already in the pack, LGPL-3.0, GT-native end to end, and structurally matches every
   stage the user described (hand-built first rocket → automated bases via GT machines already wired to Assembler
   recipes → orbital stations/Dyson sphere for system-scale industry → a literal stubbed black-hole destination for
   the finale). No other candidate gets more than "ideas."
2. **Do not install Ad Astra or any Ad-Astra-family mod** (Rocketed, Giselle Addon, Ad Extendra, Per Spatium).
   Reconfirms the 2026-10-24 decision, now with evidence: Ad Astra exposes **zero** KubeJS surface (confirmed empty
   code search), so every GT pack that uses it reimplements an oxygen condition, rocket-part gating, and fuel tags
   from scratch in Java/KubeJS — work GCYR already did for us, GT-natively. Running both would double oxygen
   systems, rocket economies, and materials, and reintroduce the exact "generators/oxygen duplicate GT" problem the
   orchestrator already flagged.
3. **Mine, don't install, three things:** Giselle Addon's hopper/AE2-automatable "Automation NASA Workbench" and Fuel
   Loader (pattern for auto-launching rockets without manual clicks — relevant to our "no manual gathering" rule even
   though rockets aren't gathering per se); Ad Extendra's outer-planet/dwarf-planet list (Jupiter, Saturn, Uranus,
   Neptune, Ceres, Pluto, etc. — same bodies GTO/GTL already converged on) as a candidate roster for GCYR's own
   datapack-driven planet system; Northstar Redux's `NorthstarKubeJsPlugin` as a second working example (alongside
   GCYR's own) of how a space mod *can* expose planet/dimension registration to KubeJS cleanly.
4. **Fallback only if GCYR stalls or a specific mechanic proves unbuildable:** there is no drop-in alternative — the
   field is Ad Astra-family (high integration tax, duplicate systems) or Create-based (Northstar Redux/Creating
   Space, no GT hooks at all, same integration tax as Ad Astra but less precedent). If GCYR development stalls, the
   realistic fallback is forking GCYR itself under LGPL-3.0 rather than switching mods.

## 6. What we build ourselves in KubeJS (regardless of the choice above)

- **Suppress GCYR's (and vanilla GT's) ore-vein worldgen on all planet dimensions**, same mechanism already used for
  Earth; feed the existing vein-drill multiblock's per-dimension sample table with planet-exclusive materials only
  (reuse GCYR's own exclusive registrations — MartianRockDust, Fluorite, Kapton-K, Bisalloy400 — plus new ones per
  later planet). This is the one hard requirement GCYR does not satisfy out of the box.
- **Per-planet recipe/machine behaviour** — pure KubeJS, zero Java, via GTCEu's native
  `.dimension('gcyr:mars')` / `.biome(...)` conditions on any recipe, plus GCYR's `.orbit`-equivalent condition (via
  `GTRegistries.RECIPE_CONDITIONS`, confirm/add a KubeJS-sugar binding if one isn't already exposed) for orbit-only
  or Dyson-Sphere-gated recipes.
- **Local energy per planet** — solar intensity, local fuels, and "beamed from home" are all pack-original: GCYR's
  `CASING_BEAM_RECEIVER` block (seen in a multiblock pattern) and Drone Hangar are the likeliest existing scaffolds
  to build on, but neither's full recipe logic was confirmed in this pass — inspect before committing a design.
- **Transport of items/fluids/energy between planets** — GCYR's Space Elevator (its own `SPACE_ELEVATOR_RECIPES`
  type, UV-ish tier) is the natural bulk-cargo multiblock; verify its actual recipes support the "costly to set up,
  not punishing" curve the user wants, or author our own recipes against that recipe type.
- **Orbital-only exploitation (mine without landing)** — Space Station Packager + Satellite framework is the base;
  since satellites/mining-lasers are NYI in 0.2.9, a pack-made orbital-extraction multiblock/recipe gated with the
  `orbit` condition is likely needed for this specific requirement.
- **The black-hole megaproject** — dimension + visuals exist; 100% of the gameplay (multiblocks, recipes, hazards,
  rewards) is ours to design.
- **Radiation** — no mechanic exists in GCYR or Ad Astra; if required as its own hazard axis distinct from
  temperature, design and implement from scratch (likely reusing GTCEu's existing Cleanroom/sterile-hatch condition
  pattern rather than inventing a parallel system).
- **(Last resort, small) Java** — only if local-oxygen-bubble-aware or gravity-aware recipe conditions, or
  dimension-gated multiblock *formation* (not just recipe execution), turn out to be required; GCYR's own
  `OrbitCondition`/`DysonSphereCondition` (~40 lines each) are a direct template to copy under LGPL-3.0.

## 7. Risks

- **Worldgen duplication** (§3) must be fixed before any Mars content ships, or the pack's core "unobtainable on
  Earth" rule is silently broken on day one.
- **Rocket reliability** ([#91](https://github.com/Argent-Matter/gcyr/issues/91), [#122](https://github.com/Argent-Matter/gcyr/issues/122)):
  checked in game (section 3): #91 did not reproduce, #122 and the burning rider are fixed by pack scripts. Run
  `gg_test_gcyr_flight` (client suite) again after any GCYR update; LGPL-3.0 means we can patch/fork if needed.
- **Satellites/mining lasers are NYI** — don't schedule orbital-mining-without-landing content assuming GCYR ships
  it; budget for building it ourselves (§6).
- **Proxima Centauri b (2nd system) is visibly less finished** (placeholder texture, `// TODO` comment found in
  source) — treat "several star systems" content as something we substantially author, not receive for free.
- **GTCEu 7.5.3 compatibility is plausible, not proven** — GCYR's Modrinth dependency record pins no version range;
  no in-repo evidence of testing against 7.5.3 specifically was found. Test on first integration attempt.
- **Small team / bus factor** — 3 core devs vs. GTO's/Cosmic Frontiers' larger teams; mitigated by LGPL-3.0
  forkability, not by activity level alone.
- **No gravity-based or radiation-based machine effects exist anywhere surveyed** — if the "gravity/radiation change
  how machines work" requirement is meant literally (not just travel/player effects), that entire axis is greenfield
  design work, independent of which space mod is chosen.
- **Genre-wide complaints corroborated with direct citations** (not GCYR-specific, but worth designing against):
  "empty planets" / exploration-light progression
  ([modpack maintainer issue](https://github.com/xJon/The-1.12.2-Pack/issues/176)); automation-density tick lag from
  dozens of machines on one off-world chunk
  ([Ad Astra #425](https://github.com/terrarium-earth/Ad-Astra/issues/425)); multi-dimension chunk-loading lag
  ([Ad Astra #286](https://github.com/terrarium-earth/Ad-Astra/issues/286)); oxygen-tank refill bugs acknowledged by
  a modpack maintainer as "an issue with Ad Astra, not something we've done"
  ([FTB issue #4436](https://github.com/FTBTeam/FTB-Modpack-Issues/issues/4436)). These argue for our
  fully-automated, no-player-babysitting design (already the pack's rule) rather than any change of mod choice.

## 8. Could not verify (flagged honestly)

- GCYR's exact required/tested GTCEu version range against 7.5.3 specifically (Modrinth records no pin; build files
  use an indirect version-catalog reference not resolved in this pass).
- Full recipe content of GCYR's Space Elevator and Drone Hangar multiblocks (classes/recipe types confirmed to
  exist; their complete recipe lists were not enumerated).
- Whether GCYR adds its own ore veins on Moon/Mercury/Venus/Proxima (only Mars veins were located; absence elsewhere
  not exhaustively confirmed).
- GCYR-specific Embeddium or AE2 conflict reports — none found, but absence of evidence is not strong evidence here;
  not independently tested in-game.
- GCYR multiplayer/performance characteristics specifically (dimension-loading cost, satellite tick cost) — no
  dedicated report found.
- Whether a KubeJS-facing sugar method for GCYR's own `orbit`/`dyson_sphere` conditions already exists (they sit in
  the right registry; a dedicated `.orbit()`-style binding like GTCEu's `.dimension()` was not directly located).
- "Ad Astra: Distant Horizons" and "Ad Astra: Per Spatium" licenses (CurseForge blocked automated fetches with
  HTTP 403 for both).
- Full Reddit thread content for genre complaints — Reddit blocked all automated access; citations above are limited
  to titles/URLs corroborated through GitHub issues that quote or link them, never read directly on Reddit itself.
