# UEV S0: spikes

Bench results for UEV-S0 (S0-10 is not here: it runs after MEGA). Base: v0.11.0 content (fb4ce5d). All runs on the Linux VM; run ids are
directories under the session's `test-runs\`. Throwaway ids are `gtceu:gg_uev_s0_*`; every UEV id was registered in the overlay only, with
`highTierContent` off (`pack/config/gtceu.yaml` untouched).

## Results

| Spike | Result | Run | Key figure | Changes |
|---|---|---|---|---|
| S0-1 UEV hull + hatches | PASS | 20261028-014658-server | `uev_machine_hull` forms (`HullMachine`, tier 10). 2 A and 16 A input/output hatches register with `highTierContent=false`, form in our frame (amperage 2 and 16) and the 2 A one in GTM's `assembly_line`. 16 A buffer 2,147,483,648 EU (> int max). | F1 list below. 16 A needs long handling. |
| S0-3 places | PASS | 20261028-014658-server | Datapack planets/dimensions load: `s0_alpha_centauri_orbit` (tier 9), `s0_barnard_b` (tier 9, orbit `s0_barnard_b_orbit`), `s0_sirius_b_orbit` (tier 10). `getPlanetFromOrbit` works for all three; existing planets unaffected. | None. |
| S0-2 rockets | PASS | 20261028-015731-client (alpha, tier 9), 20261028-021302-client (sirius, tier 10) | Motor 7 + BNNT tank (11) = level 9; motor 9 + tank = level 10. Both fly: arrival 401 / 399 ticks after launch, ~3,750 mB burnt, no damage. Asks `galaxyFuelAmount` 26,000 mB. | None: GCYR takes tiers 9 and 10 as is. |
| S0-4 stations 9 and 10 | PASS (deploy and save); slot rows only noted | same two runs | Station 0 deployed in each orbit, 4 iron blocks from the package; `DimensionDataStorage.save()` wrote `gcyr_space_stations.dat`, a fresh read holds station {0}. `stations.slots` has 8 entries today. | A5/B: add 9th and 10th rows to `stations.json` and `orbits.json` (15 orbits, no UEV ones). |
| S0-11 atmospheres | PASS (figures only) | 20261028-014658-server | Barnard b: atmosphere true, oxygen false, 190 K, gravity 12.5. Alpha orbit: none, 3 K. Sirius B orbit: none, 25,000 K, solar 40. Surface landing not flown. | Barnard b surface needs the suit contract (no oxygen). |
| S0-5 `withTiers` to UEV | PASS | 20261028-014658-server | 10 of 10 tiers (lv to uev) register. UHV 2,097,152 V; UEV 8,388,608 V. NBT long round-trips 251,658,240,000. | W: the pack's `withTiers` handles up to 9; add `case 10`. |
| S0-6 fusion at UEV | PASS | 20261028-014658-server | `FusionReactorMachine` tier 10 forms with 50 of 50 UEV 16 A hatches, buffer 107,374,182,400 EU. Start-1.2 G recipe ran 8,000,000 EU/t for 200 t. Storage factor 2,560,000,000. 30 GTM fusion rows, none uses a `grindless:` fluid. | Pattern: use a plain `energy_input` part in every cell. |
| S0-7 EBF 12,600 K | PASS | 20261028-014658-server | `lib/coils.js` `temperature(m)` = 12600; a 12,000 K recipe ran at 114,688 EU/t. MEGA-S `coilParallel`: 64 parallels, 3 t at 122,880 EU/t. | `lib/mega.js` call rechecked in S0-10. |
| S0-8 GTCA modules | FAIL | 20261028-014658-server | Module previews are 1x5x2: `space_elevator_base_casing` plus the module, no bus or hatch (0 of 6). Same as UHV-S0. | Use our own modules, not GTCA's (A packages). |
| S0-9 Lay superhydride | PASS | 20261028-014658-server | `grindless:lay_superhydride` found; ids `gtceu:lay_superhydride_*`. Wire V[UEV] 8,388,608, 4 A, loss 0, not a superconductor. | None. |

