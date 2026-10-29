# EMI runtime quality standard

## Original root cause

Before repair, the MEGA module socket preview supplier called `Java.to(list, BlockInfo)`. KubeJS 2001.6.5 exposes
`JavaWrapper`, not Rhino's original `Java` object; `JavaWrapper` has no `to` method.
The shipped occurrence was `pack/kubejs/startup_scripts/grindless/lib/mega.js:262-266` before repair.
The same defect existed in the test overlay's `gg_test_mega_spike_machines.js:80-85`.
Formation never invokes this supplier, so server formation/process proofs do not cover it.

GTM 7.5.3 registers all multiblock preview displays **before** its processing displays and workstations.
LDLib's `ModularEmiRecipe` constructs the supplied preview widget eagerly. A single broken preview therefore
throws out of the entire GTM plugin, not just that multiblock. EMI catches the exception, continues other
plugins, and eventually reports a successful reload. Vanilla crafting can work while every GT process is absent.
Disabling previews would conceal the defect and is not an acceptable fix.

Native evidence, run `20261028-235501-client-06f` (actual client mods; Spark excluded):

| Evidence | Client log line | Result |
|---|---:|---|
| GTM plugin starts | 11085 | `[EMI] Loading plugin from gtceu` |
| Preview supplier throws | 11147 | `Exception loading plugin provided by gtceu`, `Java.to` at spike line 85 |
| EMI bakes recipes despite the failure | 11637 | 132,558 pre-filter recipes; **not** proof of GT process visibility |
| EMI declares reload complete | 12121 | 81,475 ms; fixture confirms loaded 81 seconds after joining |
| Registry coverage | fixture output | 1,441 stacks, 75 pages, one legacy item, eight unreleased stacks; registry PASS |

This full-overlay run hits the spike first, before the identical shipped supplier. The historical default client run disconnected before
EMI completed; it cannot establish either success or failure of the GTM plugin.

### Repair mechanism

Use the native candidate supplier from
`Predicates['blocks(net.minecraft.world.level.block.Block[])'](blocks).common.get(0).candidates`
as the second argument to `Predicates.custom`. This preserves **all** module options and the existing
formation/context predicate, while keeping the required native `Supplier<BlockInfo[]>` type.
Returning a Java `ArrayList` or a JavaScript array from a generic supplier is not an equivalent typed repair.
No recipe, structure shape, item ID, mod version, or GTM registration order needs changing.

The integrator explicitly approved the exact shared-library callback edit; no other library code changes.
Both shipped and overlay occurrences now use the native supplier. The regression invokes the candidate path as well as accepted/rejected formation blocks;
server-only formation tests were insufficient to exercise this failure.

### Post-repair indexing finding

Run `20261029-001244-client-1d9` proves that the repaired GTM plugin completes: `latest.log:11634`,
37,476 ms. It bakes 177,072 pre-filter recipes at line 12148, compared with 132,558 before repair.
It does **not** prove final visibility or preview rendering: indexing did not finish before the 600-second
native ceiling, and no coverage report or MEGA screenshot was produced. KubeJS reports zero errors.

The first critical error is **earlier** than the mutation burst: `latest.log:12324`,
`OutOfMemoryError: Java heap space` in vanilla `SuffixArray` called by `EmiSearch.bake`.
EMI retries after this failed search index. The extended 4G run `20261029-003138-client-203` repeats
the same OOM at line 12169; it was stopped early instead of wasting the 1,800-second ceiling.
These 4G test-client failures are not evidence of broken shipped search: the Prism builder defaults to
10,240 MB (`tools/prism/Build-PrismInstance.ps1:11`). Player search remains unchanged.

The same run emits 4,630 `Stack illegally self-mutated during recipe bake, causing recipe loss` errors:
2,619 distinct complete stack signatures and 50 distinct stack names/classes. The first is
`netherite_barrel{woodType:"jungle"} x1` at `latest.log:12388`. `diamond_chest`, `iron_chest`,
`gold_chest`, and `copper_chest` each account for 160 occurrences; many barrel names have 124 each.
The messages contain **no leading registry IDs**, no recipe IDs/types, and no `grindless:` mentions.
NBT namespaces identify variant data, not recipe ownership. Consequently the recipe-type and recipe-owner
groups are **unknown**, not established addon/GTM noise; no blanket allowlist is justified.
The raw-log gate rejects these recipe-loss messages as well as exceptions.

The mutation errors occur after the first OOM/retry, so they cannot establish an independent primary
pack defect. An adequate-heap run is required before assigning content defects or accepting an allowlist.
The owner approved one Linux-only 8G/1,800-second run, with no other bench slots held, to obtain the
missing inventory and render proof. Default, global/server and home-PC caps remain unchanged.

### Current integration blocker and native result

The single approved exclusive 8G run, `20261029-021359-client-a24`, used the candidate rebased onto
`e5fb301c`. All VM slot locks were absent before launch; `-Slots 1` held the existing exclusive semaphore.
The runner records `Xmx=8G`, an 1,800-second ceiling and a 12,288 MB process-scope cap. It completed
after 212 native seconds with **no OOM or stack-mutation messages**. Player search was not changed.

The strengthened audit correctly **fails** on a different global preview failure introduced by the
integrated structures package: `pack/kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:113`
passes `Pat.frame(['tungstensteel'])` (commit `d69ed138`). This is the only such quoted frame-material
call in the pack. The frame helper rejects it at `lib/patterns.js:145`; its generic error factory is at
line 63. Native `latest.log:11235` reports `unknown GT material: tungstensteel` and aborts GTM before
processing displays/workstations. Do not mask the error, disable previews, or add an arbitrary material
fallback. Correct and natively verify the caller/material contract during integration.

