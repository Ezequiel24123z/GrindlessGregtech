# ZPM-S0 spike results

Bench: server suite, band X 18944-19007, zone `zpm_s0`, fixture `gg_test_zpm_s0` (overlay only, no production edits).
Runs: `20261026-205410-server` (first), `20261026-205840-server` (Proxima tier 8 override), `20261026-210137-server` (final; 13 PASS, 1 expected FAIL).
Every run: no crash, 0 KubeJS errors. Runs 1 and 2 were repairs of my own fixture bugs (recipe id prefix, tower tracking, readout args).

| Spike | Verdict | Run | Decides |
|---|---|---|---|
| S0-1 KubeJS rocket motor tier 5 | **FAIL** | 205410 | B1 |
| S0-2 datapack planets tier 5/6, Proxima tier 8 | **PASS** (registry); buttons not run | 205840 | B1 |
| S0-3 four station slots | **NOT RUN** (client) | - | F2/B1/B5 |
| S0-4 Saturn-orbit-only chemical reactor recipe | **NOT RUN** | - | A2 |
| S0-5 naquadah figures | **PASS** (figures read live) | 210137 | A2 |
| S0-6 fusion Mk2 250 M start | **PASS** | 210137 | A7 |
| S0-7 wireless tower > 2^31 EU | **PASS** | 210137 | A5 |

## S0-1 (FAIL)
`gcyr:rocket_motor` in KubeJS creates `FuelTankBlock`, not a motor (`RocketMotorBlockBuilder` uses the fuel-tank properties). The real `RocketMotorBlock.RocketMotorType` is a fixed enum BASIC/ADVANCED/ELITE (tiers 1-3). `gcyr:fuel_tank` accepts tier 7 (PASS). No flight was run; the rocket-tier formula (assumed floor((motor+tank)/2)) is unverified.
**B1 contract change:** no KubeJS motor tier 5. Level-5/6 rockets cannot come from a custom motor; B1 must use the elite motor (3) with higher tank tiers, and verify the tier formula in a flight spike, or drop level 6, or ship a Java/GCYR-side change (out of pack scope).

## S0-2 (PASS)
Parentless datapack planets load: s0_saturn tier 5, s0_uranus tier 6 (`data/grindless/gcyr/planets/*.json` + `dimension/<n>.json` + `<n>_orbit.json`). Current pack tiers: earth/luna 1, mars 2, venus/mercury 3, belt/io/europa/ganymede 4, jupiter 5, proxima_centauri_b 5.
A tier-8 Proxima override (`data/gcyr/gcyr/planets/proxima_centauri_b.json`, `rocket_tier` 8) loads, so it is unreachable for a level-6 rocket.
**B1:** Proxima must be set to tier 8 by B1 (production currently 5). Level 6 gives Uranus (6). Planet buttons/sky renderers were not exercised.

## S0-5 figures (for A2)
- Large Naquadah Reactor, naquadah fuel: 975,000 EU/t x 120 t per 1 mB excited = 117,000,000 EU/mB (x2 included). 600 mB excited/h = 70.2 G EU.
- Excitation (fusion, start 320 M): 800 mB fuel + 200 mB radon -> 100 mB excited, 26,000 EU/t x 500 t. 600 mB excited/h needs 4,800 mB base fuel.
- Mixer: 7,680 EU/t x 300 t -> 1,000 mB base fuel (item counts unreadable via SizedIngredient hash; use design 42 naquadria + 16 Ce + 16 Nd).
- Waste separation (distillation tower): 480 EU/t x 300 t, 2,000 mB waste -> 500 sulfuric + 250 naquadria solution + 100 enriched naquadah solution.
- Depleted fuel centrifuge: 1,920 EU/t x 600 t, 125 mB -> 18 mB xenon + items.
- Plant assembler `grindless:assembler/naquadah_plant`: 1,920 EU/t x 600 t.
- Refining: `enriched_naquadah` 30,717 EU/t x 5,984 t -> 750 mB impure naquadria solution; `spent_naquadah` 30,716 EU/t x 3,558 t -> 2,375 mB.
- Large Naquadah Reactor assembly line: 122,880 EU/t x 4,200 t.
Limitation: item inputs/outputs of GT recipes print as object hashes, so item counts were not captured.

## S0-6 (PASS) - A7
Mk1 (LuV, tier 6) forms with 160 M buffer; Mk2 (ZPM, tier 7) with 320 M. Custom `grindless:fusion_reactor/s0_d_he3` (D 125 + He-3 125 -> helium plasma 125, 16,384 EU/t x 32 t, start 250 M): Mk2 runs it (32,768 EU/t x 16 t after one overclock, 125 mB plasma out); Mk1 refuses (`insufficient_eu_to_start_fusion`). The A7 premise holds.
Plasma turbine (generators.js x2 included): helium plasma 2,048 EU/t x 80 t per mB = 163,840 EU/mB; tin plasma 2,048 x 256 = 524,288 EU/mB.
Note: custom-recipe ids use the `grindless:` namespace.

## S0-7 (PASS) - A5
Four `grindless:luv_smes_cell` (983,040,000 each) give capacity 3,932,160,000 (> 2^31) after `track`; the store set and read back exactly; status and readout show "3,932,160,000". No change to A5's int-free storage is needed. Towers must be tracked (a `setblock` does not fire `BlockEvents.placed`; real placement does).

## Not run (honest gaps)
- S0-1 flights and S0-2 planet buttons, S0-3 four station slots: need client runs (~300 s each) and a table-driven copy of the station slots; not executed. **F2/B1/B5 contract:** treat a fourth station slot as unproven; keep F2 table-driven and add a client spike before relying on it.
- S0-4: the Saturn-orbit-only chemical reactor recipe was not probed. Precedent (`ae2_interplanetary.js`) uses `.dimension(dim)` on `chemical_reactor`; A2 should assume it works but verify in its own T1.
