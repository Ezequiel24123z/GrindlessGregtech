# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.8.0 "LuV, the outer system" (`15a7f85`). `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack` (= `15a7f85`). `main` is stale (`4719e7e`); never base work on it.
- **Current milestone:** LuV done. AI-efficiency migration (Phase 0-1) on `ezequiel24123z-ai-efficiency-migration`, awaiting review. ZPM design not started.
- **Last accepted integration batch:** LuV A1-A5, B1-B10, C1-C3 (v0.8.0).
- **Next approved package:** none. Proposed: the efficiency pilot (one measured package), after the migration is accepted.

## Open blockers and known issues
- GCYR's configured low gravity is not applied in game (menu only); the design no longer claims it.
- A same-save reopen in the headless test client deadlocks on our fixture's synchronous Rhino callback (not a persistence defect).
- The 4 GB test client is tight with EMI plus world generation; leave spark out of copied clients in EMI stages.
- `jugable` mirrors `playable` until the user switches the Prism pre-launch URL.

## Where details live (read one section, not the file)
- Era design: `docs/eras/<era>.md`. Complexity targets: `docs/research/complexity.md`.
- Decisions: `DECISIONS.md` (`git grep -n "<topic>" DECISIONS.md`). Credits: `CREDITS.md`.
- Quests: `docs/quests.md`. Validator: `tools/analysis/README.md`. Bench: `tools/test/README.md`. Textures: `tools/assets/README.md`.
- History (not read by default): `docs/sessions/`, `docs/migration/`.