EMI itself reloads in 38,059 ms (`latest.log:11843`), but GTM has no successful plugin-completion
marker. This illustrates why loaded status alone is not acceptance. There are 132,442 pre-filter recipes,
131,024 final recipes, 1,326 machine definitions and 308 inspected processing categories. All 1,441
audited stacks are registered; all 75 expected info pages load (76 pack pages are visible); legacy checks pass.
The JSON records every failed stack, machine and category. No per-era recipe defect can be inferred
solely from GTM's globally skipped registration.

| Requested native sample | Made / used counts | Result |
|---|---:|---|
| `gtceu:lv_chemical_reactor` | 2 / 2 | Vanilla/loot routes exist; GT chemical-reactor workstation/process routes are absent |
| `gtceu:lv_horizon_collector` | 3 / 2 | Info page exists; horizon-collection workstation/process routes are absent |
| UEV `gtceu:nebula_collector` | 4 / 3 | Preview display and page exist; nebula-collection workstation/process route is absent |
| `grindless:night_sky_radiator` | 4 / 6 | Info/loot/quest routes exist; expected GT assembler route is absent |
| `grindless:vein_sample_ilmenite_moon` | 1 / 2 | Crafting/tag routes exist; expected lunar/vein drilling uses are absent |
| `gtceu:mega_factory` | 2 / 2 | Info/loot routes only; preview display absent after the global abort |

**MEGA module preview rendering remains unproven.** `preview_render|FAIL` reports no display, and
there is no screenshot. The original typed-supplier repair has a passing invocation/context regression
and an earlier successful native GTM plugin load, but neither substitutes for the requested rendered frame.
No further run was started after the owner's one-run limit. The bench slot was released.

Validation on the rebased candidate: T0 **1,412 passed, zero failed, two skipped** in 269 seconds;
all 29 EMI regressions pass. Actual PowerShell policy/budget checks cover 19 cases, including unchanged
ordinary/default heaps/deadlines, rejecting home/server/combined overrides, upper bounds and exclusive slots.
Native acceptance remains **FAIL**, not a release-ready success. Integration must repair the new global
frame failure, then repeat the adequate-heap audit and capture the real MEGA preview before accepting visibility.

## Required client audit

Every client suite must hold the test player until `EmiReloadManager.isLoaded()`, then inspect the live
`EmiApi` manager. The default overlay enables this audit. The harness independently requires a completed
reload, `emi_loaded|PASS`, `all|PASS`, `DONE`, and an exported report. A successful process exit is insufficient.

Hard failures:

- Any EMI plugin/reload exception, including JEMI's individually swallowed recipe-conversion exceptions.
- A non-hidden machine missing a workstation binding for one of its visible GT categories.
- A visible GT category with native recipes but zero EMI displays.
- A non-hidden `MultiblockMachineDefinition` without its `gtceu:multiblock_info` display.
- A pack stack without an acquisition route or, unless a documented end product, a use route.
- An expected GT/crafting/info route or info page missing from the manager.
- A pack machine without a what-it-does info route, or failure to write the report.

GTM's intentional non-XEI categories retain their upstream semantics; electric-furnace workstations map to
vanilla `minecraft:smelting`. Only explicitly hidden unreleased stacks and legacy conversions are exempted.
Temporary static content waivers do **not** waive runtime acquisition/use assertions.
The approximate static preview-parts model remains diagnostic only: the actual multiblock display is checked
separately and missing displays fail. Upstream machines' info-page presence is recorded without rewriting GTM.

`EmiReloadLog.warnings` does not contain every JEMI error. The harness also checks the raw client log and
adds `pluginLogErrors` to the report. Throwable overloads of `EmiLog.error` omit the `[EMI]` prefix, so matching
only that prefix misses the actual GTM failure. Reading logs via `java.io` from KubeJS is class-filtered;
the filesystem/log check belongs in the existing PowerShell harness, not a bypass of that filter.

Report: `kubejs/exported/gg_emi_coverage_report.json`, collected under
`results/client/kubejs-exported/`. Format `gg-emi-coverage-report-2` includes per-stack made/used counts
and categories, every GT machine's categories, missing workstation bindings, preview and info-page status,
native/display counts per GT category, and complete failure lists. Do not infer recipe coverage from EMI's
`Baked N recipes` marker: its counter is before disabled-stack filtering.

## Running and reviewing

Regenerate expectations after content changes:

```powershell
node tools\analysis\emi-coverage.mjs --expect
```

Run the normal client suite against a scratch copy of `pack`, not the worktree pack:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 `
  -Suite client -PackDir <scratch-pack> -ClientExclude '^spark[-_+0-9]' -LockWaitMin 15
```

For unchanged pack content, `-SkipRefresh` retains the harness's index-freshness check and avoids an
unnecessary refresh. Do not use it to bypass changed pack hashes. Keep existing native time, heap, slot
and repair ceilings. Read structured reports and bounded error excerpts, never whole runtime logs.

For the named MEGA preview-render proof only, copy the overlay and add `"renderPreview": true` to its
`kubejs/config/gg_test_emi_coverage.json`, then pass that copy with `-OverlayDir`. The fixture opens the
shipped `gtceu:mega_factory` preview for 40 client ticks on the real renderer, restores the old screen,
and saves `gg_emi_mega_factory.png` beside the report. The harness requires both the render PASS marker
and screenshot. This option is off for ordinary runs so it cannot interrupt other UI fixtures.

`-EmiAuditTimeoutSec` defaults to 600. An explicitly approved extended audit can use a value up to 1800,
but only with `-Suite client` on the Linux backend. Resource validation rejects the extension for server,
combined or home-PC runs. The fixture's hold deadline follows the extended request; this does not change
the normal eight-minute fixture hold or the standard 600-second native/client request limits.

`-EmiAuditClientXmx` defaults to `4G` and accepts whole-GB values up to `8G` only for an explicitly
approved client-only Linux audit. A larger audit heap requires `-Slots 1`: the existing semaphore
requires every other slot free and prevents a concurrent holder while this run owns its slot.
Verify all slot lock files are absent before launch. The ordinary `-ClientXmx`, server and personal-PC
caps remain 4G. Neither the shipped EMI search configuration nor its features are disabled.

