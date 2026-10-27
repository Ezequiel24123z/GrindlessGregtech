# CI (GitHub Actions)

Actions runs only what needs no Minecraft, no SSH and no secrets. Minecraft tiers (T1-T3) run on the VM, started by
an agent or the integrator ([architecture.md](architecture.md)).

## Workflows

| Workflow | File | Triggers | Jobs | Typical time |
|---|---|---|---|---|
| T0 | `.github/workflows/t0.yml` | every push, every PR, manual | `tools/Check-Fast.ps1` on `ubuntu-24.04` with Node 22 (static KubeJS load, lang parity, quest lint, zones, analysis suite) | under 1 min |
| Harness | `.github/workflows/harness.yml` | push/PR touching `tools/test/**`, `tools/vm/**`, `tools/Check-Fast.ps1` or itself; manual | `linux`: shellcheck + `Test-LinuxHelpers.ps1` (the VM's runner code); `windows`: `Test-ResourcePolicy.ps1` (home lock policy) | about 1 min |

- Permissions: `contents: read`; checkout with `persist-credentials: false`. Actions are pinned by commit SHA.
- Secrets: none. No workflow uses a secret, an SSH key, the VM address or the home PC.
- Concurrency: one run per workflow and ref (`t0-<ref>`, `harness-<ref>`); a new push cancels the older run.
- Artifacts: T0 uploads `tools/.check-fast/` (full logs) only on failure, kept 14 days. Harness has none.
- The `windows` Harness job is informational (`continue-on-error`): on hosted `windows-2022` the restart dry run's
  fake server never stops within 30 s (runs 40564601817, 40564995189), while it passes on workstations. The home
  bench stays the authority for that test.

## Required and optional checks

Nothing is required yet. Candidates: `T0 (Check-Fast)` (fast, deterministic) and `Linux runner checks`. Keep
`Windows lock policy` optional until the hosted-runner issue is understood.

To make one required: GitHub > Settings > Branches (or Rules > Rulesets) > the protected branch > "Require status
checks to pass" > add the job name exactly as shown above. A path-filtered workflow (Harness) never reports on PRs
that do not touch its paths, so a required Harness check would block those PRs: require T0 only, or remove the path
filter first.

## Why no self-hosted runner on the VM

This repository is public. A self-hosted runner executes workflow code from pull requests, including forks, with the
runner user's rights; on the VM that user has root. So Minecraft runs are not triggered by Actions. If that is ever
wanted: an ephemeral runner in a separate unprivileged user or container, only for `workflow_dispatch` or for pushes
by maintainers, never `pull_request_target` with a checkout of the PR head, and fork PRs requiring approval
(Settings > Actions > "Require approval for all outside collaborators").

## Untrusted pull requests

T0 and Harness run on GitHub-hosted runners with a read-only token and no secrets, so a fork PR can only waste
runner minutes. Validate a PR head on the VM by hand after reading it: `gg-vm-run.sh pull/<n>/head ...`
([usage.md](usage.md#repeating-a-run-validating-a-commit)).
