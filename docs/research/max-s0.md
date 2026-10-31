# MAX-S0 spikes (results)

Status: done. Native runs on Azure (`-Backend azure -NoFallback`, temp pack copy, no `-Slots`; run dirs in the session `files\run`, not committed): `runA` (dump, first machines/cube), `runB` (machines; harness fixes), `runC` (a `@restart` sent without its markers: invalid), `runD` (machines complete, relay leg 1 wrongly failed on the poller, cube failed on `System`), `runE` (cube, relay both legs: PASS). No KubeJS error from our scripts in any run. Harness repairs: cube (forceload wait, busy flag, `System` blocked by the class filter, `Date.now()`), machines (S0-3 expectation; S0-4/S0-13 use a custom generator recipe type with `lib/generators.js`, not `macerator`), relay (temp-table row order). Contract: `docs/eras/max.md` "## S0 spikes". Pattern: `docs/research/opv-s0.md`.

## Harness

All overlay-only, off unless `kubejs/config/gg_test_max_s0.json` says `{"enabled": true}` (default false). Under `tools/test/overlay/kubejs/`:

- `startup_scripts/gg_test_max_s0_parts.js`: strand cable material, gate, tier-14 parallel hatch, frames, generator multiblocks, 33- and 25-cubes.
- `server_scripts/gg_test_max_s0_{machines,cube,dump,relay_1,relay_2}.js`.
- `data/grindless/gcyr/planets/{s0_max_bh_orbit,s0_max_bh_real,s0_max_nsc_belt}.json`, `data/grindless/dimension/{s0_max_bh_orbit,s0_max_nsc_belt}.json`.
- `tools/test/zones.json` row `max_s0` (x 38720-38783). Y is 70-102, not 70-100, because the 33-cube needs 33 rows.

Throwaway ids: `gtceu:gg_max_s0_*` (and the tier-14 hatch `gtceu:max_gg_max_s0_parallel_hatch`), `grindless:s0_max_*`. No final MAX id is used.

Temp pack-copy edits (never committed): a `hold_s0_max_c15` row in `gate.json`, a platform row in `relay_platforms.json`, the new site in `uhv/gate.js`, wireless case 14 (`wireless_energy.js`) and its table row.

## Results

