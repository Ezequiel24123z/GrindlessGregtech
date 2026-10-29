# EMI runtime quality standard

## Root cause

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

The pre-repair runtime loses the GTM plugin globally; treating its missing processes as individual recipe
defects would be misleading. The post-repair report is the authority for acquisition/use, workstation,
preview and machine-info gaps. Static coverage currently reports 1,441 audited stacks (964 items,
341 machines, 136 fluids), zero gaps and zero problems; this does not prove runtime plugin success.

Phase 2 must preserve the hard gate, add honest bilingual pages/routes rather than exceptions, and
regenerate expectations once per integration batch. UIV remains parked; visible unfinished UIV content
is not a reason to weaken the released-era audit.

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
