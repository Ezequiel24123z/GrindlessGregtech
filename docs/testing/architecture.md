# Validation architecture

How T0-T3 run, and where. Index: [README.md](README.md). Usage: [usage.md](usage.md). VM: [vm.md](vm.md). CI: [ci.md](ci.md).
Home fallback: [fallback.md](fallback.md). Rebuilding the VM: [rebuild.md](rebuild.md).
Bench internals (stages, overlay tests, policy): [tools/test/README.md](../../tools/test/README.md).

## Where each tier runs

| Tier | What | Runs on | Started by |
|---|---|---|---|
| T0 | `tools/Check-Fast.ps1`: static, quests, zones, Node suite. No Minecraft, no network. | Any machine with pwsh/PowerShell and Node >= 18; GitHub-hosted `ubuntu-24.04` in CI | Agent before each commit; workflow `t0` on push and PR |
| T1 | One named server check (`Invoke-GGTest.ps1 -Suite server`) | Backend `azure` (Linux VM, the default); `home` only as automatic fallback ([fallback.md](fallback.md)) | Agent, over SSH |
| T2 | The batch's integrated server run | Same as T1 | Integrator, over SSH |
| T3 | Client and release checks (`-Suite client` or `both`) | `azure` too: HeadlessMC under Xvfb on Mesa llvmpipe ([vm.md](vm.md#client-t3)); `home` as fallback | Integrator |

GitHub Actions only runs T0. Heavy tiers are never run by Actions on this public repository: a self-hosted runner
would execute fork PR code on the VM (see [ci.md](ci.md)).

## Backends

`tools/test/Invoke-GGTest.ps1 -Backend azure|home|local` (or `$env:GG_BACKEND`) chooses where the remote runner
(`tools/test/remote/Run-GGTest.ps1`) executes. Values live in `tools/test/backends.psd1`; only the differences are
there, the harness is shared.

| | `azure` | `home` | `local` |
|---|---|---|---|
| Host | ssh alias `grindless-vm`; user and address per workstation `~/.ssh/config` | `ezequiel@192.168.1.150` | this machine |
| OS / shell | Ubuntu 24.04, pwsh 7, bash | Windows, PowerShell 5.1, cmd | Linux or Windows |
| Bench base (`GG_BASE`) | `/var/lib/grindless/bench` | `D:\GregtechGrindless` | `$env:GG_BASE`, else `BaseLinux`/`BaseWindows` |
| Transfer | scp + POSIX commands | scp + cmd.exe commands | file copy, no ssh |
| Suites | server, client, both | server, client, both | server, client, both |

Per-machine changes (another alias, a forced `MemoryMax`) go in an untracked `tools/test/backends.local.psd1` (or the
file named by `$env:GG_BACKENDS_LOCAL`), same shape, only the keys that change. Nothing in the repository is sized for
a particular VM: the VM writes its own sizing to `/etc/grindless/bench.env` ([vm.md](vm.md#sizing)).

`local` is for code already on the VM (`tools/vm/gg-vm-run.sh`): it avoids an ssh hop into the same machine.

## One run

1. Local side (`Invoke-GGTest.ps1`): refresh the pack index (or check it is fresh), zip `pack/` + `tools/test/overlay/`
   + `request.json` (with the commit SHA and dirty flag), upload remote scripts by content hash, upload the zip.
2. Remote side (`Run-GGTest.ps1` under `GG_BASE`): extract into `runs/<runId>/` (a clean workspace per run), take the
   global lock, sweep orphans, sync mods (cached), start the server or client, run stages, stop, collect logs, zip
   `results.zip`, print `GGRESULT|<runId>|PASS|FAIL`.
3. Local side: download `results.zip`, print the summary (`Show-GGResults.ps1`). Exit 0 PASS, 1 FAIL, 2 harness.

## Limits, lock, cleanup

- Slots: each run holds one slot file (`runs/.lock` is slot 0, `runs/.lock.<n>` the others; created exclusively, with
  a 30 s heartbeat; FIFO tickets while all are taken, at most `-LockWaitMin`). The backend's `Slots` sets how many:
  `azure` 3 (measured, [vm.md](vm.md#sizing)), `home` 1 (plus the named mutex `GGHarness-minecraft`). Each slot has its
  own run directory and ports (server `25565 + 20 * slot`, RCON 10 above), and on Linux its own scope `MemoryMax`.
  Each host has its own slots, and a busy VM never sends a run home.
- Heap 1G/4G; boot 420 s, command 60 s, marker 180 s, client 600 s, one shared native budget of 600 s;
  shutdown grace 30 s. Same policy file on every backend (`gg-resource-policy.ps1`).
- On Linux the runner is started inside a transient systemd scope with a memory ceiling (`MemoryMax`, sized by the VM:
  RAM minus a reserve), so an out-of-memory kill stays inside the run and is reported as `OOM`, not as a game failure.
  `MemorySwapMax` (2G) caps the run's swap.
- Orphans: only JVMs whose command line names a dead run (`-Dgg.run=<id>` or `runs/<id>/`) are killed; on Linux via
  `/proc`, on Windows via CIM. Cleanup kills the run's own tree at the end of every suite.
- Retention: the bench keeps the last 3 `runs/<id>/` directories (they hold a copy of the mods). On the VM,
  `tools/vm/gg-vm-run.sh` keeps `results.zip` and the summary in `$GG_ROOT/artifacts/vm-<utc>-<pid>/`
  (`GG_ROOT` defaults to `/var/lib/grindless`) for `GG_ARTIFACT_DAYS` (14) days, the newest `GG_WORKSPACE_KEEP` (5)
  per-SHA checkouts, and appends every `GGCLASS` line to `/var/log/grindless/runs.log`.

## Results

- Console: `[local]` stages, the streamed remote log, then the summary. The last remote line is
  `GGRESULT|<runId>|PASS` or `FAIL`.
- `-OutDir`: `summary.txt`, `summary.json`, `request.json`, `local-stages.json`, `remote-output.log`, `results/`.
- `results/meta.json` records the backend, host, OS, commit SHA, dirty flag and duration. On Linux, `results/host.json`
  adds the scope's cgroup memory (`peak`, `current`, `oomKills`); the OOM verdict is the `GGOOM` line of
  `gg-linux-run.sh`.
- The summary names the backend: `backend: azure (default)`, `backend: home (-Backend)`, or
  `backend: home (fallback from azure: <reason>)` after a `GGFALLBACK|azure|home|<reason>` line.
- Failure classes (VM wrapper `GGCLASS|<runId>|<class>`): `PASS`, `FAIL` (game or test), `TIMEOUT` (a stage hit its
  deadline), `OOM` (kernel or cgroup kill), `HARNESS` (no results; exit 2).
