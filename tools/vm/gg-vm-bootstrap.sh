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
# GG_LINGER=0 (skip loginctl enable-linger). Nothing is sized for a particular VM: sizing is derived from its RAM.
# A new VM from scratch: docs/testing/rebuild.md.
set -euo pipefail
USER_NAME="${GG_USER:-$(id -un)}"
NODE_VERSION="${GG_NODE_VERSION:-v24.22.1}"
NODE_DIR=/opt/grindless/runtime/node-$NODE_VERSION-linux-x64
DRY="${GG_BOOTSTRAP_DRY:-0}"

step() { echo "BOOTSTRAP|$1|$2"; }
run() { if [ "$DRY" = 1 ]; then echo "  would run: $*"; else "$@"; fi; }

. /etc/os-release
[ "$ID" = ubuntu ] || { step os FAIL "only Ubuntu is supported (found $ID $VERSION_ID)"; exit 1; }
sudo -n true || { step sudo FAIL "passwordless sudo is required"; exit 1; }

# --- packages (Java 17, tools; Xvfb and Mesa only for the experimental Linux client)
pkgs=(openjdk-17-jdk-headless git git-lfs unzip zip curl rsync jq xvfb libgl1-mesa-dri ca-certificates)
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
benv=/etc/grindless/bench.env
total_mb=$(( $(awk '/^MemTotal:/ {print $2}' /proc/meminfo) / 1024 ))
rec_max="$(( total_mb - ${GG_BENCH_RESERVE_MB:-1228} ))M"
if [ ! -f "$benv" ]; then
  step bench-env CHANGE "$benv: GG_BENCH_MEMORY_MAX=$rec_max (RAM ${total_mb}M minus ${GG_BENCH_RESERVE_MB:-1228}M), swap 2G"
  if [ "$DRY" != 1 ]; then
    printf '# Grindless bench sizing, sourced by gg-linux-run.sh. Only GG_BENCH_* keys.\n# Written by gg-vm-bootstrap.sh for %s MiB of RAM; re-run it after a resize only after deleting this file.\nGG_BENCH_MEMORY_MAX=%s\nGG_BENCH_MEMORY_SWAP_MAX=2G\n' \
      "$total_mb" "$rec_max" | sudo -n tee "$benv" >/dev/null
  fi
else
  step bench-env OK "$(grep -h '^GG_BENCH_MEMORY_MAX=' "$benv" || echo "$benv present") (recommended now: $rec_max)"
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