## Per-era backlog

Authority: run `20261029-021359-client-a24`, report `gg-emi-coverage-report-2`.

**Global blocker: resolved.** The B0 frame-material abort was fixed (`37621ded`), and run
`20261029-025512-client` (8G) loaded the GTM plugin and rendered the MEGA preview. Its remaining gaps were
13 workstations and 38 previews of addon machines hidden through `grindless:hidden_with_recipes` (now exempt),
9 visible multiblocks with no preview display, 3 noUse items, 1 route (the actinide plant, a lookup collision
fixed in `zpm/actinides.js`) and the 321 info pages below. All except the exempt ones are recorded in
`tools/analysis/emi_runtime_known.json`, the known-gap ratchet (see `docs/testing/usage.md`).
The 9 no-preview multiblocks (`extendedfeatures:expanded_assembly_line`, `extendedfeatures:matrix_data_relay`,
`gtceu:assembly_line`, `gtceu:cleanroom`, `gtceu:data_bank`, `gtceu:central_monitor`, `gcyr:space_elevator`,
`gcyr:dyson_system_controller`, `gtca:tegmark_forge`) need the audit's `xeiPreview` flag from the next run:
if it is false, the mod turned the preview off on purpose and the gap moves to `previewsOff`.

**Independent content backlog:** all 75 expected pages load (76 pack pages are visible), so the 321
pack machines below genuinely lack a what-it-does info route, independently of the GTM plugin abort.
Each row requires an honest English/Spanish page explaining the machine, process, conditions and
useful outputs; a preview or controller crafting recipe is not a substitute. Keep upstream GTM content
unchanged. UIV remains parked. Tier-prefixed IDs use their actual tier; other IDs use their registration
era. Source-directory groups outside named eras are shared/cross-era systems.

Shared registration sources (especially `lib/`) require a single serialized/integrator-owned package,
even when their generated IDs appear under several eras below.

| Era/source group | Missing machine pages |
|---|---:|
| steam | 15 |
| lv | 15 |
| mv | 21 |
| hv | 15 |
| ev | 22 |
| iv | 24 |
| luv | 28 |
| zpm | 36 |
| uv | 39 |
| uhv | 40 |
| uev | 27 |
| uiv | 32 |
| launch_road | 2 |
| moon | 1 |
| observatory | 3 |
| power | 1 |

References identify an ID declaration or its registration source. `generated` marks a tier/table-driven
ID whose literal is not in that file; the cited declaration or registration callback is its source anchor.

### steam

