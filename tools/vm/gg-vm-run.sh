#!/usr/bin/env bash
# gg-vm-run.sh <ref> [Invoke-GGTest args...] - one validation run of a PUSHED commit on this Linux bench.
# Fetches the repo into a mirror, checks the commit out once per SHA (workspaces/src-<sha12>, reused, never edited),
# runs tools/test/Invoke-GGTest.ps1 -Backend local -SkipRefresh from that checkout, keeps the results in
# artifacts/<runId>/ and appends one line to the run log. <ref>: a SHA, branch, tag or pull/<n>/head.
#
#   ssh grindless-vm 'bash /opt/grindless/tools/gg-vm-run.sh main -Commands "kubejs custom_command gg_ping" -WaitForLog "GGTEST\|PING\|PASS"'
#
# Last line: GGCLASS|<runId>|PASS|FAIL|TIMEOUT|OOM|HARNESS|<sha>|<seconds>s|<artifact dir>. Exit: 0 PASS, 1 FAIL or
# TIMEOUT, 2 OOM or HARNESS (as Invoke-GGTest). Env (all optional; /etc/grindless/bench.env may set them too):
#   GG_ROOT (/var/lib/grindless), GG_REPO_URL (the public GitHub repo), GG_ARTIFACT_DAYS (14),
#   GG_WORKSPACE_KEEP (5 newest checkouts), GG_RUN_LOG (/var/log/grindless/runs.log).
set -uo pipefail
# shellcheck disable=SC1090
if [ -r "${GG_BENCH_ENV:-/etc/grindless/bench.env}" ]; then . "${GG_BENCH_ENV:-/etc/grindless/bench.env}"; fi
ROOT="${GG_ROOT:-/var/lib/grindless}"
REPO_URL="${GG_REPO_URL:-https://github.com/Ezequiel24123z/GrindlessGregtech.git}"
KEEP_DAYS="${GG_ARTIFACT_DAYS:-14}"
KEEP_WS="${GG_WORKSPACE_KEEP:-5}"
RUN_LOG="${GG_RUN_LOG:-/var/log/grindless/runs.log}"
ref="${1:?usage: gg-vm-run.sh <ref> [Invoke-GGTest args...]}"
shift
started=$(date +%s)
mirror="$ROOT/workspaces/mirror.git"
runId="vm-$(date -u +%Y%m%d-%H%M%S)-$$"
sha='-'
out='-'

finish() { # <class> <exit code> [note]
    local secs=$(( $(date +%s) - started ))
    local line="GGCLASS|$runId|$1|$sha|${secs}s|$out${3:+|$3}"
    echo "$line"
    printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$line" >> "$RUN_LOG" 2>/dev/null || true
    exit "$2"
}

mkdir -p "$ROOT/workspaces" "$ROOT/artifacts" || finish HARNESS 2 "cannot create $ROOT dirs"

# --- checkout (one at a time; runs themselves are serialised by the harness lock)
exec 9>"$ROOT/workspaces/.lock"
flock -w 900 9 || finish HARNESS 2 "workspace lock busy for 15 min"
if [ -d "$mirror" ]; then
    git -C "$mirror" fetch -q --prune origin '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*' '+refs/pull/*/head:refs/pull/*/head' \
        || finish HARNESS 2 "git fetch failed"
else
    git clone -q --mirror "$REPO_URL" "$mirror" || finish HARNESS 2 "git clone --mirror $REPO_URL failed"
fi
sha=$(git -C "$mirror" rev-parse --verify -q "$ref^{commit}") || { sha='-'; finish HARNESS 2 "unknown ref '$ref'"; }
ws="$ROOT/workspaces/src-${sha:0:12}"
if [ ! -f "$ws/.gg-ready" ]; then
    rm -rf "$ws"
    git clone -q --no-checkout "$mirror" "$ws" && git -C "$ws" -c advice.detachedHead=false checkout -q "$sha" \
        && touch "$ws/.gg-ready" || finish HARNESS 2 "checkout of $sha failed"
fi
touch "$ws"
# keep the newest checkouts only (by last use)
ls -1dt "$ROOT"/workspaces/src-* 2>/dev/null | tail -n +"$((KEEP_WS + 1))" | while read -r old; do
    [ "$old" != "$ws" ] && rm -rf "$old"
done
exec 9>&-

# --- the run
runId="vm-$(date -u +%Y%m%d-%H%M%S)-${sha:0:8}"
out="$ROOT/artifacts/$runId"
mkdir -p "$out"
GG_OUT_ROOT="$ROOT/artifacts" pwsh -NoProfile -NonInteractive -File "$ws/tools/test/Invoke-GGTest.ps1" \
    -Backend local -SkipRefresh -OutDir "$out" "$@" 2>&1 | tee "$out/console.log"
rc=${PIPESTATUS[0]}

# artifacts older than KEEP_DAYS (only run folders this script created)
find "$ROOT/artifacts" -mindepth 1 -maxdepth 1 -type d -name 'vm-*' -mtime +"$KEEP_DAYS" -exec rm -rf {} + 2>/dev/null

if grep -qs '^GGOOM|' "$out/remote-output.log" "$out/console.log"; then finish OOM 2; fi
case "$rc" in
    0) finish PASS 0 ;;
    1) if grep -rqsEi --include='*stages.json' 'did not (boot|stop)[^"]* within|not seen within|timed out after|budget exhausted' "$out"; then
           finish TIMEOUT 1
       fi
       finish FAIL 1 ;;
    *) finish HARNESS 2 "Invoke-GGTest exit $rc" ;;
esac