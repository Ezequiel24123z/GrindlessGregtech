# MAX+ S0a spikes (results)

Status: S0-1, S0-2, S0-4, S0-5 answered; S0-3 inconclusive (fixture, not the cable). S0-11 (XP-D1, issue #140, the dial's power path) answered: see its section below. Contract: `docs/eras/maxplus.md` "## S0 spikes" (package XP-S0a, issue #93). Pattern and precedent: `docs/research/max-s0.md`. S0-6 to S0-10 belong to XP-S0b.

## Harness and runs

Overlay only, off unless `kubejs/config/gg_test_xp_s0.json` says `{"enabled": true}` (committed as false). Under `tools/test/overlay/kubejs/`: `startup_scripts/gg_test_xp_s0_parts.js` (kerr material at V[MAX], 256 A, loss 0, and a loss-1 twin; 256 A and 1,024 A in/out hatches; `gg_xp_s0_gen` generator recipe type; the plate and generator-plate multiblocks; a tier-14 parallel hatch), `server_scripts/gg_test_xp_s0_machines.js`, and the `xp_s0` row of `tools/test/zones.json` (x 43520-43583). Throwaway ids `gtceu:gg_xp_s0_*`; no final MAX+ id is used.

VM bench runs (`gg-vm-run.sh`, branch `ezequiel24123z-xp-s0a-maxplus-spikes`, test `gg_test_xp_s0_machines`):

| Run | Commit | Result |
|---|---|---|
| vm-20261101-102853-d70d4238-1752476 | d70d4238 | boot crash: no `Java.extend` in this KubeJS, and `console.error` in a startup script is fatal (fixed: `console.warn`) |
| vm-20261101-103705-0897dba7-1756172 | 0897dba7 | all spikes ran, 12 fixture failures (wrong expectations, see below) |
| vm-20261101-104517-e1c5fa16-1757978 | e1c5fa16 | 2 failures (x64 sustained, cable flow) |
| vm-20261101-105154-0cc0b516-2013291 | 0cc0b516 | 2 failures; cable diagnostics: pipe net null |
| vm-20261101-105647-e5dc4118-2276258 | e5dc4118 | final: `failures=1` (cable flow only) |

T0 (Actions `t0.yml`): run 41299667964 on e5dc4118. Every check is ok (static, quests, tooltips, analysis 2500 pass) except `capacity: NEW grindless:chemical_reactor/ktp_flux: 3 item inputs > type max 2`. That violation is in the base branch, not in these files: the integration branch's own run 41296547797 fails the same way, and a later integration commit fixes it.

## Results

| Spike | Answer | Evidence (final run unless noted) |
|---|---|---|
| S0-1 | **Yes** | 1, 4 and 64 `gtceu:max_substation_input_hatch_64a` (buffer 2^41 each) form the plate; the energy list reads 2^37, 2^39 and 2^43 V x 1 A. Recipe EU/t is read exactly as a long: 137,438,953,472 / 549,755,813,888 / 8,796,093,022,208 (as an int each reads 0). Draw per tick is exact (avg = min = max for x1 and x4; x64 has one 0 sample at the start, avg 8,759,134,648,165), no negative sample, and the 200 t outputs completed in all three. Inflow through the hatches (64 A x V[MAX] each) sustained exactly for x1 and x4; for x64 it averaged 99.2% of the draw after start-up (98.4% in an earlier run), which the lean-buffer fixture cannot tell from a refill artefact. The cap per hatch is V x A = 2^37, so 64 hatches = 2^43 exactly: no headroom |
| S0-2 | **Yes** | An overlay `EnergyHatchPartMachine` at tier 14 with 1,024 A registers, forms, and carries a 2^41 EU/t recipe: buffer 2^45, inflow exactly 2^41 per tick (drift 0), output completed. The same builder gives 256 A and 1,024 A output (dynamo) hatches. Rotation is `RotationState.ALL` |
| S0-3 | **Inconclusive** | Properties read back exactly: voltage 2^31, amperage 256, loss per block 0 (and 1 on the lossy twin). The 256 A hatch pair reads 2^31 V x 256 A both ways. Energy never flowed in any cable run, including the controls: GTM stock 16 A hatches on the kerr cable and on the loss-1 twin gained 0 as well, so the cause is the fixture, not 256 A or loss 0. Run 0cc0b516 showed the pipe net null (the scheduled block tick that registers a cable in its net had not fired in this zone); forcing that tick (run 6) gives "pipe net present, 3 nodes" but still 0 flow. By the source: `EnergyNetHandler.acceptEnergyFromNetwork` does all its arithmetic in `long`, rejects a path only when `getMaxLoss() >= voltage` (0 never does) and burns a cable only when its max voltage is below the packet voltage. Needs a follow-up with the cable run in a zone where the MAX precedent flowed (`max_s0`) or a first-tick net rebuild |
| S0-4 | **Yes** | A generator multiblock (custom `gg_xp_s0_gen` type, `setEUIO('out')`) generates at 2^33 and 2^35 on one 16 A dynamo hatch, at 2^36 and 2^37 on one 64 A substation dynamo hatch, 2^39 on four, and 2^41 on a 1,024 A dynamo hatch: the recipe EU/t reads as an exact long and the dynamo holds exactly 10 x EU/t after 10 ticks each time. The ceiling is the dynamo's V x A, not 2^30: 2^36 on the 16 A hatch (V x A = 2^35) and 2^38 on one 64 A hatch (2^37) did not start. Each plate needs its own hatch for its own cap, so plant output scales with hatches, not with the multiblock |
| S0-5 | **Yes, by reflection; capped by the energy supply** | `Java.extend` does not exist in this KubeJS (`Cannot find function extend in object JavaWrapper`), so no subclass hatch. The tier-14 `ParallelHatchPartMachine` built by KubeJS keeps a private `currentParallel`; setting it by reflection makes `getCurrentParallel()` report 4,194,304 (4^11) and the recipe runs with 4,194,304 copies. A 6,144 EU/t probe reads 25,769,803,776 EU/t (6,144 x 4,194,304, exact long, positive). Copies are limited to `floor(list voltage / EU/t)`: on two 16 A MAX hatches (2^35) a 10,000 EU/t probe got 3,435,973 copies, and a 2,048 EU/t probe overclocked 4x per step up to exactly 2^35. A x4,194,304 hatch is only useful when the supply is above the sum of the copies |
| S0-11 | **Yes** | XP-D1 (issue #140), run vm-20261101-165330-3c0627e7-2175601: a 4,096 A wireless MAX+ hatch registered as XP-W2 will (the wireless hatch builder at tier 14, `INPUT_ENERGY`, entered in the network's book) forms in an `energy_input` cell and reads V[MAX] x 4,096 A, buffer 2^47 = 140,737,488,355,328. Its cap per settlement is the `maxplusCaps` 4,096 A row, 87,960,930,222,080: two settlements fill it from empty (the cap, then 52,776,558,133,248). A 2^43 EU/t row (the long 8,796,093,022,208; as an int 0) drew exactly 2^43 on all 60 of its ticks from a store of 1,055,531,162,664,960 (more than 2^43 x 20 x 20/19); the steady timed settlements handed out exactly the cap, and the hatch never read below 6 ticks of the dial (52,776,558,133,248). All 240 values read were exact positive longs at most 2^53, store, hatch, draws and settlements balanced to the EU, and the store's NBT long had the same digits |

## Consequences for MAX+

- **Dial (S0-1).** 2^43 on 64 substation hatches is possible in principle but sits exactly on the cap (no spare amp). Prefer the 1,024 A hatch (S0-2) for the dial: 2^41 per hatch, four hatches for 2^43. Keep the 2^39 / 19,200 t fallback only for a pack without custom hatches.
- **Custom hatches (S0-2).** XP-F1 can register `grindless:maxplus_energy_hatch_1024a` (and the 256 A pair) with the builder in `gg_test_xp_s0_parts.js`.
- **Generators (S0-4).** Output above 2^30 is fine up to hatch V x A (2^35 on 16 A, 2^37 on 64 A, 2^41 on 1,024 A). The burner (c1 at 2^34) fits one 16 A dynamo hatch; the Hyperstargate plant needs 64 A or 1,024 A dynamos.
- **Parallel hatch (S0-5).** XP-F1 sets `currentParallel` by reflection (pattern in the fixture) or registers it through a startup hook without `Java.extend`. Every recipe on it needs an energy list of at least `EU/t x copies` volts: size the parallel against the supply, not the hatch.
- **Cable (S0-3).** Still unproven: keep the fallback (item only; wireless) until the follow-up. Wireless case-14 64 A caps are math, not testable in the overlay: XP-W.

## Repairs (per spike, at most 2)

Boot fix (startup `console.warn`) was shared. S0-1: lean energy buffers (one tick of V x A) and a steady-state inflow window after start-up. S0-4: trial sequencing (reset the recipe logic, match the id) and the correct EU/t assertion. S0-5: expected EU/t accepts the 4^k overclock factor. S0-3: diagnostics with stock and loss-1 controls, then a forced registration tick; stopped there.

## S0-11 (XP-D1): the dial's power path

**Question** (issue #140). Does a 4,096 A wireless MAX+ hatch, registered the way XP-W2 would register it, fit a multiblock's `energy_input` slot and draw 2^43 EU/t for at least 20 ticks from a network store holding more than 2^43 x 20 x 20/19 EU, every value an exact positive long through settlement? GTM's 64 A substation hatches fit no `energy_input` slot (batch 7), so the dial needed another path.

**Harness.** Overlay only, off unless `kubejs/config/gg_test_xp_s0_dial.json` says `{"enabled": true}` (committed as false); the VM runs used an overlay copy with the marker on (`gg-vm-run.sh ... -OverlayDir`). `startup_scripts/gg_test_xp_s0_dial.js` registers `gtceu:max_gg_xp_s0_dial_hatch_4096a` with the wireless hatch builder of `lv/wireless_energy.js` (GTM's `EnergyHatchPartMachine`, tier 14, `IO.IN`, 4,096 A, `INPUT_ENERGY`) and enters it in `global.grindless.wireless.hatches`, plus the recipe type `gtceu:gg_xp_s0_dial` and `gtceu:gg_xp_s0_dial_plate` (3 x 3 x 3, one `energy_input` cell, IDENTITY modifier). `server_scripts/gg_test_xp_s0_dial.js` (zone `xp_s0_dial`, x 47616-47679, Overworld) takes its turn on the wireless queue, keeps the network's persistent data aside, builds a tower of 32 MAX SMES cells and the plate, settles twice by hand to fill the hatch, then lets the pack's timed settlement run while a 60-tick probe row draws, and samples store + hatch every tick.

| Run | Commit | Result |
|---|---|---|
| vm-20261101-164703-24f6630f-2172743 | 24f6630f | 8 PASS, 2 FAIL, both the fixture's: the first run sample came 10 ticks late (one step of 9 x 2^43, then 51 of 2^43: the row's 60 ticks), and the store tag's digits were compared with their SNBT `L` |
| vm-20261101-165330-3c0627e7-2175601 | 3c0627e7 | **10 PASS, 0 FAIL** (repair 1: sampling from the first tick, digits without the `L`) |

T0 (Actions `t0.yml`): run 41328461499 on 3c0627e7, green.

**Beyond the question.**
- *The store above 2^53.* The dial's 1,200 ticks are 10,555,311,626,649,600 EU, more than 2^53. The settlement keeps its store as a JS double (`lv/wireless_energy.js:208-214`). The `long53` NOTE: `Number(getLong(...))` reads 2^53 + 1 as 2^53, while `putLong(BigInteger.longValue())` stores 2^53 + 1 exactly and `BigInteger` arithmetic on the tag's digits stays exact (2^53 + 1 + cap - 1 = 9,095,160,184,963,072). XP-W2 can keep the store exact as a `BigInteger`.
- *The energy list.* With one 4,096 A hatch, GTM's list reads 2^43 V x 1 A and the machine's max voltage 2^31; under IDENTITY the 2^43 row runs anyway, as the 1,024 A MAX+ machines' rows do.
- *Margin.* A full 4,096 A hatch swings between 16 and 6 ticks of the dial; the settlement right after the row starts hands out what the first ticks drew (9 ticks here), the last one what the last ticks drew.

**Consequences.** The dial takes one 4,096 A wireless MAX+ hatch (`docs/eras/maxplus.md`, *Voltages, hull, hatches and controllers*). XP-W2 registers it by the same builder and settlement, so this proof is reused; its own T1 is the exact store above 2^53. S0-11 ran below 2^53 for 60 ticks: the dial's full 1,200 ticks from a store above 2^53 are XP-G1's T1. **Repairs:** 1 of 2.
