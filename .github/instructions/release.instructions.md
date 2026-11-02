---
applyTo: "pack/pack.toml,pack/index.toml,pack/mods/**,pack/.gitattributes,tools/Update-PackIndex.ps1,tools/Get-Packwiz.ps1,tools/prism/**,docs/STATUS.md"
---
# Release, packwiz and the releases channel (integrator only)

## packwiz
- packwiz has no releases; `tools/Get-Packwiz.ps1` downloads one pinned build (a recorded GitHub Actions run) and verifies its SHA-256 (AF-H, #198 M9-28). Moving the pin is its own integration change.
- Adding a pinned mod: `packwiz mr add <version URL>`, then check the `side` in its `.pw.toml`. A mod addition is its own package.
- CurseForge: only mods that allow distribution, or that have an official download URL.
- `pack/index.toml` and the index hash in `pack/pack.toml` are generated: `tools/Update-PackIndex.ps1` (normalizes text, then `packwiz refresh`). Never edited by hand. Run once per integration batch, after the last merge, by the integrator.

## Generated files and the batch
- Integrator-owned, regenerated once per batch: `pack/index.toml`, `pack/pack.toml`, `pack/kubejs/data/grindless/tables/hidden_until.json` (`tools/analysis/Invoke-Reachability.ps1`, obtain pass; edit `tools/analysis/tiers/obtain.json`), generated quest chapters (`quests.instructions.md`).
- Exception: `tools/test/overlay/kubejs/config/gg_test_emi_coverage_expect.json` (`node tools/analysis/emi-coverage.mjs --expect`). A package may regenerate it, because T0 fails while it is stale. On a merge conflict, the integrator takes either side and regenerates it.
- Shared, hand-edited: `tools/analysis/tiers/*.json`, `tools/analysis/emi_coverage.json`, `pack/kubejs/assets/grindless/lang/*.json`, `client_scripts/grindless/emi_info_lang.js`. A package edits them only when its contract lists them.
- A batch: merge packages in dependency order, regenerate, run T2, then update `docs/STATUS.md` (last accepted batch, next package). DECISIONS and CREDITS lines proposed in handoffs are appended here.
- The batch dump runs `gg_test_recipe_lookup` in the same server as `gg_dump`, so it carries `lookup_unreachable.json`; without it a strict summary calls the proof incomplete. Batch and release native runs are strict (`GG_STRICT=1`: zero checks, a missing stage or an unexpected error fail). AF-H, #198 M9-02 and M9-03.
- Before regenerating quests or tagging, run the gate and eras passes for every implemented tier on the batch dump (`node tools/analysis/reachability.mjs --tier <t> --dump <d>`, steam up to the implemented era). The obtain pass and `recipe-cycles.mjs` do not see per-era inversions or research deadlocks; a gate FAIL blocks the release.

## Versions
- Before tagging `vX.Y.Z`, bump `version` in `pack/pack.toml` and run `tools/Update-PackIndex.ps1`. Only what has passed the tier's tests gets tagged.

## Releases channel
- Players install the `releases` channel. It only advances to a tested `vX.Y.Z` tag, and only after `tools/release/Test-Promotion.ps1` passes for it (the exact SHA, the pack version, the T0 run of that SHA and the Prism asset; AF-H, #198 M9-30): `git push origin vX.Y.Z^{commit}:refs/heads/releases`. During the transition, move `playable` to the same commit too (`...:refs/heads/playable`); retire it once old instances have moved. `jugable` is deleted.
- When moving it, send the user a short summary of what is new and what changes in their game.
- Every `vX.Y.Z` tag becomes a GitHub release with short English notes (new, and what changes in the game) and the Prism zip pinned to that version (`tools/prism/Build-PrismInstance.ps1 -Channel vX.Y.Z`). The `releases-channel` release note is updated too.
- The Prism instance (`tools/prism/Build-PrismInstance.ps1`, release `releases-channel`, `Gregtech-Grindless-releases.zip`) updates itself through packwiz-installer-bootstrap; rebuild it only if the channel URL or the bootstrap changes. The old `playable-channel` release stays, marked as moved.

## Release checklist (in order)
1. Every package of the batch is merged and regenerated (`script-order.mjs --write`, `emi-coverage.mjs --expect`). The batch dump and the post-dump outputs are committed. T2 (strict) and T3 (client EMI audit and quest book) pass on the candidate.
2. Bump `version` in `pack/pack.toml`, run `tools/Update-PackIndex.ps1`, write `docs/releases/vX.Y.Z.md` (short: what is new, what changes in the game, an `Upgrading:` line, the `Full changelog` compare link) and update the README's version strings. Commit, push, and wait for that commit's T0.
3. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z: <summary>" <sha>`, then `git push origin vX.Y.Z`. Pushing the tag starts its own T0 run on the same SHA; wait for it, because Test-Promotion reads the newest run for the SHA.
4. `powershell -NoProfile -File tools\release\Test-Promotion.ps1 -Sha <40-hex> -Version X.Y.Z -SkipRelease`: every check except the Prism asset.
5. `tools\prism\Build-PrismInstance.ps1 -Channel vX.Y.Z -OutDir <dir>`, then `gh release create vX.Y.Z --verify-tag --latest --title "vX.Y.Z: <summary>" --notes-file docs/releases/vX.Y.Z.md <zip>`.
6. Test-Promotion again without `-SkipRelease`: it now checks the Prism asset too, and must pass.
7. Move the channels to the tag's commit: `git push origin vX.Y.Z^{commit}:refs/heads/releases`, the same for `playable`, and `main` (or `main` ahead by docs-only commits).
8. Edit the `releases-channel` release note to say `Current version: vX.Y.Z`. Update `docs/STATUS.md` and `DECISIONS.md`, and send the owner the short summary.