| Machine ID | Source |
|---|---|
| `gtceu:coking_battery` | `pack/kubejs/startup_scripts/grindless/steam/coking_battery.js:75` |
| `gtceu:large_steam_centrifuge` | `pack/kubejs/startup_scripts/grindless/steam/large_family.js:169` |
| `gtceu:large_steam_chemical_bath` | `pack/kubejs/startup_scripts/grindless/steam/large_family.js:164` |
| `gtceu:large_steam_macerator` | `pack/kubejs/startup_scripts/grindless/steam/large_family.js:151` |
| `gtceu:large_steam_ore_washer` | `pack/kubejs/startup_scripts/grindless/steam/large_family.js:159` |
| `gtceu:large_steam_thermal_centrifuge` | `pack/kubejs/startup_scripts/grindless/steam/large_family.js:155` |
| `gtceu:steam_alloy_smelter` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:113` |
| `gtceu:steam_blast_furnace` | `pack/kubejs/startup_scripts/grindless/steam/blast_furnace.js:69` |
| `gtceu:steam_chemical_bath` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:115` |
| `gtceu:steam_compressor` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:112` |
| `gtceu:steam_forge_hammer` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:111` |
| `gtceu:steam_greenhouse` | `pack/kubejs/startup_scripts/grindless/steam/machines.js:114` |
| `gtceu:steam_mixer` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:114` |
| `gtceu:steam_ore_washer` | `pack/kubejs/startup_scripts/grindless/steam/small_family.js:116` |
| `gtceu:steam_vein_drill` | `pack/kubejs/startup_scripts/grindless/steam/machines.js:99` |

### lv

| Machine ID | Source |
|---|---|
| `gtceu:heliostat_tower` | `pack/kubejs/startup_scripts/grindless/lv/heliostat_tower.js:180` |
| `gtceu:lv_creature_simulator` | `pack/kubejs/startup_scripts/grindless/lv/creatures.js:62` (generated) |
| `gtceu:lv_greenhouse` | `pack/kubejs/startup_scripts/grindless/lv/multis.js:356` |
| `gtceu:lv_vein_drill` | `pack/kubejs/startup_scripts/grindless/lv/multis.js:341` |
| `gtceu:lv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:lv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:lv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:lv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:lv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:lv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:lv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:lv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:submerged_arc_furnace` | `pack/kubejs/startup_scripts/grindless/lv/multis.js:371` |
| `gtceu:sulfide_roaster` | `pack/kubejs/startup_scripts/grindless/lv/sulfide_roaster.js:94` |
| `gtceu:wire_works` | `pack/kubejs/startup_scripts/grindless/lv/mega_wire_works.js:26` |

### mv

| Machine ID | Source |
|---|---|
| `gtceu:advanced_multi_smelter` | `pack/kubejs/startup_scripts/grindless/mv/leisure_utility.js:462` |
| `gtceu:biorefinery` | `pack/kubejs/startup_scripts/grindless/mv/biorefinery.js:97` |
| `gtceu:lava_furnace` | `pack/kubejs/startup_scripts/grindless/mv/leisure_utility.js:480` |
| `gtceu:mv_creature_simulator` | `pack/kubejs/startup_scripts/grindless/lv/creatures.js:62` (generated) |
| `gtceu:mv_greenhouse` | `pack/kubejs/startup_scripts/grindless/mv/family_multis.js:138` |
| `gtceu:mv_vein_drill` | `pack/kubejs/startup_scripts/grindless/mv/family_multis.js:123` |
| `gtceu:mv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:mv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:mv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ore_plant` | `pack/kubejs/startup_scripts/grindless/mv/ore_plant.js:174` |
| `gtceu:polymer_works` | `pack/kubejs/startup_scripts/grindless/mv/mega_polymer_works.js:30` |
| `gtceu:universal_assembly_factory` | `pack/kubejs/startup_scripts/grindless/mv/leisure_factories.js:82` |
| `gtceu:universal_mixing_factory` | `pack/kubejs/startup_scripts/grindless/mv/leisure_factories.js:100` |
| `gtceu:universal_processing_factory` | `pack/kubejs/startup_scripts/grindless/mv/leisure_factories.js:72` |
| `gtceu:universal_separation_factory` | `pack/kubejs/startup_scripts/grindless/mv/leisure_factories.js:91` |
| `gtceu:weather_controller` | `pack/kubejs/startup_scripts/grindless/mv/leisure_utility.js:490` |

### hv

| Machine ID | Source |
|---|---|
| `gtceu:coil_chemical_plant` | `pack/kubejs/startup_scripts/grindless/hv/mega_coil_chemical_plant.js:28` |
| `gtceu:hv_creature_simulator` | `pack/kubejs/startup_scripts/grindless/lv/creatures.js:62` (generated) |
| `gtceu:hv_greenhouse` | `pack/kubejs/startup_scripts/grindless/hv/family_multis.js:136` |
| `gtceu:hv_vein_drill` | `pack/kubejs/startup_scripts/grindless/hv/family_multis.js:121` |
| `gtceu:hv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:hv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:hv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:hv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:hv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:hv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:hv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:hv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:refinery` | `pack/kubejs/startup_scripts/grindless/hv/refinery.js:137` |
| `gtceu:reformer` | `pack/kubejs/startup_scripts/grindless/hv/reformer.js:124` |
| `gtceu:syngas_plant` | `pack/kubejs/startup_scripts/grindless/hv/syngas_plant.js:137` |

### ev

| Machine ID | Source |
|---|---|
| `gtceu:atmosphere_processor` | `pack/kubejs/startup_scripts/grindless/ev/mars_site.js:98` |
| `gtceu:combined_cycle_plant` | `pack/kubejs/startup_scripts/grindless/ev/combined_cycle_and_hot_mill.js:162` |
| `gtceu:cryogenic_plant` | `pack/kubejs/startup_scripts/grindless/ev/cryogenic_plant.js:260` |
| `gtceu:deep_space_antenna` | `pack/kubejs/startup_scripts/grindless/ev/lunar_power_and_antenna.js:321` |
| `gtceu:ev_creature_simulator` | `pack/kubejs/startup_scripts/grindless/lv/creatures.js:62` (generated) |
| `gtceu:ev_rtg` | `pack/kubejs/startup_scripts/grindless/iv/travel_network.js:37` |
| `gtceu:ev_vein_drill` | `pack/kubejs/startup_scripts/grindless/ev/tripod.js:210` |
| `gtceu:ev_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:ev_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ev_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ev_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ev_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:ev_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ev_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ev_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:extraction_cascade` | `pack/kubejs/startup_scripts/grindless/ev/extraction_cascade.js:164` |
| `gtceu:hot_strip_mill` | `pack/kubejs/startup_scripts/grindless/ev/combined_cycle_and_hot_mill.js:239` |
| `gtceu:lunar_solar_array` | `pack/kubejs/startup_scripts/grindless/ev/lunar_power_and_antenna.js:258` |
| `gtceu:ore_refinery` | `pack/kubejs/startup_scripts/grindless/ev/mega_ore_refinery.js:25` |
| `gtceu:platinum_plant` | `pack/kubejs/startup_scripts/grindless/ev/platinum_plant.js:162` |
| `gtceu:regolith_cell` | `pack/kubejs/startup_scripts/grindless/ev/regolith_cell.js:118` |
| `gtceu:sealed_dome` | `pack/kubejs/startup_scripts/grindless/ev/sealed_dome.js:131` |

### iv

| Machine ID | Source |
|---|---|
| `gtceu:fission_reactor` | `pack/kubejs/startup_scripts/grindless/iv/fission_reactor.js:232` |
| `gtceu:fluorspar_kiln` | `pack/kubejs/startup_scripts/grindless/iv/fluorspar_kiln.js:219` |
| `gtceu:fuel_fabrication_plant` | `pack/kubejs/startup_scripts/grindless/iv/uranium_cycle.js:296` |
| `gtceu:heavy_water_plant` | `pack/kubejs/startup_scripts/grindless/iv/heavy_water_plant.js:217` |
| `gtceu:hot_cell` | `pack/kubejs/startup_scripts/grindless/iv/hot_cell.js:54` |
| `gtceu:interferometer` | `pack/kubejs/startup_scripts/grindless/iv/mercury.js:768` |
| `gtceu:isr_wellfield` | `pack/kubejs/startup_scripts/grindless/iv/uranium_cycle.js:278` |
| `gtceu:iv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:iv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:iv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:iv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:iv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:iv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:iv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:iv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mercury_solar_field` | `pack/kubejs/startup_scripts/grindless/iv/mercury.js:725` |
| `gtceu:mercury_solar_works` | `pack/kubejs/startup_scripts/grindless/iv/mercury.js:705` |
| `gtceu:mercury_vein_drill` | `pack/kubejs/startup_scripts/grindless/iv/mercury.js:653` |
| `gtceu:naquadah_plant` | `pack/kubejs/startup_scripts/grindless/iv/naquadah_plant.js:182` |
| `gtceu:pressurized_vein_drill` | `pack/kubejs/startup_scripts/grindless/iv/venus.js:352` |
| `gtceu:smelting_complex` | `pack/kubejs/startup_scripts/grindless/iv/mega_smelting_complex.js:30` |
| `gtceu:tritium_removal_facility` | `pack/kubejs/startup_scripts/grindless/iv/tritium_removal.js:330` |
| `gtceu:venus_acid_works` | `pack/kubejs/startup_scripts/grindless/iv/venus.js:403` |
| `gtceu:venus_heat_engine` | `pack/kubejs/startup_scripts/grindless/iv/venus.js:370` |

### luv

| Machine ID | Source |
|---|---|
| `gtceu:algae_bioreactor` | `pack/kubejs/startup_scripts/grindless/luv/europa.js:97` |
| `gtceu:asteroid_processor` | `pack/kubejs/startup_scripts/grindless/luv/asteroid_belt.js:377` |
| `gtceu:biofoundry` | `pack/kubejs/startup_scripts/grindless/luv/biofoundry.js:142` |
| `gtceu:coated_conductor_line` | `pack/kubejs/startup_scripts/grindless/luv/coated_conductor_line.js:169` |
| `gtceu:coilgun_launcher` | `pack/kubejs/startup_scripts/grindless/luv/ganymede.js:136` |
| `gtceu:cryobot` | `pack/kubejs/startup_scripts/grindless/luv/europa.js:96` |
| `gtceu:flux_tube_tether` | `pack/kubejs/startup_scripts/grindless/luv/io_orbit.js:314` |
| `gtceu:fumarole_condenser` | `pack/kubejs/startup_scripts/grindless/luv/io_surface.js:253` |
| `gtceu:gravitational_wave_detector` | `pack/kubejs/startup_scripts/grindless/luv/ganymede.js:134` |
| `gtceu:harpoon_anchor_drill` | `pack/kubejs/startup_scripts/grindless/luv/asteroid_belt.js:356` |
| `gtceu:helium_refrigerator` | `pack/kubejs/startup_scripts/grindless/luv/helium_refrigerator.js:262` |
| `gtceu:hts_magnet_works` | `pack/kubejs/startup_scripts/grindless/luv/hts_magnet_works.js:208` |
| `gtceu:hydroponic_ring` | `pack/kubejs/startup_scripts/grindless/luv/orbital_biology.js:8` |
| `gtceu:luv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:luv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:luv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:luv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:luv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:luv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:luv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:luv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:mega_chemical_complex` | `pack/kubejs/startup_scripts/grindless/luv/mega_chemical_complex.js:34` |
| `gtceu:microgravity_smelter` | `pack/kubejs/startup_scripts/grindless/luv/orbital_industry.js:56` |
| `gtceu:optical_miner` | `pack/kubejs/startup_scripts/grindless/luv/asteroid_belt.js:414` |
| `gtceu:organoid_lab` | `pack/kubejs/startup_scripts/grindless/luv/orbital_biology.js:8` |
| `gtceu:volcanic_intake` | `pack/kubejs/startup_scripts/grindless/luv/io_surface.js:271` |
| `gtceu:wake_shield_facility` | `pack/kubejs/startup_scripts/grindless/luv/orbital_industry.js:58` |
| `gtceu:zero_g_crystal_grower` | `pack/kubejs/startup_scripts/grindless/luv/orbital_biology.js:8` |

### zpm

| Machine ID | Source |
|---|---|
| `gtceu:actinide_partitioning_plant` | `pack/kubejs/startup_scripts/grindless/zpm/actinides.js:204` |
| `gtceu:aerogel_works` | `pack/kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:50` |
| `gtceu:assembly_hall` | `pack/kubejs/startup_scripts/grindless/zpm/mega_assembly_hall.js:32` |
| `gtceu:deep_space_network` | `pack/kubejs/startup_scripts/grindless/zpm/observatory.js:137` |
| `gtceu:diamond_lattice_fab` | `pack/kubejs/startup_scripts/grindless/zpm/qubits.js:44` |
| `gtceu:direct_energy_converter` | `pack/kubejs/startup_scripts/grindless/zpm/fusion.js:120` |
| `gtceu:entry_probe_bay` | `pack/kubejs/startup_scripts/grindless/zpm/titan_probes.js:107` |
| `gtceu:europium_reductor` | `pack/kubejs/startup_scripts/grindless/zpm/europium.js:145` |
| `gtceu:flyby_probe_bay` | `pack/kubejs/startup_scripts/grindless/zpm/uranus.js:113` |
| `gtceu:gas_giant_siphon` | `pack/kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:137` |
| `gtceu:ice_giant_siphon` | `pack/kubejs/startup_scripts/grindless/zpm/uranus.js:109` |
| `gtceu:ion_implanter` | `pack/kubejs/startup_scripts/grindless/zpm/qubits.js:52` |
| `gtceu:isotope_column` | `pack/kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:139` |
| `gtceu:kuiper_survey_telescope` | `pack/kubejs/startup_scripts/grindless/zpm/observatory.js:139` |
| `gtceu:methane_pyrolyser` | `pack/kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:36` |
| `gtceu:naquadah_fuel_works` | `pack/kubejs/startup_scripts/grindless/zpm/naquadria.js:60` |
| `gtceu:naquadria_magnet_works` | `pack/kubejs/startup_scripts/grindless/zpm/magnet_works.js:209` |
| `gtceu:naquadria_refinery` | `pack/kubejs/startup_scripts/grindless/zpm/naquadria.js:43` |
| `gtceu:neutrino_observatory` | `pack/kubejs/startup_scripts/grindless/zpm/observatory.js:135` |
| `gtceu:plasma_quench_caster` | `pack/kubejs/startup_scripts/grindless/zpm/fusion.js:148` |
| `gtceu:plume_sampler` | `pack/kubejs/startup_scripts/grindless/zpm/saturn_science.js:101` |
| `gtceu:qubit_fab` | `pack/kubejs/startup_scripts/grindless/zpm/qubits.js:59` |
| `gtceu:ring_harvester` | `pack/kubejs/startup_scripts/grindless/zpm/saturn_siphon.js:141` |
| `gtceu:ring_seismometer` | `pack/kubejs/startup_scripts/grindless/zpm/saturn_science.js:103` |
| `gtceu:slurry_separator` | `pack/kubejs/startup_scripts/grindless/zpm/uranus.js:111` |
| `gtceu:tholin_reformer` | `pack/kubejs/startup_scripts/grindless/zpm/titan_probes.js:109` |
| `gtceu:vent_bioreactor` | `pack/kubejs/startup_scripts/grindless/zpm/outer_chemistry.js:43` |
| `gtceu:waste_retrieval_plant` | `pack/kubejs/startup_scripts/grindless/zpm/actinides.js:188` |
| `gtceu:zpm_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:zpm_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:zpm_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:zpm_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:zpm_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:zpm_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:zpm_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:zpm_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |

