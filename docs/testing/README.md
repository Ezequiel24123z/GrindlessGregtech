# Testing and validation

VM first, home fallback: every Minecraft run (T1-T3) goes to the Azure Linux VM (backend `azure`). The home PC
(backend `home`) is used only when the VM is down or the run fails before its suite starts. GitHub Actions runs T0.

| Page | Read it for |
|---|---|
| [architecture.md](architecture.md) | T0-T3 flow, who runs what, backends, slots, results, retention, timeouts |
| [usage.md](usage.md) | Commands: health check, T0, each tier, choosing a backend, interrupting, logs, OOM/timeout diagnosis |
| [vm.md](vm.md) | The VM: ssh alias, layout, sizing and measurements, client (T3), reboot, recovery, permissions |
| [ci.md](ci.md) | GitHub Actions workflows, triggers, artifacts, required checks, untrusted PRs |
| [fallback.md](fallback.md) | The home bench: host, paths, when it is used, how to force it |
| [rebuild.md](rebuild.md) | Building an equivalent VM from scratch |

Bench internals (stages, overlay tests, resource policy): [tools/test/README.md](../../tools/test/README.md).
