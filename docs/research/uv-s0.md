# UV-S0: native spikes before any UV id exists

Package UV-S0 (issue #25), band X 23040-23103 (zone `uv_s0`). Nothing is registered in `pack/`. Disposable data lives in
`tools/test/uv-s0/kubejs/` and is merged over `tools/test/overlay` at run time:

```
Copy-Item tools\test\overlay $env:TEMP\ov -Recurse; Copy-Item tools\test\uv-s0\kubejs\* $env:TEMP\ov\kubejs\ -Recurse -Force
Invoke-GGTest.ps1 -Suite server -Slots 1 -OverlayDir $env:TEMP\ov -Commands 'kubejs custom_command gg_test_uv_s0_travel;;kubejs custom_command gg_test_uv_s0_machines' -WaitForLog 'GGTEST\|uv_s0\|DONE\|failures@@180'
```

Run ids: dump `20261027-051804-server-722`; final combined run `20261027-055753-server-afd` (0 failures); earlier
`-183` (S0-5 first pass), `-dbf` (S0-2, S0-4 repaired). Client flight `20261027-052548-client-281`.

## Results

| Spike | Result | Run | Figures | What it changes |
|---|---|---|---|---|
| S0-8 ids | PASS | 722 | present/missing list below | Only the three missing materials are ours to register. |
| S0-1 tier 11 tank | PASS (registry) / UNPROVEN (flight) | b7b, 281 | `grindless:s0_uv_tank` is a `FuelTankBlock`, `getTier()` = 11 (no clamp at 10); elite motor tier 3 | Registry accepts tiers above 10. The real level 7 flight did not run: the client OOMed at the 4 GB cap (retry with 8 GB refused by the resource policy). |
| S0-2 planets | PASS | dbf | Neptune 6, Pluto 7, Saturn 5, Uranus 6, Proxima 8; all datapack worlds and orbits load | Datapack planets of tier 6 and 7 work. `gcyr:proxima_centauri_b` has no orbit dimension: tier 8 is unreachable. Sky renderer is client side, not exercised. |
| S0-3 stations | PASS (table) / UNPROVEN (persistence) | dbf | `lib/stations.js` takes a fifth and a sixth `more` row (neptune, pluto) | UV adds two slots by table rows only. Deploy plus restart persistence was not re-proven (`java.lang.Class` blocked by the class filter); it rests on the R9/R14 precedent. |
| S0-4 Mk3 | PASS | dbf | `gtceu:uv_fusion_reactor` forms at tier 8 with 16 energy, 16 input, 16 output hatches; buffer 640,000,000 EU (40 M per hatch); a 640 M start recipe runs on it; the same recipe is refused on a formed ZPM Mk2 (`insufficient_eu_to_start_fusion`). ZPM's audit code loads the Mk3 table unchanged: 30 listed recipes found, 0 missing, 3 unlisted within the Mk3 caps | The 640 M cap covers every one of the 30 loaded fusion recipes (max start 600 M). The three unlisted ones need a fate: `gold_and_aluminium_to_uranium_238_plasma`, `mercury_and_magnesium_to_uranium_235_plasma`, `silver_and_copper_to_osmium_plasma` (24,576-24,578 EU/t, 140-150 M). |
| S0-5 wireless | PASS | afd | An eighth tier row (UV cell 15,728,640,000 EU) builds; four cells give capacity 62,914,560,000; stored 15,728,640,000 read back exactly; readout "15,728,640,000"; all eight tier 8 wireless hatches register (energy and dynamo, 2/4/16/64 A) | UV is one more row in `tables/wireless_energy.json`; no code change. |
| S0-6 generators | PASS | afd | A recipe of a custom type outside `generators.js` TYPES at -2,621,440 EU/t builds and is not doubled (duration 100 stays 100). Plasma turbine as loaded: helium 163,840 EU/mB, tin 524,288, hydrogen 40,960, oxygen 196,608, nitrogen 262,144, calcium 376,832, iron 458,752, nickel 786,432 | New UV generator types must write the x2 into their own recipe durations (or join TYPES). 1.5-2.6 M EU/t recipes are accepted. |
| S0-7 protons | PASS (static) | 722 | `gtceu:comet/proton_simple` (30,720 EU/t x 400 t; hydrogen 200 mB, a `gtca:hydrogen_ion`, circuit 20) gives 9 `gtca:proton` items; the proton is an item, not a fluid | UV protons come from the GTCA comet machine; there is no proton fluid. |

## S0-8 ids

Present: `gtceu:neutronium` (fluid, block, frame, boule, wafer), `gtca:cosmic_neutronium`, `gravi_star`, `quantum_star`; americium
(fluid, ingot, plate, double plate, fine wire, plasma); plutonium_241 (fluid, dust, ingot, plate, plasma); oganesson (fluid and bucket
only); `uhpic_chip`, `uhpic_wafer`; EnTED single wire, block and double plate; `wetware_processor_mainframe` (and the lower
wetware tiers); indium; niobium (ingot, block, nitride, titanium); `thorium_232`; arsenic fluid; yttrium; `uv_machine_casing`, `uv_machine_hull` and the UV machines
(pump, field generator, robot arm, sensor, emitter, voltage coil, battery hull, naquadria battery); tag `gtceu:circuits/uhv`.

Missing, to register as `grindless:` in F1: ytterbium, uranium_233 (only 235 exists), arsine.

The Mk3 recipe is `gtceu:assembly_line/fusion_reactor_mk3` (122,880 EU/t x 1000 t): fusion coil, 4 UHV circuits, quantum star,
americium double plate, 2 ZPM field generators, 128 uhpic chips, 32 EnTED wires, 1152 mB soldering alloy and 1152 mB YBCO.

## Gaps

- **S0-1 flight unproven.** A client JVM at the 4 GB cap ran out of heap before the flight. Fallback from the design table: tank tiers
  above 10 clamp, so level 7 would need a tier 9 tank plus a second tank block, or Pluto drops to tier 6 with a gate item.
  The registry did not clamp. The decision is the orchestrator's.
- **Rocket tier formula conflict.** GCYR HEAD source says the rocket tier is the lowest part tier (an elite motor, tier 3, would cap it); 0.2.9
  as observed in ZPM-B1 behaves as floor((motor + tank) / 2). The flight is the only way to settle it.
- S0-3 persistence and the sky renderer are not exercised. A `Material` registry lookup always printed "absent", so S0-8 used items and fluids.
- The UV hatch ids were confirmed by the S0-4 run (`uv_energy_input_hatch`, `uv_input_hatch`, `uv_output_hatch`).

## Orchestrator decisions (2026-10-27)

- **S0-1:** the design stands. The registry gives tier 11 unclamped and ZPM-B1 observed floor((motor + tank) / 2), so the BNNT tank with an elite motor is level 7. A11's T1 proves the level 7 build and B1's T1 the flight to Pluto orbit (server side, as ZPM-B1). If that flight fails, the `uv.md:1192` fallback applies (Pluto tier 6 with a gate item) and B1 escalates.
- **S0-3:** persistence rests on the LuV/ZPM station precedent; B1's T1 deploys both new stations and checks them after a save.
- **S0-4:** the three unlisted GTM fusion recipes (U-238, U-235 and osmium plasma, 140-150 M) are kept on the Mk3 as GTM has them (GTM wins; inside the caps, no neutronium or naquadria). A3 lists them as kept in `tables/fusion_mk3.json`.
- **S0-6:** UV generators write their final figures in their own recipes and stay out of `generators.js` TYPES (as designed).
- **S0-7:** protons are items: A5's synchrotron takes `gtca:proton` from GTCA's COMET machine; no ioniser row.
- **S0-8:** F1 registers `grindless:` ytterbium, uranium_233 and arsine besides the design's list; everything else is GTM's.