### uv

| Machine ID | Source |
|---|---|
| `gtceu:accelerator_driven_reactor` | `pack/kubejs/startup_scripts/grindless/uv/thorium.js:76` |
| `gtceu:amorphous_ice_annealer` | `pack/kubejs/startup_scripts/grindless/uv/kuiper.js:116` |
| `gtceu:antimatter_trap` | `pack/kubejs/startup_scripts/grindless/uv/accelerators.js:96` |
| `gtceu:ark_biosphere` | `pack/kubejs/startup_scripts/grindless/uv/life.js:201` |
| `gtceu:boron_nitride_reactor` | `pack/kubejs/startup_scripts/grindless/uv/materials.js:244` |
| `gtceu:cryotank_winder` | `pack/kubejs/startup_scripts/grindless/uv/propulsion.js:189` |
| `gtceu:event_horizon_interferometer` | `pack/kubejs/startup_scripts/grindless/uv/edge.js:112` |
| `gtceu:fibre_draw_tower` | `pack/kubejs/startup_scripts/grindless/uv/photonics.js:190` |
| `gtceu:heat_source_works` | `pack/kubejs/startup_scripts/grindless/uv/heat_sources.js:121` |
| `gtceu:kuiper_interceptor_bay` | `pack/kubejs/startup_scripts/grindless/uv/kuiper.js:114` |
| `gtceu:laser_fusion_chamber` | `pack/kubejs/startup_scripts/grindless/uv/fusion.js:116` |
| `gtceu:laser_sail_launcher` | `pack/kubejs/startup_scripts/grindless/uv/starshot.js:293` |
| `gtceu:light_sail_fab` | `pack/kubejs/startup_scripts/grindless/uv/starshot.js:263` |
| `gtceu:mocvd_reactor` | `pack/kubejs/startup_scripts/grindless/uv/photonics.js:205` |
| `gtceu:muon_fusion_cell` | `pack/kubejs/startup_scripts/grindless/uv/accelerators.js:84` |
| `gtceu:neptune_deep_siphon` | `pack/kubejs/startup_scripts/grindless/uv/neptune.js:96` |
| `gtceu:neural_culture_vat` | `pack/kubejs/startup_scripts/grindless/uv/life.js:216` |
| `gtceu:optical_ground_station` | `pack/kubejs/startup_scripts/grindless/uv/detectors.js:179` |
| `gtceu:penetrator_probe_bay` | `pack/kubejs/startup_scripts/grindless/uv/pluto_ices.js:102` |
| `gtceu:powder_bed_printer` | `pack/kubejs/startup_scripts/grindless/uv/materials.js:246` |
| `gtceu:powder_in_tube_line` | `pack/kubejs/startup_scripts/grindless/uv/materials.js:245` |
| `gtceu:precursor_probe_bay` | `pack/kubejs/startup_scripts/grindless/uv/edge.js:110` |
| `gtceu:pyroprocessing_cell` | `pack/kubejs/startup_scripts/grindless/uv/thorium.js:65` |
| `gtceu:srf_cavity_works` | `pack/kubejs/startup_scripts/grindless/uv/cold.js:203` |
| `gtceu:starchip_fab` | `pack/kubejs/startup_scripts/grindless/uv/starshot.js:278` |
| `gtceu:superfluid_helium_plant` | `pack/kubejs/startup_scripts/grindless/uv/cold.js:188` |
| `gtceu:synchrotron` | `pack/kubejs/startup_scripts/grindless/uv/accelerators.js:73` |
| `gtceu:thruster_works` | `pack/kubejs/startup_scripts/grindless/uv/propulsion.js:190` |
| `gtceu:triton_geyser_sampler` | `pack/kubejs/startup_scripts/grindless/uv/neptune.js:98` |
| `gtceu:uv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:uv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:uv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:volatile_ice_fractionator` | `pack/kubejs/startup_scripts/grindless/uv/pluto_ices.js:104` |
| `gtceu:zone_refining_tower` | `pack/kubejs/startup_scripts/grindless/uv/detectors.js:164` |

