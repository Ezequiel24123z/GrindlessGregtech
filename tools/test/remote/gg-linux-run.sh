#!/usr/bin/env bash
# gg-linux-run.sh <RunId> - Linux entry point of the remote runner (backends with Os = 'linux').
# Uploaded with the other remote scripts to <base>/tools/remote/<hash>/ and started by Invoke-GGTest.ps1.
# Runs Run-GGTest.ps1 under pwsh inside a transient systemd user scope, so the whole run (pwsh, the server JVM and
# any child) shares one memory ceiling and the kernel OOM-kills the run, never the rest of the machine.
# Env (all optional): GG_BASE (default: three levels above this script), GG_MEMORY_MAX / GG_MEMORY_SWAP_MAX (systemd
# sizes such as 6500M, set by the caller to force a value), GG_NO_SCOPE=1 (run without a scope).
# Sizing without a caller value: GG_BENCH_MEMORY_MAX / GG_BENCH_MEMORY_SWAP_MAX from /etc/grindless/bench.env
# (gg-vm-bootstrap.sh writes it), else MemTotal minus GG_BENCH_RESERVE_MB (default 1228) and swap 2G.
# Output: the runner's own output, plus GGSCOPE|<unit>|... first and GGOOM|<runId>|... when the scope was OOM-killed.
set -u
run="${1:?usage: gg-linux-run.sh <RunId>}"
here="$(cd "$(dirname "$0")" && pwd)"
export GG_BASE="${GG_BASE:-$(cd "$here/../../.." && pwd)}"
bench_env="${GG_BENCH_ENV:-/etc/grindless/bench.env}"
# shellcheck disable=SC1090
if [ -r "$bench_env" ]; then . "$bench_env"; fi
max="${GG_MEMORY_MAX:-${GG_BENCH_MEMORY_MAX:-}}"
if [ -z "$max" ]; then
    total_mb=$(( $(awk '/^MemTotal:/ {print $2}' /proc/meminfo) / 1024 ))
    max="$(( total_mb - ${GG_BENCH_RESERVE_MB:-1228} ))M"
fi
swap="${GG_MEMORY_SWAP_MAX:-${GG_BENCH_MEMORY_SWAP_MAX:-2G}}"
unit="gg-run-$(printf '%s' "$run" | tr -c 'A-Za-z0-9_-' '-')"
cmd=(pwsh -NoProfile -NonInteractive -File "$here/Run-GGTest.ps1" -RunId "$run")

if [ -z "${XDG_RUNTIME_DIR:-}" ] && [ -d "/run/user/$(id -u)" ]; then export XDG_RUNTIME_DIR="/run/user/$(id -u)"; fi

if [ "${GG_NO_SCOPE:-0}" != 1 ] && command -v systemd-run >/dev/null 2>&1 \
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
    echo "GGSCOPE|none|MemoryMax=$max not applied (GG_NO_SCOPE=1 or no systemd user manager)"
    "${cmd[@]}"
    rc=$?
fi
exit "$rc"