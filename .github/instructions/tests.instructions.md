---
applyTo: "tools/test/**,tools/analysis/**,tools/Check-Fast.ps1"
---
# Testing rules

## When to run what
| Tier | When | Command | Who |
|---|---|---|---|
| T0 | Before every package commit | `powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1` (`-Skip analysis` only for inner loops) | Every worker |
| T1 | Only for a new or changed mechanism named in the package | One test on a copy of the pack: `tools\test\Invoke-GGTest.ps1 -Suite server -PackDir <copy of pack> -Commands 'kubejs custom_command gg_test_<x>' -WaitForLog '<marker>'` | Implementer, at most once per repair |
| T2 | Once per integration batch | Reachability (`tools\analysis\Invoke-Reachability.ps1 -Tier <tier>`), `gg_test_recipe_lookup`, EMI coverage, regeneration | Integrator |
| T3 | Release candidate only | Client suite, gallery, quest book, the changed tiers' integrated run | Integrator |

- Before any native run, state the doubt it resolves. No doubt, no run.
- `Invoke-GGTest` runs `tools/Update-PackIndex.ps1` over the pack it is given (`Invoke-GGTest.ps1:91,358`). Package workers always pass `-PackDir` with a copy of `pack/` (e.g. under `$env:TEMP`), so the worktree's `pack/index.toml` and `pack/pack.toml` stay untouched. If they changed anyway, `git restore pack/index.toml pack/pack.toml` before committing.
- Do not retest what is proven: a mechanism that passed in game (a multiblock that forms and processes, a recipe type, a table that generates recipes) is not re-run for content that only uses it (more recipes, more table rows). Validate that content with T0 and the static contracts in `tools/analysis`.
- Genuinely new mechanisms, changed contracts and known regressions go into the tier's single integrated candidate run; one run may cover several features. Tagging uses that evidence plus valid prior proof, never the whole historical battery.
- Small, low-risk changes need no extra test unless there is concrete evidence of a possible failure, a known regression or an affected unproven mechanism.
- If a check fails: fix it and repeat only that check. The same owner coordinates the rerun.
- Integrated-run coverage: the pack starts and creates a world; our multiblocks form and process; recipes exist, automatic generation works, and the next tier's gate can be crafted.

## Results and logs
- Read only the `Invoke-GGTest` stdout summary or `summary.json`. Never load a complete `latest.log`, `debug.log` or crash report into context.
- On FAIL, hand `summary.json` plus at most 40 lines around the first relevant error to the `triage` agent; it returns at most 20 lines with file:line evidence.
- T0 fails while `tools/test/overlay/kubejs/config/gg_test_emi_coverage_expect.json` is stale. A package may regenerate it (`node tools/analysis/emi-coverage.mjs --expect`); on a merge conflict the integrator regenerates it. Other generated files stay integrator-only (`release.instructions.md`).
- The EMI client audit fails only on new gaps; known ones (`tools/analysis/emi_runtime_known.json`) are a NOTE. The list only shrinks: after fixing gaps, the integrator rewrites it from the new report (`emi-coverage.mjs --known-from <report> --expect`). Never add a gap by hand.

## Bench: VM first, home fallback
- Bench: `tools/test/Invoke-GGTest.ps1` uploads the pack to the Linux VM (backend `azure`, default), starts a clean server or client and returns a summary. Only when the VM is unreachable or fails before the suite starts does the run repeat on the home PC (backend `home`); the summary's `backend:` line says which ran and why. Never re-run a real FAIL elsewhere. Docs: `docs/testing/`.
- VM: alias `grindless-vm` (user-provided ssh config, never in the repo); 3 concurrent runs, the harness's slots enforce it. Do not start Minecraft on the VM outside the harness.
- Home PC (fallback): access `ezequiel@192.168.1.150`. Writes only inside `D:\GregtechGrindless`. Never touch the user's PrismLauncher folder, `D:\Grindless` or their `.minecraft`. Only one Minecraft test JVM there, across all agents and worktrees; the bench enforces it (a global OS mutex held through native cleanup), even for legacy slot requests.
- Client and server use `-Xms1G -Xmx4G` (heap, not total RAM). Available RAM is not a launch condition and unreadable counters do not block a run.
- One exception: the EMI client audit stalls in EMI's reload at 4G. It runs with `-EmiAuditClientXmx 8G -Slots 1 -EmiAuditTimeoutSec 1800`, alone on the VM, by the integrator only (T2/T3).
- Native budget: at most 600 s per stage (startup included), 30 s for server shutdown, commands 60 s, marker waits 180 s. These are failure ceilings, not targets. Never raise heap, time or concurrency limits or automatically retry a resource failure.
- Do source/static validation locally, not on a bench. Before using an older worktree, merge the current bench resource-policy changes; never use a historical launcher to bypass the limits.
- Test clients start with all sound at zero (`Set-GGClientOptions` in `tools/test/remote/gg-client.ps1`).

## Test scripts and zones
- Test scripts live in `tools/test/overlay/` and are not published with the pack.
- Each test builds and cleans up only its reserved band. Bands: `tools/test/zones.json`. Look one up with `tools\test\Get-GGTestZone.ps1 -Id <id>`. A new band is assigned in the work package by the integrator (`-Next`), so parallel packages never pick the same X; the worker adds only that row. Keep bands disjoint, even for approved integration probes.