### uhv

| Machine ID | Source |
|---|---|
| `gtceu:baseline_astrometer` | `pack/kubejs/startup_scripts/grindless/uhv/gate.js:50` |
| `gtceu:betavoltaic_fab` | `pack/kubejs/startup_scripts/grindless/uhv/betavoltaics.js:65` |
| `gtceu:biomining_heap` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_ground.js:75` |
| `gtceu:cold_trap_drill` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_ground.js:63` |
| `gtceu:crystal_growth_furnace` | `pack/kubejs/startup_scripts/grindless/uhv/crystals.js:73` |
| `gtceu:high_flux_reactor` | `pack/kubejs/startup_scripts/grindless/uhv/transcurium.js:60` |
| `gtceu:mbe_reactor` | `pack/kubejs/startup_scripts/grindless/uhv/photonics.js:75` |
| `gtceu:nuclear_clock_lab` | `pack/kubejs/startup_scripts/grindless/uhv/crystals.js:63` |
| `gtceu:organoid_array` | `pack/kubejs/startup_scripts/grindless/uhv/wetware.js:118` |
| `gtceu:pbo_plant` | `pack/kubejs/startup_scripts/grindless/uhv/elevator.js:181` |
| `gtceu:photonic_foundry` | `pack/kubejs/startup_scripts/grindless/uhv/photonics.js:86` |
| `gtceu:positron_accumulator` | `pack/kubejs/startup_scripts/grindless/uhv/antimatter.js:64` |
| `gtceu:quantum_fabricator` | `pack/kubejs/startup_scripts/grindless/uhv/mega_quantum_fabricator.js:35` |
| `gtceu:radiotrophic_vat` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_life.js:144` |
| `gtceu:regolith_excavator` | `pack/kubejs/startup_scripts/grindless/uhv/mercury.js:67` |
| `gtceu:sample_receiving_facility` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_life.js:108` |
| `gtceu:sic_device_fab` | `pack/kubejs/startup_scripts/grindless/uhv/power_devices.js:62` |
| `gtceu:solar_array_fab` | `pack/kubejs/startup_scripts/grindless/uhv/power_devices.js:73` |
| `gtceu:solar_probe_bay` | `pack/kubejs/startup_scripts/grindless/uhv/swarm.js:91` |
| `gtceu:solar_vapour_furnace` | `pack/kubejs/startup_scripts/grindless/uhv/mercury.js:78` |
| `gtceu:spark_plasma_sinterer` | `pack/kubejs/startup_scripts/grindless/uhv/propulsion.js:134` |
| `gtceu:swarm_control_station` | `pack/kubejs/startup_scripts/grindless/uhv/swarm.js:78` |
| `gtceu:swarm_segment_foundry` | `pack/kubejs/startup_scripts/grindless/uhv/swarm.js:66` |
| `gtceu:tether_ribbon_works` | `pack/kubejs/startup_scripts/grindless/uhv/elevator.js:196` |
| `gtceu:transuranium_facility` | `pack/kubejs/startup_scripts/grindless/uhv/transcurium.js:70` |
| `gtceu:uhv_parallel_hatch` | `pack/kubejs/startup_scripts/grindless/lib/parallel_hatch.js:85` |
| `gtceu:uhv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:uhv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uhv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uhv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uhv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:uhv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uhv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uhv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:ultrapure_water_plant` | `pack/kubejs/startup_scripts/grindless/uhv/betavoltaics.js:54` |
| `gtceu:warp_gate` | `pack/kubejs/startup_scripts/grindless/uhv/gate.js:38` |
| `gtceu:xenobiochem_plant` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_life.js:132` |
| `gtceu:xenobotany_greenhouse` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_life.js:120` |
| `gtceu:xenoflora_rover_bay` | `pack/kubejs/startup_scripts/grindless/uhv/proxima_life.js:96` |
| `gtceu:zblan_draw_tower` | `pack/kubejs/startup_scripts/grindless/uhv/zblan.js:119` |

