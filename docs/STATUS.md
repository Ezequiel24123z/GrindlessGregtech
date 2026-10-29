# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.14.0 "UIV" (`docs/releases/v0.14.0.md`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** v0.14.0 released (UIV: dead stars; `docs/eras/uiv.md`). Next: UXV (v0.15.0, `docs/eras/uxv.md`) in progress: F1, F2, W, M1 and A1-A4 merged, A5 ∥ A6 next. After UXV: OpV, then MAX (owner, 2026-10-29).
- **Last accepted integration batch:** UIV (v0.14.0): obtain pass 20261029-153444-obtain (424 groups), C3 T2 20261029-171832-server (67 PASS), v0.13.0 world reopen 20261029-194533-server, forming sweep 237/237 (20261029-195830-server), client EMI audit 20261029-200346-client (13 PASS, 9 known preview gaps left), QR-T1 pins refreshed. Quality Review (v0.13.0) before it.
- **Approved packages in flight:** the UXV build (v0.15.0): F1, F2, W, M1 (UXV parallel hatch) and A1-A4 merged (hidden_until 533 groups, obtain 20261030-003300-obtain PASS; `pendingUses` and `pendingRoutes` for later packages in `emi_coverage.json`; the recipe-quality depth cuts a loop at another mod's stack first); the Wave A pairs running (A5 ∥ A6 next), then Wave B. Carried UEV/UIV risks: B1 client flight legs never run; the UEV parallel hatch in a GCyM large machine untested; `uev_parallel_hatch` and `stellar_forge` not modelled in `tiers/uev.json`; no relay platform was placed in the UIV save run. The bench runs on the Linux VM (backend azure, 3 run slots, `docs/testing/`); T0 also runs in GitHub Actions. At most 2 concurrent implementation workers; bench runs share the VM's 3 slots.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- EMI shows recipes and uses (client audit 20261029-200346-client: 13/13). Known runtime gaps, a NOTE in the audit: 9 multiblocks without a preview display, 9 gaps left in `tools/analysis/emi_runtime_known.json` (the list only shrinks). The EMI audit needs an 8 GB client alone on the VM (4 GB stalls in EMI's reload; players have 10 GB).
- The Expanded Assembly Line's formation and research path are unproven in game (QR-G0).
- Wave 1 and 2 reshaped many multiblocks (release notes in the merge commits and `docs/quality/structures.md`); players rebuild them. Every shape forms from its own preview on the bench; formed looks are not yet screenshot-reviewed.
- A Horizon Collector placed before QR-F0 may keep one output slot and stall on multi-stack rows: break and re-place it (release note).
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages, and run the EMI audit at 8 GB.
- `playable` mirrors `releases` until old instances switch their Prism pre-launch URL to `/releases/`; then retire it.

## Where details live (read one section, not the file)
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
