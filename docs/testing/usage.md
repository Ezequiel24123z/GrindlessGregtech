# Using the validation bench

All commands run from the repository root. On Windows use `powershell -NoProfile -ExecutionPolicy Bypass -File ...`;
on Linux, `pwsh ...`. The harness reference (every parameter, overlay tests): [tools/test/README.md](../../tools/test/README.md).

## Health check

```powershell
Get-Content -Raw tools\vm\gg-vm-health.sh | ssh grindless-vm "tr -d '\r' | bash -s"   # Windows
ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-health.sh'                          # installed copy
```

One `HEALTH|<check>|OK|WARN|FAIL|...` line per check, then `GGHEALTH|<host>|PASS|WARN|FAIL`. Exit 1 only on FAIL.
WARN is usable (for example `leisure-backup` not present, or a stale lock the next run reclaims). Read-only.

## T0

Never on the workstation (4 cores, 12.5 GB, shared by every session; owner, 2026-11-01). Two places:

- **GitHub Actions**, on every push ([ci.md](ci.md)), about 2 minutes. Read the run of your branch:

```powershell
gh run list --repo Ezequiel24123z/GrindlessGregtech --workflow t0.yml --branch <branch> --limit 1 --json databaseId,headSha,status,conclusion
gh run watch <databaseId> --repo Ezequiel24123z/GrindlessGregtech --exit-status
gh run view <databaseId> --repo Ezequiel24123z/GrindlessGregtech --log-failed | Select-Object -Last 40   # on failure
```

- **The VM**, for a pushed commit (below): `'pwsh -NoProfile -File tools/Check-Fast.ps1' | ssh grindless-vm "bash /opt/grindless/tools/gg-vm-exec.sh <branch>"`.

`tools\Check-Fast.ps1` itself is unchanged (static KubeJS load, lang parity, quest lint, zones, order, tooltips,
capacity, analysis suite); on an idle 4-core machine it takes 4-5 minutes, which is why it no longer runs locally.

## Node tools on the VM (`gg-vm-exec.sh`)

Any Node or PowerShell tool of a **pushed** commit (commit and push first; a WIP commit is fine), with the command on
stdin so Windows quoting never matters:

```powershell
'node tools/analysis/reachability.mjs --tier lv --dump $GG_DUMP' | ssh grindless-vm "bash /opt/grindless/tools/gg-vm-exec.sh <branch|sha>"
'node tools/analysis/line-audit.mjs --dump $GG_DUMP --out /tmp/la && cat /tmp/la/03_lines.csv' | ssh grindless-vm "bash /opt/grindless/tools/gg-vm-exec.sh <branch|sha>"
```

- It runs at the root of a scratch checkout of that commit (removed afterwards), with the bench's Node first on
  `PATH`, under `nice`, at most 2 at once. Files it writes there are discarded: print what you need.
- `$GG_DUMP` is the newest batch dump (`/var/lib/grindless/dumps/latest`, the integrator's T2 dump of current
  content). A dump of your own: `scp -r <dump dir> grindless-vm:/var/lib/grindless/dumps/<branch>-<n>` and pass that
  path instead.
- The last line is `GGEXEC|<runId>|<exit>|<sha>|<seconds>s`; the exit code is the command's (2 when it cannot
  start: unknown ref, fetch or checkout failure, no slot within 30 minutes).
- Installing or updating the script: `scp tools/vm/*.sh grindless-vm:/opt/grindless/tools/` (strip `\r` if the
  working tree has CRLF).

## T1-T3

| Tier | Command (add `-Commands` / `-WaitForLog` for the check) |
|---|---|
| T1 one server check | `tools\test\Invoke-GGTest.ps1 -Commands 'kubejs custom_command gg_test_recipe_lookup' -WaitForLog 'GGTEST\|lookup\|DONE@@180'` |
| T2 batch server run | same, with the batch's commands (`-CommandsFile` for many) |
| T3 client | `tools\test\Invoke-GGTest.ps1 -Suite client` (or `-Suite both`) |

Exit 0 PASS, 1 FAIL, 2 harness or infrastructure (no results, OOM). The summary names the backend and why:
`backend: azure (default)`, `backend: home (fallback from azure: ...)`.

