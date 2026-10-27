# Validation backends for tools/test/Invoke-GGTest.ps1 -Backend <name> (or $env:GG_BACKEND).
# Only what differs per host lives here; the harness is shared. No secrets: hosts are ssh aliases or user@ip,
# keys stay in each machine's ~/.ssh. Architecture: docs/testing/architecture.md; usage: docs/testing/usage.md.
# Per-machine overrides (a different VM size, another alias) go in an untracked backends.local.psd1 next to this
# file, same shape, only the keys that change; -RemoteHost/-RemoteBase override Host/Base for one run.
@{
    # Used when neither -Backend nor $env:GG_BACKEND is given. VM first: the home PC is only the fallback.
    Default  = 'azure'

    Backends = @{
        # Linux bench VM (Ubuntu 24.04, provisioned by tools/vm/gg-vm-bootstrap.sh). Host is an ssh alias that each
        # workstation maps to the current VM in ~/.ssh/config (docs/testing/vm.md), so a rebuilt VM changes no file here.
        azure = @{
            Transport     = 'ssh'
            Host          = 'grindless-vm'
            Os            = 'linux'
            Base          = '/var/lib/grindless/bench'
            # client = HeadlessMC (linux-x64) under Xvfb on the distribution's Mesa llvmpipe (docs/testing/vm.md#client-t3)
            Suites        = @('server', 'client', 'both')
            # Memory ceiling of the transient systemd scope the whole run starts in (gg-linux-run.sh). Empty = the VM
            # sizes it: GG_BENCH_MEMORY_MAX in its /etc/grindless/bench.env (written by gg-vm-bootstrap.sh), else
            # min((RAM - GG_BENCH_RESERVE_MB (1228)) / Slots, GG_BENCH_RUN_MAX_MB (12288)). Set a value (e.g. '10G') only to
            # force one from this side (or in backends.local.psd1).
            MemoryMax     = ''
            MemorySwapMax = ''
            # Concurrent server JVMs (one slot per run, own ports and run dir, MemoryMax = (RAM - reserve) / Slots up to
            # the per-run cap). Measured on the 4 vCPU / 32 GiB VM: 3 runs at once (server or client) pass with about 2x
            # timeout headroom and 15 GiB free; CPU is the limit (docs/testing/vm.md#sizing). Size it to the VM you use.
            Slots         = 3
            # Backend that runs instead when this one is unreachable or fails before the suite starts (never after a
            # real test FAIL). -NoFallback disables it for one run.
            Fallback      = 'home'
        }
        # Home bench PC (Windows, PowerShell 5.1): fallback only, one Minecraft JVM globally. docs/testing/fallback.md.
        home  = @{
            Transport = 'ssh'
            Host      = 'ezequiel@192.168.1.150'
            Os        = 'windows'
            Base      = 'D:\GregtechGrindless'
            Suites    = @('server', 'client', 'both')
            Slots     = 1
        }
        # The runner on this machine, no ssh (used on the VM by tools/vm/gg-vm-run.sh). Base: $env:GG_BASE, else these.
        local = @{
            Transport     = 'local'
            BaseLinux     = '/var/lib/grindless/bench'
            BaseWindows   = 'D:\GregtechGrindless'
            Suites        = @('server', 'client', 'both')
            MemoryMax     = ''
            MemorySwapMax = ''
        }
    }
}
