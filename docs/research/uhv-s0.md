# UHV-S0: native spikes before any UHV id exists

Package UHV-S0, band X 27904-27967 (zone `uhv_s0`). Nothing is registered in `pack/`. Disposable data and registrations live in
`tools/test/uhv-s0/kubejs/` and are merged over `tools/test/overlay` at run time:

```
Copy-Item tools\test\overlay $env:TEMP\ov -Recurse; Copy-Item tools\test\uhv-s0\kubejs\* $env:TEMP\ov\kubejs\ -Recurse -Force
Invoke-GGTest.ps1 -Suite server -Slots 1 -OverlayDir $env:TEMP\ov -Commands 'kubejs custom_command gg_test_uhv_s0_machines' -WaitForLog 'GGTEST\|uhv_s0\|DONE'
# client half (S0-2 flight, S0-4 deploy and save, S0-7 ring teleport): kubejs\config\gg_test_uhv_s0_stations.json = {"enabled":true,"leg":"gate|mercury|proxima"}
Invoke-GGTest.ps1 -Suite client -Slots 1 -OverlayDir $env:TEMP\ov
```

Run ids (all `test-runs/<id>`): id dump `20261027-123619-server`; machines `20261027-125558-server` (first pass),
`20261027-130053-server` (repair 1), `20261027-130653-server` (repair 2, final). Client: ring `20261027-134309-client`
(repair 2; earlier `-132440`, `-133644`), Proxima flight `20261027-134827-client` and `-141056-client` (save), Mercury flight `20261027-135855-client` (froze).
`-131117` and `-131610` died of `OutOfMemoryError` in world setup before any spike ran (the 4 GB client cap; 6 GB is refused by the
resource policy).

## Results

