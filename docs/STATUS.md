# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.17.0 "MAX" (`docs/releases/v0.17.0.md`). The player channel is `releases` (release `releases-channel`, `Gregtech-Grindless-releases.zip`); `playable` is mirrored to it during the transition; `jugable` is deleted.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** v0.17.0 released (MAX: the Galactic Centre; `docs/eras/max.md`: 10 multiblocks, 46 lines). The project is PAUSED after v0.17.0 by the owner for a full audit in a separate session. MAX+ is NOT started: no MAX+ packages, issues or design.
- **Last accepted integration batch:** MAX (v0.17.0): every MAX package through C2, then C3: T2 20261031-185529-server-c4c and 20261031-190150-server-4d9 (forming sweep 288 ids), v0.16.0 world mark 20261031-190901-server-5aa and reopen 20261031-191307-server-de8 PASS, client EMI audit 20261031-201313-client-cce PASS, credits leg 20261031-204900-client-072 PASS.
- **Approved packages in flight:** none. Carried risks: see `docs/releases/v0.17.0.md` (known risks) and the owner audit.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

## Open blockers and known issues
- EMI shows recipes and uses (client audit 20261031-201313-client-cce PASS). Known runtime gaps, a NOTE in the audit: 10 multiblocks without a preview display and the `rejected_timing_head` route, 11 gaps in `tools/analysis/emi_runtime_known.json` (the list only shrinks). The EMI audit needs an 8 GB client alone on the VM (4 GB stalls in EMI's reload; players have 10 GB).
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
