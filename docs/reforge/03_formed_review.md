# RF-3B: formed multiblock review and Expanded Assembly Line

Issue #41. Bench evidence only; the fix list below is for later packages.

## Method

- `gg_test_formed_shots` (server + client overlay scripts) walks every `MultiblockMachineDefinition` in `GTRegistries.MACHINES`, places the first preview shape, forms it, parks a spectator camera and grabs one PNG per multiblock. Config: `kubejs/config/gg_test_formed_shots.json` (`enabled`, `from`, `limit`, `ids`, `budgetSec`, `eal`).
- "Formed" matches what EMI draws: `PatternPreviewWidget` builds its scene by loading the controller formed (`loadControllerFormed`, then `onStructureFormed`), and `MultiblockInfoEmiCategory.registerDisplays` registers a preview for every definition whose `isRenderXEIPreview()` is true.
- `tools/test/Build-FormedSheets.ps1` builds contact sheets (20 per sheet) and `flags.csv` (magenta, black, uniform, sparse, duplicate, unreadable, plus manifest rows that are not shots).
- Images live outside the repo: `C:\Users\EzequielC\gg-reforge\formed\20261101-012650-client-fbc\` (430 PNG, 25 sheets, manifest). Run `20261101-011437-client-e5d` holds the first 40 again, rendered with the cell warm.

## Result

430 of 430 multiblocks have a formed shot. Every manifest row: `status=shot`, `formed=true`, `xei=true`, at least 1 preview shape (31 have several; the first is shot). By namespace: gtceu 367 (of which about 288 are ours, `grindless:` blocks are inside `gtceu:` machine ids), gtca 37, extendedfeatures 12, gcyr 5, gtnn 7, gtmutils 2.

Flags: 3, all the first three shots of the run (`advanced_conservatory`, `expanded_assembly_line`, `industrial_greenhouse`). They are camera/render lag on the first frames after the player arrives, not preview defects; run `...e5d` has good shots of the same three (checked by eye). No magenta, black, duplicate or unreadable image. Sparse threshold was tuned to 0.90 from the observed frames.

The previous hypothesis (`00_diagnosis.md:91-95`, "EMI cannot render these structures") is wrong: all 10 previews build and form, including the 25x31x25 `gcyr:space_elevator`, the 29x7x24 `gtca:tegmark_forge` and the 13-shape `gtceu:assembly_line`.

## The 12 known entries (`tools/analysis/emi_runtime_known.json`)

| Entry | Finding | Owner / fix |
|---|---|---|
| 10 previews: `extendedfeatures:expanded_assembly_line`, `extendedfeatures:matrix_data_relay`, `gcyr:dyson_system_controller`, `gcyr:space_elevator`, `gtca:tegmark_forge`, `gtceu:assembly_line`, `gtceu:assembly_line_array`, `gtceu:central_monitor`, `gtceu:cleanroom`, `gtceu:data_bank` | Preview exists (xei=true, shape forms). The audit only does `rm.getRecipe(<machine id>)` and checks the category (`gg_test_emi_coverage.js:244-251`); GTM's preview recipe id is the machine id (`MultiblockInfoEmiRecipe#getId`). Hypothesis (not run): another EMI recipe with the same bare id (the controller's crafting recipe) wins the id map, so the audit false-positives. | RF-3A: look the preview up by category (iterate `gtceu:multiblock_info` recipes) in `tools/test/overlay/kubejs/client_scripts/gg_test_emi_coverage.js`; then drop the 10 from the known list. Confirm with one print of `rm.getRecipe(id).getCategory()` for these ids. |
| `grindless:launched_belt_seed` (noUse) | Produced by `gate.json:156` and listed in `max_ids.json:88`, consumed by nothing. | MAX package: consume it in the belt step or remove it. |
| `grindless:rejected_timing_head` made in `gtceu:assembler` | Second 100% output of the assembler recipe `OPR.assembler` (`pathfinder.js:31`); consumed at `extraction_cascade.js:311`; an `emi:info` entry exists (`opv_pathfinder_transmitter.json`). | RF-3A: make the route check read all outputs, or the audit keeps flagging a real route. |

## Expanded Assembly Line

Runs: server `20261101-004409-server-062`, `20261101-005138-server-e97`; client (integrated server, armed with `"eal": true`) `20261101-011437-client-e5d`.

- Recipes: 4 static checks PASS (assembly_line recipes at LuV for the line, receptor, transmissor, relay; no crafting-table recipe).
- Stock assembly line control: forms, refuses a wrong bus order, runs with the right order.
- Dedicated server: the EAL and the Matrix Data Relay can never form. `WirelessOpticalHatch` (the receptor/transmissor class, extendedfeatures 3.0.0) references `net.minecraft.client.gui.screens.Screen`; the first class load fails with `Attempted to load class ... for invalid dist DEDICATED_SERVER`. The structure requires the receptor (`expanded_assembly_line.js:10-17`). Add-on defect; works on an integrated server.
- Client run: the preview of both forms (13 shapes for the EAL). The hand-built test layouts did not form (`eal_FORMED`: energy hatch joined no controller; `mdr_FORMED`: air at 36044,104,12). The preview layout (manifest `layout`) shows what the test got wrong: a `configurable_maintenance_hatch` at layer 0, x1, z0 and the receptor at x3, z0 (the test had no maintenance hatch and put the receptor at slice 1); the relay needs a maintenance hatch too (layer 0, x8, z10). I added the EAL maintenance hatch and moved the receptor in the test; it has NOT been rerun (run budget spent), so recipe execution and the research path stay unproven.

Verdict: KEEP, conditional. The multiblock, its four recipes and its preview work; the research path is untested, and on a dedicated server it cannot form because of the add-on. Needed before release: either a dedicated-server guard (not ours to patch) or a note that the EAL needs an integrated server, plus one more bench run of `gg_test_expanded_assembly_line` with the layout fixed (also for the relay, `MDR_AISLES`).

## Fix list by file

- `tools/test/overlay/kubejs/client_scripts/gg_test_emi_coverage.js` (RF-3A): preview lookup by category; route check over all outputs.
- `tools/analysis/emi_runtime_known.json` (integrator): drop the 10 preview entries once the lookup is fixed; keep or drop `launched_belt_seed` with the MAX decision.
- `pack/kubejs/server_scripts/grindless/max/**`, `data/grindless/tables/gate.json:156` (MAX): `launched_belt_seed` has no consumer.
- `tools/test/overlay/kubejs/server_scripts/gg_test_expanded_assembly_line.js` (follow-up): rebuild the EAL and relay layouts from the preview shape (the manifest `layout` rows), then rerun once.
- Add-on (extendedfeatures 3.0.0): client class in `WirelessOpticalHatch`; no pack fix.
- Fixture: the first frames after arrival can be sparse; if rerun, shoot one throwaway id first.
