# Validation architecture

How T0-T3 run, and where. Usage: [usage.md](usage.md). VM: [vm.md](vm.md). CI: [ci.md](ci.md).
Home fallback: [fallback.md](fallback.md). Rebuilding the VM: [rebuild.md](rebuild.md).
Bench internals (stages, overlay tests, policy): [tools/test/README.md](../../tools/test/README.md).

## Where each tier runs

| Tier | What | Runs on | Started by |
|---|---|---|---|
| T0 | `tools/Check-Fast.ps1`: static, quests, zones, Node suite. No Minecraft, no network. | Any machine with pwsh/PowerShell and Node >= 18; GitHub-hosted `ubuntu-24.04` in CI | Agent before each commit; workflow `t0` on push and PR |
| T1 | One named server check (`Invoke-GGTest.ps1 -Suite server`) | Backend `azure` (Linux VM); `home` as fallback | Agent, over SSH |
| T2 | The batch's integrated server run | `azure`; `home` as fallback | Integrator, over SSH |
| T3 | Client and release checks (`-Suite client` or `both`) | `home` (Windows) until the Linux client is proven | Integrator |

GitHub Actions only runs T0. Heavy tiers are never run by Actions on this public repository: a self-hosted runner
would execute fork PR code on the VM (see [ci.md](ci.md)).

## Backends

`tools/test/Invoke-GGTest.ps1 -Backend azure|home|local` (or `$env:GG_BACKEND`) chooses where the remote runner
(`tools/test/remote/Run-GGTest.ps1`) executes. Values live in `tools/test/backends.psd1`; only the differences are
there, the harness is shared.

| | `azure` | `home` | `local` |
|---|---|---|---|
| Host | ssh alias `grindless-vm` (azureuser) | `ezequiel@192.168.1.150` | this machine |
| OS / shell | Ubuntu 24.04, pwsh 7, bash | Windows, PowerShell 5.1, cmd | Linux or Windows |
| Bench base (`GG_BASE`) | `/var/lib/grindless/bench` | `D:\GregtechGrindless` | `$env:GG_BASE` (required) |
| Transfer | scp + POSIX commands | scp + cmd.exe commands | file copy, no ssh |
| Suites | server (client experimental) | server, client, both | as the host allows |

`local` is for code already on the VM (`tools/vm/gg-vm-run.sh`): it avoids an ssh hop into the same machine.

## One run

1. Local side (`Invoke-GGTest.ps1`): refresh the pack index (or check it is fresh), zip `pack/` + `tools/test/overlay/`
   + `request.json` (with the commit SHA and dirty flag), upload remote scripts by content hash, upload the zip.
2. Remote side (`Run-GGTest.ps1` under `GG_BASE`): extract into `runs/<runId>/` (a clean workspace per run), take the
   global lock, sweep orphans, sync mods (cached), start the server or client, run stages, stop, collect logs, zip
   `results.zip`, print `GGRESULT|<runId>|PASS|FAIL`.
3. Local side: download `results.zip`, print the summary (`Show-GGResults.ps1`). Exit 0 PASS, 1 FAIL, 2 harness.

## Limits, lock, cleanup

- One Minecraft JVM per host (named mutex `GGHarness-minecraft` + `runs/.lock` slot file with heartbeat, FIFO
  tickets). Each host has its own lock: azure and home can each run one JVM at once.
- Heap 1G/4G; boot 420 s, command 60 s, marker 180 s, client 600 s, one shared native budget of 600 s;
  shutdown grace 30 s. Same policy file on every backend (`gg-resource-policy.ps1`).
- On Linux the runner is started inside a transient systemd scope with a memory ceiling (`MemoryMax`), so an
  out-of-memory kill stays inside the run and is reported as `OOM`, not as a game failure.
- Orphans: only JVMs whose command line names a dead run (`-Dgg.run=<id>` or `runs/<id>/`) are killed; on Linux via
  `/proc`, on Windows via CIM. Cleanup kills the run's own tree at the end of every suite.
- Retention: the bench keeps the last 3 `runs/<id>/` directories (they hold a copy of the mods). The VM wrapper also
  keeps `results.zip` and the summary in `/var/lib/grindless/artifacts/<runId>/` for 14 days.

## Results

- Console: `[local]` stages, the streamed remote log, then the summary. The last remote line is
  `GGRESULT|<runId>|PASS` or `FAIL`.
- `-OutDir`: `summary.txt`, `summary.json`, `request.json`, `local-stages.json`, `remote-output.log`, `results/`.
- `results/meta.json` records the backend, host, OS, commit SHA and duration. On Linux, `results/host.json` adds peak
  memory of the scope and the OOM verdict.
- Failure classes (VM wrapper `GGCLASS|<runId>|<class>`): `PASS`, `FAIL` (game or test), `TIMEOUT` (a stage hit its
  deadline), `OOM` (kernel or cgroup kill), `HARNESS` (no results; exit 2).
