# Rebuilding the validation VM from scratch

For a lost, broken or resized VM. The harness falls back to the home PC meanwhile ([fallback.md](fallback.md)), or
set `Default = 'home'` in an untracked `tools/test/backends.local.psd1` until the new VM passes step 6.

## 1. Create the VM

- Ubuntu 24.04 LTS, x64. Measured reference: 4 vCPU, 32 GiB RAM, 64 GB disk runs 3 suites at once
  ([vm.md](vm.md#sizing)). The minimum for one server run is 2 vCPU and 8 GiB; CPU decides how many run at once.
- Admin user `azureuser` with ssh key authentication only, and passwordless sudo (Azure images give this by default;
  elsewhere: `echo 'azureuser ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/90-azureuser`).
- Inbound: ssh only, ideally limited to the workstations' addresses. Minecraft ports stay closed: runs use loopback.

## 2. Access (outside the repository)

On each workstation, add the alias to `~/.ssh/config` (or use the access bundle the user hands out):

```
Host grindless-vm
    HostName <VM address>
    User azureuser
    IdentityFile ~/.ssh/<your key>
    IdentitiesOnly yes
```

Accept and pin the host key once (`ssh grindless-vm true`). Another alias name: `Host` of `azure` in
`tools/test/backends.local.psd1`. Never commit the address, keys, host keys or the bundle.

## 3. Bootstrap

```powershell
Get-Content -Raw tools\vm\gg-vm-bootstrap.sh | ssh grindless-vm "tr -d '\r' | bash -s"
```

Linux or macOS: `ssh grindless-vm 'bash -s' < tools/vm/gg-vm-bootstrap.sh`. Preview with `GG_BOOTSTRAP_DRY=1`.
It prints one `BOOTSTRAP|<step>|OK/CHANGE/FAIL` line per step and can be re-run at any time. Sizing knobs
(`GG_BENCH_SLOTS`, `GG_BENCH_RESERVE_MB`, `GG_BENCH_RUN_MAX_MB`) are in its header; it writes them once to
`/etc/grindless/bench.env`.

## 4. Install the VM scripts

```powershell
scp tools/vm/gg-vm-bootstrap.sh tools/vm/gg-vm-health.sh tools/vm/gg-vm-run.sh grindless-vm:/opt/grindless/tools/
ssh grindless-vm "chmod +x /opt/grindless/tools/*.sh; /opt/grindless/tools/gg-vm-health.sh"
```

Health must show no `FAIL`; `leisure-backup not found` is an expected `WARN` on a bench-only VM.

## 5. Slots

Set `Slots` of `azure` in `tools/test/backends.psd1` (or `backends.local.psd1`) to the same value as
`GG_BENCH_SLOTS` in the VM's `bench.env`. On a different size, measure before raising it: run N server suites at
once and keep N only if every run passes without OOM, with timeout headroom and free memory left
([vm.md](vm.md#sizing) shows how it was measured).

## 6. Prove it

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Backend azure -NoFallback -Suite server `
    -Commands 'kubejs custom_command gg_ping' -WaitForLog 'GGTEST\|PING\|PASS'powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Backend azure -NoFallback -Suite client
```

Both must `PASS` with `backend: azure` in the summary. The first run downloads mods, Forge and HeadlessMC (several
minutes). Then reboot once and repeat the health check and the server run (linger keeps the user manager up).

## Never version

`~/.ssh/config`, keys, host keys, the access bundle, `/etc/grindless/bench.env`, `tools/test/backends.local.psd1`,
VM addresses and tokens.
