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

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\Check-Fast.ps1 [-NodeExe <node.exe>]
```

Local, about 4-5 minutes, no Minecraft or network. Also runs in GitHub Actions on every push ([ci.md](ci.md)).

## T1-T3

| Tier | Command (add `-Commands` / `-WaitForLog` for the check) |
|---|---|
| T1 one server check | `tools\test\Invoke-GGTest.ps1 -Commands 'kubejs custom_command gg_test_recipe_lookup' -WaitForLog 'GGTEST\|lookup\|DONE@@180'` |
| T2 batch server run | same, with the batch's commands (`-CommandsFile` for many) |
| T3 client | `tools\test\Invoke-GGTest.ps1 -Suite client` (or `-Suite both`) |

Exit 0 PASS, 1 FAIL, 2 harness or infrastructure (no results, OOM). The summary names the backend and why:
`backend: azure (default)`, `backend: home (fallback from azure: ...)`.

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
