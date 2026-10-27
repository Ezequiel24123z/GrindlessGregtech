# The validation VM (backend `azure`)

The primary bench for T1-T3. The home PC is only its fallback ([fallback.md](fallback.md)). Rebuilding it from
scratch: [rebuild.md](rebuild.md).

## Access

- ssh alias `grindless-vm`, user `azureuser`. The address, key and pinned host key are **user-provided**, in each
  workstation's `~/.ssh/config` or in the access bundle the user hands out (outside the repository). Nothing in the
  repository holds the address, a key or a token. Another alias: `Host` in an untracked
  `tools/test/backends.local.psd1`.
- `azureuser` has passwordless sudo and root on purpose: the VM is dedicated to agents and testing. Keep the alias
  and `azureuser` working; never lock agents out (see "Do not" below).

## Layout

| Path | What |
|---|---|
| `/var/lib/grindless/bench` | Bench base (`GG_BASE`): `runs/<runId>/` (one workspace per run), `runs/.lock*` (slot locks), `sync/` and `cache/` (mods, Forge), `hmc/` (HeadlessMC), `tools/remote/<hash>/` (uploaded harness scripts) |
| `/var/lib/grindless/workspaces` | `gg-vm-run.sh`: git mirror and per-SHA checkouts (newest 5) |
| `/var/lib/grindless/artifacts` | `gg-vm-run.sh`: results kept 14 days |
| `/var/lib/grindless/backups`, `inventory`, `/srv` | Leisure archive: never touched by the bench or its scripts |
| `/opt/grindless/tools` | Installed copies of `tools/vm/*.sh` |
| `/opt/grindless/runtime` | Node (checksum-verified tarball) |
| `/etc/grindless/bench.env` | This VM's sizing (`GG_BENCH_*`), written once by the bootstrap, then edited by hand |
| `/var/log/grindless/runs.log` | One `GGCLASS` line per `gg-vm-run.sh` run |

All of it is owned by the bench user (`azureuser`).

## What this work installed

Only what `tools/vm/gg-vm-bootstrap.sh` does (idempotent; `GG_BOOTSTRAP_DRY=1` shows the plan): JDK 17, git, rsync,
zip, jq, Xvfb, Mesa (llvmpipe) and the X11 libraries for the client, PowerShell 7, Node, the directories above, an
open-file limit, `bench.env` and `loginctl enable-linger azureuser`. No daemons, no services, no GitHub runner
(see [ci.md](ci.md) for why). Docker is present from provisioning and unused by the bench.

Each run lives in a transient user scope `gg-run-<runId>.scope` (`systemd-run --user --scope`, `MemoryMax` per run),
so linger is what keeps that user manager up without a login, also after a reboot.

## Sizing

`/etc/grindless/bench.env` holds the inputs; each run computes its ceiling at launch:
`MemoryMax = min((RAM - GG_BENCH_RESERVE_MB) / slots, GG_BENCH_RUN_MAX_MB)`, `MemorySwapMax = 2G`. The bootstrap's
default slot count is `min(nproc - 1, (RAM - reserve) / 8 GiB, 8)`, at least 1. `GG_BENCH_SLOTS` in `bench.env` and
`Slots` in `tools/test/backends.psd1` must agree; when holders disagree the smallest count wins.

Measured on 4 vCPU / 31.3 GiB (Ubuntu 24.04, JDK 17, 1G/4G heap), `gg_test_recipe_lookup` server suite:

| Concurrent runs | Wall (all) | Boot each | Peak RSS per JVM | Min MemAvailable | Max load | Result |
|---|---|---|---|---|---|---|
| 1 | 186 s | 77 s | 4.5 GiB | 25.8 GiB | 3.1 | PASS |
| 2 | 233 s | ~134 s | 5.0-5.2 GiB | 20.0 GiB | 7.4 | PASS, PASS |
| 3 | 315 s | 210-219 s | 5.1 GiB | 14.7 GiB | 13.7 | PASS x3 |
| 2 server + 1 client | 393 s | ~162 s | cgroup peaks 5.9 / 5.7 / 7.1 GiB | - | - | PASS x3 (client 347 s of 600) |

CPU is the limit, not RAM: throughput per run goes 186 s -> 116 s -> 105 s. Default `Slots = 3`: about 2x headroom on
every deadline (boot 219 of 420 s, client 347 of 600 s) and over 14 GiB free; 0 OOM kills. A larger VM: re-run the
bootstrap on it (or set `GG_BENCH_SLOTS`), then measure with `-Slots N` before raising `Slots`.

## Client (T3)

`-Suite client` runs on the VM: HeadlessMC (`headlessmc-launcher-linux-x64`, pinned in `gg-tools.ps1`) under
`xvfb-run`, the real client mod set on real LWJGL with the system Mesa llvmpipe (`LIBGL_ALWAYS_SOFTWARE=1`). The run
proves software GL by the loaded Mesa library and logs `GGTEST|CLIENT-GL|renderer=llvmpipe ...`.

## Evidence runs

Done on this VM (run ids are the harness `runId`s):

| Property | Evidence |
|---|---|
| Server suite PASS on default backend `azure` | `20261027-211240-server-980` (after reboot) |
| Client suite (T3) PASS, GL confirmed | `20261027-202123-client-e5d`, 229 s, llvmpipe (LLVM 20.1.2), 0 KubeJS errors |
| 1/2/3 concurrent slots, mixed | table above |
| Slot queueing (FIFO) | `-Slots 1`: second run waited 30 s, third 150 s, all PASS |
| Busy VM fails, no fallback | `-LockWaitMin 1`: `FAIL lock timed out after 1 min`, no `GGFALLBACK` |
| Boot timeout, intentional FAIL | FAIL, no fallback, no false OOM, 0 java left |
| VM unreachable -> home | `GGFALLBACK|azure|home|unreachable ...`, one hop only |
| Interrupt (`systemctl --user stop` scope) | exit 2, no fallback, JVM gone, stale lock reclaimed |
| Reboot | linger and user manager back, server run PASS |
| `gg-vm-run.sh <sha>` | `GGCLASS|vm-20261027-201920-4e1021f3-3027|PASS`, 110 s |

## Updating

- Harness scripts (`tools/test/remote/*`): nothing to do; each run uploads them by content hash.
- VM scripts: `scp tools/vm/*.sh grindless-vm:/opt/grindless/tools/`, then re-run the bootstrap (it changes only
  what is missing) and the health check.
- OS updates: `sudo apt-get upgrade`, then reboot and run the health check. Kernel and JDK updates need one server run.

## Reboot and recovery

- `sudo systemctl reboot`. After it: health check (`user-systemd OK ... linger=yes`), then one server run.
- Health `FAIL` or runs going to home: run the health check, re-run the bootstrap, check `df`, then
  `systemctl --user list-units 'gg-run-*'` for stuck scopes (stop them) and `pgrep -a java`.
- Unrecoverable: rebuild ([rebuild.md](rebuild.md)); the harness falls back to home meanwhile.

## Deregistering

No GitHub runner or service is registered, so there is nothing to deregister. To retire the VM: point
`backends.psd1` `Default` at `home` (or set `$env:GG_BACKEND = 'home'`), then delete the VM.

## Do not

Delete the Leisure backup (`/var/lib/grindless/backups`, `inventory`, `/srv`), remove `azureuser`, break the ssh
alias or `authorized_keys`, put keys or tokens in the repository, or run untrusted PR code on the VM.
