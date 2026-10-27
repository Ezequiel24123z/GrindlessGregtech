# Home fallback (backend `home`)

VM first, home fallback. The home PC was the only bench before the VM; it stays intact and is used only when the VM
cannot run the test. Nothing on it was changed or deleted by the VM migration.

| | |
|---|---|
| Host | `ezequiel@192.168.1.150` (LAN, key authentication; `Host` of `home` in `tools/test/backends.psd1`) |
| Bench base | `D:\GregtechGrindless` (`runs\`, `sync\`, `cache\`, `hmc\`, `tools\remote\<hash>\`) |
| OS | Windows, Windows PowerShell 5.1 (no `&&`), OpenSSH server, cmd as the ssh shell |
| Requirements | Java 17 for the server and client; GPU or Mesa for the client (the harness downloads HeadlessMC and Mesa into the base) |
| Concurrency | One Minecraft JVM globally (`Slots = 1`; named mutex plus `runs\.lock`) |
| Suites | server, client, both |

## When it runs

Automatically (`GGFALLBACK|azure|home|<reason>` and `backend: home (fallback from azure: ...)` in the summary):

- the VM is unreachable or its bench base is missing (ssh probe fails);
- the upload to the VM fails;
- the VM's runner dies before any suite stage started (only extract/lock, no results).

Never for a test FAIL, a timeout, an OOM kill, a busy VM (all slots taken past `-LockWaitMin`) or a run interrupted
after its suite started: those are results of the VM run. A fallback run never falls back again.

## Using it on purpose

- One run: `-Backend home`. Every run from a shell: `$env:GG_BACKEND = 'home'`.
- Back to the old bench as the default for a while (VM retired or rebuilding): `Default = 'home'` in
  `tools/test/backends.psd1`, or the same key in an untracked `tools/test/backends.local.psd1`.
- Never fall back (for example to measure the VM): `-NoFallback` or `$env:GG_NO_FALLBACK = '1'`.

The home bench is shared and runs one JVM: do not start, stop or kill anything there while another agent's run may
be active; the harness lock queues runs on its own.

## What still depends on it

Nothing by default: server and client suites both run on the VM ([vm.md](vm.md#client-t3)). It is the fallback for
both. The Windows lock-policy regression (`Test-ResourcePolicy.ps1`) is still authoritative only on Windows
workstations ([ci.md](ci.md)).
