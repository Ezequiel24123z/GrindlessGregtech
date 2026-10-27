#!/usr/bin/env bash
# gg-vm-health.sh - health check of a Linux validation host (the Azure VM `grindless-vm`).
# Read-only: never starts, stops or deletes anything. Safe to run at any time, also while a test is running.
#
#   ssh grindless-vm 'bash -s' < tools/vm/gg-vm-health.sh          # from a workstation (Linux, Git Bash)
#   Get-Content -Raw tools\vm\gg-vm-health.sh | ssh grindless-vm "tr -d '\r' | bash -s"   # Windows PowerShell
#   bash tools/vm/gg-vm-health.sh                                    # on the VM
#   GG_HEALTH_OFFLINE=1 ...                                          # skip the network checks
#
# Output: one line per check, `HEALTH|<check>|OK|WARN|FAIL|<detail>`, then `GGHEALTH|<host>|PASS|WARN|FAIL|...`.
# Exit 0 = PASS or WARN (usable), 1 = FAIL (do not start a test run).
set -u
BASE="${GG_BASE:-/var/lib/grindless/bench}"
ROOT=/var/lib/grindless
MIN_FREE_GB="${GG_HEALTH_MIN_FREE_GB:-10}"
WARN_FREE_GB="${GG_HEALTH_WARN_FREE_GB:-20}"
fails=0; warns=0

say() { # check status detail
  printf 'HEALTH|%s|%s|%s\n' "$1" "$2" "$3"
  case "$2" in FAIL) fails=$((fails + 1)) ;; WARN) warns=$((warns + 1)) ;; esac
}
have() { command -v "$1" >/dev/null 2>&1; }
gib() { awk -v k="$1" 'BEGIN{printf "%.1f", k/1048576}'; }

# --- host
say host OK "$(hostname), $(. /etc/os-release && echo "$PRETTY_NAME"), kernel $(uname -r), $(nproc) vCPU, $(uptime -p 2>/dev/null), load $(cut -d' ' -f1-3 /proc/loadavg)"
failed_units=$(systemctl --failed --no-legend --plain 2>/dev/null | awk '{print $1}' | tr '\n' ' ')
if [ -n "$failed_units" ]; then say systemd WARN "failed units: $failed_units"; else say systemd OK "$(systemctl is-system-running 2>/dev/null)"; fi
if timedatectl show -p NTPSynchronized --value 2>/dev/null | grep -qx yes; then say clock OK "NTP synchronized"; else say clock WARN "clock not NTP synchronized"; fi
if sudo -n true 2>/dev/null; then say sudo OK "passwordless sudo"; else say sudo WARN "no passwordless sudo (bootstrap and the kernel journal need it)"; fi

# --- memory (diagnostic only: available RAM never gates a launch)
read -r mt ma st sf < <(awk '/^MemTotal/{t=$2}/^MemAvailable/{a=$2}/^SwapTotal/{s=$2}/^SwapFree/{f=$2}END{print t,a,s,f}' /proc/meminfo)
if [ "$ma" -lt $((5 * 1048576)) ]; then s=WARN; else s=OK; fi
say memory "$s" "$(gib "$ma") GiB available of $(gib "$mt") GiB"
if [ "$st" -gt 0 ]; then say swap OK "$(gib "$st") GiB, $(gib $((st - sf))) GiB used, swappiness $(cat /proc/sys/vm/swappiness)"; else say swap WARN "no swap"; fi
if grep -qw memory /sys/fs/cgroup/cgroup.controllers 2>/dev/null; then say cgroup OK "cgroup v2 with the memory controller"; else say cgroup WARN "no cgroup v2 memory controller: runs are not memory-contained"; fi
if systemctl --user show-environment >/dev/null 2>&1; then say user-systemd OK "user manager reachable (memory scope available)"; else say user-systemd WARN "no user systemd manager: runs start without a memory scope"; fi

# --- disk and directories
if [ -d "$ROOT" ]; then
  free_g=$(( $(df -Pk "$ROOT" | awk 'NR==2{print $4}') / 1048576 ))
  if [ "$free_g" -lt "$MIN_FREE_GB" ]; then s=FAIL; elif [ "$free_g" -lt "$WARN_FREE_GB" ]; then s=WARN; else s=OK; fi
  say disk "$s" "${free_g} GB free on $(df -P "$ROOT" | awk 'NR==2{print $6}') (fail < ${MIN_FREE_GB}, warn < ${WARN_FREE_GB})"
else
  say disk FAIL "$ROOT is missing (run tools/vm/gg-vm-bootstrap.sh)"
fi
for d in "$BASE" "$ROOT/workspaces" "$ROOT/artifacts" /var/cache/grindless /var/log/grindless; do
  if [ ! -d "$d" ]; then say "dir:$d" FAIL "missing (run tools/vm/gg-vm-bootstrap.sh)"
  elif [ ! -w "$d" ]; then say "dir:$d" FAIL "not writable by $(id -un)"
  else say "dir:$d" OK "writable, $(du -sh "$d" 2>/dev/null | cut -f1)"; fi
