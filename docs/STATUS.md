# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`; tag `v0.17.0` is `main`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition.
- **Integration branch:** `ezequiel24123z-project-reforge`. Every package branches from it and is merged back with `--no-ff` by the integrator; `main` stays at v0.17.0 until v1.0.0.
- **Current milestone:** Project Reforge (DECISIONS.md:695), v0.17.0 to v1.0.0 in ten phases: 0 rules and diagnosis, 1 cost tooling, 2 cost rebalance, 3 era and line audit, 4 research, 5 quests, 6 assets and sounds, 7 MAX+ and the Hyperstargate, 8 cleanup, 9 release. No save compatibility (DECISIONS.md:701): v1.0.0 needs a new world.
- **Done:** Phase 0 (rules in `AGENTS.md`; diagnosis `docs/reforge/00_diagnosis.md`), Phase 1 (the `capacity` T0 check; cost matrix and the accepted curve, `docs/reforge/01_cost_matrix.md`, DECISIONS.md:708), Phase 4 research (`docs/research/gtnh-stargate.md`, `docs/research/quest-books.md`).
- **Last accepted integration batch:** Reforge batch 1 (RF-4A, RF-4B, RF-0D, RF-1A, RF-1B with repair 1; issues #34-#38): T0 PASS at 1cb3e48b (183 s); RF-1A capacity dump 20261031-230854-server-b51; baseline MAX reachability 20261031-224215-server-5aa PASS.
- **Batch 2 in flight** (one nested session per package; no two packages share a file):

| Package | Issue | Content | Phase |
|---|---|---|---|
| RF-2A | #39 | Cost-curve mechanism: per-era factor tables, landing disabled | 2 |
| RF-3A | #40 | Remove the retired save-compat items; obtain pass back to PASS | 3 |
| RF-3B | #41 | Formed-multiblock screenshots, broken EMI previews, the Expanded Assembly Line in game | 3 |
| RF-3C | #42 | Line audit (keep, fix, merge, remove), read-only | 3 |
| RF-6A | #43 | Texture and sound audit, read-only | 6 |
| RF-7A | #44 | MAX shortfall, the ending moved to MAX+, MAX+ and Hyperstargate design (Opus, docs only) | 3, 7 |

- **Next:** batch 3: Phase 2 band packages (switch on RF-2A's factors band by band, fixing capacity overflows and dropped inputs) and the Phase 3 fixes RF-3B and RF-3C find. Then quests (Phase 5, after Phase 2), assets (Phase 6, from RF-6A) and MAX+ (Phase 7, from RF-7A's package list).
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- The obtain pass FAILS: `integration/hidden.js` still says `IMPLEMENTED_ERA = 'uxv'`, so 56 OpV and MAX groups are unclassified (RF-3A).
- Capacity: 87 known violations in `tools/analysis/capacity_known.json` (82 are assembler rows with two fluids); T0 ratchets them and Phase 2 empties the list. 67 recipes also lose inputs or outputs past their recipe type's slots (`docs/reforge/00_diagnosis.md`).
- The cost matrix cannot price MAX (a tungsten and field_can loop; `gtnn:*` circuits without a recipe). MAX is 10 multiblocks, 46 lines and 167 crossings against a guide of about 24, 68 and 212; the owner rejected "accept, no padding" (RF-7A).
- EMI: 12 entries in `tools/analysis/emi_runtime_known.json` (multiblocks without a preview display, the `rejected_timing_head` route; the list only shrinks). The EMI audit needs an 8 GB client alone on the VM (4 GB stalls in EMI's reload; players have 10 GB).
- The Expanded Assembly Line's formation and research path are unproven in game, and formed multiblocks are not yet screenshot-reviewed (RF-3B).
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages.
- `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- Reforge: `docs/reforge/` (00 diagnosis, 01 cost matrix; batch 2 adds 02 cost curve, 03 line audit and 06 assets audit). Package contracts are the GitHub issues labelled `work-package`.
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`; Reforge from :695). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
