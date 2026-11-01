# RF-3M: LuV and ZPM process-line charts

Local audit run (`tools/analysis/line-audit.mjs`, dump `rf3a/out4`). pl-check luv and zpm: 0 issues.

## Verdict counts

| Era | Before | After |
|---|---|---|
| LuV | 38 lines: 33 fix, 1 remove, 4 keep | unchanged (nothing missing; no chart edit moved a verdict) |
| ZPM | 14 lines: 13 fix, 1 keep | 16 lines: 15 fix, 1 keep (the two added lines are short) |

## Lines added (ZPM, in the dump, pl-check passes)

- Line 5, Helium-3 power: `power` cluster (D + He-3 in the Mk2, helium plasma, direct energy converter, helium back to the column).
- Line 12, Duranium and the quench: `duranium` cluster (gallium + radon in the Mk2, duranium plasma, plasma quench caster with argon, duranium plate). Radon links to `pl_iv:radon`.

## Designed, not built (absent from the dump)

- ZPM 4 Gas giant volatiles (only the Saturn siphon exists), 6 Titan organics, 7 Enceladus, 10 Living chemistry, 13 Network storage, 14 Charts and data.
- LuV: nothing. Its era doc describes lines in prose and the charts already match them; `03_missing_lines.csv` has no LuV row.

## Sorting the fix verdicts

Honest result: the new lines and the existing short lines cannot be lengthened by chart edits. The audit counts a machine node with no inputs as 0 steps, and raw or link nodes add none, so the chart already shows every real recipe in the dump. Each remaining verdict is a **real problem** (a content package must add steps or crossings). Chart gaps found: none that a pl-data edit alone could fix beyond the two lines added.

| Group | Rows (steps) | Problem | Proposed fix | Files a content package would touch |
|---|---|---|---|---|
| LuV belt iridium, osmium, tetrataenite | 3-4, skippable | A shorter recipe (`pgm_refining`, `chemical_reactor`, `forge_hammer`) bypasses the line | Remove or gate the bypass recipes so the belt is the only route | `server_scripts/grindless/luv/` belt recipes, integration recipe overrides |
| LuV research | data orb (2, bypass `circuit_assembler/data_orb`); HPCA array audited "remove" (no consumer) | Bypass; HPCA has no consumer in the dump | Remove the circuit_assembler data orb recipe; give the HPCA array a consumer (ZPM qubit array) | luv research recipes, `zpm` qubit recipes |
| LuV miner carbon monoxide | 2, bypass `air_scrubber` | Shorter route | Drop the scrubber route | luv miner recipes |
| LuV reactor, tape, magnets x4, network, biofoundry x2, organoid, orbital x3, grower x2, fusion, io x3, ioorbit, europa, ganymede x3, travel x3, miner (1-3 steps) | 0-3 | Single-machine lines with raw inputs | Add real intermediate steps (precursor, coating, assembly) or merge into a longer line, with crossings to earlier eras | the era's `server_scripts/grindless/luv/*` recipe files, `startup_scripts` only if new items are needed |
| ZPM saturn He-3 | 2, bypass `hot_cell/tritium_store` | Shorter route | Drop the bypass | zpm saturn recipes |
| ZPM saturn deuterium | 2, bypass `electrolyzer/heavy_water_electrolysis` | Shorter route | Drop the bypass | zpm saturn recipes |
| ZPM actinides x4, europium, qubits x3, uranus x2, saturn ring ice | 0-3 | Machine-only or one-step lines, no crossing | Add precursor steps and cross into IV/EV lines | zpm recipe files |
| ZPM power, duranium | 2 | Few steps: the quench and the converter are one machine away from raw fluids | Add upstream steps (He-3 loop crossing the Saturn column, foil casting) | zpm recipe files |

Proposed DECISIONS line: LuV/ZPM chart verdicts are real content problems; the content package owns step additions.
