---
applyTo: "pack/pack.toml,pack/index.toml,pack/mods/**,pack/.gitattributes,tools/Update-PackIndex.ps1,tools/Get-Packwiz.ps1,tools/prism/**,docs/STATUS.md"
---
# Release, packwiz and the releases channel (integrator only)

## packwiz
- packwiz has no releases; download it from `https://nightly.link/packwiz/packwiz/workflows/go/main/Windows%2064-bit.zip` (`tools/Get-Packwiz.ps1`).
- Adding a pinned mod: `packwiz mr add <version URL>`, then check the `side` in its `.pw.toml`. A mod addition is its own package.
- CurseForge: only mods that allow distribution, or that have an official download URL.
- `pack/index.toml` and the index hash in `pack/pack.toml` are generated: `tools/Update-PackIndex.ps1` (normalizes text, then `packwiz refresh`). Never edited by hand. Run once per integration batch, after the last merge, by the integrator.

## Generated files and the batch
- Integrator-owned, regenerated once per batch: `pack/index.toml`, `pack/pack.toml`, `pack/kubejs/data/grindless/tables/hidden_until.json` (`tools/analysis/Invoke-Reachability.ps1`, obtain pass; edit `tools/analysis/tiers/obtain.json`), generated quest chapters (`quests.instructions.md`).
- Exception: `tools/test/overlay/kubejs/config/gg_test_emi_coverage_expect.json` (`node tools/analysis/emi-coverage.mjs --expect`). A package may regenerate it, because T0 fails while it is stale. On a merge conflict, the integrator takes either side and regenerates it.
- Shared, hand-edited: `tools/analysis/tiers/*.json`, `tools/analysis/emi_coverage.json`, `pack/kubejs/assets/grindless/lang/*.json`, `client_scripts/grindless/emi_info_lang.js`. A package edits them only when its contract lists them.
- A batch: merge packages in dependency order, regenerate, run T2, then update `docs/STATUS.md` (last accepted batch, next package). DECISIONS and CREDITS lines proposed in handoffs are appended here.
- Before regenerating quests or tagging, run the gate and eras passes for every implemented tier on the batch dump (`node tools/analysis/reachability.mjs --tier <t> --dump <d>`, steam up to the implemented era). The obtain pass and `recipe-cycles.mjs` do not see per-era inversions or research deadlocks; a gate FAIL blocks the release.

## Versions
- Before tagging `vX.Y.Z`, bump `version` in `pack/pack.toml` and run `tools/Update-PackIndex.ps1`. Only what has passed the tier's tests gets tagged.

## Releases channel
- The user plays while development goes on. `releases` only advances to a tested `vX.Y.Z` tag: `git push origin vX.Y.Z^{commit}:refs/heads/releases`. During the transition, move `playable` to the same commit too (`...:refs/heads/playable`); retire it once old instances have moved. `jugable` is deleted.
- When moving it, send the user a short summary of what is new and what changes in their game.
- Every `vX.Y.Z` tag becomes a GitHub release with short English notes (new, and what changes in the game) and the Prism zip pinned to that version (`tools/prism/Build-PrismInstance.ps1 -Channel vX.Y.Z`). The `releases-channel` release note is updated too.
- The Prism instance (`tools/prism/Build-PrismInstance.ps1`, release `releases-channel`, `Gregtech-Grindless-releases.zip`) updates itself through packwiz-installer-bootstrap; rebuild it only if the channel URL or the bootstrap changes. The old `playable-channel` release stays, marked as moved.
- Release notes must say when a multiblock's shape changed (the player has to rebuild it).
