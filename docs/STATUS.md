# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.8.0 "LuV, the outer system" (`15a7f85`). `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** ZPM build. Design accepted: `docs/eras/zpm.md` (queue in its *Build order*), decisions in `DECISIONS.md` (2026-10-26, "ZPM").
- **Last accepted integration batch:** ZPM-A2 naquadria (#8): naquadria refinery and naquadah fuel works (tables/naquadria.json), naquadah plant mode 4, large naquadah reactor with duranium frames (same id, research kept; T1 `gg_test_zpm_naquadria` PASS); ZPM-A3 europium (#9): europium reductor, cascade circuit 5 as a ZPM mode, GTCA froth without europium. Earlier: S0 (#6), F1 (#7), F2.
- **Approved packages in flight:** B1 travel and stations (#16, 21504) and A4 actinides (#10, 19968). Then A5-A9, wave B pairs (B2 with B3, B4 with B5), C1-C3, v0.9.0.
- **Repository:** unmerged historical branches are kept only as `archive/*` tags; finished package branches are deleted after integration.

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
