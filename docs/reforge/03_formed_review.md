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
- Earlier client run: the hand-built test layouts did not form (`eal_FORMED`: energy hatch joined no controller; `mdr_FORMED`: air at 36044,104,12): they lacked the maintenance hatch and had the receptor misplaced.
- Final repair: the test now builds both layouts from the machine's own GTM preview shape (`shapeCells`; the first shape with 5 input buses for the EAL, plus a luv energy hatch, a second fluid hatch and the relay's six data hatches as roles). Client run `20261101-020719-client-23b` (integrated server): `eal_PLACED`, `eal_FORMED` (energy hatch joined 1 controller after 10 ticks), `eal_PARTS`, `mdr_PLACED`, `mdr_FORMED` (MatrixDataRelayMachine, 8 parts), `mdr_PARTS`, and the control all PASS. The previous run `20261101-020025-client-ad6` died at placement on a test bug (`Block.getId` resolved to the wrong overload).
- Start conditions (extendedfeatures 3.0.0, LGPL-3.0-only, ideas only; repo NotArgxment/GTM-Extended-Features): `ExpandedAssemblyLineMachine.java:46-59,278-310` replaces the recipe logic and drops the bus ordering index (javadoc 35-45); `matchRecipe` (301-309) runs GTM `matchContents` then `checkItemInputsExpanded`/`checkFluidInputsExpanded`; `assignItemBuses` (104-135) and `assignFluidTanks` (189-220) accept any non-empty bus slot / any tank with enough fluid, so bus order is not a condition. Research is not handled there: it goes through GTM's research condition and a data hatch, or a receptor linked to a Matrix Data Relay. `MatrixDataRelayMachine.java:33-173` needs PCB coolant (144 mB / 20 ticks, 40-41,127-134, else WAITING "insufficient input fluid" 113-116) plus 1 A of the next tier per `WirelessOpticalHatch` and 8192 EU/t per `ExpandedDataAccessHatch` (137-172). Energy is the normal hatch.
- Run `20261101-041620-client` (integrated server, armed with `"eal": true`; the test now runs IN recipe order first and keeps the client held, runs `-034152`, `-035536`, `-040648` were harness/setup failures that never reached the EAL): FAIL. Control line (plain GTM assembly line) PASS: refused the reverse order, started the right order 1 tick after. EAL: `eal_FORMED`, `eal_PARTS`, `mdr_FORMED`, `mdr_PARTS` PASS; `eal_RUNS_start` FAIL: `assembly_line/dynamo_hatch_luv` in recipe order did not start in 400 ticks with all 5 buses loaded, fluid0 sodium_potassium x6000, fluid1 soldering_alloy x720, energy 1048576/1048576 (tier 6), status IDLE, no failure reasons. The reverse-order, research and relay-link steps were therefore not reached.
- Cause not proven. Per the source every start condition is met, so either the add-on controller never wakes after the test fills buses and tanks by script (the plain controller does, 1 tick), or the EAL does not start in practice. A player-driven or notification-driven proof was not possible in the 2-repair budget.

Verdict: DROP. A recipe run was never observed, in order or reversed, after four client runs, and the research path was never reached; nothing in the source explains the idle state. On a dedicated server neither multiblock can form either (add-on client class). A later package hides it. Revisit only if someone proves a run with a real bus/hatch update (for example inserting through the item handler with a notification).

## Fix list by file

- `tools/test/overlay/kubejs/client_scripts/gg_test_emi_coverage.js` (RF-3A): preview lookup by category; route check over all outputs.
- `tools/analysis/emi_runtime_known.json` (integrator): drop the 10 preview entries once the lookup is fixed; keep or drop `launched_belt_seed` with the MAX decision.
- `pack/kubejs/server_scripts/grindless/max/**`, `data/grindless/tables/gate.json:156` (MAX): `launched_belt_seed` has no consumer.
- `tools/test/overlay/kubejs/server_scripts/gg_test_expanded_assembly_line.js` (RF-3J): in-order run first, controller state and tank/energy readout, client hold. EAL still idle: verdict DROP.
- Add-on (extendedfeatures 3.0.0): client class in `WirelessOpticalHatch`; no pack fix.
- Fixture: the first frames after arrival can be sparse; if rerun, shoot one throwaway id first.
