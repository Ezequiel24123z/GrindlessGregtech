# RF-3L: UHV and UV process-line charts (issue #59)

Chart data only (`pl-data-uv.mjs`, `pl-data-uhv.mjs`); no recipe changed. Verdicts from a local `tools/analysis/line-audit.mjs` run on the rf3a dump (`out4`). `pl-check --era uv` and `--era uhv`: 0 issues (UV 166 arrows, UHV 193).

## Verdicts, before to after

| Era | Chart lines | Real (>= 4 steps) | keep | fix | merge | remove |
|---|---|---|---|---|---|---|
| UV | 17 to 13 | 10 to 9 | 3 to 5 | 14 to 8 | 0 | 0 |
| UHV | 27 to 16 | 9 to 11 | 6 to 9 | 21 to 7 | 0 | 0 |

The audit scores one line per unconsumed product of a cluster, so single-step products (fractions, isotopes) counted as separate short lines. Chains were drawn as one cluster where the recipes really connect them.

## UV

Added (every arrow proven in the dump): #4 curium heat to probe RTG, #10 HPGe, #11 BNNT, #12 sail film, #14 EnTED, #15 printed parts to thruster pod (Kuiper belt is now its tail), #19 closed life to neuro processing unit, #20 Starshot, #21 SNSPD. New links to older chapters: `pl_mv:wafer`, `pl_luv:gedust`, `enq`, `trin`, `org`.

Chart gaps fixed: n15 into thorium (3 to 7 steps); superfluid helium, He-3, deuterium and the fibre laser into the cold line (1-2 to 4); ICAN pellet and photonic chip into the starchip chain; Pluto water and ammonia into the ark.

Designed, not built: #1 americium and neutronium (`neutronium_wafer` has no producer; drawn as a raw). `bnnt_fuel_tank` and the EnTED wire have no consumer recipe (charted with an end note).

Real problems (content package, not fixed):

| Line | Problem | Proposed fix | Files a package touches |
|---|---|---|---|
| muon cell (2 steps) | only freezer to cell | add D-T mix and tritium blanket stages | `pack/kubejs/*/grindless/uv` muon scripts |
| Pluto nitrogen, CO, methane (1 step) | one fractionator recipe per ice | stage each ice before the fractionator | uv pluto/penetrator scripts |
| krypton, xenon | cryogenic air cuts (3 < 17) bypass the Kuiper belt | remove the air cuts above UV | cryogenic_processing air-cut scripts |
| `bnnt_fuel_tank` | no consumer, isolated | give it a probe/Kuiper craft consumer | uv BNNT and probe recipe scripts |
| `relay_seed` | inputs are UHV+, no older crossing | a UV-era input or consumer | relay_seed recipes |
| fibre-laser pump module, D-He3 capsule, B-11 | shorter bypass recipes (e.g. mocvd/pump_module 8 < 12) | remove or lengthen the bypasses | isotope, CVD and laser scripts |

Risk: the cold line is still judged keep but lists several bypasses; it may turn fix if they are enforced.

Layout fix (RF-3L repair): the merged starshot cluster is drawn as three clusters (`starshot` fusion and lasers, `parts`, `probe`), all tagged `line: 'starshot'`. Where an arrow crossed a cut, the downstream cluster holds a raw node with the same item (`laserB`, `laserC`, `microC`, `rtgC`, `podC`, `hpgeC`, `lsailC`); LD-T1 joins it to the sibling product node, so the line keeps its steps. No node or dependency was dropped. UHV: the `life` cluster was re-laid out. Layout findings 18 to 0 on every chart; pl-check 0 issues.

## UHV

All 32 design lines were already drawn; the "missing" list came from a condensed chart. Added real intermediate stages and merged single-step lines into true chains in all 9 clusters (VUV comb, nuclear clock, optical processor to wetware mainframe, swarm line of 9 steps, RTAN to UHV SMES cell, Proxima gate seed).

Designed, not built (not drawn): PBO benzene upstream, UHTC blend (ZrB2), MgB2 reacted wire and cable, multi-stage ultrapure water (1 of 7 recipes), ice sublimation and CO2 split (3 of 7), quantum-memory wafer stage, second biocement stage.

Chart gaps fixed: 14 of the 21 old fix lines.

Real problems (7, content package, not fixed):

| Line | Problem | Proposed fix | Files |
|---|---|---|---|
| ZBLAN fibre (3 steps) | one consumer | ZrF4 purification and preform stage, more consumers | uhv zblan and photonics scripts |
| biomass (4 steps) | brewery `biomass_from_glow_berries` beats the line | remove or nerf it | uhv life or brewery script |
| biocement to proxima base casing | casing has no consumer, no older input | a consumer or an older-era input | uhv biocement and proxima base recipes |
| heavy water (3 steps) | detritiation skips the ice line (7 < 10) | drop skip, add sublimation stage | uhv ices, heavy_water, detritiation scripts |
| MgB2 wire (2 steps) | extruder shortcut (2 < 3) | drop extruder recipe, add reaction and cable stages | uhv mgb2 scripts |
| PBO fibre (2 steps) | no benzene upstream | add chain, remove packer/crafting producers | uhv pbo scripts |
| ICAN rocket motor (3 steps) | no UHTC blend, no consumer | ZrB2 blend recipe and a consumer | uhv uhtc and ican scripts |

Layout lint (`tools/quests/lint.mjs`) was run on the regenerated chapters; generated files were restored and are left to the integrator.

## UV and UHV fixes (RF-3V, issue #87)

Audit after: UV keep 8 / fix 5 (was 5 / 8); UHV keep 15 / fix 1 (was 9 / 7). Charts only; no recipe, item or table changed.

- Muon-catalysed fusion: kept short (a generator fed by one freezer and the blanket; the loop is the line).
- Pluto ices: the chart now draws the printed probe frame (near-net frame, powder bed printer), the penetrator probe, the bay and the fractionator. Still fix: every end product has a shorter bypass (escalated).
- BNNT fuel tank: crossings with ZPM silica aerogel and the LuV cryogenic tank, through the aerogel fuel tank.
- Relay seed, MgB2 wire, heavy water, PBO fibre chain, proxima casing, UHTC chain, ICAN motor, ZBLAN: resolved by role, keepShort, or drawn upstream stages and crossings (PBO from benzene, UHTC from red zircon, casing with LuV naquadah alloy).
- Escalated, not touchable here: krypton and xenon (air cuts pinned by UEV/UXV tests), Pluto N2/CO/CH4 bypasses, biomass (the LuV algae bioreactor bypass is pinned by tests).
