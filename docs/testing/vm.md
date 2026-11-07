# The validation VM (backend `azure`)

Since 2026-11-07 this is the owner's play server in **Spain Central**: Standard D2as v5, 2 vCPU, 8 GiB RAM,
Premium SSD P6 (64 GiB). The former 4 vCPU / 32 GiB validation VM in Central India was retired after migration.
One occasional server bench may run with the play service stopped; client EMI runs use the home backend
([fallback.md](fallback.md)), because their 8 GiB heap does not fit this VM. Rebuilding: [rebuild.md](rebuild.md).

The estimated fixed monthly cost is EUR 80.91 before tax (744 compute hours, Premium SSD and Standard IPv4),
or EUR 97.90 with 21% VAT, without reservations or Spot eviction. The subscription's spending limit stays on.
The outgoing traffic quota is 90 GiB per UTC month; once exhausted, non-loopback outgoing traffic is blocked
until the next month. This keeps the server within Azure's first 100 GB monthly free internet egress allowance;
that allowance is shared with other Azure resources, not reserved for this VM.

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
| `/var/lib/grindless/workspaces` | `gg-vm-run.sh`: git mirror and per-SHA checkouts (newest 5); `gg-vm-exec.sh` fetches into the same mirror |
| `/var/lib/grindless/exec` | `gg-vm-exec.sh`: one scratch checkout per call (removed afterwards), one slot on this VM |
| `/var/lib/grindless/dumps` | Batch dumps (`<sha12>/`, recipes.json and the rest of `gg_dump`); `latest` points at the newest, exported as `$GG_DUMP` |
| `/var/lib/grindless/artifacts` | `gg-vm-run.sh`: results kept 14 days |
| `/var/lib/grindless/backups`, `inventory`, `/srv` | Leisure archive: never touched by the bench or its scripts |
| `/srv/grindless-play` | The owner's live play server (the `releases` pack, README "Run a server"): systemd `grindless-play` (port 25525, RCON 25710 on localhost via `mc-cmd`, `-Xms1G -Xmx6G`, `CPUWeight=1000`, `OOMScoreAdjust=-600`), daily world backup `grindless-play-backup.timer` (04:30 UTC, newest 5 in `backups/`). Only the integrator updates it, after a release: run `backup.sh` (it flushes the save and archives `world`), stop the unit, re-run the packwiz command from README "Run a server", start the unit. Other agents never stop it, kill its JVM or edit it; the bench's ports (25565 and up) and orphan sweep never reach it |
| `/opt/grindless/tools` | Installed copies of `tools/vm/*.sh` |
| `/opt/grindless/runtime` | Node (checksum-verified tarball) |
| `/etc/grindless/bench.env` | This VM's sizing (`GG_BENCH_*`), written once by the bootstrap, then edited by hand |
| `/usr/local/sbin/grindless-egress-budget`, `/var/lib/grindless/egress-budget.json` | Monthly nftables quota controller and its durable accounting; `grindless-egress-budget-sync.timer` saves usage each minute and resets it at the UTC month boundary |
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

The current VM uses `GG_BENCH_SLOTS=1`, `GG_BENCH_RESERVE_MB=1024`, `GG_BENCH_RUN_MAX_MB=6144` and
`GG_EXEC_SLOTS=1`. Do not run a Minecraft bench alongside `grindless-play`. The integrator must stop the play
service with the owner's agreement, run the single server test, then restore the play service even on failure.

Historical measurements on the former 4 vCPU / 31.3 GiB VM (Ubuntu 24.04, JDK 17, 1G/4G heap),
`gg_test_recipe_lookup` server suite:

| Concurrent runs | Wall (all) | Boot each | Peak RSS per JVM | Min MemAvailable | Max load | Result |
|---|---|---|---|---|---|---|
| 1 | 186 s | 77 s | 4.5 GiB | 25.8 GiB | 3.1 | PASS |
| 2 | 233 s | ~134 s | 5.0-5.2 GiB | 20.0 GiB | 7.4 | PASS, PASS |
| 3 | 315 s | 210-219 s | 5.1 GiB | 14.7 GiB | 13.7 | PASS x3 |
| 2 server + 1 client | 393 s | ~162 s | cgroup peaks 5.9 / 5.7 / 7.1 GiB | - | - | PASS x3 (client 347 s of 600) |

Those concurrency figures apply only to the retired 32 GiB VM, not the current play server. A larger VM: re-run
the bootstrap on it (or set `GG_BENCH_SLOTS`), then measure with `-Slots N` before raising `Slots`.

## Client (T3)

The previous VM proved `-Suite client`: HeadlessMC (`headlessmc-launcher-linux-x64`, pinned in `gg-tools.ps1`) under
`xvfb-run`, the real client mod set on real LWJGL with the system Mesa llvmpipe (`LIBGL_ALWAYS_SOFTWARE=1`). The run
proved software GL by the loaded Mesa library and logged `GGTEST|CLIENT-GL|renderer=llvmpipe ...`. The current
8 GiB VM cannot run the required 8 GiB EMI client; choose `-Backend home` for that work.

## Evidence runs

Historical runs on the former validation VM (run ids are the harness `runId`s):

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
- The egress quota survives a clean restart. After an unclean shutdown, its unknown unsaved usage fails closed:
  outbound traffic is blocked for the rest of that UTC month. Use Azure Run Command to inspect accounting before
  restoring any allowance; do not blindly reset the quota. Loopback RCON remains available.
- Health `FAIL` or runs going to home: run the health check, re-run the bootstrap, check `df`, then
  `systemctl --user list-units 'gg-run-*'` for stuck scopes (stop them) and `pgrep -a java`.
- Unrecoverable: rebuild ([rebuild.md](rebuild.md)); the harness falls back to home meanwhile.

## Deregistering

No GitHub runner or service is registered, so there is nothing to deregister. To retire the VM: point
`backends.psd1` `Default` at `home` (or set `$env:GG_BACKEND = 'home'`), then delete the VM.

## Do not

Delete the Leisure backup (`/var/lib/grindless/backups`, `inventory`, `/srv`), remove `azureuser`, break the ssh
alias or `authorized_keys`, put keys or tokens in the repository, or run untrusted PR code on the VM.
