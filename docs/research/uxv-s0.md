# UXV-S0: spikes

Ten named uncertainties of `docs/eras/uxv.md` "Spikes (S0)", answered on the native bench (Linux VM backend, no fallback) before any permanent UXV id exists. Everything here is overlay-only: `tools/test/overlay/kubejs/{startup_scripts/gg_test_uxv_s0_parts.js, server_scripts/gg_test_uxv_s0_dump.js, server_scripts/gg_test_uxv_s0_machines.js, config/gg_test_uxv_s0.json}`, off unless the marker is `{"enabled": true}`. Throwaway ids are `gtceu:gg_uxv_s0_*` and `grindless:gg_uxv_s0_*`. Zones row `uxv_s0` (X 36128-36191, Z 0-63, Y 70-100, Overworld).

## Temp pack copies (never committed)

- **E1** (S0-1, used by every run but the baseline): in `startup_scripts/grindless/uev/foundation.js` both `.tiers(UEV, GTValues.UIV)` (:180 hull, :193 hatch builder) become `.tiers(UEV, GTValues.UIV, GTValues.UXV)`.
- **E2** (S0-2 and S0-7, E1 plus): `startup_scripts/grindless/lv/wireless_energy.js` `withTiers` gets `case 12:` (twelve tiers); `data/grindless/tables/wireless_energy.json` gets a tier-12 row (`uxv`, cell `grindless:uxv_smes_cell`, capacity 4,026,531,840,000, referenceCount 1,536, link `grindless:gg_uxv_s0_repeater`, uiv emitter/sensor/plate/wire).
- Runs: baseline `run_base` (plain pack, negative control), E1 `run_A`, E1+E2 `run_B` (the final run of the dump and the machines suite; all PASS). `run_M` (E1) held the first machines run. Run dirs are in the session `files\` folder, not committed.

## Results

| # | Result | Run | Key figure |
|---|--------|-----|-----------|
| S0-1 | **PASS** | run_A, run_B | The five UXV ids register with `highTierContent` off and tier-named labels; the UEV/UIV ids are all kept; the hatches form in our frame and in GTM's `assembly_line`; the 16 A buffer is a long. Count below. The recipe id of `gtnn:spintronic_mainframe` was **not** found (see S0-5) |
| S0-2 | **PASS** (hatch leg), wireless leg partial | run_B | warp_gate probe at 2,147,483,648 EU/t (long, `RecipeHelper.getRealEUtWithIO`) on two UXV 16 A hatches: formed, still WORKING 1,000 t into 1,200 t; read-out `2,147,483,648`, total `2,576,980,377,600 EU`. The wireless feed was not run: E2 only proves the UXV wireless hatches register |
| S0-3 | **PASS** | run_B | Both places load as `gcyr:space` planets, rocket_tier 12, `getPlanetFromOrbit` answers, both levels exist; every older id (luna, mars, venus, mercury, proxima_centauri_b, sirius_b_orbit, alpha_centauri_orbit, barnard_b, rx_j1856_orbit, psr_j0437_orbit, cygnus_x1_orbit) still loads. Sky render not tested (no client run) |
| S0-4 | **PASS** | run_B / run_A | `registerFusionTier(12, " (UXV)")` collides with nothing; the ring forms with 16 UXV 16 A hatches (tier 12), buffer 10,240,000,000 EU, runs a recipe starting at 10,000,000,000 at 134,217,728 EU/t; no `fusion_reactor` / `direct_conversion` row id contains an Mk6-style name |
| S0-5 | **PASS (tag) / OPEN (recipe id)** | run_B | `#gtceu:circuits/uxv` = spintronic_mainframe, cosmic_computer, supracausal_assembly, extendedfeatures:uxv_universal_circuit; uhv/uev/uiv hold spintronic_processor/assembly/computer. No recipe id contains `spintronic`; its GT-- recipe is named by another output and needs a by-output search (not done) |
| S0-6 | **FAIL as built (lib), mechanism PASS** | run_B | `lib/parallel_hatch.js:81` hard-codes `.tiers(9, 10, 11)` and :85 names any tier but 11/10 `uhv_parallel_hatch`; no callable registration. An overlay `ParallelHatchPartMachine` at tier 12 reports **65,536**, forms in `gg_uxv_s0_frame` with one UXV 2 A hatch, and a 2,048 EU/t probe runs 65,536 copies = 134,217,728 EU/t (energy-bound exactly). Not tried in the stellar forge |
| S0-7 | **PASS** (math, registration) | run_B | 12 tiers register in one builder; V[12] = 134,217,728; case 12 caps would be 2,684,354,560 to 85,899,345,920 EU (int wraps to -1,610,612,736); NBT long and `formatNumbers` of 4,026,531,840,000 round-trip; `getHatchEnergyCapacity(12, 16)` = 137,438,953,472; the repeater link item registers. The pack's `withTiers` has no case 12 and the table has no tier-12 row: W adds both. Not run: a live tower with a 4 T cell |
| S0-8 | **PASS** | run_B | `gtceu:gg_uxv_s0_pasta_strand` with cable properties V[12], 4 A, 0 loss registers wire Single..Hex and cable Single..Hex |
| S0-9 | **PASS** | run_B | Both places (as datapack): gravity 0, no atmosphere, no oxygen, temperature 10,000,000, solar power 100, days in year 5 (the values the overlay JSON gives; GCYR loads them unchanged) |
| S0-10 | **PARTIAL** | run_B | Not run: the platform placed by a thrown seed. Proven: both places are real, loadable dimensions the platform loader can address. The mechanism (`uiv/travel.js` via `relay_platforms.json` and `gate.json` rows) is table-driven and unchanged; two more rows need only the two dimensions, so the risk is low, but the persistence check (`@restart`, forced chunks) was not repeated for them |

