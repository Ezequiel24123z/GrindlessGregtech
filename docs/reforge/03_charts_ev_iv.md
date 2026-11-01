# RF-3O: EV and IV process-line charts

Package RF-3O (issue #62). Chart data only: `pl-data-ev.mjs`, `pl-data-iv.mjs`. No recipe changes.
Audit: `node tools/analysis/line-audit.mjs` on the rf3a dump, before and after. `pl-check` passes with 0 issues.

## Verdict counts

| Era | Lines before | keep / fix before | Lines after | keep / fix after |
|---|---|---|---|---|
| EV | 15 | 4 / 11 | 16 | 10 / 6 |
| IV | 15 | 5 / 10 | 16 | 5 / 11 |

IV `fix` rose by one only because the new NbTi line is short by itself (see below).

## Missing design lines

`03_missing_lines.csv` has no EV or IV rows, so the list comes from `docs/eras/ev.md` ("New process lines") and `docs/eras/iv.md`, compared with the chart clusters.

| Design line | Result |
|---|---|
| EV Nano circuits | Designed, not built as a chart: recipes exist (`nano_cpu_wafer`, `nano_processor*`), but the phosphorus-boule/NOR chain was not traced end to end. Content/chart follow-up. |
| EV Metal mixture | Designed, not built: only `centrifuge/stone_dust_separation` yields `metal_mixture_dust`; no separation recipe found in the dump. |
| IV Superconductors | Partly added: cluster `supercon` (niobium + titanium dust, mixer, smelting complex, NbTi ingot). SmFeAsO and rhodium-plated palladium not charted (no producing chain found). |
| IV Suit | Designed, not built: para-aramid, Kapton K, fiberglass and PBI items exist, but the thermal-upgrade recipe was not found in the dump. |

## Chart gaps fixed (pl-data)

- EV moon titanium: titanium plate (bender) added; `sintered_regolith` now feeds a real build (assembler to `fluorspar_kiln`). Both lines now keep.
- EV platinum: crushed ore, ore washer upstream; Smelting Complex to palladium, rhodium and ruthenium ingots. Now keep.
- EV cascade: samarium goes to the smelting complex and samarium ingot. Still 3 steps.
- EV nitric: Hot Cell consumer for nitric acid. Still 2 steps.
- IV mercury: heat-shield brick feeds `jupiter_entry_probe` (assembly line, LuV).

## Real problems (no chart fix; proposed content package)

| Line | Problem | Proposed fix | Files a content package would touch |
|---|---|---|---|
| EV mars | 3-step chain, methalox only burns | Add a processing step (CO2 capture or methane purification) | `pack/kubejs/server_scripts/grindless/ev/`, `tools/quests/processing-lines/pl-data-ev.mjs` |
| EV nitric | One reactor makes acid | Add precursor steps (ammonia oxidation chain) or merge into the platinum plant | same |
| EV cascade (Nd) | Neodymium dust has one consumer outside the chart | Add a magnet-forming step | same |
| EV power | Two machines | Add fuel prep (methane) in front or merge into Mars | same |
| EV dome | Three steps | Add a crop processing step before biomass | same |
| IV uranium, fuel, plutonium, radon, venus, far | Short, `fix` by design (2-3 steps) | Lengthen the chains (conversion, enrichment, fabrication) or merge fuel + plutonium | `pack/kubejs/server_scripts/grindless/iv/` |
| IV mercury | Panel has no consumer | Chain the panel into the solar field | same |
| IV supercon | 2 steps | Add the SmFeAsO and plated-palladium chains | same |

Not committed: `03_line_audit.md`, `data/03_*.csv`, generated chapters.