done
if [ -d "$ROOT/backups/leisure" ]; then say leisure-backup OK "present (the harness never touches it)"; else say leisure-backup WARN "$ROOT/backups/leisure not found"; fi

# --- tools
if have java; then
  jv=$(java -version 2>&1 | head -1)
  if echo "$jv" | grep -q '"17\.'; then say java OK "$jv"; else say java FAIL "need Java 17: $jv"; fi
else say java FAIL "java not on PATH (apt install openjdk-17-jdk-headless)"; fi
if have pwsh; then
  pv=$(pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' 2>/dev/null)
  case "$pv" in 7.*) say pwsh OK "PowerShell $pv" ;; *) say pwsh FAIL "need PowerShell 7: '$pv'" ;; esac
else say pwsh FAIL "pwsh not on PATH"; fi
if have node; then
  nv=$(node -v); nmaj=${nv#v}; nmaj=${nmaj%%.*}
  if [ "$nmaj" -ge 18 ]; then say node OK "$nv ($(command -v node))"; else say node FAIL "need Node >= 18: $nv"; fi
else say node FAIL "node not on PATH"; fi
if have git; then say git OK "$(git --version)"; else say git FAIL "git missing"; fi
for t in unzip zip curl systemd-run; do have "$t" || say "tool:$t" FAIL "$t missing"; done
if have Xvfb; then say xvfb OK "present (only the experimental Linux client uses it)"; else say xvfb WARN "Xvfb missing (only the Linux client needs it)"; fi

# --- network
if [ "${GG_HEALTH_OFFLINE:-0}" != 1 ]; then
  for h in github.com maven.minecraftforge.net edge.forgecdn.net cdn.modrinth.com piston-meta.mojang.com; do
    if ! getent hosts "$h" >/dev/null; then say "dns:$h" FAIL "does not resolve"; continue; fi
    code=$(curl -sS -o /dev/null -m 15 -w '%{http_code}' "https://$h/" 2>/dev/null) || code=000
    if [ "$code" = 000 ]; then say "net:$h" FAIL "no HTTPS connection"; else say "net:$h" OK "HTTPS $code"; fi
  done
fi

# --- bench state: lock holder and stray JVMs
holder=''
if [ -f "$BASE/runs/.lock" ]; then
  pid=$(sed -n 's/.*"pid"[^0-9]*\([0-9][0-9]*\).*/\1/p' "$BASE/runs/.lock" | head -1)
  run=$(sed -n 's/.*"runId"[^"]*"\([^"]*\)".*/\1/p' "$BASE/runs/.lock" | head -1)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then say lock OK "busy: run $run (pid $pid)"; holder=$run
  else say lock WARN "stale lock of run $run (pid $pid is gone): the next run reclaims it"; fi
else
  say lock OK "free"
fi
stray=''
while read -r pid cmd; do
  [ -z "$pid" ] && continue
  rid=$(printf '%s' "$cmd" | sed -n 's/.*-Dgg\.run=\([A-Za-z0-9._-]*\).*/\1/p')
  [ -z "$rid" ] && rid=$(printf '%s' "$cmd" | sed -n 's#.*/runs/\([A-Za-z0-9._-]*\)/.*#\1#p')
  if [ -n "$holder" ] && [ "$rid" = "$holder" ]; then continue; fi
  stray="$stray $pid(${rid:-?})"
done < <(pgrep -a java 2>/dev/null | grep -E -- "-Dgg\.run=|$BASE/" || true)
if [ -n "$stray" ]; then say jvm WARN "harness JVMs with no lock holder:$stray (the next run kills them)"
else njava=$(pgrep -c java 2>/dev/null); say jvm OK "no stray harness JVM (${njava:-0} java process(es) in total)"; fi
ports=$(ss -ltn 2>/dev/null | awk 'NR>1{print $4}' | grep -E ':(25565|25575)$' | tr '\n' ' ')
if [ -n "$ports" ] && [ -z "$holder" ]; then say ports WARN "Minecraft/RCON port in use with no run: $ports"; else say ports OK "${ports:-25565/25575 free}"; fi

# --- logs
klog=$(journalctl -k --since '-24h' --no-pager 2>/dev/null || sudo -n journalctl -k --since '-24h' --no-pager 2>/dev/null) || klog=''
if [ -n "$klog" ]; then
  ooms=$(printf '%s\n' "$klog" | grep -c -i -E 'out of memory|oom-kill')
  if [ "$ooms" -gt 0 ]; then say oom WARN "$ooms kernel OOM line(s) in the last 24 h (journalctl -k)"; else say oom OK "no kernel OOM in the last 24 h"; fi
else say oom WARN "kernel journal not readable"; fi

if [ "$fails" -gt 0 ]; then verdict=FAIL; elif [ "$warns" -gt 0 ]; then verdict=WARN; else verdict=PASS; fi
echo "GGHEALTH|$(hostname)|$verdict|fail=$fails warn=$warns"
[ "$fails" -eq 0 ]
