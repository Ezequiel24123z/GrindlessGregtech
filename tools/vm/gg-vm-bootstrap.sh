#!/usr/bin/env bash
# gg-vm-bootstrap.sh - prepares (or repairs) a Ubuntu 24.04 host as a Grindless validation bench.
# Idempotent: every step checks first and changes only what is missing. Needs passwordless sudo.
# It never touches /var/lib/grindless/backups, /var/lib/grindless/inventory or /srv (the Leisure archive).
#
#   ssh grindless-vm 'bash -s' < tools/vm/gg-vm-bootstrap.sh
#   Get-Content -Raw tools\vm\gg-vm-bootstrap.sh | ssh grindless-vm "tr -d '\r' | bash -s"   # Windows PowerShell
#   GG_BOOTSTRAP_DRY=1 ...      # print what would change, change nothing
#
# Env: GG_USER (bench user, default: you), GG_NODE_VERSION, GG_BENCH_RESERVE_MB (RAM kept for the OS, default 1228),
# GG_BENCH_RUN_MAX_MB (memory ceiling of one run, default 12288), GG_BENCH_SLOTS (concurrent server JVMs, default 1),
# GG_LINGER=0 (skip loginctl enable-linger). Nothing is sized for a particular VM: each run's ceiling is computed at
# launch as min((RAM - reserve) / slots, per-run cap) from this VM's RAM.
# A new VM from scratch: docs/testing/rebuild.md.
set -euo pipefail
USER_NAME="${GG_USER:-$(id -un)}"
NODE_VERSION="${GG_NODE_VERSION:-v24.22.1}"
NODE_DIR=/opt/grindless/runtime/node-$NODE_VERSION-linux-x64
DRY="${GG_BOOTSTRAP_DRY:-0}"

step() { echo "BOOTSTRAP|$1|$2${3:+|$3}"; }
run() { if [ "$DRY" = 1 ]; then echo "  would run: $*"; else "$@"; fi; }

. /etc/os-release
[ "$ID" = ubuntu ] || { step os FAIL "only Ubuntu is supported (found $ID $VERSION_ID)"; exit 1; }
sudo -n true || { step sudo FAIL "passwordless sudo is required"; exit 1; }

# --- packages (Java 17, tools; the client suite (T3) needs Xvfb, Mesa llvmpipe and the X11 libraries GLFW loads)
pkgs=(openjdk-17-jdk-headless git git-lfs unzip zip curl rsync jq ca-certificates
      xvfb xauth libgl1 libgl1-mesa-dri libglx-mesa0 libegl1 mesa-utils libxcursor1 libxinerama1 libxi6 libxrandr2 libxxf86vm1 libxtst6)