### uev

| Machine ID | Source |
|---|---|
| `gtceu:calutron` | `pack/kubejs/startup_scripts/grindless/uev/isotopes.js:66` |
| `gtceu:electron_beam_furnace` | `pack/kubejs/startup_scripts/grindless/uev/electron_beam.js:74` |
| `gtceu:entanglement_station` | `pack/kubejs/startup_scripts/grindless/uev/earth_orbit.js:50` |
| `gtceu:heavy_ion_cyclotron` | `pack/kubejs/startup_scripts/grindless/uev/superheavy.js:61` |
| `gtceu:helium3_polariser` | `pack/kubejs/startup_scripts/grindless/uev/fusion.js:36` |
| `gtceu:megabar_press` | `pack/kubejs/startup_scripts/grindless/uev/megabar.js:45` |
| `gtceu:photonic_integration_hall` | `pack/kubejs/startup_scripts/grindless/uev/photonics.js:87` |
| `gtceu:quantum_gas_lab` | `pack/kubejs/startup_scripts/grindless/uev/earth_orbit.js:39` |
| `gtceu:recoil_separator` | `pack/kubejs/startup_scripts/grindless/uev/superheavy.js:66` |
| `gtceu:single_crystal_foundry` | `pack/kubejs/startup_scripts/grindless/uev/electron_beam.js:84` |
| `gtceu:snspd_foundry` | `pack/kubejs/startup_scripts/grindless/uev/photonics.js:65` |
| `gtceu:superheavy_chemistry_lab` | `pack/kubejs/startup_scripts/grindless/uev/superheavy.js:71` |
| `gtceu:uev_energy_input_hatch` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uev_energy_input_hatch_16a` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uev_energy_output_hatch` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uev_energy_output_hatch_16a` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uev_fusion_reactor` | `pack/kubejs/startup_scripts/grindless/uev/fusion.js:37` |
| `gtceu:uev_machine_hull` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uev_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:uev_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uev_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uev_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uev_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:uev_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uev_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uev_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:vdw_stacker` | `pack/kubejs/startup_scripts/grindless/uev/photonics.js:76` |

### uiv

| Machine ID | Source |
|---|---|
| `gtceu:beuv_scanner` | `pack/kubejs/startup_scripts/grindless/uiv/beuv_stm.js:53` |
| `gtceu:crust_lift` | `pack/kubejs/startup_scripts/grindless/uiv/rx_j1856.js:64` |
| `gtceu:decay_heat_vault` | `pack/kubejs/startup_scripts/grindless/uiv/rx_j1856.js:91` |
| `gtceu:droplet_radiator_works` | `pack/kubejs/startup_scripts/grindless/uiv/matrioshka.js:83` |
| `gtceu:femtosecond_writer` | `pack/kubejs/startup_scripts/grindless/uiv/tfln_femtosecond.js:65` |
| `gtceu:levitation_melter` | `pack/kubejs/startup_scripts/grindless/uiv/levitation_melter.js:46` |
| `gtceu:matrioshka_computer` | `pack/kubejs/startup_scripts/grindless/uiv/matrioshka.js:75` |
| `gtceu:millikelvin_cryostat_works` | `pack/kubejs/startup_scripts/grindless/uiv/memories_cryostat.js:57` |
| `gtceu:neutron_drip_separator` | `pack/kubejs/startup_scripts/grindless/uiv/rx_j1856.js:70` |
| `gtceu:neutronium_cage` | `pack/kubejs/startup_scripts/grindless/uiv/rx_j1856.js:77` |
| `gtceu:positronium_condensate_lab` | `pack/kubejs/startup_scripts/grindless/uiv/j0437.js:67` |
| `gtceu:pulsar_wind_trap` | `pack/kubejs/startup_scripts/grindless/uiv/j0437.js:59` |
| `gtceu:r_process_decompressor` | `pack/kubejs/startup_scripts/grindless/uiv/rx_j1856.js:83` |
| `gtceu:ramp_compression_pulser` | `pack/kubejs/startup_scripts/grindless/uiv/metallic_hydrogen.js:50` |
| `gtceu:spectral_hole_burner` | `pack/kubejs/startup_scripts/grindless/uiv/memories_cryostat.js:51` |
| `gtceu:stm_lithography_cell` | `pack/kubejs/startup_scripts/grindless/uiv/beuv_stm.js:58` |
| `gtceu:tfln_fab` | `pack/kubejs/startup_scripts/grindless/uiv/tfln_femtosecond.js:60` |
| `gtceu:uiv_energy_input_hatch` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uiv_energy_input_hatch_16a` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uiv_energy_output_hatch` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uiv_energy_output_hatch_16a` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uiv_machine_hull` | `pack/kubejs/startup_scripts/grindless/uev/foundation.js:110` (generated) |
| `gtceu:uiv_parallel_hatch` | `pack/kubejs/startup_scripts/grindless/lib/parallel_hatch.js:85` |
| `gtceu:uiv_wireless_dynamo_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:104` (generated) |
| `gtceu:uiv_wireless_dynamo_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uiv_wireless_dynamo_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uiv_wireless_dynamo_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uiv_wireless_energy_hatch` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:103` (generated) |
| `gtceu:uiv_wireless_energy_hatch_16a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uiv_wireless_energy_hatch_4a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:uiv_wireless_energy_hatch_64a` | `pack/kubejs/startup_scripts/grindless/lv/wireless_energy.js:286` (generated) |
| `gtceu:xray_pulse_profiler` | `pack/kubejs/startup_scripts/grindless/uiv/j0437.js:75` |

