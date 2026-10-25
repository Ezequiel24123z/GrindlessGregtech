# Complexity audit per tier — Gregtech Grindless (v0.5.0)

Date: 2026-10-24. Sources: `AGENTS.md`, `DECISIONS.md`, `docs/journey.md`, `docs/eras/*.md`, `pack/kubejs/startup_scripts/grindless/**`, `pack/kubejs/server_scripts/grindless/**`, `pack/config/ftbquests/quests/chapters/*_age.snbt`, validator reports (`scratch/release/val-0.5.0/*.{txt,json}`), `docs/research/space/gtm-tiers.md`.

Steam–HV are **built** (real KubeJS code, tested in-game). EV–IV are **designed** (`docs/eras/ev.md`, `iv.md`), without their own code or validator yet (there is no `ev.json`/`iv.json` in `tools/analysis/tiers/`, nor complete `ev_age`/`iv_age` in the quest book). That distinction is kept in all tables.

## 1. Master table

| Metric | Steam | LV | MV | HV | EV (design) | IV (design) |
|---|---|---|---|---|---|---|
| Own multiblocks (registered) | 5 (+11 convenience, v0.5.2) | 6 (+1 convenience) | 6 (+7 convenience) | 7 | 11 (0 built; 7 before 2026-10-25) | 8 (0 built) |
| GTM multiblocks that become useful | — (no electricity) | EBF + 1-block machines | MV fluid drill | cleanroom, cracker, large chemical reactor, large steel boiler/turbine | freezer, distillation tower, large combustion engine/gas turbine, large EV miner | assembly line, large IV miner, parallel ×4, quantum chest/tank |
| Process lines (tabulated in the era) | ~4 (rebuilt, no table of its own) | 4 (+ AE2 as a separate mega-line, ~20 steps) | 5 | 6 (+ rocket project, + syngas) | 9 | 8 |
| Average steps per line | ~1.5 | ~5 | ~4.5 | ~5 | ~4 | ~4.5 |
| Quests (chapter `*_age.snbt`) | 46 | 51 | 47 | 42 | 12 (of ~25 planned) | 0 (of ~22 planned) |
| Items in the gate | 36 | 143 | 279 | 407 | — | — |
| Automatable items (auto) | 27 | 88 | 193 | 295 | — | — |
| Era-order rules checked by the validator | 6 | 14 | 22 | 37 | — | — |
| Play hours (estimated) | 3–5 | 7–11 | 10–15 | 18–26 | 30–45 | 45–70 |

The quest figures for LV/MV/HV are **the ones from before the rewrite** (`DECISIONS.md`, translated from Spanish: "LV, MV, HV... rewritten by six writers in parallel... go into v0.5.1"); they cannot yet be used to measure a trend. EV only has the "Lunar Base" chapter (12 quests): the Mars, platinum and nano section of `ev.md` itself is not written yet.

The multiblock row counts **progression** multiblocks only, the ones that add a recipe, route or line. Parallel versions of machines that already exist are quality of life and are counted apart (`DECISIONS.md`, 2026-10-25). Example: the 11 steam family multiblocks of v0.5.2.

## 2. Detail per tier

### Steam — 5 multiblocks: `steam_vein_drill`, `steam_greenhouse`, `steam_blast_furnace`, `coking_battery`, `steam_observatory`
Lines: coke (+creosote+gas), bronze, steel (steam blast furnace), veins, wood/crops, lunar chart (draft). Cross-links already present: coke→creosote (fuel/treated wood) and coal gas→LV (turbine, distillery) and MV (biorefinery); ash→LV (fertilizer); drill stone→LV (sludge) and MV (centrifuge). In other words: **steam already starts out crossing into LV/MV**, even though the exponential-growth rule did not exist yet.