missing=()
for p in "${pkgs[@]}"; do dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q 'ok installed' || missing+=("$p"); done
if [ ${#missing[@]} -gt 0 ]; then
  step apt CHANGE "installing ${missing[*]}"
  run sudo -n apt-get update -q
  run sudo -n DEBIAN_FRONTEND=noninteractive apt-get install -y -q --no-install-recommends "${missing[@]}"
else
  step apt OK "all packages present"
fi

# --- PowerShell 7 from the Microsoft package repository
if ! command -v pwsh >/dev/null; then
  step pwsh CHANGE "adding packages.microsoft.com and installing powershell"
  if [ ! -f /etc/apt/sources.list.d/microsoft-prod.list ]; then
    tmp=$(mktemp -d)
    run curl -fsSL -o "$tmp/ms.deb" "https://packages.microsoft.com/config/ubuntu/$VERSION_ID/packages-microsoft-prod.deb"
    run sudo -n dpkg -i "$tmp/ms.deb"
    rm -rf "$tmp"
  fi
  run sudo -n apt-get update -q
  run sudo -n DEBIAN_FRONTEND=noninteractive apt-get install -y -q powershell
else
  step pwsh OK "$(pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')"
fi

# --- Node (official tarball, checksum verified against SHASUMS256.txt)
if [ ! -x "$NODE_DIR/bin/node" ]; then
  step node CHANGE "installing Node $NODE_VERSION in $NODE_DIR"
  tmp=$(mktemp -d)
  tar="node-$NODE_VERSION-linux-x64.tar.xz"
  run curl -fsSL -o "$tmp/$tar" "https://nodejs.org/dist/$NODE_VERSION/$tar"
  run curl -fsSL -o "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/$NODE_VERSION/SHASUMS256.txt"
  if [ "$DRY" != 1 ]; then
    (cd "$tmp" && grep " $tar\$" SHASUMS256.txt | sha256sum -c -) || { step node FAIL "checksum mismatch"; exit 1; }
    sudo -n mkdir -p /opt/grindless/runtime
    sudo -n tar -xJf "$tmp/$tar" -C /opt/grindless/runtime
    sudo -n chown -R "$USER_NAME:$USER_NAME" /opt/grindless/runtime
  fi
  rm -rf "$tmp"
else
  step node OK "$("$NODE_DIR/bin/node" -v)"
fi
if [ "$(readlink -f /usr/local/bin/node 2>/dev/null)" != "$NODE_DIR/bin/node" ]; then
  step node-link CHANGE "/usr/local/bin/node -> $NODE_DIR/bin/node"
  run sudo -n ln -sfn "$NODE_DIR/bin/node" /usr/local/bin/node
fi

# --- directories owned by the bench user
for d in /var/lib/grindless/bench /var/lib/grindless/workspaces /var/lib/grindless/artifacts \
         /var/cache/grindless /var/log/grindless /etc/grindless /opt/grindless/tools; do
  if [ ! -d "$d" ] || [ "$(stat -c %U "$d")" != "$USER_NAME" ]; then
    step "dir:$d" CHANGE "create, owner $USER_NAME"
    run sudo -n mkdir -p "$d"
    run sudo -n chown "$USER_NAME:$USER_NAME" "$d"
  else
    step "dir:$d" OK "present"
  fi
done

# --- open-file limit for the bench user (Minecraft with ~300 mods opens many jars)
lim=/etc/security/limits.d/90-grindless.conf
if [ ! -f "$lim" ]; then
  step nofile CHANGE "nofile 65536 for $USER_NAME in $lim (new ssh sessions)"
  if [ "$DRY" != 1 ]; then printf '%s soft nofile 65536\n%s hard nofile 65536\n' "$USER_NAME" "$USER_NAME" | sudo -n tee "$lim" >/dev/null; fi
else
  step nofile OK "$lim present"
fi

# --- bench sizing for this VM (read by gg-linux-run.sh; edit the file to change it, a re-run never overwrites it)
# Only the inputs are stored: each run's MemoryMax is computed at launch as min((RAM - reserve) / slots, per-run cap).
benv=/etc/grindless/bench.env
total_mb=$(( $(awk '/^MemTotal:/ {print $2}' /proc/meminfo) / 1024 ))
reserve_mb="${GG_BENCH_RESERVE_MB:-1228}"
run_max_mb="${GG_BENCH_RUN_MAX_MB:-12288}"
bench_slots="${GG_BENCH_SLOTS:-1}"
rec_mb=$(( (total_mb - reserve_mb) / bench_slots ))
if [ "$rec_mb" -gt "$run_max_mb" ]; then rec_mb=$run_max_mb; fi
if [ ! -f "$benv" ]; then
  step bench-env CHANGE "$benv: slots $bench_slots, reserve ${reserve_mb}M, per-run cap ${run_max_mb}M (MemoryMax per run now ${rec_mb}M of ${total_mb}M), swap 2G"
  if [ "$DRY" != 1 ]; then
    printf '%s\n' \
      '# Grindless bench settings, sourced by gg-linux-run.sh (GG_BENCH_* sizing) and gg-vm-run.sh (optional GG_ROOT,' \
      '# GG_REPO_URL, GG_ARTIFACT_DAYS, GG_WORKSPACE_KEEP, GG_RUN_LOG). Plain KEY=VALUE lines, no secrets.' \
      "# Written by gg-vm-bootstrap.sh on a ${total_mb} MiB host. Per-run MemoryMax = min((RAM - reserve) / slots, cap)." \
      "GG_BENCH_SLOTS=$bench_slots" \
      "GG_BENCH_RESERVE_MB=$reserve_mb" \
      "GG_BENCH_RUN_MAX_MB=$run_max_mb" \
      'GG_BENCH_MEMORY_SWAP_MAX=2G' \
      '# GG_BENCH_MEMORY_MAX=8192M   # optional fixed per-run ceiling; overrides the computed one' \
      | sudo -n tee "$benv" >/dev/null
  fi
else
  step bench-env OK "$(grep -h '^GG_BENCH_\(SLOTS\|MEMORY_MAX\)=' "$benv" | tr '\n' ' ' || true)(per-run MemoryMax for $bench_slots slot(s) now: ${rec_mb}M)"
fi

# --- user systemd manager without a login session (the run's memory scope lives in it)
if [ "${GG_LINGER:-1}" = 1 ]; then
  if [ "$(loginctl show-user "$USER_NAME" -p Linger --value 2>/dev/null)" != yes ]; then
    step linger CHANGE "loginctl enable-linger $USER_NAME"
    run sudo -n loginctl enable-linger "$USER_NAME"
  else
    step linger OK "enabled"
  fi
fi

step 'done' OK "now run tools/vm/gg-vm-health.sh"