| Spike | Result | Run | Figures | What it changes |
|---|---|---|---|---|
| S0-1 ids | PASS (dump) | 123619 | list below | F1 registers berkelium, niobium oxide and lead fluoride; zirconia comes from GTCA's zirconium carbide line or is ours; there are no UHV components; the dyson id is `gcyr:dyson_system_controller`. |
| S0-2 level 8 rocket | FAIL as written / PASS with a motor of tier 6 | 125558, 130053, 134827 | GCYR 0.2.9's KubeJS `gcyr:rocket_motor` builder makes a `FuelTankBlock` (tier 5, `motor false, tank true`): a KubeJS motor cannot exist through the builder. `gcyr:fuel_tank` builder at tier 13 works. A motor made with `createCustom` (`RocketMotorBlock` with an `IRocketMotorType` tier 6, carry 75, count 3) works: 6 motors tier 6 + 2 `grindless:bnnt_fuel_tank` tier 11 give partsTier 8 (reflection: motorTier 6, fuelTankTier 11, partsTier 8); the rocket launched with 50,000 mB (GCYR asks `galaxyFuelAmount` 26,000; tanks hold 2,048,000), reached `grindless:proxima_b_orbit` in 765 ticks, 5,030 mB burnt | A8: the UHV motor is a `createCustom` `RocketMotorBlock` at tier 6 (or keep elite tier 3 and use a tier 13 tank: (3+13)/2 = 8). The return flight was not flown (Earth needs tier 1; nothing new). |
| S0-3 Proxima orbit | PASS | 125558, 130653 | Override at `data/gcyr/gcyr/planets/proxima_centauri_b.json` with `orbit_world: grindless:proxima_b_orbit` (`gcyr:space` type and generator): surface `gcyr:proxima_centauri_b` kept at tier 8, both levels load, `PlanetData.getPlanetFromOrbit(proxima_b_orbit)` = `gcyr:proxima_centauri_b`, the orbit is in `G.orbits`. The pack's current Proxima `orbit_world` is `gcyr:proxima_centauri_b_orbit`, which does not exist. A player who falls out of the orbit lands on the surface (seen in `-132440`, `-133644`) | B1 ships the override in that path; B7 can put the gate's far end in the orbit. |
| S0-4 stations | PASS (8th row deploy and save); 7th row slot only | 130653, 134827, 141056, 135855 | `stations.slots` takes a 7th (`gcyr:mercury_orbit`) and an 8th (`grindless:proxima_b_orbit`) entry; the first six slots are unchanged. Proxima: station 0 deployed, 4 iron blocks at Y 64 from the package. Save: `DimensionDataStorage.save()` for the orbit level wrote `data/gcyr_space_stations.dat`; a fresh `StationWorldSavedData` read from disk holds station {0} (141056). A full `save-all flush` OOMs the 4 GB bench client (134827). Mercury (motor 3, tank 9, level 6, asks `solarSystemFuelAmount` 14,000) launched but the integrated server stopped ticking during the ascent (the GCYR #91 freeze, 135855), so the 7th row is proven by the slot list and the shared deploy path, not by its own flight. | F2 needs no `lib/stations.js` change. Contract wording: the 7th and 8th slots are the 5th and 6th `more` rows. |
| S0-5 SMES and wireless | PASS | 125558 | UHV cell row tier 9: capacity 62,914,560,000 EU, readout "UHV / 62,914,560,000"; four cells 251,658,240,000. UHV wireless hatches 2/4/16/64 A register; per-window caps 41,943,040 / 83,886,080 / 335,544,320 / 1,342,177,280 EU (64 A hatch buffer 2,147,483,648). Four of ten UHV table recipes take `grindless:nuclear_clock` as the link | A9 is one more row in `tables/wireless_energy.json`; no code change. |
| S0-6 swarm generator | PASS | 125558, 130053 | A `G.generatorMultiblock`-style recipe with segments in, worn segments out: 2,097,152 EU/t (c1) and 8,388,608 EU/t x 20 t (c2), durations not doubled; 167,772,160 EU measured per c2 run; 4 worn segments and 400 mB oganesson per run. Mk3 oganesson: `gtceu:fusion_reactor/oganesson` 122,880 EU/t x 240 t, start 600 M, californium 32 + calcium 720 -> oganesson 720 mB (the only oganesson source) | B3 as written. The dynamo must hold 8.4 M EU/t: a 4 A UHV dynamo buffers 536,870,912 while `lib` `dynamoCapacity` gives 8,388,608 with parallel 1; check the hatch amperage in B3. |
| S0-7 ring teleport and wireless | PASS | 134309, 125558 | A formed `gtceu:s0_swarm_control` running its recipe; the player standing on it is moved server side with `player.teleportTo('grindless:proxima_b_orbit', x, y, z, 0, 0)`; server and client both report the new dimension 40 ticks later, the server keeps ticking, the ring made 335,544,320 EU while the player was away, and the player came back the same way. UV 2 A wireless hatches in `grindless:proxima_b_orbit` and `minecraft:the_end` each received 10,485,760 EU | B7 gate is a plain recipe multiblock plus a server teleport; B4 wireless works in any dimension. |
| S0-8 GTCA elevator | PARTIAL: elevator PASS, module FAIL | 125558, 130053, 130653 | `gtca:space_elevator` (type `gtceu:space_elevator`, 0 recipes) forms as `SpaceElevatorMachine` (35 x 43 x 35, neutronium frames, `motor_mk_1`) and runs a KubeJS recipe (`grindless:space_elevator/s0_space_elevator`, stone out). Motor tier 1 unlocks 6 of 12 module slots. `gtca:space_assembler_mki/ii/iii` (type `gtceu:space_assembler`, 0 recipes) form only as their 1 x 5 x 2 preview (9 base casings + controller): no bus, hatch or energy position, and a bus in a casing position breaks the pattern. In GTCA 2.2.0 the modules are plain `WorkableElectricMultiblockMachine`s; `ElevatorLinkedModuleMachine` exists but no machine uses it, so the elevator never feeds them | A7 keeps the elevator (with its own recipes) and drops the assembler modules, or makes our own module multiblock; F2 hides the modules and the GTCA test recipes `gtceu:space_miner/ha`, `gtceu:space_pump/test`. |
| S0-9 Proxima b | PASS | 123619 | tier 8, gravity 9.806, atmosphere true, oxygen true, temperature 303 K, solar 13, days in year 11, galaxy `gcyr:milky_way`, system `gcyr:proxima_centauri` | Breathable and warm: B1/B4's "no combustion, sealed machines" is a design rule, not a GCYR condition. |

## S0-1 id dump (`highTierContent` false)

- Present: `gtceu:uhv_machine_hull`, `gtceu:uhv_machine_casing`, 38 UHV parts (energy, dynamo, laser, converter, buses);
  `gtceu:uev_machine_casing`; parallel hatch IV, LuV, ZPM, UV only (no UHV); wetware board to mainframe; californium and oganesson
  (fluids only); curium (ours); thorium; uranium 233; nickel; indium phosphide (dust only); silicon carbide (GTCA);
  `gtnn:optical_processor`, `gtnn:optical_assembly` and the optical line; dyson blocks `gcyr:dyson_system_controller`,
  `dyson_sphere_casing`, `dyson_sphere_maintenance_port`, `dyson_solar_cell`, `dyson_construction_drone`, `dyson_swarm_satellite`;
  41 Proxima b blocks and items (regolith, turfs, fluorite ore).
- Missing: berkelium, niobium oxide, lead fluoride, zirconia (GTCA has zirconium carbide, gtnn has europium cubic zirconia),
  every UHV component (emitter, sensor, motor, robot arm, field generator), `gcyr:dyson_controller` (wrong id).
- UHV circuits: `gtnn:gooware_computer`, `gtnn:optical_assembly`, `gtnn:spintronic_processor`, `gtceu:wetware_processor_mainframe`,
  `extendedfeatures:uhv_universal_circuit`.

## Proposed contract changes (orchestrator decides)

1. A8: GCYR's KubeJS motor builder is broken; the tier 6 motor is a startup `createCustom` `RocketMotorBlock` with its own
   `IRocketMotorType` (reference: `tools/test/uhv-s0/kubejs/startup_scripts/gg_test_uhv_s0_parts.js`), or the tank goes to tier 13.
2. B1: the override file path is `data/gcyr/gcyr/planets/`; fix the pack's missing `gcyr:proxima_centauri_b_orbit`.
3. F1: register berkelium, niobium oxide, lead fluoride and zirconia; A rows that name UHV components use UV emitter/sensor pairs or
   gtnn parts; no UHV parallel hatch.
4. `gcyr:dyson_controller` -> `gcyr:dyson_system_controller` (`uhv.md:165,553`).
5. A7/F2: elevator yes, GTCA modules no (see S0-8).
6. B3: check the swarm dynamo amperage against `lib` `dynamoCapacity` (8,388,608 at parallel 1).
7. F2 wording: 7th and 8th slots are the 5th and 6th `more` rows.

## Bench notes

- The 4 GB client is short of heap for this pack: full `save-all flush` and two flights in one run both OOMed. One leg per run and
  `DimensionDataStorage.save()` of the flown orbits only.
- A `fill` through `execute in <orbit>` in a freshly generated orbit chunk left air; setting blocks through the level works.
