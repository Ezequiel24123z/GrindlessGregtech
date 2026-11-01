# RF-3D: Steam to HV process-line charts

Chart data only (`tools/quests/processing-lines/pl-data-{steam,lv,mv,hv}.mjs`); no recipe changes. Audit: `tools/analysis/line-audit.mjs` on the rf3a dump; `pl-check` steam, lv, mv, hv: 0 issues.

## Verdict counts

| Era | Before | After |
|---|---|---|
| steam | keep 6, fix 2 | keep 7, fix 1 |
| lv | keep 11, fix 4 | keep 15, fix 1 (the first-run drill merge was removed again) |
| mv | merge 1, keep 10, fix 1 | keep 15, fix 1 |
| hv | keep 13, fix 3 | keep 14, fix 2 |

(After-counts are by chain, as the audit splits them.)

## Missing lines

The design-line data (`03_design_lines.csv`, `03_missing_lines.csv`) has no Steam, LV, MV or HV rows, so no design line is missing and none is "designed, not built". No line was added.

## Fix verdicts

| Line | Verdict cause | Class | Action |
|---|---|---|---|
| steam.drill | no end product marked | chart gap | `goethite2` is now the product |
| steam.glass | bypass `gtceu:chemical_bath/decolor_stained_glass` | audit mismeasure | The recipe needs stained glass (made from glass) plus chlorine: circular, not a shortcut. Escalate to the audit owner; no chart or content change |
| lv.aluminium | bypass `shaped/mv_machine_hull` | chart gap | The hull recipe takes aluminium plate and MV casing; the `via` summary hid them. Real nodes `alplate`, `mvcasing`, `mvhull` (product) added |
| lv.heliostat | no end product | chart gap | `steam2` marked product |
| lv.coalgas | no end product | chart gap | `coaltar`, `ammonia` marked product |
| lv.fertilizer | bypass `grindless:horizon_collection/oak_log` (1<3) | **real problem** | Proposed: remove or gate the Horizon Collector oak-log output so the fertilized greenhouse is the only log route. Files: `pack/kubejs/server_scripts/grindless/steam/horizon_collector.js`, `pack/kubejs/data/grindless/tables/horizon_collector.json`, `pack/kubejs/server_scripts/grindless/data/greenhouse.js` |
| mv.wood (methanol) | bypass `chemical_reactor/methanol_from_carbon` (3<4) | **real problem** | Carbon dust + H2 + O2 skips wood. Proposed: remove or gate that GTM recipe in a KubeJS server script, or make wood the cheaper source. Benzene, phenol and acetone marked product (chart gap) |
| hv.aromatics (ethylene) | bypass `chemical_reactor/ethylene_from_ethanol` (3<4) | **real problem** | Cracking is one step and the MV ethanol route undercuts it. Proposed: add a step or crossing to the cracking chain, or remove or reshape the ethanol recipe. Files: HV refinery/cracking recipe scripts under `pack/kubejs/server_scripts/grindless/hv/` and the removal list for the GTM recipe |
| hv.syngas (hydrogen) | bypass `large_chemical_reactor/carbon_dioxide_from_methane` (3<5) | **real problem** | Methane plus water gives hydrogen directly. Proposed: remove or reshape that recipe, or lengthen the syngas line with crossings. File: `pack/kubejs/startup_scripts/grindless/hv/syngas_plant.js` and the recipe script that registers the line |
| hv.gasoline | no end product | chart gap | `gasoline` marked product |

## mv.plant into steam.ore

Settled: **keep apart**. The MV plant adds the tailings separation (stone dust, centrifuge, quartzite and metal mixture) that the steam chain lacks. It was flagged only because both lines listed copper dust as product; `copper` is now a plain node (ends in "every dust recipe") and the metal mixture is the plant's product. Quartzite stays a byproduct: marking it product exposes a skip via `centrifuge/quartz_sand_separation` (3<4), a further small real problem for the same recipe owner.

## Also changed

`lv.drillfluid` now products the drilling fluid; its ore is a `ret` of the steam drill's ore. Making both lines end in the same raw ore had triggered a merge verdict.