## S0-1 exact id list

Dump delta vs base (enabled minus baseline run 20261028-013521-server): items 35,275 to 35,316 (+41), blocks 25,809 to 25,841 (+32),
fluids 0, gtceu machines 1,237 to 1,255 (+18). The overlay-registered ids that cause it:

- UEV (release-note ids): `gtceu:uev_machine_hull`, `gtceu:uev_energy_input_hatch`, `gtceu:uev_energy_input_hatch_16a`,
  `gtceu:uev_energy_output_hatch`, `gtceu:uev_energy_output_hatch_16a`. `gtceu:uev_machine_casing` appears in the delta list too but
  exists in both runs.
- Test-only (not for the release): `gtceu:gg_uev_s0_ebf`, `gg_uev_s0_frame`, `gg_uev_s0_fusion`, `gtceu:uev_gg_uev_s0_w`,
  `grindless:s0_coil_12600`, `s0_motor7`, `s0_motor9`, `grindless:quantum_repeater_node`.
- Lay superhydride (our material): `gtceu:lay_superhydride_{ingot,dust,nugget,plate,foil,block}`, `small_`/`tiny_` dust, `double_..._plate`,
  and `lay_superhydride_{single,double,quadruple,octal,hex}_{wire,cable}`.

Totals as dumped: 33 items, 24 blocks, 0 fluids, 9 machines.

Table ids:
- UIV: `gtceu:uiv_machine_casing`, `gtnn:component_assline_casing_uiv`, `ags_modernmarkings:wall_marking_voltage_uiv` exist. `gtceu:uiv_machine_hull` does NOT
  (`gtceu:uhv_machine_hull` does).
- gtnn: `gtnn:optical_computer` and `gtnn:optical_mainframe` exist as items, with 0 recipes outputting them.
- GTM materials: 12 of 14 found (calcium, potassium, lithium, hafnium, tantalum, rhenium, ruthenium, terbium, lanthanum, yttrium, curium,
  californium). Missing: `plutonium_244` (GTM has `plutonium`, `plutonium_241`; GTCA has `cosmic_plutonium`) and `polycarbonate` (GTM has
  `polyvinyl_chloride`, `polyvinyl_butyral`, `polyvinyl_acetate`).

## Proposed contract changes

- S0-8 FAIL: fallback is our own modules; A packages stop depending on GTCA module previews.
- F1: replace `plutonium_244` and `polycarbonate` with the alternatives above (or register them); the hull list is the five UEV ids.
- W: `withTiers` `case 10`; handle the 16 A hatch buffer as long/JS number (never an int cast).
- Stations (A5/B4): new rows 9 and 10 in `stations.json` and `orbits.json`; the flights and deploy path need no `lib/stations.js` change.
- Fusion (A3): `Pat.oneOf(casing, energy_input{min,max})` blocked forming; use a plain `energy_input` part.

## Bench notes

- Overlay: `gg_test_uev_s0_{parts,dump,machines,stations}.js` and `config/gg_test_uev_s0.json` (master gate) plus
  `config/gg_test_uev_s0_stations.json` (flight gate, `{"enabled":true,"leg":"alpha"|"sirius"}`), both committed `enabled:false`.
- Datapack places: `kubejs/data/grindless/gcyr/planets/s0_*.json` and `kubejs/data/grindless/dimension/s0_*.json` (all under `tools/test/overlay/`).
- Zone `uev_s0`: X 30464-30527, Z 0-63, stations Y 98-112.
- Server runs enable the master marker in a scratch overlay and send `gg_test_uev_s0_dump` and `gg_test_uev_s0_machines`.
- Flights: one leg per client run. The first alpha run (014658-client) died of `OutOfMemoryError` mid-climb with EMI/JEI loaded; the same run with
  `-ClientExclude` for EMI, JEI and EMI Loot passed. A second sirius client run, launched in parallel, stalled before its area setup and hit the
  600 s budget (harness contention); the rerun alone passed.
- Repairs: S0-6 used two (placement, pattern); harness fixes in the dump/machines scripts otherwise.
