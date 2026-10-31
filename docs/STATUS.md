# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.16.0 "OpV" (`docs/releases/v0.16.0.md`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** v0.16.0 released (OpV: the galactic bulge; `docs/eras/opv.md`: 18 multiblocks, 45 lines). Next: MAX (owner, 2026-10-29).
- **Last accepted integration batch:** OpV (v0.16.0): every OpV package through C2, then C3: T2 20261031-112935-server-2ba (305 PASS, forming sweep 278 ids), v0.15.0 world mark 20261031-112123-server-589 and reopen PASS, obtain pass (499 groups) and gate, auto and era passes steam-OpV PASS on the dump without the bench overlay's probe recipes, client EMI audit 20261031-121422-client-dbc PASS (10 preview gaps and the `rejected_timing_head` route, all known). UXV (v0.15.0) before it.
- **Approved packages in flight:** MAX. Carried risks: the UEV parallel hatch in a GCyM large machine untested; `uev_parallel_hatch` and `stellar_forge` not modelled in `tiers/uev.json`; no relay platform was placed in the UIV, UXV or OpV save runs; no client sky leg for SGR 1806-20 or Terzan 5; the `extendedfeatures` addon tests (Expanded Assembly Line, Matrix Data Relay) fail on a dedicated server (`Screen` class load, also on v0.15.0). EMI previews: GTM shows each part slot's first candidate, and `PartAbility` keeps them in hash sets, so any startup change can reorder them; a hidden part shown first makes EMI drop the preview (v0.15.0: `extendedfeatures:configurable_cleaning_maintenance_hatch`, now index-only with keepRecipes). Every EMI audit watches the previews check for it. The bench runs on the Linux VM (backend azure, 3 run slots, `docs/testing/`); T0 also runs in GitHub Actions. At most 2 concurrent implementation workers; bench runs share the VM's 3 slots.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- EMI shows recipes and uses (client audit 20261031-121422-client-dbc PASS). Known runtime gaps, a NOTE in the audit: 10 multiblocks without a preview display and the `rejected_timing_head` route, 11 gaps in `tools/analysis/emi_runtime_known.json` (the list only shrinks). The EMI audit needs an 8 GB client alone on the VM (4 GB stalls in EMI's reload; players have 10 GB).
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