### LV — 6 multiblocks: `lv_vein_drill`, `lv_greenhouse`, `submerged_arc_furnace`, `sulfide_roaster`, `heliostat_tower`, `optical_observatory`
Tabulated lines (`lv.md`): full ore (5 steps), sapphire→aluminium (2), salt→persulfate and FeCl₃ (6), gallium+arsenic→diodes (6). Also, outside the table: hybrid AE2 (~20 recipes of its own, the era's "mega-line"), arc furnace (3 recipes), sulfide roaster (6 roastings + burner), solar tower, creature simulator (7 species). Notable cross-links already solved: silver from the roaster→solar tower mirrors; roaster oxides→electrolyzer→Zn/Pb/Sb/Cu and its O₂ returns to the EBF; CO from the arc furnace (circuit 2)→MV (methanol); arc furnace impactite needs charged certus quartz from AE2.

### MV — 6 multiblocks: `mv_vein_drill`, `mv_greenhouse`, `ore_plant`, `biorefinery`, `engine_test_stand`, `radio_telescope`
Tabulated lines (`mv.md`): silicon→chips (7), pyrolysis→fractions (2 steps, 8+ branches), fuels (5), ethylene→PE/PVC (5), ore→plant (3). The ore plant and the biorefinery are **generated from the real GTM recipes** (`ore_plant.js`, `biorefinery.js`): there is no table of their own, so any cross-link that already exists in GT chemistry comes for free. Explicit cross-links toward HV, already documented as "inheritance": glycerol, mixed metal, methanol/acetone, naphtha.

### HV — 7 multiblocks: `hv_vein_drill`, `hv_greenhouse`, `refinery`, `reformer`, `syngas_plant`, `composite_autoclave`, `lunar_drill`
Tabulated lines (`hv.md`): crude→fuels (6), cracking→olefins/aromatics (4), PTFE (3), epoxy/SBR (7), titanium (5), EV circuits (4). Plus the **first rocket project** (MV test bench → HV autoclave → rocket motor/tank, ~6-8 steps crossing MV+HV) and the syngas plant (6 recipes). The refinery catalyst already crosses 3 ore lines (cobalt from nickel, molybdenum from the Nether, silica from sand): it is the best example already built of a "deep cross-link".

### EV (design) — 7 multiblocks: `regolith_cell`, `cryogenic_plant`, `atmosphere_processor`, `platinum_plant` (new) + `ev_vein_drill`, `lunar_solar_array`, `deep_space_antenna` (steps)
9 tabulated lines in `ev.md`. It is the first era with **explicit reserves 2-3 eras ahead**: helium→IV ingots, helium-3→LuV fusion, liquid nitrogen→Mercury vein drill (IV), Ir/Os→IV refining, CaCl₂ in a loop with the Moon. Two sites (Moon automated, Mars by hand).

### IV (design) — 8 multiblocks: `fission_reactor`, `hot_cell`, `naquadah_plant` (new) + `pressurized_vein_drill`, `mercury_vein_drill`, `venus_heat_engine`, `mercury_solar_field`, `interferometer` (steps)
8 tabulated lines in `iv.md`. It keeps reserving items for later eras: tritium→LuV fusion, enriched sulfate/trinium→LuV, naquadria solution→ZPM, Cs→naquadria ZPM. Two simultaneous sites (Venus + Mercury).

## 3. Verdict: does it grow exponentially, linearly or flat?

| Axis | Steam→LV | LV→MV | MV→HV | HV→EV | EV→IV | Pattern |
|---|---|---|---|---|---|---|
| Own multiblocks | ×1.2 | ×1.0 | ×1.17 | ×1.0 | ×1.14 | **Flat** (+0 to +1 per tier) |
| GTM multiblocks unlocked (approx., per tier) | — → 2 | 2 → 1 | 1 → 4 | 4 → 6 | 6 → 7 | Not monotonic (MV only adds 1), but it grows and saturates toward IV |
| Tabulated lines | ×1.0 | ×1.25 | ×1.2 | ×1.5 | ×0.89 | **Linear**, with a ceiling (~4-9) |
| Gate (items, actual delta) | +107 | +136 | +128 | — | — | **Linear** (almost equal increments, not growing) |
| Auto (items, actual delta) | +61 | +105 | +102 | — | — | **Linear** |
| Era-order rules (validator) | ×2.33 | ×1.57 | ×1.68 | — | — | **The fastest of the measures**, sub-exponential but growing |
| Quests | ×1.11 | ×0.92 | ×0.89 | ×0.29* | 0† | **Inconclusive** (rewrite in progress) |
| Hours (estimated, midpoint) | ×2.25 | ×1.39 | ×1.76 | ×1.7 | ×1.53 | The closest to "exponential", but it is an estimate |

\* EV only has the Moon chapter; it is not comparable yet. † IV: 0 of ~22 planned; the chapter is not written.

**Conclusion:** today growth is **linear to flat on the structural axes** (multiblocks, lines, items in the gate), not exponential in the strict sense. A real exponential axis would give *growing ratios* (36→107→214→428...), and here the ratios **shrink** or stay the same. This is consistent with a decision already in `DECISIONS.md` (translated from Spanish: "from EV on, each era brings 2-3 new multiblocks"): the pack itself already set a target of **linear** growth in the number of multiblocks, not exponential (since replaced by ×1.35 per era, see §5). What can grow faster without inflating quantities or times is the **density of the cross-link graph**: each new multiblock that also links to 2+ earlier lines (not just the immediate one) makes the number of *connections* grow faster than the number of *nodes*. That is what already shows in the EV/IV jump (reserves 2-3 eras ahead) compared with steam/LV (reserves 1 era ahead), and it is the signal closest to "exponential" in the data. Compliance in what is already built (Steam–HV) is reasonable and does not need redoing, as you already decided; the LV/MV/HV quest book should be re-measured after the v0.5.1 rewrite to get a reliable figure.

## 4. Small changes, Steam→HV

Rules: additive, without changing the shape of any multiblock, without raising quantities or times — complexity comes in through a new step, a new condition or a new cross-link. All of them use items/fluids that already exist in the pack.

### LV

| # | Proposal | Recipe detail | Files | Value/effort |
|---|---|---|---|---|
| L1 | The default CO₂ from the arc furnace (circuit 1, `silicon` recipe) is vented today (`arc_furnace.js`: *"CO2 is vented"*). Bring forward to LV the CO₂ variant that MV already plans for its greenhouse. | New circuit 3 variant of `lv_greenhouse`: unspent catalyst + 100 mB `gtceu:carbon_dioxide` + 100 mB water → +25% output (half of MV's ×3) + 50 mB `gtceu:oxygen`. Same time/EU as the base. | `server_scripts/grindless/lv/greenhouse.js` (new `fertilizerVariant` code block); comment in `lv/arc_furnace.js` | **High/Low** — 0 new items, pattern already exists in `mv/family_greenhouse.js` |
| L2 | The distilled water that the Solar Tower returns (4 mB per 640 of steam) is not used by any other LV multiblock; the arc furnace only accepts plain water in its obsidian recipe. | New `obsidian_distilled` recipe (circuit 2): 32× cobblestone + electrode (chance-based) + 4000 mB `gtceu:distilled_water` → 4× obsidian + 10% chance of 1× extra `gtceu:quartz_sand_dust`. Same EU/t and duration as the plain-water recipe. | `server_scripts/grindless/lv/arc_furnace.js` | **High/Low** — links two LV multiblocks that do not interact today |
| L3 | The antimony from the roaster (stibnite/tetrahedrite → electrolyzer) has no use beyond the ingot. | Alternative recipe for the heliostat mirror: 1× steel plate + 1× silver foil (instead of 2) + 1× antimony dust + 1× glass panel + 1× small steel gear → 1 mirror (same item, same EU/t). | `server_scripts/grindless/lv/heliostat_tower.js` | **Medium/Low** — 0 new items, but the value is more cosmetic |
| L4 | The spare carbon from HV (refinery/syngas, "Carbon (1/9 per batch) → blaze, steel", translated from Spanish) has no use in LV; it would give the graphite electrode a third source. | Alternative electrode recipe: 4× `gtceu:carbon_dust` + steel rod → 1 electrode (same recipe as with graphite powder). *To verify that `gtceu:carbon_dust` exists as an item distinct from graphite in GTM 7.5.3 before applying it.* | `server_scripts/grindless/lv/arc_furnace.js` | **Medium/Medium** — backward cross-link (HV→LV) with more narrative value, but with an assumption to confirm |

### MV

| # | Proposal | Recipe detail | Files | Value/effort |
|---|---|---|---|---|
| M1 | The MV greenhouse only combines fertilizer+CO₂ (circuit 2); the fermented biomass from the biorefinery/brewery feeds no greenhouse. | New circuit 3 variant: unspent catalyst + 50 mB `gtceu:fermented_biomass` (no fertilizer or CO₂) → ×2 the base output, same time/EU as the base recipe (not half). A cheaper route for anyone who already ferments but does not have the acid/CO₂ line set up. | `server_scripts/grindless/mv/family_greenhouse.js` | **High/Low** — same pattern as the existing variant, 0 new items |
| M2 | MV veins have no "leaching" variant: the sulfuric acid from the LV roaster is only used in chemistry, never in the drill. | Third variant per vein (Overworld + Nether) in the MV Vein Drill: drill bit + sample + 50 mB `gtceu:sulfuric_acid` → same base yield + one extra chance (e.g. 500/10000) of the rarest material in the vein. It is added to the same loop that already generates the other two variants, so it covers all veins at once. | `server_scripts/grindless/mv/family_vein_drilling.js` | **High/Medium** — touches many recipes but with a single template |
| M3 | The landing site chart (radio telescope) requires "no storm"; today there is no way to skip that condition. | Alternative recipe `lunar_landing_chart_shielded`: unspent map and ephemeris + 2× paper + 1× `#forge:small_dusts/silver` (reflective coating) → same chart, but with `.thunder(0.6, true)` instead of `0.2` (it tolerates more storm, it does not cancel it). | `server_scripts/grindless/observatory/recipes.js` | **Medium/Low** — reuses the silver that the photographic plates already use |

### HV

| # | Proposal | Recipe detail | Files | Value/effort |
|---|---|---|---|---|
| H1 | The H₂S from the refinery today only yields acid or sulfur; `hv.md` flags as an open risk that the H₂ "does not balance with heavy crude" (translated from Spanish). | New variant of the sulfide roaster's burner: 1000 mB `gtceu:hydrogen_sulfide` + the same air/water as the sulfur burner → 1000 mB sulfuric acid + steam + 500 mB extra `gtceu:hydrogen` (H₂S → S + H₂ is real chemistry). Same EU/t and duration as the existing sulfur burner. | `server_scripts/grindless/lv/sulfide_roaster.js` | **High/Low** — closes a risk already documented in `hv.md`, 0 new items |
| H2 | The ash from the syngas plant only goes to the centrifuge or fertilizer; the refinery's hydrotreating catalyst has only one recipe (cobalt+molybdenum+silica). | Alternative catalyst recipe: 1× `gtceu:cobalt_dust` + 1× `gtceu:molybdenum_dust` + 3× `gtceu:ash_dust` (instead of silica) → 4 catalysts. Closes a loop within HV (syngas↔refinery). | `server_scripts/grindless/hv/refinery_crafting.js` | **High/Low** — 0 new items, purely an alternative recipe |
| H3 | The nitrogen from the composites autoclave is vented after each curing cycle with no use (`hv.md`: *"is vented after each curing cycle"*, translated from Spanish). | Variant of mode 1 (gasification) of the syngas plant that accepts 500 mB `gtceu:nitrogen` as a carrier gas instead of ambient air, same solids/steam/outputs, same EU/t and duration: a second input route, not a bonus. | `server_scripts/grindless/hv/syngas_plant.js` | **Medium/Medium** — crosses the rocket project with HV chemistry, but it has to fit the existing generator table |

## 5. Targets from EV onward so that growth is exponential

**Updated 2026-10-24/25.** The user then set a stronger target (`DECISIONS.md`, rule 7 of `AGENTS.md`): our progression multiblocks grow by about **×1.35 per era** from EV on (EV 10 or more, IV 13–14, LuV about 18, then ×1.35 of the previous era). That target replaces the old "2–3 per era" figure, and the "New own multiblocks" and "Family steps" columns below together have to add up to it. The rest of this section still holds: lines and cross-links must grow too.

The axis that can really compound without inflating quantities is the **density of cross-links**: adding multiblocks is not enough. Each new line must be required to link to **more earlier and more distant lines** than the previous era.

### Target table (EV–UV) and general rule after that

| Era | New own multiblocks | Family steps | New lines | Required cross-links (looking ≥2 eras back) | Planetary sites |
|---|---|---|---|---|---|
| EV | 3–4 | 3 (drill, energy, observatory) | 6–9 | ≥4 | Moon (automated) + Mars (visit) |
| IV | 3 | 5 (2 drills, 2 energy, observatory) | 6–8 | ≥5 | Venus + Mercury (at the same time) |
| LuV | 3 | 2–3 (cryobot/anchor, rectenna, observatory?) | 5–7 | ≥6 | belt + Io/Europa/Ganymede + **1st orbital station** (site not landed on) |
| ZPM | 2–3 | 2–3 | 5–7 | ≥7 | Saturn + ice giants, **all from orbit** |
| UV | 2 | 1–2 | 4–6 | ≥8 | Pluto/Kuiper in orbit + 1st interstellar probe |
| **UHV onward (general rule)** | ≥2 | ≥1 | ≥ those of the previous era | each new line reuses ≥2 intermediates from 2+ different eras **and** reserves ≥1 byproduct for ≥2 eras later | 1 new site every 1-2 eras (table in `journey.md`), each with ≥1 validator rule ("X only comes from Y", translated from Spanish) |

### EV vs. the target

`ev.md` met the lines target (9 tabulated lines), and it is the first era with explicit reserves 2-3 eras ahead (helium→IV, helium-3→LuV fusion, Ir/Os→IV, liquid nitrogen→Mercury vein drill (IV)). With 7 own multiblocks (4 new + 3 steps), it fell short of the ×1.35 target of 10.
- **Closed on 2026-10-25:** four more were added (`ev.md`, "Raising EV to the target"): combined-cycle plant, hot strip mill, sealed dome and rare-earth extraction cascade. That makes 11.

What is still missing is not design; it is **measurement tooling and pending content**:
- There is no `tools/analysis/tiers/ev.json`: the EV gate cannot be validated yet.
- The quest chapter only covers the Moon (12 of ~25): Mars, platinum plant, nano circuits and wither are missing.
- The risks the document itself flags (GCYR failures when launching/changing dimension, AE2 performance across 3 dimensions) are the ones that really block, not the lack of cross-links.

### IV vs. the target

`iv.md` meets the lines target: 8 lines, with reserves toward LuV and ZPM (tritium, enriched sulfate/trinium, naquadria solution, Cs). Its 8 own multiblocks (3 new + 5 steps) fall short of the ×1.35 target. With EV at 11, IV needs about 15, so 6–7 more are chosen when IV is built. As with EV, what is missing is:
- `tools/analysis/tiers/iv.json` and the chapter `iv_age.snbt` (0 of ~22 quests written).
- The document itself marks fission in KubeJS as risk no. 1 ("if a KubeJS multiblock generator does not output EU... it is tested before anything else", translated from Spanish): it is worth resolving that spike before building the rest of the era, because all of IV's energy depends on it.
- There is no IV drill of its own on Earth (the right decision, since the tungsten steel drill bit raises the tier of the drills that already exist): it is not a gap, it is the rule "not every family step has to repeat each era" (translated from Spanish).

### What comes after IV

`docs/eras/luv.md`, `zpm.md` and `uv.md` **do not exist yet**: the target table above is the starting point for writing them. LuV deserves special attention because it introduces a new kind of site — the **orbital station** (it is not landed on, it is operated from outside) — which the general rule from then on should treat as normal (ZPM and UV no longer land on any planet, according to `journey.md`).

## 6. Audit summary

- **Own multiblocks:** 5 (Steam) → 6 → 6 → 7 (HV built); 7 → 8 (EV/IV designed). This was flat growth, by the "2–3 per era" decision then in `DECISIONS.md`. That decision was replaced by ×1.35 per era: EV is now 11, and IV is raised when it is built.
- **Process lines:** 4 → 4 → 5 → 6 (built); 9 → 8 (designed). Linear, with cross-links that get deeper each time.
- **Verdict:** none of the structural axes (multiblocks, lines, items in the gate) is exponential today; they are linear or flat, with ratios that shrink tier by tier. The most promising axis is the **depth of forward cross-links**, which does speed up from HV to EV/IV.
- There is no need to redo Steam–HV (the rule is new); the four to six small changes in section 4 are the reasonable adjustment.
- EV and IV, as designed, meet the lines target. Their multiblock counts are raised to ×1.35: EV was raised in `ev.md` on 2026-10-25, and IV is raised when it is built. What is missing besides that is their own validator, the rest of the quest book, and resolving the technical risks each document already flags.
