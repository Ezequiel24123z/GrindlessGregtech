# MAX+ S0-6 to S0-10: registry, placement guard, big structure, teleport, city

Work package XP-S0b (#95). Answers the five world-side spikes of `docs/eras/maxplus.md` (S0 table). It ships no content: the fixtures live only in `tools/test/overlay/kubejs/**` (`gg_test_xp_s0_world_*`, bands in `tools/test/zones.json`). The energy spikes S0-1 to S0-5 are in `docs/research/maxplus-s0.md`.

Runs (VM bench, pack at the pushed ref):

| Spike | Run | Commit |
|---|---|---|
| S0-6 | registry dump `/var/lib/grindless/dumps/latest/items.json` | integration tip |
| S0-7 | `vm-20261101-110802-5139b4ff-3301269` | 5139b4ff |
| S0-8, S0-9 | `vm-20261101-111514-60c7ffc0-3558527` | 60c7ffc0 |
| S0-10 | `vm-20261101-111515-60c7ffc0-3558528` | 60c7ffc0 |

Repairs used: S0-7 none; S0-8, S0-9, S0-10 one each (KubeJS blocks `java.lang.System` and `java.lang.Runtime`; timing now uses `Date.now()`, so heap size was dropped).

## S0-6 Registry ids: yes

Every id that `maxplus.md` names exists.

- GTM creative blocks are exactly five: `gtceu:creative_chest`, `creative_computation_provider`, `creative_data_access_hatch`, `creative_energy`, `creative_tank`.
- `ae2:creative_energy_cell` exists. The MEGA cells and crafting storage exist (`megacells`).
- Substation hatches `gtceu:<tier>_substation_input_hatch_64a` (and `_output_`) exist for EV to UXV, plus `opv_` and `max_`. **There is none above `max_`**, so 2^43 EU/t needs 64 of them.
- AE2 add-ons present: `megacells`, `expatternprovider` (`ex_drive`, `ex_pattern_provider`, `infinity_cell`), `expandedae`.
- Creative items that `maxplus.md` does not list and a guard must also cover: `ae2:creative_item_cell`, `ae2:creative_fluid_cell`, `appflux:fe_creative_cell`, `modularrouters:creative_module`, `storagedrawers:creative_storage_upgrade`, `storagedrawers:creative_vending_upgrade`, `functionalstorage:creative_vending_upgrade`.

## S0-7 `BlockEvents.placed` guard: no (partial)

Measured as a survival fake player; the control (a creative fake player placing `gold_block`) fires the event once.

| Path | Creative blocks placed (of 6) | `BlockEvents.placed` fired |
|---|---|---|
| Hand placement, survival, guard cancelling | 0 | yes, once each |
| Hand placement, creative | 6 | n/a |
| AE2 formation plane (`Item#useOn` with a fake player) | **6** | **0** |
| Vanilla dispenser | **6** | **0** |

The six are the five GTM blocks and `ae2:creative_energy_cell`. Reason from source: Forge's `ForgeHooks.onPlaceItemIntoWorld`, which raises the KubeJS event, runs inside `ItemStack.useOn`; AE2's `ItemPlacementStrategy.placeInWorld` calls `Item#useOn` directly, and a dispenser places through its own behaviour. Neither goes through the hook.

Drives: `ae2:drive` (10 slots) and `expatternprovider:ex_drive` (20 slots) **refuse `ae2:creative_energy_cell`**, but accept `creative_item_cell`, `creative_fluid_cell` and `fe_creative_cell`.

Not tested: the Modular Routers placer module, the `spatialtoolscmp` portable replacer, Supplementaries planter, GTM block breakers (they break rather than place). Treat them as bypassing the event until shown otherwise.

Consequence: a `BlockEvents.placed` cancel is not a safe guard. Take the contract fallback: creative items stay non-block `grindless:` stand-in ingredients, and the extra AE2 and FE creative cells above must be removed from recipes or hidden, not guarded.

## S0-8 45 x 45 x 9 structure with 64 hatches: yes

The box is a test multiblock (`gtceu:gg_s0_world_box`: a 45 x 45 x 9 shell, 18,225 pattern cells, 64 `uxv_substation_input_hatch_64a` with an exact limit of 64). The comparison is the real `gtceu:mirror_shell` (33-cube, 35,937 cells), in the dimension `gg_test:s0_flat`.

S0-8 (form and recheck ms/tick):

| | Box 45 x 45 x 9 | Shell 33-cube |
|---|---|---|
| Build, main-thread `setblock` commands | 628 ms | 759 ms |
| Cold first `checkPatternWithLock` | 155 ms (184 ms with `onStructureFormed`), formed | 32 ms (33 ms), formed |
| Three warm re-checks | 82, 85, 74 ms | 27, 20, 15 ms |
| 200 formed idle ticks, server average | 2.2 ms | 1.1 ms |
| Tick gap during the cold check | 262 ms (one tick) | 50 ms |
| Parts / hatches | 64 / 64, ability `SUBSTATION_INPUT_ENERGY` | 5 / 2 |

Answer: it forms on the first attempt and a re-check costs 75 to 85 ms, about 1.5 ticks. Idle formed ticks stay cheap: the structure is checked on demand, not every tick. Removing one hatch with `setblock air` did not un-form either structure within 10 ticks, and putting it back left it formed (1 tick); so GTM does not re-check on a raw block change, and any re-check on demand costs the figures above. That is a GTM behaviour, not a pack bug, but a "broken ring stops the gate" rule must trigger its own check.

Limits: the box is a stand-in for the Hyperstargate, not the final pattern; the fixture measured one controller on a quiet server.

## S0-9 Player tick check plus teleport to a datapack dimension: yes (server side)

The shipped `uhv/gate.js` transit logic, driven by a fake player (UUID `00000000-0000-4000-8000-0000005301b9`) on the VM dedicated server, between `gg_test:s0_flat` and `gg_test:s0_plots`.

S0-9 (teleport on a dedicated server):

- Flat to plots in 106 ms (first trip, includes chunk load), arrival on the intended block, fall distance 0, health 20.
- No retrigger: five passes standing in the arrival ring caused 0 trips; the flag cleared on leaving the ring.
- Back in 10 ms. Twenty trips in a row: mean 5.7 ms, worst 12 ms.
- Cold destination: the chunk was not loaded before the jump; the jump took 4 ms and the chunk was loaded 40 ticks later, with the floor intact.

Limit: a fake player proves the server logic only. Client behaviour (loading screen, camera, rubber-banding) belongs to the client suites. Fallback (right-click key item) stays available but is not needed.

## S0-10 City jigsaw size: workable up to 48 x 12 x 48 plots

A jigsaw structure (size 7, `max_distance_from_center` 128, the vanilla ceiling) in three datapack dimensions, one structure start per 4 x 4 chunk cell, so one start per band. The plot templates were captured in memory at 16 x 8 x 16, 32 x 10 x 32 and 48 x 12 x 48, each with a jigsaw block.

S0-10 (largest workable district):

| Plot | Pieces | Bounding box | Generation of the 16 band chunks | Server average tick after |
|---|---|---|---|---|
| 16 x 8 x 16 | 113 | 240 x 8 x 240 | 1,899 ms | 328 ms |
| 32 x 10 x 32 | 49 | 226 x 10 x 226 | 2,374 ms | 74 ms |
| 48 x 12 x 48 | 25 | 242 x 12 x 243 | 3,638 ms | 22 ms |

All three finished inside one tick of waiting; none hit the 900-tick ceiling, so no stall ceiling was found. The district footprint is about 240 x 240 blocks in every case: the 128 radius, not the plot size, caps it.

Reading: the wall time is a synchronous worst case, because the fixture blocks the server thread until the chunks are full. It grows with plot volume (about 120 ms per chunk at 16 x 16, about 230 ms at 48 x 48). In play, chunk generation runs on worker threads, so expect a per-chunk cost of that order, not a freeze. A district of 25 to 113 pieces over about 240 blocks is therefore workable; the contract's fallback (fewer, smaller districts) is not needed.

Limits: one start only; no neighbour-start overlap, no Y variation, no player-loaded generation, and the pieces were single-material plots (no real city NBT). Re-measure with the real assets in Phase 6 before fixing district sizes.

## Test-band note

The `gg_test:s0_*` dimensions belong to these fixtures. For S0-10 the structure start is computed from neighbouring chunk cells outside the band (chunk-data writes only, no blocks); only band chunks are forceloaded and written. Bands: `xp_s0_world_guard`, `_structure`, `_teleport`, `_city` (X 44032 to 44863).

## Proposed DECISIONS lines

- Creative blocks must never rely on `BlockEvents.placed`: AE2 formation planes and dispensers bypass it. Keep `grindless:` non-block stand-ins and strip `creative_item_cell`, `creative_fluid_cell`, `fe_creative_cell` from recipes.
- The widest MAX substation hatch is `gtceu:max_substation_input_hatch_64a`: 2^43 EU/t needs 64 of them.
- A formed GTM multiblock is not re-checked on raw block change: gate logic that must react to a broken ring calls `checkPatternWithLock` itself (75 to 85 ms for the 45 x 45 x 9 box).
- City districts: plots up to 48 x 12 x 48, jigsaw radius at most 128, about 25 to 113 pieces per start.