## S0-1 id list and count

Delta against the plain pack (`run_base` vs `run_A`): +5 items, +5 blocks, +5 machines (items 36,120 to 36,125, blocks 25,975 to 25,980, `gtceu` machines 1,344 to 1,349). The five ids, with labels:

1. `gtceu:uxv_machine_hull` ("UXV Machine Hull")
2. `gtceu:uxv_energy_input_hatch` ("UXV Energy Hatch")
3. `gtceu:uxv_energy_output_hatch` ("UXV Dynamo Hatch")
4. `gtceu:uxv_energy_input_hatch_16a` ("UXV 16A Energy Hatch")
5. `gtceu:uxv_energy_output_hatch_16a` ("UXV 16A Dynamo Hatch")

Also found: `gtceu:opv_machine_casing` and `gtceu:uxv_machine_casing`; `extendedfeatures:uxv_universal_circuit` (and an opv one), `gtnn:uxv_wrap_circuit`, `gtnn:component_assline_casing_uxv`, `gtnn:cosmic_*`; all 15 GTM materials of the table exist. Hatch figures: 134,217,728 V; 2 A buffer 4,294,967,296 EU, 16 A buffer 34,359,738,368 EU. Baseline shows the five ids MISSING without E1.

## S0-3 overlay paths

`tools/test/overlay/kubejs/data/grindless/dimension/{s0_vela_pulsar_orbit,s0_cas_a_remnant}.json` and `tools/test/overlay/kubejs/data/grindless/gcyr/planets/{s0_vela_pulsar_orbit,s0_cas_a_remnant}.json` (copies of the Cygnus pattern: `gcyr:space` type, rocket_tier 12). They load only through the bench overlay.

## S0-4 row dumps

`fusion_reactor` rows (30) and the eight `grindless:direct_conversion/*` rows are printed by the dump (`s0_4_fusion_rows`, `s0_4_direct_conversion_rows`) in the run log. No Mk6 name clashes.

## Proposed contract changes for FAILs and open items

- **S0-6 (M1, M2):** `lib/parallel_hatch.js` must register tier 12 (`.tiers(9, 10, 11, 12)`, a `uxv_parallel_hatch` name branch and the matching model path); the mechanism itself holds at 65,536. M1 (the lib package) owns that change. Stay with the stated fallback (x16,384, M1 dropped) only if the lib is not touched. Stellar forge forming at x65,536 is still to be proven in M2's T1.
- **S0-5 (F2, A5):** the circuit tag is already right; F2 must find the GT-- recipe id by output before A5 writes any recipe (search recipes whose output is `gtnn:spintronic_mainframe`).
- **S0-2 (B6):** keep 2,147,483,648 EU/t; T1 of B6 must still run the wireless feed (UXV wireless hatch on a network with a tier-12 row).
- **S0-10 (B1):** B1's T1 runs the full thrown-seed platform and the `@restart` persistence check for both new rows.
- **W:** `withTiers` needs `case 12` and a tier-12 table row (E2 above).
- No change to F1, A7, B4, B5: S0-1, S0-3, S0-4, S0-8, S0-9 passed.
