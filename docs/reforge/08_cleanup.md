# Phase 8: cleanup triage

Input for Phase 8 (Project Reforge). Every finding of the census, the process audit, the recipe-quality audit and the assets audit, plus the Phase 8 items of `docs/reforge/00_diagnosis.md` (3.2 and 3.5), is classed as **D** (real defect), **FP** (tool false positive) or **I** (intentional). All tool output was produced on the VM at base `e31bed6` (written under `/tmp/p8`, not in the repo). XP-G1 (#152), XP-Z1b and XP-C1 were in flight, so MAX+ rows are marked **P** (pending: re-run after those land) instead of being classed.

Counts are of tool rows. Where a row group is classed as a whole, the count is approximate (`~`).

## 1. Summary

| Source | Rows | D | FP | I | P |
|---|---|---|---|---|---|
| Census: unused items | 52 | 1 | ~38 | 2 | ~11 |
| Census: texture gaps | 185 | 0 | 185 | 0 | 0 |
| Census: sound gaps ("no loop sound") | 220 | 0 | 0 | 0 | 220 (Phase 6 asset task, not Phase 8) |
| Census: quest refs | 10 | 4 | 0 | 6 | 0 |
| Census: lang, duplicate recipes, dropped inputs | 0 | 0 | 0 | 0 | 0 |
| Assets audit: orphan textures | 87 | ~78 | 0 | 0 | 9 |
| Process audit | 117 | ~44 | ~6 | ~4 | 63 |
| Recipe quality | 309 | 0 | 0 | 0 | 309 (all baselined, `fresh=0 stale=0`; Phase 2 owns them) |
| Diagnosis Phase 8 items | 6 | 5 | 0 | 1 | 0 |

The census prints 405 asset rows today (issue said 406): 185 texture plus 220 sound. The unused count is 52 (diagnosis had 48).

## 2. Census: unused items (52)

| id | Finding | Class | Evidence | Fix |
|---|---|---|---|---|
| U1 | 28 `*_wireless_(energy\|dynamo)_cover` (ev to uxv) | FP | placed as covers, not consumed: `startup_scripts/grindless/lv/wireless_energy.js:36,195` | census: count a cover as used when a machine/tower references it |
| U2 | capacitor cells (mv, hv, ev, iv; LV cell only "used" by a quest) | FP | read from the formed structure via `W.cells` (`startup_scripts/grindless/lv/wireless_energy.js:9-15,93-97`); craftable at `server_scripts/grindless/lv/wireless_energy.js:792`; quest `pack/config/ftbquests/quests/chapters/power.snbt:2177` | census: resolve `W.cells` |
| U3 | `hologram_projector` | FP | right-click tool: `server_scripts/grindless/steam/hologram_projector.js:3-7`, recipe at `:796` | census: allow-list tool items with a handler |
| U4 | MAX casings `clamp_coil_casing`, `driver_ring_casing`, `laser_link_casing`, `stream_bundle_block`, `test_mass_enclosure_casing` | FP | used in patterns through `const` vars: `startup_scripts/grindless/max/flux_clamp.js:20,28`, `max/synchroniser.js:19`, `max/horizon_interferometer.js:21-22`, `max/shell.js:25`; made by `server_scripts/grindless/max/flux_clamp.js:50` | census: follow `const` aliases in pattern code |
| U5 | `matrioshka_node` | FP | `startup_scripts/grindless/uiv/matrioshka.js:79`, `uiv/shapes.js:602`; research input at `server_scripts/grindless/uiv/matrioshka.js:184` | same rule as U4 |
| U6 | `alkali_sulfate_dust` | I (needs a void route) | inert kiln byproduct, "safe to void": `client_scripts/grindless/uev_electron_beam_lang.js:57`; made at `server_scripts/grindless/iv/fluorspar_kiln.js:88`; registered in the wrong era file `startup_scripts/grindless/uev/electron_beam.js:55` | move registration next to the IV kiln; add a voiding or use route (principle 3); package P8-E |
| U7 | `epilogue` | I | "never" in `hidden_until.json:97` (MX-E1); XP-Z1b owns it | none |
| U8 | `horizon_iris`, `hyperstargate_*`, `creative_computation_provider`, `jacketed_condensate_cell`, `horizon_controller_crystal` | P | XP-G1 (#152) in flight | re-run after XP-G1 (P8-H) |
| U9 | `cold_horizon_conduit`, `cold_horizon_waveguide`, `he4_dewar`, `maxplus_fluid_regulator`, `horizon_capacitor` | P | made at `server_scripts/grindless/maxplus/loom.js:54,99`, `maxplus/assembler.js:112`, `maxplus/components.js:163`; consumers planned at `docs/eras/maxplus.md:177,341` (XP-H3); `horizon_capacitor` is a cell outside `W.cells` on purpose (`maxplus/capacitor_bank.js`) | re-run after MAX+ packages (P8-H) |
| U10 | uev/uiv rows not matched above | P | not itemised by the tool beyond the groups above | P8-H re-run lists survivors |

U1 to U5 are ~38 rows; fixing the census rules in P8-A removes them.

## 3. Census: asset gaps (405)

| id | Finding | Class | Evidence | Fix |
|---|---|---|---|---|
| A1 | 185 texture rows | FP | census matches by file name only. The assets audit (authority for textures) reports 0 `exists=false` (`06_textures.csv`). 123 resolve there directly; the other 62 are layered or custom-model items | census defers to the assets audit |
| A1a | ~47 `vein_sample_*` and 3 belt samples | FP | shared layers `item/vein_sample_frame` and `item/vein_sample_core`: `startup_scripts/grindless/hv/family_items.js:48-50`, `lv/multis_items.js:54,68`, `luv/asteroid_belt.js:284`, `iv/foundation.js:258-260` | resolve layered models |
| A1b | 10 `creature_model_*` | FP | `item/creature_model_base`, `item/creature_model_core`: `startup_scripts/grindless/lv/creatures.js:17,86` | same |
| A1c | `dfd_mk1_motor`, `dfd_mk2_motor` | FP | custom block and item models under `assets/grindless/models/block/dfd_mk*_motor.json` | same |
| A1d | `hftacn_coil_block`, `metallic_hydrogen_coil_block` | FP | borrow a gtceu coil texture: `startup_scripts/grindless/uev/foundation.js:67` | same |
| A2 | 220 sound rows | P | `06_sounds.csv`: 0 missing files (106 file, 16 gtm_file, 325 machine rows); the rows are "no loop sound" by era (uhv 31, uv 29, zpm/uiv/uev 23 each, maxplus 17, ...); 35 loops flagged "loop", 11 "annoying" | Phase 6 asset task; out of scope |

## 4. Assets audit: orphan textures (87)

Textures with no registration or model (`06_textures.csv`, category `orphan`):

| id | Finding | Rows | Class | Evidence | Fix |
|---|---|---|---|---|---|
| O1 | wireless cover recolours `block/cover/wireless_(energy\|dynamo)_cover_<tier>` plus 2 emissive | 30 | D | no registration or model uses them; only the shared cover texture is used (`startup_scripts/grindless/lv/wireless_energy.js:36,195`) | delete; check the generator first |
| O2 | `block/machines/<t>_parallel_hatch/overlay_front*` (uev, uiv, uxv, opv, max, uhv; 4 files each) | 24 | D | `pack/kubejs/assets/grindless/textures/block/machines/<t>_parallel_hatch/` has no model reference | delete or wire |
| O3 | `item/<t>_{electric_motor,electric_pump,conveyor_module,electric_piston,robot_arm,sensor,emitter,field_generator}` for uev, uiv, uxv | 24 | D | items were retired by RF-3A (`DECISIONS.md:716`); generators still draw them: `tools/assets/Build-UEVFoundationTextures.ps1:58` and the UIV and UXV equivalents | delete textures and generator entries |
| O4 | `item/max_smes_cell` | 1 | D | the cell is not in `data/grindless/tables/wireless_energy.json` (ends at uxv, `:70-71`) | delete or add the cell |
| O5 | `block/multiblock/sulfur_iodine_plant/overlay_front*` | 3 | D | `startup_scripts/grindless/luv/io_orbit.js:274-287` uses `gtceu:sulfur_iodine_plant`, not a grindless overlay path | delete or wire |
| O6 | `sky/pluto`, `sky/horizon_ring` | 2 | FP | used by `assets/grindless/gcyr/planet_assets/sky_renderers/pluto_orbit.json:29` and `horizon_city.json:11` | assets audit: scan sky renderer JSON |
| O7 | `block/multiblock/hyperstargate/overlay_front*` | 3 | P | XP-G1 in flight | re-run (P8-H) |

Also flagged by the audit and left to P8-D to judge: 76% opaque overlays (`degenerate_harvester`, `uiv_fusion_reactor`, `uxv_fusion_reactor`) and recolour clusters. Per-era violations: uev 85, uiv 77, uxv 100, max 2, maxplus 45 (Phase 6 visual work, not deleted here).

## 5. Census: quest refs (10)

| id | Finding | Class | Evidence | Fix |
|---|---|---|---|---|
| Q1 | 4 HV `vein_sample_*_end` required in the MV chapter (non-optional tasks) | D | `pack/config/ftbquests/quests/chapters/mv_age.snbt:609-616` | move the quest or drop the tasks; quest owner |
| Q2 | IV items (`gtceu:fluorspar_kiln`, `gtceu:smelting_complex`) in `pl_ev` | I | `optional_task: true`: `pl_ev.snbt:332-337,781-787,1338-1344`; chain chapters follow the line, not the era | census: ignore `optional_task` in `pl_*` |
| Q3 | `jupiter_entry_probe` (LuV) in `pl_iv` | I | `pl_iv.snbt:1572-1577`, optional; item made at `server_scripts/grindless/luv/ganymede.js:82` | same |
| Q4 | `cf249_target_wheel`, `divertor` (UIV) in `pl_uev` | I | `pl_uev.snbt:397-401,1381-1385`, optional | same |
| Q5 | `relay_seed` (UIV) in `pl_uv` | I | `pl_uv.snbt:2202`; recipes at `server_scripts/grindless/uv/starshot.js:87,146` | same |

Q2 to Q5 are 6 rows. Quests are owned by the quest package, not the cleanup packages here, except the census rule.

## 6. Process audit (117; 99 new against a stale baseline, diagnosis had 36 and 18)

| id | Kind (count) | Class | Evidence | Fix |
|---|---|---|---|---|
| R1 | `trivial_step` (38: uiv 13, opv 8, max 8, uxv 5, maxplus 4) | D, ~32 | 1-in 1-out steps with no extra input: tables `data/grindless/tables/{j0437,metallic_hydrogen,memories_cryostat,tfln_femtosecond,crystals,hts_magnet_works,mk5,fusion_mk6}.json`, `server_scripts/grindless/max/{sgra_modes,injector,circuits,rydberg}.js`, `uxv/superheavy.js:17`, `maxplus/components.js:38-40` | add a real input or merge the step (P8-F) |
| R2 | 6 fluid `*_ash` `trivial_step` (uiv, uxv fusion_mk6) | FP | `gtceu:direct_conversion` generator recipes (`server_scripts/grindless/zpm/fusion.js:144-193`) output EU; the rule misreads a generator as a process step | process-audit: skip `direct_conversion` |
| R3 | `superfluid_he3`, `superfluid_helium_4` | I | phase changes: `data/grindless/tables/memories_cryostat.json:123`, `server_scripts/grindless/maxplus/assembler.js:110`; `pathfinder_probe_core_unpack` is a shapeless unpack (`opv/pathfinder.js:96`) | allow-list |
| R4 | `self_gain` (2: same recipe `grindless:closed_ecosystem/culture_seed` in uv and zpm) | D | input 1, output 2 of the same culture: `server_scripts/grindless/uv/life.js:61` | require a catalyst or consume a nutrient (P8-F) |
| R5 | `no_use` opv (2): `gtceu:chain_strand_foil`, `double_chain_strand_plate` | D | made by gtceu shaped recipes; `server_scripts/grindless/opv/cuts.js:27` removes only the generic machine rows | remove the unused forms (P8-F) |
| R6 | `no_use` maxplus (10), `hidden_with_recipes` (44, all maxplus), `m_info_missing` (20: 16 maxplus, 4 max), `uncraftable` (1: `fluid:gtceu:condensate_boil_off_gas`) | P | MAX+ files of XP-G1 and XP-Z1b | re-run after they land (P8-H); expected fixes: add `grindless:hidden_with_recipes` tag or drop recipes; add EMI info pages |
| R7 | stale baseline | D (tool) | 99 findings are new only because the baseline predates MAX+ | refresh baseline once, in P8-A |

## 7. Recipe quality (309, baselined)

`quality.json`: `fresh=0 stale=0`, so nothing is new. By code: uev T-VOLT 19, C-COMPLEX 2, T-CIRC/T-COMP/T-COUNT/T-HULL 16 each; uiv C-COMPLEX 49, T-CIRC 9, T-COMP 8, T-COUNT 9, T-HULL 2; uxv T-CIRC/T-COMP/T-COUNT/T-HULL/T-VOLT 20 each; max P-DOMAIN 1, T-COMP 1; maxplus T-CIRC/T-HULL/T-VOLT 15 each. These are cost-model gaps of Phase 2 and Phase 3; class **P** for all, not Phase 8. The tool scope is uev to maxplus; lower eras are unmeasured (a scope gap, not a finding).

## 8. Diagnosis Phase 8 items

| id | Item | Class | Evidence | Fix |
|---|---|---|---|---|
| D1 | 25 retired items and conversion recipes | D (leftovers only) | registrations and recipes removed by RF-3A (`DECISIONS.md:716`). Left: 24 stale keys `grindless:{uev,uiv,uxv}_{electric_motor,...,field_generator}` in `data/grindless/tables/cost_curve/{uev,uiv,uxv}.json` (e.g. `uev.json:8-15`), and the O3 textures | delete keys and textures (P8-B, P8-D) |
| D2 | Old-save machinery | D | `hidden_until.json` header `keepRecipes` text (`:7`) and "old saves keep every id"; `startup_scripts/grindless/luv/io_orbit.js:11`; `server_scripts/grindless/lv/wireless_energy.js:41,114-123` (`LEGACY_KEY`) | delete (no save compatibility, AGENTS.md) (P8-B) |
| D3 | 11 gtceu dusts and ingots hidden "until their era" | I (done) | `hidden_until.json` has 453 groups, all `never`; `integration/hidden.js:37` `IMPLEMENTED_ERA = 'max'` | simplify `hidden.js` to the "never" case (P8-B) |
| D4 | Dead GTCA, GTNN and GCYR content | D | 453 `never` groups: GTNN ~116 (100 end-game circuits), GTCA ~130 (68 no recipe, 32 removed, 23 water purification plants, 9 elevator modules, 7 ore blocks, 4 samarium-terbium), GCYR ~21, Extended Features ~22, gtceu ~80. Hidden, not removed | remove their recipes and dead rows (P8-C) |
| D5 | GT-- component assembly line rows | D | `docs/reforge/02_cost_curve.md:241,277,298`; `component_assembly_line` still in `data/grindless/tables/cost_curve/{ev,hv,iv,luv,mv,uv}.json` (2 each) and `capacity_known.json` rows (`gtca/*`, `gtnn/*`, `*_type_belt`, `luv/radiation_vault_casing`, `assembler/iridium_crucible`, `mu_metal_shield`) | delete rows with D4 (P8-C) |
| D6 | Pre-Reforge doc rules | D | `es_es` still named as a required language in `docs/eras/{ev:407,iv:356,luv:267,zpm:227,uev:1013,uiv:1034,uxv:977,uhv:1066,uv:1217,opv:1196,max:865,maxplus:552,steam:264}`; "small reward" quests in `docs/eras/{hv:239,lv:291,mv:200,max:141,uev:791,uiv:866,uxv:813,opv:880}`; "Save compatibility" sections `docs/eras/{uev:878,uiv:950,uxv:887,uhv:981,uv:1120,zpm:963,opv:995,max:804}`; `docs/STATUS.md:84` asks about save compatibility (integrator-owned) | mark or rewrite (P8-G) |

## 9. Packages

Order is the proposed run order. "Beside" = may run in parallel with XP-G1, XP-Z1b and XP-C1 (MAX+ files, `tools/analysis/tiers/**`).

### P8-A: tool false positives (S, first, beside: yes)
- Objective: remove U1-U5, A1, O6, Q2-Q5 and R2 as false positives; refresh the process baseline (R7).
- Allowed: `tools/analysis/census.mjs`, `tools/analysis/process-audit.mjs`, their tests under `tools/analysis/test/`, the process baseline file.
- Prohibited: `tools/analysis/tiers/**`, `pack/**`.
- Dependencies: none. Run the refresh last, after XP-G1 lands, or keep the new MAX+ rows out of the baseline.
- Tests: T0, the two audits' Node tests on the VM; census must print 0 texture rows and drop the FP unused rows.

### P8-B: old-save machinery (S, beside: yes)
- Objective: D1 (stale keys), D2, D3.
- Allowed: `pack/kubejs/data/grindless/tables/cost_curve/{uev,uiv,uxv}.json`, `server_scripts/grindless/integration/hidden.js`, `server_scripts/grindless/lv/wireless_energy.js`, `startup_scripts/grindless/luv/io_orbit.js` (comment only).
- Prohibited: `hidden_until.json` (integrator), `lib/**`, MAX+ files.
- Dependencies: none.
- Tests: T0; T1 only for the `hidden.js` simplification (one named hide-and-show test).

### P8-C: dead add-on content (M, after P8-A, beside: yes if it avoids MAX+ files)
- Objective: D4, D5.
- Allowed: `pack/kubejs/server_scripts/grindless/integration/**` (removals), `tools/analysis/capacity_known.json`, `cost_curve/*.json` `component_assembly_line` rows.
- Prohibited: `hidden_until.json`, `tools/analysis/tiers/**`.
- Dependencies: P8-B (same `cost_curve` files, so serialise).
- Tests: T0; T2 reachability and recipe lookup once.
- Risk: removing recipes of gtca/gtnn/gcyr may orphan quest or progression references; run the quest-ref census after.

### P8-D: orphan textures and generators (S, beside: yes)
- Objective: O1-O5 (delete or wire; check each generator before deleting).
- Allowed: `pack/kubejs/assets/grindless/textures/**` (listed files), `tools/assets/Build-{UEV,UIV,UXV}FoundationTextures.ps1`, `tools/assets/Build-MaxPlusTextures.ps1` if it draws any listed file.
- Prohibited: any texture XP-G1 adds (O7).
- Dependencies: P8-A (the assets audit scan of sky renderers).
- Tests: T0; assets audit on the VM must show the orphan count fall by the listed rows.

### P8-E: wrongly placed content (S, after P8-A)
- Objective: Q1 (quest owner), U6 (`alkali_sulfate_dust` registration and a void route).
- Allowed: `pack/config/ftbquests/quests/chapters/mv_age.snbt` through the quest generator source in `tools/quests/`; `startup_scripts/grindless/{iv,uev}/` for U6, with its lang and test lines.
- Prohibited: generated quest chapters edited by hand, `tools/analysis/tiers/**`.
- Dependencies: quest owner confirms Q1; serialise with any open quest package.
- Tests: T0 including the quest lint.

### P8-F: process and cost-model defects (M, after XP-G1, XP-Z1b and XP-C1)
- Objective: R1, R4, R5 and the baselined quality findings that Phase 2 or 3 did not clear.
- Allowed: the tables and scripts listed in R1, R4, R5 for uiv, uxv, opv, max; `data/grindless/tables/**`.
- Prohibited: MAX+ files until their packages land; `lib/**`.
- Dependencies: P8-A (clean baseline). Overlaps Phase 2 and 3 scope, so confirm with the coordinator before starting.
- Tests: T0; T2 once for reachability. Split by era if over about 15 files.

### P8-G: docs rule refresh (S, beside: yes)
- Objective: D6 (`docs/eras/*.md` only: drop `es_es`, "small reward", save-compat statements, or mark them superseded).
- Allowed: `docs/eras/*.md`.
- Prohibited: `AGENTS.md`, `docs/STATUS.md`, `DECISIONS.md` (integrator).
- Dependencies: none; edit one section at a time.
- Tests: T0.

### P8-H: post-MAX+ re-run (S, last)
- Objective: re-run census, process audit and assets audit after XP-G1, XP-Z1b, XP-C1 and XP-H3 land; class U8-U10, R6, O7; fix what is left (tags, `hidden_with_recipes`, EMI info pages, orphan overlays).
- Allowed: MAX+ files named by the re-run, plus `docs/reforge/08_cleanup.md` classification updates.
- Dependencies: all MAX+ packages.
- Tests: T0, T2 once.

## 10. Risks

- The pack is still moving: MAX+ rows (about 11 unused, 63 process, 9 orphan) are not classed until XP-G1, XP-Z1b and XP-C1 land.
- Several counts above are grouped (`~`); P8-A's re-run should print exact per-class tables.
- P8-F overlaps Phase 2 and 3; start only on the coordinator's word.

## 11. Outcome

What each row became. Rows still open name the package that owns them.

| Rows | Outcome | Package |
|---|---|---|
| U1-U5, A1, Q2-Q5, O6, R2 | false positives: the census reads covers, structure cells, const aliases and tool handlers, defers to the assets audit for textures and skips optional chart tasks; the assets audit reads sky renderers; the process audit skips `direct_conversion` generators | P8-A (#158) |
| R7 | the process baseline refreshed, MAX+ findings parked as `pending` | P8-A (#158); made truthful by P8-H1 (#168) |
| D1 | the 24 stale cost-curve keys removed; their textures deleted | P8-B (#159), P8-D (#160) |
| D2 | the old-save leftovers removed; `LEGACY_KEY` stays, because it is `lib/wireless_registry.js`'s backup of unreadable lists, not save compatibility | P8-B (#159) |
| D3 | `hidden.js` handles only `never`, `unless` and `keepRecipes`; the implemented era is `maxplus` | P8-B (#159), integrator |
| D4, D5 | no row of ours serves only `never` content; GT--'s component assembly line recipes and cost-curve rows removed | P8-C (#163) |
| D6 | the era docs state the current rules; `maxplus.md` too | P8-G (#161), integrator |
| O3, O4 | 25 orphan textures deleted; the UEV, UIV and UXV foundation generators pass their self-checks | P8-D (#160) |
| O1, O2, O5 | false positives: the scripts name these textures by built strings (cover renderer, parallel hatch overlay, sulfur-iodine plant model) | P8-D (#160); the audit learns the rule in P8-H2 (#169) |
| O7 | the Hyperstargate wears its face | integrator (XP-G1 merge) |
| Q1 | the four HV End vein samples moved from `mv_age` to `hv_age` | P8-E (#167) |
| U6 | `alkali_sulfate_dust` registered in the IV kiln's file, voided as inert | P8-E (#167); its EMI page in P8-H1 (#168) |
| U7 | `epilogue` is given at the MAX+ arrival and stays out of EMI by design | XP-Z1b (#155) |
| R1 (outside MAX+), R4, R5 | 26 trivial steps take a consumed input (two lathe rows return swarf); the culture seed pays for its gain; the unused OpV chain forms lost their recipes and are hidden | P8-F (#166) |
| R3 | intentional (phase changes, a shapeless unpack) | baseline |
| U8-U10, R1 (MAX+), R6 | MAX+ findings after MAX+ landed | P8-H1 (#168) |
| §7 | recipe quality stays Phase 2's baseline; XP-C1 cleared the MAX+ controllers' tier-15 entries; the gate base and locked chevron rows | XP-C1 (#156); P8-H2 (#169) |
| A2 | 220 multiblocks without a loop sound of their own | Phase 6 scope, not Phase 8 |