### launch_road

| Machine ID | Source |
|---|---|
| `gtceu:composite_autoclave` | `pack/kubejs/startup_scripts/grindless/launch_road/composite_autoclave.js:89` |
| `gtceu:engine_test_stand` | `pack/kubejs/startup_scripts/grindless/launch_road/engine_test_stand.js:106` |

### moon

| Machine ID | Source |
|---|---|
| `gtceu:lunar_drill` | `pack/kubejs/startup_scripts/grindless/moon/lunar_drill.js:91` |

### observatory

| Machine ID | Source |
|---|---|
| `gtceu:optical_observatory` | `pack/kubejs/startup_scripts/grindless/observatory/machines.js:225` |
| `gtceu:radio_telescope` | `pack/kubejs/startup_scripts/grindless/observatory/machines.js:240` |
| `gtceu:steam_observatory` | `pack/kubejs/startup_scripts/grindless/observatory/machines.js:208` |

### power

| Machine ID | Source |
|---|---|
| `gtceu:generator_array` | `pack/kubejs/startup_scripts/grindless/power/generator_array.js:96` |

## Source evidence

- [GTM 7.5.3 GTEMIPlugin](https://github.com/GregTechCEu/GregTech-Modern/blob/v7.5.3-1.20.1/src/main/java/com/gregtechceu/gtceu/integration/emi/GTEMIPlugin.java):
  previews, processing displays, then workstations.
- [GTM Predicates](https://github.com/GregTechCEu/GregTech-Modern/blob/v7.5.3-1.20.1/src/main/java/com/gregtechceu/gtceu/api/pattern/Predicates.java):
  native block predicates and `custom(Predicate<MultiblockState>, Supplier<BlockInfo[]>)`.
- [LDLib ModularEmiRecipe, 1.20.1 source branch](https://github.com/Low-Drag-MC/LDLib-Architectury/blob/1.20.1/common/src/main/java/com/lowdragmc/lowdraglib/emi/ModularEmiRecipe.java):
  constructor invokes `widgetSupplier.get()`; corroborates the native GTM preview stack trace.
- [EMI 1.1.22 reload manager](https://github.com/emilyploszaj/emi/blob/1.1.22%2B1.20.1/xplat/src/main/java/dev/emi/emi/runtime/EmiReloadManager.java):
  per-plugin throwable catch continues loading; completed status alone is not plugin success.
- [EMI 1.1.22 JEMI plugin](https://github.com/emilyploszaj/emi/blob/1.1.22%2B1.20.1/xplat/src/main/java/dev/emi/emi/jemi/JemiPlugin.java):
  catches individual recipe failures outside the reload warning list.
- [KubeJS JavaWrapper, 2001 source branch](https://github.com/KubeJS-Mods/KubeJS/blob/2001/common/src/main/java/dev/latvian/mods/kubejs/bindings/JavaWrapper.java):
  class-loading and console methods, no `Java.to`.
