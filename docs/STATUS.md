# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.15.0 "UXV" (`docs/releases/v0.15.0.md`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** v0.15.0 released (UXV: the galactic arm; `docs/eras/uxv.md`). Next: OpV (v0.16.0, `docs/eras/opv.md`: 18 multiblocks, 45 lines): OpV-S0 is in main (`docs/research/opv-s0.md`); OpV-F1, F2, F3, W and D1 and the MAX design proposal are merged on the OpV integration branch `opv-integ`, not yet in main. Then MAX (owner, 2026-10-29).
- **Last accepted integration batch:** UXV (v0.15.0): every UXV and tier-parity package through C2 and FX, then C3: obtain pass on dump 20261031-040932-server-37b (560 groups) and gate and era passes steam-UXV PASS on it, C3 T2 20261030-231635-server (70 PASS), v0.14.0 world mark 20261031-014222-server and reopen 20261031-015742-server, forming sweep 259/259 (20261031-015742-server), client EMI audit 20261031-041327-client-0f0 (15 PASS with the Vela sky leg, 9 known preview gaps left). UIV (v0.14.0) before it.
- **Approved packages in flight:** OpV (v0.16.0) on `opv-integ`, see the milestone. Carried risks: the UEV parallel hatch in a GCyM large machine untested; `uev_parallel_hatch` and `stellar_forge` not modelled in `tiers/uev.json`; no relay platform was placed in the UIV or UXV save runs; of B1's client flight legs only the Vela sky leg has run. EMI previews: GTM shows each part slot's first candidate, and `PartAbility` keeps them in hash sets, so any startup change can reorder them; a hidden part shown first makes EMI drop the preview (v0.15.0: `extendedfeatures:configurable_cleaning_maintenance_hatch`, now index-only with keepRecipes). Every EMI audit watches the previews check for it. The bench runs on the Linux VM (backend azure, 3 run slots, `docs/testing/`); T0 also runs in GitHub Actions. At most 2 concurrent implementation workers; bench runs share the VM's 3 slots.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- EMI shows recipes and uses (client audit 20261031-041327-client-0f0: 15/15). Known runtime gaps, a NOTE in the audit: 9 multiblocks without a preview display, 9 gaps left in `tools/analysis/emi_runtime_known.json` (the list only shrinks). The EMI audit needs an 8 GB client alone on the VM (4 GB stalls in EMI's reload; players have 10 GB).
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
