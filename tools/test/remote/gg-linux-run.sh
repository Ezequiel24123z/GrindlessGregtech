#!/usr/bin/env bash
# gg-linux-run.sh <RunId> - Linux entry point of the remote runner (backends with Os = 'linux').
# Uploaded with the other remote scripts to <base>/tools/remote/<hash>/ and started by Invoke-GGTest.ps1.
# Runs Run-GGTest.ps1 under pwsh inside a transient systemd user scope, so the whole run (pwsh, the server JVM and
# any child) shares one memory ceiling and the kernel OOM-kills the run, never the rest of the machine.
# Env (all optional): GG_BASE (default: three levels above this script), GG_MEMORY_MAX (systemd size such as 6500M;
# empty = no scope), GG_MEMORY_SWAP_MAX, GG_NO_SCOPE=1 (run without a scope).
# Output: the runner's own output, plus GGSCOPE|<unit>|... first and GGOOM|<runId>|... when the scope was OOM-killed.
set -u
run="${1:?usage: gg-linux-run.sh <RunId>}"
here="$(cd "$(dirname "$0")" && pwd)"
export GG_BASE="${GG_BASE:-$(cd "$here/../../.." && pwd)}"
max="${GG_MEMORY_MAX:-}"
swap="${GG_MEMORY_SWAP_MAX:-}"
unit="gg-run-$(printf '%s' "$run" | tr -c 'A-Za-z0-9_-' '-')"
cmd=(pwsh -NoProfile -NonInteractive -File "$here/Run-GGTest.ps1" -RunId "$run")

if [ -z "${XDG_RUNTIME_DIR:-}" ] && [ -d "/run/user/$(id -u)" ]; then export XDG_RUNTIME_DIR="/run/user/$(id -u)"; fi

if [ "${GG_NO_SCOPE:-0}" != 1 ] && [ -n "$max" ] && command -v systemd-run >/dev/null 2>&1 \
    && systemctl --user show-environment >/dev/null 2>&1; then
    props=(-p "MemoryMax=$max")
    if [ -n "$swap" ]; then props+=(-p "MemorySwapMax=$swap"); fi
    echo "GGSCOPE|$unit|MemoryMax=$max|MemorySwapMax=${swap:-default}"
    since="$(date '+%Y-%m-%d %H:%M:%S')"
    systemd-run --user --scope --quiet --collect --unit="$unit" "${props[@]}" -- "${cmd[@]}"
    rc=$?
    if [ "$rc" -ne 0 ]; then
        sleep 1
        if journalctl --user -u "$unit.scope" --since "$since" -o cat 2>/dev/null | grep -qi 'oom'; then
            echo "GGOOM|$run|scope $unit was OOM-killed at MemoryMax=$max (exit $rc)"
        fi
    fi
else
    echo "GGSCOPE|none|no memory ceiling (GG_MEMORY_MAX empty, GG_NO_SCOPE=1 or no systemd user manager)"
    "${cmd[@]}"
    rc=$?
fi
exit "$rc"
