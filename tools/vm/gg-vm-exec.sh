#!/usr/bin/env bash
# gg-vm-exec.sh <ref> [command...] - runs a Node or PowerShell tool of a PUSHED commit on this VM, so workstations stay
# light: T0, the analysis suite, cost solves and every dump-based tool run here or in Actions (docs/testing/usage.md).
# Fetches into gg-vm-run.sh's mirror, checks the commit out into a scratch workspace (exec/<runId>, objects shared with
# the mirror, removed afterwards unless GG_EXEC_KEEP=1), puts the bench's Node first on PATH, exports GG_DUMP (the
# newest batch dump, dumps/latest) and GG_SHA, and runs the command from the repository root under nice, at most
# GG_EXEC_SLOTS (2) at once. Without a command after <ref>, the command is read from stdin (run by bash), which avoids
# Windows quoting. <ref>: a SHA, branch, tag or pull/<n>/head.
#
#   'pwsh -NoProfile -File tools/Check-Fast.ps1' | ssh grindless-vm "bash /opt/grindless/tools/gg-vm-exec.sh my-branch"
#   'node tools/analysis/reachability.mjs --tier lv --dump $GG_DUMP' | ssh grindless-vm "bash /opt/grindless/tools/gg-vm-exec.sh my-branch"
#
# The command's output goes to stdout; the last line is GGEXEC|<runId>|<exit>|<sha>|<seconds>s.
# Exit: the command's; 2 when the run cannot start (unknown ref, fetch, checkout, no slot within 30 min).
# Env (optional): GG_ROOT (/var/lib/grindless), GG_REPO_URL, GG_EXEC_SLOTS (2), GG_EXEC_KEEP (0), GG_DUMP.
set -uo pipefail
# shellcheck disable=SC1090
if [ -r "${GG_BENCH_ENV:-/etc/grindless/bench.env}" ]; then . "${GG_BENCH_ENV:-/etc/grindless/bench.env}"; fi
ROOT="${GG_ROOT:-/var/lib/grindless}"
REPO_URL="${GG_REPO_URL:-https://github.com/Ezequiel24123z/GrindlessGregtech.git}"
SLOTS="${GG_EXEC_SLOTS:-2}"
ref="${1:?usage: gg-vm-exec.sh <ref> [command...] (or the command on stdin)}"
shift
started=$(date +%s)
mirror="$ROOT/workspaces/mirror.git"
runId="exec-$(date -u +%Y%m%d-%H%M%S)-$$"
sha='-'
scratch=''

finish() { # <exit code> [note]
    local secs=$(( $(date +%s) - started ))
    if [ -n "$scratch" ] && [ "${GG_EXEC_KEEP:-0}" != 1 ]; then rm -rf "$scratch"; fi
    echo "GGEXEC|$runId|$1|$sha|${secs}s${2:+|$2}"
    exit "$1"
}

if [ $# -gt 0 ]; then cmd=$(printf '%q ' "$@"); else cmd=$(tr -d '\r'); fi
[ -n "${cmd//[[:space:]]/}" ] || finish 2 "no command"

mkdir -p "$ROOT/workspaces" "$ROOT/exec" "$ROOT/dumps" || finish 2 "cannot create $ROOT dirs"

# --- fetch (the same lock as gg-vm-run.sh)
exec 9>"$ROOT/workspaces/.lock"
flock -w 900 9 || finish 2 "workspace lock busy for 15 min"
if [ -d "$mirror" ]; then
    git -C "$mirror" fetch -q --prune origin '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*' '+refs/pull/*/head:refs/pull/*/head' \
        || finish 2 "git fetch failed"
else
    git clone -q --mirror "$REPO_URL" "$mirror" || finish 2 "git clone --mirror $REPO_URL failed"
fi
exec 9>&-
sha=$(git -C "$mirror" rev-parse --verify -q "$ref^{commit}") || { sha='-'; finish 2 "unknown ref '$ref' (push it first)"; }

# --- a slot
got=''
for _ in $(seq 1 1800); do
    for i in $(seq 1 "$SLOTS"); do
        exec 8>"$ROOT/exec/.slot-$i"
        if flock -n 8; then got=$i; break 2; fi
        exec 8>&-
    done
    sleep 1
done
[ -n "$got" ] || finish 2 "no exec slot within 30 min"

# --- scratch checkout and the command
scratch="$ROOT/exec/$runId"
git clone -q --shared --no-checkout "$mirror" "$scratch" && git -C "$scratch" -c advice.detachedHead=false checkout -q "$sha" \
    || finish 2 "checkout of $sha failed"
node_bin=$(find /opt/grindless/runtime -maxdepth 2 -type d -name bin -path '*node-*' 2>/dev/null | sort | tail -n 1)
if [ -n "$node_bin" ]; then export PATH="$node_bin:$PATH"; fi
if [ -z "${GG_DUMP:-}" ] && [ -e "$ROOT/dumps/latest" ]; then GG_DUMP=$(readlink -f "$ROOT/dumps/latest"); fi
export GG_DUMP="${GG_DUMP:-}" GG_SHA="$sha"
cd "$scratch" || finish 2 "cd $scratch failed"
nice -n 10 bash -c "$cmd"
finish $?
