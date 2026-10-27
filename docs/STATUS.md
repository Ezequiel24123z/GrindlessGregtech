# Status

Integrator-owned. Read this instead of `DECISIONS.md` and the session notes. Overwrite it at each accepted batch; do not append history.

- **Playable version:** v0.10.0 "UV: Neptune, Pluto and the edge". `playable` and `jugable` both point to it.
- **Active development branch:** `ezequiel24123z-gregtech-grindless-modpack`. `main` matches it (PR #4 merged); feature work still branches from the development branch.
- **Current milestone:** UHV build. Design accepted: `docs/eras/uhv.md` (queue in its *Build order*: S0 spikes, F1, F2, waves A and B, C1-C3), decisions in `DECISIONS.md` (2026-10-27, "UHV").
- **Last accepted integration batch:** UV era (v0.10.0): 31 machines, 22 lines, 24 crossings; `-Tier uv` PASS (20261027-142608-uv); UV-C3 T2 bench PASS (20261027-144119-server) and v0.9.0 save reopen PASS.
- **Approved packages in flight:** UHV wave A (S0, F1, F2, A1, A10, A7, A2 and A3 done: F1 ids held until uhv, one obtain rule per package; A9 and A4 running). Order: A9+A4, A5, A6+A8; then B1; B2+B4, B3+B5, B6, B7; C1-C3; v0.11.0.
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