### Mandatory EMI audit

Every client suite holds the test player until EMI finishes reloading and audits the live recipe manager.
An exit-0 client, a completed reload, or a vanilla crafting recipe alone is not proof of working GTM integration.
The client suite requires `GGTEST|emi_coverage|all|PASS`, `DONE`, and the exported report; reload/plugin
exceptions, missing workstation bindings, missing GT process displays, missing multiblock previews, missing
acquisition/use routes and missing required info pages fail the run. Exempt: the static audit's hidden
unreleased stacks and legacy conversions, machines under EMI's disabled tags (`grindless:hidden_with_recipes`),
and multiblocks whose definition turns the XEI preview off (`isRenderXEIPreview()` false, listed as `previewsOff`).
Gaps already in `tools/analysis/emi_runtime_known.json` are a `known` NOTE, not a FAIL; any new gap fails.
That list only shrinks: after a fix, regenerate it from the new report with
`node tools/analysis/emi-coverage.mjs --known-from <report> --expect` (the NOTE lists the fixed entries).
The audit needs `-EmiAuditClientXmx 8G -Slots 1 -EmiAuditTimeoutSec 1800`: at 4G, EMI's reload stalls.

The full report is collected as `results/client/kubejs-exported/gg_emi_coverage_report.json`: per-stack
made/used counts and categories, all GTM machines and workstation bindings, all displayable GT categories,
previews, info pages, and reload warnings. Read that JSON or the summary, not complete logs.
Limit: the audit reads each GT recipe's own outputs where GTM exposes them; for the rest (38,630 recipes at
v1.4.0, the `native_outputs` NOTE) it judges extra outputs and byproducts by EMI's index alone. Byproduct
destinations are proven on the dump instead (the batch's unconsumed-output query and `line-audit.mjs`).
Expectations are regenerated with `node tools/analysis/emi-coverage.mjs --expect` after content changes.
The overlay is test-only; the pack shipped to players does not include it.

For the named MEGA module preview proof, copy the overlay, add `"renderPreview": true` to its
`kubejs/config/gg_test_emi_coverage.json`, and pass the copy with `-OverlayDir`.
This opens `gtceu:mega_factory` for 40 client ticks, captures `gg_emi_mega_factory.png` in exported results,
and restores the screen. The harness requires the image and `preview_render|PASS`; ordinary runs do not
open a screen or interfere with other UI fixtures.

`-EmiAuditTimeoutSec 1800` is an explicit, owner-approved extended audit option for `-Suite client` on
the Linux backend only. Its default is 600, and it also extends the fixture hold deadline. Server, combined,
home-PC and ordinary native/client limits do not change; the policy rejects other extended uses.

The separately approved `-EmiAuditClientXmx 8G` option defaults to `4G`, accepts at most `8G`, and is
restricted to client-only Linux audits with `-Slots 1`. Verify the VM slot locks are free before starting:
the existing semaphore then excludes other holders throughout the run. The ordinary `-ClientXmx`,
server and personal-PC caps stay 4G. Do not disable player search to make the audit fit the test heap.

## Forming sweep (QR-B1)

Proves every multiblock our startup scripts register forms from its own first EMI preview shape (`tools/test/overlay/kubejs/server_scripts/gg_test_form_sweep.js`).

- Command: `tools\test\Invoke-GGTest.ps1 -Commands 'kubejs custom_command gg_test_form_sweep_<era>' -WaitForLog 'GGTEST\|form_sweep\|DONE@@180' -LockWaitMin 15 -Slots 1`. Eras: steam, lv, mv, hv, ev, iv, luv, zpm, uv, uhv, uev, uiv, launch_road, moon, observatory, power; `gg_test_form_sweep_all` runs them all.
- Selection: `gg_test_form_sweep` reads `kubejs/config/gg_test_form_sweep.json` (optional `eras`, `ids`, `from`, `limit`, `budgetTicks`). When the tick budget ends a run, `DONE` prints `next=<cursor>`; pass it as `from` to resume.
- Id list: `kubejs/config/gg_test_form_sweep_ids.json`, generated by `node tools\analysis\form-sweep-ids.mjs --write` (`--check` compares). Its hand-kept `where` map names ids that form only in another dimension (NOTE rows).
- Markers: `GGTEST|form_sweep|<id>|PASS|WxHxD, N ticks` (checked in the placing tick; `, forced` if GTM's explicit check formed it), `...|FAIL|<GTM error, refused cell>`, `...|NOTE|<reason>`, and `GGTEST|form_sweep|DONE|failures=N ids=M next=<cursor|none>`.
- Zone `form_sweep` (X 36064-36127, Z 0-127); the cell is cleared after each id.

## Factory load baselines (AUD3-PERF)

Measures representative industrial loads (`tools/test/overlay/kubejs/server_scripts/gg_test_factory_load.js`, config `kubejs/config/gg_test_factory_load.json`, zone `factory_load`).

- Command: `tools\test\Invoke-GGTest.ps1 -Commands 'kubejs custom_command gg_test_factory_load' -WaitForLog 'GGTEST\|factory_load\|DONE@@180' -LockWaitMin 15 -Slots 1`. One exclusive slot; never beside the EMI audit or another timing run.
- Profiles, one after the other in the same band: `control` (nothing built: fixture overhead), `midgame` (HV wireless tower + N HV centrifuges with HV wireless covers), `endgame` (UV tower, N UV centrifuges, F Mega Factories with 2 modules and a UV parallel hatch; the factories' UV energy hatch is topped up by the fixture, declared, not wireless).
- Per profile, after `warmupTicks`, a window of `windowTicks` real samples of the server's own tick-time ring: mean, p95, max, ticks over 50 ms; output rate against the requested rate; Java heap peak; loaded and forced chunk counts before, at peak and after cleanup. A measurement that cannot be read is reported `null` or `unavailable`, never guessed. Loaded sites are the band's forced chunks plus those counts.
- Then (midgame) backpressure: every output slot full, nothing may run or accumulate; then the band is cleared and the tracked wireless endpoints and forced chunks must return to the pre-run values (abandoned-endpoint cancellation; the Hyperstargate arrival ticket of #302 is not exercised here).
- Markers: `GGTEST|factory_load|<check>|PASS|FAIL|NOTE`; one `summary_<profile>` NOTE per profile carries compact JSON, also written to `kubejs/exported/factory_load.json` (collected as `results/server/kubejs-exported/factory_load.json`).
- Budget: 50 ms is the 20 TPS tick budget. The first baselines come before any threshold: no regression limit is set until repeated runs give the noise. Nothing here is claimed as a failure without evidence.
- Baselines: run `vm-20261103-170232-6bfeae9c-962617` (commit 6bfeae9c5, Linux VM, 1 exclusive slot; window 200 ticks after 60 warmup; tick source: the server's `tickTimes` ring). Single run: noise unknown, so no threshold yet.

  | Profile | Load | Tick mean / p95 / max (ms) | Ticks over 50 ms | Output (actual/requested items/s) |
  |---|---|---|---|---|
  | control | nothing built | 3.45 / 12.90 / 29.25 | 0 | - |
  | midgame | 24 HV centrifuges, HV wireless tower | 1.93 / 2.28 / 105.28 | 1 | 24 / 24 |
  | endgame | 16 UV centrifuges, UV wireless tower (0 of 4 Mega Factories formed) | 0.65 / 0.84 / 3.92 | 0 | 16 / 16 |

  Control reads higher than the loaded profiles: it runs first, right after boot and the forced-chunk load, so early-run noise dominates; the figures are an upper bound for fixture overhead, not a per-machine cost. Backpressure (midgame): 9216 items in full outputs, 0 working, count unchanged. Cleanup: tracked wireless endpoints 25 and 17 at the clear, 0 after 60 ticks; forced chunks 0 before and 0 after; loaded chunks 625 before the run, 1649 after (unloading is deferred). Heap is `null`: `java.lang.Runtime` is outside KubeJS's class filter. Open: the four endgame Mega Factories did not form in the fixture (`endgame_formed` FAIL, GTM pattern errors; a follow-up contract is needed), and the Hyperstargate arrival ticket (#302) is not exercised.

## Choosing the backend

- Default: `azure` (`Default` in `tools/test/backends.psd1`). `-ShowBackend` prints the resolved values and exits.
- `-Backend home` (or `$env:GG_BACKEND = 'home'`) forces the home bench; `-Backend local` runs on this machine (on the VM).
- Automatic fallback to `home` only when the VM is unreachable, the upload fails, or the remote runner dies before
  any suite stage. Never on a test FAIL, a timeout, an OOM, or a busy VM (lock wait expired). `-NoFallback` or
  `$env:GG_NO_FALLBACK = '1'` disables it ([fallback.md](fallback.md)).
- Concurrency: up to `Slots` runs at once on the VM (3, [vm.md](vm.md#sizing)); more wait FIFO up to `-LockWaitMin`
  (5 min). `-Slots 1` asks for exclusive use.

## Interrupting a run

Ctrl+C stops only the local side; the remote run continues until its own deadlines. To stop it on the VM:

```bash
systemctl --user list-units 'gg-run-*'           # one scope per run: gg-run-<runId>.scope
systemctl --user stop gg-run-<runId>.scope       # kills pwsh and the JVM of that run only
```

The local side then reports exit 2 with no fallback. The slot's lock file stays until the next run reclaims it (its
pid is gone; health shows `stale lock ... the next run reclaims it`). On the home bench, kill the run's
`Run-GGTest.ps1` process tree; the next run kills JVMs of dead runs.

## Logs and results

- `-OutDir <dir>` (default: a timestamped folder under `$env:GG_OUT_ROOT`, else the workstation default in
  `Invoke-GGTest.ps1`, `~/.cache/grindless/test-runs` on Linux): `summary.txt`, `remote-output.log`, `results/` (server and client
  logs, `stages.json`, `meta.json` with backend, slot and commit, `host.json` on Linux).
  Re-read one with `tools\test\Show-GGResults.ps1 -OutDir <dir>`.
- On the bench: `runs/<runId>/` under the base (the last 3 finished runs are kept). Runs started with
  `tools/vm/gg-vm-run.sh` also keep `results.zip` under `/var/lib/grindless/artifacts/` for 14 days.

## Cleaning a broken run

Nothing to do in the normal case: the next run reclaims stale locks, kills JVMs whose command line names a dead run,
and deletes run directories without results after 24 h. By hand on the VM: stop its scope (above), then
`rm -rf /var/lib/grindless/bench/runs/<runId>`. Never delete `runs/.lock*` while a run is active.

## Diagnosing an OOM

The summary shows `FAIL memory ... GGOOM|<runId>|scope ... was OOM-killed at MemoryMax=...` and exits 2. Check
`results/host.json` (`memoryPeakMb`, `oomKills`) and on the VM
`journalctl --user -u gg-run-<runId>.scope` and `sudo journalctl -k | grep -i oom`. Remedies: fewer concurrent runs
(`-Slots 1`), a larger per-run ceiling (`GG_BENCH_MEMORY_MAX` in `/etc/grindless/bench.env`), or a smaller heap
(`-ServerXmx`). A Java `OutOfMemoryError` inside the heap is a game FAIL, not an OOM kill.

## Diagnosing a timeout

The failing stage says which deadline and the last log line (`boot timed out after 420s; last log line: ...`). Look
at `results/` (`server-stdout.log`, `latest.log`, client logs) and the VM load: three concurrent runs boot in about
210 s instead of 77 s ([vm.md](vm.md#sizing)). Deadlines are in [architecture.md](architecture.md#limits-lock-cleanup).

## Repeating a run, validating a commit

- Repeat: run the same command again; `request.json` in the `-OutDir` holds the exact arguments, commit and dirty flag.
- A specific pushed commit, branch or PR head, entirely on the VM (no local checkout needed):

```bash
ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-run.sh <sha|branch|pull/N/head> -Commands "kubejs custom_command gg_ping" -WaitForLog "GGTEST\|PING\|PASS"'
```

Last line: `GGCLASS|<runId>|PASS|FAIL|TIMEOUT|OOM|HARNESS|<sha>|<seconds>s|<artifact dir>`.
