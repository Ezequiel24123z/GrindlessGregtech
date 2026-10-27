# Validation backends for tools/test/Invoke-GGTest.ps1 -Backend <name> (or $env:GG_BACKEND).
# Only what differs per host lives here; the harness is shared. No secrets: hosts are ssh aliases or user@ip,
# keys stay in each machine's ~/.ssh. Architecture: docs/testing/architecture.md; usage: docs/testing/usage.md.
# Per-machine overrides (a different VM size, another alias) go in an untracked backends.local.psd1 next to this
# file, same shape, only the keys that change; -RemoteHost/-RemoteBase override Host/Base for one run.
@{
    # Used when neither -Backend nor $env:GG_BACKEND is given.
    Default  = 'home'

    Backends = @{
        # Linux bench VM (Ubuntu 24.04, provisioned by tools/vm/gg-vm-bootstrap.sh). Host is an ssh alias that each
        # workstation maps to the current VM in ~/.ssh/config (docs/testing/vm.md), so a rebuilt VM changes no file here.
        azure = @{
            Transport     = 'ssh'
            Host          = 'grindless-vm'
            Os            = 'linux'
            Base          = '/var/lib/grindless/bench'
            Suites        = @('server')
            # Memory ceiling of the transient systemd scope the whole run starts in (gg-linux-run.sh). Empty = the VM
            # sizes it: GG_BENCH_MEMORY_MAX in its /etc/grindless/bench.env (written by gg-vm-bootstrap.sh), else
            # RAM minus GG_BENCH_RESERVE_MB (1228). Set a value (e.g. '6500M') only to force one from this side.
            MemoryMax     = ''
            MemorySwapMax = ''
        }
        # Home bench PC (Windows, PowerShell 5.1). Fallback: docs/testing/fallback.md.
        home  = @{
            Transport = 'ssh'
            Host      = 'ezequiel@192.168.1.150'
            Os        = 'windows'
            Base      = 'D:\GregtechGrindless'
            Suites    = @('server', 'client', 'both')
        }
        # The runner on this machine, no ssh (used on the VM by tools/vm/gg-vm-run.sh). Base: $env:GG_BASE, else these.
        # Linux runs only the server suite (the client needs the Windows HeadlessMC + Mesa setup).
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
