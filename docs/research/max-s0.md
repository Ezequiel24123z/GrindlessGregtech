# MAX-S0 spikes (results)

Status: Phase A (static work and S0-12) done; native spikes pending the bench slot. Contract: `docs/eras/max.md` "## S0 spikes". Pattern: `docs/research/opv-s0.md`.

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
| S0-1 | pending (jar finding below) | GCYR 0.2.9 ships dimension `gcyr:black_hole_orbit` but no `gcyr/planets/black_hole_orbit.json`; its planets are earth, luna, mars, mercury, proxima_centauri_b, venus. So it has no tier unless our datapack adds a row (`s0_max_bh_real` tests that) |
| S0-2 | pending | gate unit in `max_s0_machines` |
| S0-3 | pending | cable unit in `max_s0_machines` |
| S0-4 | pending | `s0_4_gen` |
| S0-5 | pending | dump (long maths) plus case 14 temp edit |
| S0-6 | pending; expected FAIL on the lib side | `lib/parallel_hatch.js` registers `.tiers(9..13)` only, so tier 14 is not covered as built; M1 owns the change |
| S0-7 | pending | `max_s0_cube` |
| S0-8 | jar finding | gtnn 1.20.1-1.3.10 registers supracausal items and recipes in Kotlin at runtime (GTNNRecipes, CircuitAssemblyLineMachineRecipeHandler, ComponentAssemblyLineRecipeHandler, WrapItemRecipeHandler), no `data/recipes` JSON, so `event.remove` by id finds none (as OpV S0-4). Tag `gtceu/tags/items/circuits/max.json` = `gtnn:supracausal_mainframe`. Runtime confirmation pending in dump |
| S0-9 | pending (needs a player; client half) | |
| S0-10 | pending | UXV disk machines, Penrose engine (`uiv/cygnus.js`), site rows via `recipe.dimension` (`cygnus_disk.js:112`) |
| S0-11 | pending | `max_s0_relay_1`, `@restart`, `max_s0_relay_2` |
| S0-12 | done, below | |
| S0-13 | pending | `big_gen` in `max_s0_machines`; the string-site leg and wireless case 14 leg are not exercised there |

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

Pending Phase B. Each FAIL will name the fallback from the S0 table and the packages it changes.
