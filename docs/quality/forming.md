# Forming sweep (QR-B1)

Proof that every multiblock our startup scripts register forms from the first shape of its own EMI preview (`def.getMatchingShapes()[0]`). Fixture: `tools/test/overlay/kubejs/server_scripts/gg_test_form_sweep.js`. Usage: `docs/testing/usage.md`.

## Method
- Ids: 234 multiblocks in 16 eras, derived statically by `node tools/analysis/form-sweep-ids.mjs --write` into `config/gg_test_form_sweep_ids.json`.
- Per id: clear the cell, place the shape (flags 18, controller last), run GTM's pattern check in the placing tick, report PASS or FAIL with the refused cell and the expected blocks.
- Timing: the whole sweep takes about 48 s in-game, about 216 s wall including boot. One `gg_test_form_sweep_all` run fits the 600 s budget; no chunking needed (`next=` cursor exists anyway).
- Conditional multiblocks: none found. Our scripts have no dimension or cleanroom forming conditions (those are recipe-level only), so there are no NOTE rows.

## Result (main 2e54da00 + this branch)
Run `20261029-040717-server`: **234 PASS, 0 FAIL, 0 NOTE** (`DONE|failures=0 ids=234`).
All pass via an explicit `checkPatternWithLock()` + `onStructureFormed()` call; the previews match the patterns.

| Group | Result |
|---|---|
| 5 Large Steam machines, `methane_pyrolyser` | PASS |
| 13 Rhino const-in-loop structures | PASS |
| LV `submerged_arc_furnace` (5x6x5), `wire_works` (5x4x5) with cupronickel coils and firebricks | PASS (forms; craftability at LV not measured) |
| S1-reshaped steam-IV structures | PASS |

## Fixture artifacts found on the way
A first variant waited 2 ticks before checking. 7 ids then failed because their previews place blocks that do not survive floating in air: `sealed_dome`, `pressurized_vein_drill`, `venus_acid_works`, `venus_heat_engine` (regolith, falls), `lunar_drill` (regolith, moon sand/stone, falls), `biofoundry` (`minecraft:iron_door`, pops), `fumarole_condenser` (`biomesoplenty:brimstone_fumarole`, needs support). Checking in the placing tick makes them pass. A static check on dump-w3 (integration, after QR-B1) found every gravity block and door in these and 6 other structures (cryogenic_plant, lunar_solar_array, deep_space_antenna, ev_vein_drill, tritium_removal_facility, harpoon_anchor_drill) either on the bottom layer or on a pattern block, so a structure built on the ground holds; only the fixture's structures floating at Y 100 lose them.

## Main finding (not a sweep result)
`pack/kubejs/startup_scripts/grindless/sounds.js` (QR-E1, check at lines ~88-92) calls `console.error('recipe type not found: gtceu:thermochemical_hydrogen')`. That type is only registered by `luv/io_orbit.js` when `tables/stations.json` is enabled, and KubeJS aborts startup on that error, so every native run on main aborts. Proposed fix: log (not `console.error`) and skip when `Registries.RECIPE_TYPES.get(...)` is null. The sweep was run with that line locally downgraded to `console.log`; it is not committed.