| Spike | Result | Evidence |
|---|---|---|
| S0-1 | **PASS** (runA) | `grindless:s0_max_bh_orbit` and `grindless:s0_max_nsc_belt` load and read back as tier 14 planets; `gcyr:black_hole_orbit` loads as a level. GCYR 0.2.9 ships that dimension but no planet row (its planets: earth, luna, mars, mercury, proxima_centauri_b, venus), so F1 must add the tier-14 row itself, as for the other orbits |
| S0-2 | **PASS** (runD) | Recipe 2^35 = 34,359,738,368 EU/t read as a long, 1,200 t, two `gtceu:max_energy_input_hatch_16a` (list 34,359,738,368 V x 2 A). Draw per tick avg = min = max = 34,359,738,368 over 1,239 ticks, no negative sample (42,571,715,837,952 EU); the output arrived after 1,240 t. Tier read-outs: `getTierByVoltage` 14, `getRecipeEUtTier` 14, `getFloorTierByVoltage` 16 (not 14: do not use it for tier checks), `formatNumbers` "34,359,738,368". EMI display not read (no client) |
| S0-3 | **PASS**, loss not zero (runD) | Throwaway cable (V[MAX] = 2^31, 16 A, loss 1) carries 16 A x V[MAX]: the sink gains 34,359,738,320 EU/t on all 35 ticks, exactly the draw minus 48 = 16 A x 3 blocks x loss 1. The loss is 1 EU per amp per block, so F1 must state that, not "lossless" |
| S0-4 | **PASS** (runD) | A generator multiblock (`lib/generators.js`, custom `.setEUIO('out')` recipe type) with one `gtceu:max_energy_output_hatch_16a` starts a recipe at -2^31 EU/t (`gen_low`) and at -2^34 (`gen_high`); the read EU/t is exact and negative-sign handled as a long. Needs a real generator recipe type: `macerator` rows never start (as OpV S0-11), so R3/D1-style plants must use a custom generator type |
| S0-5 | **PASS** (math) / wireless leg not run (runA) | 64 A x V[MAX] x 10 = 1,374,389,534,720 as a long; 2 A x V[MAX] = 2^32 wraps to 0 as an int. The temp wireless `case 14` and table row boot without a startup error, but no tier-14 hatch was placed. W still needs its own native check (the helper's error text still says "1 to 13") |
| S0-6 | **PASS for the mechanism, FAIL for the lib as built** (runD) | An overlay tier-14 `PHPM` hatch (`gtceu:max_gg_max_s0_parallel_hatch`) reports 1,048,576 copies (4^10). Probe 2,048 EU/t x 1,048,576 = 2,147,483,648 (the int boundary) and 16,384 x 1,048,576 = 17,179,869,184 EU/t both read exactly, positive, no wrap. `lib/parallel_hatch.js` registers `.tiers(9..13)` only: MAX-M1 owns extending it to tier 14 |
| S0-7 | **PASS** (runE) | 33 x 33 x 33 hollow shell (6,146 casings, MAX_ROWS 64) forms; `checkPatternWithLock` 17.45 ms per call (a 50 ms tick budget), still formed; the 25-cube 5.4 ms. Needs Y 70-102 in the zone. Cost is per structure check, not per tick when formed |
| S0-8 | **PASS (hide-only)** (runA) | 0 gtnn supracausal recipes in the recipe manager (gtnn registers them in Kotlin at runtime; no `data/recipes` JSON), so `event.remove` by id finds none; `gtnn:supracausal_mainframe` is registered and the tag `gtceu/tags/items/circuits/max.json` holds it. Fallback: hide the items in EMI and remove by output; hiding before MAX was not tested. Changes A1/F2 (hide, not remove) |
| S0-9 | **not run (needs a player)** | client half; fallback of the table (book, title or quest ending) stays open for G1/D3 |
| S0-10 | **weak PASS (not exercised)** | Only the cygnus disk table loaded (dump). UXV disk machines, the Penrose engine and the droplet works were not run at the string site; the static read says site rows use `recipe.dimension` (`cygnus_disk.js:112`). Treat as unproven; check in the first MAX line package |
| S0-11 | **PASS** (runE) | Gate ring in `s0_max_bh_orbit`, circuit 15 row `hold_s0_max_c15` at 8,589,934,592 EU/t ran; the platform (ring, wireless pair, AE2 controller + drive) was placed in `s0_max_nsc_belt`, 2 forced chunks. After `@restart`: row `uxvPlatform_s0_max_c15`, the chunks, the formed ring and the AE2 controller all survived. Finding: `uxv/kerr_sling.js` `poll()` reads `mine[0].source` only, so it serves ONE source place; with the SGR/Terzan rows first, a row with another source is silently ignored (runD failed that way). T2 must loop over sources or share the BH-orbit source |
| S0-12 | done, below | |
| S0-13 | **PASS** (runD) | 15 x 9 x 15 generator (842 blocks) forms with one MAX 16 A dynamo hatch and runs `gen_low` at -2^31 EU/t. The string-site and wireless-case-14 legs were not exercised |

## S0-12 (read from the scripts)

Convention: a row needs about previous product + circuit as item inputs, plus its output items.

| Machine (script:line) | IO items in/out, fluids in/out | Lines | Verdict |
|---|---|---|---|
| UXV oxide PLD (`spin_deposition.js:52`) | 4/2, 1/0 | L27, L39 | accepts |
| YIG LPE (`spin_logic.js:70`) | 5/3, 1/1 | L31 | accepts |
| Racetrack fab (`spin_logic.js:63`) | 3/2, 1/0 | L38 | accepts |
| UIV decay heat vault (`rx_j1856.js:91`) | 2/4, 0/1 | L17 | accepts; no fluid input, site per row |
| UEV nitride magnet works (`composites.js:64`) | 3/2, 1/1 | L31, L32, L37 | accepts |
| Single crystal foundry (`electron_beam.js:88`) | 4/2, 1/0 | L32, L34, L35 | accepts |
| UHV solar vapour (`mercury.js:80`) | 3/5, 0/1 | L25 | accepts, site per row |
| Betavoltaic fab (`betavoltaics.js:68`) | 2/1, 1/1 | L26 | accepts, tight |
| Solar array fab (`power_devices.js:78`) | 5/3, 1/1 | L26 | accepts |
| Xenobiochem, radiotrophic (`proxima_life.js:134,146`) | 4/2, 2/2 and 3/1, 1/1 | L28 | accepts, site per row |
| Photonic foundry (`photonics.js:89`) | 6/3, 3/1 | L29, L44 | accepts |
| High flux (`transcurium.js:62`) | 3/3, 1/0 | L32 | accepts |
| Swarm segment foundry (`swarm.js:67`) | 8/2, 0/0 | segment mode | accepts exactly (7 products + circuit) |
| ZPM magnet works (`magnet_works.js:76`) | 6/1, 2/0 | L27 | accepts |
| Vent bioreactor (`outer_chemistry.js:43`) | 3/1, 4/2 | L28 | accepts |
| Asteroid processor (`asteroid_belt.js:320`) | 2/4, 1/0 | L37 | accepts; NSC belt string site not verified |
| Regolith cell (`regolith_cell.js:57`) | 4/2, 0/4 | L25 | accepts, site per row |
| Hot strip mill (`combined_cycle_and_hot_mill.js:80`) | 2/1, 1/1 | L34 | accepts |
| **UV superfluid helium plant** (`cold.js:240`) | 0/0, 1/2 | L30 | **FAILS**: no item slots, L30 needs item `charged_pulse_tube` |
| **EV cryogenic plant** (`cryogenic_plant.js:260`) | 0/0, 1/3 | L37 | **FAILS**: no item slots; also hardcodes `.dimension('gcyr:luna')` (server `cryogenic_plant.js:10,103`); L37 needs item `cryo_milled_core` |
| **ZPM plasma quench caster** (`fusion.js:184`) | 1/1, 2/2 | L30 | **FAILS**: L30 needs `er3ni_ingot` + circuit = 2 item inputs against 1 slot (assumes the circuit counts as an item slot; unverified) |

Scope: only the 22 first-used machines plus the swarm foundry were read. The machines added by the repair (MTJ, SHeQUID, TFLN, BEUV, MOCVD, ...; `max.md` "Rows added by the repair") were not shape-checked.

### Proposed contract changes (FAILs)

- Superfluid helium plant at L30: replace the step with a GTM assembler step; L30 stays at 5 steps and loses one crossing. Changes H1.
- Cryogenic plant at L37: replace with a GTM vacuum freezer or macerator step; L37 stays at 5 steps and loses one crossing. Changes R1.
- Plasma quench caster at L30: replace with a GTM alloy blast smelter or assembler step; L30 stays at 5 steps and loses one crossing. Changes H1 (L30, L38).
- No line drops below 4 steps.

## Proposed contract changes from the native spikes

- S0-6 (lib FAIL): MAX-M1 extends `lib/parallel_hatch.js` `.tiers(...)` to 14 and the x1,048,576 multiplier; the mechanism itself is proven.
- S0-8 (hide-only): A1/F2 hide `gtnn:supracausal_mainframe` and its tag entry instead of removing recipes by id; hiding before MAX is untested.
- S0-3: F1/A0 state the cable loss (1 EU per amp per block), not "lossless".
- S0-4/S0-13: D1/D3 generators use a custom generator recipe type with `lib/generators.js`; `macerator` rows do not start.
- S0-11: T2 (or the poller owner) must handle more than one `source`; `kerr_sling.js` serves the first row's only.
- S0-5, S0-9, S0-10: unproven (wireless case 14 hatches, player ending, string-site machines); W, G1/D3 and the first line package keep their own check.
- S0-12 FAILs: see above (H1, R1).
